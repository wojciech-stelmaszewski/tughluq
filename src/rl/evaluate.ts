import { createMatch } from '../game/match';
import { createRng, shuffleInPlace } from '../game/rng';
import { TOURNAMENT_PLAYERS } from '../game/types';
import type { Policy } from './policy';
import { runEpisode } from './runEpisode';

export const CANDIDATE_SEATS = 8;

export type DifferentialResult = {
  candidate: string;
  reference: string;
  episodes: number;
  candidateSeats: number;
  meanDiff: number;
  ciLow: number;
  ciHigh: number;
  candidateClear: number;
  referenceClear: number;
};

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleStdev(values: number[], avg: number): number {
  if (values.length < 2) {
    return 0;
  }
  const sumSquares = values.reduce((sum, value) => sum + (value - avg) ** 2, 0);
  return Math.sqrt(sumSquares / (values.length - 1));
}

export function evaluateDifferential(options: {
  candidate: Policy;
  reference: Policy;
  candidateName: string;
  referenceName: string;
  startSeed: number;
  episodes: number;
  candidateSeats?: number;
}): DifferentialResult {
  const candidateSeats = options.candidateSeats ?? CANDIDATE_SEATS;
  const diffs: number[] = [];
  let candidateClears = 0;
  let candidateN = 0;
  let referenceClears = 0;
  let referenceN = 0;

  for (let i = 0; i < options.episodes; i += 1) {
    const seed = (options.startSeed + i) >>> 0 || 1;
    const deal = createMatch(seed);
    const ids = deal.players.map((player) => player.id);
    shuffleInPlace(ids, createRng(seed ^ 0xc0ffee));
    const candidateIds = new Set(ids.slice(0, candidateSeats));
    const seating: Record<string, Policy> = {};
    for (const id of candidateIds) {
      seating[id] = options.candidate;
    }

    const result = runEpisode(seed, seating, options.reference);
    let candidateSum = 0;
    let referenceSum = 0;
    for (const player of result.match.players) {
      const reward = result.rewards[player.id] ?? 0;
      if (candidateIds.has(player.id)) {
        candidateSum += reward;
        candidateClears += reward;
        candidateN += 1;
      } else {
        referenceSum += reward;
        referenceClears += reward;
        referenceN += 1;
      }
    }
    const referenceSeats = TOURNAMENT_PLAYERS - candidateSeats;
    diffs.push(candidateSum / candidateSeats - referenceSum / referenceSeats);
  }

  const meanDiff = mean(diffs);
  const stderr = sampleStdev(diffs, meanDiff) / Math.sqrt(Math.max(diffs.length, 1));
  const span = 1.96 * stderr;

  return {
    candidate: options.candidateName,
    reference: options.referenceName,
    episodes: options.episodes,
    candidateSeats,
    meanDiff,
    ciLow: meanDiff - span,
    ciHigh: meanDiff + span,
    candidateClear: candidateN === 0 ? 0 : candidateClears / candidateN,
    referenceClear: referenceN === 0 ? 0 : referenceClears / referenceN,
  };
}
