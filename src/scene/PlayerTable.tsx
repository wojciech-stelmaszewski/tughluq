import { STATION_DEPTH, STATION_LENGTH, TABLE_HEIGHT, TABLE_TOP_Y } from './layout';

const TOP = '#f4f7fa';
const EDGE = '#c5ced6';
const METAL = '#b7c0c8';

type PlayerTableProps = {
  onFocus?: () => void;
};

export function PlayerTable({ onFocus }: PlayerTableProps) {
  const legX = STATION_LENGTH / 2 - 0.1;
  const legZ = STATION_DEPTH / 2 - 0.1;
  return (
    <group
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      onClick={(event) => {
        event.stopPropagation();
        onFocus?.();
      }}
    >
      <mesh position={[0, TABLE_HEIGHT - 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[STATION_LENGTH, 0.055, STATION_DEPTH]} />
        <meshPhysicalMaterial
          color={TOP}
          roughness={0.14}
          metalness={0.04}
          clearcoat={0.85}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh position={[0, TABLE_HEIGHT - 0.062, 0]} castShadow>
        <boxGeometry args={[STATION_LENGTH + 0.03, 0.016, STATION_DEPTH + 0.03]} />
        <meshStandardMaterial color={EDGE} metalness={0.62} roughness={0.28} />
      </mesh>
      {[
        [-legX, -legZ],
        [legX, -legZ],
        [-legX, legZ],
        [legX, legZ],
      ].map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, TABLE_HEIGHT / 2 - 0.04, z]} castShadow>
          <cylinderGeometry args={[0.028, 0.034, TABLE_HEIGHT - 0.08, 16]} />
          <meshStandardMaterial color={METAL} metalness={0.72} roughness={0.24} />
        </mesh>
      ))}
      <mesh position={[0, 3.55, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 2.4, 8]} />
        <meshStandardMaterial color="#c5ccd2" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.32, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.06, 24]} />
        <meshStandardMaterial color="#dce3e8" metalness={0.35} roughness={0.28} />
      </mesh>
      <mesh position={[0, 2.285, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 28]} />
        <meshStandardMaterial
          color="#f7fbff"
          emissive="#e8f2ff"
          emissiveIntensity={1.25}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[0, TABLE_HEIGHT + 0.04, 0]}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onFocus?.();
        }}
      >
        <boxGeometry args={[STATION_LENGTH + 0.08, 0.1, STATION_DEPTH + 0.08]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function PlayerStool() {
  return (
    <group>
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.035, 24]} />
        <meshPhysicalMaterial color="#eceff2" roughness={0.32} metalness={0.08} clearcoat={0.35} />
      </mesh>
      <mesh position={[0, 0.23, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.46, 12]} />
        <meshStandardMaterial color={METAL} metalness={0.78} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.014, 10, 24]} />
        <meshStandardMaterial color={METAL} metalness={0.78} roughness={0.22} />
      </mesh>
    </group>
  );
}

export function DealerPodium() {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.56, 32]} />
        <meshPhysicalMaterial color="#e8eef2" roughness={0.22} metalness={0.12} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, TABLE_TOP_Y - 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 32]} />
        <meshPhysicalMaterial
          color={TOP}
          roughness={0.12}
          metalness={0.06}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh position={[0, TABLE_TOP_Y + 0.01, 0]}>
        <sphereGeometry args={[0.22, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#8d949c" metalness={0.94} roughness={0.16} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, TABLE_TOP_Y + 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.078, 0.014, 12, 24]} />
        <meshStandardMaterial color="#6f767e" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
