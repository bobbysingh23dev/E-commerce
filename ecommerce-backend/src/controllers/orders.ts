import { Request, Response } from "express";
import * as OrderServices from "../services/orders";

export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log("::::::::", req, "::::::::");
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
