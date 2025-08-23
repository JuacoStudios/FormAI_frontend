import Constants from 'expo-constants';

interface Config {
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

// Validate critical environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'EXPO_PUBLIC_STRIPE_PRICE_ID',
    'EXPO_PUBLIC_STRIPE_PRICE_ID_YEA'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please configure these in Vercel or your .env file');
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are configured');
};

const config: Config = {
  backend: {
    apiBaseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 'https://formai-backend-dc3u.onrender.com/api',
  },
  openai: {
    apiKey: Constants.expoConfig?.extra?.OPENAI_API_KEY || '',
  },
  stripe: {
    monthlyPriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID || '',
    annualPriceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID_YEA || '',
  },
  revenuecat: {
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '',
    monthlyProductId: '$rc_monthly',
    annualProductId: '$rc_annual',
  },
};

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