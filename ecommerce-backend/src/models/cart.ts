import { pool } from "../config/db";

export async function getOrCreateCart(userId: number): Promise<number> {
  const result = await pool.query(
    `INSERT INTO carts (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO UPDATE SET updated_at = now() RETURNING id`,
    [userId],
  );
  return result.rows[0].id;
}

export async function getCartItems(cartId: number) {
  const result = await pool.query(
    `SELECT ci.id, ci.product_id, p.name AS product_name,
         p.price, ci.quantity, (p.price * ci.quantity) AS line_total
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = $1
         ORDER BY ci.id`,
    [cartId],
  );
  return result.rows;
}

// Add a product (or bump its quantity) — the accumulating upsert (Trick 2).
export async function addItem(
  cartId: number,
  productId: number,
  quantity: number,
) {
  const result = await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                   updated_at = now()
     RETURNING *`,
    [cartId, productId, quantity],
  );
  return result.rows[0];
}

// Set an item to an exact quantity (PATCH — a replace, not an add).
export async function setItemQuantity(
  cartId: number,
  productId: number,
  quantity: number,
) {
  const result = await pool.query(
    `UPDATE cart_items SET quantity = $3, updated_at = now()
     WHERE cart_id = $1 AND product_id = $2
     RETURNING *`,
    [cartId, productId, quantity],
  );
  return result.rows[0];
}

export async function removeItem(cartId: number, productId: number) {
  const result = await pool.query(
    `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2
     RETURNING *`,
    [cartId, productId],
  );
  return result.rows[0];
}
export async function clearCart(cartId: number) {
  await pool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);
}
