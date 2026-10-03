"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { buildToothField, EXTENT, Y_OFFSET } from "@/lib/toothField";
import { scene } from "@/lib/sceneStore";

// Spots on the crown that the check flags.
const FLAGS: [number, number, number][] = [
  [0.32, 0.62, 0.3],
  [-0.38, 0.38, 0.44],
  [0.1, 0.12, 0.55],
];

/**
 * Scan QC as a scene: a glossy molar. As the section scrolls, a region of
 * interest is drawn around it, a scan ring sweeps the surface, and flagged
 * spots pulse. The mesh is built once in idle time and never rebuilt.
 */
export default function ScanModel({ accent, mobile }: { accent: THREE.Color; muted: THREE.Color; mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const [ready, setReady] = useState(false);
  const res = mobile ? 44 : 60;

  const enamel = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f4f1f8",
        roughness: 0.22,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        sheen: 0.4,
        sheenColor: new THREE.Color("#e4dcff"),
      }),
    [],
  );

  const mc = useMemo(() => {
    const m = new MarchingCubes(res, enamel, false, false, 60000);
    m.isolation = 0.5;
    m.scale.setScalar(EXTENT);
    m.position.y = -Y_OFFSET;
    m.visible = false;
    return m;
  }, [res, enamel]);

  useEffect(() => {
    let cancelled = false;
    const start = setTimeout(async () => {
      await buildToothField(mc.field, res);
      if (cancelled) return;
      mc.update();
      mc.visible = true;
      setReady(true);
    }, 1000);
    return () => {
      cancelled = true;
      clearTimeout(start);
      mc.geometry.dispose();
    };
  }, [mc, res]);

  const extras = useMemo(() => {
    const roi = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 129 }, (_, i) => {
          const a = (i / 128) * Math.PI * 2 + Math.PI / 2;
          return new THREE.Vector3(Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0);
        }),
      ),
      new THREE.LineBasicMaterial({ color: accent.clone().multiplyScalar(1.8), toneMapped: false }),
    );
    return {
      roi,
      sweepMat: new THREE.MeshBasicMaterial({ color: accent.clone().multiplyScalar(2.2), transparent: true, opacity: 0, toneMapped: false }),
      flagMat: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff6b8a").multiplyScalar(2.2), transparent: true, opacity: 0, toneMapped: false }),
    };
  }, [accent]);

  const { viewport, size } = useThree();

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const presence = scene.qcIn * (1 - scene.qcOut);
    g.visible = presence > 0.001 && ready;
    if (!g.visible) return;

    const wide = size.width >= 1024;
    g.position.set(wide ? viewport.width * 0.22 : 0, -6 * (1 - scene.qcIn) + 6 * scene.qcOut + (wide ? 0 : size.width >= 640 ? -1.1 : -1.45), 0);
    g.scale.setScalar(wide ? (size.width >= 1280 ? 1.1 : 0.95) : size.width >= 640 ? 0.85 : 0.6);

    const t = state.clock.elapsedTime;
    const s = scene.qcSweep;
    const sp = spin.current!;
    sp.rotation.y = THREE.MathUtils.damp(sp.rotation.y, t * 0.25 + s * Math.PI + scene.pointer.x * 0.35, 3, dt);
    sp.rotation.x = THREE.MathUtils.damp(sp.rotation.x, 0.28 - scene.pointer.y * 0.2, 3, dt);

    // 1. The region of interest draws itself around the tooth.
    extras.roi.geometry.setDrawRange(0, Math.floor(THREE.MathUtils.smoothstep(s, 0.05, 0.35) * 129));
    // 2. A scan ring sweeps the surface.
    const active = THREE.MathUtils.smoothstep(s, 0.3, 0.45) * (1 - THREE.MathUtils.smoothstep(s, 0.9, 1));
    const phase = (t * 0.45) % 1;
    sweep.current!.position.y = 0.95 - phase * 2.2;
    extras.sweepMat.opacity = active * 0.9 * Math.sin(phase * Math.PI);
    // 3. Flagged spots pulse once the check has scored the case.
    extras.flagMat.opacity = THREE.MathUtils.smoothstep(s, 0.6, 0.8) * (0.55 + 0.45 * Math.sin(t * 4));
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={extras.roi} />
      <group ref={spin}>
        <primitive object={mc} />
        <mesh ref={sweep} rotation={[Math.PI / 2, 0, 0]} material={extras.sweepMat}>
          <torusGeometry args={[0.95, 0.008, 8, 96]} />
        </mesh>
        {FLAGS.map((f, i) => (
          <mesh key={i} position={f} material={extras.flagMat}>
            <sphereGeometry args={[0.055, 16, 16]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
