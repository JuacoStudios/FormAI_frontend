import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Star, CreditCard, Check } from 'lucide-react-native';
import Animated, {
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'annual') => Promise<void>;
  loading?: boolean;
}

const pricingOptions = [
  {
    id: 'monthly' as const,
    title: 'Monthly',
    price: '$10',
    period: '/month',
    description: 'Perfect for trying out premium features',
  },
  {
    id: 'annual' as const,
    title: 'Annual',
    price: '$99',
    period: '/year',
    originalPrice: '$120',
    badge: 'Best Deal',
    savings: 'Save 17%',
    description: 'Best value for regular users',
  },
];

const features = [
  'Unlimited equipment scans',
  'No watermarks on results',
  'Early access to new features',
  'Priority customer support',
];

export default function PaywallScreenNew({
  visible,
  onClose,
  onSubscribe,
  loading = false,
}: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setSubscribing(true);
      await onSubscribe(selectedPlan);
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to start subscription. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <BlurView intensity={30} style={styles.blurContainer}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Section */}
            <Animated.View 
              entering={FadeIn.delay(200)}
              style={styles.heroSection}
            >
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#00e676', '#00c853', '#1de9b6']}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Star color="#000000" size={28} fill="#000000" />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>Unlock Premium</Text>
              <Text style={styles.subtitle}>
                Get unlimited access to AI-powered gym equipment analysis
              </Text>
            </Animated.View>

            {/* Features */}
            <Animated.View 
              entering={SlideInUp.delay(400)}
              style={styles.featuresSection}
            >
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInUp.delay(500 + index * 100)}
                  style={styles.featureItem}
                >
                  <Check color="#00e676" size={18} strokeWidth={2.5} />
                  <Text style={styles.featureText}>{feature}</Text>
                </Animated.View>
              ))}
            </Animated.View>

            {/* Pricing Options */}
            <Animated.View 
              entering={SlideInUp.delay(800)}
              style={styles.pricingSection}
            >
              {pricingOptions.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={SlideInUp.delay(900 + index * 100)}
                >
                  <TouchableOpacity
                    style={[
                      styles.pricingOption,
                      selectedPlan === option.id && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedPlan(option.id)}
                    activeOpacity={0.8}
                  >
                    {option.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{option.badge}</Text>
                      </View>
                    )}
                    
                    <View style={styles.radioContainer}>
                      <View style={[
                        styles.radioButton,
                        selectedPlan === option.id && styles.radioSelected
                      ]}>
                        {selectedPlan === option.id && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.pricingContent}>
                      <Text style={styles.pricingTitle}>{option.title}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{option.price}</Text>
                        <Text style={styles.period}>{option.period}</Text>
                      </View>
                      {option.originalPrice && (
                        <Text style={styles.savingsText}>{option.savings}</Text>
                      )}
                      <Text style={styles.description}>{option.description}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>

            {/* Subscribe Button */}
            <Animated.View 
              entering={SlideInUp.delay(1200)}
              style={styles.buttonContainer}
            >
              <TouchableOpacity
                style={[styles.subscribeButton, subscribing && styles.subscribeButtonDisabled]}
                onPress={handleSubscribe}
                disabled={subscribing || loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#00e676', '#00c853']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {subscribing ? (
                    <ActivityIndicator color="#000000" size="small" />
                  ) : (
                    <>
                      <CreditCard size={20} color="#000000" />
                      <Text style={styles.subscribeButtonText}>
                        Subscribe {selectedPlan === 'monthly' ? 'Monthly' : 'Annually'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <Animated.View 
              entering={FadeIn.delay(1400)}
              style={styles.footer}
            >
              <Text style={styles.footerText}>
                Cancel anytime. Secure payment powered by Stripe.
              </Text>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 16,
    flex: 1,
  },
  pricingSection: {
    marginBottom: 32,
  },
  pricingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#00e676',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#00e676',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  radioContainer: {
    marginRight: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#00e676',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00e676',
  },
  pricingContent: {
    flex: 1,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  period: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
    marginLeft: 4,
  },
  savingsText: {
    fontSize: 14,
    color: '#00e676',
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  subscribeButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    flexDirection: 'row',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
});






