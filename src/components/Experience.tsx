"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { experience } from "@/lib/content";

export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".exp-progress",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".exp-list", start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );

      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".exp-item").forEach((item) => {
        gsap.from(item, {
          y: 50,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 82%", toggleActions: "play none none reverse" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="experience"
      className="relative z-10 mx-auto grid max-w-[1400px] scroll-mt-10 grid-cols-1 gap-12 px-5 py-28 md:px-10 md:py-40 lg:grid-cols-12"
    >
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <h2 className="font-display text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-6xl">
            Where I&apos;ve worked.
          </h2>
          <p className="mt-6 max-w-[36ch] leading-relaxed text-muted">
            BS Computer Science, Data Science specialization, Adamson University.
          </p>
        </div>
      </div>

      <ol className="exp-list relative lg:col-span-8">
        <span className="absolute top-0 bottom-0 left-0 w-px bg-line" aria-hidden />
        <span className="exp-progress absolute top-0 bottom-0 left-0 w-px origin-top bg-accent" aria-hidden />
        {experience.map((job) => (
          <li key={job.company} className="exp-item relative pb-16 pl-8 last:pb-0 md:pl-14">
            <p className="text-sm text-muted">{job.dates}</p>
            <h3 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">{job.role}</h3>
            <p className="mt-1 text-lg text-accent-text">{job.company}</p>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-muted">{job.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
