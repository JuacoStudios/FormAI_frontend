import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { usePaywall } from '../hooks/usePaywall';

export default function ThankYouPage() {
  const router = useRouter();
  const { entitlement, refreshEntitlement, loading } = usePaywall();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Refresh entitlement on mount to check subscription status
    refreshEntitlement();
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    await refreshEntitlement();
    setIsRetrying(false);
  };

  const handleContinue = () => {
    router.push('/');
  };

  const isActive = entitlement?.active;
  const isExpired = entitlement?.expiresAt && new Date(entitlement.expiresAt) < new Date();

  if (loading && !entitlement) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verificando suscripción...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isActive && !isExpired ? (
          // Success state
          <>
            <CheckCircle size={80} color="#10B981" style={styles.icon} />
            <Text style={styles.title}>¡Suscripción Activada!</Text>
            <Text style={styles.subtitle}>
              Tu suscripción premium está activa. Ahora puedes escanear equipos de gimnasio sin límites.
            </Text>
            {entitlement?.expiresAt && (
              <Text style={styles.expiryText}>
                Válida hasta: {new Date(entitlement.expiresAt).toLocaleDateString()}
              </Text>
            )}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continuar Escaneando</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Pending or error state
          <>
            <AlertCircle size={80} color="#F59E0B" style={styles.icon} />
            <Text style={styles.title}>Procesando Pago</Text>
            <Text style={styles.subtitle}>
              Estamos verificando tu pago. Esto puede tomar unos minutos.
            </Text>
            <Text style={styles.retryText}>
              Si has completado el pago, intenta actualizar la página.
            </Text>
            
            <TouchableOpacity 
              style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]} 
              onPress={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <RefreshCw size={20} color="#FFFFFF" />
              )}
              <Text style={styles.retryButtonText}>
                {isRetrying ? 'Verificando...' : 'Verificar Estado'}
              </Text>
            </TouchableOpacity>

            {retryCount > 0 && (
              <Text style={styles.retryCount}>
                Intentos: {retryCount}
              </Text>
            )}

            <TouchableOpacity style={styles.backButton} onPress={handleContinue}>
              <Text style={styles.backButtonText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  expiryText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 24,
  },
  retryText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  retryCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});
