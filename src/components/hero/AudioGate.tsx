"use client";

import { Volume2, Headphones } from "lucide-react";

/**
 * Full-screen entry gate shown over the hero until the visitor opts in.
 * Dismissing it is what unlocks scrolling, so it doubles as the intro.
 */
export default function AudioGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px]">
      <p className="anim-gate-fadein font-display text-[10px] font-600 tracking-[0.45em] text-muted uppercase md:text-[11px]">
        BRENN // THE STACK — IMMERSIVE TASTE
      </p>

      {/* Square gate: the expanding rings stay, but as hard rectangles. */}
      <button
        type="button"
        onClick={onEnter}
        className="group relative mt-12 flex h-[168px] w-[168px] items-center justify-center md:h-[200px] md:w-[200px]"
      >
        <span
          aria-hidden="true"
          className="anim-gate-ring absolute inset-0 border border-text/40"
        />
        <span
          aria-hidden="true"
          className="anim-gate-ring absolute inset-0 border border-text/25"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Core */}
        <span className="anim-gate-core flex h-[128px] w-[128px] flex-col items-center justify-center gap-3 border border-text/40 bg-black/60 transition-colors duration-500 group-hover:border-text md:h-[152px] md:w-[152px]">
          <Volume2
            className="h-6 w-6 text-text transition-transform duration-500 group-hover:scale-110"
            aria-hidden="true"
          />
          <span className="font-display text-[10px] font-700 tracking-[0.3em] text-text uppercase">
            SOUND ON
          </span>
        </span>
      </button>

      <p
        className="anim-gate-fadein mt-12 flex items-center gap-2 font-display text-[9px] font-500 tracking-[0.3em] text-muted uppercase md:text-[10px]"
        style={{ animationDelay: "0.5s" }}
      >
        <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
        HEADPHONES RECOMMENDED · TAP TO BEGIN
      </p>
    </div>
  );
}
