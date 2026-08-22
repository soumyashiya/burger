"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { useCart } from "@/cart/CartContext";
import { lockScroll, unlockScroll } from "@/animations/scrollLock";
import { fulfilmentOptions } from "@/data/order";
import OrderTotals from "./order/OrderTotals";

/**
 * The basket. Everything past this point — details, payment, confirmation —
 * lives on /checkout, so the drawer stays a quick review you can dismiss.
 */
export default function CartDrawer() {
  const {
    lines,
    count,
    subtotal,
    deliveryFee,
    tax,
    total,
    fulfilment,
    setFulfilment,
    isOpen,
    history,
    close,
    setQty,
    remove,
    clear,
    reorder,
  } = useCart();

  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Lock the page behind the panel and restore on close. */
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  /* Escape closes; focus is moved in and kept inside the panel. */
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, textarea, [tabindex]:not([tabindex="-1"])',
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

  const goToCheckout = () => {
    close();
    router.push("/checkout");
  };

  return (
    <>
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
        // `invisible` when closed, or the off-screen controls stay in the tab
        // order and the accessibility tree — which also duplicates every
        // button on /checkout, where the drawer is mounted but unreachable.
        // Visibility is in the transition list so it only flips once the panel
        // has finished sliding out.
        className={`fixed top-0 right-0 z-[71] flex h-full w-full flex-col border-l border-text/25 bg-bg transition-[transform,visibility] duration-400 ease-out sm:w-[440px] ${
          isOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        {/* ---------------- header ---------------- */}
        <div className="flex items-center justify-between border-b border-text/25 px-6 py-5">
          <div>
            <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase">
              PRIME // ORDER
            </p>
            <h2 className="mt-1 font-anton text-3xl text-text uppercase">
              Your order
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
          {lines.length > 0 ? (
            <>
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

              <fieldset className="px-6 py-6">
                <legend className="font-display text-[9px] font-700 tracking-[0.3em] text-muted uppercase">
                  How would you like it
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {fulfilmentOptions.map((o) => {
                    const on = fulfilment === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setFulfilment(o.key)}
                        aria-pressed={on}
                        className={`border px-3 py-3 text-left transition-colors ${
                          on
                            ? "border-text bg-text/10"
                            : "border-stroke hover:border-text/45"
                        }`}
                      >
                        <span className="block font-display text-[10px] font-700 tracking-[0.2em] text-text uppercase">
                          {o.label}
                        </span>
                        <span className="mt-1 block font-display text-[9px] font-500 tracking-[0.12em] text-muted uppercase">
                          {o.note}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          ) : (
            <div className="px-6 py-14">
              <p className="text-center font-anton text-2xl text-text/40 uppercase">
                Nothing on the pass
              </p>
              <p className="mt-3 text-center text-sm leading-relaxed text-muted">
                Pick a build from the line-up, or put one together yourself in
                Build Your Prime.
              </p>
              <button
                type="button"
                onClick={close}
                className="btn-brut mx-auto mt-8 block px-6 py-3 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
              >
                Back to the menu
              </button>

              {history.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-[9px] font-700 tracking-[0.3em] text-muted uppercase">
                      Order again
                    </p>
                    <Link
                      href="/orders"
                      onClick={close}
                      className="font-display text-[9px] font-600 tracking-[0.2em] text-muted uppercase underline-offset-4 transition-colors hover:text-text hover:underline"
                    >
                      All orders →
                    </Link>
                  </div>
                  <ul className="mt-3">
                    {history.slice(0, 3).map((o) => (
                      <li
                        key={o.ref}
                        className="flex items-center justify-between gap-4 border-b border-stroke py-3"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-display text-[10px] font-700 tracking-[0.18em] text-text uppercase">
                            {o.ref} · ${o.total}
                          </span>
                          <span className="mt-0.5 block truncate font-display text-[9px] font-500 tracking-[0.16em] text-muted uppercase">
                            {o.lines
                              .map((l) => `${l.qty}× ${l.name}`)
                              .join(", ")}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => reorder(o)}
                          className="btn-brut flex shrink-0 items-center gap-1.5 px-3 py-2 font-display text-[9px] font-700 tracking-[0.2em] uppercase"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          Reorder
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------------- footer ---------------- */}
        {lines.length > 0 && (
          <div className="border-t border-text/25 px-6 py-5">
            <OrderTotals
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              tax={tax}
              total={total}
            />

            <button
              type="button"
              onClick={goToCheckout}
              className="btn-solid mt-4 w-full py-5 font-display text-sm font-700 tracking-[0.3em] uppercase"
            >
              Checkout
            </button>

            <button
              type="button"
              onClick={clear}
              className="mt-3 w-full font-display text-[9px] font-600 tracking-[0.25em] text-muted uppercase underline-offset-4 transition-colors hover:text-text hover:underline"
            >
              Empty the order · {count} item{count === 1 ? "" : "s"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
