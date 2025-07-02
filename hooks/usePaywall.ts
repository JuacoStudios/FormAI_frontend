import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_SCAN_KEY = 'hasCompletedFirstScan';
const PREMIUM_STATUS_KEY = 'isPremiumUser';
const PAYWALL_DISMISSED_KEY = 'paywallDismissed';

export function usePaywall() {
  const [shouldShowPaywall, setShouldShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [hasCompletedFirstScan, setHasCompletedFirstScan] = useState(false);
  const [paywallDismissed, setPaywallDismissed] = useState(false);

  useEffect(() => {
    checkPaywallStatus();
  }, []);

  const checkPaywallStatus = async () => {
    try {
      const [firstScanStatus, premiumStatus, dismissedStatus] = await Promise.all([
        AsyncStorage.getItem(FIRST_SCAN_KEY),
        AsyncStorage.getItem(PREMIUM_STATUS_KEY),
        AsyncStorage.getItem(PAYWALL_DISMISSED_KEY),
      ]);

      const hasScanned = firstScanStatus === 'true';
      const isPremiumUser = premiumStatus === 'true';
      const wasDismissed = dismissedStatus === 'true';

      setHasCompletedFirstScan(hasScanned);
      setIsPremium(isPremiumUser);
      setPaywallDismissed(wasDismissed);

      // Show paywall if user has scanned, is not premium, and hasn't dismissed it
      if (hasScanned && !isPremiumUser && !wasDismissed) {
        setShouldShowPaywall(true);
      }
    } catch (error) {
      console.error('Error checking paywall status:', error);
    }
  };

  const markFirstScanComplete = async () => {
    try {
      await AsyncStorage.setItem(FIRST_SCAN_KEY, 'true');
      setHasCompletedFirstScan(true);
      
      // Show paywall after first scan if user is not premium and hasn't dismissed it
      if (!isPremium && !paywallDismissed) {
        setShouldShowPaywall(true);
      }
    } catch (error) {
      console.error('Error marking first scan complete:', error);
    }
  };

  const setPremiumStatus = async (status: boolean) => {
    try {
      await AsyncStorage.setItem(PREMIUM_STATUS_KEY, status.toString());
      setIsPremium(status);
      
      if (status) {
        setShouldShowPaywall(false);
        // Clear dismissed status when user becomes premium
        await AsyncStorage.removeItem(PAYWALL_DISMISSED_KEY);
        setPaywallDismissed(false);
      }
    } catch (error) {
      console.error('Error setting premium status:', error);
    }
  };

  const showPaywall = () => {
    setShouldShowPaywall(true);
  };

  const hidePaywall = async (dismissed: boolean = false) => {
    setShouldShowPaywall(false);
    
    if (dismissed) {
      try {
        await AsyncStorage.setItem(PAYWALL_DISMISSED_KEY, 'true');
        setPaywallDismissed(true);
      } catch (error) {
        console.error('Error marking paywall as dismissed:', error);
      }
    }
  };

  const resetPaywallState = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(FIRST_SCAN_KEY),
        AsyncStorage.removeItem(PREMIUM_STATUS_KEY),
        AsyncStorage.removeItem(PAYWALL_DISMISSED_KEY),
      ]);
      
      setHasCompletedFirstScan(false);
      setIsPremium(false);
      setPaywallDismissed(false);
      setShouldShowPaywall(false);
    } catch (error) {
      console.error('Error resetting paywall state:', error);
    }
  };

  return {
    shouldShowPaywall,
    isPremium,
    hasCompletedFirstScan,
    paywallDismissed,
    markFirstScanComplete,
    setPremiumStatus,
    showPaywall,
    hidePaywall,
    checkPaywallStatus,
    resetPaywallState,
  };
}