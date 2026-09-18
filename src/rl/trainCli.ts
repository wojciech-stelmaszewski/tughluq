import { writeFileSync } from 'node:fs';
import { DEFAULT_HIDDEN } from './mlp';
import { modelByName } from './model';
import { trainEs } from './train';

function readArg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) {
    return fallback;
  }
  return process.argv[index + 1] ?? fallback;
}

function fmt(value: number): string {
  return value.toFixed(3);
}

const seed = Number(readArg('seed', '1')) || 1;
const generations = Math.max(1, Number(readArg('generations', '8')) || 8);
const population = Math.max(2, Number(readArg('population', '8')) || 8);
const episodes = Math.max(1, Number(readArg('episodes', '5')) || 5);
const probeEpisodes = Math.max(1, Number(readArg('probe', String(episodes))) || episodes);
const sigma = Number(readArg('sigma', '0.2')) || 0.2;
const promoteEvery = Math.max(1, Number(readArg('promote', '2')) || 2);
const hidden = Math.max(1, Number(readArg('hidden', String(DEFAULT_HIDDEN))) || DEFAULT_HIDDEN);
const model = modelByName(readArg('model', 'linear'), hidden);
const out = readArg('out', 'docs/weights-latest.json');
const logPath = readArg('log', 'docs/train-log.md');

const started = Date.now();
const result = trainEs({
  generations,
  population,
  episodes,
  probeEpisodes,
  sigma,
  promoteEvery,
  seed,
  model,
  onGeneration: (row) => {
    const elapsed = Math.round((Date.now() - started) / 1000);
    process.stderr.write(
      `gen ${row.generation}/${generations} · ${elapsed}s · ref ${fmt(row.fitnessVsReference)}` +
        ` · vsRandom ${fmt(row.fitnessVsRandom)} · vsAggressive ${fmt(row.fitnessVsAggressive)}` +
        ` · zombies ${fmt(row.zombieShare)} · league ${row.reference}\n`,
    );
  },
});
const payload = model.file(result.weights, {
  seed,
  generation: generations,
  fitnessVsRandom: result.log.at(-1)?.fitnessVsRandom,
});

writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);

const lines = [
  `# ES train log — ${model.label}`,
  '',
  `seed ${seed} · generations ${generations} · population ${population} · episodes ${episodes}`,
  `probe ${probeEpisodes} · sigma ${sigma} · promote every ${promoteEvery} · dim ${model.dim}`,
  '',
  '| Gen | vs reference | vs randomLegal | vs aggressive | zombie share | reference |',
  '| --- | --- | --- | --- | --- | --- |',
  ...result.log.map((row) => {
    return `| ${row.generation} | ${fmt(row.fitnessVsReference)} | ${fmt(row.fitnessVsRandom)} | ${fmt(row.fitnessVsAggressive)} | ${fmt(row.zombieShare)} | ${row.reference} |`;
  }),
  '',
  `Wrote \`${out}\`.`,
  '',
];
writeFileSync(logPath, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
