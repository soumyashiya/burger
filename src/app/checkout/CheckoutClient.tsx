"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useCart, type OrderDetails } from "@/cart/CartContext";
import OrderField from "@/components/order/OrderField";
import OrderTotals from "@/components/order/OrderTotals";
import PageChrome from "@/components/order/PageChrome";
import {
  buildSlots,
  formatCard,
  formatExpiry,
  fulfilmentOptions,
  isCvc,
  isEmail,
  isExpiry,
  isPhone,
  luhn,
  paymentOptions,
  type PaymentMethod,
} from "@/data/order";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  note: "",
  slot: "",
  card: "",
  expiry: "",
  cvc: "",
};

export default function CheckoutClient() {
  const {
    lines,
    count,
    subtotal,
    deliveryFee,
    tax,
    total,
    fulfilment,
    setFulfilment,
    hydrated,
    placed,
    clearPlaced,
    placeOrder,
  } = useCart();

  const [form, setForm] = useState(EMPTY_FORM);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slots, setSlots] = useState<string[]>([]);

  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  /* Slots depend on the clock, so they are built after mount rather than
     during render, which would put a time reading into the server markup. */
  useEffect(() => {
    const next = buildSlots(new Date());
    setSlots(next);
    setForm((f) => (next.includes(f.slot) ? f : { ...f, slot: next[0] }));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Name required";
    if (!isPhone(form.phone)) e.phone = "Valid phone required";
    if (!isEmail(form.email)) e.email = "Valid email required";
    if (fulfilment === "delivery" && form.address.trim().length < 6)
      e.address = "Delivery address required";
    if (!form.slot) e.slot = "Pick a time";
    if (payment === "card") {
      if (!luhn(form.card)) e.card = "Card number not valid";
      if (!isExpiry(form.expiry, new Date()))
        e.expiry = "Expiry MM/YY, not past";
      if (!isCvc(form.cvc)) e.cvc = "3–4 digits";
    }
    setErrors(e);
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      // Take the customer to the first thing that needs fixing.
      document
        .querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const details: OrderDetails = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: fulfilment === "delivery" ? form.address.trim() : "",
      note: form.note.trim(),
      slot: form.slot,
      payment,
      cardLast4:
        payment === "card" ? form.card.replace(/\D/g, "").slice(-4) : "",
    };
    placeOrder(details);
    setForm(EMPTY_FORM);
    setErrors({});
    window.scrollTo({ top: 0 });
  };

  const eta = useMemo(
    () => (placed ? `${placed.etaMinutes}–${placed.etaMinutes + 10} min` : ""),
    [placed],
  );

  return (
    <main className="min-h-screen bg-bg text-text">
      <PageChrome />

      <div className="mx-auto max-w-[1200px] px-6 py-14 md:px-10 md:py-20">
        {/* ===================== CONFIRMED ===================== */}
        {placed ? (
          <div className="mx-auto max-w-[640px] text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center border border-text">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>

            <p className="mt-8 font-display text-[10px] font-600 tracking-[0.4em] text-muted uppercase">
              Confirmation
            </p>
            <h1 className="mt-4 font-anton text-6xl text-text uppercase md:text-8xl">
              Order placed
            </h1>
            <p className="mt-6 font-anton text-4xl text-text tabular-nums md:text-5xl">
              {placed.ref}
            </p>
            <span className="mx-auto mt-8 block h-px w-20 bg-text" />

            <p className="mt-8 text-sm leading-relaxed text-muted">
              {placed.fulfilment === "delivery" ? "Delivery" : "Collection"} at{" "}
              <span className="text-text">{placed.details.slot}</span> · about{" "}
              {eta}. Paid{" "}
              {placed.details.payment === "card"
                ? `by card ending ${placed.details.cardLast4}`
                : "at the counter"}
              . Quote the reference at the counter.
            </p>

            {/* Say so plainly rather than claiming a receipt was emailed —
                nothing here leaves the browser. */}
            <p className="mt-3 font-display text-[9px] font-500 tracking-[0.2em] text-muted uppercase">
              Demo checkout · no email is sent and no payment is taken
            </p>

            <div className="mt-12 grid gap-10 text-left md:grid-cols-2">
              <div>
                <p className="font-display text-[9px] font-700 tracking-[0.3em] text-muted uppercase">
                  Details
                </p>
                <dl className="mt-3">
                  {[
                    ["Name", placed.details.name],
                    ["Phone", placed.details.phone],
                    ["Email", placed.details.email],
                    ...(placed.details.address
                      ? [["Address", placed.details.address]]
                      : []),
                    ...(placed.details.note
                      ? [["Note", placed.details.note]]
                      : []),
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-4 border-b border-stroke py-2 font-display text-[9px] font-600 tracking-[0.18em] uppercase"
                    >
                      <dt className="shrink-0 text-muted">{k}</dt>
                      <dd className="truncate text-text">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <p className="font-display text-[9px] font-700 tracking-[0.3em] text-muted uppercase">
                  Receipt
                </p>
                <ul className="mt-3">
                  {placed.lines.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-baseline justify-between gap-4 border-b border-stroke py-2 font-display text-[10px] font-600 tracking-[0.18em] uppercase tabular-nums"
                    >
                      <span className="truncate text-text/70">
                        {l.qty} × {l.name}
                      </span>
                      <span className="text-text">${l.price * l.qty}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <OrderTotals
                    subtotal={placed.subtotal}
                    deliveryFee={placed.deliveryFee}
                    tax={placed.tax}
                    total={placed.total}
                  />
                </div>
              </div>
            </div>

            <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/"
                onClick={clearPlaced}
                className="btn-solid px-10 py-5 font-display text-sm font-700 tracking-[0.3em] uppercase"
              >
                Back to the menu
              </Link>
              <Link
                href="/orders"
                onClick={clearPlaced}
                className="btn-brut px-10 py-5 font-display text-sm font-700 tracking-[0.3em] uppercase"
              >
                Order history
              </Link>
            </div>
          </div>
        ) : !hydrated ? (
          /* Storage has not been read yet — saying "empty" here would flash
             the wrong screen for anyone arriving with a full basket. */
          <p className="py-20 text-center font-display text-[10px] font-600 tracking-[0.3em] text-muted uppercase">
            Loading your order…
          </p>
        ) : lines.length === 0 ? (
          /* ===================== EMPTY ===================== */
          <div className="mx-auto max-w-[520px] py-16 text-center">
            <h1 className="font-anton text-5xl text-text/40 uppercase md:text-7xl">
              Nothing to check out
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Your order is empty. Pick a build from the line-up, or put one
              together yourself in Build Your Prime.
            </p>
            <Link
              href="/#line-up"
              className="btn-brut mt-10 inline-block px-8 py-4 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
            >
              See the line-up
            </Link>
          </div>
        ) : (
          /* ===================== CHECKOUT ===================== */
          <>
            <p className="font-display text-[10px] font-600 tracking-[0.4em] text-muted uppercase md:text-[11px]">
              PRIME // CHECKOUT
            </p>
            <h1 className="mt-3 font-anton text-6xl leading-[0.86] text-text uppercase md:text-8xl">
              Confirm
              <span className="block text-muted">your order</span>
            </h1>

            <form
              onSubmit={submit}
              noValidate
              className="mt-14 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16"
            >
              {/* ---------------- left: the form ---------------- */}
              <div className="space-y-12">
                {/* 01 — fulfilment */}
                <fieldset>
                  <legend className="font-anton text-2xl text-text uppercase">
                    <span className="text-muted">01.</span> How would you like it
                  </legend>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {fulfilmentOptions.map((o) => {
                      const on = fulfilment === o.key;
                      return (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => setFulfilment(o.key)}
                          aria-pressed={on}
                          className={`border px-4 py-4 text-left transition-colors ${
                            on
                              ? "border-text bg-text/10"
                              : "border-stroke hover:border-text/45"
                          }`}
                        >
                          <span className="block font-display text-[11px] font-700 tracking-[0.2em] text-text uppercase">
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

                {/* 02 — details */}
                <fieldset>
                  <legend className="font-anton text-2xl text-text uppercase">
                    <span className="text-muted">02.</span> Your details
                  </legend>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <OrderField
                      label="Name"
                      value={form.name}
                      onChange={(v) => set("name", v)}
                      error={errors.name}
                      autoComplete="name"
                      placeholder="Alex Moreau"
                    />
                    <OrderField
                      label="Phone"
                      value={form.phone}
                      onChange={(v) => set("phone", v)}
                      error={errors.phone}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+1 555 0134"
                    />
                  </div>

                  <div className="mt-5">
                    <OrderField
                      label="Email"
                      value={form.email}
                      onChange={(v) => set("email", v)}
                      error={errors.email}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="alex@example.com"
                    />
                  </div>

                  {fulfilment === "delivery" && (
                    <div className="mt-5">
                      <OrderField
                        label="Delivery address"
                        value={form.address}
                        onChange={(v) => set("address", v)}
                        error={errors.address}
                        autoComplete="street-address"
                        placeholder="14 Kessler St, Apt 3"
                        multiline
                      />
                    </div>
                  )}

                  <div className="mt-6">
                    <p className="font-display text-[9px] font-700 tracking-[0.3em] text-muted uppercase">
                      {fulfilment === "delivery" ? "Deliver at" : "Collect at"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slots.map((s) => {
                        const on = form.slot === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set("slot", s)}
                            aria-pressed={on}
                            className={`border px-4 py-2.5 font-display text-xs font-600 tabular-nums transition-colors ${
                              on
                                ? "border-text bg-text text-bg"
                                : "border-stroke text-muted hover:border-text hover:text-text"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                    {errors.slot && (
                      <p className="mt-2 font-display text-[9px] font-600 tracking-[0.2em] text-text uppercase">
                        ↳ {errors.slot}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <OrderField
                      label="Kitchen note (optional)"
                      value={form.note}
                      onChange={(v) => set("note", v)}
                      placeholder="No pickles on the second one"
                      multiline
                    />
                  </div>
                </fieldset>

                {/* 03 — payment */}
                <fieldset>
                  <legend className="font-anton text-2xl text-text uppercase">
                    <span className="text-muted">03.</span> Payment
                  </legend>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {paymentOptions.map((o) => {
                      const on = payment === o.key;
                      return (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => {
                            setPayment(o.key);
                            setErrors({});
                          }}
                          aria-pressed={on}
                          className={`border px-4 py-4 text-left transition-colors ${
                            on
                              ? "border-text bg-text/10"
                              : "border-stroke hover:border-text/45"
                          }`}
                        >
                          <span className="block font-display text-[11px] font-700 tracking-[0.2em] text-text uppercase">
                            {o.label}
                          </span>
                          <span className="mt-1 block font-display text-[9px] font-500 tracking-[0.12em] text-muted uppercase">
                            {o.note}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {payment === "card" ? (
                    <div className="mt-6 space-y-5">
                      <OrderField
                        label="Card number"
                        value={form.card}
                        onChange={(v) => set("card", formatCard(v))}
                        error={errors.card}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        maxLength={23}
                      />
                      <div className="grid grid-cols-2 gap-5">
                        <OrderField
                          label="Expiry"
                          value={form.expiry}
                          onChange={(v) => set("expiry", formatExpiry(v))}
                          error={errors.expiry}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="09/28"
                          maxLength={5}
                        />
                        <OrderField
                          label="CVC"
                          value={form.cvc}
                          onChange={(v) =>
                            set("cvc", v.replace(/\D/g, "").slice(0, 4))
                          }
                          error={errors.cvc}
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                      <p className="font-display text-[9px] font-500 tracking-[0.18em] text-muted uppercase">
                        Demo only · no card data leaves this page
                      </p>
                    </div>
                  ) : (
                    <p className="mt-6 border border-stroke px-4 py-4 text-sm leading-relaxed text-muted">
                      Pay when you pick the order up. We will hold it on the
                      pass under your reference for fifteen minutes.
                    </p>
                  )}
                </fieldset>
              </div>

              {/* ---------------- right: summary ---------------- */}
              <aside className="lg:sticky lg:top-10 lg:self-start">
                <div className="border border-stroke">
                  <p className="border-b border-stroke px-5 py-4 font-display text-[9px] font-700 tracking-[0.3em] text-muted uppercase">
                    Your order · {count} item{count === 1 ? "" : "s"}
                  </p>

                  <ul>
                    {lines.map((l) => (
                      <li
                        key={l.id}
                        className="flex gap-3 border-b border-stroke px-5 py-4"
                      >
                        <span className="relative block h-14 w-14 shrink-0 overflow-hidden border border-stroke">
                          <Image
                            src={l.image}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate font-display text-[11px] font-700 tracking-[0.16em] text-text uppercase">
                              {l.qty} × {l.name}
                            </span>
                            <span className="shrink-0 font-display text-[11px] font-700 text-text tabular-nums">
                              ${l.price * l.qty}
                            </span>
                          </span>
                          <span className="mt-1 block truncate font-display text-[9px] font-500 tracking-[0.16em] text-muted uppercase">
                            {l.meta}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="px-5 py-5">
                    <OrderTotals
                      subtotal={subtotal}
                      deliveryFee={deliveryFee}
                      tax={tax}
                      total={total}
                      size="lg"
                    />

                    <button
                      type="submit"
                      className="btn-solid mt-6 w-full py-5 font-display text-sm font-700 tracking-[0.3em] uppercase"
                    >
                      {payment === "card"
                        ? `Pay $${total}`
                        : `Place order · $${total}`}
                    </button>

                    <p className="mt-4 text-center font-display text-[9px] font-500 tracking-[0.2em] text-muted uppercase">
                      No account needed · Demo checkout
                    </p>
                  </div>
                </div>
              </aside>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
