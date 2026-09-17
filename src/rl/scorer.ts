import { EMPTY_PLAY, type TablePlay } from '../game/match';
import { concatFeatures, FEATURE_DIM, type PlayerView } from './features';
import type { Policy } from './policy';

export type LinearWeights = {
  kind: 'linear-v1';
  weights: number[];
  seed?: number;
  generation?: number;
  fitnessVsRandom?: number;
};

export function zeroWeights(): number[] {
  return Array.from({ length: FEATURE_DIM }, () => 0);
}

export function assertWeights(weights: number[]): number[] {
  if (weights.length !== FEATURE_DIM) {
    throw new Error(`Expected ${FEATURE_DIM} weights, got ${weights.length}`);
  }
  return weights;
}

export function parseWeights(raw: unknown): number[] {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Weights file is not an object');
  }
  const record = raw as LinearWeights;
  if (record.kind !== 'linear-v1' || !Array.isArray(record.weights)) {
    throw new Error('Weights file must be { kind: "linear-v1", weights: number[] }');
  }
  if (!record.weights.every((value) => typeof value === 'number' && Number.isFinite(value))) {
    throw new Error('Weights must be finite numbers');
  }
  return assertWeights(record.weights);
}

export function score(weights: number[], view: PlayerView, play: TablePlay): number {
  const features = concatFeatures(view, play);
  const w = assertWeights(weights);
  let total = 0;
  for (let i = 0; i < FEATURE_DIM; i += 1) {
    total += (w[i] ?? 0) * (features[i] ?? 0);
  }
  return total;
}

export function softmaxSample(scores: number[], random: () => number): number {
  if (scores.length === 0) {
    return 0;
  }
  let max = scores[0] ?? 0;
  for (const value of scores) {
    if (value > max) {
      max = value;
    }
  }
  const exps = scores.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  let ticket = random() * sum;
  for (let i = 0; i < exps.length; i += 1) {
    ticket -= exps[i] ?? 0;
    if (ticket <= 0) {
      return i;
    }
  }
  return scores.length - 1;
}

export function scoredPolicy(weights: number[]): Policy {
  const w = assertWeights(weights);
  return ({ view, actions, random }) => {
    if (actions.length === 0) {
      return EMPTY_PLAY;
    }
    const scores = actions.map((play) => score(w, view, play));
    const index = softmaxSample(scores, random);
    return actions[index] ?? EMPTY_PLAY;
  };
}
