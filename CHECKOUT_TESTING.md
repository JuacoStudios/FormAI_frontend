# Stripe Checkout Testing Guide

## Prerequisites

1. **Backend (Render)**: Ensure environment variables are set
2. **Frontend (Vercel)**: Ensure environment variables are set
3. **Stripe Dashboard**: PayPal must be enabled for your account

## Environment Variables

### Backend (Render)
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...
WEB_URL=https://form-ai-websitee.vercel.app
ALLOWED_ORIGINS=https://form-ai-websitee.vercel.app
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_BASE_URL=https://formai-backend-dc3u.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
WEB_URL=https://form-ai-websitee.vercel.app
```

## Testing Steps

### 1. Backend Smoke Test

Test the checkout endpoint directly:

```bash
curl -i -X POST https://formai-backend-dc3u.onrender.com/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan": "monthly"}'
```

**Expected Response:**
```json
{
  "id": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### 2. Frontend Manual Test

1. Open Vercel preview on mobile device
2. Navigate to pricing/paywall screen
3. Tap the pay button
4. Verify network shows `POST /api/checkout` (200)
5. Browser should navigate to Stripe Checkout
6. Complete test payment → redirect to success page

### 3. PayPal Verification

1. In Stripe Dashboard, ensure PayPal is enabled
2. During checkout, PayPal should appear as payment option
3. Test PayPal flow end-to-end

## Troubleshooting

### Common Issues

1. **CORS Error**: Check `ALLOWED_ORIGINS` in backend
2. **No Checkout URL**: Verify Stripe price IDs are correct
3. **PayPal Not Showing**: Enable PayPal in Stripe Dashboard
4. **Mobile Redirect Fails**: Ensure `window.location.assign()` is used

### Debug Logs

Backend logs will show:
- CORS origins allowed
- Checkout session creation
- Stripe API responses

Frontend logs will show:
- API calls to backend
- Checkout session responses
- Navigation attempts

## Notes

- PayPal availability is controlled in Stripe Dashboard
- No popup blockers - direct navigation preserves user gesture
- Mobile-friendly with responsive design
- Minimal console logging in production


