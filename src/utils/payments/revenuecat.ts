import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { logger } from '../logger';

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

export type RevenueCatProduct = {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
};

type PurchaseResult = {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
};

export async function initializeRevenueCat(): Promise<boolean> {
  if (!RC_API_KEY) {
    logger.warn('RevenueCat: no API key configured');
    return false;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey: RC_API_KEY });
    logger.info('RevenueCat initialized');
    return true;
  } catch (error) {
    logger.error('RevenueCat init failed:', error);
    return false;
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    logger.error('RevenueCat getOfferings error:', error);
    return null;
  }
}

export async function getProducts(): Promise<RevenueCatProduct[]> {
  const offering = await getOfferings();
  if (!offering?.availablePackages) return [];

  return offering.availablePackages
    .filter(pkg => pkg.product.identifier.includes('com.repsfinder.premium'))
    .map(pkg => {
      const id = pkg.product.identifier;
      const simplified = id.includes('monthly') ? 'premium_monthly' : 'premium_yearly';
      return {
        identifier: simplified,
        title: pkg.product.title,
        description: pkg.product.description,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
      };
    });
}

export async function purchasePackage(simpleId: string): Promise<PurchaseResult> {
  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.current;
    if (!offering) {
      return { success: false, error: 'No hay ofertas disponibles' };
    }

    const searchKey = simpleId === 'premium_monthly' ? 'monthly' : 'yearly';
    const pkg = offering.availablePackages.find(
      p => p.product.identifier.includes(`premium.${searchKey}`)
    );
    if (!pkg) {
      return { success: false, error: 'Producto no encontrado' };
    }

    const result = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo: result.customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'Compra cancelada por el usuario' };
    }
    logger.error('RevenueCat purchase error:', error);
    return { success: false, error: error?.message || 'Error al procesar compra' };
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return hasActivePremium(customerInfo);
  } catch {
    return false;
  }
}

export function hasActivePremium(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active['premium']?.isActive === true;
}

export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error: any) {
    logger.error('RevenueCat restore error:', error);
    return { success: false, error: error?.message || 'Error al restaurar compras' };
  }
}

export async function setUserId(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    logger.error('RevenueCat setUserId error:', error);
  }
}

export async function clearUserId(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    logger.error('RevenueCat clearUserId error:', error);
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}
