# DIAGNOSTIC REPORT - FormAI Production Parity Issue

## Root Cause(s) Found

1. **Onboarding Logic Always Active**: The `app/_layout.tsx` was always checking onboarding status and redirecting users to `/onboarding` if not completed, even in production.

2. **Missing Build Info**: No way to verify if the deployed version matches the local build.

3. **Vercel Config Mismatch**: The `vercel.json` was missing required fields like `version` and `rewrites`.

## Files Changed (with reasons)

### 1. `vercel.json` (root)
- **Added**: `version: 2`, `rewrites` array
- **Reason**: Required for proper Vercel static export configuration

### 2. `src/lib/buildInfo.ts` (new file)
- **Added**: Build identification with git SHA and timestamp
- **Reason**: To verify live parity between local and production builds

### 3. `app/_layout.tsx`
- **Added**: `EXPO_PUBLIC_SHOW_ONBOARDING` environment variable check
- **Added**: Build info logging on app boot
- **Modified**: Onboarding logic to be disabled by default in production
- **Reason**: Prevent onboarding from showing in production builds

## Exact Commands to Run

```bash
# 1. Commit & push
git add -A
git commit -m "Fix: production parity with local; correct default route; vercel static export"
git push origin main

# 2. Verify local build works
cd FormAI_new
npm ci
npm run build:web
# Check that dist/ contains the new version (no questionnaire)

# 3. Test local export
npx expo export --platform web
# Verify dist/index.html shows the correct UI
```

## Vercel Settings (verify)

### Project → Settings → Build & Output:
- **Root Directory**: empty (not `/` and not a subfolder)
- **Framework Preset**: Other
- **Build Command**: `npm ci && npm run build:web`
- **Output Directory**: `dist`

### Vercel Environment Variables (Production):
```bash
EXPO_PUBLIC_API_BASE=<prod backend URL>
EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY=<price_id>
EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL=<price_id>
EXPO_PUBLIC_WEB_ORIGIN=https://<your-domain>.vercel.app
EXPO_PUBLIC_SHOW_ONBOARDING=false
```

## Redeploy with Clean Cache

1. **"Redeploy"** → Clear build cache
2. **Purge CDN** & hard refresh (Ctrl/Cmd+Shift+R)

## Verify

1. **Open production domain**
2. **Check DevTools console** for `[BUILD] { sha, ts }`
3. **Confirm new screen is default**; questionnaire does not show

## Rollback Note

If you need to revert to previous behavior:

1. **Set environment variable**: `EXPO_PUBLIC_SHOW_ONBOARDING=true`
2. **Or revert the commit**: `git revert <commit-hash>`

## Expected Result

After these changes:
- ✅ Local `npx expo start` shows new UI
- ✅ Local `npx expo export --platform web` shows new UI  
- ✅ Vercel production shows new UI
- ✅ Console shows `[BUILD]` info for verification
- ✅ No more questionnaire screen in production


