import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orders";
import type { OrderSummary } from "../types";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [placedOrder, setPlacedOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCheckout() {
    // Orders require login. If logged out, send them to login and back here.
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Map cart lines -> the payload the backend expects.
      const res = await createOrder(
        items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      );
      clear(); // empty the cart now that it's an order
      setPlacedOrder(res.order);
    } catch (err) {
      // e.g. "out of stock" or "product not found" from the backend.
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Success screen (shown after a successful checkout) ---
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h1 className="text-xl font-bold text-green-800">Order placed! 🎉</h1>
        <p className="mt-2 text-green-700">
          Order #{placedOrder.id} — total ${placedOrder.total} — status{" "}
          <span className="font-medium">{placedOrder.status}</span>.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // --- Empty cart ---
  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Your cart</h1>
        <p className="text-slate-500">
          Your cart is empty.{" "}
          <Link to="/" className="font-medium text-slate-900 underline">
            Browse products
          </Link>
          .
        </p>
      </div>
    );
  }

  // --- Cart with items ---
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Your cart</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{item.product.name}</p>
              <p className="text-sm text-slate-500">
                ${item.product.price} each
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Quantity stepper */}
              <div className="flex items-center rounded-md border border-slate-300">
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.product.stock_quantity}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <span className="w-20 text-right font-medium text-slate-900">
                ${(Number(item.product.price) * item.quantity).toFixed(2)}
              </span>

              <button
                onClick={() => removeItem(item.product.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-lg font-semibold text-slate-900">Total</span>
        <span className="text-lg font-bold text-slate-900">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={clear}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Clear cart
        </button>
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="rounded-md bg-slate-900 px-5 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting
            ? "Placing order…"
            : user
              ? "Place order"
              : "Log in to check out"}
        </button>
      </div>
    </div>
  );
}
