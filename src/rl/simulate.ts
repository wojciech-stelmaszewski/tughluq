import { readFileSync } from 'node:fs';
import { POLICIES, type PolicyName } from './baselines';
import { evaluateDifferential } from './evaluate';
import type { Policy } from './policy';
import { loadModelFile } from './model';
import { runEpisode } from './runEpisode';

function readArg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) {
    return fallback;
  }
  return process.argv[index + 1] ?? fallback;
}

function readPolicy(name: string, fallback: PolicyName): PolicyName {
  const value = readArg(name, fallback);
  if (value in POLICIES) {
    return value as PolicyName;
  }
  throw new Error(`Unknown policy "${value}". Use randomLegal, aggressive, or conservative.`);
}

function fmt(value: number): string {
  return value.toFixed(3);
}

const seed = Number(readArg('seed', '1')) || 1;
const episodes = Math.max(1, Number(readArg('episodes', '20')) || 20);
const weightsPath = process.argv.includes('--weights') ? readArg('weights', '') : '';
const loaded = weightsPath ? loadModelFile(JSON.parse(readFileSync(weightsPath, 'utf8'))) : null;
const policyName = loaded ? loaded.label : readPolicy('policy', 'randomLegal');
const referenceName = process.argv.includes('--reference')
  ? readPolicy('reference', 'randomLegal')
  : null;
const policy: Policy = loaded ? loaded.policy : POLICIES[policyName as PolicyName];

if (referenceName) {
  const result = evaluateDifferential({
    candidate: policy,
    reference: POLICIES[referenceName],
    candidateName: policyName,
    referenceName,
    startSeed: seed,
    episodes,
  });
  console.log(
    [
      `policy ${result.candidate} vs ${result.reference}`,
      `episodes ${result.episodes}`,
      `candidate seats ${result.candidateSeats}`,
      `candidate clear ${fmt(result.candidateClear)}`,
      `reference clear ${fmt(result.referenceClear)}`,
      `diff ${fmt(result.meanDiff)}`,
      `95% CI [${fmt(result.ciLow)}, ${fmt(result.ciHigh)}]`,
    ].join('\n'),
  );
} else {
  let clears = 0;
  let alive = 0;
  let players = 0;
  for (let i = 0; i < episodes; i += 1) {
    const result = runEpisode((seed + i) >>> 0 || 1, policy);
    clears += result.clears;
    alive += result.alive;
    players += result.match.players.length;
  }
  console.log(
    [
      `policy ${policyName}`,
      `seed ${seed}`,
      `episodes ${episodes}`,
      `clear rate ${fmt(clears / players)}`,
      `mean survival ${fmt(alive / players)}`,
    ].join('\n'),
  );
}
