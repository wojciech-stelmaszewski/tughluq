import type { Card, Deal } from './types';

export type DealtCard = {
  card: Card;
  playerIndex: number;
  playerId: string;
  slotIndex: number;
  slotCount: number;
  order: number;
};

function cardsOfKind(cards: Card[], kind: Card['kind']): Card[] {
  return cards.filter((card) => card.kind === kind);
}

export function flattenDealSequence(deal: Deal): DealtCard[] {
  const sequence: DealtCard[] = [];
  let order = 0;
  const slotCounts = deal.players.map((player) => player.cards.length);

  const push = (playerIndex: number, card: Card, slotIndex: number) => {
    const player = deal.players[playerIndex];
    if (!player) {
      return;
    }
    sequence.push({
      card,
      playerIndex,
      playerId: player.id,
      slotIndex,
      slotCount: slotCounts[playerIndex] ?? player.cards.length,
      order,
    });
    order += 1;
  };

  for (let round = 0; round < 7; round += 1) {
    for (let playerIndex = 0; playerIndex < deal.players.length; playerIndex += 1) {
      const regulars = cardsOfKind(deal.players[playerIndex]?.cards ?? [], 'regular');
      const card = regulars[round];
      if (card) {
        push(playerIndex, card, round);
      }
    }
  }

  for (let playerIndex = 0; playerIndex < deal.players.length; playerIndex += 1) {
    const shotgun = cardsOfKind(deal.players[playerIndex]?.cards ?? [], 'shotgun')[0];
    if (shotgun) {
      push(playerIndex, shotgun, 7);
    }
  }

  for (let playerIndex = 0; playerIndex < deal.players.length; playerIndex += 1) {
    const cards = deal.players[playerIndex]?.cards ?? [];
    const zombie = cardsOfKind(cards, 'zombie')[0];
    if (zombie) {
      const slotIndex = cards.findIndex((card) => card.kind === 'zombie');
      push(playerIndex, zombie, slotIndex);
    }
  }

  for (let playerIndex = 0; playerIndex < deal.players.length; playerIndex += 1) {
    const cards = deal.players[playerIndex]?.cards ?? [];
    const vaccine = cardsOfKind(cards, 'vaccine')[0];
    if (vaccine) {
      const slotIndex = cards.findIndex((card) => card.kind === 'vaccine');
      push(playerIndex, vaccine, slotIndex);
    }
  }

  return sequence;
}
