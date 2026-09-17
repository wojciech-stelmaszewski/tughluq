import {
  getLegalActions,
  type MatchPlayer,
  type MatchState,
  playRound,
} from '../src/game/match';
import type { Card, Rank, Suit } from '../src/game/types';
import { bindSeating, type Policy } from '../src/rl/policy';

export function regular(id: string, suit: Suit, rank: Rank): Card {
  return { id, kind: 'regular', suit, rank };
}

export function special(kind: Exclude<Card['kind'], 'regular'>, id: string): Card {
  return { id, kind };
}

export function testPlayer(id: string, cards: Card[], extra: Partial<MatchPlayer> = {}): MatchPlayer {
  return {
    displayName: id,
    group: 1,
    infected: cards.some((card) => card.kind === 'zombie'),
    status: 'alive',
    lastAction: '—',
    ...extra,
    id,
    cards,
  };
}

export function testMatch(players: MatchPlayer[], seed = 1): MatchState {
  return {
    seed,
    generation: 1,
    episode: 1,
    round: 0,
    finished: false,
    verdict: null,
    players,
    reports: [],
  };
}

export const playNumbers: Policy = ({ actions }) => {
  return actions.find((play) => play.special === null) ?? actions[0]!;
};

export function playSpecial(kind: Exclude<Card['kind'], 'regular'>): Policy {
  return ({ actions }) => {
    return actions.find((play) => play.special?.kind === kind && play.numbers.length === 0) ?? actions[0]!;
  };
}

export const playLargestNumbers: Policy = ({ actions }) => {
  const plain = actions.filter((play) => play.special === null);
  return plain.reduce((best, play) => {
    const bestSum = best.numbers.reduce((sum, card) => sum + Number(card.rank === 'A' ? 1 : card.rank), 0);
    const playSum = play.numbers.reduce((sum, card) => sum + Number(card.rank === 'A' ? 1 : card.rank), 0);
    return playSum > bestSum ? play : best;
  }, plain[0] ?? actions[0]!);
};

export function step(match: MatchState, seating: Record<string, Policy>): MatchState {
  return playRound(match, bindSeating(seating, playNumbers));
}

export function hasVaccineAction(player: MatchPlayer): boolean {
  return getLegalActions(player).some((play) => play.special?.kind === 'vaccine');
}
