# BRENN — THE STACK

A Next.js recreation of the layout, design system, and scroll choreography of
`the-prime-original.vercel.app`.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens in `globals.css`) |
| Scroll | Lenis, ticked from GSAP's RAF loop |
| Animation | GSAP + ScrollTrigger |
| Icons | lucide-react |

## Getting started

```bash
npm install
npm run assets   # generates every image into /public (see below)
npm run dev
```

`npm run build` produces a clean production build with no type errors.

## Design tokens

Defined once in `src/app/globals.css` under `@theme`, consumed everywhere as
Tailwind utilities (`bg-bg`, `text-muted`, `border-stroke`, `font-display`…).

The system is monochrome — there is no hue anywhere. Hierarchy is carried by
value, weight and scale alone, and `accent` is simply the brightest step on the
ramp (pure white) wherever a highlight is needed.

```
--color-bg      #000000    --color-text    #ffffff
--color-surface #0a0a0a    --color-muted   #6e6e6e
--color-stroke  #262626    --color-accent  #ffffff

--font-anton    Anton      (headlines, numerals — ONE weight, never bold it)
--font-display  Archivo    (UI chrome, tracked micro-labels, HUD)
--font-body     Archivo    (paragraph copy)
```

Both faces load through `next/font`, which mints its own family name at build
time. The `@theme` keys therefore point at the CSS variables next/font sets —
and those variables carry an `-src` suffix (`--font-anton-src`) so they do not
collide with the Tailwind theme keys of the same name.

Emphasis is expressed by **inversion** rather than colour: `.btn-brut` is an
outline that fills white on hover, `.btn-solid` is white that empties out.
Corner radius is 0 everywhere; cards are separated by `gap-px` over a
`bg-stroke` parent, so the dividers are true hairlines.

The chrome is monochrome; the **photography is not**. Every image renders in
full colour against the black — it is the only colour in the page, alongside
the hero video, which is the point. The one exception is the configurator,
where `grayscale` is doing a job rather than setting a mood: unpicked sizes and
toppings sit desaturated and dimmed, and snap to colour when selected, so the
current build is readable at a glance.

## Structure

```
src/
  app/            layout, page, globals.css
  components/     Header, Footer, Logo, SectionHeading, SmoothScroll
    hero/         HeroSequence, HeroHud, AudioGate
  sections/       LineUp, Configurator, Overview, StatStrip,
                  Sear, Craft, TheCut, Story, Reservation
  animations/     gsap (registration + guards), reveal, parallax,
                  countUp, horizontalScroll, pinSection
  data/           all copy and configuration, separated from presentation
scripts/
  generate-assets.mjs
```

Server components by default; `"use client"` only where GSAP, pointer
interaction, or state is actually needed.

## Scroll architecture

Three sections pin. Because a pinned section inserts a spacer that shifts
everything below it, **pinned triggers must re-measure in page order** — they
carry descending `refreshPriority`:

| Section | Pin length | `refreshPriority` |
| --- | --- | --- |
| Hero (video scrub) | 6 viewports | 3 |
| The Sear (heat sequence) | 3 viewports | 2 |
| The Cut (horizontal) | track overflow | 1 |

Without this, sections below the hero measure their start offsets before the
hero's spacer exists and activate hundreds of pixels too early.

### Hero

A `<video>` fills the stage and its playhead is driven by scroll progress —
nothing autoplays. Scroll writes the wanted time into a ref and a `requestAnimationFrame`
loop issues at most one seek per frame, skipping while a previous seek is still
in flight; queueing seeks straight from the scroll handler stalls Safari.

The source `hero-videoo.mp4` carries only three keyframes across its ten
seconds, so an arbitrary seek forces the decoder to replay up to six seconds of
frames. `hero-scrub.mp4` (1920w) and `hero-scrub-sm.mp4` (960w, served under
820px of viewport) are all-keyframe re-encodes of it, which makes every seek
O(1) — see `src/data/hero.ts` for the ffmpeg command.

Fit is aspect-aware (`.hero-video` in `globals.css`). The footage is 16:9 and
the stage is always the full viewport, so wider-than-16:9 screens letterbox —
`cover` there would crop the bun and the base away — while taller ones fill and
lose the sides. A soft mask on the element's edges keeps the letterbox from
showing a hard seam.

The composition is centred: the headline rides above the stack, the standfirst
sits below it, and the shot fills the gap. Only the opening state carries a
headline — states 02 and 03 are the footage plus their bottom content, because
type across the middle of the frame buried the shot.

The same progress drives three text states, the grill-temperature readout, and
every HUD value (timecode, frame counter, section chip). All of it is written
imperatively through refs, so scrubbing never triggers a React render.

## Assets

The 20 photographs in `/public` were generated with Magnific, one prompt per
asset written against that asset's own copy — so the bacon tile is bacon, the
Ellis Island card is a liner at the New York docks, and the Sear plates are
charcoal. They share a single art direction (deep black background, dramatic
rim light, shallow depth of field) so the set reads as one shoot.

- `menu/*.webp` — 1200×932 &nbsp;·&nbsp; `ingredients/*.webp` — 1000×1000
- `grill/*.webp` — 1920×1080 &nbsp;·&nbsp; `story/*.webp` — 1200×744
- `hero-scrub*.mp4`, `hero-poster.jpg`, `textures/grain.png`, `favicon.svg`

Each was crop-to-filled to the aspect its layout expects, so nothing is
letterboxed or squashed at render time. Sizes are ~1.3× the largest rendered
box, which holds up on a 2× display without shipping needless bytes.

To swap in different photography, drop files at the same paths. No code changes
are needed — paths live in `src/data/*`. Note that Next caches optimised copies
under `.next/cache/images`: replacing a file at an unchanged path will keep
serving the old render until that cache is cleared.

`scripts/generate-assets.mjs` still produces the original procedural
placeholders, and `public/frames/prime` still holds the pre-video hero
sequence; neither is referenced by the site any more.

All body copy is likewise original to this project.

## Responsive & accessibility

- Breakpoints exercised from 320px through 1920px+.
- The horizontal gallery drops its pin below `md` and becomes a native
  swipeable scroller — a hijacked pin feels wrong on touch.
- Semantic landmarks, real `<button>`/`<fieldset>`/`<legend>` controls,
  `aria-pressed` on every toggle, visible `:focus-visible` rings, and a
  scroll-spy that sets `aria-current` on the active nav item.
- `prefers-reduced-motion` is respected in both CSS and JS: Lenis is skipped,
  pins are not created, and each scroll sequence renders its final legible
  state instead.
