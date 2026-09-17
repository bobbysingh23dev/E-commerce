import { Router } from "express";
import * as orderController from "../controllers/orders";
import { authenticate } from "../middlewares/authenticate";
import { validateOrderBody } from "../middlewares/validateOrderBody";
import { validateId } from "../middlewares/validateId";

const orderRouter = Router();

orderRouter.use(authenticate);
orderRouter.post("/", validateOrderBody, orderController.createOrder);
orderRouter.get("/", orderController.getOrdersByUser);
orderRouter.get("/:id", validateId, orderController.getOrderById);

export default orderRouter;
