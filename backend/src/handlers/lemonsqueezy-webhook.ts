import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ulid } from 'ulid';
import * as lemonsqueezy from '../services/lemonsqueezy';
import * as dynamo from '../services/dynamo';
import { SIGNUP_BONUS_CENTS, RECHARGE_TIERS } from '../types';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Extract Lemon Squeezy signature
    const signature = event.headers['X-Signature'] || event.headers['x-signature'];
    
    if (!signature) {
      return response(400, { error: 'Missing webhook signature' });
    }

    // Verify webhook signature
    const isValid = lemonsqueezy.verifyWebhookSignature(event.body!, signature);
    
    if (!isValid) {
      console.error('Webhook signature verification failed');
      return response(400, { error: 'Invalid signature' });
    }

    // Parse webhook event
    const body = JSON.parse(event.body!);
    const webhookEvent = lemonsqueezy.parseWebhookEvent(body);

    if (!webhookEvent) {
      // Not an event we care about
      return response(200, { received: true });
    }

    const { userId, tier, amountCents, orderId } = webhookEvent;

    if (!userId || !tier) {
      console.error('Missing user data in webhook:', body);
      return response(400, { error: 'Missing user data' });
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
      stripePaymentId: orderId, // Lemon Squeezy order ID
      createdAt: new Date().toISOString(),
    });

    // Ensure user record exists
    const user = await dynamo.getUser(userId);
    if (!user) {
      const attributes = body.data?.attributes;
      await dynamo.createUser({
        userId,
        email: attributes?.user_email || 'unknown',
        signupDate: new Date().toISOString(),
      });
    }

    return response(200, { received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
