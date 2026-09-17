import { pool } from "../config/db";

type OrderItemInput = { product_id: number; quantity: number }[];
type LineItems = {
  product_id: number;
  quantity: number;
  unit_price: number;
}[];

export const createOrder = async (user_id: number, items: OrderItemInput) => {
  // Business rule: no empty orders.
  if (!items || items?.length === 0) {
    throw new Error("Order must have at least one item");
  }

  const client = await pool.connect(); // one dedicated connection for the transaction

  try {
    await client.query("BEGIN");
    // ---- SECTION 1: check stock & compute the total ----
    let total = 0;
    const lineItems: LineItems = [];
    for (const item of items) {
      const result = await client.query(
        ` SELECT id, price , stock_quantity from products where id = $1`,
        [item.product_id],
      );
      const product = result.rows[0];

      if (!product) {
        throw new Error(`Product with ${item.product_id} is not found`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Not enough stock for product ${item.product_id}`);
      }
      const unitPrice = Number(product.price); // NUMERIC comes back as string → convert

      total += unitPrice * item.quantity;
      lineItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
    }
    // ---- SECTION 2: insert the order header ----

    const orderResult = await client.query(
      `INSERT INTO orders (user_id,total) VALUES ($1,$2) RETURNING *`,
      [user_id, total], // 🥶
    );

    const order = orderResult.rows[0];
    // ---- SECTION 3: insert each line item + decrement stock ----

    for (const item of lineItems) {
      await client.query(
        `INSERT INTO  order_items (order_id, product_id, quantity, unit_price) 
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [order.id, item.product_id, item.quantity, item.unit_price],
      );

      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE ID = $2`,
        [item.quantity, item.product_id],
      );
    }
    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
