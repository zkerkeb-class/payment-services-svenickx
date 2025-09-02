import PaymentService from "../services/payment.service";

export default class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  createSession = async (req: any, res: any) => {
    const { userId } = req.body;
    const session = await this.paymentService.createSession(userId);
    res.status(200).json({
      url: session.url,
    });
  };

  getBillingPortal = async (req: any, res: any) => {
    const { customerId } = req.params;
    const session = await this.paymentService.getBillingPortal(customerId);
    res.status(200).json({
      url: session.url,
    });
  };
}
