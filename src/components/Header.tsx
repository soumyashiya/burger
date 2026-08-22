"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import CartButton from "./CartButton";
import { navItems } from "@/data/site";

/**
 * Fixed header. Transparent over the hero, then picks up a tinted blurred
 * backdrop once the page has scrolled. The active nav item is driven by an
 * IntersectionObserver scroll-spy rather than scroll listeners.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(navItems[0].href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = navItems.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close the mobile drawer on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-text/25 bg-bg/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10"
      >
        <a href="#top" className="shrink-0" aria-label="PRIME — back to top">
          <Logo />
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative font-display text-[10px] font-600 tracking-[0.22em] uppercase transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-text after:transition-all after:duration-300 hover:text-text ${
                    isActive
                      ? "text-text after:w-full"
                      : "text-muted after:w-0 hover:after:w-full"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <CartButton />

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex flex-col gap-[5px] p-2 lg:hidden"
          >
            <span
              className={`block h-px w-5 bg-text transition-all duration-300 ${
                open ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-text transition-all duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-text transition-all duration-300 ${
                open ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </button>

          {/* Decorative desktop "MENU" mark */}
          <div className="hidden items-center gap-2 font-display text-[10px] font-600 tracking-[0.28em] text-muted uppercase lg:flex">
            MENU
            <span className="flex flex-col gap-[3px]" aria-hidden="true">
              <span className="block h-px w-5 bg-muted" />
              <span className="block h-px w-5 bg-muted" />
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={`overflow-hidden transition-all duration-400 ease-in-out lg:hidden ${
          open ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col border-t border-text/25 bg-bg/95 px-6 pt-2 pb-6 backdrop-blur-md">
          {navItems.map((item) => (
            <li key={item.href} className="border-b border-stroke last:border-b-0">
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-4 font-anton text-lg tracking-[0.08em] text-muted uppercase transition-colors hover:text-text"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
