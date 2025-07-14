export async function fetchRevenueCatOfferings() {
  const response = await fetch('https://formai-backend-dc3u.onrender.com/api/revenuecat/offerings');
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'No se pudieron obtener los offerings');
  }
  return data.offerings;
} 