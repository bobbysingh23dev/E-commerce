import { Request, Response } from "express";
import * as productService from "../services/products";
import { Product } from "../types/product";

// HTTP layer: reads req, calls the service, sends res.
// Validation now lives in middleware (see src/middlewares/), so these handlers
// can trust that req.params.id and req.body are already valid.

export async function createProduct(req: Request, res: Response) {
  try {
    const input: Omit<Product, "id"> = req.body;
    const product = await productService.createProduct(input);
    res.status(201).json(product); // return the created resource directly
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

export async function getProductById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id); // validateId middleware already checked it
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

export async function putProductById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const input: Omit<Product, "id"> = req.body;
    const updatedProduct = await productService.putProductById(id, input);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(updatedProduct); // return the updated resource directly
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteProductById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const deletedProduct = await productService.deleteProductById(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(deletedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
