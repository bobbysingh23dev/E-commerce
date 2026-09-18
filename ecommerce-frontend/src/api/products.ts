import { apiFetch } from "./client";
import type { Product } from "../types";

// GET /products — public list of all products.
export function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

// GET /products/:id — public single product.
export function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}
