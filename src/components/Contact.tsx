"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { profile } from "@/lib/content";

export default function Contact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".contact-big", {
        yPercent: 60,
        autoAlpha: 0,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 40%", scrub: 0.7 },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="contact"
      className="relative z-10 mx-auto max-w-[1400px] scroll-mt-10 px-5 pt-28 pb-16 md:px-10 md:pt-40"
    >
      <h2 className="font-display text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-6xl">
        Building something with AI?
      </h2>
      <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted">
        Tell me what you&apos;re working on.
      </p>

      <a
        href={`mailto:${profile.email}`}
        className="contact-big group mt-14 inline-block font-display text-[clamp(1.9rem,6.4vw,6rem)] leading-none font-extrabold tracking-[-0.04em] break-all"
      >
        <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_6px] bg-left-bottom bg-no-repeat pb-2 transition-[background-size] duration-500 group-hover:bg-[length:100%_6px]">
          {profile.email}
        </span>
      </a>

      <div className="mt-14 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${profile.email}`}
          className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Email me
        </a>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line px-6 py-3 font-medium transition-colors hover:border-fg active:scale-[0.98]"
        >
          GitHub
        </a>
      </div>

      <footer className="mt-28 flex flex-wrap justify-between gap-4 border-t border-line pt-8 text-sm text-muted">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>Manila, Philippines</p>
      </footer>
    </section>
  );
}
