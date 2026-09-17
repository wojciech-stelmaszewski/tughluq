import { describe, expect, it } from 'vitest';
import { getLegalActions } from '../src/game/match';
import { createRng } from '../src/game/rng';
import {
  concatFeatures,
  encodeAction,
  encodeView,
  encodeViewVector,
  FEATURE_DIM,
} from '../src/rl/features';
import { runEpisode } from '../src/rl/runEpisode';
import { scoredPolicy, softmaxSample, zeroWeights } from '../src/rl/scorer';
import { trainEs } from '../src/rl/train';
import { regular, special, testMatch, testPlayer } from './helpers';

describe('linear scorer', () => {
  const me = testPlayer('me', [
    regular('2h', 'hearts', '2'),
    special('zombie', 'z1'),
    special('shotgun', 's1'),
  ]);
  const foe = testPlayer('foe', [regular('3c', 'clubs', '3')]);
  const match = testMatch([me, foe]);
  const view = encodeView(me, foe, match);
  const actions = getLegalActions(me);

  it('concatenates view and action into FEATURE_DIM weights', () => {
    const play = actions[0];
    expect(play).toBeTruthy();
    if (!play) {
      return;
    }
    expect(encodeViewVector(view)).toHaveLength(20);
    expect(encodeAction(play, view)).toHaveLength(10);
    expect(concatFeatures(view, play)).toHaveLength(FEATURE_DIM);
  });

  it('scores every legal play at 0 when weights are zero', () => {
    const weights = zeroWeights();
    for (const play of actions) {
      expect(concatFeatures(view, play).reduce((sum, value, i) => sum + value * (weights[i] ?? 0), 0)).toBe(0);
    }
    expect(softmaxSample(actions.map(() => 0), createRng(3))).toBeGreaterThanOrEqual(0);
  });

  it('replays the same weights and seed into an identical match', () => {
    const weights = zeroWeights();
    weights[28] = 4;
    const policy = scoredPolicy(weights);
    const left = runEpisode(33, policy);
    const right = runEpisode(33, policy);
    expect(left.match).toEqual(right.match);
  });

  it('prefers zombie plays when the zombie action weight is large', () => {
    const weights = zeroWeights();
    weights[28] = 8;
    const policy = scoredPolicy(weights);
    const random = createRng(9);
    let zombiePlays = 0;
    for (let i = 0; i < 80; i += 1) {
      const play = policy({ view, actions, random });
      if (play.special?.kind === 'zombie') {
        zombiePlays += 1;
      }
    }
    expect(zombiePlays).toBeGreaterThan(50);
  });
});

describe('trainEs', () => {
  it('runs one generation and returns FEATURE_DIM weights', () => {
    const result = trainEs({ generations: 1, population: 2, episodes: 1, seed: 2 });
    expect(result.weights).toHaveLength(FEATURE_DIM);
    expect(result.log).toHaveLength(1);
  });
});
