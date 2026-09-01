"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

export type PlacedOrder = {
  ref: string;
  lines: CartLine[];
  total: number;
};

type CartValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  /** False until localStorage has been read, so the UI can avoid flashing. */
  hydrated: boolean;
  placed: PlacedOrder | null;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  placeOrder: () => void;
  open: () => void;
  close: () => void;
};

const STORAGE_KEY = "brenn.order.v1";
const MAX_QTY = 20;

const CartContext = createContext<CartValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  /* ---------------- persistence ---------------- */
  // Read after mount rather than seeding useState from localStorage: the
  // server renders with an empty basket, so reading during render would make
  // the first client paint disagree with the server markup.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed as CartLine[]);
      }
    } catch {
      // Corrupt or unavailable storage is not worth breaking the page over.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode / quota — the basket just will not survive a reload */
    }
  }, [lines, hydrated]);

  /* ---------------- mutations ---------------- */
  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const at = prev.findIndex((l) => l.id === line.id);
      if (at === -1) return [...prev, { ...line, qty }];
      const next = [...prev];
      next[at] = { ...next[at], qty: Math.min(MAX_QTY, next[at].qty + qty) };
      return next;
    });
    // A fresh add invalidates the previous confirmation screen.
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

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    [lines],
  );

  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines],
  );

  const placeOrder = useCallback(() => {
    if (!lines.length) return;
    // No backend here — the order is confirmed client-side. Generating the ref
    // inside the handler (not during render) keeps it out of hydration.
    const ref = `BR-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlaced({ ref, lines, total: subtotal });
    setLines([]);
  }, [lines, subtotal]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotal,
      isOpen,
      hydrated,
      placed,
      add,
      setQty,
      remove,
      clear,
      placeOrder,
      open,
      close,
    }),
    [
      lines,
      count,
      subtotal,
      isOpen,
      hydrated,
      placed,
      add,
      setQty,
      remove,
      clear,
      placeOrder,
      open,
      close,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
