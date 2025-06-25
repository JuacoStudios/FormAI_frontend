import Constants from 'expo-constants';

export const config = {
  openai: {
    apiUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_URL,
    apiKey: Constants.expoConfig?.extra?.OPENAI_API_KEY,
  },
  backend: {
    apiBaseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 'https://formai-backend-dc3u.onrender.com/api',
    apiUrl: Constants.expoConfig?.extra?.API_URL || 'https://formai-backend-dc3u.onrender.com',
  },
};

// Validación de configuración
export const validateConfig = () => {
  const errors = [];
  
  if (!config.backend.apiBaseUrl) {
    errors.push('EXPO_PUBLIC_API_BASE_URL is not configured');
  }
  
  if (!config.backend.apiUrl) {
    errors.push('API_URL is not configured');
  }
  
  if (errors.length > 0) {
    console.warn('Configuration validation errors:', errors);
  }
  
  return errors.length === 0;
};

// Validar configuración al importar
validateConfig(); 