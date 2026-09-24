import { Router } from "express";
import * as reportController from "../controllers/reports";
import { authenticate } from "../middlewares/authenticate";
import { requireAdmin } from "../middlewares/requireAdmin";

const reportRouter = Router();

// Analytics are admin-only.
reportRouter.use(authenticate, requireAdmin);

reportRouter.get("/summary", reportController.getSummary);

export default reportRouter;
