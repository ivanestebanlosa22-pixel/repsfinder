// ==================== AI CHAT SCREEN ====================
// Chat con IA para usuarios Premium

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSettings } from '../src/context/AppSettingsContext';
import { router } from 'expo-router';
import { sendMessageToGrokWithProducts } from '../src/services/ai/aiService';
import * as Sentry from '@sentry/react-native';

const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  ACCENT_BLUE: '#00a3ff',
  BACKGROUND: '#000',
  CARD_BG: '#0f0f0f',
  CARD_BG_DARK: '#0a0a0a',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  BORDER: '#222',
  USER_BUBBLE: '#0066FF',
  AI_BUBBLE: '#1a1a1a',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
  timestamp: Date;
}

interface ChatScreenProps {
  products?: any[];
  onClose?: () => void;
}

const EMPTY_PRODUCTS: any[] = [];

export default function ChatScreen({ products: initialProducts = EMPTY_PRODUCTS, onClose }: ChatScreenProps) {
  const { t } = useAppSettings();
  const idCounterRef = useRef(0);
  const nextId = () => `msg_${Date.now()}_${++idCounterRef.current}`;
  const [products, setProducts] = useState(initialProducts);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de RepsFinder. Puedo ayudarte a encontrar las mejores zapatillas, ropa y accesorios.\n\n¿Qué estás buscando hoy?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Cargar productos si no se pasaron como props
  useEffect(() => {
    if (initialProducts.length === 0) {
      loadProducts();
    }
  }, []);
  
  const loadProducts = async () => {
    try {
      const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=MAIN`;
      const response = await fetch(url);
      const text = await response.text();
      
      // Encontrar el JSON entre { y el último }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON found');
      
      const jsonString = text.substring(firstBrace, lastBrace + 1);
      const json = JSON.parse(jsonString);
      
      if (json?.table?.rows) {
        const loadedProducts = json.table.rows
          .map((row: any) => {
            const cells = row.c;
            return {
               nombre: cells[1]?.v || '',
               precio: cells[4]?.v || 0,
               categoria: cells[3]?.v || '',
               rating: (() => {
                 const val = cells[5]?.f;
                 if (!val || val === '') return 0;
                 const parsed = parseFloat(String(val).replace(',', '.'));
                 return isNaN(parsed) ? 0 : parsed;
               })(),
               ventas: 0,
               activo: cells[6]?.v || '',
               linkWeidian: cells[8]?.v || '',
               fotos: [cells[9]?.v, cells[10]?.v, cells[11]?.v, cells[12]?.v].filter(Boolean),
             };
          })
          .filter((p: any) => p.activo === 'SI' && p.nombre);
        
        setProducts(loadedProducts);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: nextId(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Detectar si es un saludo o consulta general (no mostrar productos)
      const greetingWords = ['hola', 'buenas', 'buenos', 'días', 'tardes', 'noches', 'gracias', 'adiós', 'chao', 'hey', 'que tal', 'como estas', 'bienvenido'];
      const isGreeting = greetingWords.some(g => inputText.toLowerCase().trim() === g || inputText.toLowerCase().trim().startsWith(g + ' '));

      // Extraer precio del mensaje
      let priceMax: number | null = null;
      let priceMin: number | null = null;
      const priceRegex = /(menos|menor|inferior|máximo|max|hasta|under|<)\s*(?:de\s*)?(\d+\.?\d*)\s*(?:€|eur|euros)?/i;
      const priceMaxMatch = inputText.match(priceRegex);
      if (priceMaxMatch) {
        priceMax = parseFloat(priceMaxMatch[2]);
      }
      const minPriceRegex = /(más|mayor|superior|mínimo|min|desde|sobre|>)\s*(?:de\s*)?(\d+\.?\d*)\s*(?:€|eur|euros)?/i;
      const priceMinMatch = inputText.match(minPriceRegex);
      if (priceMinMatch) {
        priceMin = parseFloat(priceMinMatch[2]);
      }
      // También buscar "X€" simple como precio máximo si aparece
      const simplePriceMatch = inputText.match(/(\d+\.?\d*)\s*(?:€|eur|euros)/i);
      if (!priceMax && !priceMin && simplePriceMatch) {
        const ctx = inputText.toLowerCase();
        // Si hay "menos" o similar antes, es máximo; si hay "más", es mínimo
        const before = ctx.substring(0, ctx.indexOf(simplePriceMatch[0].toLowerCase()));
        if (/(menos|menor|inferior|hasta|max|máximo|under)/i.test(before)) {
          priceMax = parseFloat(simplePriceMatch[1]);
        } else if (/(más|mayor|superior|min|mínimo|desde)/i.test(before)) {
          priceMin = parseFloat(simplePriceMatch[1]);
        } else {
          priceMax = parseFloat(simplePriceMatch[1]);
        }
      }

      // Filtrar productos relevantes según el mensaje del usuario
      const userQuery = inputText.toLowerCase();

      const searchTerms: Record<string, string[]> = {
        'sudadera': ['sudadera', 'hoodie', 'sweater', 'pullover'],
        'camiseta': ['camiseta', 'shirt', 'tee', 'tshirt'],
        'zapatilla': ['zapatilla', 'sneaker', 'shoe', 'dunk', 'jordan', 'air force', 'yeezy', 'nike', 'adidas', 'new balance', 'air max'],
        'pantalon': ['pantalón', 'pantalon', 'jean', 'jogger', 'cargo', 'short'],
        'cazadora': ['cazadora', 'jacket', 'coat', 'bomber'],
        'gorra': ['gorra', 'cap', 'hat', 'beanie'],
        'bolso': ['bolso', 'bag', 'mochila', 'backpack'],
      };

      let relevantProducts = products;
      let hasProductQuery = false;

      for (const terms of Object.values(searchTerms)) {
        if (terms.some(t => userQuery.includes(t))) {
          hasProductQuery = true;
          const filtered = products.filter(p => {
            const name = (p.nombre || '').toLowerCase();
            const cat = (p.categoria || '').toLowerCase();
            const match = terms.some(t => name.includes(t) || cat.includes(t));
            if (!match) return false;
            const price = parseFloat(p.precio);
            if (priceMax && price > priceMax) return false;
            if (priceMin && price < priceMin) return false;
            return true;
          });
          if (filtered.length > 0) { relevantProducts = filtered; break; }
        }
      }

      if (!hasProductQuery && (priceMax !== null || priceMin !== null)) {
        hasProductQuery = true;
        const filtered = products.filter(p => {
          const price = parseFloat(p.precio);
          if (priceMax && price > priceMax) return false;
          if (priceMin && price < priceMin) return false;
          return true;
        });
        if (filtered.length > 0) relevantProducts = filtered;
      }

      if (!hasProductQuery && relevantProducts.length === products.length) {
        const keywords = userQuery.split(/\s+/).filter((w: string) => w.length > 2 && !greetingWords.includes(w));
        if (keywords.length > 0) {
          hasProductQuery = true;
          const filtered = products.filter(p => {
            const searchText = (p.nombre || '').toLowerCase() + ' ' + (p.categoria || '').toLowerCase();
            const match = keywords.some((k: string) => searchText.includes(k));
            if (!match) return false;
            const price = parseFloat(p.precio);
            if (priceMax && price > priceMax) return false;
            if (priceMin && price < priceMin) return false;
            return true;
          });
          if (filtered.length > 0) relevantProducts = filtered;
        }
      }

      const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      history.push({ role: 'user', content: userMessage.content });

      const data = await sendMessageToGrokWithProducts(history, relevantProducts.slice(0, 60));

      const matchedProducts = !isGreeting && hasProductQuery ? relevantProducts.slice(0, 10) : [];

      const aiMessage: Message = {
        id: nextId(),
        role: 'assistant',
        content: data.reply,
        products: matchedProducts,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      } catch (error) {
        Sentry.captureException(error as Error);
        const errorMessage: Message = {
          id: nextId(),
          role: 'assistant',
          content: `Lo siento, error: ${(error as Error).message}. Por favor intenta de nuevo.`,
          timestamp: new Date(),
        };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (product: any) => {
    // Buscar el producto en validar por su link o nombre
    if (product.linkWeidian) {
      const itemID = product.linkWeidian.match(/itemID=(\d+)/)?.[1];
      if (itemID) {
        router.push(`/(tabs)/validar?itemID=${itemID}`);
        return;
      }
    }
    // Si no hay link, buscar por nombre en la categoría correspondiente
    const categoria = product.categoria || 'ZAPATOS';
    router.push(`/(tabs)/validar?search=${encodeURIComponent(product.nombre)}&cat=${encodeURIComponent(categoria)}`);
  };

  const renderProductCard = (product: any) => (
    <TouchableOpacity 
      key={product.nombre} 
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
      activeOpacity={0.8}
    >
      {product.fotos?.[0] ? (
        <Image source={{ uri: product.fotos[0] }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImagePlaceholderText}>
            {product.nombre?.substring(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.nombre}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>{product.precio}€</Text>
          <Text style={styles.productRating}>⭐ {product.rating}</Text>
        </View>
      </View>
      <Text style={styles.productArrow}>→</Text>
    </TouchableOpacity>
  );

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
          {message.products && message.products.length > 0 && (
            <View style={styles.productsContainer}>
              {message.products.map((p) => renderProductCard(p))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const quickSuggestions = [
    'Zapatillas Nike menos de 40€',
    'Hoodies de calidad',
    '¿Qué tienda recomiendas?',
    'Busco Jordan 1',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.SECONDARY, COLORS.ACCENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={onClose || (() => router.back())} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Asistente IA</Text>
          <View style={styles.headerStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.headerSubtitle}>En línea</Text>
          </View>
        </View>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>👑 PRO</Text>
        </View>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>🤖</Text>
              </View>
              <View style={styles.aiBubble}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick suggestions */}
        {messages.length <= 2 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => setInputText(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor={COLORS.TEXT_TERTIARY}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <LinearGradient
              colors={[COLORS.PRIMARY, '#00a88a']}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4aa',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: COLORS.USER_BUBBLE,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.AI_BUBBLE,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  productsContainer: {
    marginTop: 12,
    gap: 8,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  productRating: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  productArrow: {
    fontSize: 16,
    color: COLORS.TEXT_TERTIARY,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    padding: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.TEXT_TERTIARY,
    marginHorizontal: 2,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.3,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    marginBottom: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.CARD_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.TEXT_PRIMARY,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: COLORS.CARD_BG,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.AI_BUBBLE,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  sendButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#000',
  },
});
