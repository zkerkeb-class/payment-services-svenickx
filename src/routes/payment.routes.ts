import { Router } from "express";
import PaymentController from "../controllers/payment.controller";

export default class PaymentRouter {
  router: Router;

  constructor(private readonly paymentController: PaymentController) {
    this.router = Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.post("/", this.paymentController.createSession);
    this.router.get(
      "/:customerId/billingPortal",
      this.paymentController.getBillingPortal
    );
  }
}
