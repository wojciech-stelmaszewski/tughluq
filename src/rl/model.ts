import { FEATURE_DIM } from './features';
import {
  DEFAULT_HIDDEN,
  mlpDim,
  initMlp,
  mlpPolicy,
  mlpSigmaScale,
  parseMlp,
  warmStartMlp,
  type MlpWeights,
} from './mlp';
import type { Policy } from './policy';
import { parseWeights, scoredPolicy, zeroWeights, type LinearWeights } from './scorer';

export type ModelKind = 'linear' | 'mlp';

/** What the trainer needs to know about a parameter vector, and nothing else. */
export type Model = {
  kind: ModelKind;
  label: string;
  dim: number;
  init: (seed: number) => number[];
  policy: (params: number[]) => Policy;
  /** Per-coordinate step multipliers. Omitted means one shared sigma for every parameter. */
  sigmaScale?: (params: number[]) => number[];
  file: (params: number[], meta: FileMeta) => LinearWeights | MlpWeights;
};

export type FileMeta = {
  seed: number;
  generation: number;
  fitnessVsRandom?: number;
};

export const LINEAR_MODEL: Model = {
  kind: 'linear',
  label: `linear (${FEATURE_DIM} weights)`,
  dim: FEATURE_DIM,
  init: () => zeroWeights(),
  policy: (params) => scoredPolicy(params),
  file: (params, meta) => ({ kind: 'linear-v1', weights: params, ...meta }),
};

export function mlpModel(hidden: number = DEFAULT_HIDDEN, warmStart?: number[]): Model {
  return {
    kind: 'mlp',
    label: `mlp 30-${hidden}-1 (${mlpDim(hidden)} params)${warmStart ? ', warm start' : ''}`,
    dim: mlpDim(hidden),
    init: (seed) => warmStart ?? initMlp(hidden, seed),
    policy: (params) => mlpPolicy(params, hidden),
    sigmaScale: (params) => mlpSigmaScale(params, hidden),
    file: (params, meta) => ({ kind: 'mlp-v1', hidden, weights: params, ...meta }),
  };
}

export function modelByName(kind: string, hidden: number, warmStart?: number[]): Model {
  if (kind === 'linear') {
    return LINEAR_MODEL;
  }
  if (kind === 'mlp') {
    return mlpModel(hidden, warmStart);
  }
  throw new Error(`Unknown model "${kind}". Use linear or mlp.`);
}

/** Reads a linear weight file and turns it into MLP parameters of the same behaviour. */
export function warmStartFromFile(
  raw: unknown,
  hidden: number,
  preact: number,
  seed: number,
): number[] {
  return warmStartMlp(parseWeights(raw), hidden, preact, seed);
}

/** Reads either weight format, so older files keep working. */
export function loadModelFile(raw: unknown): { policy: Policy; label: string } {
  const kind = (raw as { kind?: unknown })?.kind;
  if (kind === 'linear-v1') {
    return { policy: scoredPolicy(parseWeights(raw)), label: 'linear' };
  }
  if (kind === 'mlp-v1') {
    const { params, hidden } = parseMlp(raw);
    return { policy: mlpPolicy(params, hidden), label: `mlp-${hidden}` };
  }
  throw new Error(`Unknown weights kind "${String(kind)}". Expected linear-v1 or mlp-v1.`);
}
