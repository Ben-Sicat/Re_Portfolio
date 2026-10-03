/**
 * Shared, mutable state between the DOM (GSAP ScrollTriggers) and the WebGL
 * scene. Plain object on purpose: written by tweens, read every frame, and
 * never stored in React state.
 */
export const scene = {
  assemble: 0, // scan particles settle into the hero form
  heroOut: 0, // hero form leaves as M-PCAM arrives
  pcam: 0, // M-PCAM scene presence
  pcamOut: 0,
  pcamSeg: 0, // segmentation colors
  pcamDepth: 0, // camera rays
  pcamVol: 0, // volume columns
  llm: 0, // LLM constellation presence (0 hidden, 1 centered)
  llmOut: 0, // constellation leaves
  qcIn: 0, // Scan QC model presence
  qcOut: 0,
  qcSweep: 0, // QC sweep across the scan
  pointer: { x: 0, y: 0, active: false }, // normalized -1..1
};
