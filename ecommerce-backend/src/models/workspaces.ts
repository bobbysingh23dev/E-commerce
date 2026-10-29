import { pool } from "../config/db";

export async function getSupportDashboard() {
  const [summary, recentOrders] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_orders,
              COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_orders,
              COUNT(*) FILTER (WHERE status = 'paid')::int AS paid_orders,
              COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_orders,
              COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_orders
       FROM orders`,
    ),
    pool.query(
      `SELECT o.id, o.total, o.status, o.created_at,
              u.id AS customer_id, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 50`,
    ),
  ]);

  return { summary: summary.rows[0], recentOrders: recentOrders.rows };
}

export async function getInventorySummary() {
  const [summary, attentionProducts] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS product_count,
              COALESCE(SUM(stock_quantity), 0)::int AS total_units,
              COUNT(*) FILTER (WHERE stock_quantity > 0 AND stock_quantity <= 10)::int AS low_stock_count,
              COUNT(*) FILTER (WHERE stock_quantity <= 0)::int AS out_of_stock_count
       FROM products`,
    ),
    pool.query(
      `SELECT p.id, p.name, p.stock_quantity, p.version,
              c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.stock_quantity <= 10
       ORDER BY p.stock_quantity ASC, p.name ASC
       LIMIT 50`,
    ),
  ]);

  return {
    summary: summary.rows[0],
    attentionProducts: attentionProducts.rows,
  };
}

export async function updateInventoryStock(
  productId: number,
  stockQuantity: number,
  version: number,
) {
  const result = await pool.query(
    `UPDATE products
     SET stock_quantity = $1, version = version + 1, updated_at = now()
     WHERE id = $2 AND version = $3
     RETURNING id, name, stock_quantity, version, updated_at`,
    [stockQuantity, productId, version],
  );
  return result.rows[0] ?? null;
}

export async function productExists(productId: number) {
  const result = await pool.query("SELECT 1 FROM products WHERE id = $1", [
    productId,
  ]);
  return Boolean(result.rows[0]);
}

export async function getContentDashboard() {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM products) AS product_count,
       (SELECT COUNT(*)::int FROM categories) AS category_count,
       (SELECT COUNT(*)::int FROM products
        WHERE NULLIF(BTRIM(description), '') IS NULL) AS missing_descriptions,
       (SELECT COUNT(*)::int FROM products
        WHERE NULLIF(BTRIM(image_url), '') IS NULL) AS missing_images`,
  );
  return result.rows[0];
}
