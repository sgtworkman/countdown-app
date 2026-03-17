import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_STATUS_KEY = '@countdown_pro_status';
const ENTITLEMENT_ID = 'pro';
const PRO_PRODUCT_ID = 'com.dayspop.pro';

// RevenueCat API keys — replace with real keys before production
const REVENUECAT_IOS_KEY = 'YOUR_REVENUECAT_IOS_KEY';
const REVENUECAT_ANDROID_KEY = 'YOUR_REVENUECAT_ANDROID_KEY';

// Tip product IDs
const TIP_PRODUCTS: Record<string, string> = {
  coffee: 'com.dayspop.tip.coffee',
  cupcake: 'com.dayspop.tip.cupcake',
  pizza: 'com.dayspop.tip.pizza',
};

let isRevenueCatConfigured = false;

async function configureRevenueCat(): Promise<boolean> {
  if (isRevenueCatConfigured) return true;

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

  // Skip RevenueCat if keys aren't set (development mode)
  if (apiKey.startsWith('YOUR_')) {
    console.warn('[usePro] RevenueCat API key not set — running in mock mode');
    return false;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    await Purchases.configure({ apiKey });
    isRevenueCatConfigured = true;
    return true;
  } catch (err) {
    console.error('[usePro] Failed to configure RevenueCat:', err);
    return false;
  }
}

export interface ProStatus {
  isPro: boolean;
  loading: boolean;
}

export function usePro(): ProStatus & {
  purchasePro: () => Promise<boolean>;
  purchaseTip: (tier: 'coffee' | 'cupcake' | 'pizza') => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
} {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProStatus();
  }, []);

  const checkProStatus = async () => {
    try {
      const configured = await configureRevenueCat();

      if (configured) {
        // Production: check RevenueCat entitlements
        const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
        const hasPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        setIsPro(hasPro);

        // Sync local cache
        await AsyncStorage.setItem(PRO_STATUS_KEY, hasPro ? 'true' : 'false');
      } else {
        // Development fallback: check local flag
        const stored = await AsyncStorage.getItem(PRO_STATUS_KEY);
        if (stored === 'true') {
          setIsPro(true);
        }
      }
    } catch (err) {
      console.error('[usePro] Failed to check pro status:', err);
      // Fallback to cached status on network error
      const stored = await AsyncStorage.getItem(PRO_STATUS_KEY);
      if (stored === 'true') {
        setIsPro(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const purchasePro = useCallback(async (): Promise<boolean> => {
    try {
      const configured = await configureRevenueCat();

      if (configured) {
        // Production: use RevenueCat purchase flow
        const offerings = await Purchases.getOfferings();
        const proPackage: PurchasesPackage | undefined =
          offerings.current?.availablePackages.find(
            (pkg) => pkg.product.identifier === PRO_PRODUCT_ID
          ) ?? offerings.current?.availablePackages[0];

        if (!proPackage) {
          console.error('[usePro] No pro package found in offerings');
          return false;
        }

        const { customerInfo } = await Purchases.purchasePackage(proPackage);
        const hasPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        setIsPro(hasPro);
        await AsyncStorage.setItem(PRO_STATUS_KEY, hasPro ? 'true' : 'false');
        return hasPro;
      } else {
        // Development mock: always succeeds
        await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
        setIsPro(true);
        return true;
      }
    } catch (err: any) {
      if (err.userCancelled) {
        // User cancelled — not an error
        return false;
      }
      console.error('[usePro] Purchase failed:', err);
      return false;
    }
  }, []);

  const purchaseTip = useCallback(async (tier: 'coffee' | 'cupcake' | 'pizza'): Promise<boolean> => {
    try {
      const configured = await configureRevenueCat();

      if (configured) {
        const productId = TIP_PRODUCTS[tier];
        const products = await Purchases.getProducts([productId]);

        if (products.length === 0) {
          console.error(`[usePro] Tip product not found: ${productId}`);
          return false;
        }

        await Purchases.purchaseStoreProduct(products[0]);
        return true;
      } else {
        // Development mock
        console.log(`[usePro] Mock tip purchased: ${tier}`);
        return true;
      }
    } catch (err: any) {
      if (err.userCancelled) return false;
      console.error('[usePro] Tip purchase failed:', err);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const configured = await configureRevenueCat();

      if (configured) {
        const customerInfo: CustomerInfo = await Purchases.restorePurchases();
        const hasPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        setIsPro(hasPro);
        await AsyncStorage.setItem(PRO_STATUS_KEY, hasPro ? 'true' : 'false');
        return hasPro;
      } else {
        // Development fallback
        const stored = await AsyncStorage.getItem(PRO_STATUS_KEY);
        const hasPro = stored === 'true';
        setIsPro(hasPro);
        return hasPro;
      }
    } catch (err) {
      console.error('[usePro] Restore failed:', err);
      return false;
    }
  }, []);

  return {
    isPro,
    loading,
    purchasePro,
    purchaseTip,
    restorePurchases,
  };
}
