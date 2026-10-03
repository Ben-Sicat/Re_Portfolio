"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/sceneStore";

const PLATE_R = 1.05;
const GRID = 16;
const RAYS = 26;

// Two portions on a plate: a large mound and a smaller side.
function height(x: number, z: number) {
  const a = 0.62 * Math.exp(-((x + 0.28) ** 2 + (z + 0.05) ** 2) / 0.17);
  const b = 0.36 * Math.exp(-((x - 0.48) ** 2 + (z - 0.18) ** 2) / 0.07);
  return { h: a + b, cls: a >= b ? 0 : 1 };
}

const pointVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aFood;
  uniform float uSize;
  uniform float uSeg;
  uniform vec3 uBase;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 / -mv.z) * (aFood > 0.5 ? 1.0 : 0.7);
    vColor = mix(uBase, aColor, uSeg * aFood);
    vAlpha = aFood > 0.5 ? 0.95 : 0.4;
  }
`;

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.15, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

/**
 * M-PCAM as a scene: a pinhole camera over a plate. Scroll segments the food,
 * casts depth rays, then integrates height columns into a volume.
 */
export default function Pcam({ accent, fg, muted, mobile }: { accent: THREE.Color; fg: THREE.Color; muted: THREE.Color; mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const columnsRef = useRef<THREE.InstancedMesh>(null);
  const teal = useMemo(() => new THREE.Color("#6fd3c6"), []);

  const data = useMemo(() => {
    // Surface points: dense on food, sparse on the plate.
    const pos: number[] = [];
    const col: number[] = [];
    const food: number[] = [];
    const foodPts: THREE.Vector3[] = [];
    const n = mobile ? 3200 : 5200;
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(Math.random()) * PLATE_R;
      const th = Math.random() * Math.PI * 2;
      const x = Math.cos(th) * r;
      const z = Math.sin(th) * r;
      const { h, cls } = height(x, z);
      const isFood = h > 0.05;
      if (!isFood && Math.random() > 0.35) continue;
      pos.push(x, isFood ? h : 0, z);
      const c = cls === 0 ? accent : teal;
      col.push(c.r, c.g, c.b);
      food.push(isFood ? 1 : 0);
      if (isFood && foodPts.length < 400) foodPts.push(new THREE.Vector3(x, h, z));
    }
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    pointsGeo.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
    pointsGeo.setAttribute("aFood", new THREE.Float32BufferAttribute(food, 1));

    // Height columns: the volume integral, one column per grid cell.
    const cells: { x: number; z: number; h: number }[] = [];
    const step = (PLATE_R * 2) / GRID;
    for (let i = 0; i < GRID; i++)
      for (let j = 0; j < GRID; j++) {
        const x = -PLATE_R + step * (i + 0.5);
        const z = -PLATE_R + step * (j + 0.5);
        const { h } = height(x, z);
        if (h > 0.05 && x * x + z * z < PLATE_R * PLATE_R) cells.push({ x, z, h });
      }

    // Pinhole camera: apex, image plane, and rays to sampled surface points.
    const apex = new THREE.Vector3(-0.2, 1.75, 1.35);
    const dir = new THREE.Vector3().sub(apex).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const camUp = new THREE.Vector3().crossVectors(right, dir).normalize();
    const center = apex.clone().addScaledVector(dir, 0.55);
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([a, b]) => center.clone().addScaledVector(right, a * 0.34).addScaledVector(camUp, b * 0.25));
    const frustum: number[] = [];
    corners.forEach((c, k) => {
      frustum.push(apex.x, apex.y, apex.z, c.x, c.y, c.z);
      const d = corners[(k + 1) % 4];
      frustum.push(c.x, c.y, c.z, d.x, d.y, d.z);
    });
    const frustumGeo = new THREE.BufferGeometry();
    frustumGeo.setAttribute("position", new THREE.Float32BufferAttribute(frustum, 3));

    const rays: number[] = [];
    for (let k = 0; k < RAYS; k++) {
      const p = foodPts[Math.floor((k / RAYS) * foodPts.length)] ?? new THREE.Vector3();
      rays.push(apex.x, apex.y, apex.z, p.x, p.y, p.z);
    }
    const raysGeo = new THREE.BufferGeometry();
    raysGeo.setAttribute("position", new THREE.Float32BufferAttribute(rays, 3));

    return { pointsGeo, cells, step, frustumGeo, raysGeo, lastGrow: -1 };
  }, [accent, teal, mobile]);

  const mats = useMemo(
    () => ({
      points: new THREE.ShaderMaterial({
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        uniforms: { uSize: { value: mobile ? 22 : 28 }, uSeg: { value: 0 }, uBase: { value: fg.clone() } },
      }),
      plate: new THREE.MeshBasicMaterial({ color: muted, transparent: true, opacity: 0.5 }),
      frustum: new THREE.LineBasicMaterial({ color: fg, transparent: true, opacity: 0.55 }),
      rays: new THREE.LineBasicMaterial({ color: accent.clone().multiplyScalar(1.8), transparent: true, opacity: 0, toneMapped: false }),
      column: new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.55,
        roughness: 0.4,
      }),
    }),
    [accent, fg, muted, mobile],
  );

  const tmp = useMemo(() => new THREE.Object3D(), []);
  const { viewport, size } = useThree();

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const presence = scene.pcam * (1 - scene.pcamOut);
    g.visible = presence > 0.001;
    if (!g.visible) return;

    const wide = size.width >= 1024;
    g.position.set(wide ? -viewport.width * 0.2 : 0, -7 * (1 - scene.pcam) + 7 * scene.pcamOut + (wide ? -0.3 : -1.1), 0);
    g.scale.setScalar(wide ? 1.15 : size.width >= 640 ? 1 : 0.82);

    const inn = inner.current!;
    inn.rotation.y = THREE.MathUtils.damp(inn.rotation.y, state.clock.elapsedTime * 0.12 + scene.pointer.x * 0.4, 2, dt);
    inn.rotation.x = THREE.MathUtils.damp(inn.rotation.x, 0.35 - scene.pointer.y * 0.15, 2, dt);

    mats.points.uniforms.uSeg.value = scene.pcamSeg;
    mats.rays.opacity = scene.pcamDepth * (0.5 + 0.3 * Math.sin(state.clock.elapsedTime * 3));
    mats.frustum.opacity = 0.25 + 0.4 * scene.pcamDepth;

    const cols = columnsRef.current!;
    const grow = scene.pcamVol;
    mats.column.opacity = 0.55 * Math.min(1, grow * 3);
    cols.visible = grow > 0.001;
    // Only rewrite the columns while the volume step is actually changing.
    if (grow === data.lastGrow) return;
    data.lastGrow = grow;
    data.cells.forEach((c, i) => {
      // Columns rise in a sweep from one side of the plate to the other.
      const local = THREE.MathUtils.clamp(grow * 1.6 - ((c.x + PLATE_R) / (2 * PLATE_R)) * 0.6, 0, 1);
      const h = Math.max(0.0001, c.h * local);
      tmp.position.set(c.x, h / 2, c.z);
      tmp.scale.set(data.step * 0.86, h, data.step * 0.86);
      tmp.updateMatrix();
      cols.setMatrixAt(i, tmp.matrix);
    });
    cols.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} visible={false}>
      <group ref={inner}>
        <mesh rotation-x={-Math.PI / 2} position-y={-0.005} material={mats.plate}>
          <ringGeometry args={[PLATE_R, PLATE_R + 0.025, 96]} />
        </mesh>
        <points geometry={data.pointsGeo} material={mats.points} frustumCulled={false} />
        <instancedMesh ref={columnsRef} args={[undefined, mats.column, data.cells.length]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
        </instancedMesh>
        <lineSegments geometry={data.frustumGeo} material={mats.frustum} />
        <lineSegments geometry={data.raysGeo} material={mats.rays} />
      </group>
    </group>
  );
}
