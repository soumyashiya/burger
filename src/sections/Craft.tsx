"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { revealOnScroll } from "@/animations/reveal";
import { craftTiles } from "@/data/craft";

export default function Craft() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".craft-head", { y: 30 });
      revealOnScroll(".craft-tile", { y: 30, stagger: 0.05, duration: 0.9 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="craft" className="bg-bg py-24">
      <div className="page-shell">
        <div className="craft-head mb-14 flex items-end justify-between border-b border-text/25 pb-6">
          <div>
            <p className="mb-3 font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase md:text-[11px]">
              // 05. THE CRAFT
            </p>
            <h2 className="font-anton text-4xl leading-[0.88] text-text uppercase md:text-6xl">
              Every layer. Uncompromised.
            </h2>
          </div>

          <p className="hidden max-w-xs text-right text-sm leading-relaxed text-muted md:block">
            Nine components, each sourced or made for one job. If a layer cannot
            justify itself, it does not go on the bun.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-px bg-stroke md:grid-cols-3">
          {craftTiles.map((tile) => (
            <li
              key={tile.title}
              className="craft-tile group relative h-40 overflow-hidden bg-bg md:h-52"
            >
              <Image
                src={tile.image}
                alt={tile.title}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

              <span className="absolute bottom-0 left-0 p-4 md:p-5">
                <span className="block font-anton text-lg text-text uppercase md:text-xl">
                  {tile.title}
                </span>
                <span className="mt-1 block font-display text-[10px] font-500 tracking-[0.2em] text-muted uppercase">
                  {tile.meta}
                </span>
              </span>

              <span
                aria-hidden="true"
                className="absolute top-3 right-3 h-4 w-4 border-t border-r border-text opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </li>
          ))}
        </ul>

        <div className="mt-14 flex items-center gap-6 border-t border-text/25 pt-6">
          <span className="font-display text-[10px] font-700 tracking-[0.3em] text-text uppercase">
            09 COMPONENTS
          </span>
          <span className="h-px flex-1 bg-stroke" />
          <span className="font-display text-[10px] font-600 tracking-[0.2em] text-muted uppercase">
            NO SHORTCUTS
          </span>
        </div>
      </div>
    </section>
  );
}
