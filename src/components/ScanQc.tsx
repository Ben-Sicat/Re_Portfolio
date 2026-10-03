"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { scanqc } from "@/lib/content";
import TiltCard from "./TiltCard";

/** Scan QC case study, led by the evidence. */
export default function ScanQc() {
  const root = useRef<HTMLElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      // Bars grow from zero as the chart enters, and shrink back if you scroll up past it.
      gsap.fromTo(
        ".qc-bar",
        { scaleX: reduce ? 1 : 0 },
        {
          scaleX: 1,
          duration: 1.1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".qc-chart", start: "top 80%", toggleActions: "play none none reverse" },
        },
      );
      if (reduce) return;
      gsap.from(".qc-stat", {
        y: 70,
        rotateX: 35,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".qc-stats", start: "top 85%", toggleActions: "play none none reverse" },
      });
      gsap.from(".qc-intro > *", {
        y: 50,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".qc-intro", start: "top 80%", toggleActions: "play none none reverse" },
      });
    },
    { scope: root },
  );

  const { comparison } = scanqc;

  return (
    <section
      ref={root}
      id="scanqc"
      className="relative z-10 mx-auto max-w-[1400px] scroll-mt-10 px-5 py-28 md:px-10 md:py-40"
    >
      <div className="qc-stage min-h-[170svh] lg:min-h-[150svh]">
        <div className="qc-intro lg:sticky lg:top-28 lg:w-[48%]">
          <p className="text-lg text-accent-text">Scan QC</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-6xl">
            {scanqc.title}
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-muted">{scanqc.intro}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {scanqc.stack.map((s) => (
              <li key={s} className="rounded-full border border-line bg-bg px-4 py-2 text-sm text-muted">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="qc-evidence mt-16 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="qc-chart rounded-[20px] border border-line bg-surface/95 p-6 sm:p-8">
            <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">{comparison.title}</h3>
            <p className="mt-2 text-muted">{comparison.note}</p>

            <div className="relative mt-8" role="img" aria-label="Bar chart of AUC by approach. Geometric features with gradient boosting: 0.756. PointNet on raw point clouds: 0.640. Chance is 0.5.">
              {/* Chance reference at 0.5 */}
              <div className="pointer-events-none absolute top-0 bottom-6 left-1/2 border-l border-dashed border-line" aria-hidden />
              <ul className="relative flex flex-col gap-6" aria-hidden>
                {comparison.bars.map((b, i) => (
                  <li
                    key={b.label}
                    className="relative"
                    onPointerEnter={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                      <span className={b.shipped ? "text-fg" : "text-muted"}>{b.label}</span>
                      <span className="font-display text-lg font-bold text-fg tabular-nums">{b.value.toFixed(3)}</span>
                    </div>
                    {/* Hit target taller than the mark */}
                    <div className="py-2">
                      <div
                        className="qc-bar h-3 origin-left rounded-r-[4px]"
                        style={{
                          width: `${b.value * 100}%`,
                          background: b.shipped ? "var(--chart-hi)" : "var(--chart-lo)",
                        }}
                      />
                    </div>
                    {hover === i && (
                      <div
                        className="absolute top-full z-10 mt-1 -translate-x-1/2 rounded-lg border border-line bg-bg px-3 py-2 text-sm whitespace-nowrap shadow-lg"
                        style={{ left: `${Math.min(80, b.value * 100)}%` }}
                      >
                        <span className="font-bold text-fg">{b.value.toFixed(3)} AUC</span>
                        <span className="text-muted"> {b.shipped ? "shipped approach" : "deep-learning baseline"}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between text-xs text-muted" aria-hidden>
                <span>0</span>
                <span>0.5 chance</span>
                <span>1.0</span>
              </div>
            </div>

            <table className="sr-only">
              <caption>AUC by approach, same cases and split</caption>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>AUC</th>
                </tr>
              </thead>
              <tbody>
                {comparison.bars.map((b) => (
                  <tr key={b.label}>
                    <td>{b.label}</td>
                    <td>{b.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="rounded-[20px] border border-dashed border-line p-6 leading-relaxed text-muted sm:px-8">
            {scanqc.leak}
          </p>
        </div>

        <div className="qc-stats grid grid-cols-1 gap-4 [perspective:1400px] sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {scanqc.stats.map((s) => (
            <TiltCard
              key={s.note}
              className="qc-stat rounded-[20px] border border-line bg-surface/95 p-6 last:sm:col-span-2 last:lg:col-span-1 sm:p-7"
            >
              <p data-depth="50" className="font-display text-5xl font-extrabold tracking-[-0.04em] text-accent-text sm:text-6xl">
                {s.value}
                {s.unit && <span className="ml-2 text-2xl font-bold text-muted">{s.unit}</span>}
              </p>
              <p data-depth="25" className="mt-3 max-w-[36ch] text-muted">
                {s.note}
              </p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
