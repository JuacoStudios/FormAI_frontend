// Centralized API base URL with fallback
export const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE?.trim()) ||
  'https://formai-backend-dc3u.onrender.com'; // fallback

// Helper function to build full URLs
function url(path: string) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

// API health check and startup assertion
export async function assertApiReachable() {
  console.log('[Paywall] API_BASE =', API_BASE);
  try {
    const r = await fetch(url('/api/health'));
    if (!r.ok) throw new Error(`health ${r.status}`);
    const data = await r.json();
    console.log('[Paywall] /api/health OK', data);
    return true;
  } catch (e) {
    console.error('[Paywall] API not reachable:', e);
    return false;
  }
}

export async function getProducts() {
  try {
    const r = await fetch(url('/api/products'));
    if (!r.ok) {
      console.warn('[API] Products endpoint failed:', r.status, r.statusText);
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    const j = await r.json();
    return j.data || [];
  } catch (error) {
    console.warn('[API] Products fetch failed, using fallback env prices:', error);
    // Return fallback structure with flag
    return {
      usingFallback: true,
      monthly: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
      annual: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL
    };
  }
}

export async function createCheckout(payload: {
  priceId: string;
  customerEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  console.log('[Stripe] createCheckout request:', payload);
  
  try {
    const r = await fetch(url('/api/create-checkout-session'), {
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
    
    console.log('[Stripe] createCheckout response status:', r.status);
    
    if (!r.ok) {
      const errorBody = await r.text();
      console.error('[Stripe] createCheckout error response:', errorBody);
      throw new Error(`HTTP ${r.status}: ${errorBody}`);
    }
    
    const j = await r.json();
    console.log('[Stripe] createCheckout success response:', j);
    
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
