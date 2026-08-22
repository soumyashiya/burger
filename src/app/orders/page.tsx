import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "Order history — PRIME",
  description: "Every PRIME order you have placed on this device.",
  // Personal to the device and empty to a crawler.
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersClient />;
}
