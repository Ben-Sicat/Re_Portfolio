"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 900;

const vertex = /* glsl */ `
  attribute float aDepth;
  uniform float uScroll;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    // Nearer particles move faster with the page: depth you can feel.
    p.y = mod(p.y + uScroll * (0.4 + aDepth * 1.6) + 12.0, 24.0) - 12.0;
    p.x += sin(uTime * 0.2 + aDepth * 30.0) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.4 + aDepth) * (1.0 / -mv.z);
    vAlpha = 0.18 + aDepth * 0.5;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export default function Dust({ color }: { color: THREE.Color }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { geo, uniforms } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const depth = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const d = Math.random();
      pos.set([(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 24, -8 + d * 9], i * 3);
      depth[i] = d;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aDepth", new THREE.BufferAttribute(depth, 1));
    return {
      geo,
      uniforms: {
        uScroll: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 22 },
        uColor: { value: color },
      },
    };
  }, [color]);

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uScroll.value = window.scrollY / window.innerHeight;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
