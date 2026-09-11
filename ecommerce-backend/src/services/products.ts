import * as productModel from "../models/products";
import { Product } from "../types/product";

export async function createProduct(input: Omit<Product, "id">) {
  return productModel.insertProduct(input);
}

export async function getProductById(id: number) {
  return productModel.getProductById(id);
}
