import { pool } from "../config/db";
import { Product } from "../types/product";

// Data-access layer: runs SQL, returns plain rows. No knowledge of HTTP.

export async function insertProduct(input: Omit<Product, "id">) {
  const { name, description, price, stock_quantity } = input;

  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock_quantity)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description ?? null, price, stock_quantity ?? 0],
  );
  return result.rows[0];
}

export async function getProductById(id: number) {
  const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function getAllProducts() {
  const result = await pool.query(`SELECT * FROM products`);
  return result.rows;
}
