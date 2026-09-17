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
    res.status(200).json(orders); // 200 = OK, just return the list
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: error.message,
    });
  }
};
