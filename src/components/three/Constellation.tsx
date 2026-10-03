"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/sceneStore";

const DOCS = 340;
const RETRIEVED = 7;

/**
 * The office LLM as a scene: a core model surrounded by a cloud of indexed
 * documents. Every beat, a query retrieves a handful of them.
 */
export default function Constellation({ accent, fg, muted }: { accent: THREE.Color; fg: THREE.Color; muted: THREE.Color }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const docsRef = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOCS; i++) {
      const y = 1 - (i / (DOCS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const R = 1.9 + (Math.random() - 0.5) * 0.9;
      pts.push(new THREE.Vector3(Math.cos(th) * r * R, y * R * 0.85, Math.sin(th) * r * R));
    }
    // Faint web between neighbours.
    const web: number[] = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
        .filter((o) => o.j > i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      for (const n of near) web.push(p.x, p.y, p.z, pts[n.j].x, pts[n.j].y, pts[n.j].z);
    });
    const webGeo = new THREE.BufferGeometry();
    webGeo.setAttribute("position", new THREE.Float32BufferAttribute(web, 3));

    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RETRIEVED * 6), 3));
    return { pts, webGeo, linkGeo, picked: [] as number[], nextPick: 0, ready: false };
  }, []);

  const mats = useMemo(
    () => ({
      doc: new THREE.MeshStandardMaterial({ color: muted, roughness: 0.4, metalness: 0.2 }),
      web: new THREE.LineBasicMaterial({ color: muted, transparent: true, opacity: 0.1 }),
      link: new THREE.LineBasicMaterial({ color: accent.clone().multiplyScalar(2), transparent: true, opacity: 0, toneMapped: false }),
      core: new THREE.MeshPhysicalMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.55,
        roughness: 0.35,
        metalness: 0.3,
        flatShading: true,
      }),
      shell: new THREE.MeshBasicMaterial({ color: fg, wireframe: true, transparent: true, opacity: 0.18 }),
    }),
    [accent, fg, muted],
  );

  const tmp = useMemo(() => new THREE.Object3D(), []);
  const hot = useMemo(() => accent.clone().multiplyScalar(2.4), [accent]);
  const { viewport, size } = useThree();

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const presence = scene.llm * (1 - scene.llmOut);
    g.visible = presence > 0.001;
    if (!g.visible) return;

    const wide = size.width >= 1024;
    g.position.set(wide ? viewport.width * 0.24 : 0, -7 * (1 - scene.llm) + 7 * scene.llmOut, -3);
    g.scale.setScalar((wide ? 1 : 0.7) * (0.75 + 0.25 * presence));

    const inn = inner.current!;
    inn.rotation.y += dt * 0.08;
    inn.rotation.x = THREE.MathUtils.damp(inn.rotation.x, -scene.pointer.y * 0.25, 2, dt);
    inn.rotation.z = THREE.MathUtils.damp(inn.rotation.z, scene.pointer.x * 0.15, 2, dt);
    core.current!.scale.setScalar(1 + Math.sin(t * 2.2) * 0.04);

    // A new query every 1.4s pulls a few documents into context. Instances are
    // only rewritten then, not every frame.
    if (t > data.nextPick) {
      data.nextPick = t + 1.4;
      const docs = docsRef.current!;
      const prev = data.picked;
      data.picked = Array.from({ length: RETRIEVED }, () => Math.floor(Math.random() * DOCS));
      const pos = data.linkGeo.getAttribute("position") as THREE.BufferAttribute;
      const write = (idx: number, isHot: boolean) => {
        tmp.position.copy(data.pts[idx]);
        tmp.scale.setScalar(isHot ? 1.9 : 1);
        tmp.updateMatrix();
        docs.setMatrixAt(idx, tmp.matrix);
        docs.setColorAt(idx, isHot ? hot : muted);
      };
      if (!data.ready) {
        for (let i = 0; i < DOCS; i++) write(i, false);
        data.ready = true;
      }
      prev.forEach((idx) => write(idx, false));
      data.picked.forEach((idx, k) => {
        const p = data.pts[idx];
        pos.setXYZ(k * 2, 0, 0, 0);
        pos.setXYZ(k * 2 + 1, p.x, p.y, p.z);
        write(idx, true);
      });
      pos.needsUpdate = true;
      docs.instanceMatrix.needsUpdate = true;
      if (docs.instanceColor) docs.instanceColor.needsUpdate = true;
    }
    const phase = 1 - (data.nextPick - t) / 1.4;
    mats.link.opacity = Math.sin(Math.min(1, phase) * Math.PI) * 0.85;
  });

  return (
    <group ref={group} visible={false}>
      <group ref={inner}>
        <mesh ref={core} material={mats.core}>
          <icosahedronGeometry args={[0.3, 1]} />
        </mesh>
        <mesh material={mats.shell}>
          <icosahedronGeometry args={[0.6, 1]} />
        </mesh>
        <instancedMesh ref={docsRef} args={[undefined, mats.doc, DOCS]}>
          <octahedronGeometry args={[0.04, 0]} />
        </instancedMesh>
        <lineSegments geometry={data.webGeo} material={mats.web} />
        <lineSegments geometry={data.linkGeo} material={mats.link} />
      </group>
    </group>
  );
}
