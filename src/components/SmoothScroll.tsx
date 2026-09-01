"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/animations/gsap";
import { registerLenis } from "@/animations/scrollLock";

/**
 * Drives the whole page with Lenis and keeps GSAP ScrollTrigger in sync.
 *
 * ScrollTrigger must be ticked from Lenis' RAF loop (not its own) or pinned
 * sections drift a frame behind the smoothed scroll position.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Users who ask for reduced motion get plain native scrolling.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native momentum on touch feels better than a JS emulation
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);
    registerLenis(lenis);

    // Dev-only handle so scroll positions can be driven deterministically
    // while testing. Never present in a production bundle.
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Late-loading images and web fonts change section offsets, so re-measure
    // once everything has settled.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(onLoad).catch(() => {});

    // In-page anchors go through Lenis so they land smoothly.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -64, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("load", onLoad);
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
