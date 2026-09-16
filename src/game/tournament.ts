import { deal } from './deal';
import {
  DEFAULT_VACCINES_PER_GROUP,
  GROUP_COUNT,
  GROUP_SIZE,
  type Card,
  type PlayerHand,
} from './types';

export type TournamentParams = {
  vaccinesPerGroup: number;
};

export type TournamentPlayer = PlayerHand & {
  group: number;
};

export type TournamentDeal = {
  params: TournamentParams;
  seed: number;
  players: TournamentPlayer[];
};

function padPlayerIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function groupSeed(seed: number, groupIndex: number): number {
  return (Math.imul(seed ^ ((groupIndex + 1) * 0x9e3779b9), 0x85ebca6b) >>> 0);
}

function remapCard(card: Card, group: number): Card {
  return { ...card, id: `${card.id}-g${group}` };
}

export function validateTournamentParams(params: TournamentParams): string | null {
  const { vaccinesPerGroup } = params;
  if (!Number.isInteger(vaccinesPerGroup) || vaccinesPerGroup < 0 || vaccinesPerGroup > GROUP_SIZE) {
    return `Vaccines per group must be an integer from 0 to ${GROUP_SIZE}`;
  }
  return null;
}

export function dealTournament(
  params: TournamentParams = { vaccinesPerGroup: DEFAULT_VACCINES_PER_GROUP },
  seed: number,
): TournamentDeal {
  const error = validateTournamentParams(params);
  if (error) {
    throw new Error(error);
  }

  const players: TournamentPlayer[] = [];

  for (let groupIndex = 0; groupIndex < GROUP_COUNT; groupIndex += 1) {
    const group = groupIndex + 1;
    const wing = deal(
      { playerCount: GROUP_SIZE, vaccineCount: params.vaccinesPerGroup },
      groupSeed(seed, groupIndex),
    );

    for (let seat = 0; seat < wing.players.length; seat += 1) {
      const source = wing.players[seat];
      if (!source) {
        continue;
      }
      const globalIndex = groupIndex * GROUP_SIZE + seat;
      players.push({
        id: `player-${padPlayerIndex(globalIndex)}`,
        displayName: `Player ${padPlayerIndex(globalIndex)}`,
        group,
        cards: source.cards.map((card) => remapCard(card, group)),
      });
    }
  }

  return { params, seed, players };
}
