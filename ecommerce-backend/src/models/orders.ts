import { pool } from "../config/db";
import { BadRequestError } from "../errors/AppError";

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

// Staff order queues include the customer's contact details for support and
// fulfillment follow-up. Access is restricted at the route layer.
export async function getOrdersForStaff() {
  const result = await pool.query(
    `SELECT o.id, o.total, o.status, o.created_at,
            u.id AS customer_id, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`,
  );
  return result.rows;
}

export async function updateOrderStatusForStaff(
  orderId: number,
  status: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query(
      "SELECT id, status FROM orders WHERE id = $1 FOR UPDATE",
      [orderId],
    );
    if (!current.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    const currentStatus = current.rows[0].status;
    const allowedNextStatuses: Record<string, string[]> = {
      pending: ["pending", "cancelled"],
      paid: ["paid", "completed"],
      completed: ["completed"],
      cancelled: ["cancelled"],
    };
    if (!allowedNextStatuses[currentStatus]?.includes(status)) {
      throw new BadRequestError(
        `Cannot change an order from ${currentStatus} to ${status}`,
      );
    }

    if (status === "cancelled" && current.rows[0].status !== "cancelled") {
      const items = await client.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
        [orderId],
      );
      for (const item of items.rows) {
        await client.query(
          "UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2",
          [item.quantity, item.product_id],
        );
      }
    }

    const updated = await client.query(
      `UPDATE orders SET status = $1, updated_at = now()
       WHERE id = $2 RETURNING id, total, status, created_at`,
      [status, orderId],
    );
    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

// Simple status change (for non-cancel transitions like → paid)
export async function updateOrderStatus(
  orderId: number,
  userId: number,
  status: string,
) {
  const result = await pool.query(
    `UPDATE orders SET status = $1, updated_at = now()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [status, orderId, userId],
  );
  return result.rows[0];
}
