import { describe, expect, it } from 'vitest';
import { deal, playerHasKind } from '../src/game/deal';
import { dealTournament } from '../src/game/tournament';
import {
  GROUP_COUNT,
  GROUP_SIZE,
  HAND_SIZE,
  TOURNAMENT_PLAYERS,
} from '../src/game/types';

describe('deal', () => {
  it('gives each player 7 cards including one shotgun', () => {
    const result = deal({ playerCount: 16, vaccineCount: 2 }, 7);
    expect(result.players).toHaveLength(16);
    for (const player of result.players) {
      expect(player.cards).toHaveLength(HAND_SIZE);
      expect(playerHasKind(player, 'shotgun')).toBe(true);
    }
  });

  it('deals one zombie and the requested vaccine count', () => {
    const result = deal({ playerCount: 16, vaccineCount: 3 }, 11);
    expect(result.players.filter((player) => playerHasKind(player, 'zombie'))).toHaveLength(1);
    expect(result.players.filter((player) => playerHasKind(player, 'vaccine'))).toHaveLength(3);
  });
});

describe('dealTournament', () => {
  it('deals 64 players, one zombie per group, vaccines per group', () => {
    const result = dealTournament({ vaccinesPerGroup: 2 }, 42);
    expect(result.players).toHaveLength(TOURNAMENT_PLAYERS);
    for (let group = 1; group <= GROUP_COUNT; group += 1) {
      const wing = result.players.filter((player) => player.group === group);
      expect(wing).toHaveLength(GROUP_SIZE);
      expect(wing.filter((player) => playerHasKind(player, 'zombie'))).toHaveLength(1);
      expect(wing.filter((player) => playerHasKind(player, 'vaccine'))).toHaveLength(2);
      expect(wing.every((player) => player.cards.length === HAND_SIZE)).toBe(true);
    }
  });
});
