// LEGACY: Compatibility layer for existing components
// This file maintains the old API structure while the new API is implemented

import config from '../../app/config';
import { timedFetch } from './timedFetch';

// Legacy constants for backward compatibility
export const API_BASE = config.backend.apiBaseUrl;
export const ENV_MONTHLY = config.stripe.monthlyPriceId;
export const ENV_ANNUAL = config.stripe.annualPriceId;
export const WEB_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

// Legacy API health check
export async function assertApiReachable() {
  console.debug('[Paywall] API_BASE =', API_BASE);
  try {
    const healthUrl = `${API_BASE}/health`;
    console.debug('[API] Health check URL:', healthUrl);
    
    const { res, ms } = await timedFetch(healthUrl, {
      method: 'GET',
      timeoutMs: 2000
    });
    
    if (!res.ok) throw new Error(`health ${res.status}`);
    const data = await res.json();
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

// Legacy Stripe products
export async function getProducts() {
  try {
    const productsUrl = `${API_BASE}/api/stripe/products`;
    console.debug('[API] Fetching products from:', productsUrl);
    
    const { res } = await timedFetch(productsUrl, {
      method: 'GET',
      timeoutMs: 10000
    });
    
    if (!res.ok) {
      console.warn('[API] Stripe products endpoint failed:', res.status, res.statusText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const j = await res.json();
    
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

// Legacy checkout creation
export async function createCheckout(payload: {
  priceId: string;
  customerEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  const requestUrl = `${API_BASE}/api/create-checkout-session`;
  console.debug('[Stripe] createCheckout request:', { url: requestUrl, payload });
  
  try {
    const { res } = await timedFetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: payload.priceId,
        customerEmail: payload.customerEmail,
        userId: payload.userId,
        successUrl: payload.successUrl,
        cancelUrl: payload.cancelUrl
      }),
      timeoutMs: 15000
    });
    
    console.debug('[Stripe] createCheckout response status:', res.status);
    
    if (!res.ok) {
      const errorBody = await res.text();
      console.error('[Stripe] createCheckout error response:', errorBody);
      throw new Error(`[createCheckout] ${res.status} ${errorBody}`);
    }
    
    const j = await res.json();
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

// Legacy subscription status
export async function getSubscriptionStatus(userId: string): Promise<{ 
  active: boolean; 
  plan?: "monthly"|"annual"; 
  currentPeriodEnd?: number 
}> {
  const statusUrl = `${API_BASE}/api/subscription/status?userId=${encodeURIComponent(userId)}`;
  console.debug('[API] Checking subscription status:', statusUrl);
  
  const { res } = await timedFetch(statusUrl, {
    method: 'GET',
    timeoutMs: 10000
  });
  
  if (!res.ok) {
    console.error('[API] Subscription status failed:', res.status, res.statusText);
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  const data = await res.json();
  console.debug('[API] Subscription status response:', data);
  return data;
}

// Legacy Stripe prices
export async function getStripePrices() {
  const pricesUrl = `${API_BASE}/api/stripe/prices`;
  console.debug('[API] Fetching Stripe prices from:', pricesUrl);
  
  const { res } = await timedFetch(pricesUrl, {
    method: 'GET',
    timeoutMs: 10000
  });
  
  if (!res.ok) {
    console.error('[API] Failed to fetch Stripe prices:', res.status, res.statusText);
    throw new Error("Failed to fetch Stripe prices");
  }
  
  const data = await res.json();
  console.debug('[API] Stripe prices response:', data);
  return data;
}
