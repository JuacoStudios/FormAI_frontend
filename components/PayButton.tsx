import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View, Alert } from 'react-native';
import { createCheckoutSession } from '../src/lib/api';
import { USE_PAYMENT_LINKS, goToPayment, getPaymentUrl } from '../src/lib/payments';

interface PayButtonProps {
  plan?: 'monthly' | 'annual';
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PayButton({ 
  plan = 'monthly', 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onSuccess,
  onError 
}: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  const onPay = async () => {
    if (loading || disabled) return;
    
    // Use Payment Links when enabled
    if (USE_PAYMENT_LINKS) {
      const ok = goToPayment(plan);
      if (!ok) {
        Alert.alert('Error', 'Payment link is not configured. Please try again later.');
      }
      return;
    }
    
    setLoading(true);
    try {
      const { url, id } = await createCheckoutSession({ plan });
      
      if (url) {
        // Direct navigation works on mobile and desktop
        if (typeof window !== 'undefined') {
          window.location.assign(url);
        } else {
          // Fallback for React Native
          console.log('Checkout URL:', url);
          onSuccess?.();
        }
        return;
      }
      
      throw new Error('No checkout URL received');
    } catch (err: any) {
      console.error('Checkout error:', err);
      const errorMessage = err.message || 'We could not start your checkout. Please try again.';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`]
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPay}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? '#ffffff' : '#007AFF'} 
          />
          <Text style={[textStyles, styles.loadingText]}>Processing…</Text>
        </View>
      ) : (
        <Text style={textStyles}>
          {plan === 'annual' ? 'Upgrade Annual' : 'Upgrade Monthly'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#007AFF',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default PayButton;

