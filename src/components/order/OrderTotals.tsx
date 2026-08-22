/** Subtotal / delivery / tax / total. Shared by the drawer and the receipt. */
export default function OrderTotals({
  subtotal,
  deliveryFee,
  tax,
  total,
  size = "sm",
}: {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  size?: "sm" | "lg";
}) {
  return (
    <div className="space-y-1.5">
      {[
        ["Subtotal", subtotal],
        ...(deliveryFee ? [["Delivery", deliveryFee] as const] : []),
        ["Tax", tax],
      ].map(([label, value]) => (
        <div
          key={label as string}
          className="flex justify-between font-display text-[9px] font-600 tracking-[0.2em] text-muted uppercase tabular-nums"
        >
          <span>{label}</span>
          <span>${value}</span>
        </div>
      ))}
      <div className="flex items-end justify-between border-t border-stroke pt-2.5">
        <span className="font-display text-[10px] font-700 tracking-[0.3em] text-muted uppercase">
          Total
        </span>
        <span
          className={`font-anton text-text tabular-nums ${
            size === "lg" ? "text-5xl" : "text-3xl"
          }`}
        >
          ${total}
        </span>
      </div>
    </div>
  );
}
