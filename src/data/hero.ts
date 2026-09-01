/**
 * The scroll-scrubbed hero video.
 *
 * `hero-videoo.mp4` (the source) only carries 3 keyframes across its 10s, so
 * seeking to an arbitrary time forces the decoder to replay up to 6s of frames
 * — unusable for scrubbing. The `hero-scrub*` files are all-keyframe re-encodes
 * of it, which makes every seek O(1). Regenerate with:
 *
 *   ffmpeg -i public/hero-videoo.mp4 -an -vf scale=1920:-2 -c:v libx264 \
 *     -g 1 -keyint_min 1 -sc_threshold 0 -crf 25 -movflags +faststart \
 *     public/hero-scrub.mp4
 */
export const HERO_VIDEO = {
  src: "/hero-scrub.mp4",
  /** Lighter cut served under `smallBreakpoint` px of viewport width. */
  srcSmall: "/hero-scrub-sm.mp4",
  smallBreakpoint: 820,
  poster: "/hero-poster.jpg",
  fps: 24,
  /** Fallback until metadata resolves; the real value comes off the element. */
  duration: 10.125,
} as const;

/** Total frames in the source video — drives the HUD frame counter. */
export const FRAME_COUNT = 243;

/** The hero pins for this many viewport heights before releasing. */
export const HERO_VIEWPORTS = 6;

/** Spec rows shown in hero state 02 — "THE CUT". */
export const cutSpecs = [
  { label: "GRILL TEMP", value: "230 °C" },
  { label: "DRY-AGED", value: "28 DAYS" },
  { label: "BEEF", value: "WAGYU × ANGUS" },
  { label: "CHEESE", value: "AGED CHEDDAR" },
  { label: "BUN", value: "BRIOCHE / SESAME" },
  { label: "STACK WEIGHT", value: "340 G" },
  { label: "SEAR", value: "MAILLARD +" },
] as const;

export const heroSpecs = {
  format: "4K · 24FPS · F2.8 · 1/50",
  slate: "BRENN // DOUBLE SMASH STACK",
  iso: "ISO 800",
  wb: "WB 5600K",
} as const;
