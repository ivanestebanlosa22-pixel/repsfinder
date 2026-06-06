import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  Platform,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePremium } from './context/PremiumContext';
import { useSmartAlerts, AlertType, ALERT_TYPE_LABELS } from './context/SmartAlertsContext';
import PaywallModal from './components/premium/PaywallModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 1 : 44;

const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  BACKGROUND: '#000',
  CARD_BG: '#141414',
  CARD_BG_DARK: '#0a0a0a',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  BORDER: 'rgba(255,255,255,0.1)',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
};

const HEADER_BG = 'https://www.shutterstock.com/image-photo/front-cargo-container-ship-ocean-600nw-2659440041.jpg';

const ALERT_TYPES: { type: AlertType; icon: string; labelKey: string; color: string }[] = [
  { type: 'price_drop', icon: '💰', labelKey: 'priceDrop', color: '#22c55e' },
  { type: 'price_increase', icon: '📈', labelKey: 'priceIncrease', color: '#ef4444' },
  { type: 'restock', icon: '📦', labelKey: 'restockAlert', color: '#3B82F6' },
  { type: 'negative_reports', icon: '⚠️', labelKey: 'negativeReports', color: '#f59e0b' },
  { type: 'new_batch', icon: '🆕', labelKey: 'newBatch', color: '#8B5CF6' },
  { type: 'trust_score_change', icon: '⭐', labelKey: 'trustScoreChange', color: '#FFD700' },
];

export default function AlertasScreen() {
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const {
    alerts,
    triggers,
    createAlert,
    deleteAlert,
    toggleAlert,
    getAlertStats,
    canCreateAlert,
    getRemainingAlerts,
  } = useSmartAlerts();

  const [showPaywall, setShowPaywall] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<AlertType>('price_drop');
  const [alertName, setAlertName] = useState('');
  const [productName, setProductName] = useState('');
  const [priceThreshold, setPriceThreshold] = useState('');
  const [percentageChange, setPercentageChange] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  const stats = getAlertStats();
  const remaining = getRemainingAlerts();

  const handleCreateAlertBtn = async () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    if (!alertName.trim()) {
      Alert.alert(t('error'), t('enterAlertName'));
      return;
    }

    const alertData = {
      userId: 'current_user',
      name: alertName.trim(),
      type: selectedType,
      productName: productName.trim() || undefined,
      conditions: {
        priceThreshold: priceThreshold ? parseFloat(priceThreshold) : undefined,
        percentageChange: percentageChange ? parseFloat(percentageChange) : undefined,
      },
      isActive: true,
      notificationChannels: {
        push: pushEnabled,
        email: false,
        inApp: inAppEnabled,
      },
    };

    const success = await createAlert(alertData);

    if (success) {
      setShowCreateModal(false);
      setAlertName('');
      setProductName('');
      setPriceThreshold('');
      setPercentageChange('');
      Alert.alert(t('alertCreatedSuccess'), t('alertCreatedMsg'));
    } else {
      Alert.alert(t('error'), t('couldNotCreateAlert'));
    }
  };

  const handleDeleteAlert = (alertId: string, alertNameStr: string) => {
    Alert.alert(
      t('deleteAlertTitle'),
      t('deleteAlertConfirm', { alertName: alertNameStr }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteAlert'),
          style: 'destructive',
          onPress: () => deleteAlert(alertId),
        },
      ]
    );
  };

  const getAlertTypeInfo = (type: AlertType) => {
    return ALERT_TYPES.find(t => t.type === type) || ALERT_TYPES[0];
  };

  const getAlertLabel = (typeInfo: typeof ALERT_TYPES[0]) => {
    return t(typeInfo.labelKey);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />

      <ImageBackground
        source={{ uri: HEADER_BG }}
        style={[styles.header, { paddingTop: statusBarHeight + 20 }]}
        imageStyle={{ opacity: 0.25 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {t('alertsTitle')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isPremium 
              ? t('unlimitedAlerts')
              : t('remainingAlerts', { count: remaining })
            }
          </Text>
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)' }]}>
            <Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.activeAlerts}</Text>
            <Text style={styles.statLabel}>{t('activeAlerts')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.triggeredToday}</Text>
            <Text style={styles.statLabel}>{t('todayAlerts')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
            <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{stats.triggeredThisWeek}</Text>
            <Text style={styles.statLabel}>{t('weekAlerts')}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => {
            if (!isPremium && !canCreateAlert()) {
              setShowPaywall(true);
            } else {
              setShowCreateModal(true);
            }
          }}
        >
          <LinearGradient
            colors={['#667eea', '#FF3366']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButtonGradient}
          >
            <Text style={styles.createButtonIcon}>+</Text>
            <Text style={styles.createButtonText}>
              {t('createNewAlert')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              {t('noAlertsConfigured')}
            </Text>
            <Text style={styles.emptyText}>
              {t('noAlertsDesc')}
            </Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const typeInfo = getAlertTypeInfo(alert.type);
            return (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={[styles.alertIcon, { backgroundColor: typeInfo.color + '20' }]}>
                    <Text style={styles.alertIconText}>{typeInfo.icon}</Text>
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName}>{alert.name}</Text>
                    <Text style={styles.alertType}>
                      {getAlertLabel(typeInfo)}
                    </Text>
                    {alert.productName && (
                      <Text style={styles.alertProduct}>{alert.productName}</Text>
                    )}
                  </View>
                  <Switch
                    value={alert.isActive}
                    onValueChange={() => toggleAlert(alert.id)}
                    trackColor={{ false: '#333', true: COLORS.PRIMARY }}
                    thumbColor="#fff"
                  />
                </View>
                
                <View style={styles.alertFooter}>
                  <Text style={styles.alertTriggers}>
                    {alert.triggerCount} {t('triggersCount')}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteAlert(alert.id, alert.name)}>
                    <Text style={styles.deleteText}>
                      {t('deleteAlert')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {triggers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {t('recentNotifications')}
            </Text>
            {triggers.slice(0, 5).map((trigger) => {
              const alert = alerts.find(a => a.id === trigger.alertId);
              if (!alert) return null;
              const typeInfo = getAlertTypeInfo(alert.type);
              
              return (
                <View key={trigger.id} style={[styles.triggerCard, trigger.read && styles.triggerCardRead]}>
                  <View style={[styles.triggerDot, { backgroundColor: typeInfo.color }]} />
                  <View style={styles.triggerContent}>
                    <Text style={styles.triggerMessage}>{trigger.data.message}</Text>
                    <Text style={styles.triggerTime}>
                      {new Date(trigger.triggeredAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('createAlertBtn')}
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>
                {t('alertType')}
              </Text>
              <View style={styles.typeGrid}>
                {ALERT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.typeButton,
                      selectedType === type.type && { borderColor: type.color, backgroundColor: type.color + '15' },
                    ]}
                    onPress={() => setSelectedType(type.type)}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={[styles.typeLabel, selectedType === type.type && { color: type.color }]}>
                      {t(type.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>
                {t('alertName')}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('alertNamePlaceholder')}
                placeholderTextColor={COLORS.TEXT_TERTIARY}
                value={alertName}
                onChangeText={setAlertName}
              />

              <Text style={styles.inputLabel}>
                {t('alertProduct')}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t('alertProductPlaceholder')}
                placeholderTextColor={COLORS.TEXT_TERTIARY}
                value={productName}
                onChangeText={setProductName}
              />

              {(selectedType === 'price_drop' || selectedType === 'price_increase') && (
                <>
                  <Text style={styles.inputLabel}>
                    {t('alertPriceThreshold')}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('alertPricePlaceholder')}
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    value={priceThreshold}
                    onChangeText={setPriceThreshold}
                    keyboardType="numeric"
                  />
                </>
              )}

              <Text style={styles.inputLabel}>
                {t('notifications')}
              </Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Push</Text>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: '#333', true: COLORS.PRIMARY }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>In-App</Text>
                <Switch
                  value={inAppEnabled}
                  onValueChange={setInAppEnabled}
                  trackColor={{ false: '#333', true: COLORS.PRIMARY }}
                  thumbColor="#fff"
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalCreateButton} onPress={handleCreateAlertBtn}>
              <LinearGradient
                colors={['#667eea', '#FF3366']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalCreateGradient}
              >
                <Text style={styles.modalCreateText}>
                  {t('createAlertBtn')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: { fontSize: 20, color: '#fff' },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  headerSubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  
  content: { flex: 1, padding: 20 },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
  
  createButton: { marginBottom: 24, borderRadius: 14, overflow: 'hidden' },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createButtonIcon: { fontSize: 24, color: '#fff', fontWeight: '900' },
  createButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  
  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 16 },
  
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },
  
  alertCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center' },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIconText: { fontSize: 22 },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 15, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  alertType: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  alertProduct: { fontSize: 11, color: COLORS.TEXT_TERTIARY, marginTop: 4 },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  alertTriggers: { fontSize: 12, color: COLORS.TEXT_TERTIARY },
  deleteText: { fontSize: 12, color: COLORS.ACCENT, fontWeight: '600' },
  
  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  triggerCardRead: { opacity: 0.6 },
  triggerDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  triggerContent: { flex: 1 },
  triggerMessage: { fontSize: 13, color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  triggerTime: { fontSize: 11, color: COLORS.TEXT_TERTIARY },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  modalClose: { fontSize: 20, color: COLORS.TEXT_SECONDARY },
  modalScroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 8, marginTop: 12 },
  textInput: {
    backgroundColor: COLORS.CARD_BG_DARK,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD_BG_DARK,
  },
  typeIcon: { fontSize: 20, marginRight: 8 },
  typeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_PRIMARY },
  
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: { fontSize: 14, color: COLORS.TEXT_PRIMARY },
  
  modalCreateButton: { marginHorizontal: 20, marginTop: 12, marginBottom: 16, borderRadius: 14, overflow: 'hidden' },
  modalCreateGradient: { paddingVertical: 16, alignItems: 'center' },
  modalCreateText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  
  bottomSpacer: { height: 100 },
});
