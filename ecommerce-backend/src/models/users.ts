import { pool } from "../config/db";
import type { Role, User } from "../types/user";

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

export async function findUserById(id: number) {
  const result = await pool.query(
    `SELECT id, email, name, role FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function finduserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(`SELECT * FROM  users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0] || null;
}

export async function listUsers() {
  const result = await pool.query(
    `SELECT id, email, name, role, created_at FROM users ORDER BY id`,
  );
  return result.rows;
}

export async function updateUserRole(id: number, role: Role) {
  const result = await pool.query(
    `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, email, name, role, created_at`,
    [role, id],
  );
  return result.rows[0] || null;
}
