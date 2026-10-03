"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { scene } from "@/lib/sceneStore";
import { profile } from "@/lib/content";

/** Hero copy. The 3D form lives in the fixed scene behind it. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        scene.assemble = 1;
        return;
      }
      // Page-load moment: headline rises while particles settle into the form.
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(scene, { assemble: 0 }, { assemble: 1, duration: 2.6, ease: "power2.inOut" }, 0.2)
        .from(".hero-line > span", { yPercent: 115, rotateX: -50, duration: 1.2, stagger: 0.1 }, 0.25)
        .from(".hero-fade", { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.8);

      gsap.to(".hero-inner", {
        yPercent: -18,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative z-10">
      <div className="mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-start px-5 pt-28 pb-16 md:px-10 lg:justify-center lg:pt-20">
        <div className="hero-inner lg:w-[62%]">
          <p className="hero-fade mb-6 text-lg text-muted">
            {profile.name}, {profile.role}
          </p>
          <h1 className="font-display text-[clamp(2.6rem,5.8vw,6rem)] leading-[0.95] font-extrabold tracking-[-0.035em] [perspective:800px]">
            <span className="hero-line block overflow-hidden pb-[0.06em]">
              <span className="block origin-bottom">I build AI that</span>
            </span>
            <span className="hero-line block overflow-hidden pb-[0.06em]">
              <span className="block origin-bottom">runs in production.</span>
            </span>
          </h1>
          <p className="hero-fade mt-8 max-w-[36ch] text-xl leading-relaxed text-muted md:text-2xl">
            Computer vision, private LLM platforms, and the full-stack systems around them.
          </p>
          <div className="hero-fade mt-10 flex flex-wrap gap-3">
            <a
              href="#mpcam"
              className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink shadow-[0_8px_30px_-8px_rgb(var(--glow)/0.6)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              See the work
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full border border-line bg-bg/80 px-6 py-3 font-medium transition-colors hover:border-fg active:scale-[0.98]"
            >
              Email me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
