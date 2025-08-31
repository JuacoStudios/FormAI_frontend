// Environment variables and constants
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'https://formai-backend-dc3u.onrender.com';
export const ENV_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY || "";
export const ENV_ANNUAL = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL || process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL || "";
export const WEB_ORIGIN = process.env.NEXT_PUBLIC_WEB_ORIGIN || process.env.EXPO_PUBLIC_WEB_ORIGIN || (typeof window !== "undefined" ? window.location.origin : "");

// Helper function to build full URLs
function url(path: string) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

// API health check and startup assertion
export async function assertApiReachable() {
  console.debug('[Paywall] API_BASE =', API_BASE);
  try {
    const r = await fetch(url('/api/health'));
    if (!r.ok) throw new Error(`health ${r.status}`);
    const data = await r.json();
    console.debug('[Paywall] /api/health OK', data);
    return true;
  } catch (e) {
    console.error('[Paywall] API not reachable:', e);
    return false;
  }
}

// New simplified checkout function for Stripe
export async function createCheckoutSession(payload = {}) {
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
  return res.json() as Promise<{ id?: string; url?: string }>;
}



export async function getProducts() {
  try {
    const r = await fetch(url('/api/stripe/products'));
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
    
    return j;
  } catch (error) {
    console.error('[API] Stripe products fetch failed, using fallback env prices:', error);
    // Return fallback structure using ENV constants
    return {
      monthly: ENV_MONTHLY || null,
      annual: ENV_ANNUAL || null
    };
  }
}

export async function createCheckout(plan: 'monthly' | 'annual') {
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
  return res.json() as Promise<{ url?: string; id?: string }>;
}

// Legacy function for Lemon Squeezy (keeping for backward compatibility)
export async function createLemonSqueezyCheckout(payload: {
  priceId: string;
  customerEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  console.debug('[LemonSqueezy] createCheckout request:', payload);
  
  try {
    const r = await fetch(url('/api/create-checkout'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: payload.priceId,
        customerEmail: payload.customerEmail,
        redirectUrl: payload.successUrl
      })
    });
    
    console.debug('[LemonSqueezy] createCheckout response status:', r.status);
    
    if (!r.ok) {
      const errorBody = await r.text();
      console.error('[LemonSqueezy] createCheckout error response:', errorBody);
      throw new Error(`HTTP ${r.status}: ${errorBody}`);
    }
    
    const j = await r.json();
    console.debug('[LemonSqueezy] createCheckout success response:', j);
    
    if (!j?.checkoutUrl) {
      throw new Error("No checkout URL returned from backend");
    }
    
    return { url: j.checkoutUrl };
  } catch (err: any) {
    console.error('[LemonSqueezy] createCheckout error:', err);
    throw new Error(err.message || "Failed to create checkout session");
  }
}

export async function getSubscriptionStatus(userId: string): Promise<{ 
  active: boolean; 
  plan?: "monthly"|"annual"; 
  currentPeriodEnd?: number 
}> {
  const r = await fetch(url(`/api/subscription/status?userId=${encodeURIComponent(userId)}`));
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return await r.json();
}

// STRIPE: Get Stripe price configuration status
export async function getStripePrices() {
  const r = await fetch(url('/api/stripe/prices'));
  if (!r.ok) throw new Error("Failed to fetch Stripe prices");
  return await r.json();
}
