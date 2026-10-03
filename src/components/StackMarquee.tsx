"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { stackRows } from "@/lib/content";

/** Two rows of tools that drift sideways and flip direction with the scroll. */
export default function StackMarquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>(".marquee-track");
      const tweens = rows.map((row, i) =>
        gsap.fromTo(
          row,
          { xPercent: i % 2 ? -50 : 0 },
          { xPercent: i % 2 ? 0 : -50, duration: 38, ease: "none", repeat: -1 },
        ),
      );

      let direction = 1;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== direction) direction = self.direction;
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6);
          tweens.forEach((t) => {
            t.timeScale(direction * boost);
            gsap.to(t, { timeScale: direction, duration: 0.8, ease: "power2.out", overwrite: true });
          });
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Tools I use" className="relative z-10 overflow-hidden py-16 md:py-24">
      {stackRows.map((row, i) => (
        <div key={i} className="flex overflow-hidden">
          <ul className="marquee-track flex shrink-0 flex-wrap gap-x-12 gap-y-2 pr-12 motion-safe:flex-nowrap">
            {[...row, ...row].map((tool, k) => (
              <li
                key={k}
                aria-hidden={k >= row.length}
                className={`font-display text-5xl font-bold tracking-[-0.03em] whitespace-nowrap md:text-7xl ${
                  i % 2 ? "text-fg" : "text-transparent [-webkit-text-stroke:1px_var(--muted)]"
                }`}
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
