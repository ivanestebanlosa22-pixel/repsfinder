import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
  Image,
  useWindowDimensions,
  Alert,
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
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { logger } from '../../src/utils/logger';

const HEADER_BG = 'https://www.shutterstock.com/image-photo/front-cargo-container-ship-ocean-600nw-2659440041.jpg';

// ==================== CONSTANTS ====================
const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  BACKGROUND: '#000',
  CARD_BG: 'rgba(20, 20, 20, 0.4)',
  CARD_BG_DARK: 'rgba(10, 10, 10, 0.4)',
  BORDER: 'rgba(40, 40, 40, 0.3)',
  BORDER_LIGHT: 'rgba(30, 30, 30, 0.3)',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  SUCCESS: '#00d4aa',
  WARNING: '#FFD700',
  DANGER: '#FF4444',
  PURPLE: '#8B5CF6',
  ORANGE: '#f59e0b',
  GREEN: '#22c55e',
  BLUE: '#3B82F6',
} as const;

// ==================== FOTOS QC Y ADICIONALES ====================
const QC_PHOTOS = [
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818909/IMG_20260131_010247_owl7wb.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818907/IMG_20260131_010258_f08z79.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818908/IMG_20260131_010311_a55qda.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818908/IMG_20260131_010131_i11pc5.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818908/IMG_20260131_010056_hlkvj1.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818909/IMG_20260131_010143_sx0adu.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818907/IMG_20260131_010155_kqegwh.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818907/IMG_20260131_010356_rlnshw.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818909/IMG_20260131_010119_h5g2pk.jpg',
];

const ADDITIONAL_PHOTOS = [
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818909/IMG_20260131_002711_1_bcwy8t.jpg',
  'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818908/IMG_20260131_002659_1_ewizwb.jpg',
];

// ==================== WHAT YOU WILL LEARN ====================
const LEARN_CHECKLIST = [
  { icon: '🔍', textKey: 'learnChecklistFind' },
  { icon: '🤝', textKey: 'learnChecklistChoose' },
  { icon: '💸', textKey: 'learnChecklistPay' },
  { icon: '📸', textKey: 'learnChecklistReview' },
  { icon: '📦', textKey: 'learnChecklistManage' },
  { icon: '💰', textKey: 'learnChecklistSave' },
];

export default function LearnScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showAllBonuses, setShowAllBonuses] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const bonusesSectionRef = useRef<View>(null);
  const qcScrollRef = useRef<ScrollView>(null);
  const additionalScrollRef = useRef<ScrollView>(null);

  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const players = {
    USFANS: useVideoPlayer('https://res.cloudinary.com/dwlpodhzy/video/upload/v1769911954/45as6addwqqwgdssljqiw121_oyscl5.mp4'),
    OPPBUY: useVideoPlayer('https://res.cloudinary.com/dwlpodhzy/video/upload/v1769823134/opb_20250428_intro_plqdn5.mp4'),
  };

  // Auto-scroll para fotos QC y adicionales - MEMORY LEAK FIXED
  useEffect(() => {
    let qcScrollInterval: NodeJS.Timeout | null = null;
    let additionalScrollInterval: NodeJS.Timeout | null = null;

    if (expandedStep === 5 && qcScrollRef.current) {
      let qcPosition = 0;
      qcScrollInterval = setInterval(() => {
        qcPosition += 5;
        if (qcPosition > QC_PHOTOS.length * 280) qcPosition = 0;
        qcScrollRef.current?.scrollTo({ x: qcPosition, animated: true });
      }, 30);
    }

    if (expandedStep === 6 && additionalScrollRef.current) {
      let additionalPosition = 0;
      additionalScrollInterval = setInterval(() => {
        additionalPosition += 5;
        if (additionalPosition > ADDITIONAL_PHOTOS.length * 280) additionalPosition = 0;
        additionalScrollRef.current?.scrollTo({ x: additionalPosition, animated: true });
      }, 30);
    }

    return () => {
      if (qcScrollInterval) { clearInterval(qcScrollInterval); qcScrollInterval = null; }
      if (additionalScrollInterval) { clearInterval(additionalScrollInterval); additionalScrollInterval = null; }
    };
  }, [expandedStep]);

  // ==================== AGENT BONUSES ====================
  const AGENT_BONUSES = [
    {
      name: 'USFans',
      logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6825a376b16be873d3c23e82/0x0.png',
      code: 'RCGD5YSI',
      bonus: t('agentUsfansBonus'),
      description: t('agentUsfansDesc'),
      color: COLORS.BLUE,
      registerUrl: 'https://www.usfans.com/register?ref=RCGD5YSI',
    },
    {
      name: 'Mulebuy',
      logo: 'https://play-lh.googleusercontent.com/me8g4K2VHs3N83yTMrIrl3pbNeTGl7j1zWECI6l3NtGEfb1-hUyx2qv1Xuny70Tp-aA=s512-rw',
      code: '200642502',
      bonus: t('agentMulebuyBonus'),
      description: t('agentMulebuyDesc'),
      color: COLORS.PURPLE,
      registerUrl: 'https://mulebuy.com/register?ref=200642502',
    },
    {
      name: 'Litbuy',
      logo: 'https://litbuy.net/favicon.ico',
      code: 'YBMHFG55L',
      bonus: t('agentLitbuyBonus'),
      description: t('agentLitbuyDesc'),
      color: COLORS.ORANGE,
      registerUrl: 'https://litbuy.com/register?inviteCode=YBMHFG55L',
    },
    {
      name: 'Oppbuy',
      logo: 'https://play-lh.googleusercontent.com/Xd2k3p7CXVEDP3OsbQW986WN-Jo3LAGGeL7iJIBHdAkdRdisugQUISqfbWPp060vHjx1=s512-rw',
      code: 'GH40R4J0O',
      bonus: t('agentOppbuyBonus'),
      description: t('agentOppbuyDesc'),
      color: COLORS.GREEN,
      registerUrl: 'https://oopbuy.com/register?inviteCode=GH40R4J0O',
    },
    {
      name: 'Kakobuy',
      logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b6/7e/d2/b67ed289-2dee-c62b-39a9-0afbd509f379/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg',
      code: 'hc9hzsSI',
      bonus: t('agentKakobuyBonus'),
      description: t('agentKakobuyDesc'),
      color: COLORS.SUCCESS,
      registerUrl: 'https://ikako.vip/r/hc9hzsSI',
    },
    {
      name: 'Joyagoo',
      logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/a4/16/eea41644-dd37-7212-9eac-ce82b8512c5e/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/512x512bb.jpg',
      code: '300768147',
      bonus: t('agentJoyagooBonus'),
      description: t('agentJoyagooDesc'),
      color: COLORS.ACCENT,
      registerUrl: 'https://joyagoo.com/register?ref=300768147',
    },
  ];

  // ==================== GUIDE STEPS ====================
  const GUIDE_STEPS = [
    {
      id: 1,
      title: t('learnStep1Title'),
      shortTitle: t('learnStep1Short'),
      description: t('learnStep1Desc'),
      image: 'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769813376/IMG_20260126_122741_2_g8bxzb.jpg',
      tips: [t('learnStep1Tip1'), t('learnStep1Tip2'), t('learnStep1Tip3'), t('learnStep1Tip4')],
      color: COLORS.PURPLE,
      readTime: '2 min',
      actionButton: { text: t('learnStep1Action'), action: 'discovery' },
    },
    {
      id: 2,
      title: t('learnStep2Title'),
      shortTitle: t('learnStep2Short'),
      description: t('learnStep2Desc'),
      image: 'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769825015/IMG_20260131_030210_y72dby.jpg',
      tips: [t('learnStep2Tip1'), t('learnStep2Tip2'), t('learnStep2Tip3'), t('learnStep2Tip4')],
      color: COLORS.BLUE,
      readTime: '3 min',
      hasVideo: 'USFANS',
      videoTitle: t('learnStep2Video'),
      videoUrl: 'https://res.cloudinary.com/dwlpodhzy/video/upload/v1769911954/45as6addwqqwgdssljqiw121_oyscl5.mp4',
    },
    {
      id: 3,
      title: t('learnStep3Title'),
      shortTitle: t('learnStep3Short'),
      description: t('learnStep3Desc'),
      image: 'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818908/IMG_20260131_002003_1_fytmku.jpg',
      tips: [t('learnStep3Tip1'), t('learnStep3Tip2'), t('learnStep3Tip3'), t('learnStep3Tip4')],
      color: COLORS.SUCCESS,
      readTime: '2 min',
      actionButton: { text: t('learnStep3Action'), action: 'scrollToBonuses' },
    },
    {
      id: 4,
      title: t('learnStep4Title'),
      shortTitle: t('learnStep4Short'),
      description: t('learnStep4Desc'),
      image: 'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818908/IMG_20260131_002003_1_fytmku.jpg',
      tips: [t('learnStep4Tip1'), t('learnStep4Tip2'), t('learnStep4Tip3'), t('learnStep4Tip4')],
      color: COLORS.ORANGE,
      readTime: '3 min',
      hasVideo: 'OPPBUY',
      videoTitle: t('learnStep4Video'),
      videoUrl: 'https://res.cloudinary.com/dwlpodhzy/video/upload/v1769823134/opb_20250428_intro_plqdn5.mp4',
    },
    {
      id: 5,
      title: t('learnStep5Title'),
      shortTitle: t('learnStep5Short'),
      description: t('learnStep5Desc'),
      image: 'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818909/IMG_20260131_010247_owl7wb.jpg',
      tips: [t('learnStep5Tip1'), t('learnStep5Tip2'), t('learnStep5Tip3'), t('learnStep5Tip4'), t('learnStep5Tip5')],
      color: COLORS.ACCENT,
      readTime: '4 min',
      warningBox: { title: t('learnStep5Warning'), text: t('learnStep5WarningText') },
      hasQCPhotos: true,
    },
    {
      id: 6,
      title: t('learnStep6Title'),
      shortTitle: t('learnStep6Short'),
      description: t('learnStep6Desc'),
      image: 'https://res.cloudinary.com/dwlpodhzy/image/upload/v1769818909/IMG_20260131_002711_1_bcwy8t.jpg',
      tips: [t('learnStep6Tip1'), t('learnStep6Tip2'), t('learnStep6Tip3'), t('learnStep6Tip4'), t('learnStep6Tip5')],
      color: COLORS.GREEN,
      readTime: '3 min',
      actionButton: { text: t('learnStep6Action'), action: 'external', url: 'https://www.17track.net' },
      hasAdditionalPhotos: true,
    },
  ];

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => logger.error('Error opening link:', err));
  };

  const copyCode = (code: string, name: string) => {
    Alert.alert(
      t('learnBonusCopied'),
      t('learnBonusCopiedMessage', { code, name }),
      [
        {
          text: t('learnBonusRegisterNow'), onPress: () => {
            const agent = AGENT_BONUSES.find(a => a.code === code);
            if (agent) openLink(agent.registerUrl);
          }
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const toggleStep = (id: number) => {
    const isClosing = expandedStep === id;
    setExpandedStep(isClosing ? null : id);
    if (isClosing && !completedSteps.includes(id)) {
      setCompletedSteps(prev => [...prev, id]);
    }
  };

  const handleActionButton = (action: string, url?: string) => {
    if (action === 'scrollToBonuses') {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } else if (action === 'external' && url) {
      openLink(url);
    } else if (action === 'discovery') {
      Alert.alert(t('learnFinalAlert'), t('learnFinalAlertText'));
    }
  };

  const progress = Math.round((completedSteps.length / GUIDE_STEPS.length) * 100);

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
        style={[styles.content, { marginTop: statusBarHeight + 120 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ===== HERO ===== */}
        <LinearGradient
          colors={['rgba(0,102,255,0.10)', 'rgba(139,92,246,0.08)', 'transparent']}
          style={styles.heroSection}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>📚 {t('learnFreeGuide')} · 15 min</Text>
          </View>

          <Text style={styles.heroTitle}>
            {t('learnHeroMainTitle')}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('learnHeroMainSubtitle')}
          </Text>

          {/* TRUST ROW */}
           <View style={styles.heroTrustRow}>
              <View style={styles.heroTrustItem}>
                <Text style={styles.heroTrustValue}>100%</Text>
                <Text style={styles.heroTrustLabel}>{t('learnFreeLabel')}</Text>
              </View>
              <View style={styles.heroTrustDivider} />
              <View style={styles.heroTrustItem}>
                <Text style={styles.heroTrustValue}>6 {t('learnStepsLabel')}</Text>
                <Text style={styles.heroTrustLabel}>{t('learnCompleteLabel')}</Text>
              </View>
              <View style={styles.heroTrustDivider} />
              <View style={styles.heroTrustItem}>
                <Text style={styles.heroTrustValue}>15 min</Text>
                <Text style={styles.heroTrustLabel}>{t('learnReadingLabel')}</Text>
              </View>
            </View>

          {/* PROGRESS BAR */}
          {completedSteps.length > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{t('progressTitle')}</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[COLORS.PRIMARY, COLORS.SECONDARY]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progress}%` as any }]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                {t('progressText', { completed: completedSteps.length, total: GUIDE_STEPS.length })}
              </Text>
            </View>
          )}
        </LinearGradient>

         {/* ===== QUÉ VAS A APRENDER ===== */}
         <View style={styles.checklistSection}>
           <Text style={styles.sectionTitle}>{t('learnWhatYouLearnTitle')}</Text>
           <Text style={styles.sectionSubtitle}>{t('learnWhatYouLearnSubtitle')}</Text>
           <View style={styles.checklistGrid}>
             {LEARN_CHECKLIST.map((item) => (
               <View key={item.icon} style={styles.checklistItem}>
                 <LinearGradient
                   colors={['rgba(0,212,170,0.10)', 'rgba(0,212,170,0.04)']}
                   style={styles.checklistGradient}
                 >
                    <Text style={styles.checklistIcon}>{item.icon}</Text>
                    <Text style={styles.checklistText}>{t(item.textKey)}</Text>
                 </LinearGradient>
               </View>
             ))}
           </View>
         </View>

         {/* ===== GUÍA PASO A PASO ===== */}
         <View style={styles.guideSection}>
           <View style={styles.guideTitleRow}>
             <Text style={styles.sectionTitle}>{t('learnGuideTitle')}</Text>
             <View style={styles.stepCountBadge}>
               <Text style={styles.stepCountText}>{GUIDE_STEPS.length} {t('learnStepsLabel')}</Text>
             </View>
           </View>
           <Text style={styles.sectionSubtitle}>{t('learnGuideSubtitle')}</Text>

          {GUIDE_STEPS.map((step, stepIndex) => {
            const isExpanded = expandedStep === step.id;
            const isDone = completedSteps.includes(step.id);

            return (
              <View key={step.id} style={styles.stepWrapper}>
                {/* CONNECTOR LINE */}
                {stepIndex < GUIDE_STEPS.length - 1 && (
                  <View style={[styles.stepConnector, { borderColor: isDone ? step.color : 'rgba(255,255,255,0.08)' }]} />
                )}

                <View style={[styles.stepCard, isDone && { borderColor: step.color + '50' }]}>
                  {/* STEP HEADER */}
                  <TouchableOpacity
                    style={[styles.stepHeader, { borderLeftColor: step.color }]}
                    onPress={() => toggleStep(step.id)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[`${step.color}20`, 'transparent']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={StyleSheet.absoluteFill}
                    />

                    <View style={[styles.stepNumberCircle, { backgroundColor: isDone ? step.color : `${step.color}30`, borderColor: step.color }]}>
                      {isDone
                        ? <Text style={styles.stepDoneIcon}>✓</Text>
                        : <Text style={styles.stepNumberText}>{step.id}</Text>
                      }
                    </View>

                    <View style={styles.stepHeaderContent}>
                      <View style={styles.stepHeaderRow}>
                        <Text style={styles.stepTitle}>{step.shortTitle}</Text>
                        {step.readTime && (
                          <View style={styles.readTimeBadge}>
                            <Text style={styles.readTimeText}>⏱ {step.readTime}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.stepDescription} numberOfLines={2}>
                        {step.description}
                      </Text>
                    </View>

                    <View style={[styles.expandIcon, { backgroundColor: isExpanded ? step.color : `${step.color}30` }]}>
                      <Text style={styles.expandIconText}>{isExpanded ? '▼' : '▶'}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* EXPANDED CONTENT */}
                  {isExpanded && (
                    <View style={styles.stepContent}>
                      <Text style={styles.stepFullTitle}>{step.title}</Text>

                      {/* MAIN PHOTO */}
                      <View style={styles.photoContainer}>
                        <Image source={{ uri: step.image }} style={styles.stepPhoto} resizeMode="cover" />
                      </View>

                      {/* VIDEO TUTORIAL */}
                      {step.hasVideo && (
                        <View style={styles.videoSection}>
                          <Text style={styles.videoSectionTitle}>{step.videoTitle}</Text>
                          {step.videoUrl ? (
                            <VideoView
                              player={players[step.hasVideo as keyof typeof players]}
                              style={styles.video}
                              nativeControls
                              contentFit="contain"
                            />
                          ) : (
                            <View style={styles.videoPlaceholder}>
                              <Text style={styles.videoPlaceholderIcon}>🎬</Text>
                              <Text style={styles.videoPlaceholderText}>{t('learnVideoPlaceholder')}</Text>
                              <Text style={styles.videoPlaceholderHint}>{t('learnVideoHint')}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* QC PHOTOS SCROLL (PASO 5) */}
                      {step.hasQCPhotos && (
                        <View style={styles.photoContainer}>
                          <ScrollView
                            ref={qcScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginHorizontal: -20 }}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                          >
                            {QC_PHOTOS.map((photoUrl) => (
                              <Image
                                key={photoUrl}
                                source={{ uri: photoUrl }}
                                style={{ width: 260, height: 340, borderRadius: 12, marginRight: 12 }}
                                resizeMode="cover"
                              />
                            ))}
                          </ScrollView>
                        </View>
                      )}

                      {/* ADDITIONAL PHOTOS SCROLL (PASO 6) */}
                      {step.hasAdditionalPhotos && (
                        <View style={styles.photoContainer}>
                          <ScrollView
                            ref={additionalScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginHorizontal: -20 }}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                          >
                            {ADDITIONAL_PHOTOS.map((photoUrl) => (
                              <Image
                                key={photoUrl}
                                source={{ uri: photoUrl }}
                                style={{ width: 260, height: 340, borderRadius: 12, marginRight: 12 }}
                                resizeMode="cover"
                              />
                            ))}
                          </ScrollView>
                        </View>
                      )}

                      {/* PRO TIPS */}
                      <View style={[styles.tipsContainer, { borderColor: step.color }]}>
                        <Text style={[styles.tipsTitle, { color: step.color }]}>
                          💡 {t('learnProTips')}
                        </Text>
                        {step.tips.map((tip) => (
                          <View key={`${step.id}-tip-${tip.substring(0, 20)}`} style={styles.tipRow}>
                            <View style={[styles.tipDot, { backgroundColor: step.color }]} />
                            <Text style={styles.tipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>

                      {/* WARNING BOX */}
                      {step.warningBox && (
                        <View style={styles.warningBox}>
                          <Text style={styles.warningTitle}>⚠️ {step.warningBox.title}</Text>
                          <Text style={styles.warningText}>{step.warningBox.text}</Text>
                        </View>
                      )}

                      {/* ACTION BUTTON */}
                      {step.actionButton && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: step.color }]}
                          onPress={() => handleActionButton(step.actionButton!.action, step.actionButton!.url)}
                        >
                          <Text style={styles.actionButtonText}>{step.actionButton.text}</Text>
                        </TouchableOpacity>
                      )}

                      {/* MARK AS READ */}
                      <TouchableOpacity
                        style={[styles.markDoneButton, { borderColor: isDone ? step.color : 'rgba(255,255,255,0.12)' }]}
                        onPress={() => toggleStep(step.id)}
                      >
                        <Text style={[styles.markDoneText, { color: isDone ? step.color : COLORS.TEXT_TERTIARY }]}>
                          {isDone ? t('learnStepCompleted', { step: step.id }) : `${t('learnMarkAsRead')} →`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ===== BONUS CODES — SECCIÓN DE CONVERSIÓN ===== */}
        <View style={styles.bonusesWrapper} ref={bonusesSectionRef}>

          {/* SECTION HEADER */}
          <LinearGradient
            colors={['rgba(255,51,102,0.15)', 'rgba(255,51,102,0.05)']}
            style={styles.bonusesHeader}
          >
            <View style={styles.bonusesHeaderLeft}>
              <View style={styles.exclusiveBadge}>
                <Text style={styles.exclusiveBadgeText}>🔒 {t('learnExclusiveBadge')}</Text>
              </View>
              <Text style={styles.bonusesTitle}>{t('learnBonusTitle')}</Text>
              <Text style={styles.bonusesSubtitle}>
                {t('learnBonusSubtitle')}
              </Text>
            </View>
            <View style={styles.bonusesBadgeBox}>
              <Text style={styles.bonusesBadgeValue}>{t('learnBonusValue')}</Text>
              <Text style={styles.bonusesBadgeLabel}>{t('learnBonusValueLabel')}</Text>
            </View>
          </LinearGradient>

          <View style={styles.bonusesSection}>
            {AGENT_BONUSES.slice(0, showAllBonuses ? AGENT_BONUSES.length : 3).map((agent) => (
              <View key={agent.name} style={[styles.bonusCard, { borderColor: agent.color + '60' }]}>
                <LinearGradient
                  colors={[`${agent.color}10`, `${agent.color}04`]}
                  style={styles.bonusCardContent}
                >
                  {/* TOP ROW */}
                  <TouchableOpacity
                    style={styles.bonusHeader}
                    onPress={() => openLink(agent.registerUrl)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: agent.logo }} style={styles.bonusLogo} />
                    <View style={styles.bonusInfo}>
                      <Text style={styles.bonusName}>{agent.name}</Text>
                      <Text style={[styles.bonusBonus, { color: agent.color }]}>{agent.bonus}</Text>
                      <Text style={styles.bonusDescription}>{agent.description}</Text>
                    </View>
                    <View style={[styles.bonusFreeTag, { backgroundColor: agent.color }]}>
                      <Text style={styles.bonusFreeTagText}>GRATIS</Text>
                    </View>
                  </TouchableOpacity>

                  {/* CODE BOX - SUTIL */}
                   <View style={[styles.codeContainer, { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }]}>
                     <View style={styles.codeLeft}>
                       <Text style={styles.codeLabel}>🎁 {t('learnBonusYourCode')}</Text>
                       <Text style={[styles.codeText, { color: 'rgba(255,255,255,0.25)', fontSize: 10 }]}>{agent.code}</Text>
                     </View>
                     <TouchableOpacity
                       style={[styles.copyButton, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                       onPress={() => copyCode(agent.code, agent.name)}
                     >
                       <Text style={[styles.copyButtonText, { color: 'rgba(255,255,255,0.5)' }]}>{t('learnBonusCopy')}</Text>
                     </TouchableOpacity>
                   </View>

                  {/* REGISTER CTA */}
                  <TouchableOpacity
                    style={[styles.registerButtonSubtle, { borderColor: agent.color }]}
                    onPress={() => openLink(agent.registerUrl)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.registerButtonSubtleText, { color: agent.color }]}>
                      {t('learnRegisterIn')} →
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}

            {!showAllBonuses && (
              <Animated.View style={pulseStyle}>
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllBonuses(true)}
                >
                  <LinearGradient
                    colors={['rgba(255,51,102,0.15)', 'rgba(255,51,102,0.08)']}
                    style={styles.showMoreGradient}
                  >
                    <Text style={styles.showMoreButtonText}>
                      🔓 {t('learnViewMoreAgents')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>

        {/* ===== SUCCESS STORIES ===== */}
        <View style={styles.storiesSection}>
          <Text style={styles.sectionTitle}>{t('learnStoriesTitle')}</Text>
          <Text style={styles.sectionSubtitle}>{t('learnStoriesSubtitle')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.storiesScroll}
            contentContainerStyle={styles.storiesScrollContent}
          >
            {[
              { savings: '$450', items: '12 items', agent: 'Mulebuy', color: COLORS.PURPLE, rating: 5, avatar: '👟' },
              { savings: '$380', items: '9 items', agent: 'USFans', color: COLORS.BLUE, rating: 5, avatar: '👕' },
              { savings: '$290', items: '6 items', agent: 'Kakobuy', color: COLORS.SUCCESS, rating: 5, avatar: '🧢' },
              { savings: '$520', items: '15 items', agent: 'Oppbuy', color: COLORS.GREEN, rating: 5, avatar: '👜' },
            ].map((story) => (
              <View key={story.agent} style={[styles.storyCard, { borderColor: story.color + '60' }]}>
                <LinearGradient
                  colors={[`${story.color}15`, `${story.color}05`]}
                  style={styles.storyGradient}
                >
                  <Text style={styles.storyAvatar}>{story.avatar}</Text>
                  <Text style={[styles.storySavings, { color: story.color }]}>{story.savings}</Text>
                  <Text style={styles.storyLabel}>{t('learnStoriesSaved')}</Text>
                  <View style={[styles.storyDivider, { backgroundColor: story.color + '40' }]} />
                  <Text style={styles.storyItems}>{story.items}</Text>
                  <Text style={styles.storyRating}>{'⭐'.repeat(story.rating)}</Text>
                  <Text style={[styles.storyAgent, { color: story.color }]}>
                    {t('learnStoriesVia')} {story.agent}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ===== TOOLS SECTION ===== */}
        <View style={styles.toolsSection}>
          <LinearGradient
            colors={[COLORS.SECONDARY, COLORS.ACCENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.toolsGradient}
          >
            <Text style={styles.toolsIcon}>{t('learnToolsIcon')}</Text>
            <Text style={styles.toolsTitle}>{t('learnToolsTitle')}</Text>
            <Text style={styles.toolsSubtitle}>{t('learnToolsSubtitle')}</Text>
            <TouchableOpacity
              style={styles.toolsButton}
              onPress={() => openLink('https://chinabuyhub.com')}
            >
              <Text style={styles.toolsButtonText}>{t('learnToolsButton')}</Text>
            </TouchableOpacity>
            <Text style={styles.toolsFooter}>{t('learnToolsFooter')}</Text>
          </LinearGradient>
        </View>

        {/* ===== FAQ ===== */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>{t('learnFaqTitle')}</Text>
          {[
            { q: t('learnFaq1Q'), a: t('learnFaq1A'), color: COLORS.BLUE },
            { q: t('learnFaq2Q'), a: t('learnFaq2A'), color: COLORS.SUCCESS },
            { q: t('learnFaq3Q'), a: t('learnFaq3A'), color: COLORS.ORANGE },
            { q: t('learnFaq4Q'), a: t('learnFaq4A'), color: COLORS.ACCENT },
          ].map((faq) => (
            <View key={faq.q} style={[styles.faqCard, { borderLeftColor: faq.color }]}>
              <Text style={styles.faqQuestion}>❓ {faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* ===== FINAL CTA ===== */}
        <View style={styles.finalSection}>
          <LinearGradient
            colors={['rgba(0,212,170,0.15)', 'rgba(0,102,255,0.10)']}
            style={styles.finalGradient}
          >
            <Text style={styles.finalEmoji}>{t('learnFinalEmoji')}</Text>
            <Text style={styles.finalTitle}>{t('learnFinalTitle')}</Text>
            <Text style={styles.finalSubtitle}>{t('learnFinalSubtitle')}</Text>

            <TouchableOpacity
               style={styles.finalButtonPrimary}
               onPress={() => router.push('/(tabs)/validar')}
               activeOpacity={0.8}
             >
               <LinearGradient
                 colors={['#667eea', '#FF3366']}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 0 }}
                 style={styles.finalButtonGradient}
               >
                 <Text style={styles.finalButtonText}>{t('learnFinalButton')}</Text>
               </LinearGradient>
             </TouchableOpacity>

            <TouchableOpacity
              style={styles.finalButtonSecondary}
              onPress={() => router.push('/(tabs)/agentes')}
              activeOpacity={0.8}
            >
              <Text style={styles.finalButtonSecondaryText}>{t('learnViewVerifiedAgents')} →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

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
    zIndex: 100, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER_LIGHT,
  },
  headerImage: { opacity: 0.25 },
  logo: { fontSize: 32, fontWeight: '900', color: COLORS.PRIMARY },
  tagline: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
  gradientBarContainer: { height: 6, width: '100%' },
  gradientBar: { height: '100%', borderRadius: 2 },
  subBanner: { position: 'absolute', left: 0, right: 0, zIndex: 99 },
  subBannerGradient: { paddingVertical: 10, paddingHorizontal: 20, minHeight: 40 },
  content: { flex: 1 },

  // HERO
  heroSection: {
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1, borderColor: COLORS.PURPLE + '60',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.PURPLE },
  heroTitle: {
    fontSize: 32, fontWeight: '900', color: COLORS.TEXT_PRIMARY,
    lineHeight: 38, marginBottom: 12,
  },
  heroSubtitle: { fontSize: 15, color: COLORS.TEXT_SECONDARY, lineHeight: 22, marginBottom: 22 },
  heroTrustRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  heroTrustItem: { flex: 1, alignItems: 'center' },
  heroTrustValue: { fontSize: 16, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  heroTrustLabel: { fontSize: 11, color: COLORS.TEXT_TERTIARY, marginTop: 2 },
  heroTrustDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.10)' },

  // PROGRESS
  progressContainer: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.PRIMARY + '30',
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: COLORS.PRIMARY },
  progressPercent: { fontSize: 13, fontWeight: '900', color: COLORS.PRIMARY },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 8 },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressSubtext: { fontSize: 11, color: COLORS.TEXT_TERTIARY },

  // CHECKLIST
  checklistSection: {
    paddingHorizontal: 20, paddingVertical: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 6 },
  sectionSubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 16 },
  checklistGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checklistItem: { width: '48%', borderRadius: 12, overflow: 'hidden' },
  checklistGradient: {
    padding: 12, flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.20)', borderRadius: 12, gap: 8,
  },
  checklistIcon: { fontSize: 16, marginTop: 1 },
  checklistText: { fontSize: 12, color: '#bbb', flex: 1, lineHeight: 17 },

  // GUIDE
  guideSection: { paddingHorizontal: 20, paddingVertical: 24 },
  guideTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  stepCountBadge: {
    backgroundColor: 'rgba(0,102,255,0.15)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.SECONDARY + '40',
  },
  stepCountText: { fontSize: 12, fontWeight: '700', color: COLORS.SECONDARY },

  stepWrapper: { position: 'relative', marginBottom: 12 },
  stepConnector: {
    position: 'absolute', left: 27, top: 70, bottom: -14,
    width: 2, borderLeftWidth: 2, borderStyle: 'dashed', zIndex: -1,
  },
  stepCard: {
    backgroundColor: COLORS.CARD_BG, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.BORDER, overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row', padding: 16, alignItems: 'center', borderLeftWidth: 4,
  },
  stepNumberCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, borderWidth: 2,
  },
  stepNumberText: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  stepDoneIcon: { fontSize: 20, fontWeight: '900', color: '#fff' },
  stepHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  stepHeaderContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  readTimeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  readTimeText: { fontSize: 10, color: COLORS.TEXT_TERTIARY },
  stepDescription: { fontSize: 12, color: COLORS.TEXT_SECONDARY, lineHeight: 17 },
  expandIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  expandIconText: { fontSize: 12, fontWeight: '900', color: COLORS.TEXT_PRIMARY },

  stepContent: { borderTopWidth: 1, borderTopColor: COLORS.BORDER_LIGHT, padding: 20 },
  stepFullTitle: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 20 },
  photoContainer: { marginBottom: 20 },
  stepPhoto: { width: '100%', height: 220, borderRadius: 12 },
  videoSection: { marginBottom: 20 },
  videoSectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 12 },
  videoPlaceholder: {
    backgroundColor: COLORS.CARD_BG_DARK, borderRadius: 12, padding: 40, alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.BORDER, borderStyle: 'dashed',
  },
  videoPlaceholderIcon: { fontSize: 48, marginBottom: 12 },
  videoPlaceholderText: { fontSize: 14, fontWeight: '800', color: COLORS.TEXT_SECONDARY, marginBottom: 8 },
  videoPlaceholderHint: { fontSize: 12, color: COLORS.TEXT_TERTIARY, textAlign: 'center' },
  video: { width: '100%', height: 200, borderRadius: 12 },
  tipsContainer: {
    backgroundColor: COLORS.CARD_BG_DARK, borderRadius: 12, padding: 16, marginBottom: 14, borderLeftWidth: 4,
  },
  tipsTitle: { fontSize: 14, fontWeight: '900', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginRight: 12, marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 19 },
  warningBox: {
    backgroundColor: `${COLORS.DANGER}15`, borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 2, borderColor: COLORS.DANGER,
  },
  warningTitle: { fontSize: 14, fontWeight: '900', color: COLORS.DANGER, marginBottom: 6 },
  warningText: { fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 19 },
  actionButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  actionButtonText: { fontSize: 14, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  markDoneButton: {
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, backgroundColor: 'transparent',
  },
  markDoneText: { fontSize: 13, fontWeight: '700' },

  // BONUSES
  bonusesWrapper: { marginBottom: 32 },
  bonusesHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 20, marginBottom: 0,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,51,102,0.20)',
  },
  bonusesHeaderLeft: { flex: 1, marginRight: 12 },
  exclusiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,51,102,0.20)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.ACCENT + '50',
  },
  exclusiveBadgeText: { fontSize: 10, fontWeight: '900', color: COLORS.ACCENT, letterSpacing: 0.5 },
  bonusesTitle: { fontSize: 20, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 6 },
  bonusesSubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 18 },
  bonusesBadgeBox: { alignItems: 'center' },
  bonusesBadgeValue: { fontSize: 22, fontWeight: '900', color: COLORS.ACCENT, textAlign: 'center' },
  bonusesBadgeLabel: { fontSize: 10, color: COLORS.TEXT_TERTIARY, textAlign: 'center' },

  bonusesSection: { paddingHorizontal: 20, paddingTop: 16 },
  bonusCard: {
    borderRadius: 14, marginBottom: 14, borderWidth: 1, overflow: 'hidden',
  },
  bonusCardContent: { padding: 14, borderRadius: 14 },
  bonusHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  bonusLogo: { width: 46, height: 46, borderRadius: 10, marginRight: 10 },
  bonusInfo: { flex: 1 },
  bonusName: { fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 3 },
  bonusBonus: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  bonusDescription: { fontSize: 12, color: COLORS.TEXT_SECONDARY, lineHeight: 16 },
  bonusFreeTag: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
  },
  bonusFreeTagText: { fontSize: 10, fontWeight: '900', color: '#000' },
  codeContainer: {
     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
     padding: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1,
   },
   codeLeft: { flex: 1 },
   codeLabel: { fontSize: 9, fontWeight: '600', color: COLORS.TEXT_TERTIARY, marginBottom: 1 },
   codeText: { fontSize: 10, fontWeight: '400', letterSpacing: 0.5, opacity: 0.3 },
   copyButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
   copyButtonText: { fontSize: 10, fontWeight: '600' },
  registerButtonSubtle: {
    paddingVertical: 12, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', backgroundColor: 'transparent',
  },
  registerButtonSubtleText: { fontSize: 13, fontWeight: '700' },
  showMoreButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 4 },
  showMoreGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  showMoreButtonText: { fontSize: 14, fontWeight: '800', color: COLORS.ACCENT },

  // STORIES
  storiesSection: { marginBottom: 32 },
  storiesScroll: { paddingLeft: 20 },
  storiesScrollContent: { paddingRight: 20 },
  storyCard: { borderRadius: 16, marginRight: 12, width: 155, overflow: 'hidden', borderWidth: 1 },
  storyGradient: { padding: 18, alignItems: 'center', borderRadius: 16 },
  storyAvatar: { fontSize: 28, marginBottom: 8 },
  storySavings: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  storyLabel: { fontSize: 10, fontWeight: '900', color: COLORS.TEXT_TERTIARY, marginBottom: 10 },
  storyDivider: { width: 40, height: 1, marginBottom: 10 },
  storyItems: { fontSize: 13, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 5 },
  storyRating: { fontSize: 11, marginBottom: 5 },
  storyAgent: { fontSize: 11, fontWeight: '700' },

  // TOOLS
  toolsSection: { marginHorizontal: 20, marginBottom: 32, borderRadius: 20, overflow: 'hidden' },
  toolsGradient: { padding: 28, alignItems: 'center' },
  toolsIcon: { fontSize: 42, marginBottom: 14 },
  toolsTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 10, textAlign: 'center' },
  toolsSubtitle: { fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 21, marginBottom: 20, opacity: 0.95 },
  toolsButton: { backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, marginBottom: 14 },
  toolsButtonText: { fontSize: 14, fontWeight: '900', color: '#000' },
  toolsFooter: { fontSize: 11, color: '#fff', opacity: 0.8 },

  // FAQ
  faqSection: { paddingHorizontal: 20, marginBottom: 32 },
  faqCard: {
    backgroundColor: COLORS.CARD_BG, borderRadius: 12, padding: 16, marginBottom: 10, borderLeftWidth: 4,
  },
  faqQuestion: { fontSize: 14, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 8 },
  faqAnswer: { fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 19 },

  // FINAL CTA
  finalSection: { marginHorizontal: 20, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  finalGradient: {
    padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.PRIMARY + '40', borderRadius: 20,
  },
  finalEmoji: { fontSize: 44, marginBottom: 14 },
  finalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 10, textAlign: 'center' },
  finalSubtitle: { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  finalButtonPrimary: { width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  finalButtonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  finalButtonText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  finalButtonSecondary: { paddingVertical: 12, alignItems: 'center' },
  finalButtonSecondaryText: { fontSize: 14, fontWeight: '700', color: COLORS.PRIMARY },

  bottomSpacer: { height: Platform.OS === 'ios' ? 100 : 95 },
});
