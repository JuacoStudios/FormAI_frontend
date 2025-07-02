import Constants from 'expo-constants';

interface Config {
  backend: {
    apiBaseUrl: string;
  };
  openai: {
    apiKey: string;
  };
}

const config: Config = {
  backend: {
    apiBaseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 'https://formai-backend-dc3u.onrender.com/api',
  },
  openai: {
    apiKey: Constants.expoConfig?.extra?.OPENAI_API_KEY || '',
  },
};

export { config };