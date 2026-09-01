export const brand = {
  name: "BRENN",
  tagline: "FLAME-FORGED",
  hours: "OPEN DAILY 12–22",
} as const;

// Every href must be the id of a section that actually renders — the header's
// scroll-spy observes these ids and silently drops any that don't resolve.
export const navItems = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#story" },
  { label: "Menu", href: "#line-up" },
  { label: "Shop", href: "#configurator" },
] as const;

/**
 * Footer columns. The sitemap carries more than the header nav on purpose —
 * the header is kept to four, so the footer is where the sections that did not
 * make the cut stay reachable.
 */
export const footerNav = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#story" },
  { label: "Menu", href: "#line-up" },
  { label: "Shop", href: "#configurator" },
  { label: "The Club", href: "#membership" },
  { label: "Reservations", href: "#reserve" },
  { label: "Contact", href: "#contact" },
] as const;

// Placeholder hrefs — swap for the real profiles before this goes live.
export const social = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "YouTube", href: "#" },
] as const;

export const contact = {
  street: "18 Forge Street",
  city: "London E1 6QL",
  email: "hello@brennburger.co",
  phone: "+44 20 7946 0114",
} as const;

export const legal = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Allergens", href: "#" },
] as const;
