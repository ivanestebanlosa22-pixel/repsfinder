import React, { useState, useRef } from 'react';
import { StyleSheet, Text, Alert, View, Dimensions, Platform, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremium } from '../context/PremiumContext';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 60;

export function AIChatFAB() {
  const { isPremium } = usePremium();
  
  const [position, setPosition] = useState({
    x: SCREEN_WIDTH - BUTTON_SIZE - 20,
    y: Platform.OS === 'android' ? 200 : 150,
  });
  
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);

  const handlePress = () => {
    if (isDragging.current) return;
    
    if (!isPremium) {
      Alert.alert(
        'Función Premium',
        'El asistente IA es exclusivo para usuarios Premium. ¿Quieres desbloquear el acceso completo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver planes', onPress: () => router.push('/premium') },
        ]
      );
      return;
    }
    router.push('/chat');
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        isDragging.current = false;
        dragStartTime.current = Date.now();
      },
      onPanResponderMove: (e, gestureState) => {
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          isDragging.current = true;
        }
        
        const newX = position.x + gestureState.dx;
        const newY = position.y + gestureState.dy;
        
        setPosition({
          x: Math.max(10, Math.min(newX, SCREEN_WIDTH - BUTTON_SIZE - 10)),
          y: Math.max(80, Math.min(newY, SCREEN_HEIGHT - 150)),
        });
      },
      onPanResponderRelease: (e, gestureState) => {
        const wasTap = !isDragging.current && (Date.now() - dragStartTime.current) < 200;
        
        let finalX = position.x;
        
        if (position.x < SCREEN_WIDTH / 2) {
          finalX = 20;
        } else {
          finalX = SCREEN_WIDTH - BUTTON_SIZE - 20;
        }
        
        setPosition(prev => ({ ...prev, x: finalX }));
        
        if (wasTap) {
          isDragging.current = false;
          handlePress();
        }
        
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.container,
        { left: position.x, top: position.y },
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={['#0066FF', '#FF3366']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Text style={styles.icon}>🤖</Text>
        {!isPremium && <Text style={styles.proBadge}>PRO</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 99999,
    elevation: 99999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    fontSize: 28,
  },
  proBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
});
