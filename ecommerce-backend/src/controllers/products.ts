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

export async function getProductById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await productService.getAllProducts();
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
