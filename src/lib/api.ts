export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "https://formai-backend-dc3u.onrender.com";

export async function createCheckout(variantId: string, customerEmail?: string): Promise<string> {
  const r = await fetch(`${API_BASE}/api/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variantId,
      customerEmail,
      redirectUrl: "formai://purchase/success"
    })
  });
  if (!r.ok) throw new Error("Failed to create checkout");
  const j = await r.json();
  if (!j?.checkoutUrl) throw new Error("No checkoutUrl returned");
  return j.checkoutUrl as string;
}

export async function getProducts() {
  const r = await fetch(`${API_BASE}/api/products`);
  if (!r.ok) throw new Error("Failed to fetch products");
  const j = await r.json();
  return j.data || [];
}

// STRIPE: Create Stripe Checkout for subscriptions
export async function createStripeCheckout(priceId: string, customerEmail?: string) {
  const r = await fetch(`${API_BASE}/api/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      priceId,
      customerEmail,
      successUrl: "formai://purchase/success",
      cancelUrl: "formai://purchase/cancel"
    })
  });
  if (!r.ok) throw new Error("Failed to create Stripe checkout session");
  const j = await r.json();
  if (!j?.url) throw new Error("No checkout URL returned");
  return j.url as string;
}

// STRIPE: Get Stripe price configuration status
export async function getStripePrices() {
  const r = await fetch(`${API_BASE}/api/stripe/prices`);
  if (!r.ok) throw new Error("Failed to fetch Stripe prices");
  return await r.json();
}
