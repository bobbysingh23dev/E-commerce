import { pool } from "../config/db";
import { Category } from "../types/category";

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
