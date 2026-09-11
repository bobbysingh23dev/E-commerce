import { Request, Response } from "express";
import * as productService from "../services/products";

// HTTP layer: reads req, validates, calls the service, sends res. No SQL.

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, stock_quantity } = req.body ?? {};

    // Validate required fields.
    if (!name || price === undefined) {
      return res.status(400).json({ error: "name and price are required" });
    }

    const product = await productService.createProduct({
      name,
      description,
      price,
      stock_quantity,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
