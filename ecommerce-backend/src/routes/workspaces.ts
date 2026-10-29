import { Router } from "express";
import * as workspaceController from "../controllers/workspaces";
import * as orderController from "../controllers/orders";
import * as reportController from "../controllers/reports";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validateId } from "../middlewares/validateId";
import { validateStatusBody } from "../middlewares/validateStatusBody";
import { validateStockUpdateBody } from "../middlewares/validateStockUpdateBody";

const workspaceRouter = Router();

workspaceRouter.get(
  "/support",
  authenticate,
  authorize("read", "SupportDashboard"),
  workspaceController.getSupportDashboard,
);
workspaceRouter.get(
  "/inventory",
  authenticate,
  authorize("read", "Inventory"),
  workspaceController.getInventorySummary,
);
workspaceRouter.patch(
  "/inventory/products/:id/stock",
  authenticate,
  authorize("update", "Inventory"),
  validateId,
  validateStockUpdateBody,
  workspaceController.updateInventoryStock,
);
workspaceRouter.get(
  "/content",
  authenticate,
  authorize("read", "ContentDashboard"),
  workspaceController.getContentDashboard,
);
workspaceRouter.get(
  "/orders",
  authenticate,
  authorize("read", "Order"),
  orderController.getOrdersForStaff,
);
workspaceRouter.patch(
  "/orders/:id/status",
  authenticate,
  authorize("update", "Order"),
  validateId,
  validateStatusBody,
  orderController.updateOrderStatusForStaff,
);
workspaceRouter.get(
  "/finance",
  authenticate,
  authorize("read", "Report"),
  reportController.getSummary,
);

export default workspaceRouter;
