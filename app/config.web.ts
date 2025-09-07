// Web-specific configuration for Expo
// This file is used when running in web environment

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

// Web environment variables
const webConfig: Config = {
  backend: {
    apiBaseUrl: 'https://formai-backend-dc3u.onrender.com/api',
  },
  openai: {
    apiKey: '',
  },
  stripe: {
    monthlyPriceId: 'price_1RzeKhI5F6u95FnBU2pmitvR',
    annualPriceId: 'price_1RzeLGI5F6u95FnBCUTKO0ap',
  },
  revenuecat: {
    apiKey: '',
    monthlyProductId: '$rc_monthly',
    annualProductId: '$rc_annual',
  },
};

console.log('🌐 Web configuration loaded:', {
  stripe: {
    monthly: webConfig.stripe.monthlyPriceId,
    annual: webConfig.stripe.annualPriceId
  },
  backend: webConfig.backend.apiBaseUrl
});

export default webConfig;








