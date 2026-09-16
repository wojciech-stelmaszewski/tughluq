import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { cardAssetUrl } from '../game/cardArt';
import { RANKS, SUITS, type Card, type Suit } from '../game/types';

export { cardAssetUrl };

const TEX_WIDTH = 512;
const TEX_HEIGHT = 744;
const cache = new Map<string, CanvasTexture>();
const inflight = new Map<string, Promise<CanvasTexture>>();

const SUIT_FILE: Record<Suit, string> = {
  spades: 'S',
  hearts: 'H',
  diamonds: 'D',
  clubs: 'C',
};

function makeCanvas(): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_WIDTH;
  canvas.height = TEX_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D is not available');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return ctx;
}

function textureFrom(ctx: CanvasRenderingContext2D): CanvasTexture {
  const texture = new CanvasTexture(ctx.canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function blankTexture(): CanvasTexture {
  const ctx = makeCanvas();
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(0, 0, TEX_WIDTH, TEX_HEIGHT);
  return textureFrom(ctx);
}

function rasterize(url: string): Promise<CanvasTexture> {
  const cached = cache.get(url);
  if (cached) {
    return Promise.resolve(cached);
  }
  const pending = inflight.get(url);
  if (pending) {
    return pending;
  }
  const work = new Promise<CanvasTexture>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const ctx = makeCanvas();
      ctx.drawImage(image, 0, 0, TEX_WIDTH, TEX_HEIGHT);
      const texture = textureFrom(ctx);
      cache.set(url, texture);
      inflight.delete(url);
      resolve(texture);
    };
    image.onerror = () => {
      inflight.delete(url);
      reject(new Error(`Failed to load card art: ${url}`));
    };
    image.src = url;
  });
  inflight.set(url, work);
  return work;
}

export function getCardFaceTexture(card: Card): CanvasTexture {
  return cache.get(cardAssetUrl(card)) ?? blankTexture();
}

export function getCardBackTexture(): CanvasTexture {
  return cache.get('/cards/BACK.svg') ?? blankTexture();
}

export function specialTint(_kind: Card['kind']): string {
  return '#e8dfd0';
}

export async function preloadDeckTextures(): Promise<void> {
  const urls = ['/cards/BACK.svg', '/cards/Z.png', '/cards/S.png', '/cards/V.png'];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      urls.push(`/cards/${rank}${SUIT_FILE[suit]}.svg`);
    }
  }
  await Promise.all(urls.map((url) => rasterize(url)));
}
