import { apiFetch } from "./client";
import type { AdminUser, NewStaffInput, UserRole } from "../types";

// All of these are admin only (a non-admin gets 403 -> ApiError).

// GET /users
export function getUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/users");
}

// POST /users — admin creates an account with a chosen role.
export function createStaffUser(input: NewStaffInput): Promise<AdminUser> {
  return apiFetch<AdminUser>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PATCH /users/:id/role
export function updateUserRole(id: number, role: UserRole): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
