import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types";

// One line in the cart = a product plus how many of it. We keep a snapshot of
// the whole product so the cart page can show name/price without refetching.
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number; // total units (for the nav badge)
  total: number; // total price in dollars
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "cart";

function loadStoredCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadStoredCart);

  // Save the cart to localStorage every time it changes, so it survives a
  // refresh. This effect re-runs whenever `items` changes (see the [items] dep).
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // KEY IDEA: we never push/splice the existing array. We build a NEW array and
  // hand it to setItems. React compares old vs new by identity to decide what to
  // re-render, so mutating in place would leave the UI stale. Also note the
  // `prev =>` form: it gives us the latest state, safe even for rapid clicks.
  function addItem(product: Product, quantity = 1) {
    setItems((prev) => {
      const cap = (q: number) => Math.min(q, product.stock_quantity);
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        // Bump the quantity of the matching line; copy every object we touch.
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: cap(i.quantity + quantity) }
            : i,
        );
      }
      return [...prev, { product, quantity: cap(quantity) }];
    });
  }

  function removeItem(productId: number) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.product.id !== productId) return [i];
        const q = Math.min(quantity, i.product.stock_quantity);
        return q <= 0 ? [] : [{ ...i, quantity: q }]; // 0 -> drop the line
      }),
    );
  }

  function clear() {
    setItems([]);
  }

  // Derived values: computed from `items` on each render, never stored
  // separately (storing them would risk them drifting out of sync).
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
