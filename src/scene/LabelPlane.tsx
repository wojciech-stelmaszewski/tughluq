import { useMemo } from 'react';
import { CanvasTexture, DoubleSide, SRGBColorSpace } from 'three';

type LabelPlaneProps = {
  text: string;
  color?: string;
  background?: string;
  width?: number;
  height?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
};

function makeLabelTexture(text: string, color: string, background: string): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D is not available');
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (background !== 'transparent') {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = color;
  ctx.font = '600 92px "IBM Plex Sans", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function LabelPlane({
  text,
  color = '#e8eef2',
  background = 'transparent',
  width = 0.9,
  height = 0.22,
  position,
  rotation = [0, 0, 0],
}: LabelPlaneProps) {
  const texture = useMemo(
    () => makeLabelTexture(text, color, background),
    [background, color, text],
  );

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent side={DoubleSide} />
    </mesh>
  );
}
