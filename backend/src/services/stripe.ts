import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const FRONTEND_URL = process.env.FRONTEND_URL!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function createCheckoutSession(
  userId: string,
  amountCents: number,
  tier: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `OpenClaw Credits - ${tier}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${FRONTEND_URL}/dashboard?payment=success`,
    cancel_url: `${FRONTEND_URL}/billing?payment=cancelled`,
    metadata: {
      userId,
      tier,
    },
  });

  return session.url!;
}

export function constructWebhookEvent(body: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
}
