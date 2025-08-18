import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { Camera as CameraIcon, Camera as FlipCamera } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { config } from '../config';
import { usePaywall } from '@/hooks/usePaywall';
import PaywallScreen from '@/components/PaywallScreen';
import { Linking } from 'react-native';

// Storage key for tracking scan attempts
const SCAN_COUNT_KEY = 'scanAttemptCount';
const SCAN_HISTORY_KEY = 'scanHistory'; // NUEVO: clave para historial

// Helper function to convert base64 to Blob
const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg'): Blob => {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to binary string
    const binaryString = atob(cleanBase64);
    
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create Blob
    return new Blob([bytes], { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to Blob:', error);
    throw new Error('Failed to process image data');
  }
};

export default function ScanScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);
  const [showPaywallAfterScan, setShowPaywallAfterScan] = useState<boolean>(false);
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
    loadScanCount();
    checkDiagnosticCompletion();
    checkFirstTimeUser();
  }, []);

  // Check if this is the first time the user opens the app
  const checkFirstTimeUser = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        // Small delay to ensure camera is ready
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
      // Mark as seen in storage
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      
      // Animate out
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

  // Check if diagnostic wizard has been completed
  const checkDiagnosticCompletion = async () => {
    try {
      const completed = await AsyncStorage.getItem('diagnosticCompleted');
      if (completed !== 'true') {
        router.replace('../diagnostic');
      }
    } catch (error) {
      console.error('Error checking diagnostic completion:', error);
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
  // Call this function to reset the counter: resetScanCount()
  const resetScanCount = async () => {
    try {
      await AsyncStorage.removeItem(SCAN_COUNT_KEY);
      setScanCount(0);
      console.log('🔄 Scan count reset to 0');
    } catch (error) {
      console.error('Error resetting scan count:', error);
    }
  };

  // Utility function to check current scan count (for debugging)
  const checkScanCount = async () => {
    try {
      const storedCount = await AsyncStorage.getItem(SCAN_COUNT_KEY);
      const count = storedCount ? parseInt(storedCount, 10) : 0;
      console.log('🔍 Current scan count:', count);
      return count;
    } catch (error) {
      console.error('Error checking scan count:', error);
      return 0;
    }
  };

  // Guardar escaneo en historial
  const saveScanToHistory = async (machineName: string, imageUri: string, result: string) => {
    try {
      const timestamp = Date.now();
      const newScan = { id: timestamp, machineName, imageUri, result, timestamp };
      const historyRaw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      let history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(newScan); // Agrega al inicio
      if (history.length > 20) history = history.slice(0, 20); // Limita a 20
      await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error guardando historial de escaneos:', error);
    }
  };

  // For testing: Uncomment the line below to reset scan count on app start
  // useEffect(() => { resetScanCount(); }, []);

  const canScan = isPremium || scanCount < 2;

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera access to scan gym equipment</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Animación de feedback visual para el botón de captura
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
    console.log('handleCapture started');
    console.log('Estado actual:', { analyzing, canScan, shouldShowPaywall });
    
    // Feedback visual inmediato
    triggerButtonPulse();
    
    // Verificar condiciones
    if (!canScan) {
      console.log('❌ No puede escanear - canScan:', canScan);
      return;
    }
    
    if (shouldShowPaywall) {
      console.log('❌ Paywall activo - shouldShowPaywall:', shouldShowPaywall);
      return;
    }
    
    if (analyzing) {
      console.log('❌ Ya está analizando - analyzing:', analyzing);
      return;
    }
    
    if (!cameraRef.current) {
      console.log('❌ No hay referencia a la cámara');
      return;
    }
    
    console.log('✅ Todas las condiciones pasaron, iniciando captura...');
    
    setAnalyzing(true);
    setResult(null);
    
    try {
      console.log('cameraRef.current:', cameraRef.current);
      if (!cameraRef.current) {
        console.warn('cameraRef.current es null, la cámara no está lista');
        return;
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
      
      // Prepara la imagen para el backend
      const blob = base64ToBlob(photo.base64, 'image/jpeg');
      console.log('📦 Blob creado:', blob.size, 'bytes');
      
      const formData = new FormData();
      formData.append('image', blob, 'equipment.jpg');
      
      // Debug: verificar FormData
      console.log('📋 FormData creado con imagen de', blob.size, 'bytes');
      
      const requestUrl = `${config.backend.apiBaseUrl}/analyze`;
      console.log('🌐 Enviando a:', requestUrl);
      
      // Llama a la API y espera la respuesta
      const response = await fetch(requestUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const responseText = await response.text();
      console.log('📡 Respuesta del servidor:', response.status, responseText);
      console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, response.statusText);
        throw new Error(`Error en el backend: ${response.status} - ${responseText}`);
      }
      
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

      // Guardar en historial (usa la URI local de la foto y el resultado)
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
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      setResult(error instanceof Error ? error.message : 'Error al analizar la imagen. Por favor, intenta de nuevo.');
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
      // TODO: Implement RevenueCat purchase
      console.log('Purchase initiated for:', productId);
      
      // Mock successful purchase for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      await setPremiumStatus(true);
      await hidePaywall(false); // Don't mark as dismissed since purchase was successful
      
      // Reset scan count after successful purchase to give user more scans
      await resetScanCount();
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  };

  const handleRestore = async () => {
    try {
      // TODO: Implement RevenueCat restore
      console.log('Restore purchases initiated');
      
      // Mock restore for development
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
    hidePaywall(true); // Mark as dismissed
    setShowPaywallAfterScan(false);
  };

  console.log('shouldShowPaywall:', shouldShowPaywall);

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        <View style={styles.overlay}>
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
              onPress={toggleCameraFacing}>
              <FlipCamera color="white" size={24} />
            </TouchableOpacity>
            
            {/* Botón de reset de escaneos */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetScanCount}>
              <Text style={styles.resetButtonText}>Reset Escaneos</Text>
            </TouchableOpacity>
          </View>

          {/* Scan counter indicator (for testing) */}
          {__DEV__ && !isPremium && scanCount < 1 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Scans: {scanCount} (Free)
              </Text>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={resetScanCount}>
                <Text style={styles.debugButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
          {__DEV__ && isPremium && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Scans: ∞ (Premium)
              </Text>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={resetScanCount}>
                <Text style={styles.debugButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>

      {/* Botón de captura fuera del CameraView */}
      <TouchableOpacity
        style={[
          styles.captureButton,
          analyzing && styles.capturing,
          {
            position: 'absolute',
            bottom: 40,
            alignSelf: 'center',
            zIndex: 1000,
            elevation: 1000,
          }
        ]}
        onPress={handleCapture}
        // disabled={analyzing || !canScan || shouldShowPaywall} // Deshabilitado temporalmente para debug
        activeOpacity={0.7}
      >
        <CameraIcon color="white" size={32} />
      </TouchableOpacity>

      {/* Welcome Modal - shows only on first app launch */}
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

      {/* PaywallScreen is rendered as a full-screen modal, blocking interaction with the scanner */}
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
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
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
  },
  debugText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugButton: {
    backgroundColor: '#00e676',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '700',
  },
  resetButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resetButtonText: {
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
});