import bcrypt from "bcryptjs";
import * as userModel from "../models/users";
import { RegisterInput } from "../types/user";

export async function registerUser(input: RegisterInput) {
  const { email, password, name } = input;
  // Hash the password before it ever touches the database.
  // 10 = "salt rounds" (work factor). Higher = slower = harder to brute-force.
  const password_hash = await bcrypt.hash(password, 10);
  return userModel.createUser({ email, password_hash, name, role: "customer" });
}
