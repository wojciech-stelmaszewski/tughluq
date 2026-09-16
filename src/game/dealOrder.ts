import { HAND_SIZE, type Card, type Deal } from './types';

export type DealtCard = {
  card: Card;
  playerIndex: number;
  playerId: string;
  slotIndex: number;
  slotCount: number;
  order: number;
};

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

  for (let round = 0; round < HAND_SIZE; round += 1) {
    for (let playerIndex = 0; playerIndex < deal.players.length; playerIndex += 1) {
      const card = deal.players[playerIndex]?.cards[round];
      if (card) {
        push(playerIndex, card, round);
      }
    }
  }

  return sequence;
}
