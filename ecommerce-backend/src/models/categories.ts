import { pool } from "../config/db";
import type { Category } from "../types/category";

export async function createCategory(
  category: Omit<Category, "id">,
): Promise<Category> {
  const { name, description } = category;
  const result = await pool.query(
    `INSERT INTO categories (name, description)
    VALUES
    ($1, $2) RETURNING *`,
    [name, description],
  );
  return result.rows[0];
}

export async function getAllCategories(): Promise<Category[]> {
  const result = await pool.query(`SELECT * FROM  categories`);
  return result.rows;
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const result = await pool.query(`SELECT * FROM categories WHERE id = $1`, [
    id,
  ]);
  return result.rows[0] || null;
}

export async function updateCategoryById(
  id: number,
  category: Omit<Category, "id">,
): Promise<Category | null> {
  const { name, description } = category;
  const result = await pool.query(
    `UPDATE  categories SET name = $1, description = $2 WHERE id = $3
    RETURNING *`,
    [name, description ?? null, id],
  );
  return result.rows[0] || null;
}

export async function deleteCategory(id: number) {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 RETURNING *`,
    [id],
  );
  return result.rows[0];
}
