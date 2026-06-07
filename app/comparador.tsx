import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
  Linking,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  parseProductLink,
  generateAgentLinks,
  computeAgentComparisons,
  type AgentComparison,
  type ParsedLink,
} from '../src/utils/productLinks';
import * as Sentry from '@sentry/react-native';

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
  TEXT_DARK: '#555',
  OVERLAY: 'rgba(0,0,0,0.94)',
} as const;

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  weidian: { label: 'Weidian', color: '#E44D26' },
  taobao: { label: 'Taobao', color: '#FF6A00' },
  '1688': { label: '1688', color: '#FF4400' },
};

const AGENT_COLORS: Record<string, string> = {
  mulebuy: '#00d4aa',
  joyagoo: '#FF6B35',
  usfans: '#E53935',
  hipobuy: '#7C4DFF',
  litbuy: '#FF4081',
  oopbuy: '#448AFF',
  acbuy: '#FF9100',
  allchinabuy: '#00BCD4',
  superbuy: '#F44336',
  kakobuy: '#4CAF50',
};

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={skeletonStyles.card}>
      <Animated.View style={[skeletonStyles.logo, { opacity }]} />
      <Animated.View style={[skeletonStyles.line, { opacity, width: '60%' }]} />
      <Animated.View style={[skeletonStyles.line, { opacity, width: '80%' }]} />
      <Animated.View style={[skeletonStyles.line, { opacity, width: '40%' }]} />
      <Animated.View style={[skeletonStyles.button, { opacity }]} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD_BG_DARK,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  line: {
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  button: {
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
});

function AgentCard({
  item,
  index,
}: {
  item: AgentComparison;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, index]);

  const agentColor = AGENT_COLORS[item.agentId] || COLORS.PRIMARY;

  return (
    <Animated.View
      style={[
        styles.agentCard,
        item.isBestDeal && styles.agentCardBestDeal,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      {item.isBestDeal && (
        <View style={styles.bestDealBadge}>
          <LinearGradient
            colors={['#00d4aa', '#00a3ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bestDealGradient}
          >
            <Text style={styles.bestDealText}>🏆 BEST DEAL</Text>
          </LinearGradient>
        </View>
      )}

      <View style={styles.agentCardHeader}>
        <View style={[styles.agentLogoRound, { backgroundColor: agentColor + '20' }]}>
          <Text style={[styles.agentLogoText, { color: agentColor }]}>
            {item.agentName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.agentName}>{item.agentName}</Text>
      </View>

      <View style={styles.agentCardBody}>
        <InfoRow label="Product" value={`$${item.productPriceUSD.toFixed(2)}`} />
        <InfoRow
          label="Service fee"
          value={`$${item.serviceFeeUSD.toFixed(2)} (${item.feePercent}%)`}
        />
        <InfoRow label="Est. shipping" value={item.shippingEstimate} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL EST</Text>
          <Text style={styles.totalValue}>
            ~${item.totalMin.toFixed(0)}–{item.totalMax.toFixed(0)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.buyButton, { backgroundColor: agentColor }]}
        onPress={() => Linking.openURL(item.buyUrl)}
        activeOpacity={0.8}
      >
        <Text style={styles.buyButtonText}>BUY WITH {item.agentName.toUpperCase()} →</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => Linking.openURL(item.registerUrl)}
        activeOpacity={0.7}
      >
        <Text style={styles.registerText}>
          New user? Get a welcome bonus →
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ComparadorScreen() {
  const { t } = useTranslation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const [linkInput, setLinkInput] = useState('');
  const [parsedLink, setParsedLink] = useState<ParsedLink | null>(null);
  const [priceCNY, setPriceCNY] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState<AgentComparison[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMobile = SCREEN_WIDTH < 768;
  const numColumns = isMobile ? 2 : SCREEN_WIDTH < 1024 ? 3 : 4;

  const platformInfo = parsedLink
    ? PLATFORM_LABELS[parsedLink.platform]
    : null;

  useEffect(() => {
    if (linkInput.length > 5) {
      const result = parseProductLink(linkInput);
      setParsedLink(result);
    } else {
      setParsedLink(null);
    }
  }, [linkInput]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCompare = useCallback(async () => {
    Keyboard.dismiss();

    if (!parsedLink) {
      setError('Could not detect platform. Please paste a valid Weidian, Taobao, or 1688 link.');
      return;
    }

    const cny = parseFloat(priceCNY);
    if (!priceCNY || isNaN(cny) || cny <= 0) {
      setError('Please enter the product price in CNY (¥).');
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(false);
    setComparisons([]);

    try {
      await new Promise<void>((resolve, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timed out. Please try again.'));
        }, 10000);

        setTimeout(() => {
          resolve();
        }, 1200);
      });

      const agents = generateAgentLinks(parsedLink);
      const results = computeAgentComparisons(agents, cny);
      setComparisons(results);
      setShowResults(true);
      setLoading(false);
    } catch (err: any) {
      Sentry.captureException(err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }, [parsedLink, priceCNY]);

  const formatCNY = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return priceCNY;
    if (parts[1] && parts[1].length > 2) return priceCNY;
    return cleaned;
  };

  const gridChunks: AgentComparison[][] = [];
  if (comparisons.length > 0) {
    for (let i = 0; i < comparisons.length; i += numColumns) {
      gridChunks.push(comparisons.slice(i, i + numColumns));
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />

      <LinearGradient
        colors={[COLORS.BACKGROUND, 'rgba(0, 212, 170, 0.05)', COLORS.BACKGROUND]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: statusBarHeight + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Agent Price Comparator</Text>
            <Text style={styles.subtitle}>
              Paste a product link to compare prices across all agents
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.linkInput}
                placeholder="Paste Weidian, Taobao or 1688 link..."
                placeholderTextColor={COLORS.TEXT_TERTIARY}
                value={linkInput}
                onChangeText={setLinkInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {platformInfo && (
                <View style={[styles.platformBadge, { backgroundColor: platformInfo.color + '30' }]}>
                  <Text style={[styles.platformBadgeText, { color: platformInfo.color }]}>
                    {platformInfo.label}
                  </Text>
                </View>
              )}
            </View>

            {parsedLink && (
              <View style={styles.parsedInfo}>
                <Text style={styles.parsedLabel}>Product ID:</Text>
                <Text style={styles.parsedValue}>{parsedLink.productId}</Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.pricePrefix}>¥</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.TEXT_TERTIARY}
                  value={priceCNY}
                  onChangeText={(val) => setPriceCNY(formatCNY(val))}
                  keyboardType="decimal-pad"
                />
              </View>
              {priceCNY && !isNaN(parseFloat(priceCNY)) && (
                <Text style={styles.usdEstimate}>
                  ≈ ${(parseFloat(priceCNY) * 0.14).toFixed(2)} USD
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.compareBtn,
                (!parsedLink || !priceCNY || loading) && styles.compareBtnDisabled,
              ]}
              onPress={handleCompare}
              disabled={!parsedLink || !priceCNY || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.SECONDARY, COLORS.ACCENT_BLUE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.compareBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.compareBtnText}>Compare Prices →</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError(null)} style={styles.errorDismiss}>
                <Text style={styles.errorDismissText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && (
            <View style={styles.loadingSection}>
              <Text style={styles.loadingTitle}>Searching product...</Text>
              <Text style={styles.loadingSub}>Fetching prices from all agents</Text>
              <View style={styles.skeletonGrid}>
                {Array.from({ length: isMobile ? 2 : 3 }).map((_, i) => (
                  <View key={i} style={{ flex: 1, marginHorizontal: 4 }}>
                    <SkeletonCard />
                  </View>
                ))}
              </View>
            </View>
          )}

          {showResults && comparisons.length > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.productSummary}>
                <LinearGradient
                  colors={['rgba(0, 212, 170, 0.1)', 'rgba(0, 163, 255, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.summaryCard}
                >
                  <Text style={styles.summaryPlatform}>
                    {platformInfo?.label || parsedLink?.platform} · ID: {parsedLink?.productId}
                  </Text>
                  <Text style={styles.summaryPriceCNY}>¥{parseFloat(priceCNY).toFixed(2)}</Text>
                  <Text style={styles.summaryPriceUSD}>
                    ≈ ${(parseFloat(priceCNY) * 0.14).toFixed(2)} USD
                  </Text>
                  <View style={styles.summaryBadgeRow}>
                    <View style={styles.summaryBadge}>
                      <Text style={styles.summaryBadgeText}>
                        {comparisons.length} agents compared
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <Text style={styles.gridTitle}>Agent Price Comparison</Text>
              <Text style={styles.gridSubtitle}>
                Sorted by total cost · Lowest price marked as Best Deal
              </Text>

              {gridChunks.map((chunk, chunkIdx) => (
                <View key={chunkIdx} style={styles.gridRow}>
                  {chunk.map((comp, i) => (
                    <View
                      key={comp.agentId}
                      style={[
                        styles.gridCell,
                        { flex: 1 / numColumns },
                        isMobile ? { width: '50%' } : {},
                      ]}
                    >
                      <AgentCard item={comp} index={chunkIdx * numColumns + i} />
                    </View>
                  ))}
                  {chunk.length < numColumns &&
                    Array.from({ length: numColumns - chunk.length }).map((_, i) => (
                      <View key={`spacer-${i}`} style={{ flex: 1 }} />
                    ))}
                </View>
              ))}

              <View style={styles.footerNote}>
                <Text style={styles.footerNoteText}>
                  * Shipping costs are estimates. Final total depends on weight, warehouse,
                  and shipping method selected.
                </Text>
              </View>
            </View>
          )}

          {!loading && !showResults && !error && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Ready to compare</Text>
              <Text style={styles.emptyDesc}>
                Paste a product link from Weidian, Taobao, or 1688, enter the price in CNY,
                and we'll show you the best agent deal.
              </Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleTitle}>Example links:</Text>
                <Text style={styles.exampleLink}>
                  weidian.com/item.html?itemID=1234567890
                </Text>
                <Text style={styles.exampleLink}>
                  item.taobao.com/item.htm?id=123456789012
                </Text>
                <Text style={styles.exampleLink}>
                  detail.1688.com/offer/123456789012.html
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: COLORS.PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 6,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
    gap: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  linkInput: {
    backgroundColor: COLORS.CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    paddingRight: 90,
  },
  platformBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  parsedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  parsedLabel: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
  parsedValue: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    flex: 1,
  },
  pricePrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  usdEstimate: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  compareBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  compareBtnDisabled: {
    opacity: 0.4,
  },
  compareBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    flex: 1,
    color: COLORS.ACCENT,
    fontSize: 13,
    lineHeight: 18,
  },
  errorDismiss: {
    padding: 4,
  },
  errorDismissText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: 16,
  },
  loadingSection: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  loadingSub: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 16,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  resultsSection: {
    gap: 8,
  },
  productSummary: {
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  summaryPlatform: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 8,
  },
  summaryPriceCNY: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  summaryPriceUSD: {
    fontSize: 18,
    color: COLORS.PRIMARY,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryBadge: {
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  summaryBadgeText: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  gridSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  gridCell: {
    minWidth: 0,
  },
  agentCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'visible',
  },
  agentCardBestDeal: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bestDealBadge: {
    position: 'absolute',
    top: -10,
    left: 10,
    zIndex: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bestDealGradient: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestDealText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  agentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  agentLogoRound: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentLogoText: {
    fontSize: 18,
    fontWeight: '800',
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    flexShrink: 1,
  },
  agentCardBody: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  buyButton: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  registerText: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
  footerNote: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.CARD_BG_DARK,
    borderRadius: 12,
  },
  footerNoteText: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exampleBox: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 6,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 4,
  },
  exampleLink: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
