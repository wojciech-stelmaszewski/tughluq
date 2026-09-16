import type { MatchPlayer, MatchState } from '../game/match';
import type { Card } from '../game/types';

export type Faction = 'human' | 'zombie' | 'eliminated';

export type WatchCounters = {
  generation: number;
  episode: number;
  round: number;
};

export type WatchPlayerRow = {
  id: string;
  displayName: string;
  group: number;
  faction: Faction;
  regularCount: number;
  hasShotgun: boolean;
  hasZombie: boolean;
  hasVaccine: boolean;
  cards: Card[];
  lastAction: string;
  fitness: string;
};

export type WatchStats = {
  humans: number;
  zombies: number;
  eliminated: number;
  vaccinesHeld: number;
  shotgunsHeld: number;
  meanRegularCards: number;
};

export type WatchSnapshot = WatchCounters & {
  seed: number;
  players: WatchPlayerRow[];
  stats: WatchStats;
};

export const EMPTY_WATCH_FIELD = '—';

function factionOf(player: MatchPlayer): Faction {
  if (player.status === 'eliminated') {
    return 'eliminated';
  }
  return player.infected ? 'zombie' : 'human';
}

export function snapshotFromMatch(match: MatchState): WatchSnapshot {
  const players: WatchPlayerRow[] = match.players.map((player) => {
    const hasZombie = player.cards.some((card) => card.kind === 'zombie');
    return {
      id: player.id,
      displayName: player.displayName,
      group: player.group,
      faction: factionOf(player),
      regularCount: player.cards.filter((card) => card.kind === 'regular').length,
      hasShotgun: player.cards.some((card) => card.kind === 'shotgun'),
      hasZombie: player.infected || hasZombie,
      hasVaccine: player.cards.some((card) => card.kind === 'vaccine'),
      cards: player.cards,
      lastAction: player.lastAction || EMPTY_WATCH_FIELD,
      fitness: EMPTY_WATCH_FIELD,
    };
  });

  const humans = players.filter((player) => player.faction === 'human').length;
  const zombies = players.filter((player) => player.faction === 'zombie').length;
  const eliminated = players.filter((player) => player.faction === 'eliminated').length;
  const regularTotal = players.reduce((sum, player) => sum + player.regularCount, 0);

  return {
    generation: match.generation,
    episode: match.episode,
    round: match.round,
    seed: match.seed,
    players,
    stats: {
      humans,
      zombies,
      eliminated,
      vaccinesHeld: players.filter((player) => player.hasVaccine).length,
      shotgunsHeld: players.filter((player) => player.hasShotgun).length,
      meanRegularCards: players.length === 0 ? 0 : regularTotal / players.length,
    },
  };
}
