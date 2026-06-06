// ==================== OUTFIT BUILDER PREMIUM ====================
// Maniquí 2D vectorial con sistema de prendas drag-and-place

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── TOKENS ────────────────────────────────────────────────────────────────
const C = {
  bg:        '#000000',
  surface:   '#0d0d0d',
  card:      '#141414',
  border:    'rgba(255,255,255,0.08)',
  borderHi:  'rgba(255,255,255,0.18)',
  primary:   '#00d4aa',
  blue:      '#0066FF',
  accent:    '#FF3366',
  gold:      '#FFD700',
  text:      '#ffffff',
  textMid:   '#888888',
  textDim:   '#444444',
  overlay:   'rgba(0,0,0,0.92)',
};

// ─── MANIQUÍ SVG BASE64 ─────────────────────────────────────────────────────
// Cuerpo completo dibujado a mano en SVG, viewBox 160 x 440
const BODY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 440">
  <defs>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1e1e"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="50%" stop-color="#333"/>
      <stop offset="100%" stop-color="#222"/>
    </linearGradient>
  </defs>

  <!-- Neck shadow base -->
  <ellipse cx="80" cy="68" rx="11" ry="6" fill="#0a0a0a" opacity="0.6"/>

  <!-- Head -->
  <ellipse cx="80" cy="34" rx="21" ry="26" fill="url(#bodyGrad)" stroke="#2d2d2d" stroke-width="1"/>
  <!-- Ear left -->
  <ellipse cx="59" cy="34" rx="4" ry="6" fill="#1a1a1a" stroke="#2a2a2a" stroke-width="0.5"/>
  <!-- Ear right -->
  <ellipse cx="101" cy="34" rx="4" ry="6" fill="#1a1a1a" stroke="#2a2a2a" stroke-width="0.5"/>
  <!-- Chin highlight -->
  <ellipse cx="80" cy="55" rx="8" ry="3" fill="#1f1f1f" opacity="0.5"/>

  <!-- Neck -->
  <rect x="72" y="58" width="16" height="18" rx="5" fill="url(#edgeGrad)" stroke="#2a2a2a" stroke-width="0.5"/>

  <!-- Trapezoid torso (shoulders → waist) -->
  <path d="M36 76 Q80 68 124 76 L132 80 L138 180 L22 180 L28 80 Z"
    fill="url(#bodyGrad)" stroke="#2d2d2d" stroke-width="1"/>

  <!-- Collar bone lines -->
  <line x1="72" y1="76" x2="40" y2="82" stroke="#252525" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="88" y1="76" x2="120" y2="82" stroke="#252525" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Left arm upper -->
  <path d="M28 80 Q14 96 12 150 L26 152 Q26 100 38 86 Z"
    fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>
  <!-- Left forearm -->
  <path d="M12 150 Q10 190 12 220 L26 218 Q24 188 26 152 Z"
    fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>
  <!-- Left hand -->
  <ellipse cx="18" cy="226" rx="8" ry="12" fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Right arm upper -->
  <path d="M132 80 Q146 96 148 150 L134 152 Q134 100 122 86 Z"
    fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>
  <!-- Right forearm -->
  <path d="M148 150 Q150 190 148 220 L134 218 Q136 188 134 152 Z"
    fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>
  <!-- Right hand -->
  <ellipse cx="142" cy="226" rx="8" ry="12" fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Waist band -->
  <rect x="30" y="176" width="100" height="10" rx="2" fill="#111" stroke="#252525" stroke-width="0.5"/>

  <!-- Hips -->
  <path d="M22 180 L138 180 L142 230 L18 230 Z"
    fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="0.5"/>

  <!-- Left leg -->
  <path d="M18 230 L76 230 L74 390 L22 390 Z"
    fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>
  <!-- Left knee highlight -->
  <ellipse cx="48" cy="310" rx="16" ry="10" fill="#161616" opacity="0.7"/>

  <!-- Right leg -->
  <path d="M84 230 L142 230 L138 390 L86 390 Z"
    fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>
  <!-- Right knee highlight -->
  <ellipse cx="112" cy="310" rx="16" ry="10" fill="#161616" opacity="0.7"/>

  <!-- Crotch separator line -->
  <line x1="80" y1="230" x2="80" y2="390" stroke="#111" stroke-width="2"/>

  <!-- Left foot -->
  <ellipse cx="46" cy="400" rx="24" ry="10" fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>
  <!-- Right foot -->
  <ellipse cx="116" cy="400" rx="24" ry="10" fill="url(#bodyGrad)" stroke="#2a2a2a" stroke-width="1"/>

  <!-- Body center highlight -->
  <line x1="80" y1="76" x2="80" y2="180" stroke="#1e1e1e" stroke-width="2" opacity="0.8"/>
</svg>`;

const BODY_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BODY_SVG);

// ─── SLOTS CONFIG ─────────────────────────────────────────────────────────
// Coordenadas en el espacio de visualización del maniquí (ancho ~160, alto ~440)
// El maniquí se muestra a escala. Si el contenedor es 180×490, escala = 180/160 = 1.125

interface SlotConfig {
  id: string;
  labelEs: string;
  labelEn: string;
  icon: string;
  // posición en el SVG viewBox (160×440)
  svgX: number; svgY: number; svgW: number; svgH: number;
  categories: string[];
  gradient: [string, string];
}

const SLOTS: SlotConfig[] = [
  {
    id: 'headwear',
    labelEs: 'Gorra / Sombrero', labelEn: 'Hat / Cap',
    icon: '🧢',
    svgX: 55, svgY: 4, svgW: 50, svgH: 36,
    categories: ['GORRAS'],
    gradient: ['#8B5CF6', '#6D28D9'],
  },
  {
    id: 'outerwear',
    labelEs: 'Chaqueta / Abrigo', labelEn: 'Jacket / Coat',
    icon: '🧥',
    svgX: 20, svgY: 70, svgW: 120, svgH: 120,
    categories: ['CAZADORAS', 'JACKETS🧥'],
    gradient: ['#F59E0B', '#B45309'],
  },
  {
    id: 'top',
    labelEs: 'Camiseta / Sudadera', labelEn: 'Top / Hoodie',
    icon: '👕',
    svgX: 30, svgY: 74, svgW: 100, svgH: 110,
    categories: ['CAMISETAS', 'T-SHIRTS👕', 'SUDADERAS', 'HOODIES & SWEATSHIRTS'],
    gradient: ['#0066FF', '#0044CC'],
  },
  {
    id: 'bottom',
    labelEs: 'Pantalón', labelEn: 'Pants',
    icon: '👖',
    svgX: 18, svgY: 180, svgW: 124, svgH: 150,
    categories: ['PANTALONES', 'PANTS, SHORTS & SET👖🩳'],
    gradient: ['#374151', '#1F2937'],
  },
  {
    id: 'footwear',
    labelEs: 'Zapatillas', labelEn: 'Sneakers',
    icon: '👟',
    svgX: 10, svgY: 385, svgW: 140, svgH: 32,
    categories: ['ZAPATOS'],
    gradient: ['#00d4aa', '#0099AA'],
  },
  {
    id: 'watch',
    labelEs: 'Reloj', labelEn: 'Watch',
    icon: '⌚',
    svgX: 130, svgY: 148, svgW: 26, svgH: 26,
    categories: ['RELOJES'],
    gradient: ['#FFD700', '#B8860B'],
  },
  {
    id: 'bag',
    labelEs: 'Bolso / Mochila', labelEn: 'Bag / Backpack',
    icon: '👜',
    svgX: 4, svgY: 86, svgW: 34, svgH: 48,
    categories: ['BOLSOS', 'MOCHILA', 'CARTERAS'],
    gradient: ['#EC4899', '#BE185D'],
  },
  {
    id: 'jewelry',
    labelEs: 'Joyería', labelEn: 'Jewelry',
    icon: '💍',
    svgX: 66, svgY: 58, svgW: 28, svgH: 20,
    categories: ['JOYERIA', 'ACCESORIOS'],
    gradient: ['#F59E0B', '#D97706'],
  },
];

// ─── TYPES ─────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  nombre: string;
  foto: string;
  precio: number;
  categoria: string;
  marca?: string;
  rating?: number;
}

interface OutfitSlot {
  slotId: string;
  product: Product;
}

interface MannequinCanvasProps {
  products?: Product[];
  onBack?: () => void;
  language?: 'es' | 'en';
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────
export default function MannequinCanvas({
  products = [],
  onBack,
  language = 'es',
}: MannequinCanvasProps) {
  const t = (es: string, en: string) => language === 'es' ? es : en;

  const [outfit, setOutfit] = useState<OutfitSlot[]>([]);
  const [activeSlot, setActiveSlot] = useState<SlotConfig | null>(null);
  const [sheetAnim] = useState(new Animated.Value(SH));
  const [sheetVisible, setSheetVisible] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [showSave, setShowSave] = useState(false);

  // Escala del maniquí
  const MANI_W = Math.min(SW * 0.44, 180);
  const MANI_H = MANI_W * (440 / 160);
  const scale = MANI_W / 160;

  const getItem = useCallback((slotId: string) =>
    outfit.find(o => o.slotId === slotId), [outfit]);

  const totalPrice = outfit.reduce((s, o) => s + (o.product.precio || 0), 0);

  // ── BOTTOM SHEET ──────────────────────────────────────────────────────────
  const openSheet = (slot: SlotConfig) => {
    setActiveSlot(slot);
    setSheetVisible(true);
    Animated.spring(sheetAnim, {
      toValue: 0, useNativeDriver: true, tension: 70, friction: 12,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: SH, duration: 280, useNativeDriver: true,
    }).start(() => { setSheetVisible(false); setActiveSlot(null); });
  };

  const pickProduct = (product: Product) => {
    if (!activeSlot) return;
    setOutfit(prev => {
      const filtered = prev.filter(o => o.slotId !== activeSlot.id);
      return [...filtered, { slotId: activeSlot.id, product }];
    });
    closeSheet();
  };

  const removeItem = (slotId: string) =>
    setOutfit(prev => prev.filter(o => o.slotId !== slotId));

  // ── SAVE OUTFIT ───────────────────────────────────────────────────────────
  const saveOutfit = async () => {
    if (!outfitName.trim()) return;
    try {
      const key = `outfit_${Date.now()}`;
      const data = { name: outfitName, items: outfit, total: totalPrice, date: new Date().toISOString() };
      await AsyncStorage.setItem(key, JSON.stringify(data));
      setShowSave(false);
      setOutfitName('');
      Alert.alert('✅ ' + t('Guardado', 'Saved'), outfitName);
    } catch {
      Alert.alert(t('Error al guardar', 'Save error'));
    }
  };

  // ── PRODUCTS FOR SLOT ─────────────────────────────────────────────────────
  const slotProducts = activeSlot
    ? products.filter(p =>
        activeSlot.categories.some(cat =>
          (p.categoria || '').toUpperCase().includes(cat.toUpperCase())
        )
      )
    : [];

  // ── MANNEQUIN RENDER ──────────────────────────────────────────────────────
  const renderMannequin = () => (
    <View style={[styles.mannequinWrap, { width: MANI_W, height: MANI_H }]}>
      {/* Cuerpo SVG base */}
      <Image
        source={{ uri: BODY_URI }}
        style={{ position: 'absolute', width: MANI_W, height: MANI_H }}
        resizeMode="stretch"
      />

      {/* Slots superpuestos */}
      {SLOTS.map(slot => {
        const item = getItem(slot.id);
        const slotStyle = {
          left:   slot.svgX * scale,
          top:    slot.svgY * scale,
          width:  slot.svgW * scale,
          height: slot.svgH * scale,
        };

        return (
          <TouchableOpacity
            key={slot.id}
            activeOpacity={0.75}
            style={[styles.slotHit, slotStyle]}
            onPress={() => openSheet(slot)}
            onLongPress={() => item && removeItem(slot.id)}
          >
            {item ? (
              <>
                <Image
                  source={{ uri: item.product.foto }}
                  style={styles.slotImg}
                  resizeMode="cover"
                />
                {/* Borde teal cuando está lleno */}
                <View style={styles.slotFilledBorder} />
              </>
            ) : (
              <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                style={styles.slotEmpty}
              >
                <Text style={styles.slotEmptyIcon}>{slot.icon}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── SLOTS LIST (panel derecho) ─────────────────────────────────────────────
  const renderSlotsList = () => (
    <ScrollView
      style={styles.slotsPanel}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {SLOTS.map(slot => {
        const item = getItem(slot.id);
        return (
          <TouchableOpacity
            key={slot.id}
            activeOpacity={0.7}
            onPress={() => openSheet(slot)}
            style={[styles.slotRow, item && styles.slotRowFilled]}
          >
            <LinearGradient
              colors={slot.gradient}
              style={styles.slotRowIcon}
            >
              <Text style={{ fontSize: 14 }}>{slot.icon}</Text>
            </LinearGradient>

            {item ? (
              <View style={styles.slotRowInfo}>
                <Text style={styles.slotRowName} numberOfLines={1}>{item.product.nombre}</Text>
                <Text style={styles.slotRowPrice}>€{item.product.precio?.toFixed(0)}</Text>
              </View>
            ) : (
              <View style={styles.slotRowInfo}>
                <Text style={styles.slotRowLabel}>{language === 'es' ? slot.labelEs : slot.labelEn}</Text>
                <Text style={styles.slotRowAdd}>{t('+ Añadir', '+ Add')}</Text>
              </View>
            )}

            {item ? (
              <TouchableOpacity onPress={() => removeItem(slot.id)} style={styles.slotRowRemove}>
                <Text style={{ color: C.accent, fontSize: 14, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.slotRowArrow}>
                <Text style={{ color: C.textDim, fontSize: 16 }}>›</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── BOTTOM SHEET PICKER ────────────────────────────────────────────────────
  const renderBottomSheet = () => {
    if (!sheetVisible) return null;
    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={closeSheet}
        />

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {activeSlot && (
                <LinearGradient
                  colors={activeSlot.gradient}
                  style={styles.sheetIconBadge}
                >
                  <Text style={{ fontSize: 18 }}>{activeSlot?.icon}</Text>
                </LinearGradient>
              )}
              <View>
                <Text style={styles.sheetTitle}>
                  {activeSlot ? (language === 'es' ? activeSlot.labelEs : activeSlot.labelEn) : ''}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {slotProducts.length} {t('productos disponibles', 'products available')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeSheet} style={styles.sheetClose}>
              <Text style={{ color: C.textMid, fontSize: 22, fontWeight: '300' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Products grid */}
          {slotProducts.length === 0 ? (
            <View style={styles.sheetEmpty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📦</Text>
              <Text style={styles.sheetEmptyText}>{t('Sin productos en esta categoría', 'No products here')}</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.sheetGrid}
              showsVerticalScrollIndicator={false}
            >
              {slotProducts.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.sheetCard}
                  onPress={() => pickProduct(product)}
                  activeOpacity={0.75}
                >
                  <Image
                    source={{ uri: product.foto }}
                    style={styles.sheetCardImg}
                    resizeMode="cover"
                  />
                  {/* Selected indicator */}
                  {getItem(activeSlot?.id || '')?.product.id === product.id && (
                    <View style={styles.sheetCardSelected}>
                      <Text style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>✓</Text>
                    </View>
                  )}
                  <View style={styles.sheetCardInfo}>
                    <Text style={styles.sheetCardName} numberOfLines={2}>{product.nombre}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.sheetCardPrice}>€{product.precio?.toFixed(0)}</Text>
                      {(product.rating ?? 0) > 0 && (
                        <Text style={styles.sheetCardRating}>★ {product.rating?.toFixed(1)}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    );
  };

  // ── SAVE MODAL ─────────────────────────────────────────────────────────────
  const renderSaveModal = () => {
    if (!showSave) return null;
    return (
      <View style={styles.saveOverlay}>
        <View style={styles.saveCard}>
          <Text style={styles.saveTitle}>{t('💾 Guardar Outfit', '💾 Save Outfit')}</Text>
          <TextInput
            style={styles.saveInput}
            placeholder={t('Nombre del outfit...', 'Outfit name...')}
            placeholderTextColor={C.textDim}
            value={outfitName}
            onChangeText={setOutfitName}
            autoFocus
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.saveCancelBtn}
              onPress={() => setShowSave(false)}
            >
              <Text style={{ color: C.textMid, fontSize: 15, fontWeight: '700' }}>{t('Cancelar', 'Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveOutfit} style={{ flex: 1 }}>
              <LinearGradient
                colors={[C.primary, '#0099AA']}
                style={styles.saveConfirmBtn}
              >
                <Text style={{ color: '#000', fontSize: 15, fontWeight: '900' }}>{t('Guardar', 'Save')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ── MAIN RENDER ──────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBack}>
          <Text style={{ color: C.text, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>OUTFIT BUILDER</Text>
          <Text style={styles.headerSub}>
            {outfit.length} {t('prendas', 'items')}
            {outfit.length > 0 ? ` · €${totalPrice.toFixed(0)}` : ''}
          </Text>
        </View>
        {outfit.length > 0 && (
          <TouchableOpacity
            style={styles.headerSaveBtn}
            onPress={() => setShowSave(true)}
          >
            <LinearGradient
              colors={[C.primary, '#0099AA']}
              style={styles.headerSaveBtnInner}
            >
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '900' }}>
                {t('GUARDAR', 'SAVE')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* ── BARRA DEGRADADA ── */}
      <LinearGradient
        colors={[C.blue, C.accent]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ height: 3, width: '100%' }}
      />

      {/* ── CONTENIDO PRINCIPAL ── */}
      <View style={styles.body}>
        {/* Columna izquierda: maniquí */}
        <View style={styles.leftCol}>
          {/* Indicador de instrucciones */}
          <View style={styles.mannequinHint}>
            <Text style={styles.mannequinHintText}>{t('Toca una zona', 'Tap a zone')}</Text>
          </View>

          {renderMannequin()}

          {/* Total precio */}
          {outfit.length > 0 && (
            <LinearGradient
              colors={['rgba(0,212,170,0.15)', 'rgba(0,212,170,0.05)']}
              style={styles.totalBadge}
            >
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmount}>€{totalPrice.toFixed(2)}</Text>
            </LinearGradient>
          )}

          {/* Clear all */}
          {outfit.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setOutfit([])}
            >
              <Text style={styles.clearBtnText}>{t('Limpiar todo', 'Clear all')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Columna derecha: lista de slots */}
        <View style={styles.rightCol}>
          <Text style={styles.rightColTitle}>
            {t('PRENDAS', 'ITEMS')}
          </Text>
          {renderSlotsList()}
        </View>
      </View>

      {/* ── OVERLAYS ── */}
      {renderBottomSheet()}
      {renderSaveModal()}
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // HEADER
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 12,
  },
  headerBack: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.card, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: C.text, letterSpacing: 2 },
  headerSub: { fontSize: 11, color: C.textMid, marginTop: 1, fontWeight: '600' },
  headerSaveBtn: { borderRadius: 10, overflow: 'hidden' },
  headerSaveBtnInner: { paddingHorizontal: 14, paddingVertical: 8 },

  // BODY LAYOUT
  body: { flex: 1, flexDirection: 'row' },

  // LEFT COL — maniquí
  leftCol: {
    width: '46%', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 8,
    borderRightWidth: 1, borderRightColor: C.border,
  },
  mannequinHint: {
    marginBottom: 8,
    backgroundColor: 'rgba(0,212,170,0.08)',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
  },
  mannequinHintText: { fontSize: 10, color: C.primary, fontWeight: '700', letterSpacing: 0.5 },
  mannequinWrap: { position: 'relative' },

  // SLOT OVERLAYS
  slotHit: {
    position: 'absolute', overflow: 'hidden',
    borderRadius: 6, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  slotEmpty: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    borderRadius: 5,
  },
  slotEmptyIcon: { fontSize: 12, opacity: 0.4 },
  slotImg: { width: '100%', height: '100%', borderRadius: 5 },
  slotFilledBorder: {
    position: 'absolute', inset: 0, borderRadius: 5,
    borderWidth: 1.5, borderColor: C.primary,
  },

  // TOTAL + CLEAR
  totalBadge: {
    marginTop: 10, borderRadius: 12, paddingHorizontal: 20,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.2)',
    width: '90%',
  },
  totalLabel: { fontSize: 9, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  totalAmount: { fontSize: 22, fontWeight: '900', color: C.primary },
  clearBtn: {
    marginTop: 6, paddingVertical: 5, paddingHorizontal: 12,
  },
  clearBtnText: { fontSize: 10, color: C.textDim, fontWeight: '600', letterSpacing: 0.5 },

  // RIGHT COL — slots list
  rightCol: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  rightColTitle: {
    fontSize: 9, fontWeight: '900', color: C.textDim,
    letterSpacing: 2, marginBottom: 10,
  },

  // SLOT ROWS
  slotRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 12,
    marginBottom: 6, padding: 10,
    borderWidth: 1, borderColor: C.border, gap: 10,
  },
  slotRowFilled: {
    borderColor: 'rgba(0,212,170,0.25)',
    backgroundColor: 'rgba(0,212,170,0.04)',
  },
  slotRowIcon: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  slotRowInfo: { flex: 1 },
  slotRowName: { fontSize: 11, fontWeight: '700', color: C.text },
  slotRowPrice: { fontSize: 10, fontWeight: '800', color: C.primary, marginTop: 2 },
  slotRowLabel: { fontSize: 11, fontWeight: '600', color: C.textMid },
  slotRowAdd: { fontSize: 10, color: C.primary, fontWeight: '700', marginTop: 2 },
  slotRowRemove: { padding: 4 },
  slotRowArrow: { padding: 4 },

  // BOTTOM SHEET
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.overlay,
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: SH * 0.72,
    borderWidth: 1, borderColor: C.borderHi,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.6, shadowRadius: 20 },
      android: { elevation: 24 },
    }),
  },
  sheetHandle: {
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sheetIconBadge: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  sheetTitle: { fontSize: 17, fontWeight: '900', color: C.text },
  sheetSubtitle: { fontSize: 12, color: C.textMid, marginTop: 2 },
  sheetClose: { padding: 6 },
  sheetEmpty: {
    padding: 50, alignItems: 'center',
  },
  sheetEmptyText: { fontSize: 14, color: C.textMid, textAlign: 'center' },
  sheetGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingVertical: 14, gap: 10,
  },
  sheetCard: {
    width: (SW - 44) / 2,
    backgroundColor: '#0a0a0a', borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: C.border,
  },
  sheetCardImg: { width: '100%', height: (SW - 44) / 2 * 0.9 },
  sheetCardSelected: {
    position: 'absolute', top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center',
  },
  sheetCardInfo: { padding: 10 },
  sheetCardName: { fontSize: 11, fontWeight: '600', color: C.text, marginBottom: 6, lineHeight: 15 },
  sheetCardPrice: { fontSize: 13, fontWeight: '900', color: C.primary },
  sheetCardRating: { fontSize: 11, fontWeight: '700', color: C.gold },

  // SAVE MODAL
  saveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.overlay,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 999,
  },
  saveCard: {
    backgroundColor: C.card, borderRadius: 20,
    padding: 24, width: '88%', maxWidth: 380,
    borderWidth: 1, borderColor: C.borderHi,
  },
  saveTitle: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 16, textAlign: 'center' },
  saveInput: {
    backgroundColor: '#0a0a0a', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: C.text,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  saveCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: C.surface, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  saveConfirmBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
});
