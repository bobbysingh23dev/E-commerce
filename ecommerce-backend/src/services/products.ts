import * as productModel from "../models/products";
import { Product } from "../types/product";

export async function createProduct(input: Omit<Product, "id">) {
  return productModel.insertProduct(input);
}

export async function getProductById(id: number) {
  return productModel.getProductById(id);
}

export async function getAllProducts() {
  return productModel.getAllProducts();
}

export async function putProductById(id: number, input: Omit<Product, "id">) {
  return productModel.putProductById(id, input);
}

export async function deleteProductById(id: number) {
  return productModel.deleteProductById(id);
}
