import { pool } from "../config/db";

export async function getOrdersByUser(userId: number) {
  const result = await pool.query(
    `SELECT id, total, status, created_at
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows;
}
