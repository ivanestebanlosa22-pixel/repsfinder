import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
} as const;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    key: 'find',
    emoji: '🎯',
  },
  {
    key: 'validate',
    emoji: '✅',
  },
  {
    key: 'premium',
    emoji: '👑',
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentIndex + 1), animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const onSkip = async () => {
    await AsyncStorage.setItem('repsfinder_onboarded', 'true');
    router.replace('/(tabs)/descubrir');
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800' }}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.08 }}
      >
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipText}>{t('onboardingSkip') || 'Omitir'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollContainer}
        >
          {ONBOARDING_DATA.map((item, index) => (
            <View key={item.key} style={styles.page}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.title}>
                {t(`onboarding${item.key.charAt(0).toUpperCase() + item.key.slice(1)}Title`) ||
                  (index === 0 ? 'Encuentra los mejores reps' :
                   index === 1 ? 'Valida antes de comprar' :
                   'Desbloquea el poder Premium')}
              </Text>
              <Text style={styles.subtitle}>
                {t(`onboarding${item.key.charAt(0).toUpperCase() + item.key.slice(1)}Desc`) ||
                  (index === 0 ? 'Agentes expertos te guían a los mejores productos' :
                   index === 1 ? 'Verifica la calidad con nuestro validador inteligente' :
                   'Accede a IA, alertas y herramientas avanzadas')}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentIndex === ONBOARDING_DATA.length - 1 ? (
            <TouchableOpacity onPress={onSkip} activeOpacity={0.8} style={styles.buttonFull}>
              <LinearGradient
                colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t('onboardingStart') || 'Comenzar'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onNext} activeOpacity={0.8} style={styles.buttonFull}>
              <LinearGradient
                colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{t('onboardingNext') || 'Siguiente'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
  },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#00e5b0',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  buttonFull: {
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
});