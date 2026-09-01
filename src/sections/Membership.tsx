"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { gsap } from "@/animations/gsap";
import { revealOnScroll } from "@/animations/reveal";
import SectionHeading from "@/components/SectionHeading";
import {
  annualPerMonth,
  annualTotal,
  billing,
  plans,
  type BillingKey,
} from "@/data/membership";

/** Whole dollars stay whole; the discounted annual rate shows its cents. */
const money = (n: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Subscription plans. Selection is carried by inversion — a chosen card flips
 * to black-on-white — which is the same emphasis rule the buttons use, and
 * leaves the ember accent free to keep meaning "you are here" in the nav.
 * Signup is confirmed client-side, like the reservation form; there is no
 * billing backend behind it.
 */
/** Deliberately loose — enough to catch a typo, not to police valid addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Confirmation = {
  ref: string;
  planName: string;
  perMonth: number;
  annual: boolean;
  total: number;
  email: string;
};

export default function Membership() {
  const root = useRef<HTMLElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const [period, setPeriod] = useState<BillingKey>("monthly");
  const [planKey, setPlanKey] = useState(
    (plans.find((p) => p.featured) ?? plans[0]).key,
  );
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const plan = plans.find((p) => p.key === planKey) ?? plans[0];
  const annual = period === "annual";
  const perMonth = annual ? annualPerMonth(plan.monthly) : plan.monthly;

  // Any change to what is being bought invalidates the previous confirmation —
  // otherwise a receipt for one plan sits under the price of another.
  const choosePlan = (key: string) => {
    setPlanKey(key);
    setConfirmation(null);
  };
  const choosePeriod = (key: BillingKey) => {
    setPeriod(key);
    setConfirmation(null);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();

    if (!value) {
      setError("Enter your email address to join.");
      return;
    }
    if (!EMAIL.test(value)) {
      setError("That does not look like an email address.");
      return;
    }

    setError(null);
    // No backend — the membership is confirmed client-side. The reference is
    // generated in the handler, never during render, so it cannot differ
    // between the server markup and the first client paint.
    setConfirmation({
      ref: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
      planName: plan.name,
      perMonth,
      annual,
      total: annualTotal(plan.monthly),
      email: value,
    });
  };

  // Move focus to the receipt so the outcome is announced, not just repainted.
  useEffect(() => {
    if (confirmation) confirmRef.current?.focus();
  }, [confirmation]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".club-head", { y: 30 });
      revealOnScroll(".club-billing", { y: 20, delay: 0.08 });
      revealOnScroll(".club-plan", { y: 48, stagger: 0.12, duration: 1.1 });
      revealOnScroll(".club-join", { y: 32, duration: 1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="membership" className="relative bg-bg py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-stroke"
      />

      <div className="page-shell">
        {/* ---------------- billing period ---------------- */}
        <div className="club-billing mb-12 flex flex-wrap items-center gap-5">
          <div
            role="group"
            aria-label="Billing period"
            className="flex border border-stroke"
          >
            {billing.map((b) => {
              const on = b.key === period;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => choosePeriod(b.key)}
                  aria-pressed={on}
                  className={`px-5 py-2.5 font-display text-[10px] font-700 tracking-[0.28em] whitespace-nowrap uppercase transition-colors duration-300 ${
                    on ? "bg-text text-bg" : "text-muted hover:text-text"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          <p className="font-display text-[10px] font-600 tracking-[0.24em] text-muted uppercase">
            CANCEL ANYTIME
          </p>
        </div>

        <SectionHeading
          className="club-head mb-12 border-b border-text/25 pb-8"
          eyebrow="MEMBERSHIP // THE BRENN CLUB"
          index="// 08."
          title="YOUR MONTHLY BURGER FIX"
        />

        {/* ---------------- plans ---------------- */}
        <div className="grid gap-px bg-stroke md:grid-cols-3">
          {plans.map((p) => {
            const on = p.key === planKey;
            const price = annual ? annualPerMonth(p.monthly) : p.monthly;

            return (
              <button
                key={p.key}
                type="button"
                onClick={() => choosePlan(p.key)}
                aria-pressed={on}
                className={`club-plan group relative flex flex-col p-7 text-left transition-colors duration-500 md:p-8 ${
                  on ? "bg-text text-bg" : "bg-bg hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`font-display text-[10px] font-700 tracking-[0.3em] uppercase ${
                      on ? "text-bg/60" : "text-muted"
                    }`}
                  >
                    {p.index}
                  </span>

                  {p.featured && (
                    <span
                      className={`px-2 py-1 font-display text-[9px] font-700 tracking-[0.25em] uppercase ${
                        on ? "bg-bg text-text" : "bg-text text-bg"
                      }`}
                    >
                      FAN FAVORITE
                    </span>
                  )}
                </div>

                <h3
                  className={`mt-5 font-anton text-3xl uppercase md:text-4xl ${
                    on ? "text-bg" : "text-text"
                  }`}
                >
                  {p.name}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    on ? "text-bg/70" : "text-muted"
                  }`}
                >
                  {p.tagline}
                </p>

                {/* price */}
                <div
                  className={`mt-7 flex items-baseline gap-2 border-t pt-6 ${
                    on ? "border-bg/20" : "border-stroke"
                  }`}
                >
                  <span
                    className={`font-anton text-5xl leading-none tabular-nums md:text-6xl ${
                      on ? "text-bg" : "text-text"
                    }`}
                  >
                    {money(price)}
                  </span>
                  <span
                    className={`font-display text-[10px] font-700 tracking-[0.25em] uppercase ${
                      on ? "text-bg/60" : "text-muted"
                    }`}
                  >
                    / MO
                  </span>
                </div>

                <p
                  className={`mt-2 font-display text-[10px] font-500 tracking-[0.2em] uppercase ${
                    on ? "text-bg/60" : "text-muted"
                  }`}
                >
                  {annual
                    ? `${money(annualTotal(p.monthly))} BILLED YEARLY`
                    : "BILLED MONTHLY"}
                </p>

                {/* perks */}
                <ul className="mt-7 flex flex-1 flex-col gap-3">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <Check
                        aria-hidden="true"
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                          on ? "text-bg" : "text-text"
                        }`}
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          on ? "text-bg/80" : "text-muted"
                        }`}
                      >
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                <span
                  className={`mt-8 block border py-3.5 text-center font-display text-[10px] font-700 tracking-[0.28em] uppercase transition-colors duration-300 ${
                    on
                      ? "border-bg bg-bg text-text"
                      : "border-text/40 text-text group-hover:border-text"
                  }`}
                >
                  {on ? "SELECTED" : "CHOOSE PLAN"}
                </span>
              </button>
            );
          })}
        </div>

        {/* ---------------- join / receipt ---------------- */}
        <div className="club-join mt-12 border border-stroke p-7 md:p-10">
          {confirmation ? (
            <div
              ref={confirmRef}
              tabIndex={-1}
              role="status"
              className="text-center focus:outline-none"
            >
              <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase">
                MEMBERSHIP CONFIRMED
              </p>
              <p className="mt-3 font-anton text-5xl text-text tabular-nums md:text-6xl">
                {confirmation.ref}
              </p>
              <span className="mx-auto mt-6 block h-px w-16 bg-text" />

              <p className="mt-6 font-display text-[11px] font-700 tracking-[0.28em] text-text uppercase">
                {confirmation.planName} · {money(confirmation.perMonth)} / MONTH
                · {confirmation.annual ? "BILLED YEARLY" : "BILLED MONTHLY"}
              </p>

              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
                Sent to {confirmation.email}. Your member code lands within the
                hour — quote it at the counter.{" "}
                {confirmation.annual
                  ? `${money(confirmation.total)} is taken once today, then once a year.`
                  : `${money(confirmation.perMonth)} is taken today, then monthly.`}{" "}
                Cancel anytime.
              </p>

              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="btn-brut mt-8 px-7 py-3 font-display text-[10px] font-700 tracking-[0.28em] uppercase"
              >
                CHANGE PLAN
              </button>
            </div>
          ) : (
            /* noValidate: the browser's own bubble is easy to miss and vanishes
               on the next click, so the errors below are shown in the page. */
            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-display text-[10px] font-700 tracking-[0.35em] text-text uppercase">
                    JOIN {plan.name}
                  </p>
                  <p className="mt-3 font-anton text-4xl leading-none tabular-nums text-text md:text-5xl">
                    {money(perMonth)}
                    <span className="ml-2 font-display text-sm font-600 tracking-[0.2em] text-muted uppercase">
                      / MONTH
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {annual
                      ? `Billed ${money(annualTotal(plan.monthly))} once a year — 15% off the monthly rate.`
                      : `Billed ${money(plan.monthly)} monthly. Stop whenever you like.`}
                  </p>
                </div>

                <div className="w-full md:max-w-md">
                  <label
                    htmlFor="club-email"
                    className="block font-display text-[10px] font-600 tracking-[0.28em] text-muted uppercase"
                  >
                    Email address
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="club-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "club-email-error" : undefined}
                      className={`min-w-0 flex-1 border bg-transparent px-4 py-3.5 text-sm text-text placeholder:text-muted focus:outline-none ${
                        error ? "border-text" : "border-stroke focus:border-text"
                      }`}
                    />
                    <button
                      type="submit"
                      className="btn-solid shrink-0 px-8 py-3.5 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
                    >
                      JOIN THE CLUB
                    </button>
                  </div>

                  {error && (
                    <p
                      id="club-email-error"
                      role="alert"
                      className="mt-3 font-display text-[10px] font-600 tracking-[0.2em] text-text uppercase"
                    >
                      ↳ {error}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-7 border-t border-stroke pt-6 font-display text-[10px] font-500 tracking-[0.22em] text-muted uppercase">
                NO CONTRACT · CANCEL ANYTIME · CREDITS ROLL OVER 60 DAYS
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
