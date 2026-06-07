import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const EMOJIS = ['👟', '👠', '👕', '🧥', '👜', '🎒', '🧢', '⌚', '💎', '🕶️', '🧦', '👖'];

const generateEmojiConfig = (width: number, height: number) => {
  const configs = [];
  const rows = 4;
  const cols = 6;
  
  for (let i = 0; i < rows * cols; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    configs.push({
      id: `emoji-${i}`,
      emoji: EMOJIS[i % EMOJIS.length],
      startX: (col + 0.5) * (width / cols),
      startY: (row + 0.5) * (height / rows),
      duration: 10000 + Math.random() * 5000,
      delay: Math.random() * 2000,
      scale: 0.4 + Math.random() * 0.3,
    });
  }
  
  return configs;
};

const FloatingEmoji = ({ emoji, startX, startY, duration, delay, scale }: any) => {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(startY - 80, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(startY, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(startX + 20, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX - 20, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: duration / 2 }),
        withTiming(0.2, { duration: duration / 2 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }, { scale }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.emoji, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
};

export default function AnimatedBackground() {
  const { width, height } = useWindowDimensions();
  const emojiConfig = useRef(generateEmojiConfig(width, height)).current;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.blackBackground} />
      {emojiConfig.map((config) => (
        <FloatingEmoji key={config.id} {...config} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  blackBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  emoji: {
    position: 'absolute',
    fontSize: 28,
  },
});
