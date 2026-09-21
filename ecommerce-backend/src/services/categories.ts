import * as categoryModel from "../models/categories";
import type { Category } from "../types/category";

export async function createCategory(input: Omit<Category, "id">) {
  return categoryModel.createCategory(input);
}

export async function getAllCategories() {
  return categoryModel.getAllCategories();
}

export async function getCategoryById(id: number) {
  return categoryModel.getCategoryById(id);
}

export async function updateCategory(id: number, input: Omit<Category, "id">) {
  return categoryModel.updateCategoryById(id, input);
}

export async function deleteCategory(id: number) {
  return categoryModel.deleteCategory(id);
}
