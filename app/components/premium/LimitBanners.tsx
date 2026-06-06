// ==================== LIMIT BANNERS ====================
// Banners que aparecen cuando el usuario alcanza los límites gratuitos

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

interface LimitBannerProps {
  onUpgrade: () => void;
  onUseCredits?: () => void;
  current: number;
  limit: number;
}

// A) FAVORITES LIMIT BANNER
export const FavoritesLimitBanner: React.FC<LimitBannerProps> = ({
  onUpgrade,
  onUseCredits,
  current,
  limit,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 51, 102, 0.15)', 'rgba(255, 102, 0, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>❤️</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('favoritesLimitTitle') || 'Límite de Favoritos Alcanzado'}</Text>
          <Text style={styles.description}>
            {t('favoritesLimitDesc') || `Has usado ${current} de ${limit} favoritos disponibles. Upgrade a Premium para guardar favoritos ilimitados.`}
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>{t('upgradeToPremium') || 'Upgrade'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {onUseCredits && (
            <TouchableOpacity style={styles.creditsButton} onPress={onUseCredits}>
              <Text style={styles.creditsText}>{t('useCredits') || 'Usar Créditos'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// B) ADVANCED SEARCH LIMIT BANNER
export const AdvancedSearchLimitBanner: React.FC<LimitBannerProps> = ({
  onUpgrade,
  onUseCredits,
  current,
  limit,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 163, 255, 0.15)', 'rgba(0, 102, 255, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>🔍</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('searchLimitTitle') || 'Límite de Búsquedas Avanzadas'}</Text>
          <Text style={styles.description}>
            {t('searchLimitDesc') || `Has usado ${current} de ${limit} búsquedas avanzadas hoy. Premium = ilimitado.`}
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>{t('upgradeToPremium') || 'Upgrade'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {onUseCredits && (
            <TouchableOpacity style={styles.creditsButton} onPress={onUseCredits}>
              <Text style={styles.creditsText}>{t('useCredits') || 'Usar Créditos'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// C) COMPARISON LIMIT BANNER
export const ComparisonLimitBanner: React.FC<LimitBannerProps> = ({
  onUpgrade,
  onUseCredits,
  current,
  limit,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 212, 170, 0.15)', 'rgba(0, 255, 136, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>💰</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('comparisonLimitTitle') || 'Límite de Comparaciones'}</Text>
          <Text style={styles.description}>
            {t('comparisonLimitDesc') || `Has usado tu comparación diaria (${current}/${limit}). Premium = comparaciones ilimitadas.`}
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>{t('upgradeToPremium') || 'Upgrade'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {onUseCredits && (
            <TouchableOpacity style={styles.creditsButton} onPress={onUseCredits}>
              <Text style={styles.creditsText}>{t('useCredits') || 'Usar Créditos'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// D) SELLER VERIFICATION LIMIT BANNER
export const SellerVerificationLimitBanner: React.FC<LimitBannerProps> = ({
  onUpgrade,
  onUseCredits,
  current,
  limit,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(138, 43, 226, 0.15)', 'rgba(75, 0, 130, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>✅</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('verificationLimitTitle') || 'Límite de Verificaciones'}</Text>
          <Text style={styles.description}>
            {t('verificationLimitDesc') || `Has usado ${current} de ${limit} verificaciones semanales. Premium = ilimitado.`}
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>{t('upgradeToPremium') || 'Upgrade'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {onUseCredits && (
            <TouchableOpacity style={styles.creditsButton} onPress={onUseCredits}>
              <Text style={styles.creditsText}>{t('useCredits') || 'Usar Créditos'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// E) ALERT LIMIT BANNER
export const AlertLimitBanner: React.FC<LimitBannerProps> = ({
  onUpgrade,
  onUseCredits,
  current,
  limit,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 165, 0, 0.15)', 'rgba(255, 69, 0, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>🔔</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('alertLimitTitle') || 'Límite de Alertas'}</Text>
          <Text style={styles.description}>
            {t('alertLimitDesc') || `Has usado tu alerta gratuita (${current}/${limit}). Premium = alertas ilimitadas y avanzadas.`}
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>{t('upgradeToPremium') || 'Upgrade'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {onUseCredits && (
            <TouchableOpacity style={styles.creditsButton} onPress={onUseCredits}>
              <Text style={styles.creditsText}>{t('useCredits') || 'Usar Créditos'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

// F) EARLY ACCESS BANNER
export const EarlyAccessBanner: React.FC<{
  onUpgrade: () => void;
  hoursRemaining: number;
}> = ({
  onUpgrade,
  hoursRemaining,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 140, 0, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>⚡</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{t('earlyAccessTitle') || 'Acceso Anticipado Premium'}</Text>
          <Text style={styles.description}>
            {t('earlyAccessDesc') || `Este producto estará disponible en ${hoursRemaining} horas. Premium = acceso inmediato.`}
          </Text>
        </View>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.upgradeGradient}
          >
            <Text style={styles.upgradeText}>{t('upgradeToPremium') || 'Upgrade'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// PREMIUM CATEGORY LOCKED BANNER
export const PremiumCategoryBanner: React.FC<{
  onUpgrade: () => void;
  categoryName: string;
}> = ({
  onUpgrade,
  categoryName,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.lockedContainer}>
      <LinearGradient
        colors={['rgba(0, 212, 170, 0.1)', 'rgba(0, 102, 255, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.lockedGradient}
      >
        <View style={styles.lockedIconContainer}>
          <Text style={styles.lockedIcon}>🔒</Text>
        </View>
        <Text style={styles.lockedTitle}>{categoryName}</Text>
        <Text style={styles.lockedSubtitle}>
          {t('premiumCategoryLocked') || 'Categoría exclusiva para usuarios Premium'}
        </Text>
        <View style={styles.lockedFeatures}>
          <Text style={styles.lockedFeature}>✓ Tiendas top verificadas</Text>
          <Text style={styles.lockedFeature}>✓ Datos exclusivos</Text>
          <Text style={styles.lockedFeature}>✓ Análisis avanzado</Text>
        </View>
        <TouchableOpacity style={styles.lockedButton} onPress={onUpgrade}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.lockedButtonGradient}
          >
            <Text style={styles.lockedButtonText}>
              {t('unlockPremium') || 'Desbloquear Premium'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 16,
  },
  buttons: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 10,
  },
  upgradeButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  upgradeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  creditsButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  creditsText: {
    fontSize: 11,
    color: '#fff',
  },

  // Locked category styles
  lockedContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  lockedGradient: {
    padding: 25,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
    borderStyle: 'dashed',
  },
  lockedIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  lockedIcon: {
    fontSize: 30,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  lockedSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
    textAlign: 'center',
  },
  lockedFeatures: {
    marginBottom: 20,
  },
  lockedFeature: {
    fontSize: 13,
    color: '#00d4aa',
    marginBottom: 5,
  },
  lockedButton: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  lockedButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  lockedButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default {
  FavoritesLimitBanner,
  AdvancedSearchLimitBanner,
  ComparisonLimitBanner,
  SellerVerificationLimitBanner,
  AlertLimitBanner,
  EarlyAccessBanner,
  PremiumCategoryBanner,
};
