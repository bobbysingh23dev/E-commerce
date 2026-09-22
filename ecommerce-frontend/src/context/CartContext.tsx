import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItemView, OrderSummary } from "../types";
import * as cartApi from "../api/cart";
import { useAuth } from "./AuthContext";

// The cart now lives on the SERVER (per user). This context is a thin mirror:
// it holds the latest server state and, after every change, refetches so the
// UI always reflects what the backend actually has. No more localStorage.
interface CartContextValue {
  items: CartItemView[];
  itemCount: number; // total units, for the nav badge
  total: string; // server-computed money string
  loading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  checkout: () => Promise<OrderSummary>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // CartProvider sits INSIDE AuthProvider (see App.tsx), so it can read who's
  // logged in — the cart belongs to that user.
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemView[]>([]);
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(false);

  // Pull the whole cart from the server. useCallback keeps the function stable
  // so the effect below doesn't re-run on every render — only when `user` changes.
  const refresh = useCallback(async () => {
    if (!user) {
      // Logged out: there's no server cart to show.
      setItems([]);
      setTotal("0.00");
      return;
    }
    setLoading(true);
    try {
      const cart = await cartApi.getCart();
      setItems(cart.items);
      setTotal(cart.total);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load (or clear) the cart whenever the logged-in user changes.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Each mutation: call the API, then refetch so state matches the server.
  // (Simple and always-correct. A fancier version would update optimistically.)
  async function addItem(productId: number, quantity = 1) {
    await cartApi.addCartItem(productId, quantity);
    await refresh();
  }

  async function removeItem(productId: number) {
    await cartApi.removeCartItem(productId);
    await refresh();
  }

  async function updateQuantity(productId: number, quantity: number) {
    // The backend only accepts a positive quantity, so treat 0 as "remove".
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }
    await cartApi.setCartItemQuantity(productId, quantity);
    await refresh();
  }

  async function clear() {
    await cartApi.clearCart();
    await refresh();
  }

  async function checkout(): Promise<OrderSummary> {
    const res = await cartApi.checkoutCart();
    await refresh(); // the cart is now empty on the server
    return res.order;
  }

  // Badge count = total units (sum of quantities), derived from items.
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        checkout,
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
