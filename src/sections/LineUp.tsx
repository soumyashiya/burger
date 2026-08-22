"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { gsap } from "@/animations/gsap";
import { revealOnScroll } from "@/animations/reveal";
import SectionHeading from "@/components/SectionHeading";
import { useCart } from "@/cart/CartContext";
import { menu } from "@/data/menu";

export default function LineUp() {
  const root = useRef<HTMLElement>(null);
  const { add } = useCart();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".menu-head", { y: 30 });
      revealOnScroll(".menu-card", { y: 56, stagger: 0.12, duration: 1.1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="line-up" className="bg-bg px-6 py-28 md:px-12">
      <div className="mx-auto max-w-[1300px]">
        <SectionHeading
          className="menu-head mb-16 border-b border-text/25 pb-8"
          eyebrow="THE MENU // SELECT YOUR BUILD"
          index="// 01."
          title="THE LINE-UP"
          aside={
            <p className="hidden font-display text-[11px] font-600 tracking-[0.24em] text-muted uppercase md:block">
              3 BUILDS · MADE TO ORDER
            </p>
          }
        />

        <div className="grid gap-px bg-stroke md:grid-cols-3">
          {menu.map((item) => (
            <article
              key={item.name}
              className="menu-card group relative flex flex-col overflow-hidden bg-bg transition-colors duration-500 hover:bg-surface"
            >
              {/* media */}
              <div className="relative h-[260px] overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.name} — ${item.tier.toLowerCase()} build`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/10 to-transparent" />

                <span className="absolute top-4 left-4 border border-text/40 bg-black/70 px-3 py-1 font-display text-[9px] font-600 tracking-[0.25em] text-text uppercase backdrop-blur-sm">
                  {item.index} / {item.tier}
                </span>
              </div>

              {/* body */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-baseline justify-between gap-4 border-b border-stroke pb-4">
                  <h3 className="font-anton text-3xl text-text uppercase">
                    {item.name}
                  </h3>
                  <span className="font-anton text-3xl text-text tabular-nums">
                    {item.price}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {item.copy}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-stroke px-2.5 py-1 font-display text-[9px] font-600 tracking-[0.18em] text-muted uppercase"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() =>
                    add({
                      id: `menu:${item.index}`,
                      name: item.name,
                      meta: `${item.index} · ${item.tier}`,
                      // Prices are authored as display strings ("$28").
                      price: Number(item.price.replace(/[^0-9.]/g, "")),
                      image: item.image,
                    })
                  }
                  className="btn-brut mt-auto flex w-full items-center justify-center gap-2 pt-4 pb-4 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
                  style={{ marginTop: "1.5rem" }}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  ADD TO ORDER
                  <span className="sr-only"> — {item.name}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
