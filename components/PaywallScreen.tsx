import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Check, Crown, Zap, Shield, Star, Download, Image as ImageIcon } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PricingOption {
  id: string;
  title: string;
  price: string;
  period: string;
  badge?: string;
  savings?: string;
}

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (productId: string) => Promise<void>;
  onRestore: () => Promise<void>;
  onTerms: () => void;
  onPrivacy: () => void;
  loading?: boolean;
}

const pricingOptions: PricingOption[] = [
  {
    id: 'weekly',
    title: 'Weekly',
    price: '$9.99',
    period: '/week',
  },
  {
    id: 'annual',
    title: 'Annual',
    price: '$119.99',
    period: '/year',
    badge: 'Best Deal',
    savings: 'Save 76%',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$19.99',
    period: '/month',
  },
];

const features = [
  {
    icon: ImageIcon,
    title: 'Unlimited image generations',
    description: 'Generate as many images as you want',
  },
  {
    icon: Download,
    title: 'High-quality downloads',
    description: 'Download in full resolution',
  },
  {
    icon: Shield,
    title: 'No watermarks',
    description: 'Clean images without branding',
  },
];

export default function PaywallScreen({
  visible,
  onClose,
  onPurchase,
  onRestore,
  onTerms,
  onPrivacy,
  loading = false,
}: PaywallProps) {
  const [selectedOption, setSelectedOption] = useState('annual');
  const [purchasing, setPurchasing] = useState(false);
  
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [visible]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(glowAnimation.value, [0, 1], [0.3, 0.8]),
    };
  });

  const handlePurchase = async () => {
    if (purchasing) return;
    
    setPurchasing(true);
    try {
      await onPurchase(selectedOption);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      await onRestore();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X color="#FFFFFF" size={24} />
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
                <Animated.View style={[styles.glowEffect, animatedGlowStyle]} />
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  style={styles.iconGradient}
                >
                  <Crown color="#FFFFFF" size={32} />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>Unlock Premium</Text>
              <Text style={styles.subtitle}>
                Get unlimited access to all premium features
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
                  <View style={styles.featureIcon}>
                    <feature.icon color="#6366F1" size={20} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <Check color="#10B981" size={20} />
                </Animated.View>
              ))}
            </Animated.View>

            {/* Pricing Options */}
            <Animated.View 
              entering={SlideInUp.delay(800)}
              style={styles.pricingSection}
            >
              {pricingOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.pricingOption,
                    selectedOption === option.id && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedOption(option.id)}
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
                      selectedOption === option.id && styles.radioSelected
                    ]}>
                      {selectedOption === option.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>

                  <View style={styles.pricingContent}>
                    <Text style={styles.pricingTitle}>{option.title}</Text>
                    {option.savings && (
                      <Text style={styles.savingsText}>{option.savings}</Text>
                    )}
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{option.price}</Text>
                    <Text style={styles.period}>{option.period}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>

            {/* Trial Info */}
            <Animated.View 
              entering={FadeIn.delay(1000)}
              style={styles.trialInfo}
            >
              <Text style={styles.trialText}>
                Try 7 days for free. Cancel anytime.
              </Text>
            </Animated.View>

            {/* Purchase Button */}
            <Animated.View 
              entering={SlideInUp.delay(1200)}
              style={styles.buttonContainer}
            >
              <TouchableOpacity
                style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
                onPress={handlePurchase}
                disabled={purchasing || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.buttonGradient}
                >
                  {purchasing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.purchaseButtonText}>Start Free Trial</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer Links */}
            <Animated.View 
              entering={FadeIn.delay(1400)}
              style={styles.footer}
            >
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerLink}>Restore Purchases</Text>
              </TouchableOpacity>
              
              <View style={styles.footerSeparator}>
                <TouchableOpacity onPress={onTerms}>
                  <Text style={styles.footerLink}>Terms</Text>
                </TouchableOpacity>
                <Text style={styles.footerSeparatorText}> & </Text>
                <TouchableOpacity onPress={onPrivacy}>
                  <Text style={styles.footerLink}>Privacy</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    opacity: 0.3,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: 30,
  },
  pricingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  radioContainer: {
    marginRight: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#6366F1',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },
  pricingContent: {
    flex: 1,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  savingsText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  period: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  trialInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trialText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerLink: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  footerSeparatorText: {
    fontSize: 14,
    color: '#6B7280',
  },
});