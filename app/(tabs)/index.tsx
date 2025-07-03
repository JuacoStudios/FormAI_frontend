import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { Camera as CameraIcon, Camera as FlipCamera } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';
import { usePaywall } from '@/hooks/usePaywall';
import PaywallScreen from '@/components/PaywallScreen';
import { Linking } from 'react-native';

// Storage key for tracking scan attempts
const SCAN_COUNT_KEY = 'scanAttemptCount';

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
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);
  const [showPaywallAfterScan, setShowPaywallAfterScan] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  
  const {
    shouldShowPaywall,
    isPremium,
    hasCompletedFirstScan,
    markFirstScanComplete,
    setPremiumStatus,
    hidePaywall,
    showPaywall,
  } = usePaywall();

  // Load scan count from AsyncStorage on component mount
  useEffect(() => {
    loadScanCount();
  }, []);

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

  // For testing: Uncomment the line below to reset scan count on app start
  // useEffect(() => { resetScanCount(); }, []);

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

  const handleCapture = async () => {
    // Si el usuario NO es premium y ya hizo al menos 1 escaneo, bloquear y mostrar paywall
    if (!isPremium && scanCount >= 1) {
      setShowPaywallAfterScan(true);
      showPaywall();
      setAnalyzing(false);
      return;
    }
    // Si es premium o es el primer escaneo, permitir escanear
    if (cameraRef.current && !analyzing) {
      setAnalyzing(true);
      setResult(null);
      try {
        const photo = await cameraRef.current?.takePictureAsync({
          base64: true,
          quality: 0.7,
          exif: false,
          skipProcessing: true
        });

        if (!photo?.base64) {
          throw new Error('No se pudo capturar la imagen');
        }

        console.log('Longitud de la imagen base64:', photo.base64.length);
        console.log('Configuración del backend:', {
          apiBaseUrl: config.backend.apiBaseUrl
        });

        // Convertir base64 a Blob para que multer pueda procesarlo
        const blob = base64ToBlob(photo.base64, 'image/jpeg');
        console.log('Blob creado:', blob.size, 'bytes');

        // Crear FormData con el Blob
        const formData = new FormData();
        formData.append('image', blob, 'equipment.jpg');

        // Mostrar los pares clave-valor de FormData (para debugging)
        // NOTA: FormData.entries() no está disponible en React Native, así que omitimos este log en producción
        // Puedes usar un polyfill o inspeccionar manualmente si es necesario
        // for (let [key, value] of formData.entries()) {
        //   console.log(`[FormData] ${key}:`, value);
        // }

        const requestUrl = `${config.backend.apiBaseUrl}/analyze`;
        console.log('🌐 Making request to:', requestUrl);
        
        console.log('Enviando solicitud al backend...');
        const response = await fetch(requestUrl, {
          method: 'POST',
          body: formData,
        });

        console.log('Estado de la respuesta:', response.status);
        const responseText = await response.text();
        console.log('Respuesta completa:', responseText);

        if (!response.ok) {
          throw new Error(`Error en el backend: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log('Datos parseados:', data);

        if (!data.success || !data.message) {
          throw new Error('La respuesta del backend no tiene el formato esperado');
        }

        setResult(data.message);
        
        // Incrementar el contador solo después de un escaneo exitoso
        const newCount = await incrementScanCount();
        // Marcar el primer escaneo como completo si aplica
        if (!hasCompletedFirstScan) {
          await markFirstScanComplete();
        }
        // Log para saber que el siguiente escaneo será bloqueado si no es premium
        if (!isPremium && newCount === 1) {
          console.log('⚠️ Next scan will trigger paywall');
        }
      } catch (error) {
        console.error('Error completo:', error);
        setResult(error instanceof Error ? error.message : 'Error al analizar la imagen. Por favor, intenta de nuevo.');
      } finally {
        setAnalyzing(false);
      }
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
    Linking.openURL('https://your-app.com/terms');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://your-app.com/privacy');
  };

  const handleClosePaywall = () => {
    hidePaywall(true); // Mark as dismissed
    setShowPaywallAfterScan(false);
  };

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
            
            <TouchableOpacity
              style={[styles.captureButton, analyzing && styles.capturing]}
              onPress={handleCapture}
              disabled={analyzing}>
              <CameraIcon color="white" size={32} />
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

      {/* PaywallScreen is rendered as a full-screen modal, blocking interaction with the scanner */}
      <PaywallScreen
        visible={shouldShowPaywall || showPaywallAfterScan}
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
});