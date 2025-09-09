/**
 * Centralized API URL builder to prevent double /api paths
 * and ensure consistent URL construction across the app
 */

export function normalizeBaseUrl(u: string): string {
  // remove trailing slashes and trailing /api if it made it into the env by mistake
  return u.replace(/\/+$/, '').replace(/\/api$/i, '');
}

export function buildApiUrl(base: string, path: string): string {
  const cleanBase = normalizeBaseUrl(base);
  const cleanPath = path.replace(/^\/+/, '').replace(/^api\/+/i, ''); // forbid double "api"
  return `${cleanBase}/api/${cleanPath}`;
}
