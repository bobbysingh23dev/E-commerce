import { Router } from "express";
import * as orderController from "../controllers/orders";
import { authenticate } from "../middlewares/authenticate";
import { validateOrderBody } from "../middlewares/validateOrderBody";

const orderRouter = Router();

orderRouter.use(authenticate);
orderRouter.post("/", validateOrderBody, orderController.createOrder);

export default orderRouter;
