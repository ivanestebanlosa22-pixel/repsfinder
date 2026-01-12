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
  Dimensions,
  Linking,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { SettingsButton } from '../../components/SettingsButton';
import { convertPrice, formatPrice } from '../../constants/currencies';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// GOOGLE SHEETS CONFIG
const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';

// URL para PRODUCTOS (pestaña MAIN)
const PRODUCTS_SHEET_NAME = 'MAIN';
const PRODUCTS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${PRODUCTS_SHEET_NAME}`;

// URL para AGENTES PREMIUM (pestaña AGENTES INDEX)
const PREMIUM_AGENTS_SHEET_NAME = 'AGENTES INDEX';
const PREMIUM_AGENTS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${PREMIUM_AGENTS_SHEET_NAME}`;

interface PremiumAgent {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviews: string;
  badge: string;
  badgeColor: string;
  buttonColor: string;
  url: string;
  code: string;
  bonusUSD: number;
}

function LoginRegisterModal({ visible, onClose }: any) {
  const { t } = useAppSettings();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t.error, 'Email y contraseña son obligatorios');
      return;
    }

    try {
      const users = await AsyncStorage.getItem('repsfinder_users');
      const userList = users ? JSON.parse(users) : [];
      const user = userList.find((u: any) => u.email === email && u.password === password);

      if (user) {
        await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(user));
        Alert.alert('¡Bienvenido!', `Hola ${user.username}`);
        setEmail('');
        setPassword('');
        onClose();
      } else {
        Alert.alert(t.error, 'Email o contraseña incorrectos');
      }
    } catch (error) {
      Alert.alert(t.error, 'No se pudo iniciar sesión');
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(t.error, 'Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t.error, 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert(t.error, 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const users = await AsyncStorage.getItem('repsfinder_users');
      const userList = users ? JSON.parse(users) : [];

      if (userList.find((u: any) => u.email === email)) {
        Alert.alert(t.error, 'Este email ya está registrado');
        return;
      }

      const newUser = { username, email, password, createdAt: new Date().toISOString() };
      userList.push(newUser);
      await AsyncStorage.setItem('repsfinder_users', JSON.stringify(userList));
      await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(newUser));

      Alert.alert(t.success, '¡Cuenta creada con éxito!');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      Alert.alert(t.error, 'No se pudo crear la cuenta');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isLogin ? t.authLogin : t.authRegister}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>{t.authLogin}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>{t.authRegister}</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.authUsername}</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Tu nombre de usuario"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.authEmail}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.authPassword}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.authConfirmPassword}</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={isLogin ? handleLogin : handleRegister}
          >
            <Text style={styles.actionButtonText}>
              {isLogin ? t.authLoginButton : t.authRegisterButton}
            </Text>
          </TouchableOpacity>

          {!isLogin && (
            <Text style={styles.termsText}>{t.authTerms}</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, currency } = useAppSettings();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [premiumAgents, setPremiumAgents] = useState<PremiumAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const agentsRef = useRef<ScrollView>(null);
  const productsRef = useRef<ScrollView>(null);
  const agentsScrollX = useRef(0);
  const productsScrollX = useRef(0);

  useEffect(() => {
    loadFeaturedProducts();
    loadPremiumAgents();
  }, []);

  // Cargar productos desde Google Sheets (pestaña MAIN)
  const loadFeaturedProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_SHEET_URL);
      const text = await response.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;

      const products = [];
      const today = new Date();
      const rotationIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 48)) % 10;

      for (let i = 1; i < Math.min(rows.length, 50); i++) {
        const cells = rows[i]?.c || [];
        if ((i - 1) % 10 === rotationIndex && products.length < 10) {
          products.push({
            nombre: cells[1]?.v || 'Producto',
            precio: parseFloat(cells[4]?.v || '0'),
            foto: cells[8]?.v || 'https://via.placeholder.com/180',
            rating: parseFloat(cells[6]?.v || '0'),
            ventas: parseInt(cells[7]?.v || '0'),
            linkUsfans: cells[11]?.v,
            linkCnfans: cells[12]?.v,
            linkLitbuy: cells[13]?.v,
          });
        }
      }

      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar agentes premium desde Google Sheets (pestaña AGENTES INDEX)
  const loadPremiumAgents = async () => {
    try {
      const response = await fetch(PREMIUM_AGENTS_SHEET_URL);
      const text = await response.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;

      const agents: PremiumAgent[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i]?.c || [];

        agents.push({
          id: cells[0]?.v || `agent-${i}`,
          name: cells[1]?.v || '',
          logo: cells[2]?.v || 'https://via.placeholder.com/100',
          rating: parseFloat(cells[3]?.v || '0'),
          reviews: cells[4]?.v || '0',
          badge: cells[5]?.v || '',
          badgeColor: cells[6]?.v || '#00e5b0',
          buttonColor: cells[7]?.v || '#00e5b0',
          url: cells[8]?.v || '',
          code: cells[9]?.v || '',
          bonusUSD: parseFloat(cells[10]?.v || '0'),
        });
      }

      setPremiumAgents(agents.filter(a => a.name));
    } catch (error) {
      console.error('Error loading premium agents:', error);
    }
  };

  // AUTO-SCROLL AGENTES
  useEffect(() => {
    if (premiumAgents.length === 0) return;

    const interval = setInterval(() => {
      if (agentsRef.current) {
        const maxScroll = (premiumAgents.length * 216) - SCREEN_WIDTH;
        agentsScrollX.current += 216;

        if (agentsScrollX.current >= maxScroll) {
          agentsScrollX.current = 0;
        }

        agentsRef.current.scrollTo({ x: agentsScrollX.current, animated: true });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [premiumAgents]);

  // AUTO-SCROLL PRODUCTOS
  useEffect(() => {
    const interval = setInterval(() => {
      if (productsRef.current && featuredProducts.length > 0) {
        const maxScroll = (featuredProducts.length * 196) - SCREEN_WIDTH;
        productsScrollX.current += 196;

        if (productsScrollX.current >= maxScroll) {
          productsScrollX.current = 0;
        }

        productsRef.current.scrollTo({ x: productsScrollX.current, animated: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredProducts]);

  const goToValidate = (productIndex?: number) => {
    router.push('/validate' as any);
  };

  const goToAgent = (agentId: string) => {
    router.push('/agents' as any);
  };

  const goToLegal = () => {
    router.push('/legal' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <AnimatedBackground />

      {/* HEADER PREMIUM CON SELECTOR DE IDIOMA/MONEDA */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 15 }]}>
        <View>
          <Text style={styles.logo}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>
        <SettingsButton />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: statusBarHeight + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t.homeWelcome}</Text>
          <Text style={styles.heroSubtitle}>{t.homeSubtitle}</Text>
        </View>

        {/* AGENTES PREMIUM CON AUTO-SCROLL - DESDE GOOGLE SHEETS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.homeTopAgents}</Text>
          <Text style={styles.sectionSubtitle}>{t.homeTopAgentsNote}</Text>

          <ScrollView
            ref={agentsRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.agentsScroll}
            onScrollBeginDrag={() => {}}
          >
            {premiumAgents.map(agent => (
              <TouchableOpacity
                key={agent.id}
                style={styles.agentCard}
                onPress={() => goToAgent(agent.id)}
              >
                <View style={[styles.agentBadge, { backgroundColor: agent.badgeColor }]}>
                  <Text style={styles.agentBadgeText}>{agent.badge}</Text>
                </View>

                <View style={styles.agentLogoContainer}>
                  <Image source={{ uri: agent.logo }} style={styles.agentLogo} resizeMode="contain" />
                </View>

                <Text style={styles.agentName}>{agent.name}</Text>

                <View style={styles.agentRating}>
                  <Text style={styles.agentRatingText}>⭐ {agent.rating}</Text>
                  <Text style={styles.agentReviews}>({agent.reviews})</Text>
                </View>

                <Text style={styles.agentBonus}>
                  {formatPrice(convertPrice(agent.bonusUSD, 'USD', currency), currency)} {t.agentsBonus.toLowerCase()}
                </Text>

                <TouchableOpacity
                  style={[styles.agentButton, { backgroundColor: agent.buttonColor }]}
                  onPress={() => Linking.openURL(agent.url)}
                >
                  <Text style={styles.agentButtonText}>{t.agentsRegister}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* POR QUÉ REPSFINDER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.homeWhyRepsfinder}</Text>

          {[
            { icon: '✓', text: t.benefit1, color: '#00e5b0' },
            { icon: '🛡️', text: t.benefit2, color: '#4FACFE' },
            { icon: '💬', text: t.benefit3, color: '#FFD700' },
            { icon: '📊', text: t.benefit4, color: '#FF6B6B' },
            { icon: '👥', text: t.benefit5, color: '#A8EDEA' },
            { icon: '🔧', text: t.benefit6, color: '#AB47BC' },
            { icon: '💯', text: t.benefit7, color: '#4ade80' },
          ].map((item, index) => (
            <View key={index} style={[styles.benefitItem, { borderLeftColor: item.color }]}>
              <Text style={styles.benefitIcon}>{item.icon}</Text>
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ESTADÍSTICAS CON MÁS COLORES */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>{t.homeStats}</Text>

          <View style={[styles.statCard, { borderColor: '#4FACFE', backgroundColor: 'rgba(79, 172, 254, 0.05)' }]}>
            <Text style={[styles.statValue, { color: '#4FACFE' }]}>{t.stat1Value}</Text>
            <Text style={styles.statLabel}>{t.stat1Label}</Text>
          </View>

          <View style={[styles.statCard, { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.05)' }]}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>{t.stat2Value}</Text>
            <Text style={styles.statLabel}>{t.stat2Label}</Text>
          </View>

          <View style={[styles.statCard, { borderColor: '#FF6B6B', backgroundColor: 'rgba(255, 107, 107, 0.05)' }]}>
            <Text style={[styles.statValue, { color: '#FF6B6B' }]}>{t.stat3Value}</Text>
            <Text style={styles.statLabel}>{t.stat3Label}</Text>
          </View>
        </View>

        {/* COMPARATIVA RÁPIDA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.homeComparison}</Text>
          <Text style={styles.comparisonNote}>{t.homeComparisonNote}</Text>

          <View style={styles.comparisonTable}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonHeaderText}>{t.comparisonAgent}</Text>
              <Text style={styles.comparisonHeaderText}>{t.comparisonSpeed}</Text>
              <Text style={styles.comparisonHeaderText}>{t.comparisonPrice}</Text>
              <Text style={styles.comparisonHeaderText}>{t.comparisonSupport}</Text>
            </View>

            {premiumAgents.slice(0, 5).map(agent => (
              <TouchableOpacity
                key={agent.id}
                style={styles.comparisonRow}
                onPress={() => goToAgent(agent.id)}
              >
                <Text style={styles.comparisonAgent}>{agent.name}</Text>
                <Text style={styles.comparisonData}>
                  {agent.rating >= 4.5 ? '⚡⚡⚡' : '⚡⚡'}
                </Text>
                <Text style={styles.comparisonData}>
                  {agent.bonusUSD >= 150 ? '💰💰💰' : '💰💰'}
                </Text>
                <Text style={styles.comparisonData}>
                  {agent.rating >= 4.7 ? '⭐⭐⭐' : '⭐⭐'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PRODUCTOS MÁS BUSCADOS CON AUTO-SCROLL Y BOTÓN COMPRAR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.homeFeaturedProducts}</Text>
          <Text style={styles.productsNote}>{t.homeProductsNote}</Text>

          {loading ? (
            <Text style={styles.loadingText}>{t.loading}</Text>
          ) : (
            <ScrollView
              ref={productsRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScrollBeginDrag={() => {}}
            >
              {featuredProducts.map((product, index) => (
                <View key={index} style={styles.productCard}>
                  <Image
                    source={{ uri: product.foto }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{product.nombre}</Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(convertPrice(product.precio, 'USD', currency), currency)}
                    </Text>
                    {product.rating > 0 && (
                      <View style={styles.productRating}>
                        <Text style={styles.productRatingText}>⭐ {product.rating}</Text>
                        {product.ventas > 0 && (
                          <Text style={styles.productSales}>({product.ventas})</Text>
                        )}
                      </View>
                    )}

                    {/* BOTÓN COMPRAR QUE REDIRIJE A VALIDATE */}
                    <TouchableOpacity
                      style={styles.productBuyButton}
                      onPress={() => goToValidate(index)}
                    >
                      <Text style={styles.productBuyButtonText}>Comprar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* CTA FINAL CON COLORES VARIADOS */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>{t.homeCTATitle}</Text>
          <Text style={styles.ctaSubtitle}>{t.homeCTASubtitle}</Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: '#00e5b0' }]}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.ctaButtonText}>{t.homeCTAButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: '#4FACFE' }]}
              onPress={goToLegal}
            >
              <Text style={styles.ctaButtonText}>{t.footerLegal}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LoginRegisterModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // CONTAINER
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },

  // HEADER PREMIUM
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#00e5b0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 2,
    fontWeight: '500',
  },

  // SCROLL
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 95,
  },

  // HERO SECTION
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    lineHeight: 24,
    fontWeight: '500',
  },

  // SECTIONS
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 16,
    fontWeight: '600',
  },

  // AGENTES
  agentsScroll: {
    marginTop: 8,
  },
  agentCard: {
    width: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  agentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  agentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  agentLogoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentLogo: {
    width: 80,
    height: 80,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  agentRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  agentRatingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  agentReviews: {
    fontSize: 12,
    color: '#666',
  },
  agentBonus: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00e5b0',
    textAlign: 'center',
    marginBottom: 12,
  },
  agentButton: {
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  agentButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
  },

  // BENEFICIOS CON BORDE COLORIDO
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderLeftWidth: 4,
  },
  benefitIcon: {
    fontSize: 20,
    color: '#00e5b0',
  },
  benefitText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
    fontWeight: '600',
  },

  // STATS CON FONDO DE COLOR
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#a0a0a0',
    fontWeight: '600',
  },

  // COMPARATIVA
  comparisonNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  comparisonTable: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: '#151515',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  comparisonHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#00e5b0',
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  comparisonAgent: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  comparisonData: {
    flex: 1,
    fontSize: 14,
    color: '#ddd',
    textAlign: 'center',
  },

  // PRODUCTOS CON BOTÓN COMPRAR
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  productsNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  productCard: {
    width: 180,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#151515',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    minHeight: 40,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00e5b0',
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  productRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  productSales: {
    fontSize: 10,
    color: '#666',
  },
  productBuyButton: {
    backgroundColor: '#4FACFE',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  productBuyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
  },

  // CTA CON MÁS VARIEDAD
  ctaContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  ctaButtons: {
    gap: 12,
  },
  ctaButton: {
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 20,
  },

  // MODAL
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalClose: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  tabActive: {
    backgroundColor: '#00e5b0',
    borderColor: '#00e5b0',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#000',
  },

  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
  },

  actionButton: {
    backgroundColor: '#00e5b0',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
  },

  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
