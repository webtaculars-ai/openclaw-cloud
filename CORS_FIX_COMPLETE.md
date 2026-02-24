# CORS Fix Applied

## Issue
```
Access-Control-Allow-Origin header has value 'https://openpaw.co' 
that is not equal to supplied origin 'https://www.openpaw.co'
```

## Root Cause
Lambda functions were returning specific domain in CORS header instead of wildcard.

## Fix Applied

Updated all Lambda response headers from:
```typescript
headers: { 'Content-Type': 'application/json' }
```

To:
```typescript
headers: { 
  'Content-Type': 'application/json', 
  'Access-Control-Allow-Origin': '*' 
}
```

## Lambdas Updated

✅ All API Lambdas redeployed with wildcard CORS:
- openpaw-get-credits
- openpaw-get-agent
- openpaw-list-agents
- openpaw-provision-agent
- openpaw-start-agent
- openpaw-stop-agent
- openpaw-redeem-promo

## Testing

Your website at **https://www.openpaw.co** should now work without CORS errors.

Try refreshing and redeeming a promo code:
- Go to billing page
- Enter: `LAUNCH2026-997390A7`
- Should work without errors!

## Technical Details

**Before:**
```javascript
'Access-Control-Allow-Origin': 'https://openpaw.co'  // ❌ Only exact match
```

**After:**
```javascript
'Access-Control-Allow-Origin': '*'  // ✅ Allows all origins
```

This allows:
- https://openpaw.co ✅
- https://www.openpaw.co ✅  
- http://localhost:3000 ✅ (for dev)
- Any other origin ✅

## Security Note

For production, you might want to restrict to specific domains later:
```javascript
const allowedOrigins = ['https://openpaw.co', 'https://www.openpaw.co'];
const origin = event.headers.origin;
'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
```

But for now, wildcard `*` is fine and simpler.

