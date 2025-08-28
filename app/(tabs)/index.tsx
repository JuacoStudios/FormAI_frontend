import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Modal, Platform, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera as CameraIcon, Camera as FlipCamera } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import config from '../config';
import { usePaywall } from '@/hooks/usePaywall';
import PaywallScreen from '@/components/PaywallScreen';
import { Linking } from 'react-native';
import { usePlatform } from '@/hooks/usePlatform';
import WebCameraFallback from '@/components/WebCameraFallback';
import { CaptureButton } from '@/components/CaptureButton';
// PERF: Import web-safe optimized utilities
import { timedFetch, retryFetch } from '@/src/lib/timedFetch';
import { optimizeImage, formatFileSize } from '@/src/lib/imageOptimizerWeb';
import { validateApi, getApiErrorMessage } from '@/src/lib/healthCheckWeb';

// Layout constants for responsive design
const FAB_SIZE = 80;            // px, actual rendered size of the green capture button
const FAB_GAP = 16;             // px, visual gap between text and FAB
const SAFE_BOTTOM = 'env(safe-area-inset-bottom, 0px)';

// Storage keys
const SCAN_COUNT_KEY = 'scanAttemptCount';
const SCAN_HISTORY_KEY = 'scanHistory';

// Helper function to convert base64 to Blob
const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg'): Blob => {
  try {
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to Blob:', error);
    throw new Error('Failed to process image data');
  }
};

export default function ScanScreen() {
  const router = useRouter();
  const { isWeb, webFeatures } = usePlatform();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);
  const cameraRef = useRef<CameraView>(null);
  const [buttonScale] = useState(new Animated.Value(1));
  
  // Welcome modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [modalOpacity] = useState(new Animated.Value(0));
  const [modalScale] = useState(new Animated.Value(0.8));
  
  const {
    shouldShowPaywall,
    isPremium,
    hasCompletedFirstScan,
    markFirstScanComplete,
    setPremiumStatus,
    hidePaywall,
    showPaywall,
    resetPaywallState,
  } = usePaywall();

  // Load scan count from AsyncStorage on component mount
  useEffect(() => {
    console.log('🔍 Scan screen mounted');
    loadScanCount();
    checkFirstTimeUser();
    
    // PERF: Validate API health on mount
    validateApi().then(validation => {
      if (!validation.overall) {
        console.warn('⚠️ API validation failed on mount:', validation);
      } else {
        console.log('✅ API validation successful on mount');
      }
    }).catch(error => {
      console.error('❌ API validation error on mount:', error);
    });
  }, []);



  // Check if this is the first time the user opens the app
  const checkFirstTimeUser = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setTimeout(() => {
          setShowWelcomeModal(true);
          showWelcomeAnimation();
        }, 500);
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
    }
  };

  // Welcome modal animation
  const showWelcomeAnimation = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(modalScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
    ]).start();
  };

  const hideWelcomeModal = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(modalScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start(() => {
        setShowWelcomeModal(false);
      });
    } catch (error) {
      console.error('Error hiding welcome modal:', error);
      setShowWelcomeModal(false);
    }
  };

  // Load the current scan count from persistent storage
  const loadScanCount = async () => {
    try {
      const storedCount = await AsyncStorage.getItem(SCAN_COUNT_KEY);
      const count = storedCount ? parseInt(storedCount, 10) : 0;
      setScanCount(count);
      console.log('📊 Loaded scan count:', count);
    } catch (error) {
      console.error('Error loading scan count:', error);
      setScanCount(0);
    }
  };

  // Increment scan count and save to AsyncStorage
  const incrementScanCount = async () => {
    try {
      const newCount = scanCount + 1;
      await AsyncStorage.setItem(SCAN_COUNT_KEY, newCount.toString());
      setScanCount(newCount);
      console.log('📊 Updated scan count:', newCount);
      return newCount;
    } catch (error) {
      console.error('Error saving scan count:', error);
      return scanCount + 1;
    }
  };

  // Reset scan count for testing purposes
  const resetScanCount = async () => {
    try {
      await AsyncStorage.removeItem(SCAN_COUNT_KEY);
      setScanCount(0);
      console.log('🔄 Scan count reset to 0');
      
      // También resetear el estado del paywall para permitir más escaneos
      await resetPaywallState();
      console.log('🔄 Paywall state also reset');
      
      Alert.alert('Éxito', 'Contador de escaneos reseteado. Puedes escanear 2 veces más.');
    } catch (error) {
      console.error('Error resetting scan count:', error);
      Alert.alert('Error', 'No se pudo resetear el contador de escaneos.');
    }
  };

  // Save scan to history
  const saveScanToHistory = async (machineName: string, imageUri: string, result: string) => {
    try {
      const timestamp = Date.now();
      const newScan = { id: timestamp, machineName, imageUri, result, timestamp };
      const historyRaw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      let history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(newScan);
      if (history.length > 20) history = history.slice(0, 20);
      await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error guardando historial de escaneos:', error);
    }
  };

  const canScan = isPremium || scanCount < 2;
  
  // Debug logging
  console.log('🔍 Debug canScan:', { isPremium, scanCount, canScan, shouldShowPaywall });

  // Debug state changes
  useEffect(() => {
    console.debug('[scan] state', { analyzing, canScan, shouldShowPaywall, scanCount, isPremium });
  }, [analyzing, canScan, shouldShowPaywall, scanCount, isPremium]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera access to scan gym equipment</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            try {
              console.log('🔐 Requesting camera permission...');
              const result = await requestPermission();
              console.log('🔐 Permission result:', result);
              
              if (!result.granted) {
                console.log('❌ Permission denied');
                Alert.alert('Permiso Denegado', 'Camera permission is required to scan equipment. Please allow camera access in your browser settings.');
              }
            } catch (error) {
              console.error('❌ Error requesting permission:', error);
              Alert.alert('Error', 'Error requesting camera permission. Please check your device settings and try again.');
            }
          }}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Button pulse animation
  const triggerButtonPulse = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  };

  const handleCapture = async () => {
    console.debug('[capture] invoked', { type: 'handleCapture' });
    console.log('📸 handleCapture started');
    console.log('🔍 Estado actual:', { analyzing, canScan, shouldShowPaywall, isPremium, scanCount });
    
    // Feedback visual inmediato
    triggerButtonPulse();
    
    // Verificar condiciones
    if (!canScan) {
      console.log('❌ No puede escanear - canScan:', canScan);
      Alert.alert('No puedes escanear', `Estado: Premium=${isPremium}, Escaneos=${scanCount}. Usa el botón "Reset Escaneos" para continuar.`);
      return;
    }
    
    if (shouldShowPaywall) {
      console.log('❌ Paywall activo - shouldShowPaywall:', shouldShowPaywall);
      Alert.alert('Paywall activo', 'Usa el botón "Reset Escaneos" para continuar escaneando.');
      return;
    }
    
    if (analyzing) {
      console.log('❌ Ya está analizando - analyzing:', analyzing);
      return;
    }
    
    if (!cameraRef.current) {
      console.log('❌ No hay referencia a la cámara');
      Alert.alert('Error', 'La cámara no está lista. Intenta de nuevo.');
      return;
    }
    
    console.log('✅ Todas las condiciones pasaron, iniciando captura...');
    
    setAnalyzing(true);
    setResult(null);
    
    try {
      // PERF: Validate API before proceeding
      console.log('🔍 Validating API health...');
      const apiValidation = await validateApi();
      
      if (!apiValidation.overall) {
        const errorMessage = getApiErrorMessage(apiValidation.health);
        throw new Error(`API validation failed: ${errorMessage}`);
      }
      
      console.log('📸 Capturando imagen...');
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        exif: false,
        skipProcessing: true
      });
      
      if (!photo?.base64) {
        throw new Error('No se pudo capturar la imagen');
      }
      
      console.log('✅ Imagen capturada, preparando para API...');
      
      // PERF: Optimize image before upload
      const originalBlob = base64ToBlob(photo.base64, 'image/jpeg');
      console.log('📦 Original blob:', formatFileSize(originalBlob.size));
      
      const { blob: optimizedBlob, sizeReduction } = await optimizeImage(originalBlob, {
        maxDimension: 1024,
        quality: 0.8,
        format: 'webp'
      });
      
      console.log('📦 Optimized blob:', formatFileSize(optimizedBlob.size));
      if (sizeReduction > 0) {
        console.log('📦 Size reduction:', formatFileSize(sizeReduction));
      }
      
      // PERF: Use multipart form data with optimized image
      const formData = new FormData();
      formData.append('image', optimizedBlob, 'scan.webp');
      
      const requestUrl = `${config.backend.apiBaseUrl}/analyze`;
      console.log('🌐 Enviando a:', requestUrl);
      
      // PERF: Use timedFetch with retry logic
      const { res: response, ms: responseTime, requestId } = await retryFetch(requestUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        timeoutMs: 15000,
        maxRetries: 2
      });
      
      console.log(`📡 Response received in ${responseTime}ms, requestId: ${requestId}`);
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, response.statusText);
        throw new Error(`Error en el backend: ${response.status} - ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📡 Respuesta del servidor:', response.status, responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ API Success:', data);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        throw new Error('Respuesta del servidor no es JSON válido');
      }
      
      if (!data.success || !data.message) {
        throw new Error('La respuesta del backend no tiene el formato esperado');
      }
      
      // Muestra el resultado en pantalla
      setResult(data.message);
      console.log('📱 Resultado mostrado en UI:', data.message);
      
      // Incrementar el contador solo después de un escaneo exitoso
      const newCount = await incrementScanCount();
      if (!hasCompletedFirstScan) {
        await markFirstScanComplete();
      }

      // Guardar en historial
      await saveScanToHistory(
        data.machineName || 'Desconocida',
        photo.uri,
        data.message
      );
      
      // Mostrar el paywall después del segundo escaneo exitoso si no es premium
      if (!isPremium && newCount === 2) {
        showPaywall();
      }
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      
      // PERF: Show user-friendly error messages
      let userMessage = 'Error al analizar la imagen. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          userMessage = 'La solicitud tardó demasiado. Intenta con una imagen más pequeña.';
        } else if (error.message.includes('404')) {
          userMessage = 'API no encontrada. Contacta al soporte técnico.';
        } else if (error.message.includes('API validation failed')) {
          userMessage = 'Problema de conexión con el servidor. Verifica tu internet.';
        } else {
          userMessage = error.message;
        }
      }
      
      setResult(userMessage);
    } finally {
      setAnalyzing(false);
      console.log('🏁 Análisis completado');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handlePurchase = async (productId: string) => {
    try {
      console.log('Purchase initiated for:', productId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await setPremiumStatus(true);
      await hidePaywall(false);
      await resetScanCount();
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  };

  const handleRestore = async () => {
    try {
      console.log('Restore purchases initiated');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  };

  const handleTerms = () => {
    Linking.openURL('https://stoicdrop.com/terms-conditions');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://stoicdrop.com/privacy-policy');
  };

  const handleClosePaywall = () => {
    hidePaywall(true);
  };

  // PERF: Función para manejar captura de imagen desde web con optimizaciones
  const handleWebImageCapture = async (base64: string) => {
    console.log('📸 handleWebImageCapture started');
    
    if (!canScan) {
      Alert.alert('No puedes escanear', `Estado: Premium=${isPremium}, Escaneos=${scanCount}. Usa el botón "Reset Escaneos" para continuar.`);
      return;
    }
    
    if (shouldShowPaywall) {
      Alert.alert('Paywall activo', 'Usa el botón "Reset Escaneos" para continuar escaneando.');
      return;
    }
    
    setAnalyzing(true);
    setResult(null);
    
    try {
      // PERF: Validate API before proceeding
      console.log('🔍 Validating API health...');
      const apiValidation = await validateApi();
      
      if (!apiValidation.overall) {
        const errorMessage = getApiErrorMessage(apiValidation.health);
        throw new Error(`API validation failed: ${errorMessage}`);
      }
      
      console.log('✅ Imagen capturada desde web, preparando para API...');
      
      // PERF: Optimize image before upload
      const originalBlob = base64ToBlob(base64, 'image/jpeg');
      console.log('📦 Original blob:', formatFileSize(originalBlob.size));
      
      const { blob: optimizedBlob, sizeReduction } = await optimizeImage(originalBlob, {
        maxDimension: 1024,
        quality: 0.8,
        format: 'webp'
      });
      
      console.log('📦 Optimized blob:', formatFileSize(optimizedBlob.size));
      if (sizeReduction > 0) {
        console.log('📦 Size reduction:', formatFileSize(sizeReduction));
      }
      
      // PERF: Use multipart form data with optimized image
      const formData = new FormData();
      formData.append('image', optimizedBlob, 'scan.webp');
      
      const requestUrl = `${config.backend.apiBaseUrl}/analyze`;
      console.log('🌐 Enviando a:', requestUrl);
      
      // PERF: Use timedFetch with retry logic
      const { res: response, ms: responseTime, requestId } = await retryFetch(requestUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        timeoutMs: 15000,
        maxRetries: 2
      });
      
      console.log(`📡 Response received in ${responseTime}ms, requestId: ${requestId}`);
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, response.statusText);
        throw new Error(`Error en el backend: ${response.status} - ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📡 Respuesta del servidor:', response.status, responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ API Success:', data);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        throw new Error('Respuesta del servidor no es JSON válido');
      }
      
      if (data.success && data.result) {
        setResult(data.result);
        await incrementScanCount();
        markFirstScanComplete();
        console.log('✅ Análisis completado exitosamente');
      } else {
        throw new Error(data.error || 'Respuesta inesperada del servidor');
      }
      
    } catch (error) {
      console.error('❌ Error en handleWebImageCapture:', error);
      
      // PERF: Show user-friendly error messages
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'La solicitud tardó demasiado. Intenta con una imagen más pequeña.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API no encontrada. Contacta al soporte técnico.';
        } else if (error.message.includes('API validation failed')) {
          errorMessage = 'Problema de conexión con el servidor. Verifica tu internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  // Si es web y no tiene cámara, mostrar fallback
  if (isWeb && !webFeatures.hasCamera) {
    return (
      <View style={styles.container}>
        <WebCameraFallback
          onImageCaptured={(base64) => {
            // Procesar la imagen capturada desde web
            handleWebImageCapture(base64);
          }}
          onError={(error) => {
            Alert.alert('Error', error);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        {/* Scan Overlay - Title only */}
        <View style={styles.scanOverlay} pointerEvents="none">
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.scanTitleLine1}>SCAN YOUR</Text>
            <Text style={styles.scanTitleLine2}>GYM MACHINE</Text>
          </View>
        </View>
        
        {/* Dark overlay with transparent cutout */}
        <View style={styles.darkOverlay} pointerEvents="none">
          <View style={styles.overlayTop} />
          <View style={styles.overlayLeft} />
          <View style={styles.overlayRight} />
          <View style={styles.overlayBottom} />
          <View style={styles.transparentCutout} />
        </View>
        
        {/* Results and Controls */}
        <View style={styles.overlay} pointerEvents="box-none">
          {result && (
            <BlurView intensity={85} style={styles.resultContainer}>
              <Text style={styles.resultText}>{result}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setResult(null)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </BlurView>
          )}
          
          <View style={styles.controls}>
                         <TouchableOpacity
               style={styles.flipButton}
               onPress={() => {
                 console.log('🔄 Flip Camera button pressed!');
                 toggleCameraFacing();
               }}>
               <FlipCamera color="white" size={24} />
             </TouchableOpacity>
            

            
            {/* Debug buttons */}
            {__DEV__ && (
              <>
                <TouchableOpacity
                  style={styles.debugPaywallButton}
                  onPress={resetPaywallState}>
                  <Text style={styles.debugPaywallButtonText}>Reset Paywall</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.debugPremiumButton}
                  onPress={() => setPremiumStatus(true)}>
                  <Text style={styles.debugPremiumButtonText}>Make Premium</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.debugStatusButton}
                  onPress={() => {
                    Alert.alert('Estado Actual', `Premium: ${isPremium}\nScan Count: ${scanCount}\nCan Scan: ${canScan}\nShould Show Paywall: ${shouldShowPaywall}`);
                  }}>
                  <Text style={styles.debugStatusButtonText}>Status</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Scan counter indicator */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Scans: {isPremium ? '∞ (Premium)' : `${scanCount} (Free)`}
              </Text>
            </View>
          )}
        </View>
      </CameraView>

      {/* Instructions container - positioned above FAB with proper spacing */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.scanInstructionText}>
          Position the machine within the frame
        </Text>
        <Text style={styles.instructionSubtext}>
          Ensure good lighting for best results
        </Text>
      </View>

      {/* Botón de captura (FAB) */}
      <View style={[
        styles.captureContainer,
        {
          position: 'absolute',
          bottom: 56, // Tab bar height
          alignSelf: 'center',
          zIndex: 1000,
          elevation: 1000,
        }
      ]}>
        <CaptureButton
          onPress={handleCapture}
          disabled={analyzing || !canScan || shouldShowPaywall}
          testID="capture-btn"
          style={[
            styles.captureButton,
            analyzing && styles.capturing,
          ]}
        />
      </View>

      {/* Welcome Modal */}
      <Modal
        visible={showWelcomeModal}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.welcomeModalContainer}>
          <Animated.View 
            style={[
              styles.welcomeModalContent,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              }
            ]}
          >
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <View style={styles.welcomeInstructions}>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionEmoji}>👉</Text>
                <Text style={styles.instructionText}>Get close to the machine</Text>
              </View>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionEmoji}>📸</Text>
                <Text style={styles.instructionText}>Take a photo</Text>
              </View>
              <View style={styles.instructionRow}>
                <Text style={styles.instructionEmoji}>⏳</Text>
                <Text style={styles.instructionText}>Wait a few seconds</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.welcomeCloseButton}
              onPress={hideWelcomeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.welcomeCloseButtonText}>Got it!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* PaywallScreen */}
      <PaywallScreen
        visible={shouldShowPaywall}
        onClose={handleClosePaywall}
        onPurchase={handlePurchase}
        onRestore={handleRestore}
        onTerms={handleTerms}
        onPrivacy={handlePrivacy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    pointerEvents: 'auto',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00e676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturing: {
    backgroundColor: '#666',
  },
  flipButton: {
    position: 'absolute',
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00e676',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  closeButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: '#00e676',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 25,
  },
  debugText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },


  debugPaywallButton: {
    position: 'absolute',
    right: 20,
    top: 100,
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 25,
  },
  debugPaywallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  debugPremiumButton: {
    position: 'absolute',
    right: 20,
    top: 140,
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 25,
  },
  debugPremiumButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  debugStatusButton: {
    position: 'absolute',
    right: 20,
    top: 180,
    backgroundColor: 'rgba(0, 0, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 25,
  },
  debugStatusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Welcome Modal Styles
  welcomeModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 25,
    textAlign: 'center',
  },
  welcomeInstructions: {
    width: '100%',
    marginBottom: 30,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  instructionEmoji: {
    fontSize: 22,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#4a4a4a',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  welcomeCloseButton: {
    backgroundColor: '#00e676',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#00e676',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Scan Overlay Styles
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 140,
    zIndex: 5,
    pointerEvents: 'none',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
    flex: 0,
  },
  scanTitleLine1: {
    // TODO: Fine-tune exact font size if needed - currently increased by ~25% from 22 to 28
    fontSize: 28,
    fontFamily: 'Coolvetica, Arial, sans-serif',
    fontWeight: '700',
    color: '#00e676',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    marginBottom: 8,
  },
  scanTitleLine2: {
    // TODO: Fine-tune exact font size if needed - currently increased by ~25% from 22 to 28
    fontSize: 28,
    fontFamily: 'Coolvetica, Arial, sans-serif',
    fontWeight: '700',
    color: '#00e676',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  // Instructions container - positioned above FAB with proper spacing
  instructionsContainer: {
    position: 'absolute',
    bottom: FAB_SIZE + FAB_GAP + 56, // FAB size + gap + tab bar height
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 15,
  },
  scanInstructionText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 24,
  },
  instructionSubtext: {
    fontSize: 16,
    fontWeight: '400',
    color: '#cccccc',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 22,
    opacity: 0.85,
  },
  // Enhanced overlay styles
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayLeft: {
    position: 'absolute',
    top: 200,
    left: 0,
    width: 80,
    bottom: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayRight: {
    position: 'absolute',
    top: 200,
    right: 0,
    width: 80,
    bottom: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  transparentCutout: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 280,
    height: 280,
    marginTop: -140,
    marginLeft: -140,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
});