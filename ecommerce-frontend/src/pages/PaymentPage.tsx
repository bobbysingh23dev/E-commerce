import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise } from "../lib/stripe";
import { getOrder } from "../api/orders";
import { createPaymentIntent } from "../api/payments";
import type { OrderDetail, OrderSummary } from "../types";
import CheckoutForm from "../components/CheckoutForm";
import AnimatedPrice from "../components/AnimatedPrice";
import { confetti } from "../lib/motion";

// Theme Stripe's iframe-rendered fields to match Midnight Luxe.
const appearance: StripeElementsOptions["appearance"] = {
  theme: "night",
  variables: {
    colorPrimary: "#8b5cf6",
    colorBackground: "#1b1b27",
    colorText: "#f4f4f8",
    colorTextSecondary: "#a2a2ba",
    colorDanger: "#f87171",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "12px",
  },
};

export default function PaymentPage() {
  const { orderId: idParam } = useParams<{ orderId: string }>();
  const orderId = Number(idParam);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const ord = await getOrder(orderId);
        if (ignore) return;
        setOrder(ord);
        if (ord.status === "paid") {
          setPaid(true); // nothing to pay
          return;
        }
        const intent = await createPaymentIntent(orderId);
        if (!ignore) setClientSecret(intent.clientSecret);
      } catch (err) {
        if (!ignore)
          setError(err instanceof Error ? err.message : "Couldn't start payment");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [orderId]);

  function handlePaid(updated: OrderSummary) {
    setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
    setPaid(true);
    confetti();
  }

  if (loading) return <p className="text-muted">Preparing secure checkout…</p>;

  if (error) {
    return (
      <div className="mx-auto max-w-md">
        <div className="alert-error">{error}</div>
        <Link to="/orders" className="mt-4 inline-block link-muted text-sm">
          ← Back to orders
        </Link>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="mx-auto mt-8 max-w-md text-center">
        <div className="alert-success shadow-[0_30px_80px_-30px_rgba(16,185,129,0.5)]">
          <div className="mb-2 text-5xl">✅</div>
          <h1 className="font-display text-2xl font-bold text-emerald-200">
            Payment successful
          </h1>
          {order && (
            <p className="mt-2 text-emerald-100/80">
              Order #{order.id} · ${order.total} · paid
            </p>
          )}
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

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/orders" className="mb-4 inline-block link-muted text-sm">
        ← Back to orders
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order summary */}
        <div className="card h-fit p-6">
          <h2 className="font-display text-lg font-semibold">
            Order #{order?.id}
          </h2>
          <div className="mt-4 divide-y divide-line">
            {order?.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm text-fg">
                  {item.product_name}{" "}
                  <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="text-sm text-muted">
                  ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-semibold text-muted">Total</span>
            <AnimatedPrice
              value={order?.total ?? "0"}
              className="gradient-text font-display text-2xl font-bold"
            />
          </div>
        </div>

        {/* Payment */}
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Pay with card
          </h2>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <CheckoutForm orderId={orderId} onPaid={handlePaid} />
            </Elements>
          ) : (
            <p className="text-muted">Loading payment form…</p>
          )}
        </div>
      </div>
    </div>
  );
}
