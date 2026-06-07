import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification } from '../src/types/premium';

const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  BACKGROUND: '#000',
  CARD_BG: '#0f0f0f',
  CARD_BG_LIGHT: '#1a1a1a',
  BORDER: '#222',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  GOLD: '#FFD700',
} as const;

const NOTIFICATIONS_STORAGE_KEY = '@app_notifications';

const NOTIFICATION_ICONS: Record<string, string> = {
  alert: '🚨',
  price_drop: '💰',
  restock: '📦',
  new_product: '🆕',
  system: '⚙️',
};

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setNotifications(parsed.sort((a: AppNotification, b: AppNotification) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [notifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const groupedNotifications = notifications.reduce((groups: Record<string, AppNotification[]>, notification: AppNotification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = t('today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = t('yesterday');
    } else {
      groupKey = date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'long',
      });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {} as Record<string, AppNotification[]>);

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 20 }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            🔔 {t('notificationsTitle')}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        {notifications.length > 0 && (
          <TouchableOpacity 
            onPress={markAllAsRead}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>
              {t('markAllRead')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {t('loading')}
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              {t('noNotifications')}
            </Text>
            <Text style={styles.emptyDesc}>
              {t('notificationsWillAppear')}
            </Text>
          </View>
        ) : (
          <>
            {Object.entries(groupedNotifications).map(([date, items]: [string, AppNotification[]]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                
                {items.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.read && styles.notificationCardUnread
                    ]}
                    onPress={() => markAsRead(notification.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.notificationIconContainer}>
                      <Text style={styles.notificationIcon}>
                        {NOTIFICATION_ICONS[notification.type] || '🔔'}
                      </Text>
                    </View>
                    
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {new Date(notification.createdAt).toLocaleTimeString(
                            i18n.language === 'es' ? 'es-ES' : 'en-US',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </Text>
                      </View>
                      
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAll}
            >
              <Text style={styles.clearButtonText}>
                {t('clearAll')}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  unreadBadge: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '800',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  dateGroup: {
    marginTop: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  notificationCardUnread: {
    backgroundColor: COLORS.CARD_BG_LIGHT,
    borderColor: COLORS.PRIMARY,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.CARD_BG_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
  },
  clearButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  clearButtonText: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});
