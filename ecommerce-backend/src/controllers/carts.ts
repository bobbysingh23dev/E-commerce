import type { Request, Response } from "express";
import * as cartService from "../services/carts";

export async function getCart(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const cart = await cartService.getCart(userId);
  res.status(200).json(cart);
}

export async function addToCart(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const { product_id, quantity } = req.body;
  const item = await cartService.addToCart(userId, product_id, quantity);
  res.status(201).json(item);
}

export async function updateItem(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const productId = Number(req.params.id);
  const { quantity } = req.body;
  const item = await cartService.updateItem(userId, productId, quantity);
  res.status(200).json(item);
}

export async function removeItem(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const productId = Number(req.params.id);
  const removed = await cartService.removeItem(userId, productId);
  res.status(200).json(removed);
}

export async function clearCart(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  await cartService.clearCart(userId);
  res.status(200).json({ message: "Cart cleared" });
}

export async function checkout(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const order = await cartService.checkout(userId);
  res.status(201).json({ message: "Order placed successfully", order });
}
