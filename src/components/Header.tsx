"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import CartButton from "./CartButton";
import { navItems } from "@/data/site";

/**
 * Fixed header. Transparent for the full height of the hero, then picks up a
 * tinted blurred backdrop from the second section onward. The active nav item
 * is driven by an IntersectionObserver scroll-spy rather than scroll listeners.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(navItems[0].href);

  useEffect(() => {
    // Stay transparent for the whole hero, not just its first 40px. The hero
    // is scroll-pinned, so #top spans the entire pin distance and its bottom
    // edge is exactly where the second section starts — once that edge clears
    // the top of the viewport the header is sitting over the next section and
    // needs its backdrop to stay legible. Measured live rather than cached, so
    // it survives the pin distance changing with the viewport height.
    const hero = document.getElementById("top");

    const onScroll = () =>
      setScrolled(
        hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 40,
      );

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // The pin is sized off innerHeight, so a resize alone can move the edge.
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
        className="page-shell flex items-center justify-between py-4"
      >
        <a href="#top" className="shrink-0" aria-label="BRENN — back to top">
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
                  className={`font-display text-[10px] font-600 tracking-[0.22em] uppercase transition-colors duration-300 ${
                    isActive ? "text-ember" : "text-muted hover:text-ember"
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
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={`overflow-hidden transition-all duration-400 ease-in-out lg:hidden ${
          open ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        <ul className="page-shell flex flex-col border-t border-text/25 bg-bg/95 pt-2 pb-6 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <li key={item.href} className="border-b border-stroke last:border-b-0">
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block py-4 font-anton text-lg tracking-[0.08em] uppercase transition-colors ${
                    isActive ? "text-ember" : "text-muted hover:text-ember"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
