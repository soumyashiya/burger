"use client";

import Image from "next/image";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/animations/gsap";
import { revealOnScroll } from "@/animations/reveal";
import SectionHeading from "@/components/SectionHeading";
import { useCart } from "@/cart/CartContext";
import { sizes, toppings } from "@/data/configurator";

export default function Configurator() {
  const root = useRef<HTMLElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const { add } = useCart();

  const [sizeKey, setSizeKey] = useState(sizes[0].key);
  const [picked, setPicked] = useState<string[]>([]);

  const size = useMemo(
    () => sizes.find((s) => s.key === sizeKey) ?? sizes[0],
    [sizeKey],
  );

  const total = useMemo(
    () =>
      size.price +
      toppings
        .filter((t) => picked.includes(t.key))
        .reduce((sum, t) => sum + t.price, 0),
    [size, picked],
  );

  const toggle = (key: string) =>
    setPicked((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  /**
   * Adds the current build to the order. The id is derived from the size plus
   * the *sorted* topping keys, so picking the same toppings in a different
   * order stacks onto one line instead of creating a near-duplicate.
   */
  const addBuild = () => {
    const chosen = toppings.filter((t) => picked.includes(t.key));
    add({
      id: `build:${size.key}:${[...picked].sort().join("+")}`,
      name: size.name,
      meta: chosen.length
        ? chosen.map((t) => t.name).join(" · ")
        : `${size.spec} · no extras`,
      price: total,
      image: size.image,
    });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".cfg-head", { y: 30 });
      revealOnScroll(".cfg-col", { y: 44, stagger: 0.12 });
    }, root);
    return () => ctx.revert();
  }, []);

  // Pop the total whenever the build changes
  useLayoutEffect(() => {
    if (!priceRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      priceRef.current,
      { scale: 0.94, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.45, ease: "power3.out" },
    );
  }, [total]);

  return (
    <section
      ref={root}
      id="configurator"
      className="bg-surface px-6 py-12 md:px-12 md:py-28"
    >
      <div className="mx-auto max-w-[1300px]">
        <SectionHeading
          className="cfg-head mb-8 border-b border-text/25 pb-6 md:mb-16 md:pb-8"
          eyebrow="INTERACTIVE // CUSTOM BUILD"
          index="// 02."
          title="BUILD YOUR PRIME"
        />

        <div className="grid gap-8 md:grid-cols-[45%_55%] md:gap-12">
          {/* ------------------ controls ------------------ */}
          <div className="cfg-col order-2 flex flex-col gap-8 md:order-1 md:gap-10">
            {/* Step 1 */}
            <fieldset>
              <legend className="font-display text-[10px] font-700 tracking-[0.35em] text-text uppercase">
                STEP 1 · CHOOSE SIZE
              </legend>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {sizes.map((s) => {
                  const on = s.key === sizeKey;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSizeKey(s.key)}
                      aria-pressed={on}
                      className={`group relative overflow-hidden border text-left transition-all duration-300 ${
                        on
                          ? "border-text"
                          : "border-stroke hover:border-text/50"
                      }`}
                    >
                      <div className="relative h-[240px]">
                        <Image
                          src={s.image}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 33vw, 15vw"
                          className={`object-cover transition-all duration-500 ${
                            on
                              ? "scale-105 opacity-100 grayscale-0"
                              : "opacity-55 grayscale group-hover:opacity-80"
                          }`}
                        />
                        <span className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />

                        <span
                          className={`absolute top-2 left-2 font-anton text-3xl transition-colors ${
                            on ? "bg-text px-2 text-bg" : "px-2 text-text/70"
                          }`}
                        >
                          {s.letter}
                        </span>

                        <span className="absolute right-3 bottom-3 left-3">
                          <span
                            className={`block font-display text-[10px] font-700 tracking-[0.2em] uppercase transition-colors ${
                              on ? "text-text" : "text-text/80"
                            }`}
                          >
                            {s.name}
                          </span>
                          <span className="mt-1 block font-display text-[9px] font-500 tracking-[0.15em] text-muted uppercase">
                            {s.spec}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Step 2 */}
            <fieldset>
              <legend className="font-display text-[10px] font-700 tracking-[0.35em] text-text uppercase">
                STEP 2 · ADD TOPPINGS
              </legend>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {toppings.map((t) => {
                  const on = picked.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggle(t.key)}
                      aria-pressed={on}
                      className={`flex items-center gap-4 overflow-hidden border pr-4 text-left transition-all duration-300 ${
                        on
                          ? "border-text bg-text/10"
                          : "border-stroke bg-transparent hover:border-text/45"
                      }`}
                    >
                      <span className="relative block h-[72px] w-[72px] shrink-0 overflow-hidden">
                        <Image
                          src={t.image}
                          alt=""
                          fill
                          sizes="72px"
                          className={`object-cover transition-all duration-300 ${
                            on ? "opacity-100 grayscale-0" : "opacity-60 grayscale"
                          }`}
                        />
                      </span>

                      <span
                        className={`flex-1 font-display text-[10px] font-700 tracking-[0.2em] uppercase transition-colors ${
                          on ? "text-text" : "text-text/80"
                        }`}
                      >
                        {t.name}
                      </span>

                      <span className="font-display text-[10px] font-600 tracking-[0.15em] text-muted uppercase tabular-nums">
                        {t.price === 0 ? "FREE" : `+$${t.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* ------------------ preview ------------------ */}
          <div className="cfg-col order-1 flex flex-col overflow-hidden border border-stroke bg-bg md:order-2">
            <div className="relative flex-1 min-h-[320px] md:min-h-[480px]">
              <Image
                key={size.key}
                src={size.image}
                alt={`${size.name} preview`}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
                priority={false}
              />
              <span className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-transparent" />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-text/25 pb-4 font-display text-[10px] font-700 tracking-[0.25em] uppercase">
                <span className="text-text">{size.name}</span>
                <span className="text-muted tabular-nums">${size.price}</span>
              </div>

              {picked.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {toppings
                    .filter((t) => picked.includes(t.key))
                    .map((t) => (
                      <li
                        key={t.key}
                        className="flex justify-between font-display text-[10px] font-500 tracking-[0.2em] text-muted uppercase tabular-nums"
                      >
                        <span>+ {t.name}</span>
                        <span>{t.price === 0 ? "FREE" : `+$${t.price}`}</span>
                      </li>
                    ))}
                </ul>
              )}

              <div className="mt-8 flex items-end justify-between border-t border-text/25 pt-6">
                <span className="font-display text-[10px] font-700 tracking-[0.35em] text-muted uppercase">
                  TOTAL BUILD
                </span>
                <span
                  ref={priceRef}
                  className="font-anton text-6xl tabular-nums text-text"
                >
                  ${total}
                </span>
              </div>

              <button
                type="button"
                onClick={addBuild}
                className="btn-solid mt-6 w-full py-5 font-display text-sm font-700 tracking-[0.3em] uppercase"
              >
                ADD BUILD TO ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
