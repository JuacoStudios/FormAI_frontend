import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_SCAN_KEY = 'hasCompletedFirstScan';
const PREMIUM_STATUS_KEY = 'isPremiumUser';

export function usePaywall() {
  const [shouldShowPaywall, setShouldShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [hasCompletedFirstScan, setHasCompletedFirstScan] = useState(false);

  useEffect(() => {
    checkPaywallStatus();
  }, []);

  const checkPaywallStatus = async () => {
    try {
      const [firstScanStatus, premiumStatus] = await Promise.all([
        AsyncStorage.getItem(FIRST_SCAN_KEY),
        AsyncStorage.getItem(PREMIUM_STATUS_KEY),
      ]);

      const hasScanned = firstScanStatus === 'true';
      const isPremiumUser = premiumStatus === 'true';

      setHasCompletedFirstScan(hasScanned);
      setIsPremium(isPremiumUser);
    } catch (error) {
      console.error('Error checking paywall status:', error);
    }
  };

  const markFirstScanComplete = async () => {
    try {
      await AsyncStorage.setItem(FIRST_SCAN_KEY, 'true');
      setHasCompletedFirstScan(true);
      
      // Show paywall after first scan if user is not premium
      if (!isPremium) {
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
      }
    } catch (error) {
      console.error('Error setting premium status:', error);
    }
  };

  const showPaywall = () => {
    setShouldShowPaywall(true);
  };

  const hidePaywall = () => {
    setShouldShowPaywall(false);
  };

  return {
    shouldShowPaywall,
    isPremium,
    hasCompletedFirstScan,
    markFirstScanComplete,
    setPremiumStatus,
    showPaywall,
    hidePaywall,
    checkPaywallStatus,
  };
}