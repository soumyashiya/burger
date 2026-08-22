import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — PRIME",
  description: "Confirm your PRIME order: collection or delivery, and payment.",
  // A checkout has nothing to offer a crawler and should never be indexed.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
