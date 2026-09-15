import { pool } from "../config/db";
import { User } from "../types/user";

export async function createUser(user: Omit<User, "id">): Promise<User> {
  const { email, password_hash, name, role } = user;
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, $2, $3, $4)
    RETIRNING *`,
    [email, password_hash, name, role],
  );
  return result.rows[0];
}

export async function finduserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(`SELECT * FROM  user WHERE email = $1`, [
    email,
  ]);
  return result.rows[0] || null;
}
