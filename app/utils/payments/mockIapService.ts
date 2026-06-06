/**
 * Servicio simulado de In-App Purchases (no requiere react-native-iap)
 * Versión de desarrollo que simula compras para pruebas
 */
import { Platform } from 'react-native';
import { logger } from '../logger';

// Define los IDs de productos para iOS y Android
export const productIds = {
  PREMIUM_MONTHLY: Platform.select({
    ios: 'com.repsfinder.premium.monthly',
    android: 'com.repsfinder.premium.monthly',
    default: 'com.repsfinder.premium.monthly'
  }),
  PREMIUM_YEARLY: Platform.select({
    ios: 'com.repsfinder.premium.yearly',
    android: 'com.repsfinder.premium.yearly',
    default: 'com.repsfinder.premium.yearly'
  }),
  CREDITS_20: Platform.select({
    ios: 'com.repsfinder.credits.20',
    android: 'com.repsfinder.credits.20',
    default: 'com.repsfinder.credits.20'
  }),
  CREDITS_50: Platform.select({
    ios: 'com.repsfinder.credits.50',
    android: 'com.repsfinder.credits.50',
    default: 'com.repsfinder.credits.50'
  }),
  CREDITS_120: Platform.select({
    ios: 'com.repsfinder.credits.120',
    android: 'com.repsfinder.credits.120',
    default: 'com.repsfinder.credits.120'
  })
};

// Productos simulados para pruebas
const mockProducts = [
  {
    productId: productIds.PREMIUM_MONTHLY,
    title: 'Premium Mensual',
    description: 'Acceso Premium por 1 mes',
    price: '0.99',
    currency: 'EUR',
    localizedPrice: '0.99€'
  },
  {
    productId: productIds.PREMIUM_YEARLY,
    title: 'Premium Anual',
    description: 'Acceso Premium por 1 año',
    price: '4.99',
    currency: 'EUR',
    localizedPrice: '4.99€'
  },
  {
    productId: productIds.CREDITS_20,
    title: '20 Créditos',
    description: '20 créditos para usar en la app',
    price: '0.99',
    currency: 'EUR',
    localizedPrice: '0.99€'
  },
  {
    productId: productIds.CREDITS_50,
    title: '50 Créditos',
    description: '50 créditos para usar en la app',
    price: '1.99',
    currency: 'EUR',
    localizedPrice: '1.99€'
  },
  {
    productId: productIds.CREDITS_120,
    title: '120 Créditos',
    description: '120 créditos para usar en la app',
    price: '3.99',
    currency: 'EUR',
    localizedPrice: '3.99€'
  }
];

// Simula un delay para operaciones asíncronas
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Inicializa el servicio IAP
let isInitialized = false;

export async function initializeIAP() {
  if (isInitialized) return;
  
  await delay(500); // Simular inicialización
  
  isInitialized = true;
}

// Cierra la conexión al servicio IAP
export async function closeIAPConnection() {
  if (isInitialized) {
    await delay(200); // Simular cierre
    isInitialized = false;
  }
}

// Obtiene los productos disponibles
export async function getProducts() {
  await initializeIAP();
  
  await delay(800); // Simular latencia de red
  
  return mockProducts.filter(p => 
    p.productId === productIds.CREDITS_20 ||
    p.productId === productIds.CREDITS_50 ||
    p.productId === productIds.CREDITS_120
  );
}

// Obtiene las suscripciones disponibles
export async function getSubscriptions() {
  await initializeIAP();
  
  await delay(800); // Simular latencia de red
  
  return mockProducts.filter(p => 
    p.productId === productIds.PREMIUM_MONTHLY ||
    p.productId === productIds.PREMIUM_YEARLY
  );
}

// Realiza la compra de una suscripción
export async function purchaseSubscription(
  productId: string
): Promise<{ success: boolean; receipt?: string; error?: string; expiresAt: number | null }> {
  await initializeIAP();
  
  await delay(1500); // Simular proceso de compra
  
  // 10% de probabilidad de simular un error o cancelación
  const randomValue = Math.random();
  
  // Simular cancelación por usuario (5%)
  if (randomValue < 0.05) {
    return {
      success: false,
      error: 'Compra cancelada por el usuario',
      expiresAt: null
    };
  }
  
  // Simular error de pago (5%)
  if (randomValue < 0.1) {
    return {
      success: false,
      error: 'Error simulado en el proceso de compra',
      expiresAt: null
    };
  }
  
  // Compra exitosa (90%)
  
  // Calcular fecha de expiración
  const now = Date.now();
  // Para suscripción mensual, expira en 30 días. Para anual, en 365 días.
  const days = productId === productIds.PREMIUM_MONTHLY ? 30 : 365;
  const expiresAt = now + (days * 24 * 60 * 60 * 1000);
  
  return {
    success: true,
    receipt: `mock_receipt_${now}_${Math.random().toString(36).substring(2, 10)}`,
    expiresAt
  };
}

// Realiza la compra de productos consumibles (packs de créditos)
export async function purchaseCredits(
  productId: string
): Promise<{ success: boolean; credits: number; error?: string }> {
  await initializeIAP();
  
  await delay(1500); // Simular proceso de compra
  
  // Verificar si es un ID válido y obtener cantidad de créditos
  let credits = 0;
  if (productId === productIds.CREDITS_20) {
    credits = 20;
  } else if (productId === productIds.CREDITS_50) {
    credits = 50;
  } else if (productId === productIds.CREDITS_120) {
    credits = 120;
  } else {
    return {
      success: false,
      error: `ID de producto inválido: ${productId}`,
      credits: 0
    };
  }
  
  // 10% de probabilidad de simular un error o cancelación
  const randomValue = Math.random();
  
  // Simular cancelación por usuario (5%)
  if (randomValue < 0.05) {
    return {
      success: false,
      error: 'Compra cancelada por el usuario',
      credits: 0
    };
  }
  
  // Simular error de pago (5%)
  if (randomValue < 0.1) {
    return {
      success: false,
      error: 'Error simulado en el proceso de compra de créditos',
      credits: 0
    };
  }
  
  // Compra exitosa (90%)
  
  return {
    success: true,
    credits
  };
}

// Restaurar compras
export async function restorePurchases(): Promise<{ 
  success: boolean; 
  purchases: Array<{
    productId: string;
    transactionDate: number;
  }> 
}> {
  await initializeIAP();
  
  await delay(2000); // Simular proceso de restauración
  
  // 50% de probabilidad de simular que no hay compras
  if (Math.random() < 0.5) {
    return {
      success: true,
      purchases: []
    };
  }
  
  // Simular que se encuentra una suscripción activa
  const now = Date.now();
  const mockPurchases = [
    {
      productId: Math.random() < 0.5 ? productIds.PREMIUM_MONTHLY : productIds.PREMIUM_YEARLY,
      transactionDate: now - (7 * 24 * 60 * 60 * 1000) // 7 días atrás
    }
  ];
  
  return {
    success: true,
    purchases: mockPurchases
  };
}

// Obtener el precio formateado
export async function getFormattedPrices(): Promise<Record<string, string>> {
  await initializeIAP();
  
  await delay(500);
  
  // Crear mapa de ID a precio formateado
  const priceMap: Record<string, string> = {};
  
  mockProducts.forEach(product => {
    priceMap[product.productId] = product.localizedPrice;
  });
  
  return priceMap;
}
