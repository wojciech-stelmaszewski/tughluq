import { RANKS, SUITS, type Card } from './types';

export function createStandardDeck(deckIndex: number): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `regular-${deckIndex}-${suit}-${rank}`,
        kind: 'regular',
        suit,
        rank,
      });
    }
  }
  return cards;
}

export function createRegularPool(cardCount: number): Card[] {
  const decksNeeded = Math.max(1, Math.ceil(cardCount / 52));
  const pool: Card[] = [];
  for (let deckIndex = 0; deckIndex < decksNeeded; deckIndex += 1) {
    pool.push(...createStandardDeck(deckIndex));
  }
  return pool;
}

export function createSpecialCard(kind: Exclude<Card['kind'], 'regular'>, index: number): Card {
  return { id: `${kind}-${index}`, kind };
}
