"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene3D = dynamic(() => import("./three/Scene3D"), { ssr: false });

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** WebGL available, and the device is not obviously low-power. */
function canRun3D() {
  const nav = navigator as Nav;
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) < 4) return false;
  if ((nav.hardwareConcurrency ?? 8) < 4) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Loads the WebGL background after the page is interactive, so text and
 * layout paint first. Low-power devices get the page without it.
 */
export default function SceneMount() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!canRun3D()) return;
    const go = () => setOk(true);
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(go, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(go, 300);
    return () => clearTimeout(id);
  }, []);
  return ok ? <Scene3D /> : null;
}
