"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DELIVERY_EXTRA_MINUTES,
  DELIVERY_FEE,
  LEAD_MINUTES,
  TAX_RATE,
  type Fulfilment,
  type PaymentMethod,
} from "@/data/order";

export type CartLine = {
  /** Stable identity — two identical builds stack instead of duplicating. */
  id: string;
  name: string;
  meta: string;
  /** Unit price in whole dollars. */
  price: number;
  image: string;
  qty: number;
};

export type OrderDetails = {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  slot: string;
  payment: PaymentMethod;
  /** Last four only — a full PAN is never stored. */
  cardLast4: string;
};

export type PlacedOrder = {
  ref: string;
  placedAtISO: string;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  fulfilment: Fulfilment;
  etaMinutes: number;
  details: OrderDetails;
};

type CartValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  fulfilment: Fulfilment;
  setFulfilment: (f: Fulfilment) => void;
  isOpen: boolean;
  /** False until localStorage has been read, so the UI can avoid flashing. */
  hydrated: boolean;
  placed: PlacedOrder | null;
  clearPlaced: () => void;
  history: PlacedOrder[];
  clearHistory: () => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  reorder: (order: PlacedOrder) => void;
  placeOrder: (details: OrderDetails) => void;
  open: () => void;
  close: () => void;
};

const CART_KEY = "prime.order.v1";
const HISTORY_KEY = "prime.orders.history.v1";
const MAX_QTY = 20;
/** Deep enough for a real history page without letting storage grow forever. */
const MAX_HISTORY = 20;

const CartContext = createContext<CartValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [history, setHistory] = useState<PlacedOrder[]>([]);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("collection");
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  /* ---------------- persistence ---------------- */
  // Read after mount rather than seeding useState: the server renders an empty
  // basket, so reading during render would make the first client paint
  // disagree with the server markup.
  useEffect(() => {
    const stored = read<CartLine[]>(CART_KEY, []);
    if (Array.isArray(stored)) setLines(stored);
    const past = read<PlacedOrder[]>(HISTORY_KEY, []);
    if (Array.isArray(past)) setHistory(past);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      /* private mode / quota — the basket just will not survive a reload */
    }
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* see above */
    }
  }, [history, hydrated]);

  /* ---------------- mutations ---------------- */
  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const at = prev.findIndex((l) => l.id === line.id);
      if (at === -1) return [...prev, { ...line, qty }];
      const next = [...prev];
      next[at] = { ...next[at], qty: Math.min(MAX_QTY, next[at].qty + qty) };
      return next;
    });
    // Adding restarts the checkout: the previous confirmation no longer applies.
    setPlaced(null);
    setIsOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) =>
            l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
          ),
    );
  }, []);

  const remove = useCallback(
    (id: string) => setLines((prev) => prev.filter((l) => l.id !== id)),
    [],
  );

  const clear = useCallback(() => setLines([]), []);

  const clearPlaced = useCallback(() => setPlaced(null), []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const reorder = useCallback((order: PlacedOrder) => {
    setLines(order.lines.map((l) => ({ ...l })));
    setFulfilment(order.fulfilment);
    setPlaced(null);
    setIsOpen(true);
  }, []);

  /* ---------------- money ---------------- */
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    [lines],
  );

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const deliveryFee =
    fulfilment === "delivery" && subtotal > 0 ? DELIVERY_FEE : 0;

  // Tax applies to the food only, so the delivery charge is not taxed twice.
  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);

  const total = subtotal + deliveryFee + tax;

  /* ---------------- checkout ---------------- */
  const placeOrder = useCallback(
    (details: OrderDetails) => {
      if (!lines.length) return;
      // No backend — the order is confirmed client-side. Generating the ref and
      // timestamp inside the handler (not during render) keeps them out of
      // hydration.
      const order: PlacedOrder = {
        ref: `PR-${Math.floor(100000 + Math.random() * 900000)}`,
        placedAtISO: new Date().toISOString(),
        lines,
        subtotal,
        deliveryFee,
        tax,
        total,
        fulfilment,
        etaMinutes:
          LEAD_MINUTES +
          (fulfilment === "delivery" ? DELIVERY_EXTRA_MINUTES : 0),
        details,
      };
      setPlaced(order);
      setHistory((prev) => [order, ...prev].slice(0, MAX_HISTORY));
      setLines([]);
    },
    [lines, subtotal, deliveryFee, tax, total, fulfilment],
  );

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotal,
      deliveryFee,
      tax,
      total,
      fulfilment,
      setFulfilment,
      isOpen,
      hydrated,
      placed,
      clearPlaced,
      history,
      clearHistory,
      add,
      setQty,
      remove,
      clear,
      reorder,
      placeOrder,
      open,
      close,
    }),
    [
      lines,
      count,
      subtotal,
      deliveryFee,
      tax,
      total,
      fulfilment,
      isOpen,
      hydrated,
      placed,
      clearPlaced,
      history,
      clearHistory,
      add,
      setQty,
      remove,
      clear,
      reorder,
      placeOrder,
      open,
      close,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
