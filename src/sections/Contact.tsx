"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "@/animations/gsap";
import { revealOnScroll } from "@/animations/reveal";
import SectionHeading from "@/components/SectionHeading";
import { channels, openingHours, topics } from "@/data/contact";
import { contact } from "@/data/site";

/** Deliberately loose — enough to catch a typo, not to police valid addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const FIELD =
  "w-full border bg-transparent px-4 py-3.5 text-sm text-text placeholder:text-muted focus:outline-none";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const [topic, setTopic] = useState<string>(topics[0]);
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<{ ref: string; email: string } | null>(null);

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    // Clear only the field being corrected, so the others keep their message.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = fields.name.trim();
    const email = fields.email.trim();
    const message = fields.message.trim();
    const next: Errors = {};

    if (!name) next.name = "Tell us who you are.";
    if (!email) next.email = "We need an address to reply to.";
    else if (!EMAIL.test(email))
      next.email = "That does not look like an email address.";
    if (!message) next.message = "Write us a line or two.";
    else if (message.length < 10) next.message = "A little more detail, please.";

    setErrors(next);
    if (Object.keys(next).length) return;

    // No backend — the send is confirmed client-side. The reference is built in
    // the handler, never during render, so server and client markup agree.
    setSent({
      ref: `CT-${Math.floor(100000 + Math.random() * 900000)}`,
      email,
    });
  };

  // Move focus to the receipt so the outcome is announced, not just repainted.
  useEffect(() => {
    if (sent) sentRef.current?.focus();
  }, [sent]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealOnScroll(".ct-head", { y: 30 });
      revealOnScroll(".ct-panel", { y: 44, stagger: 0.12, duration: 1.1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="contact" className="relative bg-bg py-28 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-stroke"
      />

      <div className="page-shell">
        <SectionHeading
          className="ct-head mb-14 border-b border-text/25 pb-8"
          eyebrow="CONTACT // WE READ EVERYTHING"
          index="// 09."
          title="GET IN TOUCH"
          aside={
            <p className="hidden font-display text-[11px] font-600 tracking-[0.24em] text-muted uppercase md:block">
              REPLIES WITHIN A DAY
            </p>
          }
        />

        <div className="grid gap-px bg-stroke lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* ---------------- channels, address, hours ---------------- */}
          <div className="ct-panel bg-bg p-7 md:p-10">
            <ul>
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={`mailto:${c.address}`}
                    className="group flex items-start justify-between gap-4 border-b border-stroke py-5 transition-colors duration-300"
                  >
                    <span className="min-w-0">
                      <span className="block font-display text-[10px] font-700 tracking-[0.3em] text-muted uppercase transition-colors duration-300 group-hover:text-text">
                        {c.label}
                      </span>
                      <span className="mt-2 block truncate font-anton text-xl text-text uppercase md:text-2xl">
                        {c.address}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted">
                        {c.note}
                      </span>
                    </span>

                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text"
                    />
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              <div>
                <p className="font-display text-[10px] font-700 tracking-[0.3em] text-text uppercase">
                  THE ROOM
                </p>
                <address className="mt-4 text-sm leading-relaxed text-muted not-italic">
                  {contact.street}
                  <br />
                  {contact.city}
                  <br />
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="mt-2 inline-block tabular-nums transition-colors duration-300 hover:text-text"
                  >
                    {contact.phone}
                  </a>
                </address>
              </div>

              <div>
                <p className="font-display text-[10px] font-700 tracking-[0.3em] text-text uppercase">
                  HOURS
                </p>
                <dl className="mt-4 flex flex-col gap-2">
                  {openingHours.map((h) => (
                    <div
                      key={h.days}
                      className="flex items-baseline justify-between gap-4 border-b border-stroke pb-2 font-display text-[10px] font-600 tracking-[0.16em] uppercase"
                    >
                      <dt className="text-muted">{h.days}</dt>
                      <dd className="text-text tabular-nums">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* ---------------- message form ---------------- */}
          <div className="ct-panel bg-bg p-7 md:p-10">
            {sent ? (
              <div
                ref={sentRef}
                tabIndex={-1}
                role="status"
                className="flex h-full flex-col items-center justify-center py-10 text-center focus:outline-none"
              >
                <p className="font-display text-[10px] font-600 tracking-[0.35em] text-muted uppercase">
                  MESSAGE SENT
                </p>
                <p className="mt-3 font-anton text-5xl text-text tabular-nums md:text-6xl">
                  {sent.ref}
                </p>
                <span className="mt-6 block h-px w-16 bg-text" />
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
                  Quote that reference if you follow up. A reply lands at{" "}
                  {sent.email} within one working day — sooner if the kitchen is
                  quiet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(null);
                    setFields({ name: "", email: "", message: "" });
                  }}
                  className="btn-brut mt-8 px-7 py-3 font-display text-[10px] font-700 tracking-[0.28em] uppercase"
                >
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              /* noValidate: the browser's own bubble is easy to miss and shows
                 one field at a time, so the errors below are shown in the page. */
              <form onSubmit={onSubmit} noValidate>
                <fieldset>
                  <legend className="font-display text-[10px] font-700 tracking-[0.3em] text-text uppercase">
                    WHAT IS IT ABOUT?
                  </legend>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {topics.map((t) => {
                      const on = t === topic;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          aria-pressed={on}
                          className={`border px-4 py-2 font-display text-[10px] font-600 tracking-[0.2em] uppercase transition-colors duration-300 ${
                            on
                              ? "border-text bg-text text-bg"
                              : "border-stroke text-muted hover:border-text/50 hover:text-text"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Field
                    id="ct-name"
                    label="Your name"
                    placeholder="Alex Mercer"
                    autoComplete="name"
                    value={fields.name}
                    onChange={set("name")}
                    error={errors.name}
                  />
                  <Field
                    id="ct-email"
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={fields.email}
                    onChange={set("email")}
                    error={errors.email}
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="ct-message"
                    className="block font-display text-[10px] font-600 tracking-[0.28em] text-muted uppercase"
                  >
                    Message
                  </label>
                  <textarea
                    id="ct-message"
                    rows={5}
                    placeholder="Tell us what you need."
                    value={fields.message}
                    onChange={(e) => set("message")(e.target.value)}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={
                      errors.message ? "ct-message-error" : undefined
                    }
                    className={`${FIELD} mt-3 resize-y ${
                      errors.message
                        ? "border-text"
                        : "border-stroke focus:border-text"
                    }`}
                  />
                  {errors.message && (
                    <p
                      id="ct-message-error"
                      role="alert"
                      className="mt-2 font-display text-[10px] font-600 tracking-[0.2em] text-text uppercase"
                    >
                      ↳ {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-solid mt-8 w-full py-4 font-display text-[11px] font-700 tracking-[0.32em] uppercase"
                >
                  SEND MESSAGE
                </button>

                <p className="mt-5 font-display text-[10px] font-500 tracking-[0.22em] text-muted uppercase">
                  NO NEWSLETTER SIGNUP · WE ONLY USE THIS TO REPLY
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Labelled text input with its own error slot, wired for screen readers. */
function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-display text-[10px] font-600 tracking-[0.28em] text-muted uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${FIELD} mt-3 ${
          error ? "border-text" : "border-stroke focus:border-text"
        }`}
      />
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 font-display text-[10px] font-600 tracking-[0.2em] text-text uppercase"
        >
          ↳ {error}
        </p>
      )}
    </div>
  );
}
