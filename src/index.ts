import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import PaymentService from "./services/payment.service";
import PaymentWebhook from "./webhooks/payment.webhook";

dotenv.config({ path: __dirname + "/../../.env" });

const app: Express = express();
app.use(express.json());

const paymentService = new PaymentService();

const paymentWebhook = new PaymentWebhook(paymentService);

app.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook.webhook
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).send();
});

const port = process.env.APP_PAYMENT_PORT || 2000;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
