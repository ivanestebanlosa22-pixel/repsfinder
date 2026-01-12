// Fondo Animado Premium - RepsFinder PRO
// Diseño original con partículas y gradientes

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function AnimatedBackground() {
  // Crear 8 elementos animados (partículas flotantes)
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;
  const particle5 = useRef(new Animated.Value(0)).current;
  const particle6 = useRef(new Animated.Value(0)).current;
  const particle7 = useRef(new Animated.Value(0)).current;
  const particle8 = useRef(new Animated.Value(0)).current;

  // Animaciones de rotación para efectos visuales
  const rotation1 = useRef(new Animated.Value(0)).current;
  const rotation2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación infinita para partículas flotantes
    const createLoopAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Animación de rotación
    const createRotationAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        })
      );
    };

    // Iniciar todas las animaciones
    const animations = Animated.parallel([
      createLoopAnimation(particle1, 8000, 0),
      createLoopAnimation(particle2, 10000, 500),
      createLoopAnimation(particle3, 7000, 1000),
      createLoopAnimation(particle4, 9000, 1500),
      createLoopAnimation(particle5, 11000, 2000),
      createLoopAnimation(particle6, 8500, 2500),
      createLoopAnimation(particle7, 9500, 3000),
      createLoopAnimation(particle8, 10500, 3500),
      createRotationAnimation(rotation1, 20000),
      createRotationAnimation(rotation2, 25000),
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, []);

  // Interpolaciones para movimiento vertical
  const getTranslateY = (animValue: Animated.Value, distance: number) => {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, distance],
    });
  };

  // Interpolaciones para rotación
  const rotateInterpolate1 = rotation1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateInterpolate2 = rotation2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // Interpolaciones para opacidad (efecto pulsante)
  const getOpacity = (animValue: Animated.Value) => {
    return animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.1, 0.3, 0.1],
    });
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Gradiente de fondo base */}
      <View style={styles.gradientBackground} />

      {/* Círculos decorativos giratorios */}
      <Animated.View
        style={[
          styles.rotatingCircle,
          styles.rotatingCircle1,
          { transform: [{ rotate: rotateInterpolate1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.rotatingCircle,
          styles.rotatingCircle2,
          { transform: [{ rotate: rotateInterpolate2 }] },
        ]}
      />

      {/* Partículas flotantes */}
      <Animated.View
        style={[
          styles.particle,
          styles.particle1,
          {
            transform: [{ translateY: getTranslateY(particle1, 100) }],
            opacity: getOpacity(particle1),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle2,
          {
            transform: [{ translateY: getTranslateY(particle2, -120) }],
            opacity: getOpacity(particle2),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle3,
          {
            transform: [{ translateY: getTranslateY(particle3, 80) }],
            opacity: getOpacity(particle3),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle4,
          {
            transform: [{ translateY: getTranslateY(particle4, -90) }],
            opacity: getOpacity(particle4),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle5,
          {
            transform: [{ translateY: getTranslateY(particle5, 110) }],
            opacity: getOpacity(particle5),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle6,
          {
            transform: [{ translateY: getTranslateY(particle6, -100) }],
            opacity: getOpacity(particle6),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle7,
          {
            transform: [{ translateY: getTranslateY(particle7, 95) }],
            opacity: getOpacity(particle7),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle8,
          {
            transform: [{ translateY: getTranslateY(particle8, -85) }],
            opacity: getOpacity(particle8),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  rotatingCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 9999,
    opacity: 0.03,
  },
  rotatingCircle1: {
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderColor: '#00e5b0',
    top: -SCREEN_WIDTH * 0.5,
    left: -SCREEN_WIDTH * 0.25,
  },
  rotatingCircle2: {
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderColor: '#4FACFE',
    bottom: -SCREEN_WIDTH * 0.4,
    right: -SCREEN_WIDTH * 0.2,
  },
  particle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#00e5b0',
  },
  particle1: {
    width: 60,
    height: 60,
    top: '10%',
    left: '15%',
  },
  particle2: {
    width: 40,
    height: 40,
    top: '20%',
    right: '20%',
    backgroundColor: '#4FACFE',
  },
  particle3: {
    width: 50,
    height: 50,
    top: '40%',
    left: '10%',
    backgroundColor: '#FFD700',
  },
  particle4: {
    width: 35,
    height: 35,
    top: '50%',
    right: '15%',
    backgroundColor: '#FF6B6B',
  },
  particle5: {
    width: 45,
    height: 45,
    top: '65%',
    left: '25%',
    backgroundColor: '#A8EDEA',
  },
  particle6: {
    width: 55,
    height: 55,
    top: '75%',
    right: '10%',
    backgroundColor: '#AB47BC',
  },
  particle7: {
    width: 38,
    height: 38,
    top: '85%',
    left: '50%',
  },
  particle8: {
    width: 42,
    height: 42,
    top: '30%',
    left: '70%',
    backgroundColor: '#4FACFE',
  },
});
