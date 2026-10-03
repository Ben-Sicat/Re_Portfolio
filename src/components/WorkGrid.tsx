"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { projects } from "@/lib/content";
import TiltCard from "./TiltCard";

// Two columns on tablets; an offset 7/5 then 5/7 rhythm on desktop.
// Tablets: pairs, with the last card full width. Desktop: 7/5, then 5/3/4.
const spans = [
  "md:col-span-6 lg:col-span-7",
  "md:col-span-6 lg:col-span-5",
  "md:col-span-6 lg:col-span-5",
  "md:col-span-6 lg:col-span-3",
  "md:col-span-12 lg:col-span-4",
];
const surfaces = [
  "bg-[linear-gradient(135deg,rgb(var(--glow)/0.2),transparent_55%)] bg-surface/95",
  "dot-grid bg-surface/95",
  "bg-surface-2/95",
  "bg-surface/95",
  "bg-[linear-gradient(200deg,rgb(var(--glow)/0.14),transparent_50%)] bg-surface/95",
];

export default function WorkGrid() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>(".work-wrap");

      // Cards swing up from below the page plane, and fold back when you scroll up past them.
      gsap.set(cards, { autoAlpha: 0, y: 120, rotateX: 40, z: -120 });
      ScrollTrigger.batch(cards, {
        start: "top 92%",
        onEnter: (els) =>
          gsap.to(els, { autoAlpha: 1, y: 0, rotateX: 0, z: 0, stagger: 0.1, duration: 1.1, ease: "power3.out", overwrite: true }),
        onLeaveBack: (els) =>
          gsap.to(els, { autoAlpha: 0, y: 120, rotateX: 40, z: -120, stagger: 0.05, duration: 0.6, ease: "power2.in", overwrite: true }),
      });

      gsap.from(".work-title", {
        xPercent: -8,
        autoAlpha: 0,
        ease: "power3.out",
        scrollTrigger: { trigger: ".work-title", start: "top 88%", end: "top 55%", scrub: 0.6 },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="projects" className="relative z-10 mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <h2 className="work-title max-w-[18ch] font-display text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-6xl">
        Systems I&apos;ve shipped.
      </h2>
      <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">
        Most of this is proprietary, so there&apos;s no public code. Here is what each one does and how it&apos;s
        built.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-4 [perspective:1600px] md:grid-cols-12 lg:gap-5">
        {projects.map((p, i) => (
          <div key={p.title} className={`work-wrap ${spans[i]}`}>
            <TiltCard
              className={`flex h-full min-h-[300px] flex-col rounded-[20px] border border-line p-6 sm:p-7 lg:p-9 ${surfaces[i]}`}
            >
              <div data-depth="60">
                <p
                  className={`font-display font-extrabold leading-none tracking-[-0.04em] text-accent-text ${
                    i === 0 ? "text-5xl sm:text-6xl lg:text-7xl" : "text-4xl sm:text-5xl"
                  }`}
                >
                  {p.metric}
                </p>
                <p className="mt-3 text-sm text-muted">{p.metricNote}</p>
              </div>
              <div data-depth="30" className="mt-auto pt-10">
                <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-3 max-w-[56ch] leading-relaxed text-muted">{p.body}</p>
                <p className="mt-5 text-sm text-fg/80">{p.stack}</p>
              </div>
            </TiltCard>
          </div>
        ))}
      </div>

    </section>
  );
}
