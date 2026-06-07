export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PremiumState {
  isPremium: boolean;
  isTrial: boolean;
  expiresAt?: Date;
}

export type SubscriptionTier = 'free' | 'trial' | 'monthly' | 'annual';

export const EARLY_ACCESS_HOURS = 48;

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  message?: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface TopProductCriteria {
  minRating: number;
  minSales: number;
  minPrice: number;
  maxPrice: number;
  minPhotos?: number;
  requireActive?: boolean;
}

export const DEFAULT_TOP_CRITERIA: TopProductCriteria = {
  minRating: 4.5,
  minSales: 100,
  minPrice: 10,
  maxPrice: 1000,
  minPhotos: 1,
  requireActive: true,
};
