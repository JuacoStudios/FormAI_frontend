export async function readinessProbe() {
  const base = process.env.EXPO_PUBLIC_API_BASE || "";
  const res = await fetch(`${base}/api/health`).catch(e => ({ ok:false, statusText:String(e) }));
  const ok = !!(res && 'ok' in res ? res.ok : (res as any)?.ok);
  console.debug("[Readiness] API_BASE:", base, "health ok:", ok);
  console.debug("[Readiness] Prices(monthly,annual):",
    process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
    process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL
  );
  return { apiBase: base, apiOk: ok };
}

