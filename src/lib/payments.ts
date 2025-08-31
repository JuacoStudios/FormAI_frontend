// Stripe Payment Links helper
export const USE_PAYMENT_LINKS =
  (process.env.NEXT_PUBLIC_USE_PAYMENT_LINKS ?? 'true') === 'true';

export function goToPayment(plan: 'monthly' | 'annual') {
  // Try environment variables first
  let monthly = process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY;
  let annual = process.env.NEXT_PUBLIC_STRIPE_LINK_ANNUAL;
  
  // TEMPORARY hardcoded fallback if env vars are missing
  if (!monthly || !annual) {
    console.warn('[payments] Using hardcoded fallback Payment Links');
    monthly = 'https://buy.stripe.com/test_monthly_fallback';
    annual = 'https://buy.stripe.com/test_annual_fallback';
  }
  
  const url = plan === 'annual' ? annual : monthly;

  if (!url) {
    alert('Payment link is not configured. Please contact support.');
    return;
  }

  console.log(`[payments] Redirecting to ${plan} plan:`, url);
  
  // Direct navigation preserves the user gesture on mobile (no popup blockers)
  window.location.assign(url);
}

// Feature flag check for subscription status
export function shouldSkipSubscriptionCheck(): boolean {
  return USE_PAYMENT_LINKS;
}
