import { BufferAttribute, ExtrudeGeometry, Shape, Vector3 } from 'three';
import { CARD_CORNER, CARD_HEIGHT, CARD_THICKNESS, CARD_WIDTH } from './layout';

function roundedRect(width: number, height: number, radius: number): Shape {
  const shape = new Shape();
  const x0 = -width / 2;
  const y0 = -height / 2;
  const x1 = width / 2;
  const y1 = height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x0 + r, y0);
  shape.lineTo(x1 - r, y0);
  shape.quadraticCurveTo(x1, y0, x1, y0 + r);
  shape.lineTo(x1, y1 - r);
  shape.quadraticCurveTo(x1, y1, x1 - r, y1);
  shape.lineTo(x0 + r, y1);
  shape.quadraticCurveTo(x0, y1, x0, y1 - r);
  shape.lineTo(x0, y0 + r);
  shape.quadraticCurveTo(x0, y0, x0 + r, y0);
  return shape;
}

function applyCardUVs(geometry: ExtrudeGeometry): void {
  const position = geometry.attributes.position;
  const uvs = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i += 1) {
    uvs[i * 2] = (position.getX(i) + CARD_WIDTH / 2) / CARD_WIDTH;
    uvs[i * 2 + 1] = (position.getY(i) + CARD_HEIGHT / 2) / CARD_HEIGHT;
  }
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
}

function assignCardGroups(geometry: ExtrudeGeometry): void {
  const position = geometry.attributes.position;
  const face: number[] = [];
  const back: number[] = [];
  const edge: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const ab = new Vector3();
  const cb = new Vector3();

  const pushTriangle = (dest: number[], i: number) => {
    dest.push(i, i + 1, i + 2);
  };

  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i);
    b.fromBufferAttribute(position, i + 1);
    c.fromBufferAttribute(position, i + 2);
    ab.subVectors(b, a);
    const nz = cb.subVectors(c, a).cross(ab).normalize().z;
    if (nz > 0.55) {
      pushTriangle(face, i);
    } else if (nz < -0.55) {
      pushTriangle(back, i);
    } else {
      pushTriangle(edge, i);
    }
  }

  geometry.setIndex([...face, ...back, ...edge]);
  geometry.clearGroups();
  geometry.addGroup(0, face.length, 0);
  geometry.addGroup(face.length, back.length, 1);
  geometry.addGroup(face.length + back.length, edge.length, 2);
}

let shared: ExtrudeGeometry | null = null;

export function getCardGeometry(): ExtrudeGeometry {
  if (shared) {
    return shared;
  }
  const geometry = new ExtrudeGeometry(roundedRect(CARD_WIDTH, CARD_HEIGHT, CARD_CORNER), {
    depth: CARD_THICKNESS,
    bevelEnabled: false,
    curveSegments: 10,
    steps: 1,
  });
  geometry.translate(0, 0, -CARD_THICKNESS / 2);
  geometry.computeVertexNormals();
  applyCardUVs(geometry);
  assignCardGroups(geometry);
  shared = geometry;
  return geometry;
}
