import { useState, useEffect } from 'react';
import { getEntitlement, scan, createCheckout, EntitlementResponse } from '../src/lib/api';

export function usePaywall() {
  const [isPremium, setIsPremium] = useState(false);
  const [scansUsed, setScansUsed] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entitlement, setEntitlement] = useState<EntitlementResponse | null>(null);

  useEffect(() => {
    refreshEntitlement();
  }, []);

  const refreshEntitlement = async () => {
    try {
      setLoading(true);
      const data = await getEntitlement();
      setEntitlement(data);
      setIsPremium(data.active);
      setScansUsed(data.scansUsed);
      
      console.log('🔍 Entitlement loaded:', data);
    } catch (error) {
      console.error('Error loading entitlement:', error);
      // Default to free tier on error
      setIsPremium(false);
      setScansUsed(0);
    } finally {
      setLoading(false);
    }
  };

  const performScan = async (imageFile: File, onSuccess: (result: any) => void) => {
    try {
      setLoading(true);
      const result = await scan(imageFile);
      onSuccess(result);
      
      // Refresh entitlement after successful scan
      await refreshEntitlement();
    } catch (error: any) {
      console.error('Scan error:', error);
      
      if (error.code === 402 && error.requirePaywall) {
        // Show paywall for limit exceeded
        setShowPaywall(true);
      } else {
        // Show error message for other errors
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (plan: 'monthly' | 'annual') => {
    try {
      setLoading(true);
      const { url } = await createCheckout(plan);
      
      // Redirect to Stripe checkout
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hidePaywall = () => {
    setShowPaywall(false);
  };

  return {
    isPremium,
    scansUsed,
    showPaywall,
    loading,
    entitlement,
    performScan,
    subscribe,
    hidePaywall,
    refreshEntitlement,
  };
}