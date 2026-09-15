export const TABLE_HEIGHT = 0.9;
export const TABLE_TOP_Y = TABLE_HEIGHT;
export const STATION_LENGTH = 1.62;
export const STATION_DEPTH = 1.32;
export const CARD_WIDTH = 0.36;
export const CARD_HEIGHT = 0.504;
export const CARD_THICKNESS = 0.01;
export const CARD_CORNER = 0.038;
export const DEAL_STAGGER = 0.048;
export const DEAL_DURATION = 0.78;
export const PLAYER_STAND_Z = -(STATION_DEPTH / 2 + 0.38);

export const ROOM_FOCUS: [number, number, number] = [0, 0.86, 0];

export type TableSpot = {
  id: number;
  position: [number, number, number];
  yaw: number;
};

export type SeatPose = {
  tableId: number;
  position: [number, number, number];
  yaw: number;
  side: 'a' | 'b';
};

type SpotDraft = { x: number; z: number; yaw: number };

const TABLE_SPOTS: SpotDraft[] = [
  { x: -3.15, z: 2.05, yaw: 0.42 },
  { x: 3.55, z: 2.35, yaw: -0.58 },
  { x: -3.85, z: -2.55, yaw: 1.18 },
  { x: 4.15, z: -1.85, yaw: -1.72 },
  { x: -0.85, z: 4.55, yaw: 0.12 },
  { x: 1.45, z: -4.65, yaw: 2.55 },
  { x: -5.75, z: 0.15, yaw: 1.62 },
  { x: 5.55, z: 0.45, yaw: -1.28 },
];

export function getTableSpots(playerCount: number): TableSpot[] {
  const tableCount = Math.max(1, Math.ceil(playerCount / 2));
  return TABLE_SPOTS.slice(0, tableCount).map((spot, id) => ({
    id,
    position: [spot.x, 0, spot.z],
    yaw: spot.yaw,
  }));
}

export function getSeatPoses(playerCount: number): SeatPose[] {
  const tables = getTableSpots(playerCount);
  return Array.from({ length: playerCount }, (_, index) => {
    const table = tables[Math.floor(index / 2)] ?? tables[0];
    const side: 'a' | 'b' = index % 2 === 0 ? 'a' : 'b';
    return {
      tableId: table.id,
      position: table.position,
      yaw: table.yaw + (side === 'b' ? Math.PI : 0),
      side,
    };
  });
}

export function fanOffset(slotIndex: number, slotCount: number): {
  x: number;
  y: number;
  z: number;
  tilt: number;
} {
  const mid = (slotCount - 1) / 2;
  const spread = slotCount > 8 ? 0.1 : 0.112;
  return {
    x: (slotIndex - mid) * spread,
    y: TABLE_TOP_Y + 0.012 + slotIndex * 0.0012,
    z: 0.26,
    tilt: (slotIndex - mid) * 0.032,
  };
}

export const DECK_POSITION: [number, number, number] = [0, TABLE_TOP_Y + 0.14, 0];
