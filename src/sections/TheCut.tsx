"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/animations/gsap";
import { horizontalScroll } from "@/animations/horizontalScroll";
import { cutCards } from "@/data/cut";

/**
 * Scroll-driven horizontal gallery: the stage pins and the track translates on
 * X for exactly its overflow width, at every screen size.
 *
 * The gate is motion preference, not viewport width. Anyone who has asked the
 * system to reduce motion gets the track back as a plain swipeable scroller
 * instead — which is also why the overflow below is branched rather than fixed:
 * a pinned track must overflow visibly for the translate to reveal anything,
 * while the fallback has to stay scrollable or the later cards are unreachable.
 */
export default function TheCut() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  // Read after mount, never during render. The server cannot know the visitor's
  // motion preference, so rendering it would make the markup disagree with the
  // first client paint — and React would keep the server's class, leaving a
  // reduced-motion visitor with a track that neither pins nor scrolls.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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

  return (
    <div ref={wrap} id="the-cut">
      {/* h-stage, not h-screen: the pin has to be exactly as tall as what the
          phone actually shows, and svh does not change as the address bar
          hides — which would otherwise resize the stage mid-pin. */}
      <div ref={stage} className="h-stage relative overflow-hidden">
        {/* heading */}
        <div className="absolute top-20 left-[var(--page-inset)] z-10">
          <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase md:text-[11px]">
            SOURCING // WHAT GOES ON THE BUN
          </p>
          <h2 className="mt-3 font-anton text-4xl text-text uppercase md:text-6xl">
            <span className="text-muted">// 06.</span> THE CUT
          </h2>
        </div>

        {/* track */}
        <ul
          ref={track}
          className={`flex h-full items-center gap-6 pl-[var(--page-inset)] md:gap-10 ${
            reduced
              ? "overflow-x-auto pr-[var(--page-inset)]"
              : "overflow-visible pr-[40vw]"
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

        {/* Now shown on phones too: the track no longer advertises itself with
            a swipeable overflow, so the cue has to say what moves it. */}
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-[10px] font-600 tracking-[0.3em] text-muted uppercase">
          SCROLL TO BROWSE →
        </p>
      </div>
    </div>
  );
}
