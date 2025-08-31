// Stripe Payment Links helper
export const USE_PAYMENT_LINKS =
  process.env.NEXT_PUBLIC_USE_PAYMENT_LINKS === 'true';

export function goToPayment(plan: 'monthly' | 'annual') {
  const monthly = process.env.NEXT_PUBLIC_STRIPE_LINK_MONTHLY!;
  const annual = process.env.NEXT_PUBLIC_STRIPE_LINK_ANNUAL!;
  const url = plan === 'annual' ? annual : monthly;

  if (!url) {
    alert('Payment link is not configured. Please contact support.');
    return;
  }

  // Direct navigation preserves the user gesture on mobile (no popup blockers)
  window.location.assign(url);
}

// Feature flag check for subscription status
export function shouldSkipSubscriptionCheck(): boolean {
  return USE_PAYMENT_LINKS;
}
