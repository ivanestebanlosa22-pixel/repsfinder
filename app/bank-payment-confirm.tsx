/**
 * Pantalla de Confirmación de Pago Bancario
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Platform
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '../src/context/PremiumContext';
import { useTranslation } from 'react-i18next';
import { logger } from '../src/utils/logger';
import { 
  checkBankPaymentStatus, 
  notifyBankPaymentSent 
} from '../src/utils/payments';

// Colores de la app
const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  ACCENT_BLUE: '#00a3ff',
  BACKGROUND: '#000',
  CARD_BG: '#0f0f0f',
  CARD_BG_DARK: '#0a0a0a',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
};

export default function BankPaymentConfirmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extraer parámetros
  const paymentId = params.paymentId as string;
  const reference = params.reference as string;
  const bankName = params.bankName as string;
  const accountNumber = params.accountNumber as string;
  const accountHolder = params.accountHolder as string;
  const amount = params.amount as string;
  const expirationDate = params.expirationDate as string;
  const subscriptionType = params.type as string;
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [transferDate, setTransferDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  
  // Formatear la fecha de expiración
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Comprobar estado del pago
  const checkPaymentStatus = async () => {
    if (!paymentId || !reference) return;
    
    setLoading(true);
    try {
      const result = await checkBankPaymentStatus(paymentId, reference);
      
      if (result.success) {
        setPaymentStatus(result.status);
        
        if (result.status === 'completed') {
          Alert.alert(
            t('paymentCompleted'),
            t('paymentVerifiedThankYou'),
            [
              {
                text: 'OK',
                onPress: () => router.replace('/premium')
              }
            ]
          );
        } else if (result.status === 'expired') {
          Alert.alert(
            t('paymentExpired'),
            t('paymentExpiredMessage')
          );
        }
      }
    } catch (error) {
      logger.error('Error checking payment status:', error);
      Alert.alert(
        t('error'),
        t('errorCheckingPayment')
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Comprobar estado inicial al cargar
  useEffect(() => {
    checkPaymentStatus();
    
    // Comprobar cada 2 minutos (solo como ejemplo)
    const interval = setInterval(checkPaymentStatus, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Copiar datos al portapapeles
  const copyToClipboard = async (text: string, message: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(t('copied'), message);
  };
  
  // Compartir datos de pago
  const sharePaymentDetails = async () => {
    try {
      const message = `
${t('bankTransferDetails')}:

${t('bank')}: ${bankName}
${t('accountNumber')}: ${accountNumber}
${t('accountHolder')}: ${accountHolder}
${t('amount')}: ${amount}€
${t('reference')}: ${reference}

${t('paymentValidUntil')}: ${formatDate(expirationDate)}
      `;
      
      await Share.share({
        message,
        title: t('bankTransferDetails'),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // Notificar que se ha realizado el pago
  const notifyPayment = async () => {
    if (!transferDate) {
      Alert.alert(
        t('missingInfo'),
        t('pleaseEnterTransferDate')
      );
      return;
    }
    
    setNotifying(true);
    try {
      const result = await notifyBankPaymentSent({
        paymentId,
        reference,
        transferDate,
        senderName: 'Usuario', // En una app real, usar el nombre del usuario logueado
      });
      
      if (result.success) {
        Alert.alert(
          t('notificationSent'),
          t('willVerifyPayment', { time: result.estimatedTime }),
          [
            {
              text: 'OK',
              onPress: () => checkPaymentStatus()
            }
          ]
        );
      }
    } catch (error) {
      logger.error('Error notifying payment:', error);
      Alert.alert(
        t('error'),
        t('errorNotifyingPayment')
      );
    } finally {
      setNotifying(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('bankTransfer')}</Text>
        <View style={styles.backButton} />
      </View>
      
      {/* SUB-BANNER PREMIUM */}
      <View style={styles.subBanner}>
        <LinearGradient
          colors={[COLORS.SECONDARY, COLORS.ACCENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.subBannerGradient}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Estado del pago */}
        <View style={styles.statusContainer}>
          <LinearGradient
            colors={[COLORS.PRIMARY, COLORS.ACCENT_BLUE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBanner}
          >
            <Text style={styles.statusTitle}>
              {paymentStatus === 'pending'
                ? t('pendingPayment')
                : paymentStatus === 'completed'
                ? t('paymentCompleted')
                : t('paymentExpired')}
            </Text>
            <Text style={styles.statusDescription}>
              {paymentStatus === 'pending'
                ? t('pendingPaymentDescription')
                : paymentStatus === 'completed'
                ? t('paymentCompletedDescription')
                : t('paymentExpiredDescription')}
            </Text>
          </LinearGradient>
        </View>
        
        {/* Detalles de la transferencia */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>{t('transferDetails')}</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('subscriptionType')}:</Text>
              <Text style={styles.detailValue}>
                {subscriptionType === 'monthly' ? t('monthlyPlan') : t('yearlyPlan')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('amount')}:</Text>
              <Text style={styles.detailValue}>{amount}€</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('validUntil')}:</Text>
              <Text style={styles.detailValue}>{formatDate(expirationDate)}</Text>
            </View>
          </View>
        </View>
        
        {/* Detalles bancarios */}
        <View style={styles.bankSection}>
          <Text style={styles.sectionTitle}>{t('bankDetails')}</Text>
          
          <View style={styles.bankCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('bank')}:</Text>
              <Text style={styles.detailValue}>{bankName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('accountHolder')}:</Text>
              <Text style={styles.detailValue}>{accountHolder}</Text>
            </View>
            
            <View style={[styles.detailRow, styles.copyableRow]}>
              <Text style={styles.detailLabel}>{t('accountNumber')}:</Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(accountNumber, t('accountNumberCopied'))}
                style={styles.copyableContainer}
              >
                <Text style={styles.detailValue}>{accountNumber}</Text>
                <Text style={styles.copyText}>{t('copy')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.detailRow, styles.copyableRow]}>
              <Text style={styles.detailLabel}>{t('reference')}:</Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(reference, t('referenceCopied'))}
                style={styles.copyableContainer}
              >
                <Text style={styles.detailValue}>{reference}</Text>
                <Text style={styles.copyText}>{t('copy')}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={sharePaymentDetails}
            >
              <Text style={styles.shareButtonText}>{t('shareDetails')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notificar Pago */}
        {paymentStatus === 'pending' && (
          <View style={styles.notifySection}>
            <Text style={styles.sectionTitle}>{t('notifyPayment')}</Text>
            <Text style={styles.notifyInstructions}>{t('notifyPaymentInstructions')}</Text>
            
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // Aquí normalmente abriríamos un selector de fecha
                // Para simplificar, usamos la fecha actual
                setTransferDate(new Date().toISOString().split('T')[0]);
                Alert.alert(t('dateSelected'), t('todaySelected'));
              }}
            >
              <Text style={transferDate ? styles.dateInputText : styles.dateInputPlaceholder}>
                {transferDate || t('selectTransferDate')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.notifyButton}
              onPress={notifyPayment}
              disabled={notifying}
            >
              {notifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.notifyButtonText}>{t('notifyPaymentSent')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Verificar estado */}
        {paymentStatus === 'pending' && (
          <TouchableOpacity
            style={styles.checkStatusButton}
            onPress={checkPaymentStatus}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkStatusText}>{t('checkPaymentStatus')}</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  subBanner: {
    width: '100%',
    height: 4, // Altura exacta para la barra
    backgroundColor: COLORS.SECONDARY, // Color de respaldo
  },
  subBannerGradient: {
    height: 4, // Altura exacta para la barra
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 24,
  },
  statusBanner: {
    padding: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statusDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  bankSection: {
    marginBottom: 24,
  },
  bankCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  copyableRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  copyableContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.PRIMARY,
  },
  shareButton: {
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  notifySection: {
    marginBottom: 24,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notifyInstructions: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  dateInputPlaceholder: {
    color: COLORS.TEXT_SECONDARY,
  },
  dateInputText: {
    color: COLORS.TEXT_PRIMARY,
  },
  notifyButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkStatusButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkStatusText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
});