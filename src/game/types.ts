export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];
export type CardKind = 'regular' | 'zombie' | 'shotgun' | 'vaccine';

export type Card = {
  id: string;
  kind: CardKind;
  suit?: Suit;
  rank?: Rank;
};

export type DealParams = {
  playerCount: number;
  vaccineCount: number;
};

export type PlayerHand = {
  id: string;
  displayName: string;
  cards: Card[];
};

export type Deal = {
  params: DealParams;
  seed: number;
  players: PlayerHand[];
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 16;
export const REGULAR_CARDS_PER_PLAYER = 7;
export const DEFAULT_PLAYER_COUNT = 16;
export const DEFAULT_VACCINE_COUNT = 2;
