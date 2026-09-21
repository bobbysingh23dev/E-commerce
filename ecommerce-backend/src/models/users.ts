import { pool } from "../config/db";
import type { User } from "../types/user";

export async function createUser(user: Omit<User, "id">): Promise<User> {
  try {
    const { email, password_hash, name, role } = user;
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING  id, email, name, role, created_at`,
      [email, password_hash, name, role],
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // rethrow the error after logging it
  }
}

export async function finduserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(`SELECT * FROM  users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0] || null;
}
