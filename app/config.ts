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
      'NEXT_PUBLIC_API_BASE_URL': 'https://formai-backend-dc3u.onrender.com',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': '',
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
    'NEXT_PUBLIC_API_BASE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !getEnvVar(varName));
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
    console.warn('Please configure these in Vercel environment variables');
  } else {
    console.log('✅ All required environment variables are configured');
  }
};

const config: Config = {
  backend: {
    apiBaseUrl: getEnvVar('EXPO_PUBLIC_API_BASE_URL') || 'https://formai-backend-dc3u.onrender.com',
  },
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY') || '',
  },
  stripe: {
    monthlyPriceId: '', // Backend handles price selection
    annualPriceId: '', // Backend handles price selection
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
  backend: config.backend.apiBaseUrl
});

// Debug logs for development builds only
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
  const { buildApiUrl } = require('../src/lib/url');
  console.log('🔗 API URL Builder Debug:', {
    apiBaseUrl: config.backend.apiBaseUrl,
    sampleAnalyzeUrl: buildApiUrl(config.backend.apiBaseUrl, 'analyze'),
    sampleScanUrl: buildApiUrl(config.backend.apiBaseUrl, 'scan'),
  });
}

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