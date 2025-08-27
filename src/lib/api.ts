// Environment variables and constants
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;
export const ENV_MONTHLY = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY || "";
export const ENV_ANNUAL = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL || "";
export const WEB_ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN || (typeof window !== "undefined" ? window.location.origin : "");

// Helper function to build full URLs
function url(path: string) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

// Helper function to detect HTML responses (for diagnostics only)
function isLikelyHtml(str: string): boolean {
  return str.trim().startsWith('<!DOCTYPE') || str.trim().startsWith('<html') || str.includes('<body');
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

export async function getProducts() {
  try {
    console.debug('[API] Fetching products from:', url('/api/stripe/products'));
    const r = await fetch(url('/api/stripe/products'));
    
    if (!r.ok) {
      console.warn('[API] Stripe products endpoint failed:', r.status, r.statusText);
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    
    const responseText = await r.text();
    console.debug('[API] Raw response length:', responseText.length);
    
    // Check if response is HTML instead of JSON
    if (isLikelyHtml(responseText)) {
      console.error('[API] Received HTML instead of JSON:', responseText.substring(0, 150));
      throw new Error(`Expected JSON but got HTML (${r.status})`);
    }
    
    const j = JSON.parse(responseText);
    console.debug('[API] Parsed products response:', j);
    
    // Check for MISSING_PRICE_IDS error
    if (j.error === "MISSING_PRICE_IDS") {
      console.warn('[API] Stripe products endpoint returned MISSING_PRICE_IDS, using env fallback');
      throw new Error("MISSING_PRICE_IDS");
    }
    
    // Validate response shape
    if (j.monthly && j.annual) {
      console.debug('[API] Using API products:', { monthly: j.monthly.id, annual: j.annual.id });
      return {
        usingApi: true,
        usingFallback: false,
        monthly: j.monthly,
        annual: j.annual
      };
    } else {
      console.warn('[API] Invalid products response shape:', j);
      throw new Error("Invalid products response shape");
    }
    
  } catch (error) {
    console.error('[API] Stripe products fetch failed, using fallback env prices:', error);
    
    // Return fallback structure using ENV constants
    const monthly = ENV_MONTHLY || '';
    const annual = ENV_ANNUAL || '';
    
    const result = {
      usingApi: false,
      usingFallback: true,
      monthly: monthly ? { id: monthly } : null,
      annual: annual ? { id: annual } : null
    };
    
    console.debug('[API] products fallback result:', { 
      status: 'fallback', 
      usingApi: false, 
      usingFallback: true, 
      monthly: !!monthly, 
      annual: !!annual 
    });
    
    return result;
  }
}

export async function createCheckout(payload: {
  priceId: string;
  customerEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  console.debug('[Stripe] createCheckout request:', payload);
  
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
    
    console.debug('[Stripe] createCheckout response status:', r.status);
    
    if (!r.ok) {
      const errorBody = await r.text();
      console.error('[Stripe] createCheckout error response:', errorBody);
      
      // Check if response is HTML
      if (isLikelyHtml(errorBody)) {
        throw new Error(`createCheckout failed: ${r.status} HTML response (${errorBody.substring(0, 150)})`);
      }
      
      throw new Error(`createCheckout failed: ${r.status} ${errorBody.substring(0, 150)}`);
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
  const url = `${API_BASE}/api/subscription/status?userId=${encodeURIComponent(userId)}`;
  console.debug('[API] Checking subscription status:', url);
  
  const r = await fetch(url);
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
  const r = await fetch(url('/api/stripe/prices'));
  if (!r.ok) throw new Error("Failed to fetch Stripe prices");
  return await r.json();
}
