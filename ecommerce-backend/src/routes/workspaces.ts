import { Router } from "express";
import * as workspaceController from "../controllers/workspaces";
import * as orderController from "../controllers/orders";
import * as reportController from "../controllers/reports";
import { authenticate } from "../middlewares/authenticate";
import { requireRoles } from "../middlewares/requireRoles";
import { validateId } from "../middlewares/validateId";
import { validateStatusBody } from "../middlewares/validateStatusBody";
import { validateStockUpdateBody } from "../middlewares/validateStockUpdateBody";

const workspaceRouter = Router();

workspaceRouter.get(
  "/support",
  authenticate,
  requireRoles("support"),
  workspaceController.getSupportDashboard,
);
workspaceRouter.get(
  "/inventory",
  authenticate,
  requireRoles("inventory_manager"),
  workspaceController.getInventorySummary,
);
workspaceRouter.patch(
  "/inventory/products/:id/stock",
  authenticate,
  requireRoles("inventory_manager"),
  validateId,
  validateStockUpdateBody,
  workspaceController.updateInventoryStock,
);
workspaceRouter.get(
  "/content",
  authenticate,
  requireRoles("content_editor"),
  workspaceController.getContentDashboard,
);
workspaceRouter.get(
  "/orders",
  authenticate,
  requireRoles("order_manager"),
  orderController.getOrdersForStaff,
);
workspaceRouter.patch(
  "/orders/:id/status",
  authenticate,
  requireRoles("order_manager"),
  validateId,
  validateStatusBody,
  orderController.updateOrderStatusForStaff,
);
workspaceRouter.get(
  "/finance",
  authenticate,
  requireRoles("finance"),
  reportController.getSummary,
);

export default workspaceRouter;
