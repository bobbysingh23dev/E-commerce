import type { Request, Response } from "express";
import * as paymentService from "../services/payment";

export const createIntent = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const orderId = Number(req.params.id);
  const result = await paymentService.createPaymentIntent(orderId, userId);
  res.status(201).json(result);
};
