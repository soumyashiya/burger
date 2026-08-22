# PRIME — THE STACK

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
    checkout/     /checkout route — details, payment, confirmation
    orders/       /orders route — past orders, reorder
  cart/           CartContext — order state, persistence, checkout
  components/     Header, Footer, Logo, SectionHeading, SmoothScroll,
                  CartButton, CartDrawer
    order/        OrderField, OrderTotals, PageChrome
    hero/         HeroSequence, HeroHud, AudioGate
  sections/       LineUp, Configurator, Overview, StatStrip,
                  Sear, Craft, TheCut, Story, Reservation
  animations/     gsap (registration + guards), reveal, parallax,
                  countUp, horizontalScroll, pinSection, scrollLock
  data/           all copy and configuration, separated from presentation
scripts/
  generate-assets.mjs
```

Server components by default; `"use client"` only where GSAP, pointer
interaction, or state is actually needed.

## Ordering

`CartProvider` wraps the page and owns the basket. Both entry points feed it:
The Line-Up's **Add to order** adds a fixed build, and the configurator's **Add
build to order** adds whatever is currently configured, priced from the size
plus its toppings.

A build's line id is `build:<size>:<sorted topping keys>`, so the same
combination picked in a different order stacks onto one line rather than
creating a near-duplicate. Menu items key off their index.

The basket persists to `localStorage` under `prime.order.v1`. It is read in an
effect rather than seeded into `useState`, because the server renders an empty
basket and reading during render would make the first client paint disagree
with the server markup — the count badge is likewise held back until that read
completes.

The drawer is the **basket** only — quantities, removal, collection vs
delivery. Everything past that lives on its own route, `/checkout`, so the
review stays dismissable and the checkout gets a real URL:

| Where | Covers |
| --- | --- |
| Drawer | Quantities, removal, collection vs delivery, reorder |
| `/checkout` · 01 | How would you like it |
| `/checkout` · 02 | Name, phone, email, address (delivery only), time slot, kitchen note |
| `/checkout` · 03 | Card or pay-at-counter |

`CartProvider` sits in the root layout rather than on the home page, so the
basket survives navigation between the two. `/checkout` is `noindex` — a
checkout has nothing to offer a crawler — and it renders a summary sidebar
that sticks alongside the form on desktop and stacks under it on mobile.

Arriving at `/checkout` directly with an empty basket gets a dedicated empty
state, and the page waits for `hydrated` before deciding that: storage has not
been read on first paint, so rendering "nothing to check out" immediately would
flash the wrong screen at anyone arriving with a full basket.

Totals are `subtotal + delivery + tax`. Delivery is a flat fee, waived on
collection; tax applies to the food only so the delivery charge is not taxed
twice. Time slots are built from the clock at open — not hardcoded — so they
are always in the future, and rebuilding on open stops a long-idle tab
offering times that have already passed.

Validation refuses obviously unusable input rather than merely colouring a
border: emails and phones are format-checked, card numbers must pass a Luhn
check digit, and expiry must parse as MM/YY and still be in the future. Errors
are wired to their input with `aria-describedby`. Only the last four digits of
a card are ever retained.

Placed orders go into a capped history (20) under `prime.orders.history.v1`.
The drawer surfaces the last three for a quick **Reorder**; the full record
lives at **`/orders`** — reference, timestamp, fulfilment, slot, payment,
itemised lines, kitchen note and totals per order, with a running count and
lifetime spend, one-click reorder, and a clear-history control. Reordering from
there refills the basket and returns you to the menu with the drawer open.

`/orders` is reached from the footer, from the drawer's reorder block, and from
the post-checkout confirmation. It is `noindex` — the history is personal to
the device and empty to a crawler. Timestamps are formatted with the browser's
own locale, which is safe here because the data only exists client-side; there
is no server render to disagree with.

There is no backend: placing an order confirms client-side and mints a
reference. It sends no email, takes no payment and reaches no kitchen, and the
confirmation says so rather than implying a receipt is on its way. Swapping in
a real endpoint means changing `placeOrder` and nothing else.

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
