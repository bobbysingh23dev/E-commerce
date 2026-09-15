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
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.id`,
  );
  return result.rows;
}

export async function putProductById(id: number, input: Omit<Product, "id">) {
  const { name, description, price, stock_quantity } = input;
  const result = await pool.query(
    `UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4 WHERE id = $5 RETURNING *`,
    [name, description ?? null, price, stock_quantity ?? 0, id],
  );
  return result.rows[0];
}

export async function deleteProductById(id: number) {
  const result = await pool.query(
    `DELETE FROM products WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
}
