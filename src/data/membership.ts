export type BillingKey = "monthly" | "annual";

/**
 * Single source of truth for the annual saving. The toggle label, the card
 * prices and the yearly totals are all derived from it, so the headline
 * "Save 15%" can never drift away from the arithmetic underneath it.
 */
export const ANNUAL_DISCOUNT = 0.15;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Per-month price when the year is paid up front. */
export const annualPerMonth = (monthly: number) =>
  round2(monthly * (1 - ANNUAL_DISCOUNT));

/** What actually leaves the account, once a year. */
export const annualTotal = (monthly: number) =>
  round2(monthly * 12 * (1 - ANNUAL_DISCOUNT));

export const billing: { key: BillingKey; label: string }[] = [
  { key: "monthly", label: "Monthly" },
  {
    key: "annual",
    label: `Annual — Save ${Math.round(ANNUAL_DISCOUNT * 100)}%`,
  },
];

export type Plan = {
  key: string;
  index: string;
  name: string;
  tagline: string;
  /** Dollars per month, billed monthly. The annual rate derives from this. */
  monthly: number;
  perks: string[];
  /** Carries the "fan favorite" tag, and is the plan selected on load. */
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    key: "solo",
    index: "01",
    name: "THE SOLO",
    tagline: "For your burger fix.",
    monthly: 18,
    perks: [
      "2 burgers a month",
      "Free pickup",
      "10% off sides",
      "Early access",
    ],
  },
  {
    key: "crew",
    index: "02",
    name: "THE CREW",
    tagline: "For serious burger people.",
    monthly: 48,
    featured: true,
    perks: [
      "6 burgers a month",
      "Free delivery",
      "15% off sides",
      "Priority ordering",
    ],
  },
  {
    key: "feast",
    index: "03",
    name: "THE FEAST",
    tagline: "For the whole crew.",
    monthly: 89,
    perks: [
      "12 burgers a month",
      "Free delivery",
      "20% off sides",
      "Exclusive burger",
    ],
  },
];
