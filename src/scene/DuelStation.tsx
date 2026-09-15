import type { PlayerHand } from '../game/types';
import { playerHasKind } from '../game/deal';
import { LabelPlane } from './LabelPlane';
import { PLAYER_STAND_Z, type SeatPose, type TableSpot } from './layout';
import { PlayerStool, PlayerTable } from './PlayerTable';

type DuelStationProps = {
  table: TableSpot;
  seats: { seat: SeatPose; player: PlayerHand }[];
  onFocus: () => void;
};

function badgeColor(player: PlayerHand): string {
  if (playerHasKind(player, 'zombie')) {
    return '#7be15a';
  }
  if (playerHasKind(player, 'vaccine')) {
    return '#5ad4ea';
  }
  return '#9aa6b2';
}

export function DuelStation({ table, seats, onFocus }: DuelStationProps) {
  return (
    <group position={table.position} rotation={[0, table.yaw, 0]}>
      <PlayerTable onFocus={onFocus} />
      {seats.map(({ seat, player }) => {
        const standZ = seat.side === 'a' ? PLAYER_STAND_Z : -PLAYER_STAND_Z;
        const yaw = seat.side === 'a' ? 0 : Math.PI;
        return (
          <group key={player.id} position={[0, 0, standZ]} rotation={[0, yaw, 0]}>
            <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.22, 28]} />
              <meshStandardMaterial
                color={badgeColor(player)}
                emissive={badgeColor(player)}
                emissiveIntensity={0.22}
              />
            </mesh>
            <PlayerStool />
            <LabelPlane
              text={player.displayName.toUpperCase()}
              color="#e8eef2"
              background="#1b242b"
              width={0.86}
              height={0.18}
              position={[0, 0.82, 0]}
              rotation={[0, Math.PI, 0]}
            />
          </group>
        );
      })}
    </group>
  );
}
