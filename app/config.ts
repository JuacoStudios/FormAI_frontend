import { Constants } from 'expo-constants';
import { Platform } from 'react-native';

export interface Config {
  backend: {
    apiBaseUrl: string;
  };
  openai: {
    apiKey: string;
  };
  stripe: {
    monthlyPriceId: string;
    annualPriceId: string;
  };
  revenuecat: {
    apiKey: string;
    monthlyProductId: string;
    annualProductId: string;
  };
}

// Check if we're running in web environment
const isWeb = Platform.OS === 'web';

// Helper function to get environment variables safely
const getEnvVar = (key: string): string => {
  // For web environment, use hardcoded values
  if (isWeb) {
    const webConfig: Record<string, string> = {
      'EXPO_PUBLIC_API_BASE_URL': 'https://formai-backend-dc3u.onrender.com',
      'EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY': 'price_1RzeKhI5F6u95FnBU2pmitvR',
      'EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL': 'price_1RzeLGI5F6u95FnBCUTKO0ap',
      'EXPO_PUBLIC_REVENUECAT_API_KEY': '',
      'OPENAI_API_KEY': ''
    };
    return webConfig[key] || '';
  }
  
  // Fallback to process.env for native
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  
  return '';
};

// Validate critical environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY',
    'EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL'
  ];
  
  const missingVars = requiredVars.filter(varName => !getEnvVar(varName));
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
    console.warn('Please configure these in app.json or your .env file');
  } else {
    console.log('✅ All required environment variables are configured');
  }
};

const config: Config = {
  backend: {
    // PERF: Ensure no trailing slash to avoid 404s
    apiBaseUrl: getEnvVar('EXPO_PUBLIC_API_BASE_URL') || 'https://formai-backend-dc3u.onrender.com',
  },
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY') || '',
  },
  stripe: {
    monthlyPriceId: getEnvVar('EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY') || '',
    annualPriceId: getEnvVar('EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL') || '',
  },
  revenuecat: {
    apiKey: getEnvVar('EXPO_PUBLIC_REVENUECAT_API_KEY') || '',
    monthlyProductId: '$rc_monthly',
    annualProductId: '$rc_annual',
  },
};

// Log configuration for debugging
console.log('🔧 Config loaded:', {
  platform: Platform.OS,
  stripe: {
    monthly: config.stripe.monthlyPriceId,
    annual: config.stripe.annualPriceId
  },
  backend: config.backend.apiBaseUrl
});

// Validate environment variables on import
if (typeof window !== 'undefined') {
  // Only validate in browser environment
  try {
    validateEnvVars();
  } catch (error) {
    console.error('Environment validation failed:', error);
  }
}

export default config;