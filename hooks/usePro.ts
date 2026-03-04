import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat integration placeholder
// In production, replace with actual RevenueCat SDK calls
// import Purchases from 'react-native-purchases';

const PRO_STATUS_KEY = '@countdown_pro_status';

// RevenueCat API keys — set these before production
const REVENUECAT_IOS_KEY = 'YOUR_REVENUECAT_IOS_KEY';
const REVENUECAT_ANDROID_KEY = 'YOUR_REVENUECAT_ANDROID_KEY';

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
      // For development: check local flag
      const stored = await AsyncStorage.getItem(PRO_STATUS_KEY);
      if (stored === 'true') {
        setIsPro(true);
      }

      // In production, use RevenueCat:
      // const customerInfo = await Purchases.getCustomerInfo();
      // const hasPro = customerInfo.entitlements.active['pro'] !== undefined;
      // setIsPro(hasPro);
    } catch (err) {
      console.error('Failed to check pro status:', err);
    } finally {
      setLoading(false);
    }
  };

  const purchasePro = useCallback(async (): Promise<boolean> => {
    try {
      // In production, use RevenueCat:
      // const { customerInfo } = await Purchases.purchasePackage(proPackage);
      // const hasPro = customerInfo.entitlements.active['pro'] !== undefined;
      // setIsPro(hasPro);
      // return hasPro;

      // Development mock: always succeeds
      await AsyncStorage.setItem(PRO_STATUS_KEY, 'true');
      setIsPro(true);
      return true;
    } catch (err) {
      console.error('Purchase failed:', err);
      return false;
    }
  }, []);

  const purchaseTip = useCallback(async (tier: 'coffee' | 'cupcake' | 'pizza'): Promise<boolean> => {
    try {
      // In production, use RevenueCat consumable IAP:
      // const productId = TIP_PRODUCTS[tier];
      // await Purchases.purchaseStoreProduct(product);
      // return true;

      console.log(`Tip purchased: ${tier}`);
      return true;
    } catch (err) {
      console.error('Tip purchase failed:', err);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      // In production:
      // const customerInfo = await Purchases.restorePurchases();
      // const hasPro = customerInfo.entitlements.active['pro'] !== undefined;
      // setIsPro(hasPro);
      // return hasPro;

      const stored = await AsyncStorage.getItem(PRO_STATUS_KEY);
      const hasPro = stored === 'true';
      setIsPro(hasPro);
      return hasPro;
    } catch (err) {
      console.error('Restore failed:', err);
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
