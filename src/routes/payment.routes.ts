import { Router } from "express";

export default class PaymentRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.createRoutes();
  }

  private createRoutes() {}
}
