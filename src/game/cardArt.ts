import type { Card, Suit } from './types';

const SUIT_FILE: Record<Suit, string> = {
  spades: 'S',
  hearts: 'H',
  diamonds: 'D',
  clubs: 'C',
};

export function cardAssetUrl(card: Card): string {
  if (card.kind === 'zombie') {
    return '/cards/Z.png';
  }
  if (card.kind === 'shotgun') {
    return '/cards/S.png';
  }
  if (card.kind === 'vaccine') {
    return '/cards/V.png';
  }
  if (card.suit && card.rank) {
    return `/cards/${card.rank}${SUIT_FILE[card.suit]}.svg`;
  }
  return '/cards/BACK.svg';
}

export function cardLabel(card: Card): string {
  if (card.kind === 'regular' && card.rank && card.suit) {
    return `${card.rank} of ${card.suit}`;
  }
  return card.kind;
}

export function cardToken(card: Card): string {
  if (card.kind === 'shotgun') {
    return 'shot';
  }
  if (card.kind === 'vaccine') {
    return 'vax';
  }
  if (card.kind === 'zombie') {
    return 'zombie';
  }
  if (card.rank && card.suit) {
    return `${card.rank}${SUIT_FILE[card.suit]}`;
  }
  return card.kind;
}
