"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { gsap } from "@/animations/gsap";
import { revealOnScroll } from "@/animations/reveal";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const LUNCH = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
const DINNER = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

export default function Reservation() {
  const root = useRef<HTMLElement>(null);

  // Dates are resolved after mount so server and client markup always match.
  const [today, setToday] = useState<Date | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => setToday(new Date()), []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".rs-head > *", { y: 28, stagger: 0.08 });
      revealOnScroll(".rs-form", { y: 44, duration: 1.1 });
    }, root);
    return () => ctx.revert();
  }, []);

  const cal = useMemo(() => {
    if (!today) return null;
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Convert Sunday-first (0) to Monday-first (0 = Monday)
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    return {
      label: `${MONTHS[month]} ${year}`,
      daysInMonth,
      firstDow,
      minDay: today.getDate(),
    };
  }, [today]);

  const complete = day !== null && time !== null;

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!complete) return;
    setSent(true);
  };

  return (
    <section
      ref={root}
      id="reserve"
      className="relative overflow-hidden bg-surface py-28 md:py-40"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-6 left-6 h-14 w-14 border-t border-l border-text/50 md:top-14 md:left-14"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-6 h-14 w-14 border-r border-b border-text/50 md:right-14 md:bottom-14"
      />

      <div className="page-shell">
        {/* ---------------- header ---------------- */}
        <div className="rs-head mb-16 text-center">
          <p className="font-display text-[10px] font-600 tracking-[0.45em] text-muted uppercase md:text-[11px]">
            BOOK YOUR TABLE · THE BRENN STACK
          </p>

          <h2 className="mt-5 font-anton text-7xl leading-[0.82] text-text uppercase md:text-9xl">
            Reserve
            <span className="block">The Brenn</span>
          </h2>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted">
            Open daily 12:00 – 22:00 · Walk-ins welcome, reservation preferred.
          </p>

          <div className="mx-auto mt-8 h-px w-20 bg-text" />
        </div>

        {/* ---------------- form ---------------- */}
        <form className="rs-form flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="border border-stroke bg-bg/70 p-8 backdrop-blur-sm md:p-12">
            {/* 01 — date */}
            <fieldset>
              <legend className="font-display text-[10px] font-700 tracking-[0.35em] text-text uppercase">
                01 · SELECT DATE
              </legend>

              <p className="mt-5 font-anton text-3xl text-text uppercase">
                {cal?.label ?? " "}
              </p>

              {/* Capped width keeps the day cells compact instead of letting
                  them stretch to a seventh of the form panel. */}
              <div className="mt-4 grid max-w-[420px] grid-cols-7 gap-1.5 md:gap-2">
                {WEEKDAYS.map((d, i) => (
                  <span
                    key={`${d}-${i}`}
                    aria-hidden="true"
                    className="pb-1 text-center font-display text-[10px] font-700 tracking-[0.2em] text-muted uppercase"
                  >
                    {d}
                  </span>
                ))}

                {cal &&
                  Array.from({ length: cal.firstDow }).map((_, i) => (
                    <span key={`pad-${i}`} />
                  ))}

                {cal &&
                  Array.from({ length: cal.daysInMonth }).map((_, i) => {
                    const n = i + 1;
                    const past = n < cal.minDay;
                    const on = day === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        disabled={past}
                        onClick={() => setDay(n)}
                        aria-pressed={on}
                        aria-label={`${n} ${cal.label}`}
                        className={`h-10 border font-display text-xs font-600 tabular-nums transition-all duration-200 ${
                          past
                            ? "cursor-not-allowed border-transparent text-muted/40"
                            : on
                              ? "border-text bg-text text-bg"
                              : "border-stroke text-muted hover:border-text hover:text-text"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
              </div>
            </fieldset>

            {/* 02 — party size */}
            <fieldset className="mt-12">
              <legend className="font-display text-[10px] font-700 tracking-[0.35em] text-text uppercase">
                02 · PARTY SIZE
              </legend>

              <div className="mt-5 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  aria-label="Remove a guest"
                  className="btn-brut flex h-12 w-12 items-center justify-center"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>

                <span
                  aria-live="polite"
                  className="min-w-[150px] text-center font-anton text-4xl text-text tabular-nums"
                >
                  {guests}
                  <span className="ml-2 font-display text-sm font-600 tracking-[0.25em] text-muted uppercase">
                    {guests === 1 ? "GUEST" : "GUESTS"}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(12, g + 1))}
                  aria-label="Add a guest"
                  className="btn-brut flex h-12 w-12 items-center justify-center"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </fieldset>

            {/* 03 — time */}
            <fieldset className="mt-12">
              <legend className="font-display text-[10px] font-700 tracking-[0.35em] text-text uppercase">
                03 · SELECT TIME
              </legend>

              {[
                { label: "LUNCH SERVICE", slots: LUNCH },
                { label: "DINNER SERVICE", slots: DINNER },
              ].map((service) => (
                <div key={service.label} className="mt-6">
                  <p className="w-fit bg-text px-2 py-0.5 font-display text-[9px] font-700 tracking-[0.3em] text-bg uppercase">
                    {service.label}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.slots.map((slot) => {
                      const on = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(slot)}
                          aria-pressed={on}
                          className={`border px-4 py-2.5 font-display text-xs font-600 tracking-[0.15em] tabular-nums transition-all duration-200 ${
                            on
                              ? "border-text bg-text text-bg"
                              : "border-stroke text-muted hover:border-text hover:text-text"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </fieldset>
          </div>

          <button
            type="submit"
            disabled={!complete}
            className={`btn-solid w-full py-6 font-display text-base font-700 tracking-[0.4em] uppercase ${
              complete ? "" : "cursor-not-allowed"
            }`}
          >
            {sent ? "TABLE REQUESTED" : "RESERVE YOUR TABLE"}
          </button>

          <p
            aria-live="polite"
            className="text-center font-display text-[10px] font-500 tracking-[0.25em] text-muted uppercase"
          >
            {sent
              ? `${guests} ${guests === 1 ? "GUEST" : "GUESTS"} · ${cal?.label} ${day} · ${time}`
              : "No account required · Free to book · Cancel anytime"}
          </p>
        </form>
      </div>
    </section>
  );
}
