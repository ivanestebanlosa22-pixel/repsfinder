// Selector de idioma y moneda - RepsFinder PRO
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppSettings } from './AppSettingsContext';

export function SettingsButton() {
  const [showModal, setShowModal] = useState(false);
  const { language, currency, setLanguage, setCurrency, t } = useAppSettings();

  const handleLanguageChange = async (lang: 'es' | 'en') => {
    await setLanguage(lang);
    Alert.alert(t.success, t.settingsSaved);
  };

  const handleCurrencyChange = async (curr: 'USD' | 'EUR') => {
    await setCurrency(curr);
    Alert.alert(t.success, t.settingsSaved);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.settingsTitle}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* IDIOMA */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>{t.settingsLanguage}</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      language === 'es' && styles.optionButtonActive,
                    ]}
                    onPress={() => handleLanguageChange('es')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        language === 'es' && styles.optionTextActive,
                      ]}
                    >
                      🇪🇸 {t.settingsLanguageES}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      language === 'en' && styles.optionButtonActive,
                    ]}
                    onPress={() => handleLanguageChange('en')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        language === 'en' && styles.optionTextActive,
                      ]}
                    >
                      🇺🇸 {t.settingsLanguageEN}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* MONEDA */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>{t.settingsCurrency}</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      currency === 'USD' && styles.optionButtonActive,
                    ]}
                    onPress={() => handleCurrencyChange('USD')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        currency === 'USD' && styles.optionTextActive,
                      ]}
                    >
                      💵 {t.settingsCurrencyUSD}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      currency === 'EUR' && styles.optionButtonActive,
                    ]}
                    onPress={() => handleCurrencyChange('EUR')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        currency === 'EUR' && styles.optionTextActive,
                      ]}
                    >
                      💶 {t.settingsCurrencyEUR}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  settingsIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderTopWidth: 2,
    borderColor: '#00e5b0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  settingSection: {
    marginBottom: 32,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#00e5b0',
    borderColor: '#00e5b0',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
  },
  optionTextActive: {
    color: '#000',
  },
}
