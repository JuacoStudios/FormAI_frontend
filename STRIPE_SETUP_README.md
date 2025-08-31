# Stripe Checkout Setup Guide

## Frontend Configuration (Vercel)

### Required Environment Variables

Set these in your Vercel project settings:

```bash
NEXT_PUBLIC_API_BASE_URL=https://formai-backend-dc3u.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
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

1. **Frontend** calls `POST /api/checkout` with `{ plan: 'monthly'|'annual' }`
2. **Backend** selects correct Stripe price ID and creates checkout session
3. **Frontend** receives `{ id, url }` and navigates directly with `window.location.assign(url)`
4. **User** completes payment on Stripe hosted checkout page
5. **Stripe** redirects back to success/cancel URLs

## Troubleshooting

- **404 errors**: Check `NEXT_PUBLIC_API_BASE_URL` in Vercel
- **CORS errors**: Verify `ALLOWED_ORIGINS` in Render backend
- **Price ID errors**: Ensure Stripe keys and price IDs are in same mode (test/live)
