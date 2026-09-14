import * as categoryModel from "../models/categories";
import { Category } from "../types/category";

export async function createCategory(input: Omit<Category, "id">) {
  return categoryModel.createCategory(input);
}

export async function getAllCategories() {
  return categoryModel.getAllCategories();
}
