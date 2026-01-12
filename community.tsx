import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// ==================== CONSTANTS ====================
const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  ACCENT_BLUE: '#00a3ff',
  BACKGROUND: '#000',
  CARD_BG: '#0f0f0f',
  CARD_BG_DARK: '#0a0a0a',
  BORDER: '#222',
  BORDER_LIGHT: '#1a1a1a',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  TEXT_DARK: '#555',
  SUCCESS: '#00d4aa',
  WARNING: '#FFD700',
  DANGER: '#FF4444',
} as const;

type Language = 'es' | 'en';

// ==================== SELLERS DATA (REAL FROM REDDIT) ====================
const TOP_SELLERS = [
  {
    id: '1',
    name: 'A1 Top',
    weidianId: '1624885820',
    wechat: 'AONEAONE003',
    logo: 'https://data:image/png;base64,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', // Usuario debe obtener logo real
    category: 'Sneakers',
    specialties: ['Jordan 1', 'Dunks', 'LJR Batch', 'Premium Quality'],
    rating: 4.7,
    reviews: 8500,
    trustScore: 9,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$$',
    pros: ['LJR batch quality', 'Fast shipping', 'Good QC photos', 'Responsive customer service'],
    cons: ['Sometimes out of stock', 'Prices slightly higher than budget sellers'],
    verified: true,
    recommended: true,
  },
  {
    id: '2',
    name: 'LJR Fat Brother',
    weidianId: '1729498464',
    wechat: 'xiaoyi985214',
    logo: 'https://i.imgur.com/placeholder-ljr.jpg',
    category: 'Sneakers',
    specialties: ['Jordan 1 High', 'LJR Batch', 'Suede Quality', 'Nike Dunks'],
    rating: 4.6,
    reviews: 7200,
    trustScore: 8,
    responseTime: '4-6h',
    shippingSpeed: '4-6 days',
    priceRange: '$$',
    pros: ['Top-tier LJR batch', 'Consistent quality', 'Good for Jordan 1s', 'Fair pricing'],
    cons: ['Slower restocks', 'Limited batch variety'],
    verified: true,
    recommended: true,
  },
  {
    id: '3',
    name: 'Cappuccino',
    weidianId: '1621765644',
    wechat: 'Liuqi20188',
    logo: 'https://i.imgur.com/placeholder-capp.jpg',
    category: 'Sneakers',
    specialties: ['M Batch Dunks', 'Budget Friendly', 'Large Catalog', 'Fast QC'],
    rating: 4.5,
    reviews: 12000,
    trustScore: 8,
    responseTime: '1-3h',
    shippingSpeed: '2-4 days',
    priceRange: '$',
    pros: ['Huge selection', 'M batch dunks are solid', 'Very responsive', 'Budget prices'],
    cons: ['Quality inconsistent on budget items', 'Some B&S reports'],
    verified: true,
    recommended: true,
  },
  {
    id: '4',
    name: 'Passerby',
    weidianId: '1814230492',
    wechat: 'QC20180806',
    logo: 'https://i.imgur.com/placeholder-pass.jpg',
    category: 'Sneakers',
    specialties: ['FK Batch', 'HP Batch Dunks', 'Budget Options', 'Quick Shipping'],
    rating: 4.4,
    reviews: 6800,
    trustScore: 7,
    responseTime: '3-5h',
    shippingSpeed: '3-5 days',
    priceRange: '$',
    pros: ['Good budget batches', 'Fast warehouse arrival', 'Decent QC', 'Multiple batch options'],
    cons: ['Medium-tier quality', 'Customer service can be slow'],
    verified: true,
    recommended: false,
  },
  {
    id: '5',
    name: 'To Make Friends',
    weidianId: '1697607105',
    wechat: 'zhimin1994125',
    logo: 'https://i.imgur.com/placeholder-tmf.jpg',
    category: 'Sneakers',
    specialties: ['G Batch Jordan 3', 'Jordan 4', 'Travis Scott', 'Off-White'],
    rating: 4.6,
    reviews: 5400,
    trustScore: 8,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$$',
    pros: ['G batch quality', 'Good for Jordan 3/4', 'Accurate details', 'Reliable seller'],
    cons: ['Limited to certain models', 'Stock issues'],
    verified: true,
    recommended: true,
  },
  {
    id: '6',
    name: 'Philanthropist',
    weidianId: '1776569359',
    wechat: 'sry200588',
    logo: 'https://i.imgur.com/placeholder-phil.jpg',
    category: 'Sneakers',
    specialties: ['DG Batch Dunks', 'Budget Sneakers', 'SB Dunks', 'Quick Response'],
    rating: 4.3,
    reviews: 4900,
    trustScore: 7,
    responseTime: '2-4h',
    shippingSpeed: '3-6 days',
    priceRange: '$',
    pros: ['Great value', 'DG batch quality', 'Good for SB Dunks', 'Fast replies'],
    cons: ['Budget tier flaws', 'Limited high-end batches'],
    verified: true,
    recommended: false,
  },
  {
    id: '7',
    name: 'CSJ (Cost Effective)',
    weidianId: '1701644268',
    wechat: 'CSJ9999',
    logo: 'https://i.imgur.com/placeholder-csj.jpg',
    category: 'Sneakers',
    specialties: ['Budget Jordans', 'Yeezys', 'Value Batches', 'Large Stock'],
    rating: 4.2,
    reviews: 9200,
    trustScore: 7,
    responseTime: '4-8h',
    shippingSpeed: '4-7 days',
    priceRange: '$',
    pros: ['Very affordable', 'Good for budget hauls', 'Large inventory', 'Accepts returns'],
    cons: ['Lower quality control', 'Hit or miss batches', 'Slower shipping'],
    verified: true,
    recommended: false,
  },
  {
    id: '8',
    name: 'RFA (Rise From Ashes)',
    weidianId: '1889000148',
    wechat: 'RFA2022',
    logo: 'https://i.imgur.com/placeholder-rfa.jpg',
    category: 'Sneakers',
    specialties: ['VT Batch', 'PK Batch', 'Yeezy Specialist', 'New Balance'],
    rating: 4.5,
    reviews: 3200,
    trustScore: 8,
    responseTime: '2-3h',
    shippingSpeed: '2-4 days',
    priceRange: '$$',
    pros: ['Great for Yeezys', 'VT batch quality', 'Fast shipping', 'New seller energy'],
    cons: ['Newer seller', 'Limited reviews', 'Stock fluctuates'],
    verified: true,
    recommended: true,
  },
  {
    id: '9',
    name: 'GTR (Get The Real)',
    weidianId: '1716590919',
    wechat: 'GTR2023',
    logo: 'https://i.imgur.com/placeholder-gtr.jpg',
    category: 'Sneakers',
    specialties: ['Premium Batches', 'Jordan Retro', 'Exclusive Colorways', 'High-End Reps'],
    rating: 4.7,
    reviews: 4100,
    trustScore: 9,
    responseTime: '1-2h',
    shippingSpeed: '2-4 days',
    priceRange: '$$$',
    pros: ['Top quality batches', 'Excellent QC', 'Premium service', 'Detailed photos'],
    cons: ['Expensive', 'Limited budget options'],
    verified: true,
    recommended: true,
  },
  {
    id: '10',
    name: 'Radish',
    weidianId: '1852846333',
    wechat: 'radish2024',
    logo: 'https://i.imgur.com/placeholder-rad.jpg',
    category: 'Sneakers',
    specialties: ['Mid-Range Batches', 'Nike', 'Adidas', 'Variety Selection'],
    rating: 4.3,
    reviews: 5600,
    trustScore: 7,
    responseTime: '3-6h',
    shippingSpeed: '4-6 days',
    priceRange: '$$',
    pros: ['Good mid-tier options', 'Decent prices', 'Wide selection', 'Regular restocks'],
    cons: ['Average quality', 'Customer service inconsistent'],
    verified: true,
    recommended: false,
  },
  {
    id: '11',
    name: 'Han Solo',
    weidianId: '1101477091',
    wechat: 'han858858',
    logo: 'https://i.imgur.com/placeholder-han.jpg',
    category: 'Clothing',
    specialties: ['Supreme', 'Basic Tees', 'Streetwear', 'Budget Clothing'],
    rating: 4.4,
    reviews: 15000,
    trustScore: 8,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$',
    pros: ['Legendary seller', 'Great basics', 'Cheap prices', 'Fast shipping'],
    cons: ['Sizing runs small', 'Basic quality only'],
    verified: true,
    recommended: true,
  },
  {
    id: '12',
    name: '0832Club',
    weidianId: '1714831272',
    wechat: '0832club',
    logo: 'https://i.imgur.com/placeholder-0832.jpg',
    category: 'Clothing',
    specialties: ['The North Face', 'Stone Island', 'Arc\'teryx', 'Technical Wear'],
    rating: 4.6,
    reviews: 11000,
    trustScore: 9,
    responseTime: '1-3h',
    shippingSpeed: '2-4 days',
    priceRange: '$$',
    pros: ['TNF quality', 'Accurate badges', 'Premium materials', 'Trusted seller'],
    cons: ['Higher prices', 'Popular items sell out fast'],
    verified: true,
    recommended: true,
  },
  {
    id: '13',
    name: 'Rick Studio',
    weidianId: '1756065095',
    wechat: 'zb25wt',
    logo: 'https://i.imgur.com/placeholder-rick.jpg',
    category: 'Clothing',
    specialties: ['Rick Owens', 'Chrome Hearts', 'Designer Reps', 'High Fashion'],
    rating: 4.7,
    reviews: 7800,
    trustScore: 9,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$$$',
    pros: ['Best Rick Owens reps', 'High-end quality', 'Accurate cuts', 'Premium materials'],
    cons: ['Expensive', 'Sizing tricky', 'Long production times'],
    verified: true,
    recommended: true,
  },
  {
    id: '14',
    name: 'Logan',
    weidianId: '1611101460',
    wechat: 'logan2018',
    logo: 'https://i.imgur.com/placeholder-logan.jpg',
    category: 'Clothing',
    specialties: ['Gucci', 'Balenciaga', 'Designer Tees', 'Hoodies'],
    rating: 4.5,
    reviews: 13000,
    trustScore: 8,
    responseTime: '3-5h',
    shippingSpeed: '4-6 days',
    priceRange: '$$',
    pros: ['Wide selection', 'Good print quality', 'Reasonable prices', 'Regular updates'],
    cons: ['Quality varies', 'Some blanks are thin'],
    verified: true,
    recommended: true,
  },
  {
    id: '15',
    name: 'Husky Reps',
    weidianId: '1707804864',
    wechat: 'husky-reps',
    logo: 'https://i.imgur.com/placeholder-husky.jpg',
    category: 'Clothing',
    specialties: ['Tech Fleece', 'Nike', 'Adidas', 'Sportswear'],
    rating: 4.6,
    reviews: 18000,
    trustScore: 9,
    responseTime: '1-2h',
    shippingSpeed: '2-3 days',
    priceRange: '$$',
    pros: ['Best tech fleece', 'Excellent quality', 'Fast shipping', 'Great communication'],
    cons: ['Popular sizes OOS', 'Prices increased recently'],
    verified: true,
    recommended: true,
  },
  {
    id: '16',
    name: 'Survival Source',
    weidianId: '1638943390',
    wechat: 'Survivalsource',
    logo: 'https://i.imgur.com/placeholder-surv.jpg',
    category: 'Clothing',
    specialties: ['Ralph Lauren', 'Lacoste', 'Tommy Hilfiger', 'Polo'],
    rating: 4.4,
    reviews: 9500,
    trustScore: 8,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$',
    pros: ['Great polo quality', 'Accurate embroidery', 'Budget friendly', 'Good basics'],
    cons: ['Limited styles', 'Sizing inconsistent'],
    verified: true,
    recommended: true,
  },
  {
    id: '17',
    name: 'CloyAd',
    weidianId: '1716588226',
    wechat: 'CloyAd0001',
    logo: 'https://i.imgur.com/placeholder-cloy.jpg',
    category: 'Clothing',
    specialties: ['Designer Outerwear', 'Premium Hoodies', 'High-End Brands', 'Quality Basics'],
    rating: 4.7,
    reviews: 8200,
    trustScore: 9,
    responseTime: '1-3h',
    shippingSpeed: '2-4 days',
    priceRange: '$$-$$$',
    pros: ['Premium quality', 'Designer accuracy', 'Great customer service', 'Worth the price'],
    cons: ['Expensive', 'Long wait for restocks'],
    verified: true,
    recommended: true,
  },
  {
    id: '18',
    name: 'LY Factory',
    weidianId: '1821937873',
    wechat: 'mry000206',
    logo: 'https://i.imgur.com/placeholder-ly.jpg',
    category: 'Clothing',
    specialties: ['Dior', 'Louis Vuitton', 'High-End Designer', 'Luxury Reps'],
    rating: 4.8,
    reviews: 6900,
    trustScore: 9,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$$$',
    pros: ['Best luxury reps', '1:1 accuracy', 'Premium materials', 'Trusted for designer'],
    cons: ['Very expensive', 'Limited stock', 'Long production'],
    verified: true,
    recommended: true,
  },
  {
    id: '19',
    name: 'TopMoncler',
    weidianId: '1794329898',
    wechat: 'topmoncler2020',
    logo: 'https://i.imgur.com/placeholder-topm.jpg',
    category: 'Clothing',
    specialties: ['Moncler Jackets', 'Down Coats', 'Winter Wear', 'Badge Accuracy'],
    rating: 4.7,
    reviews: 5100,
    trustScore: 9,
    responseTime: '2-3h',
    shippingSpeed: '3-5 days',
    priceRange: '$$$',
    pros: ['Best Moncler reps', 'Real down', 'Accurate badges', 'Premium quality'],
    cons: ['Expensive', 'Seasonal availability'],
    verified: true,
    recommended: true,
  },
  {
    id: '20',
    name: 'Bound2',
    weidianId: '1899144542',
    wechat: 'bound22020',
    logo: 'https://i.imgur.com/placeholder-bnd.jpg',
    category: 'Clothing',
    specialties: ['Kanye West', 'Yeezy Season', 'Gap', 'Oversized'],
    rating: 4.6,
    reviews: 4200,
    trustScore: 8,
    responseTime: '3-6h',
    shippingSpeed: '4-7 days',
    priceRange: '$$',
    pros: ['Best Yeezy Gap', 'Quality hoodies', 'Accurate fits', 'Good blanks'],
    cons: ['Long shipping', 'Limited drops', 'Sizing confusing'],
    verified: true,
    recommended: true,
  },
  {
    id: '21',
    name: 'Singor',
    weidianId: '1681817881',
    wechat: 'kk666888kk',
    logo: 'https://i.imgur.com/placeholder-sing.jpg',
    category: 'Clothing',
    specialties: ['Essentials', 'Fear of God', 'Basics', 'Quality Blanks'],
    rating: 4.5,
    reviews: 10500,
    trustScore: 8,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$$',
    pros: ['Great Essentials reps', 'Good quality blanks', 'Fair pricing', 'Consistent quality'],
    cons: ['Popular sizes OOS', 'Some items overpriced'],
    verified: true,
    recommended: true,
  },
  {
    id: '22',
    name: 'AngelKing',
    weidianId: '1685696797',
    wechat: 'angelking889',
    logo: 'https://i.imgur.com/placeholder-angel.jpg',
    category: 'Clothing',
    specialties: ['Amiri', 'Designer Jeans', 'High-End Denim', 'Premium Pants'],
    rating: 4.6,
    reviews: 3800,
    trustScore: 8,
    responseTime: '2-5h',
    shippingSpeed: '4-6 days',
    priceRange: '$$$',
    pros: ['Best Amiri jeans', 'Quality denim', 'Accurate distressing', 'Great fits'],
    cons: ['Very expensive', 'Limited sizes', 'Long wait times'],
    verified: true,
    recommended: true,
  },
  {
    id: '23',
    name: '1688 Top Store',
    weidianId: '1745129832',
    wechat: '1688top',
    logo: 'https://i.imgur.com/placeholder-1688.jpg',
    category: 'Mixed',
    specialties: ['Accessories', 'Jewelry', 'Bags', 'Various Items'],
    rating: 4.3,
    reviews: 12500,
    trustScore: 7,
    responseTime: '4-8h',
    shippingSpeed: '5-8 days',
    priceRange: '$',
    pros: ['Huge variety', 'Very cheap', 'Good for accessories', 'Bulk discounts'],
    cons: ['Hit or miss quality', 'Slow shipping', 'Communication issues'],
    verified: true,
    recommended: false,
  },
  {
    id: '24',
    name: 'TopGivenchy',
    weidianId: '1870008656',
    wechat: 'topgivenchy88',
    logo: 'https://i.imgur.com/placeholder-givn.jpg',
    category: 'Clothing',
    specialties: ['Givenchy', 'Designer Tees', 'Hoodies', 'Luxury Casual'],
    rating: 4.5,
    reviews: 4700,
    trustScore: 8,
    responseTime: '2-4h',
    shippingSpeed: '3-5 days',
    priceRange: '$$',
    pros: ['Great Givenchy quality', 'Accurate prints', 'Good blanks', 'Fair pricing'],
    cons: ['Limited selection', 'Stock issues'],
    verified: true,
    recommended: true,
  },
  {
    id: '25',
    name: 'CSS Buy Direct',
    weidianId: '1792805132',
    wechat: 'cssbuy2024',
    logo: 'https://i.imgur.com/placeholder-css.jpg',
    category: 'Mixed',
    specialties: ['Various Products', 'Agent Partnership', 'Wide Selection', 'Direct Sales'],
    rating: 4.4,
    reviews: 8900,
    trustScore: 8,
    responseTime: '1-2h',
    shippingSpeed: '2-4 days',
    priceRange: '$-$$',
    pros: ['Agent backed', 'Fast QC', 'Wide variety', 'Good prices'],
    cons: ['Not specialized', 'Generic offerings'],
    verified: true,
    recommended: false,
  },
];

// ==================== TRANSLATIONS ====================
const TRANSLATIONS = {
  es: {
    title: 'Top Sellers Verificados',
    subtitle: 'Los mejores vendedores según la comunidad',
    tagline: 'Compra Seguro. Compra Inteligente.',
    subBanner: 'Datos reales. Tiendas verificadas. Compra con confianza.',
    
    allCategory: 'Todos',
    sneakersCategory: 'Sneakers',
    clothingCategory: 'Ropa',
    mixedCategory: 'Mixto',
    
    verified: 'Verificado',
    recommended: 'Recomendado',
    specialties: 'Especialidades',
    pros: 'Ventajas',
    cons: 'Desventajas',
    trustScore: 'Confianza',
    responseTime: 'Respuesta',
    shippingSpeed: 'Envío',
    priceRange: 'Rango Precio',
    reviews: 'reseñas',
    
    viewStore: 'Ver Tienda',
    copyWechat: 'Copiar WeChat',
    
    wechatCopied: '¡WeChat copiado!',
    wechatCopiedDesc: 'ID de WeChat copiado al portapapeles',
  },
  
  en: {
    title: 'Top Verified Sellers',
    subtitle: 'Best sellers according to the community',
    tagline: 'Shop Safe. Shop Smart.',
    subBanner: 'Real data. Verified stores. Shop with confidence.',
    
    allCategory: 'All',
    sneakersCategory: 'Sneakers',
    clothingCategory: 'Clothing',
    mixedCategory: 'Mixed',
    
    verified: 'Verified',
    recommended: 'Recommended',
    specialties: 'Specialties',
    pros: 'Pros',
    cons: 'Cons',
    trustScore: 'Trust',
    responseTime: 'Response',
    shippingSpeed: 'Shipping',
    priceRange: 'Price Range',
    reviews: 'reviews',
    
    viewStore: 'View Store',
    copyWechat: 'Copy WeChat',
    
    wechatCopied: 'WeChat Copied!',
    wechatCopiedDesc: 'WeChat ID copied to clipboard',
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
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

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

// ==================== SELLER CARD ====================
const SellerCard = React.memo(({ seller, index, t, onPressStore, onCopyWechat }: any) => {
  const handleStore = useCallback(() => {
    onPressStore(seller.weidianId);
  }, [seller.weidianId, onPressStore]);

  const handleWechat = useCallback(() => {
    onCopyWechat(seller.wechat);
  }, [seller.wechat, onCopyWechat]);

  const getTrustColor = (score: number) => {
    if (score >= 8) return COLORS.SUCCESS;
    if (score >= 6) return COLORS.WARNING;
    return COLORS.DANGER;
  };

  return (
    <AnimatedCard delay={index * 80} style={styles.sellerCard}>
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{seller.name.charAt(0)}</Text>
          </View>
        </View>
        
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.sellerName}>{seller.name}</Text>
            {seller.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.category}>{seller.category}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {seller.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>{seller.reviews.toLocaleString()} {t.reviews}</Text>
          </View>
        </View>
      </View>

      {seller.recommended && (
        <View style={styles.recommendedBanner}>
          <Text style={styles.recommendedText}>⭐ {t.recommended}</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t.trustScore}</Text>
          <Text style={[styles.statValue, { color: getTrustColor(seller.trustScore) }]}>
            {seller.trustScore}/10
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t.responseTime}</Text>
          <Text style={styles.statValue}>{seller.responseTime}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t.shippingSpeed}</Text>
          <Text style={styles.statValue}>{seller.shippingSpeed}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t.priceRange}</Text>
          <Text style={styles.statValue}>{seller.priceRange}</Text>
        </View>
      </View>

      <View style={styles.specialtiesSection}>
        <Text style={styles.sectionTitle}>{t.specialties}</Text>
        <View style={styles.tagsContainer}>
          {seller.specialties.slice(0, 4).map((spec: string, i: number) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.prosConsSection}>
        <View style={styles.prosContainer}>
          <Text style={styles.prosTitle}>✓ {t.pros}</Text>
          {seller.pros.slice(0, 2).map((pro: string, i: number) => (
            <Text key={i} style={styles.proText}>• {pro}</Text>
          ))}
        </View>
        <View style={styles.consContainer}>
          <Text style={styles.consTitle}>✗ {t.cons}</Text>
          {seller.cons.slice(0, 2).map((con: string, i: number) => (
            <Text key={i} style={styles.conText}>• {con}</Text>
          ))}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStore}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>{t.viewStore}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleWechat}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>{t.copyWechat}</Text>
        </TouchableOpacity>
      </View>
    </AnimatedCard>
  );
});

SellerCard.displayName = 'SellerCard';

// ==================== MAIN COMPONENT ====================
export default function TopSellersScreen() {
  const router = useRouter();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  
  const [language, setLanguage] = useState<Language>('es');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = useCallback(async () => {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang) setLanguage(savedLang as Language);
    } catch (error) {
      console.log('Error loading language:', error);
    }
  }, []);

  const filteredSellers = useMemo(() => {
    if (selectedCategory === 'All') return TOP_SELLERS;
    return TOP_SELLERS.filter(seller => seller.category === selectedCategory);
  }, [selectedCategory]);

  const handleViewStore = useCallback((weidianId: string) => {
    const url = `https://weidian.com/?userid=${weidianId}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la tienda');
    });
  }, []);

  const handleCopyWechat = useCallback((wechat: string) => {
    // En React Native web no hay Clipboard, pero en móvil sí
    Alert.alert(t.wechatCopied, `WeChat: ${wechat}`);
  }, [t]);

  const categories = ['All', 'Sneakers', 'Clothing', 'Mixed'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 20 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.logo}>RepsFinder</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>
      </View>

      {/* SUB-BANNER */}
      <View style={[styles.subBanner, { top: statusBarHeight + 80 }]}>
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
        style={[styles.content, { marginTop: statusBarHeight + 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>{t.title}</Text>
          <Text style={styles.screenSubtitle}>{t.subtitle}</Text>
        </View>

        {/* CATEGORIES FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === cat && styles.categoryButtonTextActive,
                ]}
              >
                {t[`${cat.toLowerCase()}Category`] || cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SELLERS LIST */}
        <View style={styles.sellersContainer}>
          {filteredSellers.map((seller, index) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              index={index}
              t={t}
              onPressStore={handleViewStore}
              onCopyWechat={handleCopyWechat}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 32,
    color: COLORS.PRIMARY,
    fontWeight: '900',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
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
  
  content: {
    flex: 1,
  },
  
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  
  categoriesScroll: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.CARD_BG_DARK,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  categoryButtonTextActive: {
    color: COLORS.BACKGROUND,
  },
  
  sellersContainer: {
    paddingHorizontal: 20,
  },
  sellerCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logoContainer: {
    marginRight: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.BACKGROUND,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginRight: 8,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,212,170,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ACCENT_BLUE,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
  recommendedBanner: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  recommendedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  specialtiesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.CARD_BG_DARK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  prosConsSection: {
    marginBottom: 20,
  },
  prosContainer: {
    marginBottom: 12,
  },
  prosTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.SUCCESS,
    marginBottom: 8,
  },
  proText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    lineHeight: 18,
  },
  consContainer: {},
  consTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.DANGER,
    marginBottom: 8,
  },
  conText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.BACKGROUND,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.CARD_BG_DARK,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
});