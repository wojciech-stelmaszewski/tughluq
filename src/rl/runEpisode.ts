import {
  canPlayRound,
  createMatch,
  playRound,
  playerReward,
  type MatchState,
} from '../game/match';
import { randomLegal } from './baselines';
import { bindSeating, type Policy, type Seating } from './policy';

export type EpisodeResult = {
  seed: number;
  rounds: number;
  verdict: string | null;
  clears: number;
  alive: number;
  match: MatchState;
  rewards: Record<string, number>;
};

export function runEpisode(
  seed: number,
  seating: Seating = randomLegal,
  fallback: Policy = randomLegal,
): EpisodeResult {
  let match = createMatch(seed);
  const choosePlay = bindSeating(seating, fallback);
  while (canPlayRound(match)) {
    match = playRound(match, choosePlay);
  }
  if (!match.finished) {
    match = playRound(match, choosePlay);
  }

  const rewards: Record<string, number> = {};
  let clears = 0;
  for (const player of match.players) {
    const reward = playerReward(player, match.players);
    rewards[player.id] = reward;
    clears += reward;
  }

  return {
    seed,
    rounds: match.round,
    verdict: match.verdict,
    clears,
    alive: match.players.filter((player) => player.status === 'alive').length,
    match,
    rewards,
  };
}
