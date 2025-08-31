import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_BASE } from '../lib/api';
import { USE_PAYMENT_LINKS } from '../lib/payments';

export type Plan = 'monthly' | 'annual' | null;

export interface SubState {
  isPremium: boolean;
  plan: Plan;
  loading: boolean;
  error: string | null;
  fetchStatus: (email: string) => Promise<void>;
  markPremium: () => void;
  clearError: () => void;
}

const SubscriptionContext = createContext<SubState | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState<Plan>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (email: string) => {
    if (!email) {
      setError('Email is required');
      return;
    }

    // Skip API call when Payment Links are enabled
    if (USE_PAYMENT_LINKS) {
      console.log('🔍 Payment Links enabled, skipping subscription status check');
      setIsPremium(false);
      setPlan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching subscription status for:', email);
      
      const response = await fetch(`${API_BASE}/api/subscription/status?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('✅ Subscription status received:', data);
      
      setIsPremium(data.active);
      setPlan(data.plan);
      
      if (data.active) {
        console.log('🎉 User is premium with plan:', data.plan);
      } else {
        console.log('ℹ️ User is not premium');
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching subscription status:', err);
      setError(err.message || 'Failed to fetch subscription status');
      setIsPremium(false);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const markPremium = useCallback(() => {
    console.log('🎯 Marking user as premium');
    setIsPremium(true);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: SubState = {
    isPremium,
    plan,
    loading,
    error,
    fetchStatus,
    markPremium,
    clearError
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
