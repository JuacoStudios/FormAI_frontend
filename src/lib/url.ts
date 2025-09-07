/**
 * Centralized API URL builder to prevent double /api paths
 * and ensure consistent URL construction across the app
 */

export function buildApiUrl(base: string, path: string) {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const withoutLeadingApi = cleanPath.replace(/^api\/+/, '');
  return `${cleanBase}/api/${withoutLeadingApi}`;
}
