"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A card that tilts toward the cursor in 3D. Children with `data-depth`
 * float above the card surface by that many pixels, and a light follows the
 * cursor across the face and border.
 */
export default function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current!;
      if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rx = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" });
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", el);
      layers.forEach((l) => gsap.set(l, { z: Number(l.dataset.depth) || 0 }));

      const move = contextSafe!((e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 14);
        rx(-(py - 0.5) * 12);
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        el.style.setProperty("--glow-o", "1");
      });
      const leave = contextSafe!(() => {
        rx(0);
        ry(0);
        el.style.setProperty("--glow-o", "0");
      });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`glow-card [transform-style:preserve-3d] ${className}`}>
      {children}
    </div>
  );
}
