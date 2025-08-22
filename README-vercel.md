# 🚀 Vercel Deployment Guide for FormAI

## 📋 Vercel Project Settings

### **Required Configuration:**
- **Root Directory**: `./` (repository root)
- **Build Command**: `npx expo export --platform web`
- **Output Directory**: `web-build`
- **Framework Preset**: `Other`

## 🔧 Environment Variables

### **Frontend Environment Variables to Set in Vercel:**

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://formai-backend-dc3u.onrender.com/api

# Web Features
EXPO_PUBLIC_WEB_ENABLED=true
EXPO_PUBLIC_PWA_ENABLED=true

# Stripe Configuration (when implemented)
EXPO_PUBLIC_STRIPE_PRICE_ID=price_xxx (monthly subscription)
EXPO_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_yyy (yearly subscription, optional)
```

### **Important Notes:**
- ✅ **API URLs must start with `http://` or `https://`**
- ✅ **Stripe IDs must start with `price_` (not `prod_`)**
- ❌ **Remove any `vercel_api_base_url` or truncated keys**
- ❌ **Do NOT use `@vercel_*` references in vercel.json**

## 🚨 Post-Deployment Steps

### **1. Add Vercel URL to Backend CORS:**
After successful deployment, add your Vercel URL to the backend CORS configuration:

```javascript
// In backend/server.js
app.use(cors({
  origin: [
    'https://your-app.vercel.app',  // Add your Vercel URL here
    'http://localhost:19006'        // Keep local development
  ]
}));
```

### **2. Redeploy Backend:**
After updating CORS, redeploy your backend to Render.

## 🔍 Verification Checklist

- [ ] Vercel deployment successful
- [ ] PWA manifest accessible at `/manifest.json`
- [ ] Service worker accessible at `/service-worker.js`
- [ ] SPA routing works (all routes fallback to index.html)
- [ ] API calls to backend working
- [ ] No console errors related to environment variables

## 🛠️ Troubleshooting

### **Common Issues:**
1. **Build fails**: Ensure `npx expo export --platform web` works locally
2. **Environment variables not found**: Check Vercel env vars are set correctly
3. **CORS errors**: Verify backend CORS includes Vercel URL
4. **Routing issues**: Confirm vercel.json only contains `rewrites` (no `routes`)

### **Local Testing:**
```bash
# Test build locally
npm run build:web

# Test web development
npm run start:web
```

## 📚 Resources

- [Expo Web Documentation](https://docs.expo.dev/guides/web/)
- [Vercel Documentation](https://vercel.com/docs)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
