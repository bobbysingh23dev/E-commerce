import * as productModel from "../models/products";
import type { Product } from "../types/product";
import { ConflictError } from "../errors/AppError";

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

export async function putProductById(
  id: number,
  input: Omit<Product, "id">,
  version: number,
) {
  const updated = await productModel.putProductById(id, input, version);
  if (updated) return updated;

  // 0 rows updated → either the product doesn't exist, or someone else changed
  // it since the client loaded it (version moved on).
  const exists = await productModel.getProductById(id);
  if (!exists) return null; // controller turns this into 404
  throw new ConflictError(
    "Product was modified by someone else — reload and try again",
  );
}

export async function deleteProductById(id: number) {
  return productModel.deleteProductById(id);
}
