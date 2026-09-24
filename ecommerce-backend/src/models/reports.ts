import { pool } from "../config/db";

// Headline numbers about orders.
export async function getOverview() {
  const r = await pool.query(
    `SELECT
       COUNT(*)::int                        AS order_count,
       COALESCE(SUM(total), 0)              AS total_revenue,
       COALESCE(ROUND(AVG(total), 2), 0)    AS avg_order_value
     FROM orders`,
  );
  return r.rows[0];
}

// Catalog / customer counts (subqueries in the SELECT list).
export async function getCounts() {
  const r = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM products)::int                        AS product_count,
       (SELECT COUNT(*) FROM users WHERE role = 'customer')::int   AS customer_count`,
  );
  return r.rows[0];
}

// How many orders sit in each status → { pending, paid, ... }.
export async function getOrdersByStatus() {
  const r = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM orders GROUP BY status ORDER BY status`,
  );
  return r.rows;
}

// Best sellers overall (aggregation + JOIN over the order_items).
export async function getTopProducts(limit = 5) {
  const r = await pool.query(
    `SELECT p.id, p.name,
       SUM(oi.quantity)::int              AS units_sold,
       SUM(oi.quantity * oi.unit_price)   AS revenue
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     GROUP BY p.id, p.name
     ORDER BY units_sold DESC
     LIMIT $1`,
    [limit],
  );
  return r.rows;
}

// ⭐ Window function: the #1 best-seller in EACH category
// (ROW_NUMBER over the per-category grouped totals — Concept 2 in action).
export async function getBestSellerPerCategory() {
  const r = await pool.query(
    `SELECT category, product, units_sold FROM (
       SELECT c.name AS category, p.name AS product,
         SUM(oi.quantity)::int AS units_sold,
         ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY SUM(oi.quantity) DESC) AS rn
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN categories c ON c.id = p.category_id
       GROUP BY c.id, c.name, p.name
     ) ranked
     WHERE rn = 1
     ORDER BY units_sold DESC`,
  );
  return r.rows;
}
