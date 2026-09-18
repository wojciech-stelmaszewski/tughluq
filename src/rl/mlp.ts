import { EMPTY_PLAY, type TablePlay } from '../game/match';
import { createRng } from '../game/rng';
import { FEATURE_DIM, FEATURE_SCALE, normalizedFeatures, type PlayerView } from './features';
import type { Policy } from './policy';
import { softmaxSample } from './scorer';

export const DEFAULT_HIDDEN = 8;

export type MlpWeights = {
  kind: 'mlp-v1';
  hidden: number;
  weights: number[];
  seed?: number;
  generation?: number;
  fitnessVsRandom?: number;
};

/** input→hidden matrix, hidden biases, hidden→score vector, score bias. */
export function mlpDim(hidden: number): number {
  return FEATURE_DIM * hidden + hidden + hidden + 1;
}

/**
 * Small seeded draw, not zeros. At zero every hidden activation is tanh(0) = 0, so the
 * output layer has nothing to act on and a single perturbation cannot show any signal.
 */
export function initMlp(hidden: number, seed: number): number[] {
  const random = createRng(seed >>> 0 || 1);
  const spread = 1 / Math.sqrt(FEATURE_DIM);
  return Array.from({ length: mlpDim(hidden) }, () => (random() * 2 - 1) * spread);
}

/**
 * Build a network that reproduces a trained linear scorer, so the search starts at the linear
 * plateau instead of below random play.
 *
 * `tanh(z) ≈ z` near zero, so with every hidden row set to `eps · w` and every output weight to
 * `1 / (hidden · eps)` the network computes `tanh(eps · w·x) / eps`, which is the linear score
 * as long as the pre-activation stays small. `preact` is that budget: lower is a more faithful
 * copy, higher keeps the output weights small enough for the search to still move them.
 *
 * The linear weights were fitted against raw features, so they are rescaled here for the
 * normalized ones the MLP reads.
 */
export function warmStartMlp(
  linear: number[],
  hidden: number,
  preact: number,
  seed: number,
): number[] {
  const scaled = linear.map((value, index) => value * (FEATURE_SCALE[index] ?? 1));
  // Features sit in [-1, 1], so half the absolute weight mass is a fair guess at a typical score.
  const typical = scaled.reduce((sum, value) => sum + Math.abs(value), 0) * 0.5;
  const eps = typical > 0 ? preact / typical : 1;
  const out = 1 / (hidden * eps);

  const random = createRng(seed >>> 0 || 1);
  const params: number[] = [];
  for (let unit = 0; unit < hidden; unit += 1) {
    for (const value of scaled) {
      // 1% jitter so the units are not exact clones from the first step.
      params.push(eps * value * (1 + (random() * 2 - 1) * 0.01));
    }
  }
  for (let unit = 0; unit < hidden; unit += 1) {
    params.push(0);
  }
  for (let unit = 0; unit < hidden; unit += 1) {
    params.push(out);
  }
  params.push(0);
  return assertMlp(params, hidden);
}

/**
 * Per-coordinate step multipliers for the search.
 *
 * A warm-started network holds input weights near 0.03 next to output weights near 44, because
 * faithfully copying a linear scorer needs small pre-activations and a large output gain. One
 * shared sigma would wreck the first layer while barely touching the second, so each layer is
 * perturbed relative to its own magnitude. Biases move on the scale of the layer they shift.
 */
export function mlpSigmaScale(params: number[], hidden: number): number[] {
  const inputEnd = FEATURE_DIM * hidden;
  const biasEnd = inputEnd + hidden;
  const outputEnd = biasEnd + hidden;
  const meanAbs = (from: number, to: number): number => {
    let sum = 0;
    for (let i = from; i < to; i += 1) {
      sum += Math.abs(params[i] ?? 0);
    }
    return Math.max(sum / Math.max(1, to - from), 1e-3);
  };

  const inputScale = meanAbs(0, inputEnd);
  const outputScale = meanAbs(biasEnd, outputEnd);
  return params.map((_, index) => {
    if (index < biasEnd) {
      return inputScale;
    }
    return outputScale;
  });
}

export function assertMlp(params: number[], hidden: number): number[] {
  const expected = mlpDim(hidden);
  if (params.length !== expected) {
    throw new Error(`Expected ${expected} MLP params for hidden ${hidden}, got ${params.length}`);
  }
  return params;
}

export function mlpScore(
  params: number[],
  hidden: number,
  view: PlayerView,
  play: TablePlay,
): number {
  const features = normalizedFeatures(view, play);
  let cursor = 0;
  let total = params[FEATURE_DIM * hidden + hidden + hidden] ?? 0;
  for (let unit = 0; unit < hidden; unit += 1) {
    let sum = params[FEATURE_DIM * hidden + unit] ?? 0;
    for (let i = 0; i < FEATURE_DIM; i += 1) {
      sum += (params[cursor + i] ?? 0) * (features[i] ?? 0);
    }
    cursor += FEATURE_DIM;
    total += (params[FEATURE_DIM * hidden + hidden + unit] ?? 0) * Math.tanh(sum);
  }
  return total;
}

export function mlpPolicy(params: number[], hidden: number): Policy {
  const p = assertMlp(params, hidden);
  return ({ view, actions, random }) => {
    if (actions.length === 0) {
      return EMPTY_PLAY;
    }
    const scores = actions.map((play) => mlpScore(p, hidden, view, play));
    return actions[softmaxSample(scores, random)] ?? EMPTY_PLAY;
  };
}

export function parseMlp(raw: unknown): { params: number[]; hidden: number } {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Weights file is not an object');
  }
  const record = raw as MlpWeights;
  if (record.kind !== 'mlp-v1' || !Array.isArray(record.weights)) {
    throw new Error('Weights file must be { kind: "mlp-v1", hidden: number, weights: number[] }');
  }
  if (typeof record.hidden !== 'number' || record.hidden < 1) {
    throw new Error('MLP weights need a positive "hidden"');
  }
  if (!record.weights.every((value) => typeof value === 'number' && Number.isFinite(value))) {
    throw new Error('Weights must be finite numbers');
  }
  return { params: assertMlp(record.weights, record.hidden), hidden: record.hidden };
}
