import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  useWindowDimensions,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePremium } from './context/PremiumContext';
import { useTranslation } from 'react-i18next';
import { logger } from './utils/logger';
import * as iapService from './utils/payments/mockIapService';

const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  ACCENT_BLUE: '#00a3ff',
  BACKGROUND: '#000',
  CARD_BG: 'rgba(20, 20, 20, 0.4)',
  CARD_BG_DARK: 'rgba(10, 10, 10, 0.4)',
  BORDER: 'rgba(40, 40, 40, 0.3)',
  BORDER_LIGHT: 'rgba(30, 30, 30, 0.3)',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  GOLD: '#FFD700',
} as const;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PremiumScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const {
    isPremium,
    subscription,
    subscribe,
    cancelSubscription,
    restorePurchases: restorePurchasesCtx,
  } = usePremium();

  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [prices, setPrices] = useState({ monthly: '0,99 €', yearly: '4,99 €' });
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const BENEFITS = [
    {
      icon: '🤖',
      title: t('discoverPremiumAI'),
      desc: t('discoverPremiumAIDesc'),
    },
    {
      icon: '👗',
      title: t('discoverPremiumVirtualTry'),
      desc: t('discoverPremiumVirtualTryDesc'),
    },
    {
      icon: '⭐',
      title: t('discoverPremiumTopProducts'),
      desc: t('discoverPremiumTopProductsDesc'),
    },
    {
      icon: '🚨',
      title: t('discoverPremiumAlerts'),
      desc: t('discoverPremiumAlertsDesc'),
    },
    {
      icon: '🏪',
      title: t('discoverPremiumStores'),
      desc: t('discoverPremiumStoresDesc'),
    },
    {
      icon: '❤️',
      title: t('discoverPremiumFavorites'),
      desc: t('discoverPremiumFavoritesDesc'),
    },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await iapService.initializeIAP();
        const subscriptions = await iapService.getSubscriptions();
        if (subscriptions.length > 0) {
          const monthly = subscriptions.find((p: any) => p.productId === iapService.productIds.PREMIUM_MONTHLY);
          const yearly = subscriptions.find((p: any) => p.productId === iapService.productIds.PREMIUM_YEARLY);
          if (monthly || yearly) {
            setPrices({
              monthly: monthly?.localizedPrice || '0,99 €',
              yearly: yearly?.localizedPrice || '4,99 €',
            });
          }
        }
      } catch (error) {
        logger.error('Error loading IAP products:', error);
      }
    };
    loadProducts();
    return () => { iapService.closeIAPConnection().catch(() => {}); };
  }, []);

  const handleSubscribe = async (type: 'monthly' | 'yearly') => {
    const setLoading = type === 'monthly' ? setLoadingMonthly : setLoadingYearly;
    setLoading(true);
    try {
      const result = await subscribe(type);
      if (result.success) {
        Alert.alert(
          t('subscriptionActivated'),
          t('welcomePremium')
        );
        router.back();
      } else {
        Alert.alert(
          t('error'),
          result.error || t('couldNotProcess')
        );
      }
    } catch (error) {
      logger.error(`Error purchasing ${type}:`, error);
      Alert.alert(t('error'), t('couldNotProcess'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      t('cancelSubscription'),
      t('subscriptionCanceledMsg'),
      [
        { text: t('keepPremium'), style: 'cancel' },
        {
          text: t('cancelSubscription'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert(
                t('subscriptionCanceledTitle'),
                t('subscriptionCanceledBody')
              );
            } catch (error) {
              logger.error('Error canceling:', error);
              Alert.alert(t('error'), t('couldNotCancel'));
            }
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    setLoadingRestore(true);
    try {
      const result = await restorePurchasesCtx();
      if (result.success && result.restored) {
        Alert.alert(
          t('purchasesRestored'),
          t('subscriptionRestored')
        );
      } else {
        Alert.alert(
          t('noPurchasesToRestore'),
          t('noPurchasesFound')
        );
      }
    } catch (error) {
      logger.error('Error restoring:', error);
      Alert.alert(t('error'), t('couldNotRestore'));
    } finally {
      setLoadingRestore(false);
    }
  };

  const openManageSubscriptions = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />

      <View style={[styles.header, { paddingTop: statusBarHeight + 12 }]}>
        <Image
          source={{ uri: 'https://www.shutterstock.com/image-photo/front-cargo-container-ship-ocean-600nw-2659440041.jpg' }}
          style={styles.headerBackgroundImage}
          resizeMode="cover"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>RepsFinder</Text>
          <View style={styles.backButton} />
        </View>

        <View style={[styles.gradientBarContainer, { width: SCREEN_WIDTH, marginLeft: -20 }]}>
          <LinearGradient
            colors={[COLORS.SECONDARY, COLORS.ACCENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.premiumBanner}>
          <Text style={styles.crownIcon}>👑</Text>
          <Text style={styles.bannerTitle}>{t('premiumTitle')}</Text>
          <Text style={styles.bannerSubtitle}>{t('premiumToolsTitle')}</Text>

          {isPremium && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{t('activeSubscription')}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('everythingIncluded')}</Text>

          {BENEFITS.map((b) => (
            <View key={b.icon} style={styles.benefitCard}>
              <View style={styles.benefitIconCircle}>
                <Text style={styles.benefitIcon}>{b.icon}</Text>
              </View>
              <View style={styles.benefitTextBox}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <LinearGradient
          colors={[COLORS.SECONDARY, COLORS.ACCENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.separator}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('chooseYourPlan')}</Text>
          <Text style={styles.sectionSubtitle}>{t('cancelAnytime')}</Text>

          <TouchableOpacity
            style={styles.planCardFeatured}
            onPress={() => handleSubscribe('yearly')}
            disabled={loadingYearly || subscription === 'premium_yearly'}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['rgba(0,212,170,0.12)', 'rgba(0,102,255,0.08)']}
              style={styles.planCardFeaturedInner}
            >
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{t('save58')}</Text>
              </View>

              <View style={styles.planRow}>
                <View style={styles.planInfo}>
                  <Text style={styles.planNameFeatured}>{t('yearlyPlanTitle')}</Text>
                  <Text style={styles.planDetail}>{t('yearlyPlanDetail')}</Text>
                  <Text style={styles.planMonthly}>{t('yearlyPlanMonthly')}</Text>
                </View>
                <View style={styles.planPriceBox}>
                  <Text style={styles.planPriceBig}>{prices.yearly}</Text>
                  <Text style={styles.planPricePeriod}>/{t('perYear')}</Text>
                </View>
              </View>

              <LinearGradient
                colors={[COLORS.PRIMARY, COLORS.ACCENT_BLUE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.subscribeBtn, (subscription === 'premium_yearly') && styles.subscribeBtnDisabled]}
              >
                {loadingYearly ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.subscribeBtnText}>
                    {subscription === 'premium_yearly' ? t('currentPlanLabel') : t('subscribeYearly')}
                  </Text>
                )}
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handleSubscribe('monthly')}
            disabled={loadingMonthly || (isPremium && subscription !== 'premium_yearly')}
            activeOpacity={0.85}
          >
            <View style={styles.planRow}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{t('monthlyPlanTitle')}</Text>
                <Text style={styles.planDetail}>{t('monthlyPlanDetail')}</Text>
              </View>
              <View style={styles.planPriceBox}>
                <Text style={styles.planPriceBig}>{prices.monthly}</Text>
                <Text style={styles.planPricePeriod}>/{t('perMonth')}</Text>
              </View>
            </View>

            <View style={[styles.subscribeBtnOutline, (isPremium && subscription !== 'premium_yearly') && styles.subscribeBtnDisabled]}>
              {loadingMonthly ? (
                <ActivityIndicator color={COLORS.PRIMARY} />
              ) : (
                <Text style={styles.subscribeBtnOutlineText}>
                  {(isPremium && subscription !== 'premium_yearly') ? t('currentPlanLabel') : t('subscribeMonthly')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {isPremium && (
            <>
              <TouchableOpacity style={styles.manageBtn} onPress={openManageSubscriptions}>
                <Text style={styles.manageBtnText}>{t('manageSubscriptionPlay')}</Text>
                <Text style={styles.manageBtnArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>{t('cancelSubscription')}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={loadingRestore}>
            {loadingRestore ? (
              <ActivityIndicator color={COLORS.TEXT_SECONDARY} />
            ) : (
              <Text style={styles.restoreBtnText}>{t('restorePurchases')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>{t('subscriptionInfoTitle')}</Text>
          <Text style={styles.legalText}>
            {t('subscriptionInfoText', { monthly: prices.monthly, yearly: prices.yearly })}
          </Text>

          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => router.push('/legal')}>
              <Text style={styles.legalLink}>{t('termsOfUse')}</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity onPress={() => router.push('/legal')}>
              <Text style={styles.legalLink}>{t('privacyPolicy')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.25,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '300',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  gradientBarContainer: {
    height: 6,
    marginTop: 55,
  },
  gradientBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
  },
  premiumBanner: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  crownIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.GOLD,
    marginBottom: 12,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  activeChip: {
    marginTop: 16,
    backgroundColor: 'rgba(0,212,170,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  benefitIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitTextBox: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  separator: {
    height: 3,
    marginHorizontal: 40,
    borderRadius: 2,
  },
  planCardFeatured: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  planCardFeaturedInner: {
    padding: 20,
  },
  saveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 14,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planNameFeatured: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  planDetail: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  planMonthly: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: '700',
    marginTop: 4,
  },
  planPriceBox: {
    alignItems: 'flex-end',
  },
  planPriceBig: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  planPricePeriod: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  subscribeBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.3,
  },
  subscribeBtnOutline: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  subscribeBtnOutlineText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    letterSpacing: 0.3,
  },
  subscribeBtnDisabled: {
    opacity: 0.4,
  },
  manageBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 10,
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  manageBtnArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginLeft: 12,
  },
  cancelBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.ACCENT,
    marginBottom: 10,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.ACCENT,
  },
  restoreBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
  },
  legalSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
  },
  legalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legalText: {
    fontSize: 11,
    color: COLORS.TEXT_TERTIARY,
    lineHeight: 18,
    marginBottom: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.ACCENT_BLUE,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
});
