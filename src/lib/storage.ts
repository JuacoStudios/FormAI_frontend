import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web storage optimization to prevent QuotaExceededError
const WEB_STORAGE_LIMIT = 10; // Keep only last 10 items for web

/**
 * Safe storage wrapper that handles web storage limitations
 */
export class SafeStorage {
  /**
   * Store array data with size limits for web
   */
  static async setArray(key: string, data: any[]): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // For web, limit array size to prevent QuotaExceededError
        const limitedData = data.slice(-WEB_STORAGE_LIMIT);
        await AsyncStorage.setItem(key, JSON.stringify(limitedData));
        console.log(`🌐 Web storage: Limited array to ${limitedData.length} items`);
      } else {
        // For native, store full array
        await AsyncStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error('❌ Error storing array data:', error);
      // If storage fails, try storing just the last few items
      if (Platform.OS === 'web') {
        try {
          const limitedData = data.slice(-5);
          await AsyncStorage.setItem(key, JSON.stringify(limitedData));
          console.log('🔄 Fallback: Stored limited data after storage error');
        } catch (fallbackError) {
          console.error('❌ Fallback storage also failed:', fallbackError);
        }
      }
    }
  }

  /**
   * Get array data with safe fallback
   */
  static async getArray(key: string): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error reading array data:', error);
      return [];
    }
  }

  /**
   * Add item to array with size management
   */
  static async addToArray(key: string, item: any): Promise<void> {
    try {
      const existingData = await this.getArray(key);
      const newData = [...existingData, item];
      
      if (Platform.OS === 'web') {
        // For web, keep only last N items
        const limitedData = newData.slice(-WEB_STORAGE_LIMIT);
        await AsyncStorage.setItem(key, JSON.stringify(limitedData));
        console.log(`🌐 Web storage: Added item, array now has ${limitedData.length} items`);
      } else {
        // For native, store all items
        await AsyncStorage.setItem(key, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('❌ Error adding to array:', error);
    }
  }

  /**
   * Store simple key-value data
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('❌ Error storing item:', error);
    }
  }

  /**
   * Get simple key-value data
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('❌ Error reading item:', error);
      return null;
    }
  }

  /**
   * Remove item
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('❌ Error removing item:', error);
    }
  }

  /**
   * Clear all data (use with caution)
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('🗑️ All storage cleared');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
    }
  }
}

// Export convenience functions
export const setArray = SafeStorage.setArray;
export const getArray = SafeStorage.getArray;
export const addToArray = SafeStorage.addToArray;
export const setItem = SafeStorage.setItem;
export const getItem = SafeStorage.getItem;
export const removeItem = SafeStorage.removeItem;
export const clear = SafeStorage.clear;
