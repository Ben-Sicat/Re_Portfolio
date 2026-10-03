"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scene } from "@/lib/sceneStore";
import Blob from "./Blob";
import Constellation from "./Constellation";
import Pcam from "./Pcam";
import ScanModel from "./ScanModel";
import Dust from "./Dust";

type Theme = { accent: THREE.Color; fg: THREE.Color; muted: THREE.Color; light: boolean };

function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const c = (n: string) => new THREE.Color(css.getPropertyValue(n).trim() || "#ffffff");
  return {
    accent: c("--accent"),
    fg: c("--fg"),
    muted: c("--muted"),
    light: matchMedia("(prefers-color-scheme: light)").matches,
  };
}

/** The cursor carries a real light into the scene. */
function CursorLight({ color }: { color: THREE.Color }) {
  const light = useRef<THREE.PointLight>(null);
  const { viewport } = useThree();
  useFrame((_, dt) => {
    const l = light.current;
    if (!l) return;
    const tx = (scene.pointer.x * viewport.width) / 2;
    const ty = (scene.pointer.y * viewport.height) / 2;
    l.position.x = THREE.MathUtils.damp(l.position.x, tx, 6, dt);
    l.position.y = THREE.MathUtils.damp(l.position.y, ty, 6, dt);
    l.intensity = THREE.MathUtils.damp(l.intensity, scene.pointer.active ? 7 : 0, 4, dt);
  });
  return <pointLight ref={light} color={color} position={[0, 0, 2.2]} distance={9} decay={1.6} intensity={0} />;
}

/** Soft studio reflections, generated once from three's built-in room scene. */
function StudioEnv() {
  const { gl, scene: s3 } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    s3.environment = env;
    s3.environmentIntensity = 0.8;
    pmrem.dispose();
    return () => env.dispose();
  }, [gl, s3]);
  return null;
}

/** Drops resolution if frames run slow, raises it again if there is headroom. */
function AdaptiveDpr({ max, onChange }: { max: number; onChange: (d: number) => void }) {
  const acc = useRef({ t: 0, n: 0, dpr: max });
  useFrame((_, dt) => {
    const a = acc.current;
    a.t += dt;
    a.n++;
    if (a.t < 1.5) return;
    const fps = a.n / a.t;
    a.t = 0;
    a.n = 0;
    const next = fps < 45 ? Math.max(0.75, a.dpr - 0.25) : fps > 58 ? Math.min(max, a.dpr + 0.25) : a.dpr;
    if (next !== a.dpr) {
      a.dpr = next;
      onChange(next);
    }
  });
  return null;
}

function CameraRig() {
  useFrame((state, dt) => {
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, scene.pointer.x * 0.35, 2, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, scene.pointer.y * 0.25, 2, dt);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/** Section handoffs, driven by the DOM sections the scene sits behind. */
function useSectionTriggers() {
  useEffect(() => {
    const triggers = [
      gsap.to(scene, {
        heroOut: 1,
        ease: "none",
        scrollTrigger: { trigger: "#mpcam", start: "top 95%", end: "top 25%", scrub: 0.8 },
      }),
      gsap.to(scene, {
        llm: 1,
        ease: "none",
        scrollTrigger: { trigger: "#llm", start: "top 85%", end: "top 15%", scrub: 0.8 },
      }),
      gsap.to(scene, {
        llmOut: 1,
        ease: "none",
        scrollTrigger: { trigger: "#llm", start: "bottom 70%", end: "bottom 5%", scrub: 0.8 },
      }),
      gsap.to(scene, {
        pcam: 1,
        ease: "none",
        scrollTrigger: { trigger: "#mpcam", start: "top 90%", end: "top 20%", scrub: 0.8 },
      }),
      gsap.to(scene, {
        pcamOut: 1,
        ease: "none",
        scrollTrigger: { trigger: "#mpcam", start: "bottom 75%", end: "bottom 10%", scrub: 0.8 },
      }),
      gsap.to(scene, {
        qcIn: 1,
        ease: "none",
        scrollTrigger: { trigger: "#scanqc", start: "top 90%", end: "top 20%", scrub: 0.8 },
      }),
      gsap.to(scene, {
        qcSweep: 1,
        ease: "none",
        scrollTrigger: { trigger: ".qc-stage", start: "top 30%", end: "bottom 75%", scrub: 0.8 },
      }),
      gsap.to(scene, {
        qcOut: 1,
        ease: "none",
        scrollTrigger: { trigger: ".qc-evidence", start: "top 75%", end: "top 15%", scrub: 0.8 },
      }),
    ];
    ScrollTrigger.refresh();
    return () => triggers.forEach((t) => t.scrollTrigger?.kill() ?? t.kill());
  }, []);
}

export default function Scene3D() {
  // This component only ever renders in the browser (loaded with ssr: false).
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [mobile] = useState(() => matchMedia("(max-width: 767px)").matches);
  // Start sharp, and step resolution down if the device can't keep up.
  const maxDpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25);
  const [dpr, setDpr] = useState(maxDpr);
  useSectionTriggers();

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: light)");
    const on = () => setTheme(readTheme());
    mq.addEventListener("change", on);

    const move = (e: PointerEvent) => {
      scene.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      scene.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
      scene.pointer.active = e.pointerType === "mouse";
    };
    const leave = () => (scene.pointer.active = false);
    addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      mq.removeEventListener("change", on);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  const dustColor = useMemo(() => theme.fg.clone(), [theme]);

  return (
    <Canvas
      className="!fixed inset-0 !h-[100lvh] !w-full"
      style={{ pointerEvents: "none", zIndex: 0 }}
      camera={{ position: [0, 0, 7], fov: 35 }}
      dpr={dpr}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <AdaptiveDpr max={maxDpr} onChange={setDpr} />
      <StudioEnv />
      <ambientLight intensity={theme.light ? 0.7 : 0.35} />
      <directionalLight position={[3, 4, 5]} intensity={theme.light ? 1.6 : 1.2} />
      <directionalLight position={[-4, -2, -3]} intensity={0.8} color={theme.accent} />
      <CursorLight color={theme.accent} />

      <CameraRig />
      <Dust color={dustColor} />
      <Blob accent={theme.accent} fg={theme.fg} mobile={mobile} />
      <Pcam accent={theme.accent} fg={theme.fg} muted={theme.muted} mobile={mobile} />
      <Constellation accent={theme.accent} fg={theme.fg} muted={theme.muted} />
      <ScanModel accent={theme.accent} muted={theme.muted} mobile={mobile} />

    </Canvas>
  );
}
