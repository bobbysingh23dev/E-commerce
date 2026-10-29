import bcrypt from "bcryptjs";
import * as userModel from "../models/users";
import { BadRequestError, NotFoundError } from "../errors/AppError";
import type { Role } from "../types/user";

export async function listUsers() {
  return userModel.listUsers();
}

// Admin creates an account for a staff member with a chosen role.
// (Public /auth/register still only ever creates "customer".)
export async function createStaffUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const password_hash = await bcrypt.hash(input.password, 10);
  return userModel.createUser({
    email: input.email,
    password_hash,
    name: input.name,
    role: input.role,
  });
}

export async function changeUserRole(
  targetId: number,
  role: Role,
  actingUserId: number,
) {
  // Stops an admin from demoting themselves and locking everyone out.
  if (targetId === actingUserId) {
    throw new BadRequestError("You can't change your own role");
  }
  const user = await userModel.updateUserRole(targetId, role);
  if (!user) throw new NotFoundError("User not found");
  return user;
}
