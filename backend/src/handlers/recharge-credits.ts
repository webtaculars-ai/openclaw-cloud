import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as stripe from '../services/stripe';
import { RECHARGE_TIERS } from '../types';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return response(401, { error: 'Unauthorized' });
    }

    // Parse body
    const body = JSON.parse(event.body || '{}');
    const { tier } = body;

    // Validate tier
    if (!tier || !(tier in RECHARGE_TIERS)) {
      return response(400, { 
        error: 'Invalid tier. Must be one of: starter, builder, pro' 
      });
    }

    const tierConfig = RECHARGE_TIERS[tier as keyof typeof RECHARGE_TIERS];

    // Create Stripe Checkout session
    const url = await stripe.createCheckoutSession(
      userId,
      tierConfig.amountCents,
      tier
    );

    return response(200, { url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
