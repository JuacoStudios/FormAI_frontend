# Stripe Checkout Setup Guide

## Frontend Configuration (Vercel)

### Required Environment Variables

Set these in your Vercel project settings:

```bash
NEXT_PUBLIC_API_BASE_URL=https://formai-backend-dc3u.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...

# Payment Links (Recommended)
NEXT_PUBLIC_USE_PAYMENT_LINKS=true
NEXT_PUBLIC_STRIPE_LINK_MONTHLY=https://buy.stripe.com/...monthly
NEXT_PUBLIC_STRIPE_LINK_ANNUAL=https://buy.stripe.com/...annual
NEXT_PUBLIC_WEB_URL=https://form-ai-websitee.vercel.app
```

### What NOT to set in Frontend

- ❌ `EXPO_PUBLIC_*` variables (deprecated)
- ❌ `STRIPE_*_PRICE_ID` variables (backend only)
- ❌ `STRIPE_SECRET_KEY` (backend only)

## Backend Configuration (Render)

### Required Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_... # or sk_test_...
STRIPE_MONTHLY_PRICE_ID=price_monthly_xxx
STRIPE_ANNUAL_PRICE_ID=price_annual_xxx
WEB_URL=https://form-ai-websitee.vercel.app
ALLOWED_ORIGINS=https://form-ai-websitee.vercel.app
```

## Testing

### 1. Health Check
```bash
curl -i https://formai-backend-dc3u.onrender.com/api/health
```

### 2. Checkout Endpoint
```bash
curl -i -X POST https://formai-backend-dc3u.onrender.com/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"monthly"}'
```

### 3. Subscription Status
```bash
curl -i "https://formai-backend-dc3u.onrender.com/api/subscription/status?userId=test-user"
```

## How It Works

### Payment Links (Recommended)
1. **Frontend** calls `goToPayment(plan)` with `'monthly'|'annual'`
2. **User** is redirected directly to Stripe Payment Link
3. **User** completes payment on Stripe hosted checkout page
4. **Stripe** redirects back to `/success?plan=monthly|annual`

### Legacy Checkout (Fallback)
1. **Frontend** calls `POST /api/checkout` with `{ plan: 'monthly'|'annual' }`
2. **Backend** selects correct Stripe price ID and creates checkout session
3. **Frontend** receives `{ id, url }` and navigates directly with `window.location.assign(url)`
4. **User** completes payment on Stripe hosted checkout page
5. **Stripe** redirects back to success/cancel URLs

## Testing

### 1. Health Check
```bash
curl -i https://formai-backend-dc3u.onrender.com/api/health
```

### 2. Payment Links (Frontend)
1. Open pricing page on mobile/desktop
2. Click "Subscribe Monthly" or "Subscribe Annual"
3. Should redirect immediately to Stripe Payment Link
4. Complete test payment → redirects to `/success?plan=monthly|annual`

### 3. Legacy Checkout (Backend)
```bash
curl -i -X POST https://formai-backend-dc3u.onrender.com/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"monthly"}'
```

## Troubleshooting

- **404 errors**: Check `NEXT_PUBLIC_API_BASE_URL` in Vercel
- **CORS errors**: Verify `ALLOWED_ORIGINS` in Render backend
- **Price ID errors**: Ensure Stripe keys and price IDs are in same mode (test/live)
- **Payment Links not working**: Verify `NEXT_PUBLIC_USE_PAYMENT_LINKS=true` and link URLs
