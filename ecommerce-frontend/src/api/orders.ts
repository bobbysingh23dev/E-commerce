import { apiFetch } from "./client";
import type { OrderSummary } from "../types";

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

// The backend wraps the created order in { message, order }.
interface CreateOrderResponse {
  message: string;
  order: OrderSummary;
}

// POST /orders — requires login (the token is attached automatically by
// client.ts). The backend checks stock, computes the total, and decrements
// inventory inside a transaction.
export function createOrder(
  items: OrderItemInput[],
): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
