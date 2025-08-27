# 🔍 STRIPE BUTTON DIAGNOSIS REPORT

## 📋 Objetivo
Diagnosticar por qué los botones de Stripe en el Paywall no funcionan correctamente.

## 🚨 PROBLEMA IDENTIFICADO Y CORREGIDO

### **Error 405 "Method Not Allowed" en Producción**
- **Síntoma:** `POST https://form-ai-websit.../undefined/api/create-checkout-session 405`
- **Causa:** `API_BASE` era `undefined` en producción, causando URLs como `/undefined/api/...`
- **Solución:** Implementado fallback a URL por defecto y validación defensiva

## 🛠️ Instrumentación Implementada

### 1. API Client (src/lib/api.ts)
- ✅ **Logging detallado** en `getProducts()` y `createCheckout()`
- ✅ **Detección de respuestas HTML** para identificar errores de backend
- ✅ **Fallback logging** para precios de variables de entorno
- ✅ **Validación de respuestas** con logging de estado
- ✅ **API_BASE fallback** a `https://formai-backend-dc3u.onrender.com`
- ✅ **Runtime guards** para validar API_BASE antes de usar

### 2. PaywallScreen (components/PaywallScreen.tsx)
- ✅ **Logging de inicialización** con API_BASE, ENV variables y WEB_ORIGIN
- ✅ **Tracking de carga de productos** (API vs fallback)
- ✅ **Logging de clicks** en botones con priceId, userId y email
- ✅ **Estado de botones** con razones de deshabilitación
- ✅ **Trazado completo** del flujo de checkout
- ✅ **Validación defensiva** de API_BASE antes de hacer llamadas

## 🔧 CORRECCIONES IMPLEMENTADAS

### 1. **API_BASE Fallback y Validación**
```typescript
export const API_BASE = 
  process.env.EXPO_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://formai-backend-dc3u.onrender.com";

// Defensive runtime guard
if (!API_BASE || API_BASE.includes("undefined")) {
  console.error("[API] Invalid API_BASE", { API_BASE, env: process.env.EXPO_PUBLIC_API_BASE });
  throw new Error("API_BASE is invalid or undefined");
}
```

### 2. **URLs Finales Loggeadas**
```typescript
// En createCheckout
const requestUrl = `${API_BASE}/api/create-checkout-session`;
console.debug('[Stripe] createCheckout request:', { url: requestUrl, payload });

// En PaywallScreen
console.debug('[Stripe] Final request URL will be:', `${API_BASE}/api/create-checkout-session`);
```

### 3. **Validación Defensiva en PaywallScreen**
```typescript
// Defensive check for API_BASE
if (!API_BASE || API_BASE.includes("undefined")) {
  console.error('[Paywall] Invalid API_BASE detected:', API_BASE);
  setCanSubscribe(false);
  return;
}

// Check API reachability
const apiReachable = await assertApiReachable();
if (!apiReachable) {
  console.warn('[Paywall] API not reachable, enabling fallback mode');
  setCanSubscribe(false);
  return;
}
```

### 4. **Health Check con Timeout**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 2000);

const r = await fetch(healthUrl, { signal: controller.signal });
clearTimeout(timeoutId);
```

## 🔍 Cómo Usar la Instrumentación

### 1. Abrir DevTools en el navegador
### 2. Navegar al Paywall
### 3. Observar logs en consola:

```
[Paywall] Initializing API...
[Paywall] API_BASE: https://formai-backend-dc3u.onrender.com
[Paywall] ENV_MONTHLY: present/missing
[Paywall] ENV_ANNUAL: present/missing
[Paywall] WEB_ORIGIN: https://your-vercel-domain.vercel.app
[API] Health check URL: https://formai-backend-dc3u.onrender.com/api/health
[Paywall] API reachable: true/false
[API] Fetching products from: https://formai-backend-dc3u.onrender.com/api/stripe/products
[API] Products loaded successfully: { monthly: {...}, annual: {...} }
```

### 4. Hacer click en botón Stripe y observar:

```
[Stripe] CLICK monthly/annual button pressed
[Stripe] Plan: monthly, userId: uuid, email: user@example.com
[Stripe] API_BASE: https://formai-backend-dc3u.onrender.com
[Stripe] Using priceId for monthly: price_xxx
[Stripe] Proceeding with checkout for monthly: {...}
[Stripe] createCheckout payload: {...}
[Stripe] Calling createCheckout...
[Stripe] Final request URL will be: https://formai-backend-dc3u.onrender.com/api/create-checkout-session
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
[Paywall] Invalid API_BASE detected: undefined
[Paywall] API not reachable, enabling fallback mode
```

### 2. **API No Alcanzable**
```
[Paywall] API not reachable: Error: health 404
[API] Health check timeout after 2s
[API] Stripe products endpoint failed: 404 Not Found
```

### 3. **Variables de Entorno Faltantes**
```
[Paywall] ENV_MONTHLY present: false
[Paywall] ENV_ANNUAL present: false
[API] Invalid API_BASE: undefined
```

## 🔧 Variables de Entorno Requeridas

### Vercel (Frontend) - **CRÍTICO**
```
EXPO_PUBLIC_API_BASE=https://formai-backend-dc3u.onrender.com
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
- `GET https://formai-backend-dc3u.onrender.com/api/health` - Debe retornar `{ "ok": true }`

### 2. **Products**
- `GET https://formai-backend-dc3u.onrender.com/api/stripe/products` - Debe retornar:
```json
{
  "monthly": { "id": "price_xxx" },
  "annual": { "id": "price_xxx" }
}
```

### 3. **Checkout**
- `POST https://formai-backend-dc3u.onrender.com/api/create-checkout-session` - Debe retornar:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### 4. **Subscription Status**
- `GET https://formai-backend-dc3u.onrender.com/api/subscription/status?userId=uuid` - Debe retornar:
```json
{
  "active": false,
  "plan": null
}
```

## 🎯 Próximos Pasos

1. **Configurar variables de entorno en Vercel** (CRÍTICO):
   - `EXPO_PUBLIC_API_BASE=https://formai-backend-dc3u.onrender.com`
   - `EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_xxx`
   - `EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_xxx`
   - `EXPO_PUBLIC_WEB_ORIGIN=https://your-vercel-domain.vercel.app`

2. **Redeploy** en Vercel
3. **Verificar en DevTools** que las URLs van al backend correcto
4. **Probar botones de Stripe** - ahora deberían funcionar

## 📝 Notas de Implementación

- **API_BASE fallback** implementado para evitar URLs `/undefined/api/...`
- **Validación defensiva** en runtime para detectar configuraciones inválidas
- **Logging mejorado** muestra URLs finales para debugging
- **Health check con timeout** para detectar problemas de conectividad
- **Botones deshabilitados** cuando API no está disponible
- **Todas las llamadas** van al backend de Render, no a Vercel

---

**Estado:** ✅ Problema 405 identificado y corregido
**Próximo:** 🔧 Configurar variables de entorno en Vercel y redeploy
