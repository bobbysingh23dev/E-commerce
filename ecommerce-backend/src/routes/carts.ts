import { Router } from "express";
import * as cartController from "../controllers/carts";
import { authenticate } from "../middlewares/authenticate";
import { validateId } from "../middlewares/validateId";
import { validate } from "../middlewares/validate";

import { addCartItemSchema, quantitySchema } from "../schemas/cart";

const cartRouter = Router();

// Your cart is private — every route below requires a logged-in user.
cartRouter.use(authenticate);

cartRouter.get("/", cartController.getCart);
cartRouter.post(
  "/items",
  validate(addCartItemSchema),
  cartController.addToCart,
);
cartRouter.patch(
  "/items/:id",
  validateId,
  validate(quantitySchema),
  cartController.updateItem,
);
cartRouter.delete("/items/:id", validateId, cartController.removeItem);
cartRouter.delete("/", cartController.clearCart);
cartRouter.post("/checkout", cartController.checkout);

export default cartRouter;
