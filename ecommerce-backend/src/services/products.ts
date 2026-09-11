import * as productModel from "../models/products";
import { Product } from "../types/product";

/**
 * Business-logic layer for products.
 *
 * Product creation has no special rules yet, so this hands off to the model.
 * Future rules (unique SKU, markup, permissions) will live here — without the
 * controller (HTTP) or model (SQL) needing to know about them.
 */
export async function createProduct(input: Omit<Product, "id">) {
  return productModel.insertProduct(input);
}
