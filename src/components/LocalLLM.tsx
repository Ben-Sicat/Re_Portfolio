"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { llmFacts, llmStack } from "@/lib/content";
import TiltCard from "./TiltCard";

type Node = { id: string; label: string; sub: string; x: number; y: number; w: number; core?: boolean };
type Edge = [string, string];
type Layout = { w: number; h: number; nodes: Node[]; dir: "h" | "v" };

const NODE_H = 76;

const wide: Layout = {
  dir: "h",
  w: 1080,
  h: 400,
  nodes: [
    { id: "staff", label: "Staff", sub: "company sign-in", x: 110, y: 200, w: 170 },
    { id: "gate", label: "Open WebUI", sub: "gateway and approvals", x: 350, y: 200, w: 190 },
    { id: "llm", label: "Qwen3 27B", sub: "on Ollama, 2 presets", x: 600, y: 200, w: 200, core: true },
    { id: "tools", label: "10 tools", sub: "SQL, Confluence, files", x: 860, y: 100, w: 200 },
    { id: "rag", label: "Code search", sub: "Qdrant + reranker", x: 860, y: 300, w: 200 },
  ],
};

const tall: Layout = {
  dir: "v",
  w: 360,
  h: 690,
  nodes: [
    { id: "staff", label: "Staff", sub: "company sign-in", x: 180, y: 70, w: 210 },
    { id: "gate", label: "Open WebUI", sub: "gateway and approvals", x: 180, y: 210, w: 210 },
    { id: "llm", label: "Qwen3 27B", sub: "on Ollama, 2 presets", x: 180, y: 360, w: 230, core: true },
    { id: "tools", label: "10 tools", sub: "SQL, Confluence", x: 92, y: 530, w: 158 },
    { id: "rag", label: "Code search", sub: "Qdrant + reranker", x: 268, y: 530, w: 158 },
  ],
};

const edges: Edge[] = [
  ["staff", "gate"],
  ["gate", "llm"],
  ["llm", "tools"],
  ["llm", "rag"],
];

function edgePath(a: Node, b: Node, dir: "h" | "v") {
  if (dir === "h") {
    const x1 = a.x + a.w / 2;
    const x2 = b.x - b.w / 2;
    const mid = (x1 + x2) / 2;
    return `M${x1},${a.y} C${mid},${a.y} ${mid},${b.y} ${x2},${b.y}`;
  }
  const y1 = a.y + NODE_H / 2;
  const y2 = b.y - NODE_H / 2;
  const mid = (y1 + y2) / 2;
  return `M${a.x},${y1} C${a.x},${mid} ${b.x},${mid} ${b.x},${y2}`;
}

function Diagram({ layout, className }: { layout: Layout; className: string }) {
  const byId = Object.fromEntries(layout.nodes.map((n) => [n.id, n]));
  const pad = 22;
  return (
    <svg
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      className={`diagram w-full ${className}`}
      role="img"
      aria-label="Staff sign in to Open WebUI, which routes to Qwen3 27B running on Ollama. The model calls 10 custom tools and a code search service. Everything stays inside the office network."
    >
      <rect
        className="boundary"
        x={pad / 2}
        y={pad / 2}
        width={layout.w - pad}
        height={layout.h - pad}
        rx="26"
        fill="none"
        stroke="var(--line)"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />
      <text x={pad + 14} y={pad + 26} fill="var(--muted)" fontSize="14">
        Office network
      </text>

      {edges.map(([from, to]) => {
        const d = edgePath(byId[from], byId[to], layout.dir);
        return (
          <g key={from + to}>
            <path className="edge" d={d} fill="none" stroke="var(--muted)" strokeWidth="1.6" />
            <circle className="packet" r="4" fill="var(--accent)">
              <animateMotion dur="2.4s" repeatCount="indefinite" path={d} />
            </circle>
          </g>
        );
      })}

      {layout.nodes.map((n) => (
        <g key={n.id} className="node" transform={`translate(${n.x - n.w / 2} ${n.y - NODE_H / 2})`}>
          <rect
            width={n.w}
            height={NODE_H}
            rx="16"
            fill={n.core ? "var(--accent)" : "var(--surface)"}
            fillOpacity={n.core ? 1 : 0.82}
            stroke={n.core ? "none" : "var(--line)"}
          />
          <text
            x={n.w / 2}
            y={33}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill={n.core ? "var(--accent-ink)" : "var(--fg)"}
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            {n.label}
          </text>
          <text
            x={n.w / 2}
            y={55}
            textAnchor="middle"
            fontSize="13"
            fill={n.core ? "var(--accent-ink)" : "var(--muted)"}
          >
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function LocalLLM() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const packets = gsap.utils.toArray<SVGElement>(".packet");
      if (reduce) {
        gsap.set(packets, { autoAlpha: 0 });
        return;
      }

      gsap.utils.toArray<SVGSVGElement>(".diagram").forEach((svg) => {
        const q = gsap.utils.selector(svg);
        const edgesEls = Array.from(svg.querySelectorAll<SVGPathElement>(".edge"));
        edgesEls.forEach((p) => {
          let len = 600;
          try {
            len = p.getTotalLength() || len;
          } catch {}
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });

        gsap
          .timeline({
            scrollTrigger: { trigger: svg, start: "top 80%", end: "center 45%", scrub: 0.8 },
          })
          .from(q(".node"), { autoAlpha: 0, y: 24, stagger: 0.18, duration: 0.5, ease: "power2.out" })
          .to(edgesEls, { strokeDashoffset: 0, stagger: 0.15, duration: 0.6, ease: "none" }, 0.2)
          .from(q(".boundary"), { autoAlpha: 0, scale: 0.97, transformOrigin: "50% 50%", duration: 0.5 }, ">-0.2")
          .from(q(".packet"), { autoAlpha: 0, duration: 0.2 }, ">");
      });

      gsap.from(".llm-fact", {
        y: 80,
        rotateX: 35,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".llm-fact", start: "top 90%", toggleActions: "play none none reverse" },
      });

      gsap.from(".llm-copy > *", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".llm-copy", start: "top 80%", toggleActions: "play none none reverse" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="llm" className="relative z-10 mx-auto max-w-[1400px] scroll-mt-10 px-5 py-28 md:px-10 md:py-40">
      <div className="llm-copy max-w-[60ch]">
        <h2 className="font-display text-4xl leading-[1.02] font-bold tracking-[-0.03em] md:text-6xl">
          A private LLM for the whole office.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted md:text-xl">
          I built and run the company&apos;s own AI assistant on the office network, so staff stop pasting
          sensitive data into public chatbots. It has tool calling, search over our codebases, and an eval harness
          to prove each change helps.
        </p>
      </div>

      <div className="mt-16 md:mt-20">
        <Diagram layout={wide} className="hidden lg:block" />
        <Diagram layout={tall} className="mx-auto max-w-[440px] lg:hidden" />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {llmFacts.map((f) => (
          <TiltCard key={f.value} className="llm-fact rounded-[20px] border border-line bg-surface/95 p-6 last:sm:col-span-2 last:lg:col-span-1 sm:p-7">
            <p data-depth="40" className="font-display text-4xl font-extrabold tracking-[-0.04em] text-accent-text sm:text-5xl">
              {f.value}
            </p>
            <p data-depth="20" className="mt-3 text-muted">
              {f.note}
            </p>
          </TiltCard>
        ))}
      </div>

      <ul className="mt-10 flex flex-wrap gap-2">
        {llmStack.map((s) => (
          <li key={s} className="rounded-full border border-line bg-bg px-4 py-2 text-sm text-muted">
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}
