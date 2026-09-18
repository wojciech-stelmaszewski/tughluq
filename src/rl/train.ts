import { factionTally } from '../game/match';
import { createRng } from '../game/rng';
import { aggressive, randomLegal } from './baselines';
import { evaluateDifferential } from './evaluate';
import { LINEAR_MODEL, type Model } from './model';
import type { Policy } from './policy';
import { runEpisode } from './runEpisode';

export type GenerationLog = {
  generation: number;
  fitnessVsReference: number;
  fitnessVsRandom: number;
  fitnessVsAggressive: number;
  zombieShare: number;
  reference: string;
};

export type TrainOptions = {
  generations: number;
  population: number;
  episodes: number;
  seed: number;
  /** Episodes for the log columns only. Keep it high: they are read as a trend, not a fitness. */
  probeEpisodes?: number;
  sigma?: number;
  promoteEvery?: number;
  /** Defaults to the linear scorer, which is what Stage B trained. */
  model?: Model;
  /** Called as each generation closes, so a long run is not silent. */
  onGeneration?: (row: GenerationLog) => void;
};

export type TrainResult = {
  weights: number[];
  log: GenerationLog[];
};

function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-12);
  const v = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function perturb(
  weights: number[],
  sigma: number,
  scale: number[] | null,
  random: () => number,
): number[] {
  return weights.map((value, index) => value + sigma * (scale?.[index] ?? 1) * gaussian(random));
}

function meanZombieShare(policy: Policy, startSeed: number, episodes: number): number {
  let share = 0;
  for (let i = 0; i < episodes; i += 1) {
    const result = runEpisode((startSeed + i) >>> 0 || 1, policy);
    const tally = factionTally(result.match.players);
    share += tally.living === 0 ? 0 : tally.zombies / tally.living;
  }
  return episodes === 0 ? 0 : share / episodes;
}

function fitnessOf(
  candidate: Policy,
  reference: Policy,
  candidateName: string,
  referenceName: string,
  startSeed: number,
  episodes: number,
): number {
  return evaluateDifferential({
    candidate,
    reference,
    candidateName,
    referenceName,
    startSeed,
    episodes,
  }).meanDiff;
}

export function trainEs(options: TrainOptions): TrainResult {
  const sigma = options.sigma ?? 0.2;
  const promoteEvery = options.promoteEvery ?? 2;
  const model = options.model ?? LINEAR_MODEL;
  const random = createRng(options.seed ^ 0x9e3779b9);
  let weights = model.init(options.seed);
  let reference: Policy = randomLegal;
  let referenceName = 'randomLegal';
  const log: GenerationLog[] = [];

  for (let generation = 1; generation <= options.generations; generation += 1) {
    const candidates = [weights];
    const extra = Math.max(0, options.population - 1);
    const scale = model.sigmaScale?.(weights) ?? null;
    for (let i = 0; i < extra; i += 1) {
      candidates.push(perturb(weights, sigma, scale, random));
    }

    const genSeed = (options.seed + generation * 9973) >>> 0 || 1;
    let elite = weights;
    let eliteFit = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      if (!candidate) {
        continue;
      }
      const fit = fitnessOf(
        model.policy(candidate),
        reference,
        `gen${generation}-${i}`,
        referenceName,
        genSeed,
        options.episodes,
      );
      if (fit > eliteFit) {
        eliteFit = fit;
        elite = candidate;
      }
    }

    weights = elite;
    const elitePolicy = model.policy(weights);
    const probeSeed = (genSeed ^ 0x51ed) >>> 0 || 1;
    const probeEpisodes = Math.max(1, options.probeEpisodes ?? options.episodes);
    const vsRandom = fitnessOf(elitePolicy, randomLegal, 'elite', 'randomLegal', probeSeed, probeEpisodes);
    const vsAggressive = fitnessOf(elitePolicy, aggressive, 'elite', 'aggressive', probeSeed, probeEpisodes);
    const zombieShare = meanZombieShare(elitePolicy, probeSeed, probeEpisodes);

    const row: GenerationLog = {
      generation,
      fitnessVsReference: eliteFit,
      fitnessVsRandom: vsRandom,
      fitnessVsAggressive: vsAggressive,
      zombieShare,
      reference: referenceName,
    };
    log.push(row);
    options.onGeneration?.(row);

    if (generation % promoteEvery === 0 && eliteFit > 0) {
      reference = elitePolicy;
      referenceName = `elite@${generation}`;
    }
  }

  return { weights, log };
}
