import { pool } from "../config/db";
import * as cartModel from "../models/cart";
import * as productModel from "../models/products";
import { BadRequestError, NotFoundError } from "../errors/AppError";

// GET /cart — the user's cart, with live prices + a computed total.
export async function getCart(userId: number) {
  const cartId = await cartModel.getOrCreateCart(userId);
  const items = await cartModel.getCartItems(cartId);

  // price/line_total are NUMERIC → strings; sum them as numbers.
  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);

  return {
    items,
    total: total.toFixed(2), // keep money as a 2-dp string, like the DB does
    itemCount: items.length,
  };
}

// POST /cart/items — add (or accumulate) a product.
export async function addToCart(
  userId: number,
  productId: number,
  quantity: number,
) {
  // Friendlier than a raw foreign-key error if the product id is bogus.
  const product = await productModel.getProductById(productId);
  if (!product) throw new NotFoundError("Product not found");

  const cartId = await cartModel.getOrCreateCart(userId);
  return cartModel.addItem(cartId, productId, quantity);
}

// PATCH /cart/items/:productId — set an exact quantity.
export async function updateItem(
  userId: number,
  productId: number,
  quantity: number,
) {
  const cartId = await cartModel.getOrCreateCart(userId);
  const updated = await cartModel.setItemQuantity(cartId, productId, quantity);
  if (!updated) throw new NotFoundError("That product is not in your cart");
  return updated;
}

// DELETE /cart/items/:productId — remove one product.
export async function removeItem(userId: number, productId: number) {
  const cartId = await cartModel.getOrCreateCart(userId);
  const removed = await cartModel.removeItem(cartId, productId);
  if (!removed) throw new NotFoundError("That product is not in your cart");
  return removed;
}

// DELETE /cart — empty the cart.
export async function clearCart(userId: number) {
  const cartId = await cartModel.getOrCreateCart(userId);
  await cartModel.clearCart(cartId);
}

// POST /cart/checkout — turn the cart into an order. ALL-OR-NOTHING.
export async function checkout(userId: number) {
  const cartId = await cartModel.getOrCreateCart(userId);
  const client = await pool.connect(); // dedicated connection for the transaction

  try {
    await client.query("BEGIN");

    // 1. Read cart items + CURRENT product price/stock — inside the tx.
    const cartResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId],
    );
    const items = cartResult.rows;

    if (items.length === 0) {
      throw new BadRequestError("Your cart is empty");
    }

    // 2. Check stock + compute the total (snapshot the live price).
    let total = 0;
    for (const item of items) {
      if (item.stock_quantity < item.quantity) {
        throw new BadRequestError(`Not enough stock for ${item.name}`);
      }
      total += Number(item.price) * item.quantity;
    }

    // 3. Create the order header.
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *`,
      [userId, total],
    );
    const order = orderResult.rows[0];

    // 4. Copy each item → order_items (FREEZE unit_price) + decrement stock.
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, Number(item.price)],
      );
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.product_id],
      );
    }

    // 5. Empty the cart — in the SAME transaction.
    await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
