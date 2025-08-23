import config from '../app/config';
import StripeService from './stripeService';

export interface RevenueCatProduct {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
  stripePriceId: string;
  packageType: 'MONTHLY' | 'ANNUAL';
}

export interface RevenueCatOffering {
  identifier: string;
  availablePackages: RevenueCatProduct[];
}

export class RevenueCatWebService {
  private static instance: RevenueCatWebService;
  private isConfigured = false;
  private stripeService: StripeService;

  constructor() {
    this.stripeService = StripeService.getInstance();
  }

  static getInstance(): RevenueCatWebService {
    if (!RevenueCatWebService.instance) {
      RevenueCatWebService.instance = new RevenueCatWebService();
    }
    return RevenueCatWebService.instance;
  }

  private validateConfig(): void {
    if (!config.stripe.monthlyPriceId || !config.stripe.annualPriceId) {
      throw new Error('Stripe price IDs not configured. Please set EXPO_PUBLIC_STRIPE_PRICE_ID and EXPO_PUBLIC_STRIPE_PRICE_ID_YEA');
    }
  }

  async configure(): Promise<void> {
    try {
      this.validateConfig();
      
      // Configure both services
      await this.stripeService.configure();
      
      this.isConfigured = true;
      console.log('✅ RevenueCat Web Service configured successfully');
      console.log('📦 Stripe Products:', {
        monthly: config.stripe.monthlyPriceId,
        annual: config.stripe.annualPriceId
      });
    } catch (error) {
      console.error('❌ Failed to configure RevenueCat Web Service:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<RevenueCatOffering> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat Web Service not configured');
    }

    this.validateConfig();

    // Create offerings based on environment variables
    const offerings: RevenueCatOffering = {
      identifier: 'default',
      availablePackages: [
        {
          identifier: config.revenuecat.monthlyProductId,
          title: 'Premium Monthly',
          description: 'Premium Monthly Subscription - x10 more scans per month',
          price: 10.00,
          priceString: '$10.00',
          currencyCode: 'USD',
          stripePriceId: config.stripe.monthlyPriceId,
          packageType: 'MONTHLY',
        },
        {
          identifier: config.revenuecat.annualProductId,
          title: 'Premium Annual',
          description: 'Premium Annual Subscription - x10 more scans per month, Save 17%',
          price: 99.00,
          priceString: '$99.00',
          currencyCode: 'USD',
          stripePriceId: config.stripe.annualPriceId,
          packageType: 'ANNUAL',
        },
      ],
    };

    console.log('📦 Generated RevenueCat offerings:', offerings);
    return offerings;
  }

  async purchaseProduct(productIdentifier: string): Promise<{ success: boolean; productId: string; checkoutUrl?: string }> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat Web Service not configured');
    }

    try {
      const offerings = await this.getOfferings();
      const product = offerings.availablePackages.find(pkg => pkg.identifier === productIdentifier);

      if (!product) {
        throw new Error(`Product ${productIdentifier} not found`);
      }

      console.log(`🛒 Initiating Stripe checkout for ${product.title} (${product.stripePriceId})`);
      
      // Get the current URL for success/cancel redirects
      const currentUrl = window.location.href;
      const successUrl = `${currentUrl}?checkout=success&product=${productIdentifier}`;
      const cancelUrl = `${currentUrl}?checkout=cancelled`;

      // Create Stripe checkout session
      const checkoutResult = await this.stripeService.createCheckoutSession({
        priceId: product.stripePriceId,
        successUrl,
        cancelUrl,
      });

      if (checkoutResult.success && checkoutResult.checkoutUrl) {
        console.log('✅ Stripe checkout session created, redirecting...');
        
        // Redirect to Stripe checkout
        await this.stripeService.redirectToCheckout(checkoutResult.checkoutUrl);
        
        return {
          success: true,
          productId: product.stripePriceId,
          checkoutUrl: checkoutResult.checkoutUrl,
        };
      } else {
        throw new Error(checkoutResult.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  }
}

export default RevenueCatWebService;
