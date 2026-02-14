import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ulid } from 'ulid';
import * as stripe from '../services/stripe';
import * as dynamo from '../services/dynamo';
import { SIGNUP_BONUS_CENTS, RECHARGE_TIERS } from '../types';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Extract Stripe signature (case-insensitive header)
    const signature = event.headers['Stripe-Signature'] || event.headers['stripe-signature'];
    
    if (!signature) {
      return response(400, { error: 'Missing Stripe signature' });
    }

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.constructWebhookEvent(event.body!, signature);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error);
      return response(400, { error: 'Invalid signature' });
    }

    // Handle checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as any;
      const userId = session.metadata.userId;
      const tier = session.metadata.tier;

      if (!userId || !tier) {
        console.error('Missing metadata in Stripe session:', session);
        return response(400, { error: 'Missing metadata' });
      }

      // Check if first purchase
      const existingCredits = await dynamo.getCredits(userId);
      const isFirstPurchase = !existingCredits || existingCredits.balanceCents === 0;

      let creditsToAdd: number;
      let transactionType: 'signup_bonus' | 'recharge';
      let description: string;

      if (isFirstPurchase && tier === 'starter') {
        // First purchase with starter tier = 2x bonus
        creditsToAdd = SIGNUP_BONUS_CENTS; // $10
        transactionType = 'signup_bonus';
        description = 'Welcome bonus: $5 payment → $10 credits (2x match)';
      } else {
        // Regular recharge
        const tierConfig = RECHARGE_TIERS[tier as keyof typeof RECHARGE_TIERS];
        creditsToAdd = tierConfig.creditsCents;
        transactionType = 'recharge';
        description = `${tier} tier recharge`;
      }

      // Initialize credits if first time
      if (!existingCredits) {
        await dynamo.initializeCredits(userId, 0);
      }

      // Add credits
      await dynamo.addCredits(userId, creditsToAdd);

      // Record transaction
      await dynamo.createTransaction({
        userId,
        txnId: ulid(),
        type: transactionType,
        amountCents: creditsToAdd,
        description,
        stripePaymentId: session.payment_intent,
        createdAt: new Date().toISOString(),
      });

      // Ensure user record exists
      const user = await dynamo.getUser(userId);
      if (!user) {
        await dynamo.createUser({
          userId,
          email: session.customer_email || 'unknown',
          signupDate: new Date().toISOString(),
        });
      }
    }

    return response(200, { received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
