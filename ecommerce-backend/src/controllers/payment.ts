import type { Request, Response } from "express";
import * as paymentService from "../services/payment";

export const createIntent = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const orderId = Number(req.params.id);
  const result = await paymentService.createPaymentIntent(orderId, userId);
  res.status(201).json(result);
};

export const confirmPayment = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const orderId = Number(req.params.id);
  const { paymentIntentId } = req.body;
  const result = await paymentService.confirmPayment(
    orderId,
    userId,
    paymentIntentId,
  );
  res.status(200).json(result);
};
