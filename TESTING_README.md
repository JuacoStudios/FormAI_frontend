# 🧪 Testing Guide - FormAI Web App

## Local Development Testing

### 1. Frontend Setup
```bash
cd FormAI_new
npm install
npm run dev
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your keys:
- `NEXT_PUBLIC_API_BASE_URL`: Your Render backend URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe test key
- `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`: Monthly subscription price ID

### 3. Test Capture Button
1. Open browser console
2. Navigate to scan screen
3. Click/tap the round capture button
4. Verify logs show: `[capture] button pressed`
5. Check that `isCapturing` toggles correctly

### 4. Test API Flow
1. Verify health check: `[health] ✅ API healthy`
2. Test analyze endpoint: `[api] Analyze success`
3. Check no HEAD requests to `/api/analyze`

### 5. Test Paywall Flow
1. Use 3 free scans
2. Verify paywall appears
3. Test checkout redirect to Stripe
4. Verify premium state after return

## Production Testing (Vercel)

### 1. Deploy Checklist
- [ ] All environment variables set in Vercel
- [ ] Build succeeds: `npm run build:web`
- [ ] No CSSStyleDeclaration errors in console
- [ ] Capture button responds to all input types

### 2. Performance Checks
- [ ] Preflight check < 2s
- [ ] Analyze request < 30s
- [ ] No blocking overlays
- [ ] Stable CLS (Cumulative Layout Shift)

### 3. Error Scenarios
- [ ] Network timeout (30s) shows user-friendly error
- [ ] 404 errors show clear diagnostic
- [ ] Paywall blocks scans when quota exceeded
- [ ] Premium users bypass all restrictions

## Mock Mode (No Stripe Keys)

If Stripe keys are missing, the app will:
1. Show "Premium" badge for testing
2. Allow unlimited scans
3. Log mock mode in console
4. Skip actual payment processing

## Troubleshooting

### Capture Button Not Working
1. Check `pointerEvents: 'auto'` on container
2. Verify `zIndex: 1000` above overlays
3. Check console for event logs
4. Ensure no parent containers block events

### API 404 Errors
1. Verify `NEXT_PUBLIC_API_BASE_URL` has no trailing slash
2. Check backend route `/api/analyze` exists
3. Confirm CORS allows POST from your domain
4. Test with `curl -X POST https://backend/api/analyze`

### Build Failures
1. Clear Vercel build cache
2. Check for Node.js specific imports
3. Verify all imports use web-safe paths
4. Run `npm run build:web` locally first

## API Endpoints Expected

### Backend Routes Required:
- `GET /api/health` - Health check
- `POST /api/analyze` - Image analysis
- `GET /api/me` - User profile
- `POST /api/create-checkout-session` - Stripe checkout
- `GET /api/subscription/status` - Subscription status

### CORS Configuration:
```javascript
app.use(cors({
  origin: ['https://your-vercel-domain.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
```

## Performance Metrics

### Target Response Times:
- Health check: < 500ms
- Preflight: < 2s
- Analyze: < 30s
- Profile: < 5s

### Error Rates:
- 4xx errors: < 5%
- 5xx errors: < 1%
- Timeouts: < 2%

## Security Checklist

- [ ] API keys not exposed in client code
- [ ] CORS properly configured
- [ ] Rate limiting on analyze endpoint
- [ ] Image size limits enforced
- [ ] User authentication required for premium features
