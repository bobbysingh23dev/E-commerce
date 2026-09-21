import * as productModel from "../models/products";
import type { Product } from "../types/product";

export async function createProduct(input: Omit<Product, "id">) {
  return productModel.insertProduct(input);
}

export async function getProductById(id: number) {
  return productModel.getProductById(id);
}

export async function getAllProducts(
  filters: { category_id?: number; search?: string },
  sort: { column?: string; order?: string },
  page: number,
  limit: number,
) {
  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    productModel.getAllProducts(filters, sort, limit, offset),
    productModel.countProducts(filters),
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
