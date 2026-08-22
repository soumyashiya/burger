import Link from "next/link";
import Logo from "./Logo";
import { brand, footerLinks } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-text/25 bg-bg">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row md:px-12">
        <Logo />

        <nav aria-label="Footer">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-display text-[10px] font-600 tracking-[0.24em] text-muted uppercase md:flex-nowrap md:justify-start md:gap-7">
            {footerLinks.map((link) => {
              const className =
                "transition-colors duration-300 hover:text-text";
              // Route links go through the router; in-page anchors stay plain
              // <a> so the Lenis smooth-scroll handler still picks them up.
              return (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href} className={className}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={className}>
                      {link.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="flex items-center gap-2.5">
          {/* Square indicator — the ping stays, the pill shape goes. */}
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="anim-ping-slow absolute inline-flex h-full w-full bg-accent" />
            <span className="relative inline-flex h-2 w-2 bg-accent" />
          </span>
          <span className="font-display text-[10px] font-600 tracking-[0.24em] text-muted uppercase">
            {brand.hours}
          </span>
        </p>
      </div>
    </footer>
  );
}
