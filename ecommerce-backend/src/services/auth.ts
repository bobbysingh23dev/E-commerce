import bcrypt from "bcryptjs";
import * as userModel from "../models/users";
import type { RegisterInput } from "../types/user";
import jwt from "jsonwebtoken";

export async function registerUser(input: RegisterInput) {
  const { email, password, name } = input;
  // Hash the password before it ever touches the database.
  // 10 = "salt rounds" (work factor). Higher = slower = harder to brute-force.
  const password_hash = await bcrypt.hash(password, 10);
  return userModel.createUser({ email, password_hash, name, role: "customer" });
}

export const loginUser = async (email: string, password: string) => {
  // 1. Fetch the user (need their stored hash to compare against)
  const user = await userModel.finduserByEmail(email);
  if (!user) {
    return null;
  }
  // 2. Compare the given password to the stored hash
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return null;
  }
  // 3. Passwords match → issue the token
  const jwtToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string, // your secret
    { expiresIn: "7d" },
  );

  return {
    jwtToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};
