import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Deal, PlayerHand } from '../game/types';
import { flattenDealSequence } from '../game/dealOrder';
import { CardMesh, dealDurationSeconds } from './CardMesh';
import { DuelStation } from './DuelStation';
import { LabEnvironment } from './LabEnvironment';
import { getSeatPoses, getTableSpots, ROOM_FOCUS, TABLE_TOP_Y } from './layout';
import { DealerPodium } from './PlayerTable';

type TableSceneProps = {
  deal: Deal;
  dealKey: number;
  onDealComplete: () => void;
};

export function TableScene({ deal, dealKey, onDealComplete }: TableSceneProps) {
  const seats = getSeatPoses(deal.players.length);
  const tables = getTableSpots(deal.players.length);
  const sequence = flattenDealSequence(deal);
  const [focus, setFocus] = useState<[number, number, number]>(ROOM_FOCUS);

  const byTable = useMemo(() => {
    const groups = new Map<number, { seat: (typeof seats)[number]; player: PlayerHand }[]>();
    deal.players.forEach((player, index) => {
      const seat = seats[index];
      if (!seat) {
        return;
      }
      const list = groups.get(seat.tableId) ?? [];
      list.push({ seat, player });
      groups.set(seat.tableId, list);
    });
    return groups;
  }, [deal.players, seats]);

  return (
    <>
      <color attach="background" args={['#4a5552']} />
      <fog attach="fog" args={['#4a5552', 32, 52]} />
      <hemisphereLight args={['#e6f0ea', '#5a6662', 0.55]} />
      <ambientLight intensity={0.48} />
      <directionalLight position={[6, 9, 4]} intensity={1.05} color="#f2f7f3" />
      <directionalLight position={[-6, 4, -4]} intensity={0.38} color="#9bb0a8" />
      <spotLight position={[0, 6.6, 0]} angle={0.95} penumbra={0.8} intensity={0.7} color="#e8f2ec" />

      <LabEnvironment />
      <group
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => {
          event.stopPropagation();
          setFocus(ROOM_FOCUS);
        }}
      >
        <DealerPodium />
      </group>

      {tables.map((table) => (
        <DuelStation
          key={table.id}
          table={table}
          seats={byTable.get(table.id) ?? []}
          onFocus={() => setFocus([table.position[0], TABLE_TOP_Y, table.position[2]])}
        />
      ))}

      <group key={dealKey}>
        <DealPlayback cards={sequence} seats={seats} onComplete={onDealComplete} />
      </group>

      <ContactShadows position={[0, 0.012, 0]} opacity={0.45} scale={30} blur={2.8} far={10} />
      <FocusControls focus={focus} />
    </>
  );
}

function FocusControls({ focus }: { focus: [number, number, number] }) {
  const ref = useRef<OrbitControlsImpl>(null);
  const desired = useRef(new Vector3(...focus));
  desired.current.set(...focus);

  useLayoutEffect(() => {
    ref.current?.target.set(...ROOM_FOCUS);
  }, []);

  useFrame(() => {
    const controls = ref.current;
    if (!controls) {
      return;
    }
    controls.target.lerp(desired.current, 0.09);
    controls.update();
  });

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={2.3}
      maxDistance={24}
      minPolarAngle={0.28}
      maxPolarAngle={Math.PI / 2.18}
    />
  );
}

function DealPlayback({
  cards,
  seats,
  onComplete,
}: {
  cards: ReturnType<typeof flattenDealSequence>;
  seats: ReturnType<typeof getSeatPoses>;
  onComplete: () => void;
}) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  useFrame(({ clock }) => {
    if (startTime === null) {
      setStartTime(clock.elapsedTime);
      return;
    }
    if (!finished && clock.elapsedTime - startTime >= dealDurationSeconds(cards.length)) {
      setFinished(true);
      onComplete();
    }
  });

  if (startTime === null) {
    return null;
  }

  return (
    <>
      {cards.map((dealt) => {
        const seat = seats[dealt.playerIndex];
        if (!seat) {
          return null;
        }
        return <CardMesh key={dealt.card.id} dealt={dealt} seat={seat} startTime={startTime} />;
      })}
    </>
  );
}
