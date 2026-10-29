import { Router } from "express";
import * as orderController from "../controllers/orders";
import { authenticate } from "../middlewares/authenticate";
import { validateOrderBody } from "../middlewares/validateOrderBody";
import { validateId } from "../middlewares/validateId";
import { validateStatusBody } from "../middlewares/validateStatusBody";
import { requireRoles } from "../middlewares/requireRoles";

const orderRouter = Router();

orderRouter.use(authenticate);
orderRouter.get(
  "/manage",
  requireRoles("support", "order_manager"),
  orderController.getOrdersForStaff,
);
orderRouter.patch(
  "/manage/:id",
  requireRoles("order_manager"),
  validateId,
  validateStatusBody,
  orderController.updateOrderStatusForStaff,
);
orderRouter.post("/", validateOrderBody, orderController.createOrder);
orderRouter.get("/", orderController.getOrdersByUser);
orderRouter.get("/:id", validateId, orderController.getOrderById);
orderRouter.patch(
  "/:id",
  validateId,
  validateStatusBody,
  orderController.updateOrderStatus,
);

export default orderRouter;
