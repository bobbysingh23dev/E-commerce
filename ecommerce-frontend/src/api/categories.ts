import { apiFetch } from "./client";
import type { Category } from "../types";

// GET /categories — still returns a plain array (no pagination on this one).
export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}
