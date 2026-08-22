"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { revealOnScroll } from "@/animations/reveal";
import { storyCards, timeline } from "@/data/story";

export default function Story() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".st-head > *", { y: 30, stagger: 0.07 });
      revealOnScroll(".st-card", { y: 50, stagger: 0.1, duration: 1.1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="story"
      className="relative overflow-hidden bg-bg px-6 py-28 md:px-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-stroke"
      />

      <div className="mx-auto max-w-[1300px]">
        {/* ---------------- header ---------------- */}
        <div className="st-head mb-14 border-b border-text/25 pb-12 text-center">
          <p className="font-display text-[10px] font-600 tracking-[0.45em] text-muted uppercase md:text-[11px]">
            ORIGIN // EST. 1880
          </p>

          <h2 className="mt-4 font-anton text-6xl leading-[0.86] text-text uppercase md:text-9xl">
            <span className="text-muted">// 07.</span> THE STORY
          </h2>

          <p className="mt-4 font-display text-base font-600 tracking-[0.3em] text-muted uppercase md:text-xl">
            From Hamburg to the flame
          </p>

          {/* origin → today */}
          <div className="mt-8 flex flex-col items-center gap-5">
            <div className="flex items-center gap-5 md:gap-8">
              <div className="text-center">
                <span className="block text-3xl md:text-4xl" aria-hidden="true">
                  {timeline.fromFlag}
                </span>
                <span className="mt-2 block font-display text-[9px] font-600 tracking-[0.25em] text-muted uppercase md:text-[10px]">
                  {timeline.fromLabel}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-xs text-text" aria-hidden="true">
                  →
                </span>
                <span className="font-display text-[9px] font-700 tracking-[0.25em] text-text uppercase md:text-[10px]">
                  {timeline.span}
                </span>
                <span className="block h-px w-16 bg-linear-to-r from-transparent via-text/60 to-transparent md:w-24" />
              </div>

              <div className="text-center">
                <span className="block text-3xl md:text-4xl" aria-hidden="true">
                  {timeline.toFlag}
                </span>
                <span className="mt-2 block font-display text-[9px] font-600 tracking-[0.25em] text-muted uppercase md:text-[10px]">
                  {timeline.toLabel}
                </span>
              </div>
            </div>

            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted">
              {timeline.copy}
            </p>
          </div>
        </div>

        {/* ---------------- cards ---------------- */}
        <div className="grid gap-px bg-stroke md:grid-cols-2">
          {storyCards.map((card) => (
            <article
              key={card.era}
              className="st-card group relative flex flex-col overflow-hidden bg-bg transition-colors duration-300 hover:bg-surface"
            >
              <div className="relative h-[190px] overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-linear-to-t from-bg via-bg/20 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-8">
                <p className="w-fit bg-text px-2 py-0.5 font-display text-[9px] font-700 tracking-[0.3em] text-bg uppercase md:text-[10px]">
                  {card.era}
                </p>
                <h3 className="mt-3 font-anton text-3xl text-text uppercase">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {card.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
