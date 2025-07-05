import { Request, Response } from "express";
import { fetchApi } from "../services/fetch.service";
import PaymentService from "../services/payment.service";

interface IEvent<T = any> {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: T;
  type: string;
  request: {
    id: string;
    idempotency_keys: string;
  };
  pending_webhooks: number;
  livemode: boolean;
}

interface ICustomerSubscriptionUpdatedData {
  object: {
    id: string;
    customer: string;
    metadata: IMetadata;
    status: EStatus;
    plan: { id: string };
    cancel_at: number;
    cancel_at_period_end: boolean;
    start_date: number;
    items: { data: { id: string }[] };
    quantity: number;
  };
}

interface IMetadata {
  userId: string;
}

enum EStatus {
  ACTIVE = "active",
  INCOMPLETE = "incomplete",
}

export default class PaymentWebhook {
  constructor(private readonly paymentService: PaymentService) {}

  webhook = async (req: Request, res: Response) => {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers["stripe-signature"];
      try {
        const event = this.paymentService.stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );

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
          case "payment_intent.created":
          case "billing_portal.session.created":
          case "billing_portal.configuration.created":
          case "invoiceitem.created":
          case "customer.created":
            console.info("nothing happening", event.type);
            break;
          case "customer.subscription.updated":
            this.createSubscription(event);
            break;
          case "customer.subscription.deleted":
            this.deleteSubscription(event);
            break;
          default:
            // console.error(`Unhandled event type ${event.type}.`);
            res.status(400).send();
            return;
        }
        res.status(204).send();
        return;
      } catch (err: any) {
        console.error(`⚠️ Stripe Webhook failed`);
        console.error("error", err);
        res.status(500).send();
      }
    }
    res.status(400).send();
    return;
  };

  private createSubscription = async (
    event: IEvent<ICustomerSubscriptionUpdatedData>
  ) => {
    const { object } = event.data;
    const { metadata, status } = object;

    if (status === EStatus.ACTIVE) {
      const userId = metadata.userId;
      const response = await fetchApi(
        `${process.env.DB_SERVICE_URL}subscription`,
        "post",
        {
          userId,
          subId: object.id,
          itemId: object.items.data.at(0)?.id,
          customerId: object.customer,
        }
      );
      if (!response.success) {
        console.error("Error creating subscription:", response.code);
        return;
      }
    }
  };

  private deleteSubscription = async (
    event: IEvent<ICustomerSubscriptionUpdatedData>
  ) => {
    const { object } = event.data;
    const { metadata } = object;

    const userId = metadata.userId;
    const response = await fetchApi(
      `${process.env.DB_SERVICE_URL}subscription`,
      "delete",
      {
        userId,
        subId: object.id,
      }
    );
    if (!response.success) {
      console.error("Error deleting subscription:", response.code);
      return;
    }
  };
}
