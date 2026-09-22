import { apiFetch } from "./client";
import type { CartView, CartItemRow, OrderSummary } from "../types";

// All cart routes require login — the token is attached automatically.

// GET /cart — the current user's cart with live prices + total.
export function getCart(): Promise<CartView> {
  return apiFetch<CartView>("/cart");
}

// POST /cart/items — add a product (backend accumulates if already present).
export function addCartItem(
  product_id: number,
  quantity: number,
): Promise<CartItemRow> {
  return apiFetch<CartItemRow>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity }),
  });
}

// PATCH /cart/items/:productId — SET an exact quantity (note: :id is the
// PRODUCT id, not the cart-row id — that's how the backend is wired).
export function setCartItemQuantity(
  productId: number,
  quantity: number,
): Promise<CartItemRow> {
  return apiFetch<CartItemRow>(`/cart/items/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

// DELETE /cart/items/:productId — remove one product line.
export function removeCartItem(productId: number): Promise<CartItemRow> {
  return apiFetch<CartItemRow>(`/cart/items/${productId}`, {
    method: "DELETE",
  });
}

// DELETE /cart — empty the whole cart.
export function clearCart(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/cart", { method: "DELETE" });
}

// POST /cart/checkout — turn the cart into an order (stock-checked transaction).
export function checkoutCart(): Promise<{ message: string; order: OrderSummary }> {
  return apiFetch<{ message: string; order: OrderSummary }>("/cart/checkout", {
    method: "POST",
  });
}
