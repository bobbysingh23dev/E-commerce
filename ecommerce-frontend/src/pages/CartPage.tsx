import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { OrderSummary } from "../types";
import AnimatedPrice from "../components/AnimatedPrice";
import Magnetic from "../components/Magnetic";
import { confetti } from "../lib/motion";

export default function CartPage() {
  const { items, total, loading, updateQuantity, removeItem, clear, checkout } =
    useCart();
  const { user } = useAuth();

  const [placedOrder, setPlacedOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Celebrate a successful checkout.
  useEffect(() => {
    if (placedOrder) confetti();
  }, [placedOrder]);

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
      const order = await checkout();
      setPlacedOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto mt-8 max-w-md text-center">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="mt-3 text-muted">
          Please{" "}
          <Link
            to="/login"
            state={{ from: { pathname: "/cart" } }}
            className="font-medium text-accent-3 hover:underline"
          >
            log in
          </Link>{" "}
          to use your cart.
        </p>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="mx-auto mt-8 max-w-md text-center">
        <div className="alert-success shadow-[0_30px_80px_-30px_rgba(16,185,129,0.5)]">
          <div className="mb-2 text-5xl">🎉</div>
          <h1 className="font-display text-2xl font-bold text-emerald-200">
            Order placed!
          </h1>
          <p className="mt-2 text-emerald-100/80">
            Order #{placedOrder.id} · ${placedOrder.total} · {placedOrder.status}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/orders" className="btn-primary">
              View my orders
            </Link>
            <Link to="/" className="btn-ghost">
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return <p className="text-muted">Loading your cart…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto mt-8 max-w-md text-center">
        <h1 className="text-2xl font-bold">Your cart</h1>
        {error && <div className="alert-error mt-4">{error}</div>}
        <p className="mt-3 text-muted">
          Your cart is empty.{" "}
          <Link to="/" className="font-medium text-accent-3 hover:underline">
            Browse products
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Your cart</h1>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="card flex items-center justify-between p-4"
          >
            <div>
              <p className="font-semibold text-fg">{item.product_name}</p>
              <p className="text-sm text-muted">${item.price} each</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-xl border border-line bg-surface-2">
                <button
                  onClick={() =>
                    run(() => updateQuantity(item.product_id, item.quantity - 1))
                  }
                  className="px-3 py-1.5 text-muted transition hover:text-fg"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    run(() => updateQuantity(item.product_id, item.quantity + 1))
                  }
                  className="px-3 py-1.5 text-muted transition hover:text-fg"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <span className="w-20 text-right font-semibold text-fg">
                ${item.line_total}
              </span>

              <button
                onClick={() => run(() => removeItem(item.product_id))}
                className="text-sm text-red-400 transition hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 flex items-center justify-between p-5">
        <span className="text-lg font-semibold text-muted">Total</span>
        <AnimatedPrice
          value={total}
          className="gradient-text font-display text-3xl font-bold"
        />
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button onClick={() => run(clear)} className="btn-ghost">
          Clear cart
        </button>
        <Magnetic>
          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="btn-primary px-6"
          >
            {submitting ? "Placing order…" : "Checkout →"}
          </button>
        </Magnetic>
      </div>
    </div>
  );
}
