import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Modal, Platform, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera as CameraIcon, Camera as FlipCamera } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { usePaywall } from '@/hooks/usePaywall';
import PaywallScreenNew from '@/components/PaywallScreenNew';
import { usePlatform } from '@/hooks/usePlatform';
import WebCameraFallback from '@/components/WebCameraFallback';

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

export default function ScanScreenNew() {
  const router = useRouter();
  const { isWeb, webFeatures } = usePlatform();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [buttonScale] = useState(new Animated.Value(1));
  
  // Welcome modal states
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [modalOpacity] = useState(new Animated.Value(0));
  const [modalScale] = useState(new Animated.Value(0.8));
  
  const {
    isPremium,
    scansUsed,
    showPaywall,
    loading,
    performScan,
    subscribe,
    hidePaywall,
    refreshEntitlement,
  } = usePaywall();

  // Check if this is the first time the user opens the app
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
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
    
    checkFirstTimeUser();
  }, []);

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
      localStorage.setItem('hasSeenWelcome', 'true');
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
    console.log('📸 handleCapture started');
    
    // Feedback visual inmediato
    triggerButtonPulse();
    
    if (analyzing) {
      console.log('❌ Ya está analizando');
      return;
    }
    
    if (!cameraRef.current) {
      console.log('❌ No hay referencia a la cámara');
      Alert.alert('Error', 'La cámara no está lista. Intenta de nuevo.');
      return;
    }
    
    console.log('✅ Iniciando captura...');
    
    setAnalyzing(true);
    setResult(null);
    
    try {
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
      
      // Use the new performScan function from usePaywall
      await performScan(blob as any, (scanResult) => {
        setResult(scanResult.message);
        console.log('📱 Resultado mostrado en UI:', scanResult.message);
      });
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      setResult(error instanceof Error ? error.message : 'Error al analizar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setAnalyzing(false);
      console.log('🏁 Análisis completado');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    try {
      await subscribe(plan);
    } catch (error) {
      console.error('Subscription failed:', error);
      Alert.alert('Error', 'Failed to start subscription. Please try again.');
    }
  };

  const handleTerms = () => {
    window.open('https://stoicdrop.com/terms-conditions', '_blank');
  };

  const handlePrivacy = () => {
    window.open('https://stoicdrop.com/privacy-policy', '_blank');
  };

  const handleClosePaywall = () => {
    hidePaywall();
  };

  // Función para manejar captura de imagen desde web
  const handleWebImageCapture = async (base64: string) => {
    console.log('📸 handleWebImageCapture started');
    
    setAnalyzing(true);
    setResult(null);
    
    try {
      console.log('✅ Imagen capturada desde web, preparando para API...');
      
      // Prepara la imagen para el backend
      const blob = base64ToBlob(base64, 'image/jpeg');
      console.log('📦 Blob creado:', blob.size, 'bytes');
      
      // Use the new performScan function from usePaywall
      await performScan(blob as any, (scanResult) => {
        setResult(scanResult.message);
        console.log('✅ Análisis completado exitosamente');
      });
      
    } catch (error) {
      console.error('❌ Error en handleWebImageCapture:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

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
        {/* Scan Overlay */}
        <View style={styles.scanOverlay}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.scanTitleLine1}>SCAN YOUR</Text>
            <Text style={styles.scanTitleLine2}>GYM MACHINE</Text>
          </View>
          
          {/* Scan instructions */}
          <View style={styles.scanInstructions}>
            <Text style={styles.scanInstructionText}>Position the machine within the frame</Text>
            <Text style={styles.instructionSubtext}>Ensure good lighting for best results</Text>
          </View>
        </View>
        
        {/* Dark overlay with transparent cutout */}
        <View style={styles.darkOverlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayLeft} />
          <View style={styles.overlayRight} />
          <View style={styles.overlayBottom} />
          <View style={styles.transparentCutout} />
        </View>
        
        {/* Results and Controls */}
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
              onPress={() => {
                console.log('🔄 Flip Camera button pressed!');
                toggleCameraFacing();
              }}>
              <FlipCamera color="white" size={24} />
            </TouchableOpacity>
            
            {/* Scan counter indicator */}
            <View style={styles.scanCounter}>
              <Text style={styles.scanCounterText}>
                Scans: {isPremium ? '∞ (Premium)' : `${scansUsed}/1 (Free)`}
              </Text>
            </View>
          </View>
        </View>
      </CameraView>

      {/* Botón de captura */}
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
        disabled={analyzing || loading}
        activeOpacity={0.7}
      >
        <CameraIcon color="white" size={32} />
      </TouchableOpacity>

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
      <PaywallScreenNew
        visible={showPaywall}
        onClose={handleClosePaywall}
        onSubscribe={handleSubscribe}
        loading={loading}
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
    justifyContent: 'space-between',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  scanCounter: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 25,
  },
  scanCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 22,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#00e676',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  scanInstructions: {
    alignItems: 'center',
    paddingHorizontal: 30,
    flex: 0,
    marginTop: 20,
  },
  scanInstructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#cccccc',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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




