# DEPLOYMENT CHECKLIST - FormAI Production Parity Fix

## Step 1: Commit & Push

```bash
git add -A
git commit -m "Fix: production parity with local; correct default route; vercel static export"
git push origin main
```

## Step 2: Verify Local Build

```bash
cd FormAI_new
npm ci
npm run build:web
```

**Check**: `dist/` folder contains the new version (no questionnaire screen)

## Step 3: Test Local Export

```bash
npx expo export --platform web
```

**Check**: `dist/index.html` shows the correct UI

## Step 4: Vercel Settings Verification

### Project → Settings → Build & Output:
- [ ] **Root Directory**: empty (not `/` and not a subfolder)
- [ ] **Framework Preset**: Other
- [ ] **Build Command**: `npm ci && npm run build:web`
- [ ] **Output Directory**: `dist`

## Step 5: Environment Variables (Production)

Set these in Vercel Project → Environment Variables:

```bash
EXPO_PUBLIC_API_BASE=<prod backend URL>
EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY=<price_id>
EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL=<price_id>
EXPO_PUBLIC_WEB_ORIGIN=https://<your-domain>.vercel.app
EXPO_PUBLIC_SHOW_ONBOARDING=false
```

## Step 6: Redeploy with Clean Cache

1. [ ] **"Redeploy"** → Clear build cache
2. [ ] **Purge CDN** & hard refresh (Ctrl/Cmd+Shift+R)

## Step 7: Verification

1. [ ] **Open production domain**
2. [ ] **Check DevTools console** for `[BUILD] { sha, ts }`
3. [ ] **Confirm new screen is default**; questionnaire does not show

## Expected Results

After completion:
- ✅ Local development shows new UI
- ✅ Local export shows new UI  
- ✅ Vercel production shows new UI
- ✅ Console shows build info for verification
- ✅ No more questionnaire screen in production

## Troubleshooting

If issues persist:
1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Clear browser cache completely
4. Check if service worker is interfering

## Rollback

If needed:
1. Set `EXPO_PUBLIC_SHOW_ONBOARDING=true`
2. Or revert the commit: `git revert <commit-hash>`

