export default class PaymentService {
  stripeSubscriptionId = "price_1R3bvgBc8tEVuOVCA8p5O6wC";
  stripe: any;

  constructor() {
    this.stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
  }
}
