/** mulberry32 — tiny seeded PRNG, enough for a deterministic deal. */
export function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) || 1) >>> 0;
}

export function shuffleInPlace<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = items[i];
    const swap = items[j];
    if (current === undefined || swap === undefined) {
      continue;
    }
    items[i] = swap;
    items[j] = current;
  }
  return items;
}

export function pickDistinctIndices(
  count: number,
  poolSize: number,
  random: () => number,
): number[] {
  if (count > poolSize) {
    throw new Error(`Cannot pick ${count} distinct indices from ${poolSize}`);
  }
  const indices = Array.from({ length: poolSize }, (_, i) => i);
  shuffleInPlace(indices, random);
  return indices.slice(0, count);
}
