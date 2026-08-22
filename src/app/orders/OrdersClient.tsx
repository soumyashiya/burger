"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useCart, type PlacedOrder } from "@/cart/CartContext";
import OrderTotals from "@/components/order/OrderTotals";
import PageChrome from "@/components/order/PageChrome";

/**
 * Rendered client-side from localStorage, so the browser's own locale is the
 * right one to format with — there is no server render to disagree with.
 */
function formatPlacedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersClient() {
  const { history, hydrated, clearHistory, reorder } = useCart();
  const router = useRouter();

  const again = (order: PlacedOrder) => {
    reorder(order);
    router.push("/");
  };

  const totalSpent = history.reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="min-h-screen bg-bg text-text">
      <PageChrome
        action={
          history.length > 0 ? (
            <button
              type="button"
              onClick={clearHistory}
              className="hidden font-display text-[9px] font-600 tracking-[0.22em] text-muted uppercase underline-offset-4 transition-colors hover:text-text hover:underline sm:block"
            >
              Clear history
            </button>
          ) : null
        }
      />

      <div className="mx-auto max-w-[1200px] px-6 py-14 md:px-10 md:py-20">
        <p className="font-display text-[10px] font-600 tracking-[0.4em] text-muted uppercase md:text-[11px]">
          PRIME // ORDER HISTORY
        </p>
        <h1 className="mt-3 font-anton text-6xl leading-[0.86] text-text uppercase md:text-8xl">
          Past
          <span className="block text-muted">orders</span>
        </h1>

        {!hydrated ? (
          /* Storage has not been read yet — claiming "no orders" here would
             flash the wrong screen for anyone who has some. */
          <p className="py-20 font-display text-[10px] font-600 tracking-[0.3em] text-muted uppercase">
            Loading your orders…
          </p>
        ) : history.length === 0 ? (
          <div className="max-w-[520px] py-16">
            <h2 className="font-anton text-4xl text-text/40 uppercase md:text-5xl">
              No orders yet
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Orders you place show up here, on this device. Nothing is sent
              anywhere — the history lives in your browser.
            </p>
            <Link
              href="/#line-up"
              className="btn-brut mt-10 inline-block px-8 py-4 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
            >
              See the line-up
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2 border-y border-text/25 py-4">
              <span className="font-display text-[10px] font-700 tracking-[0.24em] text-text uppercase tabular-nums">
                {history.length} order{history.length === 1 ? "" : "s"}
              </span>
              <span className="font-display text-[10px] font-500 tracking-[0.24em] text-muted uppercase tabular-nums">
                ${totalSpent} spent
              </span>
              <button
                type="button"
                onClick={clearHistory}
                className="ml-auto font-display text-[9px] font-600 tracking-[0.22em] text-muted uppercase underline-offset-4 transition-colors hover:text-text hover:underline sm:hidden"
              >
                Clear history
              </button>
            </div>

            <ul className="mt-10 space-y-px bg-stroke">
              {history.map((o) => (
                <li key={o.ref} className="bg-bg">
                  <article className="grid gap-8 px-1 py-8 lg:grid-cols-[1fr_300px] lg:gap-12">
                    {/* ---- left: what and when ---- */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h2 className="font-anton text-3xl text-text tabular-nums">
                          {o.ref}
                        </h2>
                        <span className="bg-text px-2 py-0.5 font-display text-[9px] font-700 tracking-[0.2em] text-bg uppercase">
                          {o.fulfilment === "delivery"
                            ? "Delivery"
                            : "Collection"}
                        </span>
                        <span className="font-display text-[9px] font-500 tracking-[0.2em] text-muted uppercase">
                          {formatPlacedAt(o.placedAtISO)}
                        </span>
                      </div>

                      <p className="mt-2 font-display text-[9px] font-500 tracking-[0.18em] text-muted uppercase">
                        {o.details.slot} · {o.details.name} ·{" "}
                        {o.details.payment === "card"
                          ? `Card ending ${o.details.cardLast4}`
                          : "Paid at the counter"}
                        {o.details.address ? ` · ${o.details.address}` : ""}
                      </p>

                      <ul className="mt-6 flex flex-wrap gap-3">
                        {o.lines.map((l) => (
                          <li
                            key={l.id}
                            className="flex items-center gap-3 border border-stroke p-2"
                          >
                            <span className="relative block h-12 w-12 shrink-0 overflow-hidden">
                              <Image
                                src={l.image}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </span>
                            <span className="pr-2">
                              <span className="block font-display text-[10px] font-700 tracking-[0.16em] text-text uppercase">
                                {l.qty} × {l.name}
                              </span>
                              <span className="mt-0.5 block font-display text-[9px] font-500 tracking-[0.14em] text-muted uppercase tabular-nums">
                                ${l.price * l.qty}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>

                      {o.details.note && (
                        <p className="mt-5 border-l border-stroke pl-4 text-sm leading-relaxed text-muted">
                          “{o.details.note}”
                        </p>
                      )}
                    </div>

                    {/* ---- right: money and reorder ---- */}
                    <div className="lg:border-l lg:border-stroke lg:pl-8">
                      <OrderTotals
                        subtotal={o.subtotal}
                        deliveryFee={o.deliveryFee}
                        tax={o.tax}
                        total={o.total}
                      />
                      <button
                        type="button"
                        onClick={() => again(o)}
                        className="btn-brut mt-5 flex w-full items-center justify-center gap-2 py-3.5 font-display text-[10px] font-700 tracking-[0.24em] uppercase"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        Order this again
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            <p className="mt-10 font-display text-[9px] font-500 tracking-[0.2em] text-muted uppercase">
              History is kept on this device only · last {history.length} of 20
            </p>
          </>
        )}
      </div>
    </main>
  );
}
