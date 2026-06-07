// ==================== PREMIUM HOME MODAL ====================
// Modal principal de acceso a funciones Premium - DISEÑO PREMIUM

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePremium } from '../../context/PremiumContext';
import { useSmartAlerts } from '../../context/SmartAlertsContext';

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
  GOLD_LIGHT: '#FFA500',
} as const;

interface PremiumHomeModalProps {
  visible: boolean;
  onClose: () => void;
  productsCount: number;
  onShowTopProducts: () => void;
  onManageSubscription?: () => void;
}

const NOTIFICATIONS_STORAGE_KEY = '@app_notifications';

export const PremiumHomeModal: React.FC<PremiumHomeModalProps> = ({
  visible,
  onClose,
  productsCount,
  onShowTopProducts,
  onManageSubscription,
}) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isPremium } = usePremium();
  const { alerts: smartAlerts, getUnreadTriggers } = useSmartAlerts();
  const { height } = useWindowDimensions();
  
  const [language, setLanguage] = useState('es');
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n]);
  
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (data) {
          setNotifications(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

   const unreadNotifications = notifications.filter(n => !n.read).length;
   const activeAlertsCount = smartAlerts.filter(a => a.isActive).length;
   const recentNotifications = notifications
     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(0, 3);

  const benefits = t('premiumBenefitsList', { returnObjects: true }) as any[];
  const benefitsList = Array.isArray(benefits) ? benefits : [];

  const handleViewAllNotifications = () => {
    onClose();
    router.push('/notifications');
  };

  const handleViewAlerts = () => {
    onClose();
    router.push('/alerts');
  };

const handleGoPremium = () => {
    if (onManageSubscription) {
      onManageSubscription();
    } else {
      onClose();
      router.push('/premium');
    }
  };

  const modalStyle = { maxHeight: height * 0.9 };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={[styles.modalContent, modalStyle]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* HEADER PREMIUM */}
            <View style={styles.header}>
               <View>
                 <Text style={styles.title}>{t('appName')}</Text>
                 <View style={styles.premiumBadge}>
                   <Text style={styles.premiumBadgeText}>{t('premiumBadgeText')}</Text>
                 </View>
               </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* STATUS CARD */}
            <LinearGradient
              colors={isPremium ? ['#00d4aa', '#0066FF'] : ['#1a1a1a', '#0f0f0f']}
              style={styles.statusCard}
            >
              <View style={styles.statusContent}>
                <Text style={styles.statusIcon}>{isPremium ? '✨' : '👑'}</Text>
                <Text style={styles.statusTitle}>
                   {isPremium ? t('premiumStatusActive') : t('premiumStatusInactive')}
                 </Text>
                 <Text style={styles.statusDesc}>
                   {isPremium ? t('premiumDescActive') : t('premiumDescInactive')}
                 </Text>
                
                 {!isPremium && (
                   <TouchableOpacity style={styles.upgradeBtn} onPress={handleGoPremium}>
                      <LinearGradient
                        colors={['#0066FF', '#FF3366']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.upgradeGradient}
                      >
                        <Text style={styles.upgradeText}>
                          {t('viewPlans')}
                        </Text>
                      </LinearGradient>
                   </TouchableOpacity>
                 )}
              </View>
            </LinearGradient>

            {/* BENEFICIOS PREMIUM */}
             {!isPremium && (
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>
                   ✨ {t('benefitsTitle')}
                 </Text>
            <View style={styles.benefitsContainer}>
              {benefitsList.map((benefit: any) => (
                <View key={benefit.title || benefit} style={styles.benefitRow}>
                       <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                       <View style={styles.benefitTextContainer}>
                         <Text style={styles.benefitTitle}>{benefit.title}</Text>
                         <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                       </View>
                     </View>
                   ))}
                 </View>
               </View>
             )}

             {/* NOTIFICACIONES */}
             <View style={styles.section}>
               <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>🔔 {t('notificationsTitle')}</Text>
                {unreadNotifications > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadNotifications}</Text>
                  </View>
                )}
              </View>
              
              {recentNotifications.length > 0 ? (
                <View style={styles.notificationsList}>
                  {recentNotifications.map((notification) => (
                    <View 
                      key={notification.id} 
                      style={[styles.notificationItem, !notification.read && styles.notificationUnread]}
                    >
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                      </Text>
                    </View>
                  ))}
                  
                   <TouchableOpacity
                     style={styles.viewAllButton}
                     onPress={handleViewAllNotifications}
                   >
                     <Text style={styles.viewAllText}>
                       {t('viewAll')}
                     </Text>
                   </TouchableOpacity>
                </View>
              ) : (
                 <View style={styles.emptyState}>
                   <Text style={styles.emptyStateText}>
                     {t('noNotifications')}
                   </Text>
                 </View>
              )}
            </View>

             {/* MIS ALERTAS */}
             <View style={styles.section}>
               <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>🚨 {t('alertsTitle')}</Text>
                {activeAlertsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeAlertsCount}</Text>
                  </View>
                )}
              </View>
              
               <View style={styles.alertSummary}>
                 <Text style={styles.alertCount}>
                   {activeAlertsCount} {t('alertsActive')}
                 </Text>

                 {!isPremium && activeAlertsCount >= 1 && (
                   <Text style={styles.alertLimit}>
                     {t('limit')}
                   </Text>
                 )}
               </View>

               <TouchableOpacity
                 style={styles.actionButton}
                 onPress={handleViewAlerts}
               >
                 <Text style={styles.actionButtonText}>
                   {t('viewAlertsBtn')}
                 </Text>
               </TouchableOpacity>
            </View>

             {/* TOP PRODUCTS */}
             <View style={styles.section}>
               <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>⭐ {t('topProductsTitle')}</Text>
                {!isPremium && (
                  <View style={styles.premiumBadgeSmall}>
                    <Text style={styles.premiumBadgeSmallText}>{t('proBadge')}</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.actionButton, !isPremium && styles.actionButtonLocked]}
                onPress={onShowTopProducts}
              >
                 <Text style={[styles.actionButtonText, !isPremium && styles.actionButtonTextLocked]}>
                   {isPremium ? t('viewTopProducts') : t('unlockWithPremium')}
                 </Text>
              </TouchableOpacity>
            </View>

             {/* ACCESOS RÁPIDOS */}
             <View style={styles.section}>
               <Text style={styles.sectionTitle}>🚀 {t('quickAccess')}</Text>
               <View style={styles.quickAccessContainer}>
                 <TouchableOpacity
                   style={styles.quickAccessButton}
                   onPress={() => { onClose(); router.push('/(tabs)/validar'); }}
                 >
                   <Text style={styles.quickAccessText}>{t('viewProducts')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={styles.quickAccessButton}
                   onPress={() => { onClose(); router.push('/(tabs)/top-tiendas'); }}
                 >
                   <Text style={styles.quickAccessText}>{t('viewStores')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={styles.quickAccessButton}
                   onPress={() => { onClose(); router.push('/alerts'); }}
                 >
                   <Text style={styles.quickAccessText}>{t('viewAlerts')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={styles.quickAccessButton}
                   onPress={() => { onClose(); router.push('/notifications'); }}
                 >
                   <Text style={styles.quickAccessText}>{t('viewNotifications')}</Text>
                 </TouchableOpacity>
               </View>
             </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: COLORS.CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.GOLD,
  },
  premiumBadgeText: {
    color: COLORS.GOLD,
    fontSize: 11,
    fontWeight: '900',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD_BG_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  closeIcon: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 20,
    fontWeight: '700',
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  statusContent: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  upgradeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  badge: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '800',
  },
  benefitsContainer: {
    backgroundColor: COLORS.CARD_BG_LIGHT,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  notificationsList: {
    backgroundColor: COLORS.CARD_BG_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  notificationUnread: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
  },
  viewAllButton: {
    padding: 14,
    alignItems: 'center',
  },
  viewAllText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: COLORS.CARD_BG_LIGHT,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
  },
  alertSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertCount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  alertLimit: {
    fontSize: 14,
    color: COLORS.TEXT_TERTIARY,
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 102, 255, 0.12)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.3)',
  },
  actionButtonLocked: {
    backgroundColor: 'rgba(255, 51, 102, 0.12)',
    borderColor: 'rgba(255, 51, 102, 0.4)',
  },
  actionButtonText: {
    color: '#00a3ff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionButtonTextLocked: {
    color: '#ff3366',
  },
  premiumBadgeSmall: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.4)',
  },
  premiumBadgeSmallText: {
    color: '#ff3366',
    fontSize: 11,
    fontWeight: '900',
  },
  catalogButton: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 12,
    padding: 16,
  },
   catalogButtonText: {
     color: COLORS.TEXT_PRIMARY,
     fontSize: 15,
     fontWeight: '800',
     textAlign: 'center',
   },
   quickAccessContainer: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     justifyContent: 'space-between',
   },
    quickAccessButton: {
      backgroundColor: 'rgba(0, 102, 255, 0.12)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      width: '48%',
      borderWidth: 1,
      borderColor: 'rgba(0, 102, 255, 0.3)',
    },
    quickAccessText: {
      color: '#00a3ff',
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
 });

export default PremiumHomeModal;
