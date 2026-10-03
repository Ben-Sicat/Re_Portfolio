"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { earlier } from "@/lib/content";
import TiltCard from "./TiltCard";

/**
 * Desktop: the section pins and the row of cards pans sideways as you scroll.
 * Smaller screens: a native swipeable row with scroll snapping.
 */
export default function EarlierWork() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        if (prefersReducedMotion()) return;
        const track = root.current!.querySelector<HTMLElement>(".earlier-track")!;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

        const pan = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".earlier-pin",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // Each card leans in as it crosses the middle of the screen.
        gsap.utils.toArray<HTMLElement>(".earlier-card").forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: -28, z: -140, autoAlpha: 0.35 },
            {
              rotateY: 0,
              z: 0,
              autoAlpha: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: pan,
                start: "left 100%",
                end: "left 55%",
                scrub: true,
              },
            },
          );
        });
      });

      mm.add("(max-width: 1023px)", () => {
        if (prefersReducedMotion()) return;
        gsap.from(".earlier-card", {
          y: 50,
          autoAlpha: 0,
          stagger: 0.06,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".earlier-track", start: "top 85%", toggleActions: "play none none reverse" },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative z-10">
      <div className="earlier-pin flex min-h-[100svh] flex-col justify-center overflow-hidden py-20 lg:py-0">
        <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
          <h2 className="font-display text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-6xl">
            Earlier work.
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
            Research, internships and analyst work that got me here.
          </p>
        </div>

        <ul className="earlier-track mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [perspective:1400px] [scrollbar-width:none] md:px-10 lg:w-max lg:snap-none lg:gap-6 lg:overflow-visible lg:pb-0 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))]">
          {earlier.map((e) => (
            <li key={e.title} className="earlier-card w-[82vw] max-w-[380px] shrink-0 snap-start sm:w-[340px] lg:w-[380px]">
              <TiltCard className="flex h-full min-h-[340px] flex-col rounded-[20px] border border-line bg-surface/95 p-6 sm:p-7">
                <p data-depth="50" className="font-display text-4xl font-extrabold tracking-[-0.04em] text-accent-text sm:text-5xl">
                  {e.metric}
                </p>
                <div data-depth="25" className="mt-auto pt-10">
                  <p className="text-sm text-muted">{e.context}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em]">{e.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{e.body}</p>
                  <p className="mt-4 text-sm text-fg/80">{e.stack}</p>
                </div>
              </TiltCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
