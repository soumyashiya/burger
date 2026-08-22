"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { countUp, revealOnScroll } from "@/animations/reveal";
import { stats } from "@/data/overview";

export default function StatStrip() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".stat-card", { y: 36, stagger: 0.1 });

      root.current
        ?.querySelectorAll<HTMLElement>("[data-count]")
        .forEach((el) => countUp(el, Number(el.dataset.count)));
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-label="PRIME by the numbers"
      className="relative overflow-hidden bg-bg"
    >
      <div className="h-px w-full bg-text/25" />

      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-2 gap-px bg-stroke md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.index}
              className="stat-card relative flex flex-col justify-between bg-bg px-5 py-8 md:px-12 md:py-20"
            >
              <span className="font-display text-[10px] font-700 tracking-[0.3em] text-muted uppercase">
                {s.index}
              </span>

              <div className="mt-8 md:mt-12">
                <p className="font-anton text-6xl leading-none tabular-nums text-text md:text-7xl">
                  <span data-count={s.to}>0</span>
                  {s.suffix && (
                    <span className="ml-1 text-3xl text-muted md:text-4xl">
                      {s.suffix}
                    </span>
                  )}
                </p>

                <p className="mt-4 font-display text-[10px] font-700 tracking-[0.25em] text-text uppercase">
                  {s.unit}
                </p>
                <p className="font-display text-[10px] font-500 tracking-[0.25em] text-muted uppercase">
                  {s.label}
                </p>
              </div>

              <p className="mt-8 text-xs leading-relaxed text-muted md:mt-12">
                {s.copy}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-text/25" />
    </section>
  );
}
