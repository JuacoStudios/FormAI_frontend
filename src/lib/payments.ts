// Stripe Payment Links helper
export const USE_PAYMENT_LINKS =
  (process.env.NEXT_PUBLIC_USE_PAYMENT_LINKS ?? 'true') === 'true';

function getPaymentUrl(plan: 'monthly' | 'annual'): string | null {
  const monthly = process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY;
  
  const annual = process.env.NEXT_PUBLIC_STRIPE_LINK_ANNUAL;
  return plan === 'annual' ? annual ?? null : monthly ?? null;
}

export function goToPayment(plan: 'monthly' | 'annual'): boolean {
  const url = getPaymentUrl(plan);
  if (!url) return false; // caller will show a friendly message / disable buttons
  window.location.assign(url);
  return true;
}

export { getPaymentUrl };

// Feature flag check for subscription status
export function shouldSkipSubscriptionCheck(): boolean {
  return USE_PAYMENT_LINKS;
}
