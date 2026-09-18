import { EMPTY_PLAY, type TablePlay } from '../game/match';
import { createRng } from '../game/rng';
import { FEATURE_DIM, normalizedFeatures, type PlayerView } from './features';
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
