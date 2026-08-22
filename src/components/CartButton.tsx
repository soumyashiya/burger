"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/cart/CartContext";

export default function CartButton() {
  const { count, open, hydrated } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count ? `Your order — ${count} items` : "Your order"}
      className="btn-brut relative flex items-center gap-2 px-3 py-2 font-display text-[10px] font-700 tracking-[0.22em] uppercase"
    >
      <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Order</span>
      {/* Rendered only once storage has been read, so a restored basket does
          not pop in as a hydration mismatch. */}
      {hydrated && count > 0 && (
        <span className="ml-0.5 min-w-[18px] bg-text px-1 py-px text-center text-[10px] leading-[14px] text-bg tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}
