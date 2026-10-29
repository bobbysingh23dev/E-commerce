import type { Request, Response } from "express";
import * as workspaceService from "../services/workspaces";

export async function getSupportDashboard(_req: Request, res: Response) {
  res.status(200).json(await workspaceService.getSupportDashboard());
}

export async function getInventorySummary(_req: Request, res: Response) {
  res.status(200).json(await workspaceService.getInventorySummary());
}

export async function updateInventoryStock(req: Request, res: Response) {
  const product = await workspaceService.updateInventoryStock(
    Number(req.params.id),
    req.body.stock_quantity,
    req.body.version,
  );
  res.status(200).json(product);
}

export async function getContentDashboard(_req: Request, res: Response) {
  res.status(200).json(await workspaceService.getContentDashboard());
}
