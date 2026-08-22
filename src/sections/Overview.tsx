"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap } from "@/animations/gsap";
import { revealOnScroll, parallax } from "@/animations/reveal";
import { overviewSpecs } from "@/data/overview";

export default function Overview() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".ov-copy > *", { y: 34, stagger: 0.08 });
      revealOnScroll(".ov-media", { y: 60, duration: 1.2 });
      if (media.current) parallax(media.current.querySelector("img"), { amount: -40 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="overview"
      className="relative overflow-hidden bg-bg px-6 py-24 md:px-12 md:py-32"
    >
      {/* The gold blooms are gone — a hard rule grid takes their place. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-stroke"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-stroke md:block"
      />

      <div className="mx-auto grid max-w-[1400px] items-center gap-16 md:grid-cols-2">
        {/* ---------------- copy ---------------- */}
        <div className="ov-copy order-1">
          <p className="font-display text-[10px] font-600 tracking-[0.4em] text-muted uppercase md:text-[11px]">
            03 // OVERVIEW — THE PRIME STACK
          </p>

          <h2 className="mt-4 font-anton text-6xl leading-[0.82] text-text uppercase md:text-8xl lg:text-9xl">
            PRIME
            <span className="block text-muted">STACK</span>
          </h2>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            A 500g Wagyu A5 patty, aged 28 days and seared at 260°C on charcoal
            iron. Seven layers, nothing spare. Every decision points at a single
            mouthful.
          </p>

          <div className="mt-10 h-px w-full bg-text/25" />

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
            {overviewSpecs.map((s) => (
              <div key={s.label} className="border-l border-stroke pl-3">
                <dt className="font-display text-[9px] font-600 tracking-[0.25em] text-muted uppercase">
                  {s.label}
                </dt>
                <dd className="mt-1.5 font-anton text-2xl text-text uppercase">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href="#reserve"
            className="btn-brut group mt-10 inline-flex items-center gap-3 px-8 py-4 font-display text-xs font-700 tracking-[0.25em] uppercase"
          >
            RESERVE A TABLE
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* ---------------- media ---------------- */}
        <div className="ov-media order-2 flex items-center justify-center">
          <div ref={media} className="relative w-full max-w-[560px]">
            {/* corner brackets */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 -left-4 h-10 w-10 border-b border-l border-text/60"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -bottom-4 h-10 w-10 border-r border-b border-text/60"
            />

            <div className="relative h-[420px] overflow-hidden md:h-[560px]">
              <Image
                src="/menu/prime-stack.webp"
                alt="The PRIME stack, seared and assembled"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                // Left in colour: this is the section's feature shot and, unlike
                // the card grids, it has no hover state to reveal colour on.
                className="scale-110 object-cover"
              />
              <span className="absolute inset-0 bg-linear-to-t from-bg/85 via-transparent to-bg/25" />

              {/* Sits over the lit part of the stack, so it carries its own
                  shadow rather than relying on the gradient scrim. */}
              <div className="absolute inset-x-0 bottom-20 text-center [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">
                <p className="font-display text-[10px] font-600 tracking-[0.35em] text-text/80 uppercase">
                  SEARING NOW
                </p>
                <p className="mt-1 font-anton text-4xl text-text">260°C</p>
              </div>
            </div>

            {/* `relative z-10` is load-bearing: this badge is pulled up over
                the image with a negative margin, and the image wrapper above is
                positioned — without its own stacking context the badge would be
                painted underneath it and read as clipped. */}
            <p className="relative z-10 mx-auto -mt-5 w-fit border border-text/40 bg-bg px-6 py-2.5 font-display text-[10px] font-700 tracking-[0.3em] text-text uppercase">
              FLAME-FORGED — SINCE 2024
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
