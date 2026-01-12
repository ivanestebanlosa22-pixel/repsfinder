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
  Modal,
  Linking,
} from 'react-native';

const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';
const SHEET_NAME = 'MAIN';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

const CATEGORIES = [
  { id: 'ZAPATILLAS', icon: '👟' },
  { id: 'CAZADORAS', icon: '🧥' },
  { id: 'SUDADERAS', icon: '👕' },
  { id: 'PANTALONES', icon: '👖' },
  { id: 'CAMISETAS', icon: '👚' },
  { id: 'CORTOS PANTALONES', icon: '🩳' },
  { id: 'CHANDAL', icon: '🏃' },
  { id: 'JERSEIS', icon: '🧶' },
  { id: 'GORRAS', icon: '🧢' },
  { id: 'GORROS', icon: '🎩' },
  { id: 'CINTURONES', icon: '👔' },
  { id: 'PAÑUEÑOS BUFANDAS', icon: '🧣' },
  { id: 'BOLSOS', icon: '👜' },
  { id: 'CARTERAS', icon: '👛' },
  { id: 'PULSERAS JOYAS', icon: '💍' },
  { id: 'GAFAS', icon: '🕶️' },
  { id: 'CALCETINES', icon: '🧦' },
  { id: 'LLAVEROS', icon: '🔑' },
  { id: 'Airpods Pro 2', icon: '🎧' },
  { id: 'JVL ALTAVOCES', icon: '🔊' },
  { id: 'RELOG', icon: '⌚' },
  { id: 'EKECTRONICA AUDIO', icon: '🎵' },
];

const AGENTS = [
  { 
    id: 'usfans',
    name: 'USFans',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6825a376b16be873d3c23e82/0x0.png',
  },
  { 
    id: 'cnfans',
    name: 'CNFans',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6417ff57d88ad4baa8407f63/0x0.png',
  },
  { 
    id: 'kakobuy',
    name: 'Kakobuy',
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b6/7e/d2/b67ed289-2dee-c62b-39a9-0afbd509f379/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/1200x630wa.jpg',
  },
  { 
    id: 'joyagoo',
    name: 'Joyagoo',
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/a4/16/eea41644-dd37-7212-9eac-ce82b8512c5e/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/512x512bb.jpg',
  },
  { 
    id: 'litbuy',
    name: 'Litbuy',
    logo: 'https://litbuy.net/favicon.ico',
  },
  { 
    id: 'mulebuy',
    name: 'Mulebuy',
    logo: 'https://play-lh.googleusercontent.com/me8g4K2VHs3N83yTMrIrl3pbNeTGl7j1zWECI6l3NtGEfb1-hUyx2qv1Xuny70Tp-aA',
  },
];

export default function ValidateScreen() {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  
  const [selectedCategory, setSelectedCategory] = useState('ZAPATILLAS');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const text = await response.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;

      const allProducts = rows.slice(1).map((row: any) => {
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
      }).filter((p: any) => 
        p.activo && 
        p.activo.toString().toUpperCase() === 'SI' && 
        p.foto && 
        p.nombre
      );

      setProducts(allProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.categoria === selectedCategory);

  const openAgentLink = (agentId: string) => {
    const linkMap: any = {
      usfans: selectedProduct?.linkUsfans,
      cnfans: selectedProduct?.linkCnfans,
      litbuy: selectedProduct?.linkLitbuy,
      joyagoo: selectedProduct?.linkJoyagoo,
      kakobuy: selectedProduct?.linkKakobuy,
      mulebuy: selectedProduct?.linkMulebuy,
    };
    
    if (linkMap[agentId]) {
      Linking.openURL(linkMap[agentId]);
      setShowAgentModal(false);
    }
  };

  const getBadge = (product: any) => {
    if (product.rating >= 4.8) return { text: '⭐ TOP CALIDAD', color: '#8B5CF6' };
    if (product.ventas > 100) return { text: '🔥 TENDENCIA', color: '#FF6B6B' };
    if (product.ventas > 50) return { text: '✨ POPULAR', color: '#FFD700' };
    if (product.rating >= 4.5) return { text: '💎 PREMIUM', color: '#4FACFE' };
    if (product.precio < 20) return { text: '💰 OFERTA', color: '#AB47BC' };
    return null;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Text key={i} style={styles.star}>★</Text>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Text key={i} style={styles.starHalf}>★</Text>);
      } else {
        stars.push(<Text key={i} style={styles.starEmpty}>★</Text>);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={[styles.header, { paddingTop: statusBarHeight + 20 }]}>
        <Text style={styles.logo}>RepsFinder</Text>
        <Text style={styles.tagline}>Compra Seguro. Compra Inteligente.</Text>
      </View>

      <View style={[styles.content, { marginTop: statusBarHeight + 90 }]}>
        
        <View style={styles.sidebar}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            scrollEventThrottle={16}
          >
            {CATEGORIES.map(cat => {
              const count = products.filter(p => p.categoria === cat.id).length;
              if (count === 0) return null;
              
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catItem,
                    selectedCategory === cat.id && styles.catItemActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.catText,
                    selectedCategory === cat.id && styles.catTextActive,
                  ]} numberOfLines={1}>
                    {cat.id.split(' ')[0]}
                  </Text>
                  <Text style={styles.catCount}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.productsArea}>
          <View style={styles.productHeader}>
            <Text style={styles.categoryTitle}>{selectedCategory}</Text>
            <Text style={styles.productCount}>{filteredProducts.length} productos</Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              scrollEventThrottle={16}
            >
              {filteredProducts.map((product, index) => {
                const badge = getBadge(product);
                
                return (
                  <View key={index} style={styles.productCard}>
                    {badge && (
                      <View style={[styles.badge, { backgroundColor: badge.color }]}>
                        <Text style={styles.badgeText}>{badge.text}</Text>
                      </View>
                    )}

                    <View style={styles.imageBox}>
                      <Image
                        source={{ uri: product.foto }}
                        style={styles.productImage}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{product.nombre}</Text>
                      
                      <Text style={styles.productPrice}>${product.precio}</Text>
                      
                      {product.rating > 0 && (
                        <View style={styles.ratingContainer}>
                          <View style={styles.starsRow}>
                            {renderStars(product.rating)}
                          </View>
                          <Text style={styles.ratingValue}>{product.rating}</Text>
                        </View>
                      )}

                      {product.ventas > 0 && (
                        <Text style={styles.salesText}>{product.ventas} ventas verificadas</Text>
                      )}

                      <TouchableOpacity 
                        onPress={() => {
                          setSelectedProduct(product);
                          setShowAgentModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.buyBtn}>
                          <Text style={styles.buyText}>COMPRAR</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}
        </View>
      </View>

      <Modal visible={showAgentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={() => setShowAgentModal(false)}
          />
          
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Elige tu agente</Text>
                <Text style={styles.modalSub} numberOfLines={1}>{selectedProduct?.nombre}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAgentModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.agentScroll} showsVerticalScrollIndicator={false}>
              {AGENTS.map(agent => (
                <TouchableOpacity
                  key={agent.id}
                  style={styles.agentItem}
                  onPress={() => openAgentLink(agent.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.agentLogoBox}>
                    <Image
                      source={{ uri: agent.logo }}
                      style={styles.agentLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.agentName}>{agent.name}</Text>
                  <Text style={styles.agentArrow}>→</Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00e5b0',
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },

  content: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: 70,
    backgroundColor: '#000',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
  },
  catItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  catItemActive: {
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 3,
    borderLeftColor: '#00e5b0',
  },
  catIcon: { fontSize: 22, marginBottom: 4 },
  catText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
  catTextActive: { color: '#ccc' },
  catCount: {
    fontSize: 9,
    color: '#555',
    marginTop: 2,
  },

  productsArea: { flex: 1 },
  productHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 13,
    color: '#999',
  },

  productCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  imageBox: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  productImage: {
    width: '100%',
    height: 240,
  },
  productInfo: {
    padding: 18,
  },
  productName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 25,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
  },
  starHalf: {
    fontSize: 20,
    color: '#FFD700',
    opacity: 0.5,
  },
  starEmpty: {
    fontSize: 20,
    color: '#333',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
  },
  salesText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    fontWeight: '600',
  },
  buyBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#00e5b0',
  },
  buyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },

  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  modalBox: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#999',
  },
  modalClose: {
    fontSize: 26,
    color: '#999',
  },

  agentScroll: {
    padding: 16,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  agentLogoBox: {
    width: 52,
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentLogo: {
    width: '100%',
    height: '100%',
  },
  agentName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  agentArrow: {
    fontSize: 26,
    fontWeight: '700',
    color: '#00e5b0',
  },
});
