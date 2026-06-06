import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AlertType = 'price_drop' | 'price_increase' | 'restock' | 'negative_reports' | 'new_batch' | 'trust_score_change';

export const ALERT_TYPE_LABELS: Record<AlertType, { label: string; icon: string }> = {
  price_drop: { label: 'Price Drop', icon: '💰' },
  price_increase: { label: 'Price Increase', icon: '📈' },
  restock: { label: 'Restock', icon: '📦' },
  negative_reports: { label: 'Negative Reports', icon: '⚠️' },
  new_batch: { label: 'New Batch', icon: '🆕' },
  trust_score_change: { label: 'Trust Score', icon: '⭐' },
};

interface AlertData {
  userId: string;
  name: string;
  type: AlertType;
  conditions?: Record<string, any>;
  isActive: boolean;
  notificationChannels: Record<string, boolean>;
  productName?: string;
}

interface Alert {
  id: string;
  name: string;
  type: AlertType;
  isActive: boolean;
  triggerCount: number;
  productName?: string;
}

interface Trigger {
  id: string;
  alertId: string;
  read: boolean;
  data: { message: string };
  triggeredAt: string;
}

interface AlertStats {
  activeAlerts: number;
  triggeredToday: number;
  triggeredThisWeek: number;
}

interface SmartAlertsContextType {
  alerts: Alert[];
  triggers: Trigger[];
  createAlert: (data: AlertData) => Promise<boolean>;
  deleteAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  canCreateAlert: () => boolean;
  getRemainingAlerts: () => number;
  getUnreadTriggers: () => Trigger[];
  markTriggerAsRead: (id: string) => void;
  getAlertStats: () => AlertStats;
}

const SmartAlertsContext = createContext<SmartAlertsContextType | null>(null);

export function SmartAlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);

  const createAlert = useCallback(async (_data: AlertData): Promise<boolean> => {
    return true;
  }, []);

  const deleteAlert = useCallback((_id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== _id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }, []);

  const canCreateAlert = useCallback(() => true, []);

  const getRemainingAlerts = useCallback(() => 5, []);

  const getUnreadTriggers = useCallback(() => triggers.filter(t => !t.read), [triggers]);

  const markTriggerAsRead = useCallback((id: string) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, read: true } : t));
  }, []);

  const getAlertStats = useCallback((): AlertStats => ({
    activeAlerts: alerts.filter(a => a.isActive).length,
    triggeredToday: 0,
    triggeredThisWeek: 0,
  }), [alerts]);

  return (
    <SmartAlertsContext.Provider value={{
      alerts, triggers, createAlert, deleteAlert, toggleAlert,
      canCreateAlert, getRemainingAlerts, getUnreadTriggers,
      markTriggerAsRead, getAlertStats,
    }}>
      {children}
    </SmartAlertsContext.Provider>
  );
}

export function useSmartAlerts(): SmartAlertsContextType {
  const context = useContext(SmartAlertsContext);
  if (!context) throw new Error('useSmartAlerts must be used within SmartAlertsProvider');
  return context;
}
