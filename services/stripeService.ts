import config from '../app/config';

export interface StripeCheckoutOptions {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface StripeCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export class StripeService {
  private static instance: StripeService;
  private isConfigured = false;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  private validateConfig(): void {
    if (!config.stripe.monthlyPriceId || !config.stripe.annualPriceId) {
      throw new Error('Stripe price IDs not configured. Please set EXPO_PUBLIC_STRIPE_PRICE_ID and EXPO_PUBLIC_STRIPE_PRICE_ID_YEA');
    }
  }

  async configure(): Promise<void> {
    try {
      this.validateConfig();
      this.isConfigured = true;
      console.log('✅ Stripe Service configured successfully');
      console.log('💳 Stripe Price IDs:', {
        monthly: config.stripe.monthlyPriceId,
        annual: config.stripe.annualPriceId
      });
    } catch (error) {
      console.error('❌ Failed to configure Stripe Service:', error);
      throw error;
    }
  }

  async createCheckoutSession(options: StripeCheckoutOptions): Promise<StripeCheckoutResult> {
    if (!this.isConfigured) {
      throw new Error('Stripe Service not configured');
    }

    try {
      // Validate the price ID matches our configured IDs
      const validPriceIds = [config.stripe.monthlyPriceId, config.stripe.annualPriceId];
      if (!validPriceIds.includes(options.priceId)) {
        throw new Error(`Invalid price ID: ${options.priceId}. Must be one of: ${validPriceIds.join(', ')}`);
      }

      console.log(`🛒 Creating Stripe checkout for price ID: ${options.priceId}`);

      // Create checkout session via backend
      const response = await fetch(`${config.backend.apiBaseUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: options.priceId,
          successUrl: options.successUrl,
          cancelUrl: options.cancelUrl,
          customerEmail: options.customerEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.checkoutUrl) {
        console.log('✅ Stripe checkout session created successfully');
        return {
          success: true,
          checkoutUrl: data.checkoutUrl,
        };
      } else {
        throw new Error('No checkout URL received from backend');
      }
    } catch (error) {
      console.error('❌ Failed to create Stripe checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async redirectToCheckout(checkoutUrl: string): Promise<void> {
    try {
      console.log('🔄 Redirecting to Stripe checkout...');
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('❌ Failed to redirect to checkout:', error);
      throw error;
    }
  }

  getPriceIdForProduct(productIdentifier: string): string {
    this.validateConfig();
    
    switch (productIdentifier) {
      case '$rc_monthly':
        return config.stripe.monthlyPriceId;
      case '$rc_annual':
        return config.stripe.annualPriceId;
      default:
        throw new Error(`Unknown product identifier: ${productIdentifier}`);
    }
  }
}

export default StripeService;





