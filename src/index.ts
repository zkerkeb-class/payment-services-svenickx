import dotenv from "dotenv";
import express, { Express } from "express";
import PaymentController from "./controllers/payment.controller";
import PaymentRouter from "./routes/payment.routes";
import PaymentService from "./services/payment.service";
import PaymentWebhook from "./webhooks/payment.webhook";

dotenv.config({ path: __dirname + "/../../.env" });

const app: Express = express();

const paymentService = new PaymentService();
const paymentWebhook = new PaymentWebhook(paymentService);

app.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook.webhook
);

app.use(express.json());

const paymentController = new PaymentController(paymentService);
const paymentRouter = new PaymentRouter(paymentController);

app.use("/payment", paymentRouter.router);

const port = process.env.PAYMENT_SERVICE_PORT || 2000;
app.listen(port, () => {
  console.log(`[server]: Payment is running at http://localhost:${port}`);
});
