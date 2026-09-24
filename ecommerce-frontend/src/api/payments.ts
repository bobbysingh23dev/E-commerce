import { apiFetch } from "./client";
import type { OrderSummary, PaymentIntentResponse } from "../types";

// POST /payments/:orderId/intent — create a Stripe PaymentIntent for the order.
// Returns the clientSecret the browser needs to confirm the card payment.
export function createPaymentIntent(
  orderId: number,
): Promise<PaymentIntentResponse> {
  return apiFetch<PaymentIntentResponse>(`/payments/${orderId}/intent`, {
    method: "POST",
  });
}

// POST /payments/:orderId/confirm — after Stripe says the payment succeeded,
// tell the backend so it verifies with Stripe and marks the order "paid".
export function confirmPayment(
  orderId: number,
  paymentIntentId: string,
): Promise<OrderSummary> {
  return apiFetch<OrderSummary>(`/payments/${orderId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ paymentIntentId }),
  });
}
