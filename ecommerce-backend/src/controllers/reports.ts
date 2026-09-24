import type { Request, Response } from "express";
import * as reportService from "../services/reports";

export async function getSummary(_req: Request, res: Response) {
  const summary = await reportService.getSummary();
  res.status(200).json(summary);
}
