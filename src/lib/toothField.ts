/**
 * Signed-distance molar, sampled once onto a grid for three's MarchingCubes.
 * Crown and roots are one smooth surface. Sampling yields between slices so
 * the page never stalls.
 */

type V3 = [number, number, number];

export const EXTENT = 1.35;
export const Y_OFFSET = -0.18;
const SHARP = 6;

const CROWN: V3 = [0.56, 0.26, 0.48];
const CUSPS: [number, number, number, number][] = [
  [0.27, 0.52, 0.24, 0.25],
  [-0.27, 0.5, 0.25, 0.24],
  [0.28, 0.48, -0.24, 0.23],
  [-0.26, 0.5, -0.24, 0.25],
];
const ROOTS: { top: V3; tip: V3; r0: number; r1: number }[] = [
  { top: [0.28, -0.05, 0], tip: [0.42, -1.05, 0.02], r0: 0.24, r1: 0.06 },
  { top: [-0.28, -0.05, 0], tip: [-0.36, -1.0, -0.02], r0: 0.24, r1: 0.06 },
];

const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

function sdRoundBox(px: number, py: number, pz: number, b: V3, r: number) {
  const qx = Math.abs(px) - b[0] + r;
  const qy = Math.abs(py) - b[1] + r;
  const qz = Math.abs(pz) - b[2] + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}

function sdTaper(px: number, py: number, pz: number, a: V3, b: V3, r0: number, r1: number) {
  const bax = b[0] - a[0];
  const bay = b[1] - a[1];
  const baz = b[2] - a[2];
  const pax = px - a[0];
  const pay = py - a[1];
  const paz = pz - a[2];
  const t = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)));
  return Math.hypot(pax - bax * t, pay - bay * t, paz - baz * t) - (r0 + (r1 - r0) * t);
}

function sample(x: number, y: number, z: number) {
  let crown = sdRoundBox(x, y - 0.24, z, CROWN, 0.2);
  for (const [cx, cy, cz, r] of CUSPS) crown = smin(crown, Math.hypot(x - cx, y - cy, z - cz) - r, 0.18);
  // Central fissure between the cusps.
  crown = Math.max(crown, -(Math.hypot(x * 0.9, (y - 0.78) * 1.6, z * 0.9) - 0.16));

  let roots = sdRoundBox(x, y + 0.02, z, [CROWN[0] * 0.82, 0.14, CROWN[2] * 0.8], 0.12);
  for (const r of ROOTS) roots = smin(roots, sdTaper(x, y, z, r.top, r.tip, r.r0, r.r1), 0.2);

  return smin(crown, roots, 0.12);
}

export async function buildToothField(field: Float32Array, res: number) {
  const half = res / 2;
  const coord = new Float32Array(res);
  for (let i = 0; i < res; i++) coord[i] = ((i - half) / half) * EXTENT;
  const idle = () =>
    new Promise<void>((r) =>
      "requestIdleCallback" in window ? requestIdleCallback(() => r(), { timeout: 100 }) : setTimeout(r, 0),
    );
  let q = 0;
  for (let k = 0; k < res; k++) {
    for (let j = 0; j < res; j++) {
      const y = coord[j] - Y_OFFSET;
      for (let i = 0; i < res; i++, q++) field[q] = 0.5 - sample(coord[i], y, coord[k]) * SHARP;
    }
    if (k % 8 === 7) await idle();
  }
}
