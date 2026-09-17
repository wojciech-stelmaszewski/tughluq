import { EMPTY_PLAY, handTotal, type TablePlay } from '../game/match';
import { pickOne } from '../game/rng';
import type { Policy } from './policy';

function firstPlay(actions: TablePlay[]): TablePlay {
  return actions[0] ?? EMPTY_PLAY;
}

function numbersOnly(actions: TablePlay[]): TablePlay[] {
  return actions.filter((play) => play.special === null);
}

function pickMin(actions: TablePlay[]): TablePlay {
  return actions.reduce((best, play) => {
    const bestSum = handTotal(best.numbers);
    const playSum = handTotal(play.numbers);
    if (playSum < bestSum) {
      return play;
    }
    if (playSum === bestSum && play.numbers.length < best.numbers.length) {
      return play;
    }
    return best;
  }, firstPlay(actions));
}

function pickMax(actions: TablePlay[]): TablePlay {
  return actions.reduce((best, play) => {
    const bestSum = handTotal(best.numbers);
    const playSum = handTotal(play.numbers);
    if (playSum > bestSum) {
      return play;
    }
    if (playSum === bestSum && play.numbers.length > best.numbers.length) {
      return play;
    }
    return best;
  }, firstPlay(actions));
}

export const randomLegal: Policy = ({ actions, random }) => {
  return pickOne(actions, random) ?? EMPTY_PLAY;
};

export const conservative: Policy = ({ actions }) => {
  const plain = numbersOnly(actions);
  return pickMin(plain.length > 0 ? plain : actions);
};

export const aggressive: Policy = ({ actions }) => {
  const withZombie = actions.filter((play) => play.special?.kind === 'zombie');
  if (withZombie.length > 0) {
    return pickMax(withZombie);
  }
  const plain = numbersOnly(actions);
  return pickMax(plain.length > 0 ? plain : actions);
};

export const POLICIES = {
  randomLegal,
  aggressive,
  conservative,
} as const;

export type PolicyName = keyof typeof POLICIES;
