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
import { X, Clock as Unlock, Image as ImageIcon, Zap, Star } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  FadeIn,
  SlideInUp,
  ZoomIn,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PricingOption {
  id: string;
  title: string;
  price: string;
  period: string;
  originalPrice?: string;
  badge?: string;
  savings?: string;
  benefit: string;
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
    id: 'monthly',
    title: 'Monthly',
    price: '$10',
    period: '/month',
    benefit: 'x10 more scans per month',
  },
  {
    id: 'annual',
    title: 'Annual',
    price: '$99',
    period: '/year',
    originalPrice: '$120',
    badge: 'Best Deal',
    savings: 'Save 17%',
    benefit: 'x10 more scans per month',
  },
];

const features = [
  {
    icon: Unlock,
    title: 'x10 more scans per month',
    description: 'Analyze unlimited gym equipment',
  },
  {
    icon: ImageIcon,
    title: 'No watermarks on AI results',
    description: 'Clean, professional analysis results',
  },
  {
    icon: Zap,
    title: 'Early access to new features',
    description: 'Be first to try latest updates',
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
  
  const pulseAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      pulseAnimation.value = withRepeat(
        withSpring(1.05, { duration: 1500 }),
        -1,
        true
      );
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    }
  }, [visible]);

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(glowAnimation.value, [0, 1], [0.4, 0.8]),
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

  const selectedPlan = pricingOptions.find(option => option.id === selectedOption);

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
              <Animated.View style={[styles.iconContainer, animatedPulseStyle]}>
                <Animated.View style={[styles.glowEffect, animatedGlowStyle]} />
                <LinearGradient
                  colors={['#00e676', '#00c853', '#1de9b6']}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Star color="#000000" size={28} fill="#000000" />
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.title}>Unlock Premium</Text>
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
                  <View style={styles.featureIconContainer}>
                    <feature.icon color="#00e676" size={18} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.featureText}>{feature.title}</Text>
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
                  entering={ZoomIn.delay(900 + index * 100)}
                >
                  <TouchableOpacity
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
                </Animated.View>
              ))}
            </Animated.View>

            {/* Trial Info */}
            <Animated.View 
              entering={FadeIn.delay(1200)}
              style={styles.trialInfo}
            >
              <Text style={styles.trialText}>
                Try 7 days for free. Cancel anytime.
              </Text>
            </Animated.View>

            {/* Purchase Button */}
            <Animated.View 
              entering={SlideInUp.delay(1400)}
              style={styles.buttonContainer}
            >
              <TouchableOpacity
                style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
                onPress={handlePurchase}
                disabled={purchasing || loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#00e676', '#00c853']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {purchasing ? (
                    <ActivityIndicator color="#000000" size="small" />
                  ) : (
                    <Text style={styles.purchaseButtonText}>Start Free Trial</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer Links */}
            <Animated.View 
              entering={FadeIn.delay(1600)}
              style={styles.footer}
            >
              <TouchableOpacity onPress={handleRestore} style={styles.footerButton}>
                <Text style={styles.footerLink}>Restore Purchases</Text>
              </TouchableOpacity>
              
              <View style={styles.footerSeparator}>
                <TouchableOpacity onPress={onTerms} style={styles.footerButton}>
                  <Text style={styles.footerLink}>Terms</Text>
                </TouchableOpacity>
                <Text style={styles.footerSeparatorText}> & </Text>
                <TouchableOpacity onPress={onPrivacy} style={styles.footerButton}>
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
    position: 'relative',
    marginBottom: 24,
  },
  glowEffect: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 50,
    backgroundColor: '#00e676',
    opacity: 0.4,
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
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  savingsText: {
    fontSize: 14,
    color: '#00e676',
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
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
  },
  trialInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trialText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  purchaseButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  footerLink: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  footerSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  footerSeparatorText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
});