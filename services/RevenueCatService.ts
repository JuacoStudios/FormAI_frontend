// RevenueCat Service - Production-ready structure for native integration
// Note: This requires native code and won't work in Bolt's preview
// Developers need to export project and install RevenueCat SDK locally

interface PurchasePackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

interface CustomerInfo {
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  entitlements: {
    active: { [key: string]: any };
    all: { [key: string]: any };
  };
  originalPurchaseDate?: string;
  latestExpirationDate?: string;
}

interface PurchaseResult {
  customerInfo: CustomerInfo;
  productIdentifier: string;
}

class RevenueCatService {
  private static instance: RevenueCatService;
  private isConfigured = false;
  private userId?: string;

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async configure(apiKey: string, userId?: string): Promise<void> {
    try {
      // TODO: Initialize RevenueCat SDK
      // import Purchases from 'react-native-purchases';
      // await Purchases.configure({ apiKey, appUserID: userId });
      
      this.isConfigured = true;
      this.userId = userId;
      console.log('RevenueCat configured successfully');
      
      // Set up listener for customer info updates
      // Purchases.addCustomerInfoUpdateListener(this.handleCustomerInfoUpdate);
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      throw error;
    }
  }

  private handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
    // Handle real-time updates to customer info
    console.log('Customer info updated:', customerInfo);
  };

  async getOfferings(): Promise<PurchasePackage[]> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    try {
      // TODO: Get offerings from RevenueCat
      // import Purchases from 'react-native-purchases';
      // const offerings = await Purchases.getOfferings();
      // return offerings.current?.availablePackages || [];
      
      // Mock data for development - matches your pricing structure
      return [
        {
          identifier: 'monthly',
          packageType: 'MONTHLY',
          product: {
            identifier: 'premium_monthly',
            description: 'Premium Monthly Subscription - x10 more scans per month',
            title: 'Premium Monthly',
            price: 10.00,
            priceString: '$10.00',
            currencyCode: 'USD',
          },
        },
        {
          identifier: 'annual',
          packageType: 'ANNUAL',
          product: {
            identifier: 'premium_annual',
            description: 'Premium Annual Subscription - x10 more scans per month, Save 17%',
            title: 'Premium Annual',
            price: 99.00,
            priceString: '$99.00',
            currencyCode: 'USD',
          },
        },
      ];
    } catch (error) {
      console.error('Failed to get offerings:', error);
      throw error;
    }
  }

  async purchasePackage(packageIdentifier: string): Promise<PurchaseResult> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    try {
      // TODO: Purchase package
      // import Purchases from 'react-native-purchases';
      // const offerings = await Purchases.getOfferings();
      // const packageToPurchase = offerings.current?.availablePackages.find(
      //   pkg => pkg.identifier === packageIdentifier
      // );
      // 
      // if (!packageToPurchase) {
      //   throw new Error(`Package ${packageIdentifier} not found`);
      // }
      // 
      // const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
      // return { customerInfo, productIdentifier };
      
      // Mock successful purchase for development
      console.log(`Mock purchase for package: ${packageIdentifier}`);
      
      const mockCustomerInfo: CustomerInfo = {
        activeSubscriptions: [packageIdentifier],
        allPurchasedProductIdentifiers: [`premium_${packageIdentifier}`],
        entitlements: {
          active: { 
            premium: {
              identifier: 'premium',
              isActive: true,
              willRenew: true,
              productIdentifier: `premium_${packageIdentifier}`,
            }
          },
          all: { 
            premium: {
              identifier: 'premium',
              isActive: true,
              willRenew: true,
              productIdentifier: `premium_${packageIdentifier}`,
            }
          },
        },
        originalPurchaseDate: new Date().toISOString(),
        latestExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      return {
        customerInfo: mockCustomerInfo,
        productIdentifier: `premium_${packageIdentifier}`,
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    try {
      // TODO: Restore purchases
      // import Purchases from 'react-native-purchases';
      // const customerInfo = await Purchases.restorePurchases();
      // return customerInfo;
      
      // Mock restore for development
      console.log('Mock restore purchases');
      return {
        activeSubscriptions: [],
        allPurchasedProductIdentifiers: [],
        entitlements: {
          active: {},
          all: {},
        },
      };
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    try {
      // TODO: Get customer info
      // import Purchases from 'react-native-purchases';
      // const customerInfo = await Purchases.getCustomerInfo();
      // return customerInfo;
      
      // Mock customer info for development
      return {
        activeSubscriptions: [],
        allPurchasedProductIdentifiers: [],
        entitlements: {
          active: {},
          all: {},
        },
      };
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  async identifyUser(userId: string): Promise<CustomerInfo> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    try {
      // TODO: Identify user
      // import Purchases from 'react-native-purchases';
      // const { customerInfo } = await Purchases.logIn(userId);
      // this.userId = userId;
      // return customerInfo;
      
      console.log(`Mock identify user: ${userId}`);
      this.userId = userId;
      return await this.getCustomerInfo();
    } catch (error) {
      console.error('Failed to identify user:', error);
      throw error;
    }
  }

  async logOut(): Promise<CustomerInfo> {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }

    try {
      // TODO: Log out user
      // import Purchases from 'react-native-purchases';
      // const { customerInfo } = await Purchases.logOut();
      // this.userId = undefined;
      // return customerInfo;
      
      console.log('Mock log out user');
      this.userId = undefined;
      return await this.getCustomerInfo();
    } catch (error) {
      console.error('Failed to log out user:', error);
      throw error;
    }
  }

  isPremiumUser(customerInfo: CustomerInfo): boolean {
    return customerInfo.entitlements.active.premium !== undefined;
  }

  hasActiveSubscription(customerInfo: CustomerInfo): boolean {
    return customerInfo.activeSubscriptions.length > 0;
  }

  getActiveSubscriptionType(customerInfo: CustomerInfo): string | null {
    if (customerInfo.activeSubscriptions.length === 0) {
      return null;
    }
    
    const activeSubscription = customerInfo.activeSubscriptions[0];
    if (activeSubscription.includes('monthly')) return 'monthly';
    if (activeSubscription.includes('annual')) return 'annual';
    return activeSubscription;
  }

  // Utility method to check if user is in trial period
  isInTrialPeriod(customerInfo: CustomerInfo): boolean {
    const premiumEntitlement = customerInfo.entitlements.active.premium;
    if (!premiumEntitlement) return false;
    
    // TODO: Check trial status from RevenueCat
    // return premiumEntitlement.isInTrialPeriod;
    return false; // Mock implementation
  }

  // Get trial end date
  getTrialEndDate(customerInfo: CustomerInfo): Date | null {
    const premiumEntitlement = customerInfo.entitlements.active.premium;
    if (!premiumEntitlement) return null;
    
    // TODO: Get trial end date from RevenueCat
    // return new Date(premiumEntitlement.trialEndDate);
    return null; // Mock implementation
  }
}

export default RevenueCatService;