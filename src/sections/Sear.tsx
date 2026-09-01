"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/animations/gsap";
import { searSteps, searTicks } from "@/data/sear";

const SEAR_VIEWPORTS = 3;

/**
 * Pinned heat sequence. Scroll progress drives one shared value — temperature
 * — which in turn drives the readout, the gauge fill, the image crossfade and
 * which of the three copy blocks is on screen.
 */
export default function Sear() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tempRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const heatRef = useRef<HTMLDivElement>(null);
  const coldImg = useRef<HTMLDivElement>(null);
  const hotImg = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // Settle on the final state and skip the pin.
      if (tempRef.current) tempRef.current.textContent = "260";
      if (fillRef.current) fillRef.current.style.height = "100%";
      stepRefs.current.forEach((s, i) =>
        s && (s.style.opacity = i === searSteps.length - 1 ? "1" : "0"),
      );
      return;
    }

    const ctx = gsap.context(() => {
      const apply = (p: number) => {
        const temp = Math.round(4 + p * 256);

        if (tempRef.current) tempRef.current.textContent = String(temp);
        if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
        if (heatRef.current) heatRef.current.style.opacity = String(p * 0.55);

        // Cross-dissolve cold → hot across the middle of the sequence
        const mix = Math.min(1, Math.max(0, (p - 0.2) / 0.5));
        if (coldImg.current) coldImg.current.style.opacity = String(1 - mix);
        if (hotImg.current) hotImg.current.style.opacity = String(mix);

        // Three copy blocks, each owning a third of the scrub
        stepRefs.current.forEach((s, i) => {
          if (!s) return;
          const start = i / searSteps.length;
          const end = (i + 1) / searSteps.length;
          const local = (p - start) / (end - start);
          const o =
            local < 0 || local > 1
              ? 0
              : local < 0.18
                ? local / 0.18
                : local > 0.82
                  ? (1 - local) / 0.18
                  : 1;
          s.style.opacity = String(Math.max(0, Math.min(1, o)));
          s.style.transform = `translateY(${(1 - Math.max(0, Math.min(1, o))) * 18}px)`;
        });
      };

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * SEAR_VIEWPORTS}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Must refresh after the hero pin (3) and before The Cut (1).
        refreshPriority: 2,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });

      apply(0);
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} id="sear">
      <div
        ref={stage}
        className="relative flex h-screen w-full items-center overflow-hidden"
      >
        {/* ---------------- crossfading plates ---------------- */}
        <div ref={coldImg} className="absolute inset-0">
          <Image
            src="/grill/grill-line.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div ref={hotImg} className="absolute inset-0 opacity-0">
          <Image
            src="/grill/open-flame.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-bg/75" />
        {/* "Heat" now reads as light rather than orange — the plate blooms
            white as the temperature climbs. */}
        <div
          ref={heatRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 78%, rgba(255,255,255,0.4), transparent 62%)",
          }}
        />

        {/* ---------------- heading ---------------- */}
        <div className="absolute top-20 left-[var(--page-inset)] z-10 md:top-24">
          <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase md:text-[11px]">
            PROCESS // CHARCOAL IRON SEAR
          </p>
          <h2 className="mt-3 font-anton text-4xl text-text uppercase md:text-6xl">
            <span className="text-muted">// 04.</span> THE SEAR
          </h2>
        </div>

        {/* ---------------- stepped copy ---------------- */}
        {/* w-full is required: every step below is absolutely positioned, so
            without it this flex item would collapse to zero width. */}
        <div className="relative z-10 ml-[var(--page-inset)] w-full max-w-lg md:max-w-xl">
          <div className="relative h-[300px] w-full md:h-[340px]">
            {searSteps.map((step, i) => (
              <div
                key={step.titleTop}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-center opacity-0"
              >
                <p className="w-fit bg-text px-2.5 py-1 font-display text-[10px] font-700 tracking-[0.4em] text-bg uppercase">
                  {step.kicker}
                </p>
                <h3 className="mt-4 font-anton text-5xl leading-[0.86] text-text uppercase md:text-7xl">
                  {step.titleTop}
                  <span className="block text-muted">{step.titleBottom}</span>
                </h3>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- temperature gauge ---------------- */}
        <div
          className="absolute right-[var(--page-inset)] z-10 flex h-[70vh] flex-col items-center gap-6"
          aria-hidden="true"
        >
          <p className="font-anton text-7xl leading-none tabular-nums text-text md:text-9xl">
            <span ref={tempRef}>4</span>
          </p>
          <p className="font-display text-[10px] font-700 tracking-[0.3em] text-muted uppercase">
            °C
          </p>

          <div className="relative flex flex-1 gap-3">
            {/* track — square, and the fill is flat white */}
            <div className="relative w-2 overflow-hidden border border-stroke bg-transparent">
              <div
                ref={fillRef}
                className="absolute right-0 bottom-0 left-0 h-0 bg-text"
              />
            </div>

            {/* ticks */}
            <div className="flex flex-col justify-between py-1">
              {searTicks.map((t) => (
                <span
                  key={t}
                  className="font-display text-[9px] font-500 tracking-[0.2em] text-muted tabular-nums"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-display text-[10px] font-600 tracking-[0.3em] text-muted uppercase">
          SCROLL TO RAISE HEAT
        </p>
      </div>
    </div>
  );
}
