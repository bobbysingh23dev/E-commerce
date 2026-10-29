// Single source of truth for roles. The DB CHECK on users.role must match
// (see migrations/014_expand_user_roles.sql).
export const ROLES = [
  "customer",
  "admin",
  "support",
  "inventory_manager",
  "order_manager",
  "finance",
  "content_editor",
] as const;
export type Role = (typeof ROLES)[number];

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  created_at?: Date;
  updated_at?: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}
