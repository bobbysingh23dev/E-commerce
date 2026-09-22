import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { OrderSummary } from "../types";

export default function CartPage() {
  const { items, total, loading, updateQuantity, removeItem, clear, checkout } =
    useCart();
  const { user } = useAuth();

  const [placedOrder, setPlacedOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // A tiny helper so each cart action shows any server error (e.g. the PATCH
  // failing) instead of silently doing nothing.
  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleCheckout() {
    setError(null);
    setSubmitting(true);
    try {
      const order = await checkout(); // POST /cart/checkout
      setPlacedOrder(order);
    } catch (err) {
      // e.g. "Not enough stock for X" or "Your cart is empty" from the backend.
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Not logged in: the cart is a per-user, server-side thing now. ---
  if (!user) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Your cart</h1>
        <p className="text-slate-500">
          Please{" "}
          <Link
            to="/login"
            state={{ from: { pathname: "/cart" } }}
            className="font-medium text-slate-900 underline"
          >
            log in
          </Link>{" "}
          to use your cart.
        </p>
      </div>
    );
  }

  // --- Success screen (after checkout) ---
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h1 className="text-xl font-bold text-green-800">Order placed! 🎉</h1>
        <p className="mt-2 text-green-700">
          Order #{placedOrder.id} — total ${placedOrder.total} — status{" "}
          <span className="font-medium">{placedOrder.status}</span>.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            to="/orders"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            View my orders
          </Link>
          <Link
            to="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return <p className="text-slate-500">Loading your cart…</p>;
  }

  // --- Empty cart ---
  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Your cart</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
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
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{item.product_name}</p>
              <p className="text-sm text-slate-500">${item.price} each</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Quantity stepper — each click PATCHes the server, then refetches */}
              <div className="flex items-center rounded-md border border-slate-300">
                <button
                  onClick={() =>
                    run(() => updateQuantity(item.product_id, item.quantity - 1))
                  }
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() =>
                    run(() => updateQuantity(item.product_id, item.quantity + 1))
                  }
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Line total comes straight from the server */}
              <span className="w-20 text-right font-medium text-slate-900">
                ${item.line_total}
              </span>

              <button
                onClick={() => run(() => removeItem(item.product_id))}
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
        <span className="text-lg font-bold text-slate-900">${total}</span>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={() => run(clear)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Clear cart
        </button>
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="rounded-md bg-slate-900 px-5 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </div>
    </div>
  );
}
