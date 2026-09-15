import { MeshReflectorMaterial } from '@react-three/drei';
import { LabDressing } from './LabDressing';

const WALL = '#7d8985';
const DADO = '#5a6662';
const CEILING = '#4e5855';
const METAL = '#7d8682';
const ROOM_H = 7.4;

function CeilingStrip({ x, z, length, across }: { x: number; z: number; length: number; across?: boolean }) {
  return (
    <mesh position={[x, ROOM_H - 0.14, z]} rotation={across ? [0, Math.PI / 2, 0] : [0, 0, 0]}>
      <boxGeometry args={[length, 0.03, 0.07]} />
      <meshStandardMaterial
        color="#e8f2ee"
        emissive="#c5ddd4"
        emissiveIntensity={0.85}
        toneMapped={false}
      />
    </mesh>
  );
}

function Column({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, ROOM_H / 2, z]}>
      <cylinderGeometry args={[0.18, 0.2, ROOM_H - 0.08, 16]} />
      <meshStandardMaterial color="#4c5653" roughness={0.5} />
    </mesh>
  );
}

function Wall({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={WALL} roughness={0.62} />
      </mesh>
      <mesh position={[0, -size[1] * 0.28, 0]}>
        <boxGeometry args={[size[0] + 0.02, size[1] * 0.38, size[2] + 0.03]} />
        <meshStandardMaterial color={DADO} roughness={0.48} />
      </mesh>
    </group>
  );
}

export function LabEnvironment() {
  const strips: { x: number; z: number; length: number; across?: boolean }[] = [];
  for (let ix = -4; ix <= 4; ix += 1) {
    strips.push({ x: ix * 2.2, z: 0, length: 18 });
  }
  for (let iz = -3; iz <= 3; iz += 1) {
    strips.push({ x: 0, z: iz * 2.3, length: 20, across: true });
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 32]} />
        <MeshReflectorMaterial
          blur={[220, 70]}
          resolution={768}
          mixBlur={0.75}
          mixStrength={0.42}
          roughness={0.42}
          depthScale={0.4}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.2}
          color="#5c6864"
          metalness={0.12}
          mirror={0.08}
        />
      </mesh>

      <mesh position={[0, ROOM_H, 0]}>
        <boxGeometry args={[40, 0.12, 32]} />
        <meshStandardMaterial color={CEILING} roughness={0.86} />
      </mesh>
      {strips.map((strip) => (
        <CeilingStrip key={`${strip.x}:${strip.z}:${strip.across ? 'x' : 'z'}`} {...strip} />
      ))}

      <Wall position={[0, ROOM_H / 2, -11.15]} size={[24, ROOM_H, 0.2]} />
      <Wall position={[0, ROOM_H / 2, 11.15]} size={[24, ROOM_H, 0.2]} />
      <Wall position={[-11.35, ROOM_H / 2, 0]} size={[0.2, ROOM_H, 22.5]} />
      <Wall position={[11.35, ROOM_H / 2, 0]} size={[0.2, ROOM_H, 22.5]} />

      <mesh position={[0, 0.07, -11.02]}>
        <boxGeometry args={[24, 0.14, 0.08]} />
        <meshStandardMaterial color={METAL} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.07, 11.02]}>
        <boxGeometry args={[24, 0.14, 0.08]} />
        <meshStandardMaterial color={METAL} metalness={0.4} roughness={0.35} />
      </mesh>

      <Column x={-8.6} z={-6.2} />
      <Column x={8.6} z={-6.2} />
      <Column x={-8.6} z={6.2} />
      <Column x={8.6} z={6.2} />

      <LabDressing />
    </group>
  );
}
