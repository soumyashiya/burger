"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// registerPlugin is idempotent, so a bare call is safe on every import.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Dev-only handles for inspecting trigger ranges while testing.
  if (process.env.NODE_ENV === "development") {
    Object.assign(window, { __gsap: gsap, __ScrollTrigger: ScrollTrigger });
  }
}

/** Single place to ask whether motion should be suppressed. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Desktop-only guard for pin/scrub work that is too heavy for phones. */
export const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

export { gsap, ScrollTrigger };
