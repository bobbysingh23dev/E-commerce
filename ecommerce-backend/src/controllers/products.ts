import { Request, Response } from "express";
import * as productService from "../services/products";
import { Product } from "../types/product";
import { NotFoundError } from "../errors/AppError";

// HTTP layer: reads req, calls the service, sends res.
// No try/catch — thrown errors are forwarded to the central errorHandler.
// Validation lives in middleware; DB errors (23505/23503) are mapped centrally.

export async function createProduct(req: Request, res: Response) {
  const input: Omit<Product, "id"> = req.body;
  const product = await productService.createProduct(input);
  res.status(201).json(product);
}

export async function getAllProducts(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const products = await productService.getAllProducts(page, limit);
  res.status(200).json(products);
}

export async function getProductById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const product = await productService.getProductById(id);
  if (!product) throw new NotFoundError("Product not found");
  res.status(200).json(product);
}

export async function putProductById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input: Omit<Product, "id"> = req.body;
  const updatedProduct = await productService.putProductById(id, input);
  if (!updatedProduct) throw new NotFoundError("Product not found");
  res.status(200).json(updatedProduct);
}

export async function deleteProductById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deletedProduct = await productService.deleteProductById(id);
  if (!deletedProduct) throw new NotFoundError("Product not found");
  res.status(200).json(deletedProduct);
}
