// Centralized API configuration with fallback warning
let warned = false;

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  (() => {
    const fb = 'https://formai-backend-dc3u.onrender.com';
    if (!warned && typeof window !== 'undefined') {
      console.warn('[config] Using fallback API_BASE:', fb,
        'Set NEXT_PUBLIC_API_BASE_URL in Vercel.');
      warned = true;
    }
    return fb;
  })();

export const WEB_ORIGIN = process.env.NEXT_PUBLIC_WEB_ORIGIN || (typeof window !== "undefined" ? window.location.origin : "");

// URL joiner to avoid double slashes
export function apiUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

// API health check and startup assertion
export async function assertApiReachable() {
  console.debug('[Paywall] API_BASE =', API_BASE);
  try {
    const r = await fetch(apiUrl('/api/health'));
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
    const r = await fetch(apiUrl('/api/stripe/products'));
    if (!r.ok) {
      console.warn('[API] Stripe products endpoint failed:', r.status, r.statusText);
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    const j = await r.json();
    
    // Check for MISSING_PRICE_IDS error
    if (j.error === "MISSING_PRICE_IDS") {
      console.warn('[API] Stripe products endpoint returned MISSING_PRICE_IDS');
      throw new Error("MISSING_PRICE_IDS");
    }
    
    return j;
  } catch (error) {
    console.error('[API] Stripe products fetch failed:', error);
    // Return empty structure - backend handles price selection
    return {
      monthly: null,
      annual: null
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
    const r = await fetch(apiUrl('/api/create-checkout'), {
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
  const r = await fetch(apiUrl(`/api/subscription/status?userId=${encodeURIComponent(userId)}`));
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return await r.json();
}

// STRIPE: Get Stripe price configuration status
export async function getStripePrices() {
  const r = await fetch(apiUrl('/api/stripe/prices'));
  if (!r.ok) throw new Error("Failed to fetch Stripe prices");
  return await r.json();
}
