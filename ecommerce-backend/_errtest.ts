import { pool } from "./src/config/db";

async function main() {
  console.log("=== Trigger 23505: insert a DUPLICATE category name ===");
  try {
    await pool.query("INSERT INTO categories (name) VALUES ('Apparel')"); // Apparel already exists
  } catch (err: any) {
    console.log("  err.code       :", err.code);
    console.log("  err.message    :", err.message);
    console.log("  err.constraint :", err.constraint);
    console.log("  err.detail     :", err.detail);
  }

  console.log(
    "\n=== Trigger 23503: reference a category_id that doesn't exist ===",
  );
  try {
    await pool.query(
      "INSERT INTO products (name, price, category_id) VALUES ('Test', 5, 99999)",
    );
  } catch (err: any) {
    console.log("  err.code       :", err.code);
    console.log("  err.message    :", err.message);
    console.log("  err.detail     :", err.detail);
  }
  await pool.end();
}
main();
