import { Request, Response } from "express";
import * as OrderServices from "../services/orders";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const userId = (req as any).user.userId;
    const order = await OrderServices.createOrder(userId, items);

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: error.message,
    });
  }
};

export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const user_id: number = (req as any).user.userId;
    const orders = await OrderServices.getOrdersByUser(user_id);
    if (!orders) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(orders);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: error.message,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const orderId = Number(req.params.id);

    const order = await OrderServices.getOrderById(orderId, userId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
