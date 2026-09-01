"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/cart/CartContext";
import { lockScroll, unlockScroll } from "@/animations/scrollLock";

export default function CartDrawer() {
  const {
    lines,
    subtotal,
    count,
    isOpen,
    placed,
    close,
    setQty,
    remove,
    clear,
    placeOrder,
  } = useCart();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Lock the page behind the panel and restore on close. */
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  /* Escape closes; focus moves into the panel on open. */
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      // Keep tabbing inside the panel while it owns the screen.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      {/* backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[70] bg-black/80 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className={`fixed top-0 right-0 z-[71] flex h-full w-full flex-col border-l border-text/25 bg-bg transition-transform duration-400 ease-out sm:w-[440px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ---------------- header ---------------- */}
        <div className="flex items-center justify-between border-b border-text/25 px-6 py-5">
          <div>
            <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase">
              BRENN // ORDER
            </p>
            <h2 className="mt-1 font-anton text-3xl text-text uppercase">
              {placed ? "Order placed" : "Your order"}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close order panel"
            className="btn-brut flex h-10 w-10 shrink-0 items-center justify-center"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ---------------- body ---------------- */}
        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain">
          {placed ? (
            <div className="px-6 py-10 text-center">
              <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase">
                CONFIRMATION
              </p>
              <p className="mt-3 font-anton text-5xl text-text tabular-nums">
                {placed.ref}
              </p>
              <span className="mx-auto mt-6 block h-px w-16 bg-text" />
              <p className="mt-6 text-sm leading-relaxed text-muted">
                {placed.lines.reduce((n, l) => n + l.qty, 0)} item
                {placed.lines.reduce((n, l) => n + l.qty, 0) === 1 ? "" : "s"} ·
                ${placed.total} · on the pass in about 20 minutes. Quote the
                reference at the counter.
              </p>

              <ul className="mt-8 space-y-2 text-left">
                {placed.lines.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-baseline justify-between gap-4 border-b border-stroke py-2 font-display text-[10px] font-600 tracking-[0.18em] uppercase"
                  >
                    <span className="text-text/70">
                      {l.qty} × {l.name}
                    </span>
                    <span className="text-text tabular-nums">
                      ${l.price * l.qty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : lines.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-anton text-2xl text-text/40 uppercase">
                Nothing on the pass
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Pick a build from the line-up, or put one together yourself in
                Build Your Brenn.
              </p>
              <button
                type="button"
                onClick={close}
                className="btn-brut mt-8 px-6 py-3 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
              >
                Back to the menu
              </button>
            </div>
          ) : (
            <ul>
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4 border-b border-stroke px-6 py-5"
                >
                  <span className="relative block h-[76px] w-[76px] shrink-0 overflow-hidden border border-stroke">
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      sizes="76px"
                      className="object-cover"
                    />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="truncate font-anton text-xl text-text uppercase">
                        {line.name}
                      </h3>
                      <span className="shrink-0 font-anton text-xl text-text tabular-nums">
                        ${line.price * line.qty}
                      </span>
                    </div>

                    <p className="mt-1 truncate font-display text-[9px] font-500 tracking-[0.2em] text-muted uppercase">
                      {line.meta}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label={`Remove one ${line.name}`}
                          className="btn-brut flex h-8 w-8 items-center justify-center"
                        >
                          <Minus className="h-3 w-3" aria-hidden="true" />
                        </button>
                        <span
                          aria-live="polite"
                          className="w-10 text-center font-display text-sm font-700 text-text tabular-nums"
                        >
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label={`Add one ${line.name}`}
                          className="btn-brut flex h-8 w-8 items-center justify-center"
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(line.id)}
                        className="font-display text-[9px] font-600 tracking-[0.2em] text-muted uppercase underline-offset-4 transition-colors hover:text-text hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------------- footer ---------------- */}
        {!placed && lines.length > 0 && (
          <div className="border-t border-text/25 px-6 py-6">
            <div className="flex items-end justify-between">
              <span className="font-display text-[10px] font-700 tracking-[0.35em] text-muted uppercase">
                Subtotal · {count} item{count === 1 ? "" : "s"}
              </span>
              <span className="font-anton text-4xl text-text tabular-nums">
                ${subtotal}
              </span>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              className="btn-solid mt-5 w-full py-5 font-display text-sm font-700 tracking-[0.3em] uppercase"
            >
              Place order
            </button>

            <button
              type="button"
              onClick={clear}
              className="mt-3 w-full font-display text-[9px] font-600 tracking-[0.25em] text-muted uppercase underline-offset-4 transition-colors hover:text-text hover:underline"
            >
              Empty the order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
