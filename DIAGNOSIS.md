# 🔍 STRIPE BUTTON DIAGNOSIS REPORT

## 📋 Objetivo
Diagnosticar por qué los botones de Stripe en el Paywall no funcionan correctamente.

## 🛠️ Instrumentación Implementada

### 1. API Client (src/lib/api.ts)
- ✅ **Logging detallado** en `getProducts()` y `createCheckout()`
- ✅ **Detección de respuestas HTML** para identificar errores de backend
- ✅ **Fallback logging** para precios de variables de entorno
- ✅ **Validación de respuestas** con logging de estado

### 2. PaywallScreen (components/PaywallScreen.tsx)
- ✅ **Logging de inicialización** con API_BASE, ENV variables y WEB_ORIGIN
- ✅ **Tracking de carga de productos** (API vs fallback)
- ✅ **Logging de clicks** en botones con priceId, userId y email
- ✅ **Estado de botones** con razones de deshabilitación
- ✅ **Trazado completo** del flujo de checkout

## 🔍 Cómo Usar la Instrumentación

### 1. Abrir DevTools en el navegador
### 2. Navegar al Paywall
### 3. Observar logs en consola:

```
[Paywall] Initializing API...
[Paywall] API_BASE: https://formai-backend-dc3u.onrender.com/api
[Paywall] ENV_MONTHLY: present/missing
[Paywall] ENV_ANNUAL: present/missing
[Paywall] WEB_ORIGIN: https://your-vercel-domain.vercel.app
[Paywall] API reachable: true/false
[Paywall] Preloading Stripe prices...
[API] Fetching products from: https://formai-backend-dc3u.onrender.com/api/api/stripe/products
[API] Products loaded: { usingApi: true/false, monthly: {...}, annual: {...} }
```

### 4. Hacer click en botón Stripe y observar:

```
[Stripe] CLICK monthly/annual button pressed
[Stripe] Plan: monthly, userId: uuid, email: user@example.com
[Stripe] Using priceId for monthly: price_xxx
[Stripe] Proceeding with checkout for monthly: { priceId, userId, userEmail }
[Stripe] createCheckout payload: {...}
[Stripe] Calling createCheckout...
[Stripe] checkout response received: { url: "..." }
[Stripe] Checkout URL received: https://checkout.stripe.com/...
[Stripe] Opening WebBrowser with URL: https://checkout.stripe.com/...
```

## 🚨 Posibles Problemas Identificables

### 1. **Botones Deshabilitados**
```
[Paywall] Buttons disabled: no price IDs available
[Paywall] Missing monthly price ID
[Paywall] Missing annual price ID
```

### 2. **API No Alcanzable**
```
[Paywall] API not reachable: Error: health 404
[API] Stripe products endpoint failed: 404 Not Found
```

### 3. **Respuestas HTML en lugar de JSON**
```
[API] Received HTML instead of JSON: <!DOCTYPE html>...
[API] Expected JSON but got HTML (404)
```

### 4. **Variables de Entorno Faltantes**
```
[Paywall] ENV_MONTHLY present: false
[Paywall] ENV_ANNUAL present: false
```

## 🔧 Variables de Entorno Requeridas

### Vercel (Frontend)
```
EXPO_PUBLIC_API_BASE=https://formai-backend-dc3u.onrender.com/api
EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_xxx
EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_xxx
EXPO_PUBLIC_WEB_ORIGIN=https://your-vercel-domain.vercel.app
```

### Render (Backend)
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_ANNUAL=price_xxx
```

## 📊 Endpoints a Verificar

### 1. **Health Check**
- `GET /api/health` - Debe retornar `{ "ok": true }`

### 2. **Products**
- `GET /api/stripe/products` - Debe retornar:
```json
{
  "monthly": { "id": "price_xxx" },
  "annual": { "id": "price_xxx" }
}
```

### 3. **Checkout**
- `POST /api/create-checkout-session` - Debe retornar:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### 4. **Subscription Status**
- `GET /api/subscription/status?userId=uuid` - Debe retornar:
```json
{
  "active": false,
  "plan": null
}
```

## 🎯 Próximos Pasos

1. **Desplegar** la versión instrumentada en Vercel
2. **Abrir DevTools** y navegar al Paywall
3. **Revisar logs** para identificar el problema específico
4. **Verificar variables de entorno** en Vercel y Render
5. **Probar endpoints** del backend directamente

## 📝 Notas de Implementación

- **No hay cambios de UX** - Solo logging agregado
- **Hooks order estable** - No hay hooks condicionales
- **Fallbacks implementados** - Usa variables de entorno si API falla
- **SSR-safe** - Todas las APIs están protegidas con `typeof window !== "undefined"`

---

**Estado:** ✅ Instrumentación completa implementada y desplegada
**Próximo:** 🔍 Usar logs para identificar el problema específico
