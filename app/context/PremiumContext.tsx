import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SubscriptionResult {
  success: boolean;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  restored: boolean;
}

interface AlertItem {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  triggerCount: number;
}

interface PremiumContextType {
  isPremium: boolean;
  subscription: string | null;
  alerts: AlertItem[];
  subscribe: (type: string) => Promise<SubscriptionResult>;
  cancelSubscription: () => Promise<void>;
  restorePurchases: () => Promise<RestoreResult>;
  canAccessAllStores: () => boolean;
  canCompareProducts: () => boolean;
}

const PremiumContext = createContext<PremiumContextType | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium] = useState(false);
  const [subscription] = useState<string | null>(null);

  const subscribe = useCallback(async (_type: string): Promise<SubscriptionResult> => {
    return { success: false, error: 'Not implemented' };
  }, []);

  const cancelSubscription = useCallback(async () => {}, []);

  const restorePurchases = useCallback(async (): Promise<RestoreResult> => {
    return { success: true, restored: false };
  }, []);

  const canAccessAllStores = useCallback(() => false, []);
  const canCompareProducts = useCallback(() => false, []);

  return (
    <PremiumContext.Provider value={{
      isPremium, subscription, alerts: [], subscribe, cancelSubscription,
      restorePurchases, canAccessAllStores, canCompareProducts,
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
