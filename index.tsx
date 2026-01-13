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
  Dimensions,
  Linking,
  Modal,
  TextInput,
  Alert,
  Animated,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== CONSTANTS ====================
const CONFIG = {
  SHEET_ID: '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8',
  SHEET_MAIN: 'MAIN',
  SHEET_AGENTES_INDEX: 'AGENTES INDEX',
  UPDATE_INTERVAL: 12 * 60 * 60 * 1000,
  PRODUCT_LIMIT: 10,
  ANIMATION_DURATION: 600,
  ANIMATION_DELAY: 80,
} as const;

const SHEET_URL_MAIN = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEET_MAIN}`;
const SHEET_URL_AGENTES_INDEX = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEET_AGENTES_INDEX}`;

const IMAGES = {
  HERO: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&q=90',
  ACCOUNT_BG: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
} as const;

const COLORS = {
  PRIMARY: '#00d4aa',        // Verde más suave
  SECONDARY: '#0066FF',      // Azul
  ACCENT: '#FF3366',         // Rojo/Rosa
  ACCENT_BLUE: '#00a3ff',    // Azul claro
  BACKGROUND: '#000',
  CARD_BG: '#0f0f0f',
  CARD_BG_DARK: '#0a0a0a',
  BORDER: '#222',
  BORDER_LIGHT: '#1a1a1a',
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

// ==================== TYPES ====================
interface Product {
  foto: string;
  nombre: string;
  precio: number;
  linkKakobuy?: string;
  linkUsfans?: string;
  linkMulebuy?: string;
  linkJoyagoo?: string;
  linkCnfans?: string;
  linkLitbuy?: string;
  categoria: string;
  activo: string;
  rating: number;
  ventas: number;
}

interface Agent {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviews: string;
  fee: string;
  shipping: string;
  satisfaction: string;
  responseTime: string;
  verified: boolean;
}

type Language = 'es' | 'en';
type Currency = 'USD' | 'EUR';

// ==================== PREMIUM AGENTS ====================
const PREMIUM_AGENTS: Agent[] = [
  {
    id: 'usfans',
    name: 'USFans',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6825a376b16be873d3c23e82/0x0.png',
    rating: 4.9,
    reviews: '15K+',
    fee: '5%',
    shipping: '7-12',
    satisfaction: '98%',
    responseTime: '2h',
    verified: true,
  },
  {
    id: 'cnfans',
    name: 'CNFans',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6417ff57d88ad4baa8407f63/0x0.png',
    rating: 4.2,
    reviews: '12K+',
    fee: '3%',
    shipping: '5-10',
    satisfaction: '94%',
    responseTime: '1h',
    verified: true,
  },
  {
    id: 'litbuy',
    name: 'Litbuy',
    logo: 'https://litbuy.net/favicon.ico',
    rating: 4.5,
    reviews: '8K+',
    fee: '4%',
    shipping: '8-14',
    satisfaction: '96%',
    responseTime: '3h',
    verified: true,
  },
  {
    id: 'joyagoo',
    name: 'Joyagoo',
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/a4/16/eea41644-dd37-7212-9eac-ce82b8512c5e/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/512x512bb.jpg',
    rating: 4.3,
    reviews: '3K+',
    fee: '6%',
    shipping: '10-15',
    satisfaction: '92%',
    responseTime: '4h',
    verified: true,
  },
  {
    id: 'superbuy',
    name: 'Superbuy',
    logo: 'https://play-lh.googleusercontent.com/w6hnKJbR0JHOloGbhPDrZixe9sGMkBmQVh5RcHYko2ahiHtMHaKV9zOmOCKsjbNZ1UI',
    rating: 4.6,
    reviews: '25K+',
    fee: '5%',
    shipping: '7-12',
    satisfaction: '97%',
    responseTime: '2h',
    verified: true,
  },
];

// ==================== TRANSLATIONS ====================
const TRANSLATIONS = {
  es: {
    tagline: 'Compra Seguro. Compra Inteligente.',
    subBanner: 'Datos reales. Tiendas verificadas. Compra con confianza.',
    heroTitle: 'Accede a la base de datos completa, calculadoras avanzadas y comparaciones en tiempo real',
    heroUpdate: 'Actualizado hace',
    heroMin: 'min',
    
    storesVerificationTitle: 'Verificación de Tiendas Weidian',
    storesVerificationSubtitle: 'Análisis profundo de sellers verificados',
    storesVerificationText: 'En RepsFinder analizamos exhaustivamente cada tienda de Weidian antes de recomendarla. Nuestro equipo revisa más de 500 sellers mensualmente, evaluando historial de ventas, calidad de productos, tiempos de respuesta y satisfacción de clientes. Cada tienda pasa por un riguroso proceso de verificación que incluye análisis de reseñas reales, test de compras, evaluación de políticas de devolución y monitoreo continuo de métricas de rendimiento. Solo las tiendas con puntuación superior a 8/10 en confiabilidad y menos de 3/10 en riesgo son incluidas en nuestra plataforma.',
    
    whyTitle: 'Por qué RepsFinder',
    whySubtitle: 'La forma inteligente de comprar réplicas verificadas',
    whyItems: [
      {
        title: 'Inteligencia de Mercado en Tiempo Real',
        desc: 'Análisis continuo del mercado con datos actualizados automáticamente',
      },
      {
        title: 'Sistema de Curación Automatizada',
        desc: 'Algoritmos inteligentes seleccionan solo productos verificados',
      },
      {
        title: 'Hub de Agregación Multi-Plataforma',
        desc: 'Todos los mejores agentes centralizados en un solo lugar',
      },
      {
        title: 'Validación Inteligente y Puntuación de Riesgo',
        desc: 'Cada producto pasa filtros de credibilidad antes de mostrarse',
      },
      {
        title: 'Sincronización Dinámica de Base de Datos',
        desc: 'Actualización automática cada 12 horas para datos siempre frescos',
      },
    ],
    
    agentsTitle: 'Agentes Verificados',
    agentsSubtitle: 'Comparación actualizada • Datos reales verificados',
    verified: 'Verificado',
    fee: 'Comisión',
    rating: 'Rating',
    response: 'Respuesta',
    satisfaction: 'Satisfacción',
    shipping: 'Envío',
    days: 'días',
    viewAgent: 'Ver agente',
    
    verificationTitle: 'Proceso de Verificación',
    verificationSubtitle: 'Cómo seleccionamos agentes confiables',
    verificationSteps: [
      {
        title: 'Análisis de Historial',
        desc: 'Revisamos mínimo 6 meses de operaciones y reviews verificadas',
      },
      {
        title: 'Test de Compra Real',
        desc: 'Realizamos pedidos reales para validar calidad y tiempos de envío',
      },
      {
        title: 'Monitoreo Continuo',
        desc: 'Seguimiento 24/7 de métricas de satisfacción y respuesta',
      },
    ],
    
    productsTitle: 'Productos Destacados',
    productsSubtitle: 'Actualizado cada 12 horas • Rotación automática',
    
    ctaTitle: 'Únete a RepsFinder',
    ctaSubtitle: 'Accede a la base de datos completa, calculadoras avanzadas y comparaciones en tiempo real',
    ctaButton: 'Crear cuenta gratis',
    
    prefLanguage: 'Idioma',
    prefCurrency: 'Moneda',
    legalButton: 'Información Legal y Privacidad',
    
    footerCopy: 'RepsFinder © 2026',
    footerRights: 'Todos los derechos reservados',
    
    modalLogin: 'Iniciar Sesión',
    modalRegister: 'Registrarse',
    username: 'Nombre de usuario',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    enterButton: 'Entrar',
    createButton: 'Crear cuenta',
    termsText: 'Al registrarte aceptas nuestros Términos y Condiciones',
    
    errorLoading: 'Error al cargar datos',
    errorLogin: 'Error al iniciar sesión',
    errorRegister: 'Error al crear cuenta',
    errorNetwork: 'Error de conexión. Verifica tu internet.',
  },
  
  en: {
    tagline: 'Shop Safe. Shop Smart.',
    subBanner: 'Real data. Verified stores. Shop with confidence.',
    heroTitle: 'Access the full database, advanced calculators and real-time comparisons',
    heroUpdate: 'Updated',
    heroMin: 'min ago',
    
    storesVerificationTitle: 'Weidian Stores Verification',
    storesVerificationSubtitle: 'Deep analysis of verified sellers',
    storesVerificationText: 'At RepsFinder, we thoroughly analyze every Weidian store before recommending it. Our team reviews over 500 sellers monthly, evaluating sales history, product quality, response times, and customer satisfaction. Each store undergoes a rigorous verification process including real review analysis, test purchases, return policy evaluation, and continuous performance monitoring. Only stores with a reliability score above 8/10 and risk below 3/10 are included on our platform.',
    
    whyTitle: 'Why RepsFinder',
    whySubtitle: 'The smart way to buy verified replicas',
    whyItems: [
      {
        title: 'Real-time Market Intelligence',
        desc: 'Continuous market analysis with automatically updated data',
      },
      {
        title: 'Automated Product Curation System',
        desc: 'Smart algorithms select only verified products',
      },
      {
        title: 'Multi-Platform Aggregation Hub',
        desc: 'All the best agents centralized in one place',
      },
      {
        title: 'Smart Validation & Risk Scoring',
        desc: 'Every product passes credibility filters before display',
      },
      {
        title: 'Dynamic Database Synchronization',
        desc: 'Automatic update every 12 hours for always fresh data',
      },
    ],
    
    agentsTitle: 'Verified Agents',
    agentsSubtitle: 'Updated comparison • Real verified data',
    verified: 'Verified',
    fee: 'Fee',
    rating: 'Rating',
    response: 'Response',
    satisfaction: 'Satisfaction',
    shipping: 'Shipping',
    days: 'days',
    viewAgent: 'View agent',
    
    verificationTitle: 'Verification Process',
    verificationSubtitle: 'How we select trustworthy agents',
    verificationSteps: [
      {
        title: 'History Analysis',
        desc: 'We review minimum 6 months of operations and verified reviews',
      },
      {
        title: 'Real Purchase Test',
        desc: 'We make real orders to validate quality and shipping times',
      },
      {
        title: 'Continuous Monitoring',
        desc: '24/7 tracking of satisfaction and response metrics',
      },
    ],
    
    productsTitle: 'Featured Products',
    productsSubtitle: 'Updated every 12 hours • Automatic rotation',
    
    ctaTitle: 'Join RepsFinder',
    ctaSubtitle: 'Access the complete database, advanced calculators and real-time comparisons',
    ctaButton: 'Create free account',
    
    prefLanguage: 'Language',
    prefCurrency: 'Currency',
    legalButton: 'Legal Information and Privacy',
    
    footerCopy: 'RepsFinder © 2026',
    footerRights: 'All rights reserved',
    
    modalLogin: 'Sign In',
    modalRegister: 'Sign Up',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    enterButton: 'Enter',
    createButton: 'Create account',
    termsText: 'By signing up you accept our Terms and Conditions',
    
    errorLoading: 'Error loading data',
    errorLogin: 'Error signing in',
    errorRegister: 'Error creating account',
    errorNetwork: 'Connection error. Check your internet.',
  },
};

// ==================== ANIMATED CARD ====================
const AnimatedCard = React.memo(({ children, delay = 0, style }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION_DURATION,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: CONFIG.ANIMATION_DURATION,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

// ==================== SKELETON LOADER ====================
const SkeletonLoader = React.memo(() => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {[1, 2, 3].map(i => (
        <Animated.View key={i} style={[styles.skeletonCard, { opacity }]}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonTextShort} />
        </Animated.View>
      ))}
    </ScrollView>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

// ==================== PRODUCT CARD ====================
const ProductCard = React.memo(({ product, index, currency, onBuyPress }: { product: Product; index: number; currency: Currency; onBuyPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const convertedPrice = useMemo(() => {
    const rate = CURRENCY_CONVERSION[currency];
    return (product.precio * rate).toFixed(2);
  }, [product.precio, currency]);

  return (
    <AnimatedCard delay={index * CONFIG.ANIMATION_DELAY} style={styles.productCardWrapper}>
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productCardImage}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onBuyPress}
        >
          <Animated.View style={[styles.productInner, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.productImageContainer}>
              {product.foto ? (
                <Image
                  source={{ uri: product.foto }}
                  style={styles.productImageFull}
                  resizeMode="cover"
                />
              ) : null}
              {product.rating > 0 && (
                <View style={styles.productRatingBadge}>
                  <Text style={styles.productRatingBadgeText}>★ {product.rating}</Text>
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productCategory}>{product.categoria}</Text>
              <Text style={styles.productName} numberOfLines={2}>
                {product.nombre}
              </Text>
              <View style={styles.productPriceRow}>
                <View>
                  <Text style={styles.productPrice}>
                    {currency} {convertedPrice}
                  </Text>
                  {product.ventas > 0 && (
                    <Text style={styles.productSales}>{product.ventas} ventas</Text>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={onBuyPress}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.PRIMARY, COLORS.ACCENT_BLUE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyButtonGradient}
          >
            <Text style={styles.buyButtonText}>Comprar</Text>
            <Text style={styles.buyButtonIcon}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </AnimatedCard>
  );
});

ProductCard.displayName = 'ProductCard';

// ==================== AGENT CARD ====================
const AgentCard = React.memo(({ agent, index, t, onPress }: { agent: Agent; index: number; t: any; onPress: (id: string) => void }) => {
  const handlePress = useCallback(() => {
    onPress(agent.id);
  }, [agent.id, onPress]);

  return (
    <AnimatedCard delay={index * 120} style={styles.agentCardWrapper}>
      <TouchableOpacity
        style={styles.agentCard}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        <ImageBackground
          source={{ uri: agent.logo }}
          style={styles.agentBackgroundImage}
          imageStyle={{
            opacity: 0.12,
            resizeMode: 'contain',
          }}
        />
        
        {agent.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ {t.verified}</Text>
          </View>
        )}
        
        <View style={styles.agentLogoContainer}>
          <Image 
            source={{ uri: agent.logo }} 
            style={styles.agentLogoImage} 
            resizeMode="contain" 
          />
        </View>
        
        <Text style={styles.agentName}>{agent.name}</Text>
        
        <View style={styles.agentStats}>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t.fee}</Text>
            <Text style={styles.agentStatValue}>{agent.fee}</Text>
          </View>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t.rating}</Text>
            <Text style={styles.agentStatValue}>★ {agent.rating}</Text>
          </View>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t.response}</Text>
            <Text style={styles.agentStatValue}>{agent.responseTime}</Text>
          </View>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t.satisfaction}</Text>
            <Text style={styles.agentStatValue}>{agent.satisfaction}</Text>
          </View>
          <View style={styles.agentStatRow}>
            <Text style={styles.agentStatLabel}>{t.shipping}</Text>
            <Text style={styles.agentStatValue}>{agent.shipping} {t.days}</Text>
          </View>
        </View>
        
        <View style={styles.agentButton}>
          <Text style={styles.agentButtonText}>{t.viewAgent}</Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
});

AgentCard.displayName = 'AgentCard';

// ==================== LOGIN/REGISTER MODAL ====================
const LoginRegisterModal = React.memo(({ visible, onClose, t }: { visible: boolean; onClose: () => void; t: any }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setUsername('');
    setConfirmPassword('');
    setIsSubmitting(false);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', t.errorLogin);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const users = await AsyncStorage.getItem('repsfinder_users');
      const userList = users ? JSON.parse(users) : [];
      const user = userList.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(user));
        Alert.alert('¡Bienvenido!', `Hola ${user.username}`);
        resetForm();
        onClose();
      } else {
        Alert.alert('Error', 'Email o contraseña incorrectos');
      }
    } catch (error) {
      Alert.alert('Error', t.errorLogin);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, t, resetForm, onClose]);

  const handleRegister = useCallback(async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const users = await AsyncStorage.getItem('repsfinder_users');
      const userList = users ? JSON.parse(users) : [];
      
      if (userList.find((u: any) => u.email === email)) {
        Alert.alert('Error', 'Este email ya está registrado');
        setIsSubmitting(false);
        return;
      }
      
      const newUser = { username, email, password, createdAt: new Date().toISOString() };
      userList.push(newUser);
      await AsyncStorage.setItem('repsfinder_users', JSON.stringify(userList));
      await AsyncStorage.setItem('repsfinder_current_user', JSON.stringify(newUser));
      
      Alert.alert('¡Éxito!', '¡Cuenta creada con éxito!');
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', t.errorRegister);
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
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isLogin ? t.modalLogin : t.modalRegister}
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
                  {t.modalLogin}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  {t.modalRegister}
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.username}</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t.username}
                  placeholderTextColor={COLORS.TEXT_TERTIARY}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.email}</Text>
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
              <Text style={styles.inputLabel}>{t.password}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.TEXT_TERTIARY}
                secureTextEntry
                editable={!isSubmitting}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.confirmPassword}</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.TEXT_TERTIARY}
                  secureTextEntry
                  editable={!isSubmitting}
                />
              </View>
            )}

            <TouchableOpacity 
              style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]} 
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.BACKGROUND} />
              ) : (
                <Text style={styles.actionButtonText}>
                  {isLogin ? t.enterButton : t.createButton}
                </Text>
              )}
            </TouchableOpacity>

            {!isLogin && (
              <Text style={styles.termsText}>{t.termsText}</Text>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

LoginRegisterModal.displayName = 'LoginRegisterModal';

// ==================== MAIN COMPONENT ====================
export default function HomeScreen() {
  const router = useRouter();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [premiumAgents, setPremiumAgents] = useState<Agent[]>(PREMIUM_AGENTS);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [language, setLanguage] = useState<Language>('es');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [lastUpdate, setLastUpdate] = useState('');

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  useEffect(() => {
    loadFeaturedProducts();
    loadPremiumAgents();
    loadPreferences();
    updateLastUpdateTime();
  }, []);

  const updateLastUpdateTime = useCallback(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    setLastUpdate(`${minutes}`);
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const [savedLang, savedCurr] = await Promise.all([
        AsyncStorage.getItem('app_language'),
        AsyncStorage.getItem('app_currency'),
      ]);
      
      if (savedLang) setLanguage(savedLang as Language);
      if (savedCurr) setCurrency(savedCurr as Currency);
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  }, []);

  const saveLanguage = useCallback(async (lang: Language) => {
    setLanguage(lang);
    try {
      await AsyncStorage.setItem('app_language', lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  }, []);

  const saveCurrency = useCallback(async (curr: Currency) => {
    setCurrency(curr);
    try {
      await AsyncStorage.setItem('app_currency', curr);
    } catch (error) {
      console.log('Error saving currency:', error);
    }
  }, []);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      const response = await fetch(SHEET_URL_MAIN);
      if (!response.ok) throw new Error('Network response was not ok');

      const text = await response.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const allProducts = rows
        .slice(1)
        .map((row: any) => {
          const cells = row.c;
          return {
            foto: cells[0]?.v || '',
            nombre: cells[1]?.v || '',
            precio: cells[2]?.v || 0,
            linkKakobuy: cells[3]?.v || '',
            linkUsfans: cells[4]?.v || '',
            linkMulebuy: cells[5]?.v || '',
            linkJoyagoo: cells[6]?.v || '',
            linkCnfans: cells[7]?.v || '',
            linkLitbuy: cells[8]?.v || '',
            categoria: cells[9]?.v || '',
            activo: cells[10]?.v || '',
            rating: cells[11]?.v || 0,
            ventas: cells[12]?.v || 0,
          };
        })
        .filter((p: Product) =>
          p.activo &&
          p.activo.toString().toUpperCase() === 'SI' &&
          p.foto &&
          p.nombre
        );

      const byCategory: { [key: string]: Product[] } = {};
      allProducts.forEach((p: Product) => {
        if (!byCategory[p.categoria]) byCategory[p.categoria] = [];
        byCategory[p.categoria].push(p);
      });

      const today = new Date();
      const rotationIndex = Math.floor(today.getTime() / CONFIG.UPDATE_INTERVAL) % 2;

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
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPremiumAgents = useCallback(async () => {
    try {
      const response = await fetch(SHEET_URL_AGENTES_INDEX);
      if (!response.ok) throw new Error('Error loading agents');

      const text = await response.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const loadedAgents = rows
        .slice(1) // Skip header
        .map((row: any, index: number) => {
          const cells = row.c;
          const mostrar = cells[2]?.v?.toString().toLowerCase();

          // Solo mostrar agentes con mostrar="si"
          if (mostrar !== 'si') return null;

          return {
            id: cells[0]?.v || `agent-${index}`,
            name: cells[0]?.v || '',
            logo: cells[1]?.v || '',
            rating: 4.5 + (Math.random() * 0.5), // Rating aleatorio 4.5-5.0
            reviews: `${Math.floor(Math.random() * 10000 + 5000)}+`,
            fee: `${Math.floor(Math.random() * 3 + 3)}%`,
            shipping: `${Math.floor(Math.random() * 5 + 5)}-${Math.floor(Math.random() * 5 + 10)}`,
            satisfaction: `${Math.floor(Math.random() * 5 + 94)}%`,
            responseTime: `${Math.floor(Math.random() * 3 + 1)}h`,
            verified: true,
          };
        })
        .filter(Boolean); // Remover nulls

      if (loadedAgents.length > 0) {
        setPremiumAgents(loadedAgents as Agent[]);
      }
    } catch (error) {
      console.error('Error loading premium agents from Google Sheets:', error);
      // Mantener los agentes por defecto en caso de error
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  const goToAgents = useCallback((agentId: string) => {
    try {
      router.push('/agentes');
    } catch (error) {
      console.log('Error navigating to agents:', error);
    }
  }, [router]);

  const goToLegal = useCallback(() => {
    try {
      router.push('/legal');
    } catch (error) {
      console.log('Error navigating to legal:', error);
    }
  }, [router]);

  const handleOpenAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const handleBuyProduct = useCallback(() => {
    try {
      router.push('/validate');
    } catch (error) {
      console.log('Error navigating to validate:', error);
    }
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />

      {/* HEADER ORIGINAL */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 20 }]}>
        <Text style={styles.logo}>RepsFinder</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      {/* SUB-BANNER PREMIUM */}
      <View style={[styles.subBanner, { top: statusBarHeight + 70 }]}>
        <LinearGradient
          colors={[COLORS.SECONDARY, COLORS.ACCENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.subBannerGradient}
        >
          <Text style={styles.subBannerText}>{t.subBanner}</Text>
        </LinearGradient>
      </View>

      <ScrollView
        style={[styles.content, { marginTop: statusBarHeight + 120 }]}
        showsVerticalScrollIndicator={false}
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
              <Text style={styles.heroTitle}>{t.heroTitle}</Text>
              
              <View style={styles.trustBadges}>
                <View style={styles.trustBadge}>
                  <View style={styles.trustDot} />
                  <Text style={styles.trustText}>
                    {t.heroUpdate} {lastUpdate} {t.heroMin}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* AGENTES VERIFICADOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.agentsTitle}</Text>
          <Text style={styles.sectionSubtitle}>{t.agentsSubtitle}</Text>

          {loadingAgents ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.agentsScroll}
            >
              {premiumAgents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={index}
                  t={t}
                  onPress={goToAgents}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* VERIFICACIÓN DE TIENDAS - SOLO TEXTO SEO */}
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
              <Text style={styles.seoTitle}>{t.storesVerificationTitle}</Text>
              <Text style={styles.seoSubtitle}>{t.storesVerificationSubtitle}</Text>
            </View>
          </View>
          
          <View style={styles.seoTextBox}>
            <Text style={styles.seoText}>{t.storesVerificationText}</Text>
          </View>
        </View>

        {/* WHY REPSFINDER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.whyTitle}</Text>
          <Text style={styles.sectionSubtitle}>{t.whySubtitle}</Text>
          
          <View style={styles.whyContainer}>
            {t.whyItems.map((item: any, index: number) => (
              <AnimatedCard key={index} delay={index * 100} style={styles.whyCardWrapper}>
                <View style={styles.whyCard}>
                  <View style={[styles.whyIconBox, index % 2 === 0 ? styles.whyIconBoxPrimary : styles.whyIconBoxBlue]}>
                    <Text style={styles.whyIcon}>✓</Text>
                  </View>
                  <View style={styles.whyTextBox}>
                    <Text style={styles.whyCardTitle}>{item.title}</Text>
                    <Text style={styles.whyCardDesc}>{item.desc}</Text>
                  </View>
                </View>
              </AnimatedCard>
            ))}
          </View>
        </View>

        {/* VERIFICATION PROCESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.verificationTitle}</Text>
          <Text style={styles.sectionSubtitle}>{t.verificationSubtitle}</Text>
          
          <View style={styles.verificationContainer}>
            {t.verificationSteps.map((step: any, index: number) => (
              <AnimatedCard key={index} delay={index * 120} style={styles.verificationCardWrapper}>
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
            ))}
          </View>
        </View>

        {/* PRODUCTOS DESTACADOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.productsTitle}</Text>
          <Text style={styles.sectionSubtitle}>{t.productsSubtitle}</Text>
          
          {loading ? (
            <SkeletonLoader />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={`${product.nombre}-${index}`}
                  product={product}
                  index={index}
                  currency={currency}
                  onBuyPress={handleBuyProduct}
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
              <Text style={styles.ctaTitle}>{t.ctaTitle}</Text>
              <Text style={styles.ctaSubtitle}>{t.ctaSubtitle}</Text>
              
              <TouchableOpacity 
                style={styles.ctaButton} 
                onPress={handleOpenAuthModal}
              >
                <Text style={styles.ctaButtonText}>{t.ctaButton}</Text>
              </TouchableOpacity>

              <View style={styles.preferencesSection}>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>{t.prefLanguage}</Text>
                  <View style={styles.preferenceButtons}>
                    <TouchableOpacity
                      style={[styles.prefButton, language === 'es' && styles.prefButtonActive]}
                      onPress={() => saveLanguage('es')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, language === 'es' && styles.prefButtonTextActive]}>
                        🇪🇸 ES
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.prefButton, language === 'en' && styles.prefButtonActive]}
                      onPress={() => saveLanguage('en')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, language === 'en' && styles.prefButtonTextActive]}>
                        🇬🇧 EN
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>{t.prefCurrency}</Text>
                  <View style={styles.preferenceButtons}>
                    <TouchableOpacity
                      style={[styles.prefButton, currency === 'USD' && styles.prefButtonActive]}
                      onPress={() => saveCurrency('USD')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, currency === 'USD' && styles.prefButtonTextActive]}>
                        USD
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.prefButton, currency === 'EUR' && styles.prefButtonActive]}
                      onPress={() => saveCurrency('EUR')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.prefButtonText, currency === 'EUR' && styles.prefButtonTextActive]}>
                        EUR
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.legalButton}
                onPress={goToLegal}
                activeOpacity={0.8}
              >
                <Text style={styles.legalButtonText}>{t.legalButton}</Text>
                <Text style={styles.legalButtonArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.footerCopy}</Text>
          <Text style={styles.footerText}>{t.footerRights}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <LoginRegisterModal 
        visible={showAuthModal} 
        onClose={handleCloseAuthModal} 
        t={t}
      />
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.BACKGROUND 
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
  },
  subBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 0.3,
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
    paddingBottom: 50, 
    paddingHorizontal: 20 
  },
  heroContent: {},
  heroTitle: { 
    fontSize: 30, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    lineHeight: 38, 
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
    borderWidth: 1, 
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
    justifyContent: 'center',
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
    borderWidth: 1,
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
    borderWidth: 1, 
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
    justifyContent: 'center',
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
    borderWidth: 1, 
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
    justifyContent: 'center', 
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
    borderWidth: 1, 
    borderColor: '#333', 
    zIndex: 5 
  },
  agentButtonText: { 
    fontSize: 15, 
    fontWeight: '900', 
    color: COLORS.PRIMARY, 
    textAlign: 'center' 
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
    borderWidth: 1, 
    borderColor: COLORS.BORDER_LIGHT 
  },
  whyIconBox: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16, 
    flexShrink: 0 
  },
  whyIconBoxPrimary: {
    backgroundColor: COLORS.ACCENT_BLUE,
  },
  whyIconBoxBlue: {
    backgroundColor: COLORS.SECONDARY,
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
    borderWidth: 1, 
    borderColor: COLORS.BORDER_LIGHT 
  },
  verificationNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  verificationNumberBlue: {
    backgroundColor: COLORS.ACCENT,
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
    borderWidth: 1, 
    borderColor: COLORS.BORDER_LIGHT 
  },
  skeletonImage: { 
    width: '100%', 
    height: 260, 
    backgroundColor: '#151515', 
    borderRadius: 12, 
    marginBottom: 12 
  },
  skeletonText: { 
    width: '80%', 
    height: 16, 
    backgroundColor: '#151515', 
    borderRadius: 8, 
    marginBottom: 8 
  },
  skeletonTextShort: { 
    width: '40%', 
    height: 12, 
    backgroundColor: '#151515', 
    borderRadius: 6 
  },
  productCardWrapper: {},
  productCard: {
    width: 320,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: COLORS.CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  productCardImage: {
    width: '100%',
  },
  productInner: {
    backgroundColor: COLORS.CARD_BG,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImageFull: {
    width: '100%',
    height: '100%',
  },
  productRatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  productRatingBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
  },
  productInfo: { padding: 18, paddingBottom: 16 },
  productCategory: {
    fontSize: 11,
    color: COLORS.ACCENT_BLUE,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 14,
    minHeight: 40,
    lineHeight: 22,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  productSales: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: '600',
  },
  buyButton: {
    margin: 12,
    marginTop: 0,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    marginRight: 8,
  },
  buyButtonIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
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
    borderWidth: 1, 
    borderColor: COLORS.BORDER 
  },
  prefButtonActive: { 
    backgroundColor: COLORS.PRIMARY, 
    borderColor: COLORS.PRIMARY 
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
  
  legalButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.CARD_BG_DARK, 
    padding: 18, 
    borderRadius: 12, 
    borderWidth: 1, 
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
    justifyContent: 'flex-end' 
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
    backgroundColor: COLORS.CARD_BG_DARK, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    maxHeight: '75%', 
    borderTopWidth: 1, 
    borderTopColor: COLORS.BORDER_LIGHT 
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
  modalContent: { padding: 20 },
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
    borderWidth: 1, 
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
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.TEXT_PRIMARY, 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: COLORS.BACKGROUND, 
    borderWidth: 1, 
    borderColor: COLORS.BORDER_LIGHT, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 15, 
    color: COLORS.TEXT_PRIMARY 
  },
  actionButton: { 
    backgroundColor: COLORS.PRIMARY, 
    paddingVertical: 16, 
    borderRadius: 12 
  },
  actionButtonDisabled: { 
    opacity: 0.6 
  },
  actionButtonText: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: COLORS.BACKGROUND, 
    textAlign: 'center' 
  },
  termsText: { 
    fontSize: 12, 
    color: COLORS.TEXT_TERTIARY, 
    textAlign: 'center', 
    marginTop: 20, 
    lineHeight: 18 
  },
});