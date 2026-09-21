import { pool } from "../config/db";
import { Product } from "../types/product";

// Data-access layer: runs SQL, returns plain rows. No knowledge of HTTP.

export async function insertProduct(input: Omit<Product, "id">) {
  const { name, description, price, stock_quantity, category_id } = input;

  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock_quantity, category_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      name,
      description ?? null,
      price,
      stock_quantity ?? 0,
      category_id ?? null,
    ],
  );
  return result.rows[0];
}

export async function getProductById(id: number) {
  const result = await pool.query(
    `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON  c.id = p.category_id
    WHERE p.id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function getAllProducts(
  filters: { category_id?: number },
  limit: number,
  offset: number,
) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.category_id !== undefined) {
    params.push(filters.category_id);
    conditions.push(`p.category_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit, offset); // pagination params come last

  const sql = `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${where}
     ORDER BY p.id
     LIMIT $${params.length - 1} OFFSET $${params.length}`;

  // 🔍 DEBUG — watch how the query is built (remove later)
  // console.log("🔍 filters   :", filters);
  // console.log("🔍 conditions:", conditions);
  // console.log("🔍 where     :", where);
  // console.log("🔍 params    :", params);
  // console.log("🔍 SQL       :", sql);

  const result = await pool.query(sql, params);
  return result.rows;
}

export async function countProducts(filters: { category_id?: number }) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.category_id !== undefined) {
    params.push(filters.category_id);
    conditions.push(`category_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT COUNT(*) FROM products ${where}`,
    params,
  );
  return Number(result.rows[0].count);
}

export async function putProductById(id: number, input: Omit<Product, "id">) {
  const { name, description, price, stock_quantity, category_id } = input;
  const result = await pool.query(
    `UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4, category_id = $5,updated_at = now()
    WHERE id = $6 
    RETURNING *`,
    [
      name,
      description ?? null,
      price,
      stock_quantity ?? 0,
      category_id ?? null,
      id,
    ],
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
