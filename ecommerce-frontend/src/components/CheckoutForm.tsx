import { useState, type FormEvent } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { confirmPayment as confirmOnBackend } from "../api/payments";
import type { OrderSummary } from "../types";

// Rendered INSIDE <Elements> (so useStripe/useElements have context). It shows
// Stripe's card form and drives: confirm with Stripe → tell our backend.
export default function CheckoutForm({
  orderId,
  onPaid,
}: {
  orderId: number;
  onPaid: (order: OrderSummary) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe.js still loading
    setSubmitting(true);
    setError(null);
    try {
      // 1. Confirm the card with Stripe directly. redirect:"if_required" keeps
      //    us on-page for normal cards (no full-page redirect).
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message ?? "Payment failed");
        return;
      }

      // 2. If Stripe says it succeeded, have our backend verify + mark it paid.
      if (paymentIntent?.status === "succeeded") {
        const order = await confirmOnBackend(orderId, paymentIntent.id);
        onPaid(order);
      } else {
        setError(`Payment status: ${paymentIntent?.status ?? "unknown"}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="alert-error">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn-primary w-full py-3"
      >
        {submitting ? "Processing…" : "Pay now"}
      </button>
      <p className="text-center text-xs text-faint">
        Test mode — use card 4242 4242 4242 4242, any future date & CVC.
      </p>
    </form>
  );
}
