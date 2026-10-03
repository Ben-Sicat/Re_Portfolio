"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Soft light that trails the mouse. Hidden on touch screens. */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;

    const toX = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      el.dataset.on = "true";
      toX(e.clientX);
      toY(e.clientY);
    };
    const leave = () => (el.dataset.on = "false");

    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  });

  return (
    <>
      <div ref={ref} className="spotlight" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}
