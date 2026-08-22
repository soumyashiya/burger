"use client";

import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

/**
 * True scroll-driven horizontal movement: the section pins, the track
 * translates on the X axis for exactly its overflow width, then releases and
 * vertical scrolling resumes.
 *
 * Returns a cleanup-safe timeline; call inside gsap.context().
 */
export function horizontalScroll(
  pinTarget: HTMLElement,
  track: HTMLElement,
  { extra = 0, refreshPriority = 0 }: { extra?: number; refreshPriority?: number } = {},
) {
  if (prefersReducedMotion()) return;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + extra);

  if (distance() <= 0) return;

  gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: pinTarget,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority,
    },
  });
}

export { ScrollTrigger };
