"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { scene } from "@/lib/sceneStore";
import { mpcam } from "@/lib/content";

/** M-PCAM case study. The 3D camera-and-plate scene sits on the left. */
export default function Mpcam() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      // Segment, then depth, then volume, scrubbed with the steps.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".pcam-steps", start: "top 60%", end: "bottom bottom", scrub: 0.8 },
        })
        .to(scene, { pcamSeg: 1, duration: 0.8 })
        .to(scene, { pcamDepth: 1, duration: 0.8 }, ">+0.3")
        .to(scene, { pcamVol: 1, duration: 1 }, ">+0.3");

      gsap.utils.toArray<HTMLElement>(".pcam-step").forEach((step) => {
        gsap.fromTo(
          step,
          { autoAlpha: 0.15, y: reduce ? 0 : 90, rotateX: reduce ? 0 : 25 },
          {
            autoAlpha: 1,
            y: 0,
            rotateX: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: step, start: "top 88%", end: "top 45%", scrub: 0.6 },
          },
        );
      });

      if (!reduce)
        gsap.from(".pcam-intro > *", {
          y: 50,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".pcam-intro", start: "top 80%", toggleActions: "play none none reverse" },
        });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="mpcam" className="relative z-10 scroll-mt-10">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="pcam-steps ml-auto pt-24 pb-[22svh] [perspective:1200px] lg:w-[46%] lg:pt-40">
          <div className="pcam-intro">
            <p className="text-lg text-accent-text">M-PCAM</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-6xl">
              {mpcam.title}
            </h2>
            <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-muted">{mpcam.intro}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {mpcam.stack.map((s) => (
                <li key={s} className="rounded-full border border-line bg-bg px-4 py-2 text-sm text-muted">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {mpcam.steps.map((step) => (
            <div
              key={step.title}
              className="pcam-step flex min-h-[80svh] origin-bottom flex-col justify-start pt-24 lg:justify-center lg:pt-0"
            >
              <div className="rounded-[20px] border border-line/70 bg-surface/95 p-7 md:p-9">
                <h3 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-5xl">{step.title}</h3>
                <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-muted">{step.body}</p>
                {step.stat && (
                  <div className="mt-8 border-t border-line pt-6">
                    <p className="font-display text-6xl font-extrabold tracking-[-0.04em] text-accent-text md:text-7xl">
                      {step.stat.value}
                    </p>
                    <p className="mt-2 max-w-[40ch] text-muted">{step.stat.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
