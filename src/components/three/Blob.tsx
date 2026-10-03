"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/sceneStore";

const PARTICLES = 2200;

// Ashima 3D simplex noise (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
uniform float uTime;
uniform vec3 uReach;
float blobDisp(vec3 p){
  vec3 n = normalize(p);
  float d = snoise(p*1.25 + vec3(0.0, uTime*0.22, 0.0))*0.28 + snoise(p*2.6 - uTime*0.35)*0.08;
  float r = length(uReach);
  if (r > 0.001) d += pow(max(dot(n, uReach/r), 0.0), 5.0) * r * 0.42;
  return d;
}
vec3 blobPos(vec3 p){ return p + normalize(p) * blobDisp(p); }
`;

const particleVertex = /* glsl */ `
  attribute vec3 aStart;
  attribute float aDelay;
  uniform float uProgress;
  uniform float uSize;
  uniform float uT;
  varying float vAlpha;
  void main() {
    float k = clamp(uProgress * 1.5 - aDelay * 0.5, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 p = mix(aStart, position, k);
    p += 0.02 * vec3(sin(uT + aDelay * 40.0), cos(uT * 1.3 + aDelay * 20.0), 0.0) * (1.0 - k);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 / -mv.z);
    vAlpha = mix(0.9, 0.0, smoothstep(0.75, 1.0, uProgress)) * (0.35 + 0.65 * k);
  }
`;

const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

/**
 * Hero form: a sphere displaced by noise on the GPU, so it costs almost
 * nothing per frame. One side bulges toward the cursor.
 */
export default function Blob({ accent, fg, mobile }: { accent: THREE.Color; fg: THREE.Color; mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const points = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uReach: { value: new THREE.Vector3() } }), []);
  const reach = useMemo(() => new THREE.Vector3(), []);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: accent.clone().lerp(new THREE.Color("#ffffff"), 0.35),
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0,
    });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${noise}`)
        .replace(
          "#include <beginnormal_vertex>",
          `
          vec3 bp = blobPos(position);
          vec3 tA = normalize(abs(normal.y) < 0.99 ? cross(normal, vec3(0.0, 1.0, 0.0)) : cross(normal, vec3(1.0, 0.0, 0.0)));
          vec3 tB = cross(normal, tA);
          float e = 0.01;
          vec3 objectNormal = normalize(cross(blobPos(position + tA * e) - bp, blobPos(position + tB * e) - bp));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3(tangent.xyz);
          #endif
          `,
        )
        .replace("#include <begin_vertex>", "vec3 transformed = bp;");
    };
    return m;
  }, [accent, uniforms]);

  const particles = useMemo(() => {
    const target = new Float32Array(PARTICLES * 3);
    const start = new Float32Array(PARTICLES * 3);
    const delay = new Float32Array(PARTICLES);
    for (let i = 0; i < PARTICLES; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 0.82;
      target.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
      const R = 2.5 + Math.random() * 3.5;
      start.set([R * Math.sin(ph) * Math.cos(th + 1), R * Math.cos(ph), R * Math.sin(ph) * Math.sin(th + 1)], i * 3);
      delay[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(target, 3));
    geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uProgress: { value: 0 },
        uSize: { value: mobile ? 26 : 34 },
        uT: { value: 0 },
        uColor: { value: fg.clone().lerp(accent, 0.5) },
      },
    });
    return { geo, mat };
  }, [accent, fg, mobile]);

  useEffect(
    () => () => {
      material.dispose();
      particles.geo.dispose();
      particles.mat.dispose();
    },
    [material, particles],
  );

  const { size, viewport } = useThree();
  const reduce = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const visible = scene.heroOut < 0.999;
    g.visible = visible;
    if (!visible) return;

    const t = reduce ? 0 : state.clock.elapsedTime;
    uniforms.uTime.value = t;
    reach.set(scene.pointer.active ? scene.pointer.x : 0, scene.pointer.active ? scene.pointer.y : 0, 0.35);
    if (!scene.pointer.active) reach.set(0, 0, 0);
    uniforms.uReach.value.lerp(reach, 1 - Math.exp(-dt * 2.5));

    const wide = size.width >= 1024;
    const xl = size.width >= 1280;
    const tablet = size.width >= 640;
    g.position.x = wide ? viewport.width * (xl ? 0.2 : 0.26) : 0;
    g.position.y = (wide ? 0.05 : tablet ? -0.95 : -1.45) + scene.heroOut * 6;
    g.scale.setScalar((xl ? 1.25 : wide ? 1.05 : tablet ? 0.95 : 0.78) * (0.9 + 0.1 * scene.assemble));

    const m = mesh.current!;
    m.rotation.y = THREE.MathUtils.damp(m.rotation.y, t * 0.15 + scene.pointer.x * 0.3, 2, dt);
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, -scene.pointer.y * 0.2 + scene.heroOut, 2, dt);

    const opacity = THREE.MathUtils.smoothstep(scene.assemble, 0.55, 0.95);
    material.opacity = opacity;
    material.transparent = opacity < 0.999;
    material.depthWrite = opacity > 0.5;

    points.current!.visible = scene.assemble < 1;
    particles.mat.uniforms.uProgress.value = scene.assemble;
    particles.mat.uniforms.uT.value = state.clock.elapsedTime;
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} material={material}>
        <icosahedronGeometry args={[0.82, mobile ? 20 : 32]} />
      </mesh>
      <points ref={points} geometry={particles.geo} material={particles.mat} frustumCulled={false} />
    </group>
  );
}
