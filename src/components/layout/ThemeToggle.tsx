"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "fedegan-tema";
const LIGHT = "institucional"; // tema claro (mármol); el oscuro es «esmeralda»
const DARK = "esmeralda";

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
};
const snapshot = () => document.documentElement.getAttribute("data-theme") === LIGHT;

// Cambio de tono claro / oscuro. La elección se recuerda; el script del <head> la aplica antes de pintar.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const light = useSyncExternalStore(subscribe, snapshot, () => false);

  function toggle() {
    const next = light ? DARK : LIGHT;
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next === LIGHT ? "claro" : "oscuro");
    } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === LIGHT ? "#f5f4f0" : "#05100b");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Cambiar a tono oscuro" : "Cambiar a tono claro"}
      title={light ? "Tono oscuro" : "Tono claro"}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--fg-lime-400)] transition-colors hover:bg-[var(--bg-muted)] ${className}`}
    >
      {light ? <Moon size={19} /> : <Sun size={19} />}
    </button>
  );
}
