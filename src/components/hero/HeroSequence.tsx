"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/animations/gsap";
import { FRAME_COUNT, HERO_VIDEO, HERO_VIEWPORTS, cutSpecs } from "@/data/hero";
import AudioGate from "./AudioGate";
import HeroHud, { type HudRefs } from "./HeroHud";

/**
 * Progress bands for the pinned hero. Each text state owns a slice of the
 * 0→1 scrub, crossfading through the gaps between them. The last one holds to
 * the end so the unstack plays clean, with no copy over it.
 */
const BANDS = {
  title: { in: 0.0, hold: 0.0, out: 0.13 },
  specs: { in: 0.13, hold: 0.26, out: 0.4 },
  stack: { in: 0.4, hold: 0.52, out: 1.01 },
} as const;

/** Progress at which the footage starts pulling the stack apart. */
const UNSTACK_AT = 0.62;

/** Soft edge on both axes, so the 16:9 frame melts into the black letterbox. */
const EDGE_FADE = [
  "linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)",
  "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%)",
].join(", ");

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Trapezoid opacity: fades in, holds at 1, fades out. */
function bandOpacity(p: number, band: { in: number; hold: number; out: number }) {
  if (p < band.in) return 0;
  if (p < band.hold) return clamp01((p - band.in) / (band.hold - band.in));
  if (p < band.out) return 1 - clamp01((p - band.hold) / (band.out - band.hold) - 0.55) / 0.45;
  return 0;
}

function chipFor(p: number) {
  if (p < BANDS.specs.in) return "01 · OVERVIEW";
  if (p < 0.46) return "// PUSH-IN";
  if (p < UNSTACK_AT) return "02 · THE CUT";
  if (p < 0.9) return "// UNSTACK";
  return "03 · THE STACK";
}

function sectionFor(p: number) {
  const n = p < BANDS.specs.in ? 1 : p < UNSTACK_AT ? 2 : 3;
  return `SECTION 0${n} / 05`;
}

function timecode(p: number) {
  const totalFrames = Math.round(p * (FRAME_COUNT - 1));
  const f = totalFrames % HERO_VIDEO.fps;
  const s = Math.floor(totalFrames / HERO_VIDEO.fps) % 60;
  return `00:06:${String(10 + s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

export default function HeroSequence() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const tempRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);


  const hud = useRef<HudRefs>({
    timecode: null,
    frame: null,
    section: null,
    chip: null,
  });

  /** Time the scroll position wants; the rAF loop chases it. */
  const targetTime = useRef(0);
  const durationRef = useRef<number>(HERO_VIDEO.duration);

  const [src, setSrc] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);

  /* ---------------- source selection ---------------- */
  // Picked on the client so narrow viewports never pull the 1080p cut. Done in
  // an effect rather than at render so SSR and hydration agree on `null`.
  useEffect(() => {
    setSrc(
      window.innerWidth < HERO_VIDEO.smallBreakpoint
        ? HERO_VIDEO.srcSmall
        : HERO_VIDEO.src,
    );
  }, []);

  /* ---------------- video readiness ---------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        durationRef.current = video.duration;
      }
      setReady(true);
    };

    // If the file fails to load we still mark ready, so the pin and every text
    // state are built — the stage just falls back to the poster.
    const onError = () => setReady(true);

    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("error", onError);
    };
  }, [src]);

  /* ---------------- seek loop ---------------- */
  // Seeking straight from the scroll handler queues seeks faster than the
  // decoder retires them, which stalls Safari. Instead we keep the desired time
  // in a ref and issue at most one seek per animation frame, skipping while a
  // previous seek is still in flight.
  useEffect(() => {
    if (!ready) return;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const video = videoRef.current;
      if (!video || video.seeking || video.readyState < 2) return;

      const want = targetTime.current;
      // Half a frame of slack — below that the seek would land on the same
      // frame we are already showing.
      if (Math.abs(video.currentTime - want) < 0.5 / HERO_VIDEO.fps) return;
      video.currentTime = want;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  /* ---------------- scroll-driven sequence ---------------- */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const wrap = wrapRef.current;
    if (!stage || !wrap) return;

    // Reduced motion: show the opening state, skip the pin entirely.
    if (prefersReducedMotion()) {
      gsap.set([specsRef.current, stackRef.current], {
        opacity: 0,
        display: "none",
      });
      gsap.set(titleRef.current, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const apply = (p: number) => {
        // 1 — video playhead. Stop a hair short of the duration: seeking to the
        // exact end can pop the element into its "ended" state and blank out.
        targetTime.current = clamp01(p) * (durationRef.current - 0.05);

        // 2 — text states
        if (titleRef.current)
          titleRef.current.style.opacity = String(bandOpacity(p, BANDS.title));
        if (specsRef.current)
          specsRef.current.style.opacity = String(bandOpacity(p, BANDS.specs));
        if (stackRef.current)
          stackRef.current.style.opacity = String(bandOpacity(p, BANDS.stack));

        // 3 — grill temperature readout inside the specs state
        if (tempRef.current) {
          const t = clamp01((p - BANDS.specs.in) / (BANDS.specs.out - BANDS.specs.in));
          tempRef.current.textContent = `${Math.round(t * 230)}°C`;
        }

        // 4 — HUD telemetry
        const h = hud.current;
        if (h.frame)
          h.frame.textContent = `FRAME ${String(
            Math.round(p * (FRAME_COUNT - 1)),
          ).padStart(3, "0")} / ${FRAME_COUNT}`;
        if (h.timecode) h.timecode.textContent = timecode(p);
        if (h.chip) h.chip.textContent = chipFor(p);
        if (h.section) h.section.textContent = sectionFor(p);
      };

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * HERO_VIEWPORTS}`,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Pinned sections must re-measure in page order, highest first, or the
        // ones below inherit stale offsets that ignore this pin's spacer.
        refreshPriority: 3,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });

      apply(0);

      // The hero pin is created after the frame images resolve, which is later
      // than every section below it. Those triggers measured the document
      // without this pin's 6-viewport spacer, so their start/end values are
      // stale until we force a re-measure.
      ScrollTrigger.refresh();
    }, wrapRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* ---------------- entry gate ---------------- */
  useEffect(() => {
    if (entered) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  const handleEnter = () => {
    setEntered(true);
    document.body.style.overflow = "";

    // iOS refuses to decode a video that has never been played from a user
    // gesture, so seeks silently do nothing. The gate click is that gesture:
    // start it and immediately pause to unlock the decoder.
    const video = videoRef.current;
    if (video) {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => video.pause()).catch(() => {});
      } else {
        video.pause();
      }
    }
    // Gold flash as the shot "cuts" to camera
    const flash = flashRef.current;
    if (flash && !prefersReducedMotion()) {
      flash.classList.remove("anim-gold-flash");
      void flash.offsetWidth;
      flash.classList.add("anim-gold-flash");
    }
    ScrollTrigger.refresh();
  };

  return (
    <div ref={wrapRef} id="top">
      <div
        ref={stageRef}
        className="h-stage relative w-full overflow-hidden bg-black"
      >
        {/* ---------- scrubbed video ---------- */}
        {/*
          `.hero-video` (globals.css) picks contain vs cover off the viewport
          aspect. It constrains the element with max-width/max-height rather
          than stretching it and leaning on `object-contain`, so the element's
          own box always matches the picture — which is what lets the edge mask
          below land on the frame instead of out in the letterbox.
        */}
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          <video
            ref={videoRef}
            {...(src ? { src } : {})}
            poster={HERO_VIDEO.poster}
            muted
            playsInline
            preload="auto"
            // No `loop`/`autoplay`: the playhead is driven entirely by scroll.
            disablePictureInPicture
            className="hero-video"
            // The frame's own edges are lit, so where they meet the letterbox
            // they leave a hard seam. Dissolving the outer few percent on both
            // axes reads as the shot fading into the stage.
            style={{
              maskImage: EDGE_FADE,
              WebkitMaskImage: EDGE_FADE,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Accessible description of the visual sequence */}
        <p className="sr-only">
          A slow camera push across the PRIME double-smash stack, which then
          separates into its individual layers.
        </p>

        {/* ---------- grading & camera treatment ---------- */}
        {/* Centred composition, so the scrim runs top-to-bottom rather than
            banking to the left edge the way it did for left-aligned copy. */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-linear-to-b from-black/75 from-0% via-transparent via-40% to-black/95 to-100%" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-black/25 md:hidden" />
        <div className="cam-vignette pointer-events-none absolute inset-0 z-[5]" />
        <div className="cam-scanlines pointer-events-none absolute inset-0 z-[5] opacity-60" />
        <div className="cam-grid pointer-events-none absolute inset-0 z-[5] opacity-40" />
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 z-[6] bg-accent opacity-0"
        />

        {/* ---------- HUD ---------- */}
        <HeroHud refs={hud} />

        {/* ---------- STATE 01 — title ---------- */}
        {/* Centred and split into two bands: the headline rides above the
            stack, the standfirst sits below it, and the shot fills the gap. */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between px-6 pt-[13vh] pb-[21vh] text-center"
        >
          <h1 className="font-anton leading-[0.76] text-text uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            <span className="block text-[clamp(2rem,5.5vw,4.5rem)] tracking-[0.16em]">
              PRIME
            </span>
            <span className="block text-[clamp(4rem,14vw,12rem)]">BURGER</span>
          </h1>

          <p className="max-w-sm text-xs leading-relaxed text-text/85 [text-shadow:0_2px_14px_rgba(0,0,0,0.95)] md:text-sm">
            Two dry-aged patties, a double sear and eight layers built to hold
            together to the last bite. Dry-aged, stacked, seared — order yours.
          </p>
        </div>

        {/* ---------- STATE 02 — the cut ---------- */}
        <div
          ref={specsRef}
          // No headline on this state — it sat across the middle of the frame
          // and buried the shot. The readout carries it instead.
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end px-6 pb-[19vh] text-center opacity-0"
        >
          <div className="w-full max-w-lg drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            <p className="font-display text-[10px] font-600 tracking-[0.3em] text-text/80 uppercase">
              GRILL TEMP:
            </p>
            <span
              ref={tempRef}
              className="block font-anton text-[clamp(3rem,7vw,5.5rem)] leading-none tabular-nums text-text"
            >
              0°C
            </span>

            <dl className="mt-6 grid grid-cols-2 gap-x-8 sm:grid-cols-3">
              {cutSpecs.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-3 border-b border-stroke py-2 font-display text-[9px] font-600 tracking-[0.16em] uppercase"
                >
                  <dt className="text-text/55">{row.label}</dt>
                  <dd className="text-text">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ---------- STATE 03 — the stack ---------- */}
        <div
          ref={stackRef}
          // Headline dropped like state 02's — it covered the unstack.
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end px-6 pb-[19vh] text-center opacity-0"
        >
          <div className="max-w-md [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">
            <p className="text-xs leading-relaxed text-text/85 md:text-sm">
              Eight layers, built like a structure. Brioche, butter lettuce,
              beefsteak tomato, aged cheddar, a double sear, caramelised onion
              and the house sauce.
            </p>
            <p className="mt-6 font-display text-[10px] font-600 tracking-[0.3em] text-text/70 uppercase">
              SEAR PROFILE:
              <span className="ml-3 bg-text px-2 py-1 text-bg">MAILLARD +</span>
            </p>
          </div>
        </div>

        {/* ---------- scroll prompt ---------- */}
        {entered && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[104px] z-30 flex flex-col items-center gap-1.5">
            <span className="font-display text-[9px] font-600 tracking-[0.35em] text-muted uppercase">
              SCROLL DOWN TO BEGIN
            </span>
            <span className="anim-scroll-down font-display text-xs text-text">↓</span>
          </div>
        )}

        {/* ---------- entry gate ---------- */}
        {!entered && <AudioGate onEnter={handleEnter} />}
      </div>
    </div>
  );
}
