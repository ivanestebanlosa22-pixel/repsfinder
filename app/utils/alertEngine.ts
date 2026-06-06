// ==================== ALERT ENGINE ====================
// Motor en background que ejecuta alertas automáticamente
// Sistema de cron job para monitorear cambios y enviar notificaciones

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

// Imports condicionales para compatibilidad
let Notifications: any = null;
let BackgroundFetch: any;
let TaskManager: any;

// En Expo Go (SDK 53+), no usar expo-notifications ya que no está soportado
const isExpoGo = typeof __DEV__ !== 'undefined' && __DEV__;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
  }
}

try {
  BackgroundFetch = require('expo-background-fetch');
} catch (e) {
}

try {
  TaskManager = require('expo-task-manager');
} catch (e) {
}

// ==================== TYPES ====================

export type AlertType = 
  | 'price_drop' 
  | 'price_increase' 
  | 'restock' 
  | 'negative_reports'
  | 'new_batch'
  | 'supplier_change';

export interface Alert {
  id: string;
  userId: string;
  name: string;
  type: AlertType;
  conditions: {
    productId?: string;
    sellerId?: string;
    priceThreshold?: number;
    category?: string;
  };
  isActive: boolean;
  notificationChannels: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  createdAt: number;
  triggerCount: number;
  lastTriggeredAt: number | null;
}

export interface AlertTrigger {
  id: string;
  alertId: string;
  userId: string;
  type: AlertType;
  triggeredAt: number;
  data: {
    message: string;
    oldValue?: any;
    newValue?: any;
    productId?: string;
    sellerId?: string;
  };
  isRead: boolean;
}

export interface ProductState {
  productId: string;
  price: number;
  stock: number;
  lastUpdated: number;
  sellerId: string;
}

export interface SellerState {
  sellerId: string;
  rating: number;
  negativeReports: number;
  supplierName: string;
  lastUpdated: number;
}

// ==================== CONSTANTS ====================

const ALERT_ENGINE_TASK = 'ALERT_ENGINE_BACKGROUND_TASK';
const ALERT_ENGINE_INTERVAL = 15; // minutos
const STORAGE_KEYS = {
  ALERTS: '@smart_alerts_v2',
  ALERT_TRIGGERS: '@alert_triggers',
  PRODUCT_STATE: '@alert_product_state',
  SELLER_STATE: '@alert_seller_state',
  ENGINE_LAST_RUN: '@alert_engine_last_run',
};

export const ALERT_TYPE_LABELS: Record<AlertType, { label: string; icon: string; description: string }> = {
  price_drop: {
    label: 'Bajada de Precio',
    icon: '⬇️',
    description: 'Notificar cuando el precio baje por debajo del umbral',
  },
  price_increase: {
    label: 'Subida de Precio',
    icon: '⬆️',
    description: 'Notificar cuando el precio suba por encima del umbral',
  },
  restock: {
    label: 'Restock',
    icon: '📦',
    description: 'Notificar cuando el producto vuelva a estar disponible',
  },
  negative_reports: {
    label: 'Reportes Negativos',
    icon: '⚠️',
    description: 'Alertar sobre aumento de reportes negativos del vendedor',
  },
  new_batch: {
    label: 'Nuevo Lote',
    icon: '🆕',
    description: 'Notificar cuando llegue nuevo stock del producto',
  },
  supplier_change: {
    label: 'Cambio de Proveedor',
    icon: '🔄',
    description: 'Alertar cuando el vendedor cambie de proveedor',
  },
};

// ==================== ALERT ENGINE CLASS ====================

class AlertEngine {
  private isRunning: boolean = false;
  private lastRun: number = 0;

  // ==================== INITIALIZATION ====================

  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

  async initialize(): Promise<void> {
    try {
      // Cargar última ejecución
      const lastRunData = await AsyncStorage.getItem(STORAGE_KEYS.ENGINE_LAST_RUN);
      if (lastRunData) {
        this.lastRun = parseInt(lastRunData, 10);
      }

      // Configurar notificaciones
      await this.setupNotifications();

      // Registrar tarea en background (si está disponible)
      await this.registerBackgroundTask();

      // Si no hay background tasks, usar foreground checks
      if (!BackgroundFetch || !TaskManager) {
        this.startForegroundChecks();
      }

    } catch (error) {
      logger.error('Error initializing Alert Engine:', error);
    }
  }

  private startForegroundChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Ejecutar inmediatamente
    this.runEngine();

    // Programar checks cada 2 minutos mientras la app está abierta
    this.checkInterval = setInterval(() => {
      this.runEngine();
    }, this.CHECK_INTERVAL_MS);

  }

  stopForegroundChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async setupNotifications(): Promise<void> {
    // No usar notificaciones en Expo Go (no soportado en SDK 53+)
    if (isExpoGo) {
      return;
    }
    
    if (!Notifications) {
      return;
    }
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions not granted');
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      logger.error('Error setting up notifications:', error);
    }
  }

  private async registerBackgroundTask(): Promise<void> {
    if (!BackgroundFetch || !TaskManager) {
      return;
    }

    try {
      // Definir la tarea
      TaskManager.defineTask(ALERT_ENGINE_TASK, async () => {
        try {
          await this.runEngine();
          return BackgroundFetch?.BackgroundFetchResult?.NewData || 'NewData';
        } catch (error) {
          logger.error('Background task error:', error);
          return BackgroundFetch?.BackgroundFetchResult?.Failed || 'Failed';
        }
      });

      // Registrar con intervalo
      await BackgroundFetch.registerTaskAsync(ALERT_ENGINE_TASK, {
        minimumInterval: ALERT_ENGINE_INTERVAL * 60, // segundos
        stopOnTerminate: false,
        startOnBoot: true,
      });

    } catch (error) {
      logger.error('Error registering background task:', error);
    }
  }

  // ==================== MAIN ENGINE LOOP ====================

  async runEngine(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {

      // 1. Cargar todas las alertas activas
      const alerts = await this.loadActiveAlerts();

      // 2. Cargar estados previos
      const productStates = await this.loadProductStates();
      const sellerStates = await this.loadSellerStates();

      // 3. Procesar cada alerta
      for (const alert of alerts) {
        await this.processAlert(alert, productStates, sellerStates);
      }

      // 4. Guardar estados actualizados
      await this.saveProductStates(productStates);
      await this.saveSellerStates(sellerStates);

      // 5. Actualizar timestamp
      this.lastRun = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.ENGINE_LAST_RUN, this.lastRun.toString());

      const duration = Date.now() - startTime;

    } catch (error) {
      logger.error('Error running Alert Engine:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // ==================== ALERT PROCESSING ====================

  private async processAlert(
    alert: Alert,
    productStates: Map<string, ProductState>,
    sellerStates: Map<string, SellerState>
  ): Promise<void> {
    try {
      switch (alert.type) {
        case 'price_drop':
          await this.checkPriceDrop(alert, productStates);
          break;
        case 'price_increase':
          await this.checkPriceIncrease(alert, productStates);
          break;
        case 'restock':
          await this.checkRestock(alert, productStates);
          break;
        case 'negative_reports':
          await this.checkNegativeReports(alert, sellerStates);
          break;
        case 'new_batch':
          await this.checkNewBatch(alert, productStates);
          break;
        case 'supplier_change':
          await this.checkSupplierChange(alert, sellerStates);
          break;
      }
    } catch (error) {
      logger.error(`Error processing alert ${alert.id}:`, error);
    }
  }

  private async checkPriceDrop(alert: Alert, productStates: Map<string, ProductState>): Promise<void> {
    if (!alert.conditions.productId || !alert.conditions.priceThreshold) return;

    const currentData = await this.fetchProductData(alert.conditions.productId);
    if (!currentData) return;

    const previousState = productStates.get(alert.conditions.productId);
    
    // Si el precio actual es menor que el umbral y no se había notificado antes
    if (currentData.price <= alert.conditions.priceThreshold) {
      if (!previousState || previousState.price > alert.conditions.priceThreshold) {
        await this.triggerAlert(alert, {
          message: `¡El precio ha bajado a ${currentData.price}! (Umbral: ${alert.conditions.priceThreshold})`,
          oldValue: previousState?.price,
          newValue: currentData.price,
          productId: alert.conditions.productId,
        });
      }
    }

    // Actualizar estado
    productStates.set(alert.conditions.productId, {
      productId: alert.conditions.productId,
      price: currentData.price,
      stock: currentData.stock,
      lastUpdated: Date.now(),
      sellerId: currentData.sellerId,
    });
  }

  private async checkPriceIncrease(alert: Alert, productStates: Map<string, ProductState>): Promise<void> {
    if (!alert.conditions.productId || !alert.conditions.priceThreshold) return;

    const currentData = await this.fetchProductData(alert.conditions.productId);
    if (!currentData) return;

    const previousState = productStates.get(alert.conditions.productId);
    
    if (currentData.price >= alert.conditions.priceThreshold) {
      if (!previousState || previousState.price < alert.conditions.priceThreshold) {
        await this.triggerAlert(alert, {
          message: `El precio ha subido a ${currentData.price} (Umbral: ${alert.conditions.priceThreshold})`,
          oldValue: previousState?.price,
          newValue: currentData.price,
          productId: alert.conditions.productId,
        });
      }
    }

    productStates.set(alert.conditions.productId, {
      productId: alert.conditions.productId,
      price: currentData.price,
      stock: currentData.stock,
      lastUpdated: Date.now(),
      sellerId: currentData.sellerId,
    });
  }

  private async checkRestock(alert: Alert, productStates: Map<string, ProductState>): Promise<void> {
    if (!alert.conditions.productId) return;

    const currentData = await this.fetchProductData(alert.conditions.productId);
    if (!currentData) return;

    const previousState = productStates.get(alert.conditions.productId);
    
    // Si ahora hay stock y antes no había (o no había registro)
    if (currentData.stock > 0) {
      if (!previousState || previousState.stock === 0) {
        await this.triggerAlert(alert, {
          message: `¡El producto está de nuevo en stock! (${currentData.stock} unidades)`,
          oldValue: previousState?.stock || 0,
          newValue: currentData.stock,
          productId: alert.conditions.productId,
        });
      }
    }

    productStates.set(alert.conditions.productId, {
      productId: alert.conditions.productId,
      price: currentData.price,
      stock: currentData.stock,
      lastUpdated: Date.now(),
      sellerId: currentData.sellerId,
    });
  }

  private async checkNegativeReports(alert: Alert, sellerStates: Map<string, SellerState>): Promise<void> {
    if (!alert.conditions.sellerId) return;

    const currentData = await this.fetchSellerData(alert.conditions.sellerId);
    if (!currentData) return;

    const previousState = sellerStates.get(alert.conditions.sellerId);
    
    // Detectar aumento significativo de reportes negativos (>20%)
    if (previousState) {
      const increase = currentData.negativeReports - previousState.negativeReports;
      const increasePercent = previousState.negativeReports > 0 
        ? (increase / previousState.negativeReports) * 100 
        : 0;

      if (increasePercent > 20 || increase >= 5) {
        await this.triggerAlert(alert, {
          message: `⚠️ Aumento de reportes negativos: +${increase} (${increasePercent.toFixed(1)}%)`,
          oldValue: previousState.negativeReports,
          newValue: currentData.negativeReports,
          sellerId: alert.conditions.sellerId,
        });
      }
    }

    sellerStates.set(alert.conditions.sellerId, {
      sellerId: alert.conditions.sellerId,
      rating: currentData.rating,
      negativeReports: currentData.negativeReports,
      supplierName: currentData.supplierName,
      lastUpdated: Date.now(),
    });
  }

  private async checkNewBatch(alert: Alert, productStates: Map<string, ProductState>): Promise<void> {
    if (!alert.conditions.productId) return;

    const currentData = await this.fetchProductData(alert.conditions.productId);
    if (!currentData) return;

    const previousState = productStates.get(alert.conditions.productId);
    
    // Detectar aumento significativo de stock (>100%)
    if (previousState && previousState.stock > 0) {
      const increase = currentData.stock - previousState.stock;
      const increasePercent = (increase / previousState.stock) * 100;

      if (increasePercent > 100 || increase > 50) {
        await this.triggerAlert(alert, {
          message: `🆕 Nuevo lote disponible: +${increase} unidades`,
          oldValue: previousState.stock,
          newValue: currentData.stock,
          productId: alert.conditions.productId,
        });
      }
    }

    productStates.set(alert.conditions.productId, {
      productId: alert.conditions.productId,
      price: currentData.price,
      stock: currentData.stock,
      lastUpdated: Date.now(),
      sellerId: currentData.sellerId,
    });
  }

  private async checkSupplierChange(alert: Alert, sellerStates: Map<string, SellerState>): Promise<void> {
    if (!alert.conditions.sellerId) return;

    const currentData = await this.fetchSellerData(alert.conditions.sellerId);
    if (!currentData) return;

    const previousState = sellerStates.get(alert.conditions.sellerId);
    
    if (previousState && previousState.supplierName !== currentData.supplierName) {
      await this.triggerAlert(alert, {
        message: `🔄 El vendedor cambió de proveedor: ${previousState.supplierName} → ${currentData.supplierName}`,
        oldValue: previousState.supplierName,
        newValue: currentData.supplierName,
        sellerId: alert.conditions.sellerId,
      });
    }

    sellerStates.set(alert.conditions.sellerId, {
      sellerId: alert.conditions.sellerId,
      rating: currentData.rating,
      negativeReports: currentData.negativeReports,
      supplierName: currentData.supplierName,
      lastUpdated: Date.now(),
    });
  }

  // ==================== DATA FETCHING (MOCK) ====================

  private async fetchProductData(productId: string): Promise<{ price: number; stock: number; sellerId: string } | null> {
    // En producción, esto llamaría a la API real
    // Por ahora, simulamos datos
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        price: Math.floor(Math.random() * 100) + 50,
        stock: Math.floor(Math.random() * 100),
        sellerId: `seller_${Math.floor(Math.random() * 100)}`,
      };
    } catch (error) {
      logger.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  }

  private async fetchSellerData(sellerId: string): Promise<{ rating: number; negativeReports: number; supplierName: string } | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const suppliers = ['Factory A', 'Factory B', 'Factory C', 'Original'];
      
      return {
        rating: Math.floor(Math.random() * 50) + 50, // 50-100
        negativeReports: Math.floor(Math.random() * 20),
        supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
      };
    } catch (error) {
      logger.error(`Error fetching seller ${sellerId}:`, error);
      return null;
    }
  }

  // ==================== ALERT TRIGGERING ====================

  private async triggerAlert(alert: Alert, data: AlertTrigger['data']): Promise<void> {
    try {
      // Crear trigger
      const trigger: AlertTrigger = {
        id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        alertId: alert.id,
        userId: alert.userId,
        type: alert.type,
        triggeredAt: Date.now(),
        data,
        isRead: false,
      };

      // Guardar trigger
      await this.saveTrigger(trigger);

      // Actualizar contador de alerta
      await this.updateAlertTriggerCount(alert.id);

      // Enviar notificaciones
      if (alert.notificationChannels.push) {
        await this.sendPushNotification(alert, data);
      }

    } catch (error) {
      logger.error('Error triggering alert:', error);
    }
  }

  private async sendPushNotification(alert: Alert, data: AlertTrigger['data']): Promise<void> {
    if (!Notifications) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ${ALERT_TYPE_LABELS[alert.type].label}`,
          body: data.message,
          data: { alertId: alert.id, type: alert.type },
        },
        trigger: null, // Enviar inmediatamente
      });
    } catch (error) {
      logger.error('Error sending push notification:', error);
    }
  }

  // ==================== STORAGE METHODS ====================

  private async loadActiveAlerts(): Promise<Alert[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
      if (!data) return [];
      
      const alerts: Alert[] = JSON.parse(data);
      return alerts.filter(a => a.isActive);
    } catch (error) {
      logger.error('Error loading alerts:', error);
      return [];
    }
  }

  private async loadProductStates(): Promise<Map<string, ProductState>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCT_STATE);
      if (!data) return new Map();
      
      const states: ProductState[] = JSON.parse(data);
      return new Map(states.map(s => [s.productId, s]));
    } catch (error) {
      logger.error('Error loading product states:', error);
      return new Map();
    }
  }

  private async saveProductStates(states: Map<string, ProductState>): Promise<void> {
    try {
      const data = JSON.stringify(Array.from(states.values()));
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCT_STATE, data);
    } catch (error) {
      logger.error('Error saving product states:', error);
    }
  }

  private async loadSellerStates(): Promise<Map<string, SellerState>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SELLER_STATE);
      if (!data) return new Map();
      
      const states: SellerState[] = JSON.parse(data);
      return new Map(states.map(s => [s.sellerId, s]));
    } catch (error) {
      logger.error('Error loading seller states:', error);
      return new Map();
    }
  }

  private async saveSellerStates(states: Map<string, SellerState>): Promise<void> {
    try {
      const data = JSON.stringify(Array.from(states.values()));
      await AsyncStorage.setItem(STORAGE_KEYS.SELLER_STATE, data);
    } catch (error) {
      logger.error('Error saving seller states:', error);
    }
  }

  private async saveTrigger(trigger: AlertTrigger): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERT_TRIGGERS);
      const triggers: AlertTrigger[] = data ? JSON.parse(data) : [];
      triggers.unshift(trigger); // Agregar al principio
      
      // Mantener solo los últimos 100 triggers
      if (triggers.length > 100) {
        triggers.splice(100);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.ALERT_TRIGGERS, JSON.stringify(triggers));
    } catch (error) {
      logger.error('Error saving trigger:', error);
    }
  }

  private async updateAlertTriggerCount(alertId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
      if (!data) return;
      
      const alerts: Alert[] = JSON.parse(data);
      const alertIndex = alerts.findIndex(a => a.id === alertId);
      
      if (alertIndex >= 0) {
        alerts[alertIndex].triggerCount++;
        alerts[alertIndex].lastTriggeredAt = Date.now();
        await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
      }
    } catch (error) {
      logger.error('Error updating alert trigger count:', error);
    }
  }

  // ==================== PUBLIC METHODS ====================

  async getTriggers(userId?: string): Promise<AlertTrigger[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERT_TRIGGERS);
      if (!data) return [];
      
      const triggers: AlertTrigger[] = JSON.parse(data);
      
      if (userId) {
        return triggers.filter(t => t.userId === userId);
      }
      
      return triggers;
    } catch (error) {
      logger.error('Error getting triggers:', error);
      return [];
    }
  }

  async getUnreadTriggers(userId?: string): Promise<AlertTrigger[]> {
    const triggers = await this.getTriggers(userId);
    return triggers.filter(t => !t.isRead);
  }

  async markTriggerAsRead(triggerId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERT_TRIGGERS);
      if (!data) return;
      
      const triggers: AlertTrigger[] = JSON.parse(data);
      const triggerIndex = triggers.findIndex(t => t.id === triggerId);
      
      if (triggerIndex >= 0) {
        triggers[triggerIndex].isRead = true;
        await AsyncStorage.setItem(STORAGE_KEYS.ALERT_TRIGGERS, JSON.stringify(triggers));
      }
    } catch (error) {
      logger.error('Error marking trigger as read:', error);
    }
  }

  async startManualCheck(): Promise<void> {
    await this.runEngine();
  }

  async start(): Promise<void> {
    await this.initialize();
  }

  async stop(): Promise<void> {
    // Detener foreground checks
    this.stopForegroundChecks();

    // Detener background tasks si están disponibles
    if (BackgroundFetch) {
      try {
        await BackgroundFetch.unregisterTaskAsync(ALERT_ENGINE_TASK);
      } catch (error) {
        logger.error('Error stopping background tasks:', error);
      }
    }

  }

  async forceCheck(): Promise<void> {
    await this.runEngine();
  }

  getStatus(): { isRunning: boolean; lastRun: number } {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
    };
  }
}

// ==================== SINGLETON INSTANCE ====================

export const alertEngine = new AlertEngine();

// ==================== HOOK ====================

export function useAlertEngine() {
  return {
    start: () => alertEngine.initialize(),
    stop: () => alertEngine.stop(),
    startManualCheck: () => alertEngine.startManualCheck(),
    getTriggers: (userId?: string) => alertEngine.getTriggers(userId),
    getUnreadTriggers: (userId?: string) => alertEngine.getUnreadTriggers(userId),
    markTriggerAsRead: (triggerId: string) => alertEngine.markTriggerAsRead(triggerId),
  };
}

export default alertEngine;
