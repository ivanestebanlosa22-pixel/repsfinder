import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeRevenueCat,
  checkPremiumStatus as rcCheckPremium,
  purchasePackage,
  restorePurchases as rcRestore,
  setUserId,
  clearUserId,
  getProducts,
  RevenueCatProduct,
} from '../utils/payments/revenuecat';

const PREMIUM_DEBUG_KEY = 'repsfinder_premium_debug';

interface SubscriptionResult {
  success: boolean;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  restored: boolean;
}

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  subscription: string | null;
  subscribe: (type: 'monthly' | 'yearly') => Promise<SubscriptionResult>;
  cancelSubscription: () => Promise<void>;
  restorePurchases: () => Promise<RestoreResult>;
  products: RevenueCatProduct[];
  canAccessAllStores: () => boolean;
  canCompareProducts: () => boolean;
  remainingSearches: number;
  remainingAiQueries: number;
  togglePremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

const FREE_SEARCH_LIMIT = 5;
const FREE_AI_LIMIT = 10;

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rcReady, setRcReady] = useState(false);
  const [products, setProducts] = useState<RevenueCatProduct[]>([]);
  const [remainingSearches, setRemainingSearches] = useState(FREE_SEARCH_LIMIT);
  const [remainingAiQueries, setRemainingAiQueries] = useState(FREE_AI_LIMIT);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    // Check debug toggle first (persists across hot-reload)
    const debugPremium = await AsyncStorage.getItem(PREMIUM_DEBUG_KEY);
    if (debugPremium === 'true') {
      setIsPremium(true);
      setSubscription('premium_debug');
    }

    // Initialize RevenueCat
    const rcOk = await initializeRevenueCat();
    setRcReady(rcOk);

    if (rcOk) {
      // Log in user if session exists
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await setUserId(session.user.id);
      }

      // Check premium from RevenueCat
      const rcPremium = await rcCheckPremium();
      if (rcPremium) {
        setIsPremium(true);
        setSubscription('premium');
      }

      // Load products
      const prods = await getProducts();
      setProducts(prods);
    } else {
      // Fallback: check Supabase profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium, premium_expires_at')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_premium) {
          if (profile.premium_expires_at) {
            const expiresAt = new Date(profile.premium_expires_at).getTime();
            if (Date.now() < expiresAt) {
              setIsPremium(true);
              setSubscription('premium');
            }
          } else {
            setIsPremium(true);
            setSubscription('premium');
          }
        }
      }
    }

    setIsLoading(false);
  };

  const subscribe = useCallback(async (type: 'monthly' | 'yearly'): Promise<SubscriptionResult> => {
    if (!rcReady) {
      return { success: false, error: 'RevenueCat no está configurado. Añade EXPO_PUBLIC_REVENUECAT_API_KEY en .env' };
    }

    const identifier = type === 'monthly' ? 'premium_monthly' : 'premium_yearly';
    const result = await purchasePackage(identifier);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const rcPremium = await rcCheckPremium();
    if (rcPremium) {
      setIsPremium(true);
      setSubscription(type);
      return { success: true };
    }

    return { success: false, error: 'No se pudo verificar la suscripción' };
  }, [rcReady]);

  const cancelSubscription = useCallback(async () => {
    setIsPremium(false);
    setSubscription(null);
  }, []);

  const restorePurchases = useCallback(async (): Promise<RestoreResult> => {
    if (!rcReady) {
      return { success: false, restored: false };
    }

    const result = await rcRestore();
    if (result.success && result.customerInfo) {
      const isActive = result.customerInfo.entitlements.active['premium']?.isActive === true;
      if (isActive) {
        setIsPremium(true);
        setSubscription('premium');
        return { success: true, restored: true };
      }
    }
    return { success: true, restored: false };
  }, [rcReady]);

  const canAccessAllStores = useCallback(() => isPremium, [isPremium]);
  const canCompareProducts = useCallback(() => isPremium, [isPremium]);

  const togglePremium = useCallback(async () => {
    const next = !isPremium;
    setIsPremium(next);
    setSubscription(next ? 'premium_debug' : null);
    await AsyncStorage.setItem(PREMIUM_DEBUG_KEY, next ? 'true' : 'false');
  }, [isPremium]);

  return (
    <PremiumContext.Provider value={{
      isPremium,
      isLoading,
      subscription,
      products,
      subscribe,
      cancelSubscription,
      restorePurchases,
      canAccessAllStores,
      canCompareProducts,
      remainingSearches,
      remainingAiQueries,
      togglePremium,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextType {
  const context = useContext(PremiumContext);
  if (!context) throw new Error('usePremium must be used within PremiumProvider');
  return context;
}
