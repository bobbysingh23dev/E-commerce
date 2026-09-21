import { apiFetch } from "./client";
import type { Category, CategoryInput } from "../types";

// GET /categories — still returns a plain array (no pagination on this one).
export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

// GET /categories/:id
export function getCategory(id: number): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`);
}

// POST /categories — requires a logged-in user (token attached automatically).
export function createCategory(input: CategoryInput): Promise<Category> {
  return apiFetch<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PUT /categories/:id
export function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// DELETE /categories/:id — returns the deleted category.
export function deleteCategory(id: number): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { method: "DELETE" });
}
