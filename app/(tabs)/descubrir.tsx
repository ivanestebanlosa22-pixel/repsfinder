import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
  Linking,
  Modal,
  TextInput,
  Alert,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  AppState,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '../../src/context/AppSettingsContext';
import { logger } from '../../src/utils/logger';
import { usePremium } from '../../src/context/PremiumContext';
import PremiumHomeModal from '../../src/components/premium/PremiumHomeModal';
import { signInWithGoogle, isGoogleSignInAvailable } from '../../src/utils/googleSignIn';
import * as Sentry from '@sentry/react-native';
import { supabase } from '../../src/utils/supabase';

// ==================== CONSTANTS ====================
const CONFIG = {
  SHEET_ID: '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8',
  SHEET_MAIN: 'MAIN',
  UPDATE_INTERVAL: 12 * 60 * 60 * 1000,
  PRODUCT_LIMIT: 10,
  ANIMATION_DURATION: 600,
  ANIMATION_DELAY: 80,
} as const;

const SHEET_URL_MAIN = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEET_MAIN}`;
// Descubrir → sección "Agentes top" lee de la pestaña AGENTS INDEX
const SHEET_URL_AGENTS = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=AGENTS%20INDEX`;

const IMAGES = {
  HERO: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&q=90',
  HEADER_BG: 'https://www.shutterstock.com/image-photo/front-cargo-container-ship-ocean-600nw-2659440041.jpg',
  ACCOUNT_BG: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
} as const;

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

const CURRENCY_CONVERSION = {
  EUR: 0.92,
  USD: 1,
} as const;

// Función para traducir categorías
const getCategoryTranslation = (categoria: string, t: any): string => {
  const categoryMap: { [key: string]: string } = {
    'ZAPATOS': t('categorySneakers'),
    'SHOES 👟': t('categorySneakers'),
    'HOODIES & SWEATSHIRTS': t('categoryHoodies'),
    'JACKETS🧥': t('categoryJackets'),
    'PANTS, SHORTS & SET👖🩳': t('categoryPants'),
    'T-SHIRTS👕': t('categoryTshirts'),
    'ZAPATILLAS': t('categorySneakers'),
    'CAZADORAS': t('categoryJackets'),
    'SUDADERAS': t('categoryHoodies'),
    'PANTALONES': t('categoryPants'),
    'CAMISETAS': t('categoryTshirts'),
    'CORTOS PANTALONES': t('categoryShorts'),
    'CHANDAL': t('categoryTracksuits'),
    'JERSEIS': t('categoryJerseys'),
    'GORRAS': t('categoryCaps'),
    'GORROS': t('categoryBeanies'),
    'CINTURONES': t('categoryBelts'),
    'PAÑUELOS BUFANDAS': t('categoryScarves'),
    'BOLSOS': t('categoryBags'),
    'CARTERAS': t('categoryWallets'),
    'PULSERAS JOYAS': t('categoryJewelry'),
    'GAFAS': t('categoryGlasses'),
    'CALCETINES': t('categorySocks'),
    'LLAVEROS': t('categoryKeychains'),
    'JVL ALTAVOCES': t('categorySpeakers'),
    'RELOG': t('categoryWatches'),
    'EKECTRONICA AUDIO': t('categoryElectronics'),
    'ACCESORIOS': t('categoryAccessories'),
    'PERFUMES': t('categoryPerfumes'),
    'RELOJES': t('categoryWatches'),
    'ELECTRONICA': t('categoryElectronics'),
    'Electronics': t('categoryElectronics'),
    'JOYERIA': t('categoryJewelry'),
    'ROPA INTERIOR': t('categoryUnderwear'),
    'Women👩': t('categoryWomen'),
    'KIDS 👦': t('categoryKids'),
    'OTROS': t('categoryOther'),
    'Accessories, Jewelry & Bags💎': t('categoryAccessories'),
  };

  // Si la categoría empieza con "Airpods Pro", retornar directamente
  if (categoria.startsWith('Airpods Pro')) {
    return 'Airpods Pro';
  }

  const translated = categoryMap[categoria] || categoria;
  return translated;
};

// ==================== TYPES ====================
interface Product {
  foto: string;
  nombre: string;
  precio: number;
  linkWeidian?: string;
  linkKakobuy?: string;
  linkUsfans?: string;
  linkMulebuy?: string;
  linkJoyagoo?: string;
  linkOppbuy?: string;
  linkLitbuy?: string;
  linkHipobuy?: string;
  linkSuperbuy?: string;
  linkAcbuy?: string;
  foto1?: string;
  foto2?: string;
  foto3?: string;
  foto4?: string;
  foto5?: string;
  foto6?: string;
  categoria: string;
  activo: string;
  rating: number;
  ventas: number;
}

// ==================== AGENT LINK GENERATOR ====================
const generateAgentLinks = (weidianUrl: string): {
  kakobuy: string;
  usfans: string;
  mulebuy: string;
  joyagoo: string;
  oppbuy: string;
  litbuy: string;
  hipobuy: string;
  superbuy: string;
  acbuy: string;
} | null => {
  if (!weidianUrl) return null;
  
  // Extraer ID del producto del link weidian
  const match = weidianUrl.match(/itemID[=:](\d+)/) || weidianUrl.match(/\/(\d+)(?:\?|$)/);
  if (!match) return null;
  
  const productId = match[1];
  
  return {
    kakobuy: `https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D${productId}&affcode=hc9hzsSI`,
    usfans: `https://www.usfans.com/product/3/${productId}?ref=RCGD5YSI`,
    mulebuy: `https://mulebuy.com/product/?shop_type=weidian&id=${productId}&ref=200642502`,
    joyagoo: `https://joyagoo.com/product?platform=WEIDIAN&id=${productId}&ref=300768147`,
    oppbuy: `https://oopbuy.com/product/weidian/${productId}?inviteCode=GH40R4J0O`,
    litbuy: `https://oopbuy.com/product/weidian/${productId}?inviteCode=GH40R4J0O`,
    hipobuy: `https://hipobuy.com/product/weidian/${productId}?inviteCode=YZKOGE9NE`,
    superbuy: `https://www.superbuy.com/en/page/buy/?platform=WD&id=${productId}&partnercode=Ey3NrI`,
    acbuy: `https://www.acbuy.com/product?id=${productId}&u=UD3WIU&source=WD`,
  };
};

interface Agent {
  id: string;
  name: string;
  logo: string;
  rating: number;
  costoEnvio: string;
  diasEnvio: string;
  verified: boolean;
}

type Currency = 'USD' | 'EUR';

// ==================== ANIMATED CARD ====================
const AnimatedCard = React.memo(({ children, delay = 0, style }: any) => {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  useEffect(() => {
    fadeAnim.value = withDelay(delay, withTiming(1, { duration: CONFIG.ANIMATION_DURATION }));
    slideAnim.value = withDelay(delay, withTiming(0, { duration: CONFIG.ANIMATION_DURATION }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
});
AnimatedCard.displayName = 'AnimatedCard';

// ==================== SKELETON LOADER ====================
const SkeletonLoader = React.memo(() => {
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {[1, 2, 3].map(i => (
        <Animated.View key={`skeleton-${i}`} style={[styles.skeletonCard, animatedStyle]}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonTextShort} />
        </Animated.View>
      ))}
    </ScrollView>
  );
});
SkeletonLoader.displayName = 'SkeletonLoader';

// ==================== PRODUCT CARD PREMIUM (CORREGIDO) ====================
const ProductCard = React.memo(({ product, index, currency, onValidate }: {
  product: Product;
  index: number;
  currency: Currency;
  onValidate: (product: Product) => void
}) => {
  const scaleAnim = useSharedValue(1);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  const handlePressIn = useCallback(() => {
    scaleAnim.value = withSpring(1.03, { damping: 5, stiffness: 200 });
  }, []);

  const handlePressOut = useCallback(() => {
    scaleAnim.value = withSpring(1, { damping: 5, stiffness: 200 });
  }, []);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const convertedPrice = useMemo(() => {
    const rate = CURRENCY_CONVERSION[currency];
    return (product.precio * rate).toFixed(2);
  }, [product.precio, currency]);

  const translatedCategory = useMemo(() => {
    return getCategoryTranslation(product.categoria, t);
  }, [product.categoria, t]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleValidate = () => {
    onValidate(product);
  };

  return (
    <AnimatedCard delay={index * CONFIG.ANIMATION_DELAY} style={styles.productCardWrapper}>
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.95}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.productInner,
            scaleStyle
          ]}
        >
          {/* Imagen con fallback */}
          <View style={styles.productImageContainer}>
            {imageError || !product.foto ? (
              <View style={styles.productImageFallback}>
                <Text style={styles.productImageFallbackText}>
                  {product.nombre.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: product.foto }}
                style={styles.productImageFull}
                resizeMode="cover"
                onError={handleImageError}
              />
            )}
          </View>
          {/* Info del producto */}
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productCategory}>{translatedCategory}</Text>
              {product.rating > 0 && (
                <View style={styles.productRatingBadge}>
                  <Text style={styles.productRatingText}>★ {product.rating}</Text>
                </View>
              )}
            </View>
            <Text style={styles.productName} numberOfLines={2}>
              {product.nombre}
            </Text>
            <Text style={styles.productPrice}>
              {currency} {convertedPrice}
            </Text>
            {/* Botón Validar PREMIUM */}
            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.SECONDARY, COLORS.ACCENT_BLUE]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.validateButtonGradient}
              >
                <Text style={styles.validateButtonText}>
                  {t('validateProduct')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </AnimatedCard>
  );
});
ProductCard.displayName = 'ProductCard';

// ==================== AGENT CARD ====================
const AgentCard = React.memo(({ agent, index, onPress }: { agent: Agent; index: number; onPress: (id: string) => void }) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    onPress(agent.id);
  }, [agent.id, onPress]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, [agent.name]);

  return (
    <AnimatedCard delay={index * 120} style={styles.agentCardWrapper}>
      <TouchableOpacity
        style={styles.agentCard}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        {!imageError && (
          <ImageBackground
            source={{ uri: agent.logo }}
            style={styles.agentBackgroundImage}
            imageStyle={{
              opacity: 0.12,
              resizeMode: 'contain',
            }}
            onError={handleImageError}
          />
        )}
        {agent.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ {t('verified')}</Text>
          </View>
        )}
        <View style={styles.agentLogoContainer}>
          {!imageError ? (
            <Image
              source={{ uri: agent.logo }}
              style={styles.agentLogoImage}
              resizeMode="contain"
              onError={handleImageError}
            />
          ) : (
            <View style={styles.agentLogoPlaceholder}>
              <Text style={styles.agentLogoPlaceholderText}>
                {agent.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.agentName}>{agent.name}</Text>
        <View style={styles.agentStats}>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t('rating')}</Text>
            <Text style={styles.agentStatValue}>★ {agent.rating}</Text>
          </View>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t('costoEnvio')}</Text>
            <Text style={styles.agentStatValue}>{agent.costoEnvio}</Text>
          </View>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t('diasEnvio')}</Text>
            <Text style={styles.agentStatValue}>{agent.diasEnvio}</Text>
          </View>
        </View>
        <View style={styles.agentButton}>
          <Text style={styles.agentButtonText}>{t('viewAgent')}</Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
});
AgentCard.displayName = 'AgentCard';

// ==================== LOGIN/REGISTER MODAL ====================
const LoginRegisterModal = React.memo(({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const saved = await AsyncStorage.getItem('repsfinder_remember');
          if (saved) {
            const { email: savedEmail, password: savedPass } = JSON.parse(saved);
            setEmail(savedEmail || '');
            setPassword(savedPass || '');
            setRememberMe(true);
          }
        } catch {}
      })();
    }
  }, [visible]);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
    setIsSubmitting(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowForgotPassword(false);
    setResetEmail('');
    setResetSent(false);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', t('errorLogin'));
      return;
    }
    setIsSubmitting(true);
    try {
      const users = await AsyncStorage.getItem('repsfinder_users');
      
      let userList: any[] = [];
      if (users) {
        try {
          userList = JSON.parse(users);
        } catch (parseError) {
          Sentry.captureException(parseError as Error);
          Alert.alert(t('error'), t('errorLoadingUserData'));
          return;
        }
      }
      
      const user = userList.find((u: any) => u.email === email && u.password === password);
      if (user) {
        await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(user));
        if (rememberMe) {
          await AsyncStorage.setItem('repsfinder_remember', JSON.stringify({ email, password }));
        } else {
          await AsyncStorage.removeItem('repsfinder_remember');
        }
        Alert.alert(t('welcomeMessage'), `${t('helloUser')} ${user.username}`);
        resetForm();
        onClose();
      } else {
        Alert.alert(t('error'), t('invalidCredentials'));
      }
    } catch (error) {
      Sentry.captureException(error as Error);
      Alert.alert(t('error'), t('errorLogin'));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, rememberMe, t, resetForm, onClose]);

  const handleRegister = useCallback(async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert(t('error'), t('allFieldsRequired'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }
    setIsSubmitting(true);
    try {
      // Registrar en Supabase Auth (envía email de verificación)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (signUpError) {
        if (signUpError.message?.includes('already registered')) {
          Alert.alert(t('error'), t('emailAlreadyRegistered'));
          setIsSubmitting(false);
          return;
        }
        throw signUpError;
      }

      // Guardar también en AsyncStorage como fallback
      const users = await AsyncStorage.getItem('repsfinder_users');
      let userList: any[] = [];
      if (users) {
        try { userList = JSON.parse(users); } catch {}
      }
      const newUser = { username, email, password: '', createdAt: new Date().toISOString(), supabaseId: signUpData?.user?.id };
      userList.push(newUser);
      await AsyncStorage.setItem('repsfinder_users', JSON.stringify(userList));
      await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(newUser));

      Alert.alert(
        t('success'),
        t('accountCreatedVerify') || 'Cuenta creada. Revisa tu email para verificar la cuenta.'
      );
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert(t('error'), t('errorRegister'));
    } finally {
      setIsSubmitting(false);
    }
  }, [username, email, password, confirmPassword, t, resetForm, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBox}
        >
          <ImageBackground
            source={{ uri: IMAGES.HERO }}
            style={styles.modalBox}
            imageStyle={styles.modalBackgroundImage}
          >
            <View style={styles.modalOverlayInner}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isLogin ? t('modalLogin') : t('modalRegister')}
                </Text>
                <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, isLogin && styles.tabActive]}
                  onPress={() => setIsLogin(true)}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                    {t('modalLogin')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, !isLogin && styles.tabActive]}
                  onPress={() => setIsLogin(false)}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                    {t('modalRegister')}
                  </Text>
                </TouchableOpacity>
              </View>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('username')}</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t('username')}
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                </View>
              )}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.TEXT_TERTIARY}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('password')}</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    secureTextEntry={!showPassword}
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                  </TouchableOpacity>
                </View>
                {isLogin && (
                  <TouchableOpacity
                    style={styles.forgotRow}
                    onPress={() => { setResetEmail(email); setShowForgotPassword(true); }}
                  >
                    <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.TEXT_TERTIARY}
                      secureTextEntry={!showConfirmPassword}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {isLogin && (
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.rememberCheckbox, rememberMe && styles.rememberCheckboxActive]}>
                    {rememberMe && <Text style={styles.rememberCheckMark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>{t('rememberMe')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={isSubmitting}
                activeOpacity={0.9}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <LinearGradient
                    colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonText}>
                      {isLogin ? t('enterButton') : t('createButton')}
                    </Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={async () => {
                  try {
                    const result = await signInWithGoogle();
                    if (result) {
                      resetForm();
                      onClose();
                    }
                  } catch (e) {
                    // Error ya manejado en signInWithGoogle
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.googleIconCircle}>
                  <Text style={styles.googleIconG}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>{t('continueWithGoogle')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.guestButtonText}>{t('continueAsGuest')}</Text>
              </TouchableOpacity>
              {!isLogin && (
                <Text style={styles.termsText}>{t('termsText')}</Text>
              )}
<View style={{ height: 40 }} />
              </ScrollView>
              {showForgotPassword && (
                <View style={styles.forgotOverlay}>
                  <View style={styles.forgotContainer}>
                    <Text style={styles.forgotTitle}>{t('resetPassword')}</Text>
                    <Text style={styles.forgotDesc}>{t('resetPasswordDesc')}</Text>
                    {resetSent ? (
                      <>
                        <Text style={styles.resetSentIcon}>✅</Text>
                        <Text style={styles.resetSentText}>{t('resetPasswordSent')}</Text>
                        <TouchableOpacity
                          style={styles.forgotBackBtn}
                          onPress={() => { setShowForgotPassword(false); setResetSent(false); }}
                        >
                          <Text style={styles.forgotBackText}>{t('backToLogin')}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <View style={styles.inputGroup}>
                          <TextInput
                            style={styles.input}
                            value={resetEmail}
                            onChangeText={setResetEmail}
                            placeholder="email@example.com"
                            placeholderTextColor={COLORS.TEXT_TERTIARY}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                        <TouchableOpacity
                          style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]}
                          onPress={async () => {
                            if (!resetEmail) { Alert.alert(t('error'), t('enterEmail')); return; }
                            setIsSubmitting(true);
                            try {
                              const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                                redirectTo: 'repsfinder://reset-password',
                              });
                              if (error) {
                                if (error.message?.includes('Email not found') || error.message?.includes('User not found')) {
                                  // No revelar si el email existe o no por seguridad
                                }
                              }
                              setResetSent(true);
                            } catch (e) {
                              Alert.alert(t('error'), t('errorGeneral'));
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator color="#000" />
                          ) : (
                            <LinearGradient
                              colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.actionButtonGradient}
                            >
                              <Text style={styles.actionButtonText}>{t('sendResetLink')}</Text>
                            </LinearGradient>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.forgotBackBtn}
                          onPress={() => setShowForgotPassword(false)}
                        >
                          <Text style={styles.forgotBackText}>{t('backToLogin')}</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ImageBackground>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});
LoginRegisterModal.displayName = 'LoginRegisterModal';

// ==================== MAIN COMPONENT ====================
export default function HomeScreen() {
  const router = useRouter();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const { t, i18n } = useTranslation();
  const { currency, setCurrency, setLanguage } = useAppSettings();
  const premium = usePremium();
  const isPremium = premium.isPremium;
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('repsfinder_current_user');
        if (userJson) {
          setCurrentUser(JSON.parse(userJson));
        } else {
          setCurrentUser(null);
        }
      } catch {}
    };
    loadUser();
  }, [showAuthModal]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        try {
          const userJson = await AsyncStorage.getItem('repsfinder_current_user');
          if (userJson) {
            setCurrentUser(JSON.parse(userJson));
          }
        } catch {}
      }
    });
    return () => subscription.remove();
  }, []);

 





  const loadAgents = useCallback(async () => {
    try {
      const currentLanguage = i18n.language;
      
      const response = await fetch(SHEET_URL_AGENTS);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      
      // ✅ Safe JSON parsing - remove comments and JSONP wrapper
      let json;
      try {
        // Remove lines starting with // (comments)
        let cleanText = text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
        
        // Remove JSONP wrapper
        const jsonString = cleanText.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
        
        // Find the actual JSON object (handle cases where there might be extra text)
        const match = jsonString.match(/\{[\s\S]*\}/);
        if (match) {
          json = JSON.parse(match[0]);
        } else {
          throw new Error('Could not find valid JSON object in response');
        }
      } catch (parseError) {
        logger.error('Error parsing agents JSON:', parseError);
        logger.error('Response text preview:', text.substring(0, 200));
        throw new Error('Failed to parse agent data');
      }
      
      if (!json?.table?.rows) {
        throw new Error('Invalid data structure received from API');
      }
      
       const rows = json.table.rows;
       
       // DEBUG DETALLADO: estructura de filas de agentes
       if (rows.length > 0) {
         rows[0].c?.forEach((cell: any, i: number) => {
         });
       }
       if (rows.length > 1) {
         rows[1].c?.forEach((cell: any, i: number) => {
         });
       }
      
      // AGENTS INDEX: agente | logo | mostrar | Rating | Costo Envío | Media Días Total | Costo Envío EN | Media Días Total EN
       const agentsData = rows
         .map((row: any, index: number) => {
          const cells = row.c;
          if (!cells || cells.length < 8) {
            return null;
          }
          const agentNameRaw = cells[0]?.v;
          const logo = (cells[1]?.v && String(cells[1].v).trim()) || '';
          const mostrarRaw = cells[2]?.v;
          const ratingRaw = cells[3]?.v;
          const costoEnvioES = (cells[4]?.v && String(cells[4].v).trim()) || 'N/A';
          const diasEnvioES = (cells[5]?.v && String(cells[5].v).trim()) || 'N/A';
          const costoEnvioEN = (cells[6]?.v && String(cells[6].v).trim()) || 'N/A';
          const diasEnvioEN = (cells[7]?.v && String(cells[7].v).trim()) || 'N/A';
          const costoEnvio = currentLanguage === 'en' ? costoEnvioEN : costoEnvioES;
          const diasEnvio = currentLanguage === 'en' ? diasEnvioEN : diasEnvioES;

            // Mostrar: TRUE (booleano) o SI/YES/1
            const mostrarStr = String(mostrarRaw ?? '').trim().toUpperCase();
            const isEmpty = mostrarStr === '';
            const esSi = isEmpty || mostrarRaw === true || mostrarRaw === 1 || ['SI', 'SÍ', 'YES', 'VERDADERO', 'TRUE', '1'].includes(mostrarStr);
            const esNo = mostrarRaw === false || mostrarRaw === 0 || ['NO', 'N', 'FALSO', 'FALSE', '0'].includes(mostrarStr);
           
           const agentName = typeof agentNameRaw === 'string' ? agentNameRaw.trim() : String(agentNameRaw || '').trim();
           
           if (!esSi || esNo) {
             return null;
           }

           if (!agentName) {
             return null;
           }

          let rating = 0;
          if (ratingRaw != null && ratingRaw !== '') {
            const rawStr = String(ratingRaw).trim().replace(',', '.');
            const match = rawStr.match(/(\d+\.?\d*)/);
            const parsed = parseFloat(match ? match[1] : rawStr);
            if (!isNaN(parsed) && !rawStr.includes('Date')) rating = Math.min(5, Math.max(0, parsed));
          }

          return {
            id: agentName,
            name: agentName,
            logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=1a1a1a&color=00e5b0&size=150`,
            rating,
            costoEnvio,
            diasEnvio,
            verified: true,
          };
         })
         .filter(Boolean);
       
       // DEBUG: agentes cargados
       agentsData.forEach((agent: any, idx: number) => {
       });
       
       setAgents(agentsData);
    } catch (error) {
      logger.error('Error loading agents:', error);
    } finally {
      setAgentsLoading(false);
    }
  }, [i18n.language]);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      const response = await fetch(SHEET_URL_MAIN);
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      
      // ✅ Safe JSON parsing - remove comments and JSONP wrapper
      let json;
      try {
        // Remove lines starting with // (comments)
        let cleanText = text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
        
        // Remove JSONP wrapper
        const jsonString = cleanText.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
        
        // Find the actual JSON object (handle cases where there might be extra text)
        const match = jsonString.match(/\{[\s\S]*\}/);
        if (match) {
          json = JSON.parse(match[0]);
        } else {
          throw new Error('Could not find valid JSON object in response');
        }
      } catch (parseError) {
        logger.error('Error parsing products JSON:', parseError);
        logger.error('Response text preview:', text.substring(0, 200));
        throw new Error('Failed to parse product data');
      }
      
      if (!json?.table?.rows) {
        throw new Error('Invalid data structure received from API');
      }
      
      const rows = json.table.rows;
       const allProducts = rows
         .map((row: any) => {
          const cells = row.c;
           const linkWeidian = cells[8]?.v || '';
           const agentLinks = generateAgentLinks(linkWeidian);
           
           return {
             foto: cells[9]?.v || '',
             nombre: cells[1]?.v || '',
             precio: (() => {
               const val = cells[4]?.v;
               if (!val || val === '') return 0;
               const str = String(val).replace(/[$€£¥,]/g, '').replace(' ', '');
               const parsed = parseFloat(str);
               return isNaN(parsed) ? 0 : parsed;
             })(),
             categoria: cells[3]?.v || '',
             activo: cells[6]?.v || '',
             rating: (() => {
               const val = cells[5]?.f;
               if (!val || val === '') return 0;
               const parsed = parseFloat(String(val).replace(',', '.'));
               return isNaN(parsed) ? 0 : parsed;
             })(),
             ventas: 0,
             linkWeidian,
             linkKakobuy: agentLinks?.kakobuy || '',
             linkUsfans: agentLinks?.usfans || '',
             linkMulebuy: agentLinks?.mulebuy || '',
             linkJoyagoo: agentLinks?.joyagoo || '',
             linkOppbuy: agentLinks?.oppbuy || '',
             linkLitbuy: agentLinks?.litbuy || '',
             linkHipobuy: agentLinks?.hipobuy || '',
             linkSuperbuy: agentLinks?.superbuy || '',
             linkAcbuy: agentLinks?.acbuy || '',
             foto1: cells[10]?.v || '',
             foto2: cells[11]?.v || '',
             foto3: cells[12]?.v || '',
             foto4: cells[13]?.v || '',
             foto5: cells[14]?.v || '',
             foto6: cells[15]?.v || '',
          };
        })
        .filter((p: Product) =>
          p.activo &&
          p.activo.toString().toUpperCase() === 'SI' &&
          p.foto &&
          p.nombre
        );
      
      setTotalProductsCount(allProducts.length);
      
      const byCategory: { [key: string]: Product[] } = {};
      allProducts.forEach((p: Product) => {
        if (!byCategory[p.categoria]) byCategory[p.categoria] = [];
        byCategory[p.categoria].push(p);
      });
      const today = new Date();
      const rotationIndex = Math.floor(today.getTime() / CONFIG.UPDATE_INTERVAL) % 9;
      const featured: Product[] = [];
      Object.keys(byCategory).forEach(cat => {
        const products = byCategory[cat];
        if (products.length >= 2) {
          const start = rotationIndex * 2;
          featured.push(products[start % products.length]);
          featured.push(products[(start + 1) % products.length]);
        } else if (products.length === 1) {
          featured.push(products[0]);
        }
      });
      setFeaturedProducts(featured.slice(0, CONFIG.PRODUCT_LIMIT));
    } catch (error) {
      logger.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProducts();
    loadAgents();
  }, []);

  // Recargar agentes cuando cambie el idioma
  useEffect(() => {
    if (agents.length > 0) {
      loadAgents();
    }
  }, [i18n.language, loadAgents]);

  const goToAgents = useCallback((agentId: string) => {
    try {
      router.push(`/agentes?id=${encodeURIComponent(agentId)}`);
    } catch (error) {
    }
  }, [router]);

  const validateProduct = useCallback((product: Product) => {
    const links = [
      product.linkUsfans,
      product.linkKakobuy,
      product.linkMulebuy,
      product.linkJoyagoo,
      product.linkLitbuy
    ];
    let productId = '';
    for (const link of links) {
      if (link) {
        const match = link.match(/\/(\d+)(?:\?|$)/);
        if (match && match[1]) {
          productId = match[1];
          break;
        }
      }
    }
    const idToUse = productId || product.nombre;
    try {
      // Pasar categoría y nombre del producto para que validar lo busque
      const categoria = encodeURIComponent(product.categoria);
      const nombre = encodeURIComponent(product.nombre);
      router.push(`/validar?categoria=${categoria}&nombre=${nombre}`);
    } catch (error) {
    }
  }, [router]);

  const goToLegal = useCallback(() => {
    try {
      router.push('/legal');
    } catch (error) {
    }
  }, [router]);

  const handleLogoTap = useCallback(() => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    if (newCount >= 7) {
      setLogoTapCount(0);
      const wasPremium = premium.isPremium;
      premium.togglePremium();
      Alert.alert(
        wasPremium ? 'Modo Free Activado' : '👑 Modo Premium Activado',
        wasPremium ? 'Has desactivado Premium' : 'Premium desbloqueado para pruebas'
      );
    }
  }, [logoTapCount, premium]);

  const handleOpenAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />
      {/* HEADER */}
      <ImageBackground
        source={{ uri: IMAGES.HEADER_BG }}
        style={[styles.header, { paddingTop: statusBarHeight + 20, paddingBottom: 5 }]}
        imageStyle={styles.headerImage}
      >
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.7}>
                <Text style={styles.logo}>RepsFinder</Text>
              </TouchableOpacity>
                 <TouchableOpacity
    onPress={() => setShowPremiumModal(true)}
                 activeOpacity={0.8}
                  style={{ marginLeft: 80 }}
                >
                  <Text style={{ fontSize: 20 }}>👑</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.tagline}>{t('tagline')}</Text>
          </View>
        </View>
        {/* BARRA DEGRADADA AL FINAL DEL HEADER */}
        <View style={[styles.gradientBarContainer, { marginHorizontal: -20, width: SCREEN_WIDTH, marginTop: 5 }]}>
          <LinearGradient
            colors={[COLORS.SECONDARY, COLORS.ACCENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />
        </View>
      </ImageBackground>
      {/* SUB-BANNER PREMIUM */}
      <View style={[styles.subBanner, { top: statusBarHeight + 70 }]}>
        <LinearGradient
          colors={[COLORS.SECONDARY, COLORS.ACCENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.subBannerGradient}
        />
      </View>
       <ScrollView
        style={[styles.content, { marginTop: statusBarHeight + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <ImageBackground
          source={{ uri: IMAGES.HERO }}
          style={styles.heroBackground}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
              
            </View>
          </LinearGradient>
        </ImageBackground>
        {/* AGENTES VERIFICADOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('agentsTitle')}</Text>
          <Text style={styles.sectionSubtitle}>{t('agentsSubtitle')}</Text>
          {agentsLoading ? (
            <SkeletonLoader />
          ) : agents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.agentsScroll}
            >
              {agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={index}
                  onPress={goToAgents}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noAgentsContainer}>
              <Text style={styles.noAgentsText}>{t('noAgents')}</Text>
            </View>
          )}
        </View>
        {/* WHY REPSFINDER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('whyTitle')}</Text>
          <Text style={styles.sectionSubtitle}>{t('whySubtitle')}</Text>
          <View style={styles.whyContainer}>
            {(() => {
              const items = t('whyItems', { returnObjects: true });
              return Array.isArray(items) ? items.map((item: any, index: number) => {
                let title = item.title;
                if (index === 0 && totalProductsCount > 0) {
                  title = t('discoverCatalogUpdated', { count: totalProductsCount });
                }
                return (
                <AnimatedCard key={item.title} delay={index * 100} style={styles.whyCardWrapper}>
                  <View style={styles.whyCard}>
                    <View style={[styles.whyIconBox, index % 2 === 0 ? styles.whyIconBoxPrimary : styles.whyIconBoxBlue]}>
                      <Text style={styles.whyIcon}>✓</Text>
                    </View>
                    <View style={styles.whyTextBox}>
                      <Text style={styles.whyCardTitle}>{title}</Text>
                      <Text style={styles.whyCardDesc}>{item.desc}</Text>
                    </View>
                  </View>
                </AnimatedCard>
              );
            }) : null;
            })()}
          </View>
        </View>
        {/* VERIFICACIÓN DE TIENDAS -  */}
        <View style={styles.section}>
          <View style={styles.seoHeaderContainer}>
            <LinearGradient
              colors={[COLORS.ACCENT_BLUE, COLORS.SECONDARY]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.seoHeaderGradient}
            >
              <Text style={styles.seoHeaderIcon}>✓</Text>
            </LinearGradient>
            <View style={styles.seoHeaderText}>
              <Text style={styles.seoTitle}>{t('storesVerificationTitle')}</Text>
              <Text style={styles.seoSubtitle}>{t('storesVerificationSubtitle')}</Text>
            </View>
          </View>
          <View style={styles.seoTextBox}>
            <Text style={styles.seoText}>{t('storesVerificationText')}</Text>
          </View>
        </View>
        {/* VERIFICATION PROCESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('verificationTitle')}</Text>
          <Text style={styles.sectionSubtitle}>{t('verificationSubtitle')}</Text>
          <View style={styles.verificationContainer}>
            {(() => {
              const steps = t('verificationSteps', { returnObjects: true });
              return Array.isArray(steps) ? steps.map((step: any, index: number) => (
              <AnimatedCard key={step.title} delay={index * 120} style={styles.verificationCardWrapper}>
                <View style={styles.verificationCard}>
                  <View style={[styles.verificationNumber, index === 1 ? styles.verificationNumberBlue : {}]}>
                    <Text style={styles.verificationNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.verificationTextBox}>
                    <Text style={styles.verificationTitle}>{step.title}</Text>
                    <Text style={styles.verificationDesc}>{step.desc}</Text>
                  </View>
                </View>
              </AnimatedCard>
            )) : null;
            })()}
          </View>
        </View>
        {/* PRODUCTOS DESTACADOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('productsTitle')}</Text>
          <Text style={styles.sectionSubtitle}>
            {totalProductsCount > 0 
              ? t('discoverCatalogAvailable', { count: totalProductsCount })
              : t('productsSubtitle')
            }
          </Text>
          {loading ? (
            <SkeletonLoader />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={`${product.nombre}-${index}`}
                  product={product}
                  index={index}
                  currency={currency as Currency}
                  onValidate={validateProduct}
                />
              ))}
            </ScrollView>
          )}
        </View>
        {/* CTA ACCOUNT */}
        <ImageBackground
          source={{ uri: IMAGES.ACCOUNT_BG }}
          style={styles.ctaBackground}
          imageStyle={styles.ctaBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.93)', 'rgba(0,0,0,0.96)']}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaSection}>
              <Text style={styles.ctaTitle}>{t('ctaTitle')}</Text>
              <Text style={styles.ctaSubtitle}>{t('ctaSubtitle')}</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleOpenAuthModal}
              >
                <Text style={styles.ctaButtonText}>{t('ctaButton')}</Text>
              </TouchableOpacity>
              <View style={styles.preferencesSection}>
                <TouchableOpacity
                  style={styles.userRow}
                  onPress={() => {
                    if (currentUser) {
                      Alert.alert(
                        currentUser.username,
                        currentUser.email,
                        [
                          { text: t('logout') || 'Cerrar sesión', onPress: async () => {
                            await AsyncStorage.removeItem('repsfinder_current_user');
                            setCurrentUser(null);
                          }},
                          { text: 'OK' },
                        ]
                      );
                    } else {
                      setShowAuthModal(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.userAvatar, currentUser && styles.userAvatarActive]}>
                    <Text style={styles.userAvatarText}>
                      {currentUser ? currentUser.username.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {currentUser ? currentUser.username : t('ctaButton')}
                    </Text>
                    <Text style={styles.userEmail}>
                      {currentUser ? currentUser.email : t('ctaSubtitle')}
                    </Text>
                  </View>
                  <Text style={styles.userArrow}>›</Text>
                </TouchableOpacity>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>{t('prefLanguage')}</Text>
                  <View style={styles.preferenceButtons}>
                    <TouchableOpacity
                      style={[styles.prefButton, i18n.language === 'es' && styles.prefButtonActive]}
                      onPress={() => setLanguage('es')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, i18n.language === 'es' && styles.prefButtonTextActive]}>
                        🇪🇸 ES
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.prefButton, i18n.language === 'en' && styles.prefButtonActive]}
                      onPress={() => setLanguage('en')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, i18n.language === 'en' && styles.prefButtonTextActive]}>
                        🇬🇧 EN
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>{t('prefCurrency')}</Text>
                  <View style={styles.preferenceButtons}>
                    <TouchableOpacity
                      style={[styles.prefButton, currency === 'USD' && styles.prefButtonActive]}
                      onPress={() => setCurrency('USD')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, currency === 'USD' && styles.prefButtonTextActive]}>
                        $ USD
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.prefButton, currency === 'EUR' && styles.prefButtonActive]}
                      onPress={() => setCurrency('EUR')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, currency === 'EUR' && styles.prefButtonTextActive]}>
                        € EUR
                      </Text>
                     </TouchableOpacity>
                   </View>
                 </View>
               </View>
             </View>
           </LinearGradient>
 </ImageBackground>
        
        {/* BANNER PREMIUM */}
        <View style={styles.premiumBlockContainer}>
          {/* Badge */}
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>👑 PREMIUM</Text>
          </View>

          {/* Título */}
          <Text style={styles.premiumBlockTitle}>{t('discoverWhyUpgrade')}</Text>

          {/* Texto descriptivo */}
          <Text style={styles.premiumBlockDesc}>
            {t('discoverPremiumDesc')}
          </Text>

          {/* Mini-cards de beneficios */}
          <View style={styles.premiumCardsContainer}>
            {/* Beneficio 1 - AI */}
            <View style={styles.premiumCard}>
              <View style={styles.premiumCardIconCircle}>
                <Text style={styles.premiumCardIcon}>🤖</Text>
              </View>
              <View style={styles.premiumCardTextContainer}>
                <Text style={styles.premiumCardTitle}>{t('discoverPremiumAI')}</Text>
                <Text style={styles.premiumCardDesc}>{t('discoverPremiumAIDesc')}</Text>
              </View>
            </View>

            {/* Beneficio 2 - Top Products */}
            <View style={styles.premiumCard}>
              <View style={styles.premiumCardIconCircle}>
                <Text style={styles.premiumCardIcon}>⭐</Text>
              </View>
              <View style={styles.premiumCardTextContainer}>
                <Text style={styles.premiumCardTitle}>{t('discoverPremiumTopProducts')}</Text>
                <Text style={styles.premiumCardDesc}>{t('discoverPremiumTopProductsDesc')}</Text>
              </View>
            </View>

            {/* Beneficio 3 - Alerts */}
            <View style={styles.premiumCard}>
              <View style={styles.premiumCardIconCircle}>
                <Text style={styles.premiumCardIcon}>🚨</Text>
              </View>
              <View style={styles.premiumCardTextContainer}>
                <Text style={styles.premiumCardTitle}>{t('discoverPremiumAlerts')}</Text>
                <Text style={styles.premiumCardDesc}>{t('discoverPremiumAlertsDesc')}</Text>
              </View>
            </View>

            {/* Beneficio 4 - Stores */}
            <View style={styles.premiumCard}>
              <View style={styles.premiumCardIconCircle}>
                <Text style={styles.premiumCardIcon}>🏪</Text>
              </View>
              <View style={styles.premiumCardTextContainer}>
                <Text style={styles.premiumCardTitle}>{t('discoverPremiumStores')}</Text>
                <Text style={styles.premiumCardDesc}>{t('discoverPremiumStoresDesc')}</Text>
              </View>
            </View>

            {/* Beneficio 5 - Favorites */}
            <View style={styles.premiumCard}>
              <View style={styles.premiumCardIconCircle}>
                <Text style={styles.premiumCardIcon}>❤️</Text>
              </View>
              <View style={styles.premiumCardTextContainer}>
                <Text style={styles.premiumCardTitle}>{t('discoverPremiumFavorites')}</Text>
                <Text style={styles.premiumCardDesc}>{t('discoverPremiumFavoritesDesc')}</Text>
              </View>
            </View>
          </View>

          {/* Franja de precios */}
          <View style={styles.premiumPriceRow}>
            <Text style={styles.premiumPriceText}>{t('discoverPremiumPrice')}</Text>
          </View>

          {/* Botón principal */}
  <TouchableOpacity
    style={styles.premiumMainButton}
      onPress={() => router.push('/premium')}
    activeOpacity={0.8}
  >
             <LinearGradient
               colors={['#667eea', '#FF3366']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={styles.premiumMainButtonGradient}
             >
                <Text style={styles.premiumMainButtonText}>✨ {t('discoverPremiumUnlock')}</Text>
             </LinearGradient>
           </TouchableOpacity>
          </View>
        
        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('footerCopy')}</Text>
          <Text style={styles.footerText}>{t('footerRights')}</Text>
        </View>
        <View style={{ height: 100 }} />
       </ScrollView>
        <LoginRegisterModal
          visible={showAuthModal}
          onClose={handleCloseAuthModal}
         />
        <PremiumHomeModal
          visible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          productsCount={featuredProducts.length}
          onShowTopProducts={() => router.push('/(tabs)/validar?topProducts=true')}
          onManageSubscription={() => router.push('/premium')}
         />
        </View>
    );
  }

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  headerImage: {
    opacity: 0.25,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.PRIMARY
  },
  tagline: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4
  },
  subBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
  },
  subBannerGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 40,
  },
  subBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 0.3,
  },


  gradientBarContainer: {
    height: 6,
    width: '100%',
  },
  gradientBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: { flex: 1 },
  heroBackground: {
    width: '100%',
    height: 520,
    marginBottom: 32
  },
  heroImage: { opacity: 1 },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 110,
    paddingHorizontal: 20
  },
  heroContent: {},
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 38,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,170,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0,
    borderColor: 'rgba(0,212,170,0.3)'
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.PRIMARY,
    marginRight: 6
  },
  trustText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.PRIMARY
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 48
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24
  },
  // SEO SECTION (TEXTO SOBRE TIENDAS)
  seoHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  seoHeaderGradient: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 16,
  },
  seoHeaderIcon: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  seoHeaderText: {
    flex: 1,
  },
  seoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  seoSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ACCENT_BLUE,
  },
  seoTextBox: {
    backgroundColor: COLORS.CARD_BG_DARK,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0,
    borderColor: COLORS.BORDER_LIGHT,
  },
  seoText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 24,
  },
  agentsScroll: { marginTop: 4 },
  agentCardWrapper: {},
  agentCard: {
    width: 300,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 20,
    marginRight: 16,
    borderWidth: 0,
    borderColor: COLORS.BORDER,
    position: 'relative',
    overflow: 'hidden',
  },
  agentBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,212,170,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'rgba(0,212,170,0.3)',
    zIndex: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.PRIMARY
  },
  agentLogoContainer: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.TEXT_PRIMARY,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 5,
  },
  agentLogoImage: {
    width: 110,
    height: 110,
  },
  agentLogoPlaceholder: {
    width: 110,
    height: 110,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  agentLogoPlaceholderText: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.BACKGROUND,
  },
  agentName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
    zIndex: 5
  },
  agentStats: {
    marginBottom: 20,
    zIndex: 5
  },
  agentStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT
  },
  agentStatLabel: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600'
  },
  agentStatValue: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '800'
  },
  agentButton: {
    backgroundColor: COLORS.BORDER_LIGHT,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#333',
    zIndex: 5
  },
  agentButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.PRIMARY,
    textAlign: 'center'
  },
  noAgentsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noAgentsText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  whyContainer: {},
  whyCardWrapper: {},
  whyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.CARD_BG_DARK,
    padding: 20,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 0,
    borderColor: COLORS.BORDER_LIGHT
  },
  whyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0
  },
  whyIconBoxPrimary: {
    backgroundColor: COLORS.PRIMARY,
  },
  whyIconBoxBlue: {
    backgroundColor: COLORS.ACCENT_BLUE,
  },
  whyIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.BACKGROUND
  },
  whyTextBox: { flex: 1 },
  whyCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    lineHeight: 22
  },
  whyCardDesc: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 21
  },
  verificationContainer: {},
  verificationCardWrapper: {},
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.CARD_BG_DARK,
    padding: 20,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 0,
    borderColor: COLORS.BORDER_LIGHT
  },
  verificationNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0
  },
  verificationNumberBlue: {
    backgroundColor: COLORS.ACCENT_BLUE,
  },
  verificationNumberText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.BACKGROUND
  },
  verificationTextBox: { flex: 1 },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    lineHeight: 22
  },
  verificationDesc: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 21
  },
  skeletonCard: {
    width: 300,
    height: 480,
    backgroundColor: COLORS.CARD_BG_DARK,
    borderRadius: 18,
    padding: 16,
    marginRight: 16,
    borderWidth: 0,
    borderColor: COLORS.BORDER_LIGHT
  },
  skeletonImage: {
    width: '100%',
    height: 260,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 12
  },
  skeletonText: {
    width: '80%',
    height: 16,
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginBottom: 8
  },
  skeletonTextShort: {
    width: '40%',
    height: 12,
    backgroundColor: 'transparent',
    borderRadius: 6
  },
  productCardWrapper: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  productCard: {
    width: 300,
    borderRadius: 20,
    overflow: 'hidden',
  },
  productInner: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    borderWidth: 0,
    borderColor: '#333',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  productImageContainer: {
    width: '100%',
    height: 280,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  productImageFull: {
    width: '100%',
    height: '100%',
  },
  productImageFallback: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  productImageFallbackText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.BACKGROUND,
  },
  productInfo: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productRatingBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  productRatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
  },
  productName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 14,
    lineHeight: 24,
    minHeight: 48,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  productSales: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  validateButton: {
    marginTop: 8,
  },
  validateButtonGradient: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'rgba(0, 102, 255, 0.6)',
  },
  validateButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
  },
  ctaBackground: {
    width: '100%',
    marginBottom: 40
  },
  ctaBackgroundImage: { opacity: 0.12 },
  ctaGradient: { paddingVertical: 50 },
  ctaSection: { marginHorizontal: 20 },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
    textAlign: 'center'
  },
  ctaSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22
  },
  ctaButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 36
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.BACKGROUND,
    textAlign: 'center'
  },
  preferencesSection: {
    paddingTop: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
    marginBottom: 28
  },
  preferenceRow: { marginBottom: 24 },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12
  },
  preferenceButtons: {
    flexDirection: 'row',
    gap: 12
  },
  prefButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.CARD_BG_DARK,
    borderWidth: 0,
    borderColor: COLORS.BORDER
  },
  prefButtonActive: {
    backgroundColor: COLORS.ACCENT_BLUE,
    borderColor: COLORS.ACCENT_BLUE
  },
  prefButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center'
  },
  prefButtonTextActive: {
    color: COLORS.BACKGROUND
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userAvatarActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    marginTop: 2,
  },
  userArrow: {
    fontSize: 22,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: '300',
  },
  legalButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG_DARK,
    padding: 18,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: COLORS.BORDER_LIGHT
  },
  legalButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    flex: 1
  },
  legalButtonArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginLeft: 12
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 10
  },
  footerText: {
    fontSize: 12,
    color: COLORS.TEXT_DARK
  },
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.OVERLAY
  },
  modalBox: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalBackgroundImage: {
    opacity: 0.7,
    resizeMode: 'cover',
  },
  modalOverlayInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY
  },
  modalClose: {
    fontSize: 28,
    color: COLORS.TEXT_SECONDARY
  },
  modalContent: { padding: 20, paddingBottom: 40 },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 0,
    borderColor: COLORS.BORDER_LIGHT
  },
  tabActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT_DARK,
    textAlign: 'center'
  },
  tabTextActive: {
    color: COLORS.BACKGROUND
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 170, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff'
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00d4aa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8
  },
  actionButtonDisabled: {
    opacity: 0.5
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5
  },
  termsText: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18
  },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1, height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 12, color: COLORS.TEXT_TERTIARY,
    marginHorizontal: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  googleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleIconG: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  guestButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginTop: 10,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  rememberCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberCheckboxActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  rememberCheckMark: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  rememberText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  premiumBannerContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
    
  },
  premiumBannerGradient: {
    padding: 20,
  },
  premiumBannerContent: {
    alignItems: 'center',
  },
  premiumBannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
  },
  premiumBannerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  premiumBannerBenefits: {
    width: '100%',
    marginBottom: 20,
  },
  premiumBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 8,
  },
  premiumBenefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  premiumBenefitText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  premiumBenefitTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  premiumBenefitLabel: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontWeight: '700',
    marginTop: 2,
  },
  premiumBannerButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumBannerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  premiumBannerButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.BACKGROUND,
  },
  premiumBannerPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.BACKGROUND,
    marginTop: 4,
  },

  // NUEVO BLOQUE PREMIUM EXACTO
  premiumBlockContainer: {
    marginHorizontal: 16,
    marginTop: -100,
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderRadius: 22,
    padding: 20,
    width: '92%',
    alignSelf: 'center',
  },
  premiumBadge: {
    backgroundColor: 'rgba(18,63,54,0.95)',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  premiumBadgeText: {
    color: '#2EE6B6',
    fontSize: 18,
    fontWeight: '900',
  },
  premiumBlockTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  premiumBlockDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  premiumCardsContainer: {
    marginBottom: 18,
  },
  premiumCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  premiumCardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  premiumCardIcon: {
    fontSize: 22,
  },
  premiumCardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  premiumCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  premiumCardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  premiumPriceRow: {
    backgroundColor: 'rgba(58,79,46,0.95)',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  premiumPriceText: {
    color: '#FACC15',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  premiumMainButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumMainButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumMainButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  forgotOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  forgotContainer: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    padding: 24,
  },
  forgotTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotDesc: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  forgotBackBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotBackText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  resetSentIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  resetSentText: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
});
