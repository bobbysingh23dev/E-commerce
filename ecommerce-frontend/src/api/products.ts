import { apiFetch } from "./client";
import type { Product, Paginated } from "../types";

// The columns the backend allows sorting by (must match its SORTABLE list).
export type SortColumn = "id" | "name" | "price" | "created_at";

// Everything the products list can be filtered/paged/sorted by. All optional —
// leave a field out and the backend uses its default.
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  sort?: SortColumn;
  order?: "asc" | "desc";
}

// GET /products — now returns { data, pagination }, not a bare array.
export function getProducts(
  query: ProductQuery = {},
): Promise<Paginated<Product>> {
  // URLSearchParams builds "?a=1&b=2" for us and URL-encodes values safely.
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.category_id !== undefined)
    params.set("category_id", String(query.category_id));
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);

  const qs = params.toString();
  return apiFetch<Paginated<Product>>(`/products${qs ? `?${qs}` : ""}`);
}

// GET /products/:id — public single product (unchanged).
export function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}
