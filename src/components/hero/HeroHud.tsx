"use client";

import { forwardRef } from "react";
import { heroSpecs } from "@/data/hero";

/**
 * Camera-viewfinder overlay for the hero. All live values (timecode, frame
 * counter, section chip) are written imperatively from the scroll handler
 * via refs, so scrubbing never triggers a React render.
 */
export type HudRefs = {
  timecode: HTMLSpanElement | null;
  frame: HTMLSpanElement | null;
  section: HTMLSpanElement | null;
  chip: HTMLSpanElement | null;
};

const HeroHud = forwardRef<HTMLDivElement, { refs: React.MutableRefObject<HudRefs> }>(
  function HeroHud({ refs }, ref) {
    const set = <K extends keyof HudRefs>(key: K) => (el: HudRefs[K]) => {
      refs.current[key] = el;
    };

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 font-display font-500 text-muted uppercase select-none"
      >
        {/* ---------- top bar ---------- */}
        <div className="absolute top-[76px] right-[var(--page-inset)] left-[var(--page-inset)] flex items-center justify-between text-[9px] tracking-[0.25em] md:text-[10px]">
          <span className="flex items-center gap-2">
            {/* The one red pixel in the old palette goes white and square. */}
            <span className="anim-rec-blink inline-block h-2 w-2 bg-text" />
            <span className="text-text/80">REC</span>
            <span ref={set("timecode")} className="ml-3 tabular-nums text-text/60">
              00:00:00:00
            </span>
          </span>

          <span className="hidden text-muted/45 md:inline">{heroSpecs.slate}</span>
          <span className="text-muted/55">{heroSpecs.format}</span>
        </div>

        {/* ---------- left rail ---------- */}
        <div className="absolute top-1/2 left-[14px] hidden -translate-y-1/2 flex-col items-center gap-4 md:flex">
          <span className="vertical-lr text-[9px] tracking-[0.4em] text-muted/45">
            SCROLL TO EXPLORE
          </span>
        </div>

        {/* ---------- right rail ---------- */}
        <div className="absolute top-1/2 right-[14px] hidden -translate-y-1/2 flex-col items-center gap-4 md:flex">
          <span className="vertical-rl text-[9px] tracking-[0.4em] text-muted/45">
            BRENN CUT No.01 — DRY-AGED STACK
          </span>
        </div>

        {/* ---------- scanning line ---------- */}
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div className="anim-hud-scan h-px w-full bg-linear-to-r from-transparent via-text/50 to-transparent" />
        </div>

        {/* ---------- bottom telemetry ---------- */}
        <div className="absolute right-[var(--page-inset)] bottom-[68px] left-[var(--page-inset)] flex items-end justify-between">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-2 border border-text/30 bg-black/60 px-2.5 py-1.5 text-[9px] font-600 tracking-[0.28em] backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 bg-accent" />
              <span ref={set("chip")} className="text-text">
                01 · OVERVIEW
              </span>
            </span>

            {/* audio meter */}
            <span className="hidden items-end gap-[2px] md:flex">
              {[0.35, 0.7, 0.45, 1, 0.6, 0.85, 0.4].map((h, i) => (
                <span
                  key={i}
                  className="anim-audio-meter block w-[2px] bg-text/70"
                  style={{ height: `${h * 14}px`, animationDelay: `${i * 0.09}s` }}
                />
              ))}
            </span>
          </span>

          <span className="hidden items-center gap-6 text-[9px] tracking-[0.25em] text-muted lg:flex">
            <span>{heroSpecs.iso}</span>
            <span>{heroSpecs.wb}</span>
            <span ref={set("section")}>SECTION 01 / 05</span>
            <span ref={set("frame")} className="tabular-nums">
              FRAME 000 / 200
            </span>
            <span className="anim-hud-blink flex items-center gap-1.5 border border-text/40 px-2 py-1 text-text">
              ◢ SCRUB ACTIVE
            </span>
          </span>
        </div>

      </div>
    );
  },
);

export default HeroHud;
