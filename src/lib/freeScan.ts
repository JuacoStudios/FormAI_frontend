import AsyncStorage from '@react-native-async-storage/async-storage';

const FREE_SCAN_KEY = 'formai_free_scan_used';

/**
 * Check if the user has already used their free scan
 */
export const getHasUsedFreeScan = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(FREE_SCAN_KEY);
    return value === 'true';
  } catch (error) {
    console.error('❌ Error reading free scan status:', error);
    // On error, assume free scan is available
    return false;
  }
};

/**
 * Mark that the user has used their free scan
 */
export const setHasUsedFreeScanTrue = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(FREE_SCAN_KEY, 'true');
    console.log('✅ Free scan marked as used');
  } catch (error) {
    console.error('❌ Error setting free scan status:', error);
  }
};

/**
 * Reset free scan status (useful for testing or admin purposes)
 */
export const resetFreeScan = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FREE_SCAN_KEY);
    console.log('🔄 Free scan status reset');
  } catch (error) {
    console.error('❌ Error resetting free scan status:', error);
  }
};

/**
 * Get remaining free scans (0 or 1)
 */
export const getRemainingFreeScans = async (): Promise<number> => {
  const used = await getHasUsedFreeScan();
  return used ? 0 : 1;
};
