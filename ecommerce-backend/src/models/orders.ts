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

// One order — ONLY if it belongs to this user (ownership baked into the query)
export async function getOrderById(orderId: number, userId: number) {
  const result = await pool.query(
    `SELECT id, total, status, created_at
     FROM orders
     WHERE id = $1 AND user_id = $2`,
    [orderId, userId],
  );
  return result.rows[0];
}

// The line items for an order, joined to products for the name
export async function getOrderItems(orderId: number) {
  const result = await pool.query(
    `SELECT oi.id, oi.product_id, p.name AS product_name, oi.quantity, oi.unit_price
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId],
  );
  return result.rows;
}
