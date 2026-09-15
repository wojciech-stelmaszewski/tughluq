import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Quaternion, Vector3 } from 'three';
import type { Mesh } from 'three';
import type { DealtCard } from '../game/dealOrder';
import { getCardGeometry } from './cardGeometry';
import {
  DEAL_DURATION,
  DEAL_STAGGER,
  DECK_POSITION,
  fanOffset,
  type SeatPose,
} from './layout';
import { getCardBackTexture, getCardFaceTexture, specialTint } from './cardTextures';

type CardMeshProps = {
  dealt: DealtCard;
  seat: SeatPose;
  startTime: number;
};

const start = new Vector3();
const end = new Vector3();
const control = new Vector3();
const cursor = new Vector3();
const startQuat = new Quaternion();
const endQuat = new Quaternion();
const layFlat = new Quaternion();
const yawQuat = new Quaternion();
const xAxis = new Vector3(1, 0, 0);
const yAxis = new Vector3(0, 1, 0);

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function bezier(a: Vector3, b: Vector3, c: Vector3, t: number, target: Vector3): Vector3 {
  const u = 1 - t;
  target.set(
    u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    u * u * a.y + 2 * u * t * b.y + t * t * c.y,
    u * u * a.z + 2 * u * t * b.z + t * t * c.z,
  );
  return target;
}

export function CardMesh({ dealt, seat, startTime }: CardMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const face = useMemo(() => getCardFaceTexture(dealt.card), [dealt.card]);
  const back = useMemo(() => getCardBackTexture(), []);
  const edge = useMemo(() => new Color(specialTint(dealt.card.kind)), [dealt.card.kind]);
  const raised = dealt.card.kind !== 'regular' ? 0.008 : 0;

  const target = useMemo(() => {
    const fan = fanOffset(dealt.slotIndex, dealt.slotCount);
    const localX = fan.x;
    const facing = seat.yaw;
    const cos = Math.cos(facing);
    const sin = Math.sin(facing);
    const worldX = seat.position[0] + localX * cos - fan.z * sin;
    const worldZ = seat.position[2] + localX * sin + fan.z * cos;
    return {
      position: new Vector3(worldX, fan.y + raised, worldZ),
      yaw: facing + fan.tilt,
    };
  }, [dealt.slotCount, dealt.slotIndex, raised, seat]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    mesh.position.set(DECK_POSITION[0], DECK_POSITION[1] + dealt.order * 0.004, DECK_POSITION[2]);
    mesh.rotation.set(Math.PI / 2, 0, 0);
  }, [dealt.order]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const elapsed = clock.elapsedTime - startTime - dealt.order * DEAL_STAGGER;
    const t = Math.min(1, Math.max(0, elapsed / DEAL_DURATION));
    const e = easeOutCubic(t);

    start.set(DECK_POSITION[0], DECK_POSITION[1] + dealt.order * 0.004, DECK_POSITION[2]);
    end.copy(target.position);
    control.set((start.x + end.x) / 2, Math.max(start.y, end.y) + 1.45, (start.z + end.z) / 2);
    bezier(start, control, end, e, cursor);
    mesh.position.copy(cursor);

    startQuat.setFromAxisAngle(xAxis, Math.PI / 2);
    layFlat.setFromAxisAngle(xAxis, -Math.PI / 2);
    yawQuat.setFromAxisAngle(yAxis, target.yaw);
    endQuat.copy(yawQuat).multiply(layFlat);
    mesh.quaternion.copy(startQuat).slerp(endQuat, e);
    if (t >= 1) {
      mesh.position.copy(end);
      mesh.quaternion.copy(endQuat);
    }
  });

  const edgeColor = dealt.card.kind === 'regular' ? '#e8e2d6' : edge.getStyle();

  return (
    <mesh ref={meshRef} geometry={getCardGeometry()} castShadow={false}>
      <meshStandardMaterial attach="material-0" map={back} roughness={0.4} />
      <meshStandardMaterial attach="material-1" map={face} roughness={0.38} metalness={0.04} />
      <meshStandardMaterial attach="material-2" color={edgeColor} roughness={0.32} />
    </mesh>
  );
}

export function dealDurationSeconds(cardCount: number): number {
  if (cardCount <= 0) {
    return 0;
  }
  return (cardCount - 1) * DEAL_STAGGER + DEAL_DURATION + 0.08;
}
