import { handTotal, rankValue, type MatchPlayer, type MatchState, type TablePlay } from '../game/match';
import { ROUND_LIMIT, SUITS, type Suit } from '../game/types';

export type SuitView = {
  count: number;
  sum: number;
  high: number;
};

export type PlayerView = {
  suits: Record<Suit, SuitView>;
  hasShotgun: boolean;
  hasZombie: boolean;
  hasVaccine: boolean;
  infected: boolean;
  regularCount: number;
  opponentHandSize: number;
  round: number;
  livingCount: number;
};

function emptySuit(): SuitView {
  return { count: 0, sum: 0, high: 0 };
}

export function encodeView(player: MatchPlayer, opponent: MatchPlayer, match: MatchState): PlayerView {
  const suits = Object.fromEntries(SUITS.map((suit) => [suit, emptySuit()])) as Record<Suit, SuitView>;
  let regularCount = 0;
  for (const card of player.cards) {
    if (card.kind !== 'regular' || !card.suit || !card.rank) {
      continue;
    }
    const bucket = suits[card.suit];
    const value = rankValue(card.rank);
    bucket.count += 1;
    bucket.sum += value;
    bucket.high = Math.max(bucket.high, value);
    regularCount += 1;
  }

  return {
    suits,
    hasShotgun: player.cards.some((card) => card.kind === 'shotgun'),
    hasZombie: player.cards.some((card) => card.kind === 'zombie'),
    hasVaccine: player.cards.some((card) => card.kind === 'vaccine'),
    infected: player.infected,
    regularCount,
    opponentHandSize: opponent.cards.length,
    round: match.round,
    livingCount: match.players.filter((entry) => entry.status === 'alive').length,
  };
}

export function encodeViewVector(view: PlayerView): number[] {
  const suitValues = SUITS.flatMap((suit) => {
    const bucket = view.suits[suit];
    return [bucket.count, bucket.sum, bucket.high];
  });
  return [
    ...suitValues,
    view.hasShotgun ? 1 : 0,
    view.hasZombie ? 1 : 0,
    view.hasVaccine ? 1 : 0,
    view.infected ? 1 : 0,
    view.regularCount,
    view.opponentHandSize,
    view.round / ROUND_LIMIT,
    view.livingCount,
  ];
}

export const VIEW_DIM = 20;
export const ACTION_DIM = 10;
export const FEATURE_DIM = VIEW_DIM + ACTION_DIM;

export function concatFeatures(view: PlayerView, play: TablePlay): number[] {
  const vector = [...encodeViewVector(view), ...encodeAction(play, view)];
  if (vector.length !== FEATURE_DIM) {
    throw new Error(`Feature dim ${vector.length} !== ${FEATURE_DIM}`);
  }
  return vector;
}

/**
 * Per-feature divisors so every input lands near [-1, 1]. A linear scorer folds scale into
 * its weights; a tanh unit cannot, and `livingCount` of 64 would saturate it at once.
 * Constants, not measured statistics, so a weight file stays reproducible.
 */
const FEATURE_SCALE: number[] = [
  // four suits: count, sum, high
  4, 20, 10, 4, 20, 10, 4, 20, 10, 4, 20, 10,
  // shotgun, zombie, vaccine, infected
  1, 1, 1, 1,
  // regularCount, opponentHandSize, round (already /20), livingCount
  7, 10, 1, 64,
  // action: pileSum, pileSize, highRank, suitShare, handShare, regularsLeft
  20, 4, 10, 1, 1, 7,
  // action: no special, shotgun, zombie, vaccine
  1, 1, 1, 1,
];

/** Same features as `concatFeatures`, scaled for a saturating activation. */
export function normalizedFeatures(view: PlayerView, play: TablePlay): number[] {
  const raw = concatFeatures(view, play);
  return raw.map((value, index) => value / (FEATURE_SCALE[index] ?? 1));
}

export function encodeAction(play: TablePlay, view: PlayerView): number[] {
  const pileSize = play.numbers.length;
  const pileSum = handTotal(play.numbers);
  const highRank = play.numbers.reduce((max, card) => {
    return card.rank ? Math.max(max, rankValue(card.rank)) : max;
  }, 0);
  const suitCount = play.suit ? view.suits[play.suit].count : 0;
  const kind = play.special?.kind;
  return [
    pileSum,
    pileSize,
    highRank,
    suitCount === 0 ? 0 : pileSize / suitCount,
    view.regularCount === 0 ? 0 : pileSize / view.regularCount,
    view.regularCount - pileSize,
    kind ? 0 : 1,
    kind === 'shotgun' ? 1 : 0,
    kind === 'zombie' ? 1 : 0,
    kind === 'vaccine' ? 1 : 0,
  ];
}
