"use client";

import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

/**
 * Pins a full-height stage and returns a scrubbed timeline whose total
 * duration is 1, so every step can be placed in normalised progress space
 * (0 → 1) regardless of how many viewports the pin actually lasts.
 */
export function pinnedTimeline(
  stage: HTMLElement,
  { viewports = 3, scrub = 0.6 }: { viewports?: number; scrub?: number } = {},
) {
  if (prefersReducedMotion()) return null;

  return gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: () => `+=${window.innerHeight * viewports}`,
      pin: true,
      scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}

export { ScrollTrigger };
