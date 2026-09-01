import Logo from "./Logo";
import { brand, contact, footerNav, legal, social } from "@/data/site";

/** Column heading — same tracked micro-caps the section eyebrows use. */
function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[10px] font-700 tracking-[0.3em] text-text uppercase">
      {children}
    </p>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <ColTitle>{title}</ColTitle>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="font-display text-[11px] font-600 tracking-[0.18em] text-muted uppercase transition-colors duration-300 hover:text-text"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  // Server component, and the page is statically prerendered — so this is the
  // year of the last build, not of the visit. Fine while the site is rebuilt
  // regularly; make it a client value if it ever needs to be exact.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-text/25 bg-bg">
      {/* ---------------- closing call to action ---------------- */}
      <div className="page-shell">
        <div className="flex flex-col gap-8 border-b border-stroke py-14 md:flex-row md:items-end md:justify-between md:py-20">
          <h2 className="font-anton text-4xl leading-[0.9] text-text uppercase md:text-6xl">
            Still hungry?
            <span className="block text-muted">Come and eat.</span>
          </h2>

          <div className="flex flex-wrap gap-3">
            <a
              href="#reserve"
              className="btn-solid px-8 py-4 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
            >
              RESERVE A TABLE
            </a>
            <a
              href="#membership"
              className="btn-brut px-8 py-4 font-display text-[11px] font-700 tracking-[0.28em] uppercase"
            >
              JOIN THE CLUB
            </a>
          </div>
        </div>
      </div>

      {/* ---------------- columns ---------------- */}
      <div className="page-shell">
        <div className="grid gap-12 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
              Dry-aged beef, charcoal iron, every patty formed by hand. A recipe
              that left Hamburg in 1880, rebuilt here as a craft.
            </p>

            <p className="mt-7 flex items-center gap-2.5">
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

          <nav aria-label="Footer">
            <LinkColumn title="SITEMAP" links={footerNav} />
          </nav>

          <LinkColumn title="FOLLOW" links={social} />

          <div>
            <ColTitle>VISIT</ColTitle>
            <address className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-muted not-italic">
              <span>
                {contact.street}
                <br />
                {contact.city}
              </span>
              <a
                href={`mailto:${contact.email}`}
                className="transition-colors duration-300 hover:text-text"
              >
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="tabular-nums transition-colors duration-300 hover:text-text"
              >
                {contact.phone}
              </a>
            </address>
          </div>
        </div>
      </div>

      {/* ---------------- oversized wordmark ---------------- */}
      {/* Decorative only: the name is already announced by the logo above, so
          this is hidden rather than read out a second time. */}
      {/* Letters are spread with justify-between rather than set as one word:
          five condensed glyphs never fill the measure on their own, and this
          way the outer two land exactly on the page gutters at any width. */}
      <div className="page-shell overflow-hidden" aria-hidden="true">
        <span className="flex w-full justify-between font-anton text-[clamp(3.5rem,16vw,14rem)] leading-[0.8] text-text/10 uppercase select-none">
          {brand.name.split("").map((glyph, i) => (
            <span key={`${glyph}-${i}`}>{glyph}</span>
          ))}
        </span>
      </div>

      {/* ---------------- bottom bar ---------------- */}
      <div className="page-shell">
        <div className="flex flex-col items-center gap-4 border-t border-stroke py-6 md:flex-row md:justify-between">
          <p className="font-display text-[10px] font-500 tracking-[0.24em] text-muted uppercase">
            © {year} {brand.name} · {brand.tagline}
          </p>

          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legal.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="font-display text-[10px] font-500 tracking-[0.24em] text-muted uppercase transition-colors duration-300 hover:text-text"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
