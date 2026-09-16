import { createRegularPool, createSpecialCard } from './deck';
import { createRng, pickDistinctIndices, shuffleInPlace } from './rng';
import {
  HAND_SIZE,
  MAX_PLAYERS,
  MIN_PLAYERS,
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
  const [zombieIndex] = pickDistinctIndices(1, params.playerCount, random);
  if (zombieIndex === undefined) {
    throw new Error('Failed to assign the seed zombie');
  }
  const vaccineIndices = new Set(pickDistinctIndices(params.vaccineCount, params.playerCount, random));

  const regularCounts = Array.from({ length: params.playerCount }, (_, index) => {
    let specials = 1;
    if (index === zombieIndex) {
      specials += 1;
    }
    if (vaccineIndices.has(index)) {
      specials += 1;
    }
    return HAND_SIZE - specials;
  });
  const regularNeeded = regularCounts.reduce((sum, count) => sum + count, 0);
  const regularPool = shuffleInPlace(createRegularPool(regularNeeded), random);

  const players: PlayerHand[] = [];
  let offset = 0;
  for (let i = 0; i < params.playerCount; i += 1) {
    const regularCount = regularCounts[i] ?? 0;
    const regular = regularPool.slice(offset, offset + regularCount);
    offset += regularCount;
    const cards = [...regular, createSpecialCard('shotgun', i)];
    if (i === zombieIndex) {
      cards.push(createSpecialCard('zombie', i));
    }
    if (vaccineIndices.has(i)) {
      cards.push(createSpecialCard('vaccine', i));
    }
    players.push({
      id: `player-${padPlayerIndex(i)}`,
      displayName: `Player ${padPlayerIndex(i)}`,
      cards,
    });
  }

  return { params, seed, players };
}

export function playerHasKind(player: PlayerHand, kind: PlayerHand['cards'][number]['kind']): boolean {
  return player.cards.some((card) => card.kind === kind);
}
