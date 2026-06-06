// ==================== ALERTS SCREEN ====================
// Pantalla para gestionar alertas inteligentes

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSmartAlerts, AlertType, ALERT_TYPE_LABELS } from './context/SmartAlertsContext';
import { usePremium } from './context/PremiumContext';
import { AlertLimitBanner } from './components/premium/LimitBanners';
import PaywallModal from './components/premium/PaywallModal';

export default function AlertsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const {
    alerts,
    createAlert,
    deleteAlert,
    toggleAlert,
    canCreateAlert,
    getRemainingAlerts,
    triggers,
    getUnreadTriggers,
    markTriggerAsRead,
  } = useSmartAlerts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Form state
  const [newAlertName, setNewAlertName] = useState('');
  const [selectedType, setSelectedType] = useState<AlertType>('price_drop');
  const [priceThreshold, setPriceThreshold] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const unreadTriggers = getUnreadTriggers();
  const remainingAlerts = getRemainingAlerts();

  const handleCreateAlert = async () => {
    if (!canCreateAlert()) {
      setShowPaywall(true);
      return;
    }

    if (!newAlertName.trim()) return;

    const success = await createAlert({
      userId: 'current_user', // This should come from auth context
      name: newAlertName,
      type: selectedType,
      conditions: {
        priceThreshold: priceThreshold ? parseFloat(priceThreshold) : undefined,
      },
      isActive: true,
      notificationChannels: {
        push: pushEnabled,
        email: emailEnabled,
        inApp: true,
      },
    });

    if (success) {
      setShowCreateModal(false);
      setNewAlertName('');
      setPriceThreshold('');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('smartAlerts')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (canCreateAlert()) {
              setShowCreateModal(true);
            } else {
              setShowPaywall(true);
            }
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.length}</Text>
            <Text style={styles.statLabel}>{t('totalAlerts')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.filter(a => a.isActive).length}</Text>
            <Text style={styles.statLabel}>{t('active')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{triggers.length}</Text>
            <Text style={styles.statLabel}>{t('triggered')}</Text>
          </View>
          {!isPremium && (
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{remainingAlerts}</Text>
              <Text style={styles.statLabel}>{t('remaining')}</Text>
            </View>
          )}
        </View>

        {/* Recent Triggers */}
        {triggers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('recentTriggers')}</Text>
            {triggers.slice(0, 5).map((trigger) => {
              const alert = alerts.find(a => a.id === trigger.alertId);
              if (!alert) return null;
              
              return (
                <TouchableOpacity
                  key={trigger.id}
                  style={[styles.triggerCard, !trigger.read && styles.triggerCardUnread]}
                  onPress={() => markTriggerAsRead(trigger.id)}
                >
                  <Text style={styles.triggerMessage}>{trigger.data.message}</Text>
                  <Text style={styles.triggerTime}>
                    {new Date(trigger.triggeredAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* My Alerts */}
        <Text style={styles.sectionTitle}>{t('myAlerts')}</Text>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>{t('noAlertsYet')}</Text>
            <Text style={styles.emptyText}>{t('createAlertDesc')}</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertName}>{alert.name}</Text>
                  <Text style={styles.alertType}>
                    {ALERT_TYPE_LABELS[alert.type]?.label || alert.type}
                  </Text>
                  <Text style={styles.triggerCount}>
                    {t('triggered')}: {alert.triggerCount} {t('times')}
                  </Text>
                </View>
                <Switch
                  value={alert.isActive}
                  onValueChange={() => toggleAlert(alert.id)}
                  trackColor={{ false: '#333', true: '#00d4aa' }}
                />
              </View>
              <View style={styles.alertFooter}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteAlert(alert.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Create Alert Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('createAlertBtn')}</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t('alertName')}</Text>
              <TextInput
                style={styles.input}
                value={newAlertName}
                onChangeText={setNewAlertName}
                placeholder={t('alertNamePlaceholder')}
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>{t('alertType')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {(Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      selectedType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text style={styles.typeButtonIcon}>{ALERT_TYPE_LABELS[type].icon}</Text>
                    <Text style={[
                      styles.typeButtonText,
                      selectedType === type && styles.typeButtonTextActive,
                    ]}>
                      {ALERT_TYPE_LABELS[type].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {(selectedType === 'price_drop' || selectedType === 'price_increase') && (
                <>
                  <Text style={styles.inputLabel}>{t('alertPriceThreshold')}</Text>
                  <TextInput
                    style={styles.input}
                    value={priceThreshold}
                    onChangeText={setPriceThreshold}
                    placeholder="100"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </>
              )}

              <Text style={styles.inputLabel}>{t('notifications')}</Text>
              <View style={styles.notificationOptions}>
                <View style={styles.notificationOption}>
                  <Text style={styles.notificationLabel}>📱 Push</Text>
                  <Switch
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                    trackColor={{ false: '#333', true: '#00d4aa' }}
                  />
                </View>
                <View style={styles.notificationOption}>
                  <Text style={styles.notificationLabel}>📧 Email</Text>
                  <Switch
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                    trackColor={{ false: '#333', true: '#00d4aa' }}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.createButton} onPress={handleCreateAlert}>
                <LinearGradient
                  colors={['#00d4aa', '#00a3ff']}
                  style={styles.createButtonGradient}
                >
                  <Text style={styles.createButtonText}>{t('createAlertBtn')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#222',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  alertType: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  triggerCount: {
    fontSize: 12,
    color: '#666',
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  triggerCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  triggerCardUnread: {
    borderColor: '#00d4aa',
    borderWidth: 2,
  },
  triggerMessage: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  triggerTime: {
    fontSize: 12,
    color: '#666',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalClose: {
    fontSize: 24,
    color: '#888',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  typeButton: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  typeButtonActive: {
    backgroundColor: '#00d4aa',
  },
  typeButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 12,
    color: '#888',
  },
  typeButtonTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  notificationOptions: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  notificationLabel: {
    fontSize: 14,
    color: '#fff',
  },
  createButton: {
    marginTop: 25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
