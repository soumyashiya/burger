export type Fulfilment = "collection" | "delivery";
export type PaymentMethod = "card" | "counter";

/** Flat delivery charge, waived on collection. */
export const DELIVERY_FEE = 6;

/** Applied to the food subtotal only — delivery is not taxed again. */
export const TAX_RATE = 0.08;

/** Kitchen lead time before the earliest slot can be offered. */
export const LEAD_MINUTES = 25;
export const DELIVERY_EXTRA_MINUTES = 20;

export const SLOT_STEP_MINUTES = 15;
export const SLOT_COUNT = 8;

export const fulfilmentOptions: {
  key: Fulfilment;
  label: string;
  note: string;
}[] = [
  { key: "collection", label: "COLLECTION", note: "Ready at the counter" },
  { key: "delivery", label: "DELIVERY", note: `+$${DELIVERY_FEE} · to your door` },
];

export const paymentOptions: {
  key: PaymentMethod;
  label: string;
  note: string;
}[] = [
  { key: "card", label: "CARD", note: "Pay now" },
  { key: "counter", label: "AT THE COUNTER", note: "Pay on collection" },
];

/**
 * Collection/delivery slots, built from the current time rather than hardcoded
 * so the list is always in the future. Called after mount — deriving it during
 * render would put a clock reading into the server markup.
 */
export function buildSlots(now: Date, leadMinutes = LEAD_MINUTES): string[] {
  const start = new Date(now.getTime() + leadMinutes * 60_000);
  start.setMinutes(
    Math.ceil(start.getMinutes() / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES,
    0,
    0,
  );

  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const d = new Date(start.getTime() + i * SLOT_STEP_MINUTES * 60_000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes(),
    ).padStart(2, "0")}`;
  });
}

/* ------------------------------------------------------------------
   Validation — deliberately forgiving, but enough that the form cannot
   be submitted with obviously unusable contact or card details.
------------------------------------------------------------------- */

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const isPhone = (v: string) => v.replace(/\D/g, "").length >= 7;

/** Card check digit. Catches transposed and mistyped numbers. */
export function luhn(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Accepts MM/YY and rejects anything already past. */
export function isExpiry(value: string, now: Date): boolean {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  // Valid through the last day of the stated month.
  return new Date(year, month, 1).getTime() > now.getTime();
}

export const isCvc = (v: string) => /^\d{3,4}$/.test(v.trim());

/** `4242424242424242` → `4242 4242 4242 4242`, capped at 19 digits. */
export const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();

export const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};
