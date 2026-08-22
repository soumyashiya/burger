"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/animations/gsap";
import { horizontalScroll } from "@/animations/horizontalScroll";
import { cutCards } from "@/data/cut";

/**
 * Scroll-driven horizontal gallery. On desktop the stage pins and the track
 * translates on X for exactly its overflow width. Below the md breakpoint the
 * pin is dropped and the track becomes a native swipeable scroller, which
 * feels far better on touch than a hijacked pin.
 */
export default function TheCut() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        if (!stage.current || !track.current) return;
        // Lowest of the three pins — refreshes last, once the hero and sear
        // spacers above it have been re-measured.
        horizontalScroll(stage.current, track.current, {
          extra: 48,
          refreshPriority: 1,
        });
      });
    }, wrap);

    return () => ctx.revert();
  }, []);

  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  return (
    <div ref={wrap} id="the-cut">
      <div
        ref={stage}
        className="relative overflow-hidden md:h-screen"
      >
        {/* heading */}
        <div className="absolute top-20 left-6 z-10 md:left-12">
          <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase md:text-[11px]">
            SOURCING // THE PRIME INGREDIENTS
          </p>
          <h2 className="mt-3 font-anton text-4xl text-text uppercase md:text-6xl">
            <span className="text-muted">// 06.</span> THE CUT
          </h2>
        </div>

        {/* track */}
        <ul
          ref={track}
          className={`flex items-center gap-6 pt-40 pb-24 pl-6 md:h-full md:gap-10 md:pt-0 md:pb-0 md:pl-12 ${
            reduced
              ? "overflow-x-auto pr-6"
              : "overflow-x-auto pr-6 md:overflow-visible md:pr-[40vw]"
          } no-scrollbar`}
        >
          {cutCards.map((card) => (
            <li
              key={card.index}
              className="group relative h-[440px] w-[78vw] shrink-0 overflow-hidden border border-stroke bg-bg sm:w-[420px] md:h-[525px] md:w-[545px]"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 768px) 78vw, 545px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />

              <span className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-transparent" />

              <div className="absolute right-6 bottom-0 left-6 pb-7">
                <div className="flex items-end justify-between gap-6">
                  <h3 className="font-anton text-3xl text-text uppercase md:text-5xl">
                    {card.title}
                  </h3>

                  <span className="shrink-0 text-right">
                    <span className="block font-anton text-5xl leading-none text-text/20 md:text-7xl">
                      {card.index}
                    </span>
                    <span className="mt-1 block font-display text-[9px] font-600 tracking-[0.28em] text-muted uppercase">
                      {card.kicker}
                    </span>
                  </span>
                </div>

                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  {card.copy}
                </p>

                <span className="mt-5 block h-px w-full bg-text/30" />
              </div>
            </li>
          ))}
        </ul>

        <p className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 font-display text-[10px] font-600 tracking-[0.3em] text-muted uppercase md:block">
          SCROLL TO BROWSE →
        </p>
      </div>
    </div>
  );
}
