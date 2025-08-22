import { Platform } from 'react-native';

export const usePlatform = () => {
  const isWeb = Platform.OS === 'web';
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  // Feature detection para web
  const webFeatures = {
    hasCamera: isWeb ? 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices : false,
    hasFileSystem: isWeb,
    hasGeolocation: isWeb ? 'geolocation' in navigator : false,
    hasNotifications: isWeb ? 'Notification' in window : false,
    hasServiceWorker: isWeb ? 'serviceWorker' in navigator : false,
    hasPushManager: isWeb ? 'PushManager' in window : false,
    hasIndexedDB: isWeb ? 'indexedDB' in window : false,
    hasLocalStorage: isWeb ? 'localStorage' in window : false,
  };

  // Fallbacks para funcionalidades nativas
  const getNativeModule = (moduleName: string) => {
    if (isWeb) {
      // Retorna un mock para web
      return {
        // Mock para expo-camera
        CameraView: null,
        useCameraPermissions: () => [null, () => Promise.resolve()],
        // Mock para expo-haptics
        impactAsync: () => Promise.resolve(),
        notificationAsync: () => Promise.resolve(),
        selectionAsync: () => Promise.resolve(),
        // Mock para expo-blur
        BlurView: null,
        // Mock para expo-linear-gradient
        LinearGradient: null,
      };
    }
    
    // En nativo, retorna null para evitar errores de require
    // Los módulos se importarán directamente en los componentes
    console.warn(`Module expo-${moduleName} not available in web context`);
    return null;
  };

  // Detectar capacidades del navegador
  const getBrowserCapabilities = () => {
    if (!isWeb) return null;

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform,
      vendor: navigator.vendor,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory || 0,
    };
  };

  // Detectar si es PWA
  const isPWA = () => {
    if (!isWeb) return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  };

  // Detectar si está instalado
  const isInstalled = () => {
    if (!isWeb) return false;
    
    return (
      (window.navigator as any).standalone ||
      window.matchMedia('(display-mode: standalone)').matches ||
      document.referrer.includes('android-app://')
    );
  };

  return {
    isWeb,
    isNative,
    isIOS,
    isAndroid,
    webFeatures,
    getNativeModule,
    getBrowserCapabilities,
    isPWA,
    isInstalled,
    Platform,
  };
};
