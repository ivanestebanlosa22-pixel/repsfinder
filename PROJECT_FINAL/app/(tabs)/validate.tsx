import React, { useState, useEffect } from 'react';
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
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { SettingsButton } from '../../components/SettingsButton';
import { convertPrice, formatPrice } from '../../constants/currencies';

// GOOGLE SHEETS CONFIG - PESTAÑA "MAIN"
const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';
const SHEET_NAME = 'MAIN';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

interface Product {
  categoria: string;
  nombre: string;
  descripcion: string;
  batch: string;
  precio: number;
  calidad: string;
  rating: number;
  ventas: number;
  foto: string;
  linkWeidian: string;
  linkTaobao: string;
  linkUsfans: string;
  linkCnfans: string;
  linkLitbuy: string;
}

export default function ValidateScreen() {
  const { t, currency } = useAppSettings();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  useEffect(() => {
    loadProductsFromSheet();
  }, []);

  const loadProductsFromSheet = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const text = await response.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;

      const loadedProducts: Product[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i]?.c || [];

        loadedProducts.push({
          categoria: cells[0]?.v || '',
          nombre: cells[1]?.v || 'Producto',
          descripcion: cells[2]?.v || '',
          batch: cells[3]?.v || '',
          precio: parseFloat(cells[4]?.v || '0'),
          calidad: cells[5]?.v || '',
          rating: parseFloat(cells[6]?.v || '0'),
          ventas: parseInt(cells[7]?.v || '0'),
          foto: cells[8]?.v || 'https://via.placeholder.com/300',
          linkWeidian: cells[9]?.v || '',
          linkTaobao: cells[10]?.v || '',
          linkUsfans: cells[11]?.v || '',
          linkCnfans: cells[12]?.v || '',
          linkLitbuy: cells[13]?.v || '',
        });
      }

      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAgentModal = (product: Product) => {
    setSelectedProduct(product);
    setShowAgentModal(true);
  };

  const buyWithAgent = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
      setShowAgentModal(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadge = (product: Product) => {
    if (product.rating >= 4.8) return { text: t.validateTopQuality, color: '#FFD700' };
    if (product.ventas >= 5000) return { text: t.validateTrending, color: '#FF6B6B' };
    if (product.ventas >= 2000) return { text: t.validatePopular, color: '#4FACFE' };
    if (product.precio >= 300) return { text: t.validatePremium, color: '#AB47BC' };
    if (product.precio <= 150) return { text: t.validateOffer, color: '#4ade80' };
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <AnimatedBackground />

      {/* HEADER PREMIUM CON BANNER ESTANDARIZADO */}
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
          <Text style={styles.heroTitle}>{t.validateTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.validateSubtitle}</Text>
          {!loading && (
            <Text style={styles.productCount}>
              {filteredProducts.length} {t.validateProductCount}
            </Text>
          )}
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t.validateSearchPlaceholder}
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LOADING STATE */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00e5b0" />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        ) : (
          <>
            {/* PRODUCTS GRID */}
            <View style={styles.productsGrid}>
              {filteredProducts.map((product, index) => {
                const badge = getBadge(product);

                return (
                  <View key={index} style={styles.productCard}>
                    {/* BADGE */}
                    {badge && (
                      <View style={[styles.productBadge, { backgroundColor: badge.color }]}>
                        <Text style={styles.productBadgeText}>{badge.text}</Text>
                      </View>
                    )}

                    {/* IMAGE */}
                    <Image
                      source={{ uri: product.foto }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />

                    {/* INFO */}
                    <View style={styles.productInfo}>
                      <Text style={styles.productCategory}>{product.categoria}</Text>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.nombre}
                      </Text>

                      {product.batch && (
                        <View style={styles.batchContainer}>
                          <Text style={styles.batchText}>{product.batch}</Text>
                        </View>
                      )}

                      <View style={styles.productMeta}>
                        {product.rating > 0 && (
                          <View style={styles.ratingContainer}>
                            <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
                          </View>
                        )}
                        {product.ventas > 0 && (
                          <Text style={styles.salesText}>
                            {product.ventas} {t.validateVerifiedSales}
                          </Text>
                        )}
                      </View>

                      <Text style={styles.productPrice}>
                        {formatPrice(convertPrice(product.precio, 'USD', currency), currency)}
                      </Text>

                      {/* BOTÓN COMPRAR */}
                      <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => openAgentModal(product)}
                      >
                        <Text style={styles.buyButtonText}>{t.validateBuyButton}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {filteredProducts.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t.validateNoResults}</Text>
              </View>
            )}
          </>
        )}

        {/* FOOTER */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>{t.footerCopy}</Text>
          <Text style={styles.footerSubtitle}>{t.footerRights}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* AGENT MODAL */}
      <Modal
        visible={showAgentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAgentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.validateChooseAgent}</Text>
              <TouchableOpacity onPress={() => setShowAgentModal(false)}>
                <Text style={styles.modalClose}>{t.validateClose}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedProduct && (
                <>
                  {/* Product Preview */}
                  <View style={styles.modalProductPreview}>
                    <Image
                      source={{ uri: selectedProduct.foto }}
                      style={styles.modalProductImage}
                      resizeMode="cover"
                    />
                    <View style={styles.modalProductInfo}>
                      <Text style={styles.modalProductName} numberOfLines={2}>
                        {selectedProduct.nombre}
                      </Text>
                      <Text style={styles.modalProductPrice}>
                        {formatPrice(convertPrice(selectedProduct.precio, 'USD', currency), currency)}
                      </Text>
                    </View>
                  </View>

                  {/* Agent Options */}
                  {selectedProduct.linkUsfans && (
                    <TouchableOpacity
                      style={styles.agentOption}
                      onPress={() => buyWithAgent(selectedProduct.linkUsfans)}
                    >
                      <Text style={styles.agentOptionName}>USFans</Text>
                      <Text style={styles.agentOptionArrow}>→</Text>
                    </TouchableOpacity>
                  )}

                  {selectedProduct.linkCnfans && (
                    <TouchableOpacity
                      style={styles.agentOption}
                      onPress={() => buyWithAgent(selectedProduct.linkCnfans)}
                    >
                      <Text style={styles.agentOptionName}>CNFans</Text>
                      <Text style={styles.agentOptionArrow}>→</Text>
                    </TouchableOpacity>
                  )}

                  {selectedProduct.linkLitbuy && (
                    <TouchableOpacity
                      style={styles.agentOption}
                      onPress={() => buyWithAgent(selectedProduct.linkLitbuy)}
                    >
                      <Text style={styles.agentOptionName}>Litbuy</Text>
                      <Text style={styles.agentOptionArrow}>→</Text>
                    </TouchableOpacity>
                  )}

                  {selectedProduct.linkWeidian && (
                    <TouchableOpacity
                      style={styles.agentOption}
                      onPress={() => buyWithAgent(selectedProduct.linkWeidian)}
                    >
                      <Text style={styles.agentOptionName}>Weidian (directo)</Text>
                      <Text style={styles.agentOptionArrow}>→</Text>
                    </TouchableOpacity>
                  )}

                  {selectedProduct.linkTaobao && (
                    <TouchableOpacity
                      style={styles.agentOption}
                      onPress={() => buyWithAgent(selectedProduct.linkTaobao)}
                    >
                      <Text style={styles.agentOptionName}>Taobao (directo)</Text>
                      <Text style={styles.agentOptionArrow}>→</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  // HEADER
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
  logo: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: '#a0a0a0', marginTop: 2, fontWeight: '500' },

  // SCROLL
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Platform.OS === 'ios' ? 100 : 95 },

  // HERO
  heroSection: { paddingHorizontal: 20, marginBottom: 20 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 12, lineHeight: 38 },
  heroSubtitle: { fontSize: 16, color: '#a0a0a0', lineHeight: 24, fontWeight: '500' },
  productCount: { fontSize: 14, color: '#00e5b0', marginTop: 8, fontWeight: '700' },

  // SEARCH
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#fff', paddingVertical: 14 },
  clearIcon: { fontSize: 20, color: '#666', paddingLeft: 10 },

  // LOADING
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, color: '#666', marginTop: 16 },

  // PRODUCTS GRID
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 4,
  },
  productBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  productBadgeText: { fontSize: 10, fontWeight: '800', color: '#000' },
  productImage: { width: '100%', height: 180, backgroundColor: '#151515' },
  productInfo: { padding: 12 },
  productCategory: { fontSize: 11, color: '#666', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  productName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 8, minHeight: 40 },
  batchContainer: { backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  batchText: { fontSize: 10, color: '#00e5b0', fontWeight: '700' },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#FFD700' },
  salesText: { fontSize: 10, color: '#666', fontWeight: '600' },
  productPrice: { fontSize: 20, fontWeight: '900', color: '#00e5b0', marginBottom: 12 },
  buyButton: { backgroundColor: '#00e5b0', paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  buyButtonText: { fontSize: 14, fontWeight: '800', color: '#000', textAlign: 'center' },

  // EMPTY STATE
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', fontWeight: '600' },

  // FOOTER
  footerSection: {
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  footerTitle: { fontSize: 14, color: '#00e5b0', fontWeight: '700', marginBottom: 4 },
  footerSubtitle: { fontSize: 12, color: '#666', fontWeight: '500' },

  bottomSpacer: { height: 20 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    borderTopWidth: 2,
    borderColor: '#00e5b0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  modalClose: { fontSize: 24, color: '#666', fontWeight: '300' },
  modalBody: { padding: 20 },
  modalProductPreview: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modalProductImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#151515' },
  modalProductInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  modalProductName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 6 },
  modalProductPrice: { fontSize: 18, fontWeight: '900', color: '#00e5b0' },
  agentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  agentOptionName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  agentOptionArrow: { fontSize: 20, color: '#00e5b0', fontWeight: '700' },
});
