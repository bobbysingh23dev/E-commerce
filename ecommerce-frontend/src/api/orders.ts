import { apiFetch } from "./client";
import type { OrderSummary, OrderDetail, OrderStatus } from "../types";

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

// GET /orders — the logged-in user's own orders (headers only, no items).
export function getOrders(): Promise<OrderSummary[]> {
  return apiFetch<OrderSummary[]>("/orders");
}

// GET /orders/:id — one of your orders, WITH its line items. 404 if not yours.
export function getOrder(id: number): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/orders/${id}`);
}

// PATCH /orders/:id — change status. Cancelling restocks inventory (backend
// runs that as a transaction). Returns the updated order summary.
export function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<OrderSummary> {
  return apiFetch<OrderSummary>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
