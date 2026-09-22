import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import { pool } from "../config/db";

// A SELF-CONTAINED test: it creates the data it needs and cleans up after
// itself, so it passes the same on your machine and on CI's empty database.

let token: string;
let productId: number;

beforeAll(async () => {
  // 1. A throwaway product this test fully owns (price 10.00, plenty of stock).
  const p = await pool.query(
    `INSERT INTO products (name, price, stock_quantity)
     VALUES ('__test_cart_product__', 10.00, 100)
     RETURNING id`,
  );
  productId = p.rows[0].id;

  // 2. Log in as the seeded user to get a token.
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "alice@test.com", password: "secret123" });
  token = res.body.jwtToken;

  // 3. Start from an empty cart so totals are deterministic.
  await pool.query(
    `DELETE FROM cart_items WHERE cart_id IN
       (SELECT id FROM carts
        WHERE user_id = (SELECT id FROM users WHERE email = 'alice@test.com'))`,
  );
});

afterAll(async () => {
  // FK-safe cleanup: drop orders that reference our product (cascades their
  // order_items), then any cart rows, then the product itself.
  await pool.query(
    `DELETE FROM orders WHERE id IN
       (SELECT order_id FROM order_items WHERE product_id = $1)`,
    [productId],
  );
  await pool.query(`DELETE FROM cart_items WHERE product_id = $1`, [productId]);
  await pool.query(`DELETE FROM products WHERE id = $1`, [productId]);
  await pool.end();
});

describe("Cart", () => {
  it("blocks GET /cart without a token (401)", async () => {
    const res = await request(app).get("/cart");
    expect(res.status).toBe(401);
  });

  it("adds a product to the cart", async () => {
    const res = await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.product_id).toBe(productId);
    expect(res.body.quantity).toBe(2);
  });

  it("accumulates quantity on re-add (upsert)", async () => {
    const res = await request(app)
      .post("/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ product_id: productId, quantity: 3 });
    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(5); // 2 + 3, not a new row
  });

  it("shows the item and computed total in GET /cart", async () => {
    const res = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.itemCount).toBe(1);
    const line = res.body.items[0];
    expect(line.product_id).toBe(productId);
    expect(line.quantity).toBe(5);
    expect(res.body.total).toBe("50.00"); // 5 * 10.00
  });

  it("checks out the cart into an order and empties it", async () => {
    const res = await request(app)
      .post("/cart/checkout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(201);
    expect(res.body.order).toHaveProperty("id");

    // The cart is now empty.
    const cart = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${token}`);
    expect(cart.body.itemCount).toBe(0);
  });
});
