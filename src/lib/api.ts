/**
 * API Helper with Environment Variable Validation
 * Prevents /undefined/api/ URLs by ensuring API_BASE is always defined
 */

// Validate API_BASE environment variable
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
if (!API_BASE) {
  throw new Error('API_BASE is undefined. Check EXPO_PUBLIC_API_BASE env.');
}

// Validate Stripe price IDs
const STRIPE_MONTHLY = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
const STRIPE_ANNUAL = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL;

if (!STRIPE_MONTHLY || !STRIPE_ANNUAL) {
  const error = `Missing Stripe price IDs. Check EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY and EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL env vars.`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(error);
  } else {
    console.warn('⚠️', error);
  }
}

// Validate WEB_ORIGIN
const WEB_ORIGIN = process.env.EXPO_PUBLIC_WEB_ORIGIN;
if (!WEB_ORIGIN) {
  console.warn('⚠️ EXPO_PUBLIC_WEB_ORIGIN is not set');
}

// Log environment variables in development
if (process.env.NODE_ENV !== 'production') {
  console.debug('[env]', {
    API_BASE,
    WEB_ORIGIN,
    STRIPE_MONTHLY: STRIPE_MONTHLY?.substring(0, 8) + '...',
    STRIPE_ANNUAL: STRIPE_ANNUAL?.substring(0, 8) + '...',
  });
}

/**
 * API helper function that ensures proper URL construction
 * @param path - API path (with or without leading slash)
 * @returns Full API URL
 */
export const API = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<Response> => {
  return fetch(API('/health'));
};

/**
 * Stripe products endpoint
 */
export const getStripeProducts = async (): Promise<Response> => {
  return fetch(API('/stripe/products'));
};

/**
 * Create checkout session
 */
export const createCheckoutSession = async (data: any): Promise<Response> => {
  return fetch(API('/create-checkout-session'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

/**
 * Get subscription status
 */
export const getSubscriptionStatus = async (userId: string): Promise<Response> => {
  return fetch(API(`/subscription/status?userId=${encodeURIComponent(userId)}`));
};

/**
 * Get Stripe prices
 */
export const getStripePrices = async (): Promise<Response> => {
  return fetch(API('/stripe/prices'));
};

// Export constants for use in other modules
export { API_BASE, STRIPE_MONTHLY, STRIPE_ANNUAL, WEB_ORIGIN };
