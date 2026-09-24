import { Router } from "express";
import * as paymentController from "../controllers/payment";
import { authenticate } from "../middlewares/authenticate";
import { validateId } from "../middlewares/validateId";

const paymentRouter = Router();

paymentRouter.use(authenticate);
paymentRouter.post("/:id/intent", validateId, paymentController.createIntent);
paymentRouter.post(
  "/:id/confirm",
  validateId,
  paymentController.confirmPayment,
);

export default paymentRouter;
