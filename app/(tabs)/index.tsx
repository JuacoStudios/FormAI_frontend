import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { Camera as CameraIcon, Camera as FlipCamera } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { config } from '../config';

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

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

        // Limpiar el prefijo de la imagen base64 si existe
        const cleanBase64 = photo.base64.replace(/^data:image\/\w+;base64,/, '');
        
        console.log('Longitud de la imagen base64:', cleanBase64.length);
        console.log('Configuración del backend:', {
          apiBaseUrl: config.backend.apiBaseUrl
        });

        // Crear FormData para enviar la imagen al backend
        const formData = new FormData();
        formData.append('image', {
          uri: `data:image/jpeg;base64,${cleanBase64}`,
          type: 'image/jpeg',
          name: 'equipment.jpg'
        } as any);

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
        </View>
      </CameraView>
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
});