import { Router } from "express";

import { pool } from "../config/db";

const productsRouter = Router();

productsRouter.post("/", async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body ?? {};

    if (!name || !price) {
      return res.status(400).json({ error: "name and price are required" });
    }

    const result = await pool.query(
      "INSERT INTO products (name, description, price, stock_quantity) VALUES ($1, $2, $3, $4)",
      [name, description ?? null, price, stock_quantity],
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default productsRouter;
