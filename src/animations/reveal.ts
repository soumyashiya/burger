"use client";

import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

type RevealOptions = {
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  start?: string;
  ease?: string;
  blur?: boolean;
};

/**
 * Standard entrance: rise + fade as the element enters the viewport.
 * Returns nothing — always call inside a gsap.context() so it reverts.
 */
export function revealOnScroll(
  targets: gsap.TweenTarget,
  {
    y = 40,
    duration = 1,
    stagger = 0.08,
    delay = 0,
    start = "top 85%",
    ease = "power3.out",
    blur = false,
  }: RevealOptions = {},
) {
  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0, filter: "none" });
    return;
  }

  gsap.fromTo(
    targets,
    { opacity: 0, y, ...(blur ? { filter: "blur(10px)" } : null) },
    {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: "blur(0px)" } : null),
      duration,
      stagger,
      delay,
      ease,
      scrollTrigger: { trigger: targets as gsap.DOMTarget, start, once: true },
    },
  );
}

/**
 * Mask reveal for headings: each line slides up out of an overflow-hidden
 * wrapper. Expects markup shaped as `.reveal-line > span`.
 */
export function revealLines(
  scope: HTMLElement,
  selector = ".reveal-line > *",
  { start = "top 85%", stagger = 0.1, duration = 1.1 } = {},
) {
  const lines = scope.querySelectorAll(selector);
  if (!lines.length) return;

  if (prefersReducedMotion()) {
    gsap.set(lines, { yPercent: 0, opacity: 1 });
    return;
  }

  gsap.fromTo(
    lines,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration,
      stagger,
      ease: "expo.out",
      scrollTrigger: { trigger: scope, start, once: true },
    },
  );
}

/** Scroll-linked parallax on a transform (never on layout properties). */
export function parallax(
  target: gsap.TweenTarget,
  { amount = 120, trigger }: { amount?: number; trigger?: Element } = {},
) {
  if (prefersReducedMotion()) return;

  gsap.fromTo(
    target,
    { yPercent: 0 },
    {
      y: amount,
      ease: "none",
      scrollTrigger: {
        trigger: (trigger ?? target) as gsap.DOMTarget,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
}

/**
 * Counts a number up when it scrolls into view.
 * `el.textContent` is written directly to avoid React re-renders per frame.
 */
export function countUp(
  el: HTMLElement,
  to: number,
  { duration = 1.8, decimals = 0, start = "top 85%" } = {},
) {
  const format = (v: number) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();

  if (prefersReducedMotion()) {
    el.textContent = format(to);
    return;
  }

  const state = { v: 0 };
  gsap.to(state, {
    v: to,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = format(state.v);
    },
    scrollTrigger: { trigger: el, start, once: true },
  });
}

export { ScrollTrigger };
