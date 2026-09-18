import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getLegalActions } from '../src/game/match';
import { createRng } from '../src/game/rng';
import { encodeView, FEATURE_DIM, normalizedFeatures } from '../src/rl/features';
import {
  initMlp,
  mlpDim,
  mlpPolicy,
  mlpScore,
  mlpSigmaScale,
  parseMlp,
  warmStartMlp,
} from '../src/rl/mlp';
import { loadModelFile, mlpModel, modelByName } from '../src/rl/model';
import { runEpisode } from '../src/rl/runEpisode';
import { score } from '../src/rl/scorer';
import { trainEs } from '../src/rl/train';
import { regular, special, testMatch, testPlayer } from './helpers';

const me = testPlayer('me', [
  regular('2h', 'hearts', '2'),
  regular('9h', 'hearts', '9'),
  special('zombie', 'z1'),
  special('shotgun', 's1'),
]);
const foe = testPlayer('foe', [regular('3c', 'clubs', '3')]);
const match = testMatch([me, foe]);
const view = encodeView(me, foe, match);
const actions = getLegalActions(me);

describe('normalized features', () => {
  it('keeps every input inside [-1, 1] so tanh units do not saturate', () => {
    for (const play of actions) {
      for (const value of normalizedFeatures(view, play)) {
        expect(Math.abs(value)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('emits FEATURE_DIM values', () => {
    const play = actions[0];
    expect(play).toBeTruthy();
    if (play) {
      expect(normalizedFeatures(view, play)).toHaveLength(FEATURE_DIM);
    }
  });
});

describe('mlp scorer', () => {
  it('sizes the parameter vector as input*hidden + biases + output', () => {
    expect(mlpDim(8)).toBe(FEATURE_DIM * 8 + 8 + 8 + 1);
    expect(initMlp(8, 5)).toHaveLength(mlpDim(8));
  });

  it('does not initialise to zero, which would be a dead point for the search', () => {
    const params = initMlp(8, 5);
    expect(params.some((value) => value !== 0)).toBe(true);
  });

  it('scores zero parameters flat, so the start is uniform over legal plays', () => {
    const params = Array.from({ length: mlpDim(4) }, () => 0);
    for (const play of actions) {
      expect(mlpScore(params, 4, view, play)).toBe(0);
    }
  });

  it('replays the same params and seed into an identical match', () => {
    const policy = mlpPolicy(initMlp(8, 11), 8);
    expect(runEpisode(44, policy).match).toEqual(runEpisode(44, policy).match);
  });

  it('rejects a parameter vector of the wrong length', () => {
    expect(() => mlpPolicy([1, 2, 3], 8)).toThrow(/Expected/);
  });
});

describe('warm start from linear weights', () => {
  const linear: number[] = JSON.parse(readFileSync('docs/weights-latest.json', 'utf8')).weights;
  const hidden = 8;
  const params = warmStartMlp(linear, hidden, 0.5, 4);

  it('ranks every pair of legal plays the same way the linear scorer does', () => {
    expect(actions.length).toBeGreaterThan(1);
    for (let i = 0; i < actions.length; i += 1) {
      for (let j = i + 1; j < actions.length; j += 1) {
        const left = actions[i];
        const right = actions[j];
        if (!left || !right) {
          continue;
        }
        const linearGap = score(linear, view, left) - score(linear, view, right);
        const mlpGap = mlpScore(params, hidden, view, left) - mlpScore(params, hidden, view, right);
        expect(Math.sign(Math.round(mlpGap * 1e6))).toBe(Math.sign(Math.round(linearGap * 1e6)));
      }
    }
  });

  it('reproduces the linear score closely, not just its order', () => {
    for (const play of actions) {
      const linearScore = score(linear, view, play);
      const mlpValue = mlpScore(params, hidden, view, play);
      expect(Math.abs(mlpValue - linearScore)).toBeLessThan(0.1 * (1 + Math.abs(linearScore)));
    }
  });

  it('steps each layer relative to its own magnitude', () => {
    const scale = mlpSigmaScale(params, hidden);
    const inputScale = scale[0] ?? 0;
    const outputScale = scale[scale.length - 1] ?? 0;
    expect(inputScale).toBeGreaterThan(0);
    // The warm start needs tiny input weights and a large output gain; one shared step cannot
    // serve both.
    expect(outputScale).toBeGreaterThan(inputScale * 100);
  });
});

describe('weight files', () => {
  it('round-trips an mlp file', () => {
    const model = mlpModel(8);
    const params = initMlp(8, 7);
    const file = model.file(params, { seed: 7, generation: 3 });
    expect(parseMlp(file)).toEqual({ params, hidden: 8 });
    expect(loadModelFile(file).label).toBe('mlp-8');
  });

  it('still reads the committed linear weights and scores them unchanged', () => {
    const raw = JSON.parse(readFileSync('docs/weights-latest.json', 'utf8'));
    const loaded = loadModelFile(raw);
    expect(loaded.label).toBe('linear');

    const play = actions[0];
    expect(play).toBeTruthy();
    if (play) {
      expect(score(raw.weights, view, play)).toBeTypeOf('number');
    }
    const policy = loaded.policy;
    const random = createRng(2);
    expect(policy({ view, actions, random })).toBeTruthy();
  });

  it('rejects an unknown kind', () => {
    expect(() => loadModelFile({ kind: 'quantum-v9', weights: [] })).toThrow(/Unknown weights kind/);
    expect(() => modelByName('quantum', 8)).toThrow(/Unknown model/);
  });
});

describe('trainEs with an mlp', () => {
  it('returns a parameter vector of the model dimension', () => {
    const model = mlpModel(4);
    const result = trainEs({ generations: 1, population: 2, episodes: 1, seed: 2, model });
    expect(result.weights).toHaveLength(model.dim);
    expect(result.log).toHaveLength(1);
  });
});
