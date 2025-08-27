// Environment variables and constants
export const API_BASE = 
  process.env.EXPO_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://formai-backend-dc3u.onrender.com";

export const ENV_MONTHLY = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY || "";
export const ENV_ANNUAL = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL || "";
export const WEB_ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN || (typeof window !== "undefined" ? window.location.origin : "");

// Defensive runtime guard
if (!API_BASE || API_BASE.includes("undefined")) {
  console.error("[API] Invalid API_BASE", { API_BASE, env: process.env.EXPO_PUBLIC_API_BASE });
  throw new Error("API_BASE is invalid or undefined");
}

// Safe URL builder to avoid undefined/ prefixes
function u(path: string) {
  if (!API_BASE || API_BASE.includes("undefined")) {
    throw new Error(`Invalid API_BASE: ${API_BASE}`);
  }
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

// API health check and startup assertion
export async function assertApiReachable() {
  console.debug('[Paywall] API_BASE =', API_BASE);
  try {
    const healthUrl = u('/api/health');
    console.debug('[API] Health check URL:', healthUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const r = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!r.ok) throw new Error(`health ${r.status}`);
    const data = await r.json();
    console.debug('[Paywall] /api/health OK', data);
    return true;
  } catch (e: any) {
    console.error('[Paywall] API not reachable:', e);
    if (e.name === 'AbortError') {
      console.error('[API] Health check timeout after 2s');
    }
    return false;
  }
}

export async function getProducts() {
  try {
    const productsUrl = u('/api/stripe/products');
    console.debug('[API] Fetching products from:', productsUrl);
    
    const r = await fetch(productsUrl);
    if (!r.ok) {
      console.warn('[API] Stripe products endpoint failed:', r.status, r.statusText);
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    const j = await r.json();
    
    // Check for MISSING_PRICE_IDS error
    if (j.error === "MISSING_PRICE_IDS") {
      console.warn('[API] Stripe products endpoint returned MISSING_PRICE_IDS, using env fallback');
      throw new Error("MISSING_PRICE_IDS");
    }
    
    console.debug('[API] Products loaded successfully:', j);
    return j;
  } catch (error) {
    console.error('[API] Stripe products fetch failed, using fallback env prices:', error);
    // Return fallback structure using ENV constants
    const fallback = {
      monthly: ENV_MONTHLY || null,
      annual: ENV_ANNUAL || null
    };
    console.debug('[API] Using fallback prices:', fallback);
    return fallback;
  }
}

export async function createCheckout(payload: {
  priceId: string;
  customerEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  const requestUrl = u('/api/create-checkout-session');
  console.debug('[Stripe] createCheckout request:', { url: requestUrl, payload });
  
  try {
    const r = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: payload.priceId,
        customerEmail: payload.customerEmail,
        userId: payload.userId,
        successUrl: payload.successUrl,
        cancelUrl: payload.cancelUrl
      })
    });
    
    console.debug('[Stripe] createCheckout response status:', r.status);
    
    if (!r.ok) {
      const errorBody = await r.text();
      console.error('[Stripe] createCheckout error response:', errorBody);
      throw new Error(`[createCheckout] ${r.status} ${errorBody}`);
    }
    
    const j = await r.json();
    console.debug('[Stripe] createCheckout success response:', j);
    
    if (!j?.url) {
      throw new Error("No checkout URL returned from backend");
    }
    
    return { url: j.url };
  } catch (err: any) {
    console.error('[Stripe] createCheckout error:', err);
    throw new Error(err.message || "Failed to create checkout session");
  }
}

export async function getSubscriptionStatus(userId: string): Promise<{ 
  active: boolean; 
  plan?: "monthly"|"annual"; 
  currentPeriodEnd?: number 
}> {
  const statusUrl = u(`/api/subscription/status?userId=${encodeURIComponent(userId)}`);
  console.debug('[API] Checking subscription status:', statusUrl);
  
  const r = await fetch(statusUrl);
  if (!r.ok) {
    console.error('[API] Subscription status failed:', r.status, r.statusText);
    throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  }
  
  const data = await r.json();
  console.debug('[API] Subscription status response:', data);
  return data;
}

// STRIPE: Get Stripe price configuration status
export async function getStripePrices() {
  const pricesUrl = u('/api/stripe/prices');
  console.debug('[API] Fetching Stripe prices from:', pricesUrl);
  
  const r = await fetch(pricesUrl);
  if (!r.ok) {
    console.error('[API] Failed to fetch Stripe prices:', r.status, r.statusText);
    throw new Error("Failed to fetch Stripe prices");
  }
  
  const data = await r.json();
  console.debug('[API] Stripe prices response:', data);
  return data;
}
