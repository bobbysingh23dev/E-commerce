import { stripe } from "../config/stripe";
import { BadRequestError, NotFoundError } from "../errors/AppError";
import * as orderModel from "../models/orders";

// Create a Stripe PaymentIntent for one of the user's OWN orders.

export const createPaymentIntent = async (orderId: number, userId: number) => {
  const order = await orderModel.getOrderById(orderId, userId);
  if (!order) throw new NotFoundError("Order not found");
  if (order.status === "paid")
    throw new BadRequestError("Order is already paid");

  // Stripe uses the smallest currency unit → cents. $54.97 → 5497.
  const amount = Math.round(Number(order.total) * 100);

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: { orderId: String(orderId), userId: String(userId) },
  });
  return { clientSecret: intent.client_secret, amount, currency: "usd" };
};
