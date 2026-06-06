// ==================== PAYMENT SYSTEM ====================
// Sistema de pagos para RepsFinder utilizando In-App Purchases simuladas

import { Platform, Alert } from 'react-native';
import { logger } from './logger';
import * as iapService from './payments/mockIapService';

// Product IDs para iOS y Android - importados desde el servicio IAP simulado
export const PRODUCT_IDS = iapService.productIds;

// Inicializar el servicio de IAP cuando se importe este módulo
iapService.initializeIAP().catch(error => {
  logger.error('Error al inicializar el servicio de pagos:', error);
});

// Funciones para integrar con el sistema de pago real
export const purchaseProduct = async (productId: string): Promise<boolean> => {
  try {
    // Verificar si es un producto de créditos o suscripción
    if (
      productId === PRODUCT_IDS.CREDITS_20 ||
      productId === PRODUCT_IDS.CREDITS_50 ||
      productId === PRODUCT_IDS.CREDITS_120
    ) {
      // Es un pack de créditos
      const result = await iapService.purchaseCredits(productId);
      return result.success;
    } else {
      // Es una suscripción
      const result = await iapService.purchaseSubscription(productId);
      return result.success;
    }
  } catch (error) {
    logger.error('Error en la compra:', error);
    return false;
  }
}

export const restorePurchases = async (): Promise<string[]> => {
  try {
    // Restaurar compras usando el servicio IAP
    const result = await iapService.restorePurchases();
    
    // Devolver los IDs de producto de las suscripciones activas
    if (result.success) {
      return result.purchases.map(purchase => purchase.productId);
    }
    
    return [];
  } catch (error) {
    logger.error('Error al restaurar compras:', error);
    return [];
  }
}

// Validar recibo (para producción con App Store/Google Play)
export const validateReceipt = async (receipt: string): Promise<boolean> => {
  // Aquí iría la validación real con el servidor backend
  return true;
}

// Obtener precio formateado según la región
export const getFormattedPrice = async (productId: string): Promise<string> => {
  try {
    // Obtener precios reales desde las tiendas
    const prices = await iapService.getFormattedPrices();
    
    // Si tenemos el precio, lo devolvemos
    if (prices[productId]) {
      return prices[productId];
    }
    
    // Valores predeterminados si no se puede obtener el precio real
    switch (productId) {
      case PRODUCT_IDS.PREMIUM_MONTHLY:
        return '0.99€';
      case PRODUCT_IDS.PREMIUM_YEARLY:
        return '4.99€';
      case PRODUCT_IDS.CREDITS_20:
        return '0.99€';
      case PRODUCT_IDS.CREDITS_50:
        return '1.99€';
      case PRODUCT_IDS.CREDITS_120:
        return '3.99€';
      default:
        return '0.99€';
    }
  } catch (error) {
    logger.error('Error al obtener precio formateado:', error);
    
    // Valores por defecto en caso de error
    switch (productId) {
      case PRODUCT_IDS.PREMIUM_MONTHLY:
        return '0.99€';
      case PRODUCT_IDS.PREMIUM_YEARLY:
        return '4.99€';
      case PRODUCT_IDS.CREDITS_20:
        return '0.99€';
      case PRODUCT_IDS.CREDITS_50:
        return '1.99€';
      case PRODUCT_IDS.CREDITS_120:
        return '3.99€';
      default:
        return '0.99€';
    }
  }
}

// Calcular duración de la suscripción en milisegundos
export const getSubscriptionDuration = (type: 'monthly' | 'yearly'): number => {
  const now = Date.now();
  if (type === 'monthly') {
    // 30 días en milisegundos
    return now + (30 * 24 * 60 * 60 * 1000);
  } else {
    // 365 días en milisegundos
    return now + (365 * 24 * 60 * 60 * 1000);
  }
}

// Verificar si una suscripción ha expirado
export const hasSubscriptionExpired = (expiresAt: number | null): boolean => {
  if (!expiresAt) return true;
  return Date.now() > expiresAt;
}

// Interfaz para la suscripción premium
interface PremiumSubscriptionParams {
  type: 'monthly' | 'yearly';
  email: string;
  name: string;
}

interface SubscriptionResult {
  success: boolean;
  error?: string;
  expiresAt: number | null;
}

// Función para procesar suscripciones premium
export const purchasePremiumSubscription = async (params: PremiumSubscriptionParams): Promise<SubscriptionResult> => {
  try {
    const { type, email, name } = params;
    
    
    // Identificar el ID del producto correspondiente
    const productId = type === 'monthly' 
      ? PRODUCT_IDS.PREMIUM_MONTHLY 
      : PRODUCT_IDS.PREMIUM_YEARLY;
    
    // Realizar la compra real usando el servicio IAP
    const purchaseResult = await iapService.purchaseSubscription(productId);
    
    if (!purchaseResult.success) {
      return {
        success: false,
        error: purchaseResult.error || "La compra falló",
        expiresAt: null
      };
    }
    
    // Si la compra fue exitosa, registrar en tu backend
    // En una implementación real, enviarías el recibo a tu servidor para validación
    
    return {
      success: true,
      expiresAt: purchaseResult.expiresAt
    };
  } catch (error: any) {
    logger.error('Error al procesar la suscripción premium:', error);
    
    return {
      success: false,
      error: error?.message || "Error desconocido al procesar la suscripción",
      expiresAt: null
    };
  }
}

// ==================== BANK PAYMENT FUNCTIONS ====================

interface BankPaymentStatusResult {
  success: boolean;
  status: 'pending' | 'completed' | 'expired';
  error?: string;
}

interface NotifyBankPaymentParams {
  paymentId: string;
  reference: string;
  transferDate: string;
  senderName: string;
}

interface NotifyBankPaymentResult {
  success: boolean;
  estimatedTime?: string;
  error?: string;
}

export const checkBankPaymentStatus = async (paymentId: string, reference: string): Promise<BankPaymentStatusResult> => {
  try {
    
    // Simulación - en producción esto llamaría a un backend real
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular estado aleatorio para testing
    const randomStatus = Math.random();
    let status: 'pending' | 'completed' | 'expired' = 'pending';
    
    if (randomStatus > 0.8) {
      status = 'completed';
    } else if (randomStatus < 0.1) {
      status = 'expired';
    }
    
    return {
      success: true,
      status
    };
  } catch (error: any) {
    logger.error('Error checking bank payment status:', error);
    return {
      success: false,
      status: 'pending',
      error: error?.message || 'Error al verificar el pago'
    };
  }
};

export const notifyBankPaymentSent = async (params: NotifyBankPaymentParams): Promise<NotifyBankPaymentResult> => {
  try {
    const { paymentId, reference, transferDate, senderName } = params;
    
    
    // Simulación - en producción esto enviaría los datos a un backend real
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      estimatedTime: '24-48 horas'
    };
  } catch (error: any) {
    logger.error('Error notifying bank payment:', error);
    return {
      success: false,
      error: error?.message || 'Error al notificar el pago'
    };
  }
};