import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('Lemon Squeezy Error:', error),
});

const FRONTEND_URL = process.env.FRONTEND_URL!;
const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

// Credit tier to variant ID mapping (set these in env vars after creating LemonSqueezy products)
const VARIANT_IDS: Record<string, string> = {
  starter: process.env.LEMONSQUEEZY_VARIANT_STARTER || '',
  builder: process.env.LEMONSQUEEZY_VARIANT_BUILDER || '',
  pro: process.env.LEMONSQUEEZY_VARIANT_PRO || '',
};

export async function createCheckoutSession(
  userId: string,
  amountCents: number,
  tier: string
): Promise<string> {
  // Lemon Squeezy uses checkout URLs with variant IDs
  const variantId = VARIANT_IDS[tier.toLowerCase()];
  
  if (!variantId) {
    throw new Error(`No variant ID configured for tier: ${tier}`);
  }

  // Build checkout URL with custom data
  const checkoutUrl = new URL(`https://${STORE_ID}.lemonsqueezy.com/checkout/buy/${variantId}`);
  
  // Add custom data via query params
  checkoutUrl.searchParams.set('checkout[custom][user_id]', userId);
  checkoutUrl.searchParams.set('checkout[custom][tier]', tier);
  
  // Set success/cancel URLs
  checkoutUrl.searchParams.set('checkout[success_url]', `${FRONTEND_URL}/dashboard?payment=success`);
  checkoutUrl.searchParams.set('checkout[cancel_url]', `${FRONTEND_URL}/billing?payment=cancelled`);
  
  // Prefill email if available (optional)
  // checkoutUrl.searchParams.set('checkout[email]', userEmail);

  return checkoutUrl.toString();
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  // Lemon Squeezy uses HMAC SHA-256 for webhook verification
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export function parseWebhookEvent(body: any): {
  type: string;
  userId: string;
  tier: string;
  amountCents: number;
  orderId: string;
} | null {
  const eventType = body.meta?.event_name;
  
  // We're interested in 'order_created' events
  if (eventType !== 'order_created') {
    return null;
  }

  const attributes = body.data?.attributes;
  const customData = attributes?.custom_data || attributes?.meta?.custom_data;
  
  return {
    type: eventType,
    userId: customData?.user_id,
    tier: customData?.tier,
    amountCents: Math.round(attributes?.total * 100), // Lemon Squeezy sends dollars
    orderId: body.data?.id,
  };
}
