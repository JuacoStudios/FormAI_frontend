import { API_BASE } from '../src/lib/api';

export async function fetchRevenueCatOfferings() {
  const response = await fetch(`${API_BASE}/api/revenuecat/offerings`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'No se pudieron obtener los offerings');
  }
  return data.offerings;
} 