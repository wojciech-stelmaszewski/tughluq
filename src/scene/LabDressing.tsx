import { LabelPlane } from './LabelPlane';

const STEEL = '#8d969c';
const STEEL_DARK = '#5c646a';
const BENCH = '#8b7358';
const PLASTIC = '#c5ccd1';
const GLASS = '#8fd0c4';
const DARK_GLASS = '#12161a';

function Bench({
  width,
  depth = 0.62,
  height = 0.92,
}: {
  width: number;
  depth?: number;
  height?: number;
}) {
  return (
    <group>
      <mesh position={[0, height - 0.03, 0]}>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color={BENCH} roughness={0.55} />
      </mesh>
      <mesh position={[0, height / 2 - 0.04, 0]}>
        <boxGeometry args={[width - 0.08, height - 0.1, depth - 0.1]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.35} />
      </mesh>
    </group>
  );
}

function Cabinet({ height = 1.8 }: { height?: number }) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.72, height, 0.42]} />
        <meshStandardMaterial color="#4a5553" roughness={0.45} metalness={0.12} />
      </mesh>
      <mesh position={[0.18, height * 0.62, 0.22]}>
        <boxGeometry args={[0.22, 0.55, 0.02]} />
        <meshStandardMaterial color="#2f3836" roughness={0.35} />
      </mesh>
      <mesh position={[-0.18, height * 0.62, 0.22]}>
        <boxGeometry args={[0.22, 0.55, 0.02]} />
        <meshStandardMaterial color="#2f3836" roughness={0.35} />
      </mesh>
    </group>
  );
}

function Fridge() {
  return (
    <group>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.78, 2.1, 0.68]} />
        <meshStandardMaterial color="#b7c0c4" roughness={0.22} metalness={0.55} />
      </mesh>
      <mesh position={[0.28, 1.15, 0.35]}>
        <boxGeometry args={[0.04, 0.7, 0.03]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.85, 0.345]}>
        <boxGeometry args={[0.5, 0.08, 0.012]} />
        <meshStandardMaterial color="#3d4a3a" emissive="#1c2a18" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function MonitorOff({ width = 0.52, height = 0.32 }: { width?: number; height?: number }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[width, height, 0.03]} />
        <meshStandardMaterial color="#1a1f24" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[width - 0.04, height - 0.04, 0.01]} />
        <meshStandardMaterial color={DARK_GLASS} roughness={0.08} metalness={0.4} />
      </mesh>
    </group>
  );
}

function DesktopOff() {
  return (
    <group>
      <mesh position={[0, 0.18, 0.02]}>
        <boxGeometry args={[0.18, 0.36, 0.38]} />
        <meshStandardMaterial color="#2a3034" roughness={0.5} />
      </mesh>
      <mesh position={[0.32, 0.28, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.16, 10]} />
        <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.35} />
      </mesh>
      <group position={[0.32, 0.52, 0]}>
        <MonitorOff />
      </group>
      <mesh position={[0.12, 0.02, 0.16]}>
        <boxGeometry args={[0.28, 0.02, 0.14]} />
        <meshStandardMaterial color="#1d2226" roughness={0.6} />
      </mesh>
    </group>
  );
}

function TubeRack() {
  const tubes: { x: number; z: number; h: number; color: string }[] = [
    { x: -0.07, z: -0.04, h: 0.16, color: '#5aa8a0' },
    { x: 0.0, z: -0.04, h: 0.13, color: '#d4c36a' },
    { x: 0.07, z: -0.04, h: 0.18, color: '#c46b6b' },
    { x: -0.07, z: 0.04, h: 0.12, color: '#7aa1c4' },
    { x: 0.0, z: 0.04, h: 0.15, color: '#8f6aad' },
    { x: 0.07, z: 0.04, h: 0.14, color: '#5aa8a0' },
  ];
  return (
    <group>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.22, 0.03, 0.14]} />
        <meshStandardMaterial color="#2e3438" roughness={0.45} />
      </mesh>
      {tubes.map((tube) => (
        <mesh key={`${tube.x}:${tube.z}`} position={[tube.x, 0.04 + tube.h / 2, tube.z]}>
          <cylinderGeometry args={[0.018, 0.018, tube.h, 8]} />
          <meshPhysicalMaterial
            color={tube.color}
            roughness={0.12}
            metalness={0.05}
            transparent
            opacity={0.72}
            transmission={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function Microscope() {
  return (
    <group>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.04, 12]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.22, 10]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.28} />
      </mesh>
      <mesh position={[0.08, 0.2, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.025, 0.035, 0.16, 10]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.28} />
      </mesh>
    </group>
  );
}

function BottleShelf() {
  const colors = ['#2f6f68', '#6a3a3a', '#3a4a6a', '#5a5a32', '#4a3060'];
  return (
    <group>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.15, 0.84, 0.22]} />
        <meshStandardMaterial color="#3d4543" roughness={0.5} />
      </mesh>
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, index) => (
        <mesh key={x} position={[x, 0.28, 0.06]}>
          <cylinderGeometry args={[0.04, 0.045, 0.16, 10]} />
          <meshPhysicalMaterial color={colors[index]} roughness={0.15} transparent opacity={0.8} />
        </mesh>
      ))}
      {[-0.3, -0.1, 0.1, 0.3].map((x, index) => (
        <mesh key={`top-${x}`} position={[x, 0.62, 0.06]}>
          <cylinderGeometry args={[0.035, 0.04, 0.14, 10]} />
          <meshPhysicalMaterial color={colors[4 - index]} roughness={0.15} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function BiosafetyHood() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.35, 0.08, 0.7]} />
        <meshStandardMaterial color={STEEL} metalness={0.45} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.15, -0.28]}>
        <boxGeometry args={[1.35, 1.12, 0.12]} />
        <meshStandardMaterial color="#4e5856" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.12, 0.08]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.28, 0.72, 0.02]} />
        <meshPhysicalMaterial color="#9ecfc6" roughness={0.08} transparent opacity={0.28} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[1.35, 0.1, 0.7]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.4} roughness={0.32} />
      </mesh>
    </group>
  );
}

function WallWindow({ width, height }: { width: number; height: number }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial color="#2a3230" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.03]} />
        <meshPhysicalMaterial
          color="#14332e"
          roughness={0.06}
          metalness={0.15}
          transparent
          opacity={0.55}
        />
      </mesh>
    </group>
  );
}

function CautionStripe({ length }: { length: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
      <planeGeometry args={[length, 0.16]} />
      <meshStandardMaterial color="#c4a23a" roughness={0.65} />
    </mesh>
  );
}

export function LabDressing() {
  return (
    <group>
      <group position={[-11.2, 0, -2.2]} rotation={[0, Math.PI / 2, 0]}>
        <Bench width={6.4} />
        <group position={[-2.1, 0.94, 0.05]}>
          <DesktopOff />
        </group>
        <group position={[-0.6, 0.94, 0.08]}>
          <TubeRack />
        </group>
        <group position={[0.15, 0.94, 0.04]}>
          <Microscope />
        </group>
        <group position={[1.4, 0.94, 0.06]}>
          <DesktopOff />
        </group>
        <group position={[2.5, 0.94, 0.02]}>
          <TubeRack />
        </group>
      </group>

      <group position={[11.2, 0, 1.4]} rotation={[0, -Math.PI / 2, 0]}>
        <Bench width={5.2} />
        <group position={[-1.6, 0, 0]}>
          <BiosafetyHood />
        </group>
        <group position={[1.3, 0.94, 0.05]}>
          <TubeRack />
        </group>
        <group position={[1.9, 0.94, 0]}>
          <Microscope />
        </group>
      </group>

      <group position={[-7.2, 0, -10.6]}>
        <Cabinet />
      </group>
      <group position={[-6.3, 0, -10.6]}>
        <Cabinet height={1.55} />
      </group>
      <group position={[-5.2, 0, -10.55]}>
        <Fridge />
      </group>
      <group position={[6.4, 0, -10.55]}>
        <Fridge />
      </group>
      <group position={[7.4, 0, -10.6]}>
        <Cabinet />
      </group>
      <group position={[8.3, 0, -10.55]}>
        <BottleShelf />
      </group>

      <group position={[-8.6, 0, 10.55]} rotation={[0, Math.PI, 0]}>
        <Cabinet />
      </group>
      <group position={[-7.6, 0, 10.55]} rotation={[0, Math.PI, 0]}>
        <BottleShelf />
      </group>
      <group position={[7.8, 0, 10.55]} rotation={[0, Math.PI, 0]}>
        <Cabinet height={2.05} />
      </group>

      <group position={[0, 0, -10.55]}>
        <Bench width={3.4} depth={0.55} />
        <group position={[-0.9, 0.94, 0]}>
          <DesktopOff />
        </group>
        <group position={[0.7, 0.94, 0.04]}>
          <TubeRack />
        </group>
      </group>

      <group position={[-11.15, 3.4, -6.2]} rotation={[0, Math.PI / 2, 0]}>
        <WallWindow width={2.8} height={2.1} />
      </group>
      <group position={[-11.15, 3.4, 3.6]} rotation={[0, Math.PI / 2, 0]}>
        <WallWindow width={2.4} height={2.1} />
      </group>
      <group position={[11.15, 3.5, -3.2]} rotation={[0, -Math.PI / 2, 0]}>
        <WallWindow width={3.1} height={2.3} />
      </group>
      <group position={[0, 3.6, -10.95]}>
        <WallWindow width={4.4} height={2.2} />
      </group>

      <group position={[-3.2, 3.8, -11.02]}>
        <MonitorOff width={1.4} height={0.82} />
      </group>
      <group position={[3.2, 3.8, -11.02]}>
        <MonitorOff width={1.4} height={0.82} />
      </group>
      <group position={[11.22, 3.7, 4.6]} rotation={[0, -Math.PI / 2, 0]}>
        <MonitorOff width={1.6} height={0.9} />
      </group>

      <LabelPlane
        text="NIVR  ·  BSL-3  ·  SOUTH WING"
        color="#d7ece6"
        background="#1c2a26"
        width={4.6}
        height={0.38}
        position={[0, 5.7, -10.9]}
      />
      <LabelPlane
        text="CONTAINMENT  A"
        color="#f0d27a"
        background="#2a2414"
        width={2.1}
        height={0.32}
        position={[-11.12, 5.55, -6.2]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <LabelPlane
        text="NO UNAUTHORIZED ACCESS"
        color="#f2c2c2"
        background="#3a1c1c"
        width={2.4}
        height={0.3}
        position={[11.12, 5.5, -3.2]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <LabelPlane
        text="VACCINE COLD STORE"
        color="#cfe8e2"
        background="#1a2c28"
        width={2.2}
        height={0.28}
        position={[-5.2, 2.35, -10.18]}
      />
      <LabelPlane
        text="PCR  /  SEQUENCING"
        color="#d5e4ea"
        background="#243038"
        width={2.3}
        height={0.28}
        position={[11.12, 2.35, 1.4]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      <group position={[-8.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <CautionStripe length={8.5} />
      </group>
      <group position={[8.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <CautionStripe length={8.5} />
      </group>

      <mesh position={[-4.8, 1.15, 6.8]}>
        <cylinderGeometry args={[0.03, 0.03, 2.3, 8]} />
        <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[-4.8, 2.25, 6.8]}>
        <boxGeometry args={[0.18, 0.22, 0.08]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.4} />
      </mesh>
      <mesh position={[-4.8, 1.85, 6.95]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshPhysicalMaterial color={GLASS} roughness={0.1} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}
