import { createRegularPool, createSpecialCard } from './deck';
import { createRng, pickDistinctIndices, shuffleInPlace } from './rng';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  REGULAR_CARDS_PER_PLAYER,
  type Deal,
  type DealParams,
  type PlayerHand,
} from './types';

export function validateDealParams(params: DealParams): string | null {
  const { playerCount, vaccineCount } = params;
  if (!Number.isInteger(playerCount) || playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    return `Players must be an integer from ${MIN_PLAYERS} to ${MAX_PLAYERS}`;
  }
  if (!Number.isInteger(vaccineCount) || vaccineCount < 0 || vaccineCount > playerCount) {
    return `Vaccines must be an integer from 0 to ${playerCount}`;
  }
  return null;
}

function padPlayerIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function deal(params: DealParams, seed: number): Deal {
  const error = validateDealParams(params);
  if (error) {
    throw new Error(error);
  }

  const random = createRng(seed);
  const regularNeeded = params.playerCount * REGULAR_CARDS_PER_PLAYER;
  const regularPool = shuffleInPlace(createRegularPool(regularNeeded), random);

  const players: PlayerHand[] = [];
  for (let i = 0; i < params.playerCount; i += 1) {
    const regular = regularPool.slice(i * REGULAR_CARDS_PER_PLAYER, (i + 1) * REGULAR_CARDS_PER_PLAYER);
    players.push({
      id: `player-${padPlayerIndex(i)}`,
      displayName: `Player ${padPlayerIndex(i)}`,
      cards: [...regular, createSpecialCard('shotgun', i)],
    });
  }

  const [zombieIndex] = pickDistinctIndices(1, params.playerCount, random);
  if (zombieIndex === undefined) {
    throw new Error('Failed to assign the seed zombie');
  }
  const zombieHolder = players[zombieIndex];
  if (!zombieHolder) {
    throw new Error('Zombie holder is missing');
  }
  zombieHolder.cards.push(createSpecialCard('zombie', zombieIndex));

  const vaccineIndices = pickDistinctIndices(params.vaccineCount, params.playerCount, random);
  for (const index of vaccineIndices) {
    const holder = players[index];
    if (!holder) {
      continue;
    }
    holder.cards.push(createSpecialCard('vaccine', index));
  }

  return { params, seed, players };
}

export function playerHasKind(player: PlayerHand, kind: PlayerHand['cards'][number]['kind']): boolean {
  return player.cards.some((card) => card.kind === kind);
}
