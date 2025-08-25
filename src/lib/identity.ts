import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'formai_user_id';
const USER_EMAIL_KEY = 'formai_user_email';

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create a unique user ID
export async function getOrCreateUserId(): Promise<string> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = generateUUID();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      console.log('[Identity] Generated new userId:', userId);
    } else {
      console.log('[Identity] Retrieved existing userId:', userId);
    }
    
    return userId;
  } catch (error) {
    console.error('[Identity] Error getting/creating userId:', error);
    // Fallback: generate a new ID for this session
    const fallbackId = generateUUID();
    console.log('[Identity] Using fallback userId:', fallbackId);
    return fallbackId;
  }
}

// Set user email (lowercased)
export async function setUserEmail(email: string): Promise<void> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    await AsyncStorage.setItem(USER_EMAIL_KEY, normalizedEmail);
    console.log('[Identity] User email set:', normalizedEmail);
  } catch (error) {
    console.error('[Identity] Error setting user email:', error);
    throw error;
  }
}

// Get user email
export async function getUserEmail(): Promise<string | null> {
  try {
    const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
    return email;
  } catch (error) {
    console.error('[Identity] Error getting user email:', error);
    return null;
  }
}

// Get complete identity
export async function getIdentity(): Promise<{ userId: string; email?: string }> {
  try {
    const [userId, email] = await Promise.all([
      getOrCreateUserId(),
      getUserEmail()
    ]);
    
    return { userId, email: email || undefined };
  } catch (error) {
    console.error('[Identity] Error getting identity:', error);
    // Return at least the userId
    const userId = await getOrCreateUserId();
    return { userId };
  }
}
