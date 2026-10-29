import * as workspaceModel from "../models/workspaces";
import { ConflictError, NotFoundError } from "../errors/AppError";

export async function getSupportDashboard() {
  return workspaceModel.getSupportDashboard();
}

export async function getInventorySummary() {
  return workspaceModel.getInventorySummary();
}

export async function updateInventoryStock(
  productId: number,
  stockQuantity: number,
  version: number,
) {
  const product = await workspaceModel.updateInventoryStock(
    productId,
    stockQuantity,
    version,
  );
  if (product) return product;

  if (!(await workspaceModel.productExists(productId))) {
    throw new NotFoundError("Product not found");
  }
  throw new ConflictError(
    "Stock was changed by someone else. Reload and try again.",
  );
}

export async function getContentDashboard() {
  return workspaceModel.getContentDashboard();
}
