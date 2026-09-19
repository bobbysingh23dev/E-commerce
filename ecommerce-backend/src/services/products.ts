import * as productModel from "../models/products";
import { Product } from "../types/product";

export async function createProduct(input: Omit<Product, "id">) {
  return productModel.insertProduct(input);
}

export async function getProductById(id: number) {
  return productModel.getProductById(id);
}

export async function getAllProducts(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    productModel.getAllProducts(limit, offset),
    productModel.countProducts(),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function putProductById(id: number, input: Omit<Product, "id">) {
  return productModel.putProductById(id, input);
}

export async function deleteProductById(id: number) {
  return productModel.deleteProductById(id);
}
