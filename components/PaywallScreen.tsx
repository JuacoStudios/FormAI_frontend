import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Clock as Unlock, Image as ImageIcon, Zap, Star, CreditCard } from 'lucide-react-native';
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
import * as WebBrowser from 'expo-web-browser';
import { createCheckout, getProducts, API_BASE, getSubscriptionStatus, assertApiReachable, ENV_MONTHLY, ENV_ANNUAL, WEB_ORIGIN } from '../src/lib/api';
import { getIdentity, setUserEmail } from '../src/lib/identity';

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
  variantId?: string;
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
  // ALL HOOKS MUST BE DECLARED FIRST, BEFORE ANY CONDITIONAL LOGIC
  
  // State hooks
  const [selectedOption, setSelectedOption] = useState('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [monthlyId, setMonthlyId] = useState<string>('');
  const [annualId, setAnnualId] = useState<string>('');
  const [usingFallback, setUsingFallback] = useState(false);
  const [canSubscribe, setCanSubscribe] = useState(false);
  
  // Animation hooks
  const pulseAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  // Effect hooks
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
  }, [visible, pulseAnimation, glowAnimation]);

  // Initialize identity on mount
  useEffect(() => {
    const initIdentity = async () => {
      try {
        const identity = await getIdentity();
        setUserId(identity.userId);
        if (identity.email) {
          setUserEmail(identity.email);
        }
        console.debug('[Paywall] Identity initialized:', identity);
        
        // Check subscription status
        if (identity.userId) {
          try {
            const status = await getSubscriptionStatus(identity.userId);
            console.debug('[Paywall] Subscription status:', status);
            if (status.active) {
              console.debug('[Paywall] User is premium, closing paywall');
              onClose();
            }
          } catch (error) {
            console.warn('[Paywall] Error checking subscription status:', error);
          }
        }
      } catch (error) {
        console.error('[Paywall] Error initializing identity:', error);
      }
    };
    
    initIdentity();
  }, [onClose]);

  // API health check and preload Stripe prices on mount
  useEffect(() => {
    const initializeApi = async () => {
      // Check API reachability
      await assertApiReachable();
      
      // Preload Stripe prices
      await preloadStripePrices();
    };
    
    initializeApi();
  }, []);

  // Preload Stripe prices function
  const preloadStripePrices = async () => {
    try {
      setProductsLoading(true);
      const data = await getProducts();
      console.debug('[Paywall] Products loaded:', data);
      
      if (data.monthly && data.annual) {
        // Using API products
        setUsingFallback(false);
        setMonthlyId(data.monthly.id || '');
        setAnnualId(data.annual.id || '');
        
        console.debug('[Paywall] Using API prices:', { monthly: data.monthly.id, annual: data.annual.id });
      } else {
        // Using environment fallback
        setUsingFallback(true);
        setMonthlyId(data.monthly || '');
        setAnnualId(data.annual || '');
        
        console.debug('[Paywall] Using fallback env prices:', { monthly: data.monthly, annual: data.annual });
        
        if (!data.monthly || !data.annual) {
          console.warn('[Paywall] Missing environment price IDs');
        }
      }
      
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
      setUsingFallback(true);
      
      // Fallback to environment variables
      setMonthlyId(ENV_MONTHLY || '');
      setAnnualId(ENV_ANNUAL || '');
      
      console.debug('[Paywall] Fallback to env prices after error:', { monthly: ENV_MONTHLY, annual: ENV_ANNUAL });
    } finally {
      setProductsLoading(false);
    }
  };

  // Compute subscription availability
  useEffect(() => {
    const hasPrices = Boolean(monthlyId && annualId);
    const hasEmail = userEmail.trim().length > 0;
    const canSub = hasPrices && hasEmail;
    
    setCanSubscribe(Boolean(canSub));
    
    console.debug('[Paywall] Subscription availability computed:', {
      hasPrices,
      hasEmail,
      canSubscribe: canSub,
      monthlyId: !!monthlyId,
      annualId: !!annualId,
      userEmail: userEmail.trim().length
    });
  }, [monthlyId, annualId, userEmail]);

  // Animation style hooks
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

  // Callback hooks
  const handlePurchase = useCallback(async () => {
    const selectedPlan = pricingOptions.find(option => option.id === selectedOption);
    if (!selectedPlan?.variantId) {
      alert('No hay productos disponibles para comprar.');
      return;
    }
    
    setPurchasing(true);
    try {
      console.log(`🛒 Iniciando compra para: ${selectedPlan.title} (${selectedPlan.variantId})`);
      
      // Create checkout with Lemon Squeezy
      const checkoutResult = await createCheckout({ 
        priceId: selectedPlan.variantId,
        customerEmail: userEmail,
        userId: userId,
        successUrl: 'formai://purchase/success',
        cancelUrl: 'formai://purchase/cancel'
      });
      
      console.log('✅ Checkout creado exitosamente:', checkoutResult.url);
      
      // Open checkout in browser
      await WebBrowser.openBrowserAsync(checkoutResult.url);
      
      // Call onPurchase callback
      if (onPurchase) {
        await onPurchase(selectedPlan.id);
      }
      
    } catch (error: any) {
      console.error('❌ Error en la compra:', error);
      
      if (error.message.includes('Failed to create checkout')) {
        alert('Error al crear la sesión de pago. Intenta de nuevo o contacta al soporte.');
      } else {
        alert('Error al procesar la compra. Intenta de nuevo.');
      }
    } finally {
      setPurchasing(false);
    }
  }, [selectedOption, userEmail, userId, onPurchase]);

  // STRIPE: Handle Stripe subscription
  const handleStripeSubscribe = useCallback(async (plan: 'monthly' | 'annual') => {
    console.debug(`[Stripe] Subscribe ${plan} pressed`);
    
    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    const priceId = plan === 'monthly' ? monthlyId : annualId;
    
    if (!priceId) {
      console.warn('[Stripe] missing priceId for', plan);
      Alert.alert('Error', 'No Stripe priceId available. Check configuration.');
      return;
    }
    
    try {
      setStripeLoading(true);
      
      // Persist user email
      await setUserEmail(userEmail);
      console.debug('[Stripe] User email persisted:', userEmail);
      
      // Use web URLs derived from WEB_ORIGIN
      const successUrl = `${WEB_ORIGIN}/purchase/success`;
      const cancelUrl = `${WEB_ORIGIN}/purchase/cancel`;
      
      const payload = { 
        priceId, 
        customerEmail: userEmail, 
        userId: userId, 
        successUrl, 
        cancelUrl 
      };
      
      console.debug('[Paywall] WEB_ORIGIN:', WEB_ORIGIN);
      console.debug('[Stripe] createCheckout payload:', payload);
      
      const res = await createCheckout(payload);
      
      console.debug('[Stripe] checkout response:', res);
      
      if (!res.url) {
        Alert.alert('Error', 'Backend did not return a checkout URL');
        return;
      }
      
      console.debug('[Stripe] success url:', res.url);
      
      // Open checkout with WebBrowser
      try {
        const result = await WebBrowser.openBrowserAsync(res.url);
        console.debug('[Stripe] WebBrowser result:', result);
      } catch (e) {
        console.error('[Stripe] WebBrowser error:', e);
        Alert.alert('Error', 'Could not open checkout in browser');
      }
    } catch (err) {
      console.error('[Stripe] subscribe error:', err);
      Alert.alert('Error', 'Error creating Stripe checkout session. Check console for details.');
    } finally {
      setStripeLoading(false);
    }
  }, [monthlyId, annualId, userEmail, userId, WEB_ORIGIN]);

  const handleRestore = useCallback(async () => {
    try {
      await onRestore();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  }, [onRestore]);

  // Memoized computed values
  const selectedPlan = useMemo(() => 
    pricingOptions.find(option => option.id === selectedOption), 
    [selectedOption]
  );

  // RENDER LOGIC - NO MORE HOOKS AFTER THIS POINT
  
  // Early return check - but all hooks have been declared above
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
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{option.price}</Text>
                        <Text style={styles.period}>{option.period}</Text>
                      </View>
                      {option.originalPrice && (
                        <Text style={styles.savingsText}>{option.savings}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>

            {/* STRIPE: Stripe Subscription Section */}
            <Animated.View 
              entering={SlideInUp.delay(1100)}
              style={styles.stripeSection}
            >
              <View style={styles.sectionHeader}>
                <CreditCard size={24} color="#00e676" />
                <Text style={styles.sectionTitle}>Stripe Subscription</Text>
              </View>

              {/* Email Input */}

              {/* Email Input */}
              <View style={styles.emailSection}>
                <Text style={styles.emailLabel}>Email for subscription:</Text>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  value={userEmail}
                  onChangeText={setUserEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.stripeButton]}
                  onPress={() => handleStripeSubscribe('monthly')}
                  disabled={!canSubscribe || stripeLoading}
                >
                  {stripeLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <CreditCard size={20} color="#ffffff" />
                      <Text style={styles.buttonText}>Subscribe Monthly (Stripe)</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.stripeButton]}
                  onPress={() => handleStripeSubscribe('annual')}
                  disabled={!canSubscribe || stripeLoading}
                >
                  {stripeLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <CreditCard size={20} color="#ffffff" />
                      <Text style={styles.buttonText}>Subscribe Annual (Stripe)</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
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
                    <Text style={styles.purchaseButtonText}>Get Premium</Text>
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
                
                <View style={styles.separatorDot} />
                
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
  emailSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    textAlign: 'center',
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
  stripeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6772e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stripeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  diagnosticsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diagnosticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  diagnosticsText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#6772e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  statusContainer: {
    backgroundColor: 'rgba(103,114,229,0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(103,114,229,0.3)',
  },
  statusText: {
    fontSize: 14,
    color: '#6772e5',
    textAlign: 'center',
    marginBottom: 4,
  },
  stripeSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  separatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888888',
    marginHorizontal: 8,
  },

});