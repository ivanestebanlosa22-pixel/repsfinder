import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
  import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    Linking,
    Alert,
    useWindowDimensions,
    Modal,
    ImageBackground,
    Image,
  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
 import { useTranslation } from 'react-i18next';
import { usePremium } from '../../src/context/PremiumContext';
import PaywallModal from '../../src/components/premium/PaywallModal';
import { logger } from '../../src/utils/logger';
import * as Sentry from '@sentry/react-native';


const HEADER_BG = 'https://www.shutterstock.com/image-photo/front-cargo-container-ship-ocean-600nw-2659440041.jpg';

// ==================== CONSTANTS ====================
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
  GLASS_BG: 'rgba(255, 255, 255, 0.02)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.05)',
 } as const;

// ==================== SHEET CONFIG ====================
const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=229144007`;

// Gradients para las tarjetas
const GRADIENTS = [
  { g: ['#FF6B6B', '#FF8E53'], b: ['#FF8E53', '#FF6B6B'] },
  { g: ['#4ECDC4', '#44A08D'], b: ['#44A08D', '#4ECDC4'] },
  { g: ['#667eea', '#764ba2'], b: ['#764ba2', '#667eea'] },
  { g: ['#f093fb', '#f5576c'], b: ['#f5576c', '#f093fb'] },
  { g: ['#4facfe', '#00f2fe'], b: ['#00f2fe', '#4facfe'] },
  { g: ['#43e97b', '#38f9d7'], b: ['#38f9d7', '#43e97b'] },
  { g: ['#fa709a', '#fee140'], b: ['#fee140', '#fa709a'] },
  { g: ['#30cfd0', '#330867'], b: ['#330867', '#30cfd0'] },
];

const getStoreStyle = (category: string, name: string): { emoji: string; bg: string[] } => {
  const cat = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();
  
  // Zapatillas / Sneakers
  if (cat.includes('zapatilla') || cat.includes('sneaker') || n.includes('sneaker') || n.includes('jordan') || n.includes('nike') || n.includes('adidas') || n.includes('yeezy') || n.includes('dunk')) {
    return { emoji: '👟', bg: ['#FF416C', '#FF4B2B'] };
  }
  // Hoodies / Sudaderas / Streetwear
  if (cat.includes('corteiz') || cat.includes('broken planet') || cat.includes('mertra') || cat.includes('essentials') || cat.includes('hoodie') || cat.includes('sudadera') || cat.includes('streetwear')) {
    return { emoji: '👕', bg: ['#11998e', '#38ef7d'] };
  }
  // Stone Island / Cazadoras
  if (cat.includes('stone island') || cat.includes('cazadora') || cat.includes('jacket')) {
    return { emoji: '🧥', bg: ['#3a1c71', '#d76d77'] };
  }
  // Supreme
  if (cat.includes('supreme')) {
    return { emoji: '🔥', bg: ['#FF0000', '#FF4444'] };
  }
  // Arc'teryx / The North Face
  if (cat.includes("arcteryx") || cat.includes('tnf') || cat.includes('north face')) {
    return { emoji: '🏔️', bg: ['#1e3c72', '#2a5298'] };
  }
  // Camisetas Fútbol
  if (cat.includes('fútbol') || cat.includes('futbol') || cat.includes('football') || cat.includes('jersey')) {
    return { emoji: '⚽', bg: ['#00b09b', '#96c93d'] };
  }
  // Ropa Variada
  if (cat.includes('ropa variada') || cat.includes('ropa') || cat.includes('clothing')) {
    return { emoji: '👔', bg: ['#8E2DE2', '#4A00E0'] };
  }
  // Bolsos / Bags
  if (cat.includes('bolso') || cat.includes('bag') || cat.includes('mochila') || n.includes('bag') || n.includes('louis') || n.includes('gucci') || n.includes('prada')) {
    return { emoji: '👜', bg: ['#667eea', '#764ba2'] };
  }
  // Accesorios
  if (cat.includes('accesorio') || cat.includes('accessory') || cat.includes('acc')) {
    return { emoji: '💎', bg: ['#f093fb', '#f5576c'] };
  }
  // Relojes
  if (cat.includes('reloj') || cat.includes('watch') || n.includes('rolex') || n.includes('omega')) {
    return { emoji: '⌚', bg: ['#00c6ff', '#0072ff'] };
  }
  // Gorras
  if (cat.includes('gorra') || cat.includes('cap') || cat.includes('hat')) {
    return { emoji: '🧢', bg: ['#43e97b', '#38f9d7'] };
  }
  // Perfumes
  if (cat.includes('perfume') || cat.includes('fragance')) {
    return { emoji: '🧴', bg: ['#fa709a', '#fee140'] };
  }
  // Joyería
  if (cat.includes('joyería') || cat.includes('jewelry') || cat.includes('anillo') || cat.includes('cadena')) {
    return { emoji: '💍', bg: ['#f5af19', '#f12711'] };
  }
  // Electrónica
  if (cat.includes('electronic') || cat.includes('tecnología') || cat.includes('tech')) {
    return { emoji: '📱', bg: ['#4776E6', '#8E54E9'] };
  }
  // Gafas
  if (cat.includes('gafas') || cat.includes('glasses') || cat.includes('sunglasses')) {
    return { emoji: '🕶️', bg: ['#141E30', '#243B55'] };
  }
  // Cinturones
  if (cat.includes('cinturón') || cat.includes('belt')) {
    return { emoji: '🥋', bg: ['#834d9b', '#d04ed6'] };
  }
  // Pantalones
  if (cat.includes('pantalón') || cat.includes('pant') || cat.includes('jean')) {
    return { emoji: '👖', bg: ['#1f4037', '#99f2c8'] };
  }
  
  return { emoji: '🏪', bg: ['#00d4aa', '#0066FF'] };
};

 export default function TopStoresScreen() {
   const { isPremium } = usePremium();
   const { t, i18n } = useTranslation();
   const router = useRouter();
   const { width: SCREEN_WIDTH } = useWindowDimensions();
   const currentLang = i18n.language || 'es';
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  
   const [expandedId, setExpandedId] = useState<string | null>(null);
   const [sellers, setSellers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showPaywall, setShowPaywall] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(SHEET_URL);
      const text = await res.text();

      const jsonString = text
        .replace('/*O_o*/', '')
        .replace('google.visualization.Query.setResponse(', '')
        .slice(0, -2);

      const json = JSON.parse(jsonString);
      const rows = json?.table?.rows ?? [];

       const data = rows
         .map((row: any, idx: number) => {
           const mostrarRaw = row.c?.[1]?.v; // Columna B: mostrar
           const nombre = row.c?.[3]?.v; // Columna D: nombre
          
           // Lógica de filtrado igual que en descubrir.tsx
           const mostrarStr = String(mostrarRaw ?? '').trim().toUpperCase();
           const isEmpty = mostrarStr === '';
           const esSi = isEmpty || mostrarRaw === true || mostrarRaw === 1 || ['SI', 'SÍ', 'YES', 'VERDADERO', 'TRUE', '1'].includes(mostrarStr);
           const esNo = mostrarRaw === false || mostrarRaw === 0 || ['NO', 'N', 'FALSO', 'FALSE', '0'].includes(mostrarStr);
          
          if (!esSi || esNo) {
            return null;
          }

          const colors = GRADIENTS[idx % GRADIENTS.length];
          
          // Generar un ID completamente único usando timestamp + index
          const uniqueId = `seller-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`;

          // Mapear columnas según estructura de tiendas
          // Foto en columna Y (índice 24)
          const photoUrl = row.c?.[24]?.v || '';
          
            return {
             id: uniqueId,
             displayId: String(row.c?.[0]?.v ?? idx + 1), // Columna A: id
             name: row.c?.[3]?.v ?? '', // Columna D: nombre
             logo: photoUrl,
             logoUrl: photoUrl,
             category_es: row.c?.[4]?.v ?? '', // Columna E: categoria_es
             category_en: row.c?.[5]?.v ?? '', // Columna F: categoria_en
             badge_es: row.c?.[6]?.v ?? '', // Columna G: badge_es
             badge_en: row.c?.[7]?.v ?? '', // Columna H: badge_en
             note_es: row.c?.[8]?.v ?? '', // Columna I: nota_es
             note_en: row.c?.[9]?.v ?? '', // Columna J: nota_en
             yupooUrl: row.c?.[10]?.v ?? '', // Columna K: url
             password: row.c?.[11]?.v ?? '', // Columna L: password
             rating: (() => {
               const val = row.c?.[12]?.v;
               if (!val || val === '') return 0;
               const parsed = parseFloat(String(val).replace(',', '.'));
               return isNaN(parsed) ? 0 : parsed;
             })(),
             reviews: row.c?.[13]?.v ?? '', // Columna N: resenas
             priceRange: row.c?.[14]?.v ?? '', // Columna O: rango_precio
             trustScore: (() => {
               const val = row.c?.[15]?.v;
               if (!val || val === '') return 0;
               const parsed = parseFloat(String(val).replace(',', '.'));
               return isNaN(parsed) ? 0 : parsed;
             })(),
             specialties_es: (row.c?.[16]?.v ?? '').split('|').filter(Boolean), // Columna Q: especialidades_es
             specialties_en: (row.c?.[17]?.v ?? '').split('|').filter(Boolean), // Columna R: especialidades_en
             whatPeopleBuy_es: (row.c?.[18]?.v ?? '').split('|').filter(Boolean), // Columna S: lo_mas_comprado_es
             whatPeopleBuy_en: (row.c?.[19]?.v ?? '').split('|').filter(Boolean), // Columna T: lo_mas_comprado_en
             pros_es: (row.c?.[20]?.v ?? '').split('|').filter(Boolean), // Columna U: pros_es
             pros_en: (row.c?.[21]?.v ?? '').split('|').filter(Boolean), // Columna V: pros_en
             cons_es: (row.c?.[22]?.v ?? '').split('|').filter(Boolean), // Columna W: contras_es
             cons_en: (row.c?.[23]?.v ?? '').split('|').filter(Boolean), // Columna X: contras_en
             gradientColors: colors.g,
             badgeGradient: colors.b,
           };
        })
        .filter(Boolean);
      
      setSellers(data);
      setLoading(false);
    } catch (error) {
      Sentry.captureException(error as Error);
      logger.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

    const handleToggle = (id: string) => {
       if (!isPremium) {
         setShowPaywall(true);
         return;
       }
       setExpandedId(expandedId === id ? null : id);
     };

  const handleOpenYupoo = (url: string, password?: string) => {
    if (password) {
      Alert.alert(
        `${t('passwordRequired')} ${password}`,
        t('openYupoo'),
        [
          { text: t('close'), style: 'cancel' },
          { text: 'OK', onPress: () => Linking.openURL(url) },
        ]
      );
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />
      
       <ImageBackground
         source={{ uri: HEADER_BG }}
         style={[styles.header, { paddingTop: statusBarHeight + 20, paddingBottom: 5 }]}
         imageStyle={styles.headerImage}
       >
         <Text style={styles.logo}>RepsFinder</Text>
         <Text style={styles.tagline}>{t('tagline')}</Text>
         <View style={{ flex: 1 }} />
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
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>{t('topSellers')}</Text>
          <Text style={styles.introSubtitle}>{t('topStoresSubtitle')}</Text>
          <Text style={styles.introText}>{t('topStoresIntro')}</Text>
        </View>



         {loading && (
           <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('storesLoading')}</Text>
           </View>
         )}

          {error && !loading && (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: COLORS.ACCENT }]}>{t('storesError', { error })}</Text>
              <TouchableOpacity onPress={loadData}>
                <Text style={{ color: COLORS.PRIMARY, marginTop: 10 }}>{t('storesRetry')}</Text>
              </TouchableOpacity>
            </View>
          )}

         {!loading && !error && sellers.length === 0 && (
           <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('storesNoStores')}</Text>
           </View>
         )}

           <View style={styles.sellersContainer}>
              {sellers.map((seller, index) => {
             const isExpanded = expandedId === seller.id;
             
             const category = currentLang === 'en' ? seller.category_en : seller.category_es;
             const note = currentLang === 'en' ? seller.note_en : seller.note_es;
             const specialties = currentLang === 'en' ? seller.specialties_en : seller.specialties_es;
             const whatPeopleBuy = currentLang === 'en' ? seller.whatPeopleBuy_en : seller.whatPeopleBuy_es;
             const pros = currentLang === 'en' ? seller.pros_en : seller.pros_es;
             const cons = currentLang === 'en' ? seller.cons_en : seller.cons_es;
            const storeStyle = getStoreStyle(category, seller.name);
             
             return (
               <TouchableOpacity
                 key={seller.id}
                 style={styles.sellerCard}
                 onPress={() => handleToggle(seller.id)}
                 activeOpacity={0.9}
               >
                  <LinearGradient
                    colors={[COLORS.GLASS_BG, COLORS.CARD_BG]}
                    style={styles.glassGradient}
                  >


                   <View style={styles.sellerHeader}>
                      <View style={styles.logoWrapper}>
                        <LinearGradient
                          colors={seller.logo || seller.logoUrl ? seller.gradientColors : storeStyle.bg}
                          style={styles.logoGradient}
                        >
                          <View style={styles.logoContainer}>
                            {(seller.logo || seller.logoUrl) ? (
                              <Image 
                                source={{ uri: seller.logo || seller.logoUrl }} 
                                style={styles.logoImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text style={styles.logoEmoji}>
                                {storeStyle.emoji}
                              </Text>
                            )}
                          </View>
                        </LinearGradient>
                      </View>
                      <View style={styles.headerInfo}>
                      <Text style={styles.sellerName}>{seller.name}</Text>
                      <View style={styles.ratingRow}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.ratingText}>{seller.rating}</Text>
                      </View>
                      <LinearGradient
                        colors={seller.badgeGradient}
                        style={styles.badgeTag}
                      >
                        <Text style={styles.badgeText}>{category}</Text>
                      </LinearGradient>
                    </View>
                  </View>

<View style={styles.categoryContainer}>
                     <Text style={styles.categoryText}>{category}</Text>
                     <Text style={styles.noteText}>{note}</Text>
                   </View>

                   {isPremium ? (
                   <>
                   <View style={styles.statsGrid}>
                     <View style={styles.statBox}>
                       <LinearGradient
                         colors={[COLORS.GLASS_BG, COLORS.CARD_BG_DARK]}
                         style={styles.statGradient}
                       >
                         <Text style={styles.statLabel}>{t('trustScore')}</Text>
                         <Text style={styles.statValue}>{seller.trustScore}/10</Text>
                       </LinearGradient>
                     </View>
                     <View style={styles.statBox}>
                       <LinearGradient
                         colors={[COLORS.GLASS_BG, COLORS.CARD_BG_DARK]}
                         style={styles.statGradient}
                       >
                         <Text style={styles.statLabel}>{t('priceRange')}</Text>
                         <Text style={styles.statValue}>{seller.priceRange}</Text>
                       </LinearGradient>
                     </View>
                   </View>

                    <View style={styles.specialtiesSection}>
                      <Text style={styles.sectionTitle}>{t('specialties')}</Text>
                      <View style={styles.tagsContainer}>
                         {specialties.map((spec: string, idx: number) => (
                          <View key={`${seller.id}-spec-${idx}`} style={styles.tag}>
                            <Text style={styles.tagText}>{spec}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    </>
                    ) : (
                    <TouchableOpacity onPress={() => setShowPaywall(true)} activeOpacity={0.7}>
                      <View style={styles.lockedOverlay}>
                        <Text style={styles.lockedIcon}>🔒</Text>
                        <Text style={styles.lockedText}>{t('premiumRequired') || 'Premium'}</Text>
                      </View>
                    </TouchableOpacity>
                    )}

                   {!isExpanded && isPremium && (
                     <View style={styles.expandHint}>
                       <Text style={styles.expandHintText}>Toca para ver más detalles</Text>
                       <Text style={styles.expandHintIcon}>▼</Text>
                     </View>
                   )}

                   {isExpanded && isPremium && (
                    <>
                      <View style={styles.popularSection}>
                        <View style={styles.sectionHeader}>
                          <LinearGradient
                            colors={seller.gradientColors}
                            style={styles.sectionHeaderGradient}
                          >
                            <Text style={styles.sectionLabel}>{t('whatPeopleBuy')}</Text>
                          </LinearGradient>
                        </View>
                         {whatPeopleBuy.map((item: string, idx: number) => (
                          <View key={`${seller.id}-buy-${idx}`} style={styles.listItem}>
                            <LinearGradient
                              colors={seller.gradientColors}
                              style={styles.bulletGradient}
                            />
                            <Text style={styles.listText}>{item}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.prosSection}>
                        <View style={styles.sectionHeader}>
                          <LinearGradient
                            colors={['#00d4aa', '#00a88a']}
                            style={styles.sectionHeaderGradient}
                          >
                            <Text style={styles.sectionLabel}>{t('pros')}</Text>
                          </LinearGradient>
                        </View>
                         {pros.map((pro: string, idx: number) => (
                          <View key={`${seller.id}-pro-${idx}`} style={styles.listItem}>
                            <LinearGradient
                              colors={['#00d4aa', '#00a88a']}
                              style={styles.bulletGradient}
                            />
                            <Text style={styles.listText}>{pro}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.consSection}>
                        <View style={styles.sectionHeader}>
                          <LinearGradient
                            colors={['#FF3366', '#cc2952']}
                            style={styles.sectionHeaderGradient}
                          >
                            <Text style={styles.sectionLabel}>{t('cons')}</Text>
                          </LinearGradient>
                        </View>
                         {cons.map((con: string, idx: number) => (
                          <View key={`${seller.id}-con-${idx}`} style={styles.listItem}>
                            <LinearGradient
                              colors={['#FF3366', '#cc2952']}
                              style={styles.bulletGradient}
                            />
                            <Text style={styles.listText}>{con}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.storeButtonContainer}>
                        <TouchableOpacity
                          onPress={() => handleOpenYupoo(seller.yupooUrl, seller.password)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={seller.gradientColors}
                            style={styles.storeButton}
                          >
                            <Text style={styles.storeButtonText}>{t('visitStore')}</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </>
                    )}
                  </LinearGradient>
                  
                </TouchableOpacity>
             );
           })}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

       <PaywallModal
         visible={showPaywall}
         onClose={() => setShowPaywall(false)}
       />
     </View>
   );
 }

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
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
  logo: { fontSize: 32, fontWeight: '900', color: COLORS.PRIMARY },
   tagline: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
   gradientBarContainer: { height: 6, width: '100%' },
   gradientBar: { height: '100%', borderRadius: 2 },
  subBanner: { position: 'absolute', left: 0, right: 0, zIndex: 99 },
  subBannerGradient: { paddingVertical: 10, paddingHorizontal: 20, minHeight: 40 },
  content: { flex: 1 },
  introSection: { paddingHorizontal: 20, marginBottom: 24 },
  introTitle: { fontSize: 28, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 8 },
  introSubtitle: { fontSize: 15, color: COLORS.PRIMARY, marginBottom: 12, fontWeight: '700' },
  introText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  sellersContainer: { paddingHorizontal: 20, marginBottom: 32 },
  sellerCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  glassGradient: { padding: 18, backgroundColor: COLORS.CARD_BG },
  rankingBadgeContainer: { position: 'absolute', top: 12, left: 12, zIndex: 1 },
  rankingBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  rankingNumber: { fontSize: 18, fontWeight: '900', color: '#000' },
  sellerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GLASS_BORDER,
  },
  logoWrapper: { marginRight: 14 },
  logoGradient: { width: 74, height: 74, borderRadius: 16, padding: 2 },
  logoContainer: {
     width: 70,
     height: 70,
     borderRadius: 14,
     backgroundColor: 'transparent',
     justifyContent: 'center',
     alignItems: 'center',
     overflow: 'hidden',
   },
   logoImage: {
     width: 70,
     height: 70,
     borderRadius: 14,
   },
   avatarContainer: {
     width: 70,
     height: 70,
     justifyContent: 'center',
     alignItems: 'center',
   },
   avatarText: {
     fontSize: 24,
     fontWeight: '900',
     color: '#fff',
     textShadowColor: 'rgba(0,0,0,0.3)',
     textShadowOffset: { width: 0, height: 2 },
     textShadowRadius: 4,
   },
   logoEmoji: { fontSize: 36 },
  headerInfo: { flex: 1, justifyContent: 'center' },
  sellerName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
    textShadowColor: '#00000050',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  star: { fontSize: 14 },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#FFD700' },
  reviewsText: { fontSize: 12, color: COLORS.TEXT_TERTIARY },
  badgeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#000' },
  categoryContainer: { marginBottom: 12 },
  categoryText: { fontSize: 13, fontWeight: '700', color: COLORS.ACCENT_BLUE, marginBottom: 4 },
  noteText: { fontSize: 11, fontWeight: '600', color: COLORS.PRIMARY, fontStyle: 'italic' },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, overflow: 'hidden', borderRadius: 10 },
  statGradient: {
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    borderRadius: 10,
  },
  statLabel: { fontSize: 10, color: COLORS.TEXT_TERTIARY, marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 12, fontWeight: '700', color: COLORS.TEXT_PRIMARY, textAlign: 'center' },
  specialtiesSection: { marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: COLORS.CARD_BG_DARK,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_PRIMARY },
  popularSection: { marginBottom: 14 },
  prosSection: { marginBottom: 14 },
  consSection: { marginBottom: 16 },
  sectionHeader: { marginBottom: 10, borderRadius: 8, overflow: 'hidden' },
  sectionHeaderGradient: { paddingVertical: 8, paddingHorizontal: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: '#fff' },
  listItem: { flexDirection: 'row', marginBottom: 8, paddingLeft: 4, alignItems: 'flex-start' },
  bulletGradient: { width: 6, height: 6, borderRadius: 3, marginRight: 8, marginTop: 6 },
  listText: { fontSize: 12, color: '#bbb', flex: 1, lineHeight: 18 },
  storeButtonContainer: {
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  storeButton: { paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  storeButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: '#00000050',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  storeButtonSubtext: { fontSize: 11, fontWeight: '600', color: '#ffffff90' },
  infoBannerContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0066FF30',
  },
  infoBannerGradient: { padding: 16 },
  infoBannerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.SECONDARY, marginBottom: 10 },
  infoBannerText: { fontSize: 13, color: '#ccc', lineHeight: 20, marginBottom: 4 },
   bottomSpacer: { height: 20 },
   loadingContainer: { padding: 40, alignItems: 'center' },
   loadingText: { color: COLORS.TEXT_SECONDARY, fontSize: 16 },
   modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
   paywallModal: { backgroundColor: COLORS.CARD_BG, borderRadius: 20, padding: 20, width: '80%', maxWidth: 400 },
   paywallTitle: { fontSize: 20, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 10 },
   paywallBody: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginBottom: 20 },
   paywallButton: { backgroundColor: COLORS.PRIMARY, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10 },
   paywallButtonText: { color: COLORS.BACKGROUND, fontSize: 16, fontWeight: '900' },
   paywallClose: { alignItems: 'center', paddingVertical: 8 },
    paywallCloseText: { color: COLORS.TEXT_TERTIARY, fontSize: 14 },
    premiumBanner: {
      backgroundColor: 'transparent',
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#00d4aa',
      alignItems: 'center',
    },
    premiumBannerText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 12,
    },
    premiumBannerButton: {
      borderRadius: 12,
      overflow: 'hidden',
      width: '100%',
    },
    premiumBannerGradient: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    premiumBannerButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    premiumUpgradeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 212, 170, 0.15)',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.PRIMARY,
    },
    premiumUpgradeIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    premiumUpgradeText: {
      color: COLORS.PRIMARY,
      fontSize: 13,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    premiumUpgradeArrow: {
      color: COLORS.PRIMARY,
      fontSize: 16,
      fontWeight: 'bold',
    },
    expandHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: COLORS.BORDER_LIGHT,
    },
    expandHintText: {
      color: COLORS.TEXT_TERTIARY,
      fontSize: 12,
      marginRight: 6,
    },
    expandHintIcon: {
      color: COLORS.TEXT_TERTIARY,
      fontSize: 10,
    },
    lockedOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      marginTop: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 51, 102, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 51, 102, 0.3)',
    },
    lockedIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    lockedText: {
      color: '#FF3366',
      fontSize: 14,
      fontWeight: '700',
    },
  });