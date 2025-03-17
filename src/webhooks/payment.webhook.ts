import { Request, Response } from "express";
import PaymentService from "../services/payment.service";

export default class PaymentWebhook {
  constructor(private readonly paymentService: PaymentService) {}

  webhook = async (req: Request, res: Response) => {
    if (process.env.STRIPE_PRIVATE_KEY) {
      const signature = req.headers["stripe-signature"];
      try {
        const event = this.paymentService.stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_PRIVATE_KEY
        );

        console.info(event.type);
        switch (event.type) {
          case "charge.succeeded":
          case "payment_method.attached":
          case "customer.updated":
          case "checkout.session.completed":
          case "payment_intent.succeeded":
          case "invoice.created":
          case "invoice.finalized":
          case "invoice.paid":
          case "invoice.updated":
          case "invoice.payment_succeeded":
          case "customer.subscription.created":
          case "payment_intent.created":
          case "billing_portal.session.created":
          case "billing_portal.configuration.created":
          case "invoiceitem.created":
            console.info("nothing happening", event.type);
            break;
          case "subscription_schedule.created":
            console.info("handled", event.type);
            break;
          case "customer.created":
            console.info("handled", event.type);
            break;
          case "customer.subscription.updated":
            console.info("handled", event.type);
            break;
          case "customer.subscription.deleted":
            console.info("handled", event.type);
            break;
          default:
            console.error(`Unhandled event type ${event.type}.`);
            res.status(400).send();
            return;
        }
        res.status(204).send();
        return;
      } catch (err: any) {
        console.error(`⚠️ Stripe Webhook failed`);
        console.error("error", err);
        res.status(400).send();
      }
    }
    res.status(400).send();
    return;
  };
}
