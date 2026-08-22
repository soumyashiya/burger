"use client";

import type Lenis from "lenis";

/**
 * Page scroll is driven by Lenis, so overlays cannot just set `overflow:
 * hidden` — Lenis keeps running its own RAF loop and the page carries on
 * moving underneath. Anything that covers the viewport locks through here.
 */
let lenis: Lenis | null = null;

/** Nested locks (gate + drawer) must not unlock each other prematurely. */
let locks = 0;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  // The scrolling element is <html>, not <body> — locking only the body still
  // lets the wheel move the page.
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}
