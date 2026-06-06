import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  Linking,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, router } from 'expo-router';
import type { Agent, GoogleSheetData } from '../types';
import { logger } from '../utils/logger';

const HEADER_BG = 'https://www.shutterstock.com/image-photo/front-cargo-container-ship-ocean-600nw-2659440041.jpg';

const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  ACCENT_BLUE: '#00a3ff',
  BACKGROUND: '#000',
  CARD_BG: 'rgba(20, 20, 20, 0.4)',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  GLASS_BG: 'rgba(255, 255, 255, 0.03)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.08)',
  GOLD: '#FFD700',
  SILVER: '#C0C0C0',
  BRONZE: '#CD7F32',
} as const;

const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';
const SHEET_NAME = 'AGENTS';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

// ==================== MARKETING DATA ====================
const TRUST_STATS = [
  { icon: '🛡️', value: '+12.400', labelKey: 'secureOrders' },
  { icon: '⭐', value: '97%', labelKey: 'satisfaction' },
  { icon: '🚀', value: '+3.200', labelKey: 'activeUsers' },
  { icon: '💰', value: '0€', labelKey: 'registration' },
];

const HOW_IT_WORKS = [
  { step: '1', icon: '🎯', titleKey: 'chooseAgent', descKey: 'chooseAgentDesc' },
  { step: '2', icon: '📝', titleKey: 'registerFree', descKey: 'registerFreeDesc' },
  { step: '3', icon: '📦', titleKey: 'buySecure', descKey: 'buySecureDesc' },
];

const WHY_AGENT = [
  { icon: '🔒', titleKey: 'securePayment', descKey: 'securePaymentDesc' },
  { icon: '📸', titleKey: 'qcPhotos', descKey: 'qcPhotosDesc' },
  { icon: '💬', titleKey: 'support247', descKey: 'support247Desc' },
];

// ==================== MAIN COMPONENT ====================
export default function AgentsScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useSharedValue(1);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const featuredAnim = useSharedValue(1);

  const startPulse = () => {
    featuredAnim.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  };

  const featuredStyle = useAnimatedStyle(() => ({
    transform: [{ scale: featuredAnim.value }],
  }));

  const getPopularBadges = () => [
    t('popularBadge1'),
    t('popularBadge2'),
    t('popularBadge3'),
    t('popularBadge4'),
    t('popularBadge5'),
  ];

  const fetchAgents = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const text = await response.text();

      let json: GoogleSheetData;
      try {
        let cleanText = text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
        const jsonString = cleanText.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
        const match = jsonString.match(/\{[\s\S]*\}/);
        if (match) {
          json = JSON.parse(match[0]);
        } else {
          throw new Error('Could not find valid JSON object in response');
        }
      } catch (parseError) {
        logger.error('Error parsing JSON:', parseError);
        throw new Error('Failed to parse agent data');
      }

      if (!json?.table?.rows) throw new Error('Invalid data structure');

      const rows = json.table.rows;
      const locale = i18n.language;
      const isSpanish = locale === 'es';

      let allAgents = rows.map((row: any) => {
        const cells = row.c;
        return {
          name: cells[0]?.v || '',
          logo: cells[1]?.v || '',
          rating: cells[2]?.v || '',
          reviews: cells[3]?.v || '',
          bonus: isSpanish ? (cells[4]?.v || '') : (cells[5]?.v || ''),
          register: cells[6]?.v || '',
          productLink: cells[7]?.v || '',
          badge: isSpanish ? (cells[8]?.v || '') : (cells[9]?.v || ''),
          description: isSpanish ? (cells[10]?.v || '') : (cells[11]?.v || ''),
          shippingTime: isSpanish ? (cells[12]?.v || '') : (cells[13]?.v || ''),
          qcSuccess: cells[14]?.v || '',
          shippingCost: cells[15]?.v || '',
          commission: cells[16]?.v || '',
          founded: cells[17]?.v || '',
          trustpilot: cells[18]?.v || '',
          storage: isSpanish ? (cells[19]?.v || '') : (cells[20]?.v || ''),
          recommendation: isSpanish ? (cells[21]?.v || '') : (cells[22]?.v || ''),
          pros: isSpanish ? (cells[23]?.v || '') : (cells[24]?.v || ''),
          cons: isSpanish ? (cells[25]?.v || '') : (cells[26]?.v || ''),
          mostrar: cells[27]?.v || '',
        };
      }).filter((a: any) => {
        if (!a.name || !a.logo) return false;
        const m = String(a.mostrar ?? '').trim().toUpperCase();
        const isEmpty = m === '';
        const esSi = isEmpty || ['SI', 'SÍ', 'YES', 'VERDADERO', 'TRUE', '1'].includes(m) || a.mostrar === true || a.mostrar === 1;
        const esNo = ['NO', 'N', 'FALSO', 'FALSE', '0'].includes(m) || a.mostrar === false || a.mostrar === 0;
        return esSi && !esNo;
      });

      if (id && typeof id === 'string') {
        const targetIndex = allAgents.findIndex((agent: any) =>
          agent.name.toLowerCase().trim() === id.toLowerCase().trim()
        );
        if (targetIndex > 0) {
          const targetAgent = allAgents[targetIndex];
          allAgents.splice(targetIndex, 1);
          allAgents.unshift(targetAgent);
        }
      }

      setAgents(allAgents);
      setLoading(false);
    } catch (error) {
      logger.error('Error fetching agents:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    startPulse();
  }, [i18n.language, id]);

  const handleRegister = (url: string | undefined) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      Linking.openURL(url).catch((err) => logger.error('Error opening URL:', err));
    }
  };

  const getGradientColors = (index: number): [string, string] => {
    const gradients: [string, string][] = [
      ['#4FACFE', '#00F2FE'],
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#00c9ff', '#92fe9d'],
      ['#feca57', '#ff9ff3'],
      ['#ee5a6f', '#f4c4f3'],
      ['#34e7e4', '#0052d4'],
      ['#89f7fe', '#66a6ff'],
      ['#fa709a', '#fee140'],
      ['#b06ab3', '#4568dc'],
    ];
    return gradients[index % gradients.length];
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return { emoji: '🥇', color: COLORS.GOLD, label: '#1 TOP' };
    if (index === 1) return { emoji: '🥈', color: COLORS.SILVER, label: '#2' };
    if (index === 2) return { emoji: '🥉', color: COLORS.BRONZE, label: '#3' };
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />

      {/* ===== HEADER ===== */}
      <ImageBackground
        source={{ uri: HEADER_BG }}
        style={[styles.header, { paddingTop: statusBarHeight + 20, paddingBottom: 5 }]}
        imageStyle={styles.headerImage}
      >
        <Text style={styles.logo}>RepsFinder</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
        <View style={{ flex: 1 }} />
        <View style={[styles.gradientBarContainer, { marginHorizontal: -20, width: SCREEN_WIDTH, marginTop: 5 }]}>
          <LinearGradient
            colors={[COLORS.SECONDARY, COLORS.ACCENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />
        </View>
      </ImageBackground>

      {/* ===== SUB-BANNER ===== */}
      <View style={[styles.subBanner, { top: statusBarHeight + 70 }]}>
        <LinearGradient
          colors={[COLORS.SECONDARY, COLORS.ACCENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.subBannerGradient}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView, { marginTop: statusBarHeight + 120 }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ===== HERO SECTION ===== */}
        <LinearGradient
          colors={['rgba(0,102,255,0.12)', 'rgba(255,51,102,0.08)', 'transparent']}
          style={styles.heroSection}
        >
          <View style={styles.heroUrgencyBadge}>
            <Text style={styles.heroUrgencyText}>{t('freeRegistration')}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('heroTitleAgents')}</Text>
          <Text style={styles.heroSubtitle}>{t('heroSubtitleAgents')}</Text>

          {/* TRUST STATS ROW */}
           <View style={styles.trustRow}>
             {TRUST_STATS.map((stat) => (
               <View key={stat.icon} style={styles.trustItem}>
                 <Text style={styles.trustIcon}>{stat.icon}</Text>
                 <Text style={styles.trustValue}>{stat.value}</Text>
                 <Text style={styles.trustLabel}>{t(stat.labelKey)}</Text>
               </View>
             ))}
          </View>
        </LinearGradient>

         {/* ===== HOW IT WORKS ===== */}
         <View style={styles.howSection}>
           <Text style={styles.sectionTitle}>{t('howItWorks')}</Text>
           <View style={styles.stepsRow}>
             {HOW_IT_WORKS.map((step, idx) => (
               <View key={step.step} style={styles.stepCard}>
                 <LinearGradient
                   colors={['rgba(0,102,255,0.15)', 'rgba(0,102,255,0.05)']}
                   style={styles.stepGradient}
                 >
                   <View style={styles.stepNumberBadge}>
                     <Text style={styles.stepNumber}>{step.step}</Text>
                   </View>
                   <Text style={styles.stepIcon}>{step.icon}</Text>
                   <Text style={styles.stepTitle}>{t(step.titleKey)}</Text>
                   <Text style={styles.stepDesc}>{t(step.descKey)}</Text>
                 </LinearGradient>
                 {idx < HOW_IT_WORKS.length - 1 && (
                   <Text style={styles.stepArrow}>→</Text>
                 )}
               </View>
             ))}
          </View>
        </View>

         {/* ===== WHY AN AGENT ===== */}
         <View style={styles.whySection}>
           <Text style={styles.sectionTitle}>{t('whyUseAgent')}</Text>
           <View style={styles.whyGrid}>
             {WHY_AGENT.map((item) => (
               <View key={item.icon} style={styles.whyCard}>
                 <LinearGradient
                   colors={['rgba(0,212,170,0.12)', 'rgba(0,212,170,0.04)']}
                   style={styles.whyGradient}
                 >
                   <Text style={styles.whyIcon}>{item.icon}</Text>
                   <Text style={styles.whyTitle}>{t(item.titleKey)}</Text>
                   <Text style={styles.whyDesc}>{t(item.descKey)}</Text>
                 </LinearGradient>
               </View>
             ))}
          </View>
        </View>

        {/* ===== AGENTS LIST ===== */}
        <View style={styles.agentsSection}>
          <View style={styles.agentsSectionHeader}>
            <Text style={styles.sectionTitle}>
              {agents.length > 0 ? `${agents.length} ${t('verifiedAgentsCount')}` : t('verifiedAgentsCount')}
            </Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>{t('verifiedBadgeText')}</Text>
            </View>
          </View>
          <Text style={styles.agentsSectionSubtitle}>
            {t('selectBestAgent')}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingEmoji}>⏳</Text>
            <Text style={styles.loadingText}>{t('loadingAgents')}</Text>
          </View>
        ) : (
          <>
            {agents.map((agent, index) => {
              const gradientColors = getGradientColors(index);
              const rank = getRankEmoji(index);
              const popularBadges = getPopularBadges();
              const popularBadge = popularBadges[index] || null;
              const isFeatured = index === 0;

              return (
                <View key={agent.name} style={[styles.cardWrapper, isFeatured && styles.featuredWrapper]}>

                  {/* FEATURED BANNER */}
                  {isFeatured && (
                    <LinearGradient
                      colors={[COLORS.GOLD, '#FFA500']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.featuredBanner}
                    >
                      <Text style={styles.featuredBannerText}>{t('featuredBannerText')}</Text>
                    </LinearGradient>
                  )}

                  <View style={[styles.glassContainer, isFeatured && styles.featuredGlass]}>
                    <LinearGradient
                      colors={[`${gradientColors[0]}18`, `${gradientColors[0]}08`, `${gradientColors[0]}03`]}
                      style={styles.glassGradient}
                    >

                      {/* RANK + POPULAR BADGE ROW */}
                      <View style={styles.badgesRow}>
                        {rank && (
                          <View style={[styles.rankBadge, { borderColor: rank.color + '60' }]}>
                            <Text style={styles.rankEmoji}>{rank.emoji}</Text>
                            <Text style={[styles.rankLabel, { color: rank.color }]}>{rank.label}</Text>
                          </View>
                        )}
                        {popularBadge && (
                          <LinearGradient
                            colors={isFeatured ? [COLORS.GOLD, '#FF8C00'] : [gradientColors[0], gradientColors[1]]}
                            style={styles.popularBadge}
                          >
                            <Text style={styles.popularBadgeText}>{popularBadge}</Text>
                          </LinearGradient>
                        )}
                      </View>

                      {/* AGENT HEADER */}
                      <View style={styles.agentHeader}>
                        <View style={styles.agentLogoWrapper}>
                          <LinearGradient colors={gradientColors} style={styles.agentLogoGradient}>
                            <View style={styles.agentLogoContainer}>
                              <Image
                                source={{ uri: agent.logo }}
                                style={styles.agentLogo}
                                resizeMode="contain"
                              />
                            </View>
                          </LinearGradient>
                        </View>

                        <View style={styles.agentHeaderInfo}>
                          <Text style={styles.agentName}>{agent.name}</Text>

                          <View style={styles.ratingRow}>
                            <Text style={styles.star}>⭐</Text>
                            <Text style={styles.ratingText}>{agent.rating}/5</Text>
                            <Text style={styles.reviewsText}>({agent.reviews} {t('reviewsCount')})</Text>
                          </View>

                          <View style={styles.foundedRow}>
                            <Text style={styles.foundedText}>{t('sinceLabel')} {agent.founded}</Text>
                            {agent.trustpilot?.rating && (
                              <Text style={styles.trustpilotText}>  TP: {agent.trustpilot.rating}⭐</Text>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* BONUS HIGHLIGHT - FOMO CARD */}
                      {agent.bonus && (
                        <LinearGradient
                          colors={[`${gradientColors[0]}30`, `${gradientColors[1]}15`]}
                          style={styles.bonusCard}
                        >
                          <View style={styles.bonusLeft}>
                            <Text style={styles.bonusLabel}>{t('exclusiveBonus')}</Text>
                            <Text style={styles.bonusValue}>{agent.bonus}</Text>
                          </View>
                          <View style={styles.bonusFree}>
                            <Text style={styles.bonusFreeText}>{t('freeLabel')}</Text>
                          </View>
                        </LinearGradient>
                      )}

                      {/* DESCRIPTION */}
                      {agent.description && (
                        <Text style={styles.agentDescription}>{agent.description}</Text>
                      )}

                      {/* STATS GRID */}
                      <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                          <LinearGradient colors={[`${COLORS.PRIMARY}25`, `${COLORS.PRIMARY}10`]} style={styles.statGradient}>
                            <Text style={styles.statLabel}>{t('qcSuccessLabel')}</Text>
                            <Text style={[styles.statValue, { color: COLORS.PRIMARY }]}>{agent.qcSuccess}</Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.statBox}>
                          <LinearGradient colors={['#ffffff08', '#ffffff03']} style={styles.statGradient}>
                            <Text style={styles.statLabel}>{t('shippingLabel')}</Text>
                            <Text style={styles.statValue}>{agent.shippingTime?.split('/')[0]?.trim() || 'N/A'}</Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.statBox}>
                          <LinearGradient colors={['#ffffff08', '#ffffff03']} style={styles.statGradient}>
                            <Text style={styles.statLabel}>{t('commissionLabel')}</Text>
                            <Text style={styles.statValue}>{agent.commission}</Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.statBox}>
                          <LinearGradient colors={['#ffffff08', '#ffffff03']} style={styles.statGradient}>
                            <Text style={styles.statLabel}>{t('shippingCostPerKg')}</Text>
                            <Text style={[styles.statValue, { fontSize: 10 }]}>{agent.shippingCost}</Text>
                          </LinearGradient>
                        </View>
                      </View>

                      {/* RECOMMENDATION */}
                      {agent.recommendation && (
                        <View style={styles.recommendationContainer}>
                          <LinearGradient
                            colors={[`${gradientColors[0]}25`, `${gradientColors[0]}10`]}
                            style={styles.recommendationGradient}
                          >
                            <Text style={styles.recommendationIcon}>💡</Text>
                            <Text style={styles.recommendationText}>{agent.recommendation}</Text>
                          </LinearGradient>
                        </View>
                      )}

                      {/* PROS */}
                      {agent.pros && (
                        <View style={styles.prosSection}>
                          <View style={styles.prosHeader}>
                            <LinearGradient colors={['#00d4aa', '#00a3ff']} style={styles.prosBadge}>
                              <Text style={styles.prosBadgeText}>{t('prosStrongPoints')}</Text>
                            </LinearGradient>
                          </View>
                          {agent.pros.split(',').slice(0, 5).map((pro: string) => (
                            <View key={pro.trim()} style={styles.listItem}>
                              <Text style={styles.bulletGreen}>●</Text>
                              <Text style={styles.listText}>{pro.trim()}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* CONS */}
                      {agent.cons && (
                        <View style={styles.consSection}>
                          <View style={styles.prosHeader}>
                            <LinearGradient colors={['#FF3366', '#FF6B6B']} style={styles.prosBadge}>
                              <Text style={styles.prosBadgeText}>{t('consKeepInMind')}</Text>
                            </LinearGradient>
                          </View>
                          {agent.cons.split(',').slice(0, 3).map((con: string) => (
                            <View key={con.trim()} style={styles.listItem}>
                              <Text style={styles.bulletRed}>●</Text>
                              <Text style={[styles.listText, { color: '#FF9999' }]}>{con.trim()}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* STORAGE */}
                      {agent.storage && (
                        <View style={styles.storageRow}>
                          <Text style={styles.storageIcon}>🏬</Text>
                          <Text style={styles.storageText}>{agent.storage}</Text>
                        </View>
                      )}

                      {/* CTA BUTTON */}
                      <Animated.View style={isFeatured ? featuredStyle : undefined}>
                        <TouchableOpacity
                          style={styles.registerButtonContainer}
                          onPress={() => handleRegister(agent.register)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={isFeatured ? [COLORS.GOLD, '#FF8C00'] : gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.registerButton}
                          >
                            <Text style={[styles.registerButtonText, isFeatured && { color: '#000' }]}>
                              {t('registerFreeIn')} {agent.name} →
                            </Text>
                            <Text style={[styles.registerButtonSubtext, isFeatured && { color: '#00000090' }]}>
                              {agent.badge} • {t('noRegistrationCost')}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>

                    </LinearGradient>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ===== AI RECOMMENDATION CTA ===== */}
        {!loading && agents.length > 0 && (
          <TouchableOpacity
            style={styles.aiCTAContainer}
            onPress={() => router.push('/chat')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['rgba(0,102,255,0.20)', 'rgba(255,51,102,0.15)']}
              style={styles.aiCTA}
            >
              <Text style={styles.aiCTAIcon}>🤖</Text>
              <View style={styles.aiCTAText}>
                <Text style={styles.aiCTATitle}>{t('dontKnowWhich')}</Text>
                <Text style={styles.aiCTASubtitle}>
                  {t('aiAssistantHelp')}
                </Text>
              </View>
              <Text style={styles.aiCTAArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  // HEADER
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 20, paddingBottom: 12,
    zIndex: 100, borderBottomWidth: 1, borderBottomColor: 'rgba(30,30,30,0.3)',
  },
  headerImage: { opacity: 0.25 },
  logo: { fontSize: 32, fontWeight: '900', color: COLORS.PRIMARY },
  tagline: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
  gradientBarContainer: { height: 6, width: '100%' },
  gradientBar: { height: '100%', borderRadius: 2 },
  subBanner: { position: 'absolute', left: 0, right: 0, zIndex: 99 },
  subBannerGradient: { paddingVertical: 10, paddingHorizontal: 20, minHeight: 40 },

  // SCROLL
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // HERO
  heroSection: {
    paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  heroUrgencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderWidth: 1, borderColor: COLORS.PRIMARY + '60',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    marginBottom: 16,
  },
  heroUrgencyText: { fontSize: 12, fontWeight: '700', color: COLORS.PRIMARY },
  heroTitle: {
    fontSize: 34, fontWeight: '900', color: COLORS.TEXT_PRIMARY,
    lineHeight: 40, marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15, color: COLORS.TEXT_SECONDARY, lineHeight: 22, marginBottom: 24,
  },
  trustRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  trustItem: { flex: 1, alignItems: 'center' },
  trustIcon: { fontSize: 18, marginBottom: 4 },
  trustValue: { fontSize: 15, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  trustLabel: { fontSize: 10, color: COLORS.TEXT_TERTIARY, textAlign: 'center' },

  // HOW IT WORKS
  howSection: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionTitle: {
    fontSize: 20, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 16,
  },
  stepsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepCard: { flex: 1, position: 'relative' },
  stepGradient: {
    borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,102,255,0.20)',
    marginHorizontal: 2,
  },
  stepNumberBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: { fontSize: 12, fontWeight: '900', color: '#fff' },
  stepIcon: { fontSize: 22, marginBottom: 6 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: COLORS.TEXT_PRIMARY, textAlign: 'center', marginBottom: 4 },
  stepDesc: { fontSize: 10, color: COLORS.TEXT_TERTIARY, textAlign: 'center', lineHeight: 14 },
  stepArrow: {
    position: 'absolute', right: -6, top: '40%',
    fontSize: 18, color: COLORS.TEXT_TERTIARY, zIndex: 1,
  },

  // WHY AGENT
  whySection: {
    paddingHorizontal: 20, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  whyGrid: { flexDirection: 'row', gap: 8 },
  whyCard: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  whyGradient: {
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.20)', borderRadius: 14,
  },
  whyIcon: { fontSize: 22, marginBottom: 8 },
  whyTitle: { fontSize: 12, fontWeight: '800', color: COLORS.TEXT_PRIMARY, textAlign: 'center', marginBottom: 4 },
  whyDesc: { fontSize: 10, color: COLORS.TEXT_TERTIARY, textAlign: 'center', lineHeight: 14 },

  // AGENTS SECTION HEADER
  agentsSection: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  agentsSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  verifiedBadge: {
    backgroundColor: 'rgba(0,212,170,0.12)',
    borderWidth: 1, borderColor: COLORS.PRIMARY + '50',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  verifiedBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.PRIMARY },
  agentsSectionSubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 12 },

  // LOADING
  loadingContainer: { alignItems: 'center', paddingTop: 50 },
  loadingEmoji: { fontSize: 32, marginBottom: 12 },
  loadingText: { fontSize: 14, color: COLORS.TEXT_TERTIARY },

  // CARD
  cardWrapper: { marginHorizontal: 20, marginBottom: 20 },
  featuredWrapper: {
    ...Platform.select({
      ios: { shadowColor: COLORS.GOLD, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20 },
      android: { elevation: 16 },
    }),
  },
  featuredBanner: {
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingVertical: 7, paddingHorizontal: 16, alignItems: 'center',
  },
  featuredBannerText: { fontSize: 11, fontWeight: '900', color: '#000', letterSpacing: 0.5 },
  glassContainer: {
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  featuredGlass: {
    borderTopLeftRadius: 0, borderTopRightRadius: 0,
    borderColor: COLORS.GOLD + '50', borderTopWidth: 0,
  },
  glassGradient: { padding: 18, backgroundColor: 'rgba(20,20,20,0.4)' },

  // BADGES ROW
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rankEmoji: { fontSize: 14 },
  rankLabel: { fontSize: 12, fontWeight: '900' },
  popularBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    justifyContent: 'center',
  },
  popularBadgeText: { fontSize: 11, fontWeight: '800', color: '#000' },

  // AGENT HEADER
  agentHeader: {
    flexDirection: 'row', marginBottom: 14,
    paddingBottom: 14, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  agentLogoWrapper: { marginRight: 14 },
  agentLogoGradient: { width: 74, height: 74, borderRadius: 16, padding: 2 },
  agentLogoContainer: {
    width: 70, height: 70, borderRadius: 14,
    backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center',
  },
  agentLogo: { width: 60, height: 60 },
  agentHeaderInfo: { flex: 1, justifyContent: 'center' },
  agentName: {
    fontSize: 22, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  star: { fontSize: 14 },
  ratingText: { fontSize: 14, fontWeight: '700', color: COLORS.GOLD },
  reviewsText: { fontSize: 12, color: COLORS.TEXT_TERTIARY },
  foundedRow: { flexDirection: 'row', alignItems: 'center' },
  foundedText: { fontSize: 11, color: COLORS.TEXT_TERTIARY },
  trustpilotText: { fontSize: 11, color: COLORS.TEXT_TERTIARY },

  // BONUS CARD (FOMO)
  bonusCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  bonusLeft: { flex: 1 },
  bonusLabel: { fontSize: 10, fontWeight: '800', color: COLORS.PRIMARY, marginBottom: 3 },
  bonusValue: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_PRIMARY, lineHeight: 18 },
  bonusFree: {
    backgroundColor: COLORS.PRIMARY, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, marginLeft: 10,
  },
  bonusFreeText: { fontSize: 11, fontWeight: '900', color: '#000' },

  // DESCRIPTION
  agentDescription: {
    fontSize: 13, color: '#aaa', lineHeight: 19,
    marginBottom: 14, fontStyle: 'italic',
  },

  // STATS GRID
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  statGradient: {
    padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 10,
  },
  statLabel: { fontSize: 10, color: COLORS.TEXT_TERTIARY, marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 12, fontWeight: '700', color: COLORS.TEXT_PRIMARY, textAlign: 'center' },

  // RECOMMENDATION
  recommendationContainer: { marginBottom: 14, borderRadius: 12, overflow: 'hidden' },
  recommendationGradient: {
    flexDirection: 'row', padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12,
  },
  recommendationIcon: { fontSize: 16, marginRight: 8 },
  recommendationText: { flex: 1, fontSize: 12, color: '#ccc', lineHeight: 17, fontWeight: '600' },

  // PROS / CONS
  prosSection: { marginBottom: 12 },
  consSection: { marginBottom: 12 },
  prosHeader: { marginBottom: 8 },
  prosBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  prosBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  listItem: { flexDirection: 'row', marginBottom: 6, paddingLeft: 2, alignItems: 'flex-start' },
  bulletGreen: { fontSize: 8, color: COLORS.PRIMARY, marginRight: 8, marginTop: 5 },
  bulletRed: { fontSize: 8, color: '#FF6B6B', marginRight: 8, marginTop: 5 },
  listText: { fontSize: 12, color: '#bbb', flex: 1, lineHeight: 18 },

  // STORAGE
  storageRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 10, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  storageIcon: { fontSize: 14, marginRight: 8 },
  storageText: { fontSize: 12, color: '#aaa', flex: 1 },

  // REGISTER BUTTON
  registerButtonContainer: {
    borderRadius: 14, overflow: 'hidden', marginTop: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  registerButton: { paddingVertical: 17, paddingHorizontal: 20, alignItems: 'center' },
  registerButtonText: {
    fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 3,
  },
  registerButtonSubtext: { fontSize: 11, fontWeight: '600', color: '#ffffff90' },

  // AI CTA
  aiCTAContainer: {
    marginHorizontal: 20, marginTop: 8, marginBottom: 16,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,102,255,0.30)',
  },
  aiCTA: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18,
  },
  aiCTAIcon: { fontSize: 34, marginRight: 14 },
  aiCTAText: { flex: 1 },
  aiCTATitle: { fontSize: 16, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  aiCTASubtitle: { fontSize: 12, color: COLORS.TEXT_SECONDARY, lineHeight: 17 },
  aiCTAArrow: { fontSize: 28, color: COLORS.SECONDARY, fontWeight: '700' },

  bottomSpacer: { height: 20 },
});
