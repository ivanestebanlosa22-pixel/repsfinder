import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../../types';
import { useAppSettings } from '../../../context/AppSettingsContext';

const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  BACKGROUND: '#000',
  CARD_BG: '#0f0f0f',
  CARD_BG_LIGHT: '#1a1a1a',
  BORDER: '#222',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  SUCCESS: '#00d4aa',
  DANGER: '#FF3366',
  GOLD: '#FFD700',
} as const;

interface ComparisonRowProps {
  label: string;
  value1: string | number;
  value2: string | number;
  highlight?: boolean;
  isBetter?: 'left' | 'right' | 'equal';
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({
  label,
  value1,
  value2,
  isBetter,
}) => (
  <View style={styles.row}>
    <View style={[styles.cell, styles.leftCell]}>
      <Text style={[styles.cellText, isBetter === 'left' && styles.betterValue]}>
        {value1}
      </Text>
      {isBetter === 'left' && <Text style={styles.winnerBadge}>✓</Text>}
    </View>
    
    <View style={styles.labelCell}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    
    <View style={[styles.cell, styles.rightCell]}>
      <Text style={[styles.cellText, isBetter === 'right' && styles.betterValue]}>
        {value2}
      </Text>
      {isBetter === 'right' && <Text style={styles.winnerBadge}>✓</Text>}
    </View>
  </View>
);

interface ComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  product1: Product | null;
  product2: Product | null;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  visible,
  onClose,
  product1,
  product2,
}) => {
  const { t, i18n } = useTranslation();
  const { currency } = useAppSettings();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  if (!product1 || !product2) return null;

  const formatPrice = (price: number) => {
    const rate = currency === 'EUR' ? 0.92 : 1;
    const convertedPrice = (price * rate).toFixed(2);
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${convertedPrice}`;
  };

  const rating1 = Number(product1?.rating) || 0;
  const rating2 = Number(product2?.rating) || 0;
  const priceDiff = (product2.precio ?? 0) - (product1.precio ?? 0);
  const ratingDiff = rating2 - rating1;

  const imageSize = (SCREEN_WIDTH - 120) / 2;
  const imageStyle = { width: imageSize, height: imageSize };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('comparison')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imagesRow}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: product1.foto }}
                  style={[styles.productImage, imageStyle]}
                  resizeMode="cover"
                />
                <Text style={styles.productName} numberOfLines={2}>
                  {product1.nombre}
                </Text>
              </View>
              
              <View style={styles.vsContainer}>
                <LinearGradient
                  colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                  style={styles.vsBadge}
                >
                  <Text style={styles.vsText}>VS</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: product2.foto }}
                  style={[styles.productImage, imageStyle]}
                  resizeMode="cover"
                />
                <Text style={styles.productName} numberOfLines={2}>
                  {product2.nombre}
                </Text>
              </View>
            </View>

            <View style={styles.comparisonTable}>
              <ComparisonRow
                label={t('priceLabel')}
                value1={formatPrice(product1.precio ?? 0)}
                value2={formatPrice(product2.precio ?? 0)}
                isBetter={(product1.precio ?? 0) < (product2.precio ?? 0) ? 'left' : (product1.precio ?? 0) > (product2.precio ?? 0) ? 'right' : 'equal'}
              />
              
              <ComparisonRow
                label="Rating"
                value1={rating1.toFixed(1)}
                value2={rating2.toFixed(1)}
                isBetter={rating1 > rating2 ? 'left' : rating1 < rating2 ? 'right' : 'equal'}
              />
              
              <ComparisonRow
                label={t('salesLabel')}
                value1={`${product1.ventas ?? 0}+`}
                value2={`${product2.ventas ?? 0}+`}
                isBetter={(product1.ventas ?? 0) > (product2.ventas ?? 0) ? 'left' : (product1.ventas ?? 0) < (product2.ventas ?? 0) ? 'right' : 'equal'}
              />
              
              <ComparisonRow
                label={t('brand')}
                value1={product1.marca || ''}
                value2={product2.marca || ''}
              />
              
              <ComparisonRow
                label={t('categoryLabel')}
                value1={product1.categoria || ''}
                value2={product2.categoria || ''}
              />
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>
                {t('summaryLabel')}
              </Text>
              
              {priceDiff !== 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {t('priceDifference')}
                  </Text>
                  <Text style={[styles.summaryValue, priceDiff > 0 ? styles.danger : styles.success]}>
                    {priceDiff > 0 ? '+' : ''}{formatPrice(Math.abs(priceDiff))}
                  </Text>
                </View>
              )}
              
              {ratingDiff !== 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {t('ratingDifference')}
                  </Text>
                  <Text style={[styles.summaryValue, ratingDiff > 0 ? styles.danger : styles.success]}>
                    {ratingDiff > 0 ? '+' : ''}{Math.abs(ratingDiff).toFixed(1)} ★
                  </Text>
                </View>
              )}
            </View>

            {(product1.fotos?.length || product2.fotos?.length) && (
              <View style={styles.photosSection}>
                <Text style={styles.photosTitle}>
                  {t('additionalPhotos')}
                </Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {product1.fotos?.map((photo, idx) => (
                    <Image
                      key={`p1-${idx}`}
                      source={{ uri: photo }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {product2.fotos?.map((photo, idx) => (
                    <Image
                      key={`p2-${idx}`}
                      source={{ uri: photo }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: COLORS.CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD_BG_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  closeIcon: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 20,
    fontWeight: '700',
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  productImage: {
    borderRadius: 12,
    backgroundColor: COLORS.CARD_BG_LIGHT,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  vsContainer: {
    width: 60,
    alignItems: 'center',
  },
  vsBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '900',
  },
  comparisonTable: {
    backgroundColor: COLORS.CARD_BG_LIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  cell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftCell: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  rightCell: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
  },
  cellText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  betterValue: {
    color: COLORS.SUCCESS,
    fontWeight: '900',
  },
  winnerBadge: {
    marginLeft: 4,
    fontSize: 14,
  },
  labelCell: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: COLORS.CARD_BG_LIGHT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  success: {
    color: COLORS.SUCCESS,
  },
  danger: {
    color: COLORS.DANGER,
  },
  photosSection: {
    marginBottom: 20,
  },
  photosTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: COLORS.CARD_BG_LIGHT,
  },
});

export default ComparisonModal;
