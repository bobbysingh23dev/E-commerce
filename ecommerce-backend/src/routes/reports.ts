import { Router } from "express";
import * as reportController from "../controllers/reports";
import { authenticate } from "../middlewares/authenticate";
import { requireRoles } from "../middlewares/requireRoles";

const reportRouter = Router();

// Finance staff and admins can review company analytics.
reportRouter.use(authenticate, requireRoles("finance"));

reportRouter.get("/summary", reportController.getSummary);

export default reportRouter;
