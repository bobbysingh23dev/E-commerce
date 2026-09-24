import type { Request, Response } from "express";
import * as OrderServices from "../services/orders";
import { getUserId } from "../utils/getUserId";
import { NotFoundError } from "../errors/AppError";

// Order business errors (empty cart, out of stock, product not found) are thrown
// by the service as BadRequestError → the central errorHandler maps them to 400.

export const createOrder = async (req: Request, res: Response) => {
  const { items } = req.body;
  const userId = getUserId(req);
  const order = await OrderServices.createOrder(userId, items);
  res.status(201).json({ message: "Order created successfully", order });
};

export const getOrdersByUser = async (req: Request, res: Response) => {
  const user_id: number = getUserId(req);
  const orders = await OrderServices.getOrdersByUser(user_id);
  res.status(200).json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const orderId = Number(req.params.id);
  const order = await OrderServices.getOrderById(orderId, userId);
  if (!order) throw new NotFoundError("Order not found");
  res.status(200).json(order);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const orderId = Number(req.params.id);
  const { status } = req.body;
  const order = await OrderServices.updateOrderStatus(orderId, userId, status);
  if (!order) throw new NotFoundError("Order not found");
  res.status(200).json(order);
};
