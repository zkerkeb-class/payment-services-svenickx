export default class PaymentService {
  stripeSubscriptionId = "price_1R3bvgBc8tEVuOVCA8p5O6wC";
  stripe: any;

  constructor() {
    this.stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
  }

  createSession = async (userId: string) => {
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: this.stripeSubscriptionId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userId,
        },
      },
      success_url: `${process.env.FRONT_SERVICE_URL}`,
      cancel_url: `${process.env.FRONT_SERVICE_URL}`,
    });

    return session;
  };

  getBillingPortal = async (customerId: string) => {
    return await this.stripe?.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONT_SERVICE_URL}`,
    });
  };
}
