import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    useWindowDimensions,
    TextInput,
    ImageBackground,
    KeyboardAvoidingView,
  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
 import { useTranslation } from 'react-i18next';
 import { useLocalSearchParams } from 'expo-router';
  import { useAppSettings } from '../../src/context/AppSettingsContext';
  import { usePremium } from '../../src/context/PremiumContext';
  import PaywallModal from '../../src/components/premium/PaywallModal';
import { AIChatFAB } from '../../src/components/AIChatFAB';
import { router } from 'expo-router';

import type { Product, Agent, ProductBadge } from '../../src/types';
import { CURRENCY_RATES, CURRENCY_SYMBOLS } from '../../src/types';
import { logger } from '../../src/utils/logger';
import * as Sentry from '@sentry/react-native';

const HEADER_BG = 'https://www.shutterstock.com/image-photo/front-cargo-container-ship-ocean-600nw-2659440041.jpg';

const StarRating = React.memo(({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Text key={`star-full-${i}`} style={styles.star}>★</Text>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Text key={`star-half-${i}`} style={styles.starHalf}>★</Text>
      );
    } else {
      stars.push(
        <Text key={`star-empty-${i}`} style={styles.starEmpty}>☆</Text>
      );
    }
  }
  return <>{stars}</>;
});
StarRating.displayName = 'StarRating';

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Text key={`star-full-${i}`} style={styles.star}>★</Text>);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Text key={`star-half-${i}`} style={styles.starHalf}>★</Text>);
    } else {
      stars.push(<Text key={`star-empty-${i}`} style={styles.starEmpty}>☆</Text>);
    }
  }
  return <>{stars}</>;
};

const COLORS = {
  PRIMARY: '#00d4aa',
  SECONDARY: '#0066FF',
  ACCENT: '#FF3366',
  ACCENT_BLUE: '#00a3ff',
  BACKGROUND: '#000',
  CARD_BG: 'rgba(20, 20, 20, 0.4)',
  CARD_BG_DARK: 'rgba(10, 10, 10, 0.4)',
  BORDER: 'rgba(40, 40, 40, 0.3)',
  BORDER_LIGHT: 'rgba(30, 30, 30, 0.3)',
  TEXT_PRIMARY: '#fff',
  TEXT_SECONDARY: '#888',
  TEXT_TERTIARY: '#666',
  TEXT_DARK: '#555',
  OVERLAY: 'rgba(0,0,0,0.94)',
} as const;

const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';
const MAIN_GID = '985196103';

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${MAIN_GID}`;
const AGENTS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=2045150387`;

const CATEGORIES = [
  { id: 'ZAPATOS', icon: '👟', nameKey: 'categorySneakers' },
  { id: 'CAMISETAS', icon: '👕', nameKey: 'categoryTshirts' },
  { id: 'BOLSOS', icon: '👜', nameKey: 'categoryBags' },
  { id: 'PERFUMES', icon: '🧴', nameKey: 'categoryPerfumes' },
  { id: 'ACCESORIOS', icon: '💎', nameKey: 'categoryAccessories' },
  { id: 'CARTERAS', icon: '👜', nameKey: 'categoryWallets' },
  { id: 'CAZADORAS', icon: '🧥', nameKey: 'categoryJackets' },
  { id: 'CINTURONES', icon: '👔', nameKey: 'categoryBelts' },
  { id: 'ELECTRONICA', icon: '📱', nameKey: 'categoryElectronics' },
  { id: 'GORRAS', icon: '🧢', nameKey: 'categoryCaps' },
  { id: 'HOODIES & SWEATSHIRTS', icon: '👕', nameKey: 'categoryHoodies' },
  { id: 'JACKETS🧥', icon: '🧥', nameKey: 'categoryJackets' },
  { id: 'JOYERIA', icon: '💍', nameKey: 'categoryJewelry' },
  { id: 'KIDS 👦', icon: '👦', nameKey: 'categoryKids' },
  { id: 'PANTALONES', icon: '👖', nameKey: 'categoryPants' },
  { id: 'PANTS, SHORTS & SET👖🩳', icon: '👖', nameKey: 'categoryShorts' },
  { id: 'RELOJES', icon: '⌚', nameKey: 'categoryWatches' },
  { id: 'ROPA INTERIOR', icon: '🩱', nameKey: 'categoryUnderwear' },
  { id: 'SUDADERAS', icon: '👕', nameKey: 'categoryHoodies' },
  { id: 'T-SHIRTS👕', icon: '👚', nameKey: 'categoryTshirts' },
  { id: 'Women👩', icon: '👩', nameKey: 'categoryWomen' },
  { id: 'OTROS', icon: '📦', nameKey: 'categoryOthers' },
  { id: 'CALCETINES', icon: '🧦', nameKey: 'categorySocks' },
];

// Función para extraer marca del nombre del producto
const KNOWN_BRANDS = [
  'NIKE', 'ADIDAS', 'JORDAN', 'YEEZY', 'NEW BALANCE', 'PUMA', 'REEBOK',
  'CONVERSE', 'VANS', 'ASICS', 'SAUCONY', 'UNDER ARMOUR', 'SUPREME',
  'BALENCIAGA', 'GUCCI', 'LOUIS VUITTON', 'PRADA', 'DIOR', 'CHANEL',
  'OFF-WHITE', 'BAPE', 'STONE ISLAND', 'MONCLER', 'CANADA GOOSE',
  'THE NORTH FACE', 'PATAGONIA', 'ARC\'TERYX', 'CARHARTT', 'DICKIES',
  'CHAMPION', 'FILA', 'KAPPA', 'LACOSTE', 'TOMMY HILFIGER', 'RALPH LAUREN',
  'CALVIN KLEIN', 'HUGO BOSS', 'VERSACE', 'ARMANI', 'BURBERRY',
  'LEVI\'S', 'DIESEL', 'G-STAR', 'TRUE RELIGION', 'AMIRI',
  'PALM ANGELS', 'ESSENTIALS', 'FEAR OF GOD', 'STUSSY', 'TRAPSTAR',
  'CORTEIZ', 'GALLERY DEPT', 'RHUDE', 'CHROME HEARTS', 'VIVIENNE WESTWOOD',
  'APPLE', 'SAMSUNG', 'SONY', 'BOSE', 'JBL', 'BEATS', 'AIRPODS',
  'ROLEX', 'OMEGA', 'CARTIER', 'PATEK PHILIPPE', 'AUDEMARS PIGUET',
  'CROCS', 'BIRKENSTOCK', 'UGG', 'TIMBERLAND', 'DR. MARTENS',
  'SALOMON', 'HOKA', 'ON RUNNING', 'BROOKS', 'MIZUNO',
];

const extractBrand = (productName: string): string => {
  if (!productName) return 'Other';
  const upperName = productName.toUpperCase();
  for (const brand of KNOWN_BRANDS) {
    if (upperName.includes(brand)) {
      return brand.charAt(0) + brand.slice(1).toLowerCase();
    }
  }
  const firstWord = productName.split(' ')[0];
  return firstWord || 'Other';
};

// ==================== SMART AUTO-CATEGORIZATION ====================
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'ZAPATOS': ['zapatilla','sneaker','shoe','trainer','runner','air max','air force',
    'yeezy','boost','ultraboost','dunk','converse','vans','loafer','bota','crocs',
    'birkenstock','sandal','sandalia','saucony','asics','new balance','hoka',
    'on running','salomon','timberland','mocasin','calzado','footwear','slipper',
    'chancla','slides','mule','clog','platform shoe','cleats'],
  'CAMISETAS': ['camiseta','t-shirt','tshirt','polo','manga corta','tank top',
    'sleeveless','graphic tee'],
  'BOLSOS': ['bolso','handbag','tote','shoulder bag','crossbody','clutch','pochette',
    'baguette','mini bag','maxi bag','satchel'],
  'PERFUMES': ['perfume','fragrance','cologne','eau de','parfum','sauvage',
    'bleu de chanel','oud','neroli','musk','toilette','extrait'],
  'ACCESORIOS': ['gafas','sunglasses','lentes','keychain','llavero','phone case',
    'funda movil','scarf','bufanda','guantes','gloves'],
  'CARTERAS': ['cartera','wallet','billetera','portamonedas','card holder','tarjetero'],
  'CAZADORAS': ['cazadora','bomber','windbreaker','cortaviento','anorak','parka',
    'puffer','abrigo','coat','leather jacket','varsity','chaqueta'],
  'CINTURONES': ['cinturon','belt','correa','cinto'],
  'ELECTRONICA': ['airpod','earphone','headphone','earbuds','speaker','iphone',
    'samsung phone','ipad','tablet','wireless earphone','bluetooth speaker',
    'apple watch','galaxy watch','macbook','laptop','usb','cargador'],
  'GORRAS': ['gorra','cap',' hat ','beanie','bucket hat','snapback','trucker hat','visera'],
  'HOODIES & SWEATSHIRTS': ['hoodie','zip hoodie','zip-up','zip up'],
  'SUDADERAS': ['sudadera','sweatshirt','crewneck','crew neck'],
  'JOYERIA': ['collar','necklace','ring','anillo','pulsera','bracelet','earring',
    'pendiente','chain','cadena','choker','colgante','charm'],
  'PANTALONES': ['pantalon','pants','jeans','cargo pants','chino','trousers',
    'legging','jogger','slim fit','wide leg','baggy pants'],
  'RELOJES': ['reloj','watch','chronograph','automatico','quartz'],
  'ROPA INTERIOR': ['underwear','boxer','ropa interior','bra','sujetador',
    'calzoncillo','brief','thong','sports bra'],
  'CALCETINES': ['calcetines','socks','medias','ankle socks','crew socks'],
  'MOCHILA': ['mochila','backpack'],
  'MUJER': ['mujer','woman','women','female','lady','ladies','dress','vestido',
    'falda','skirt','top','blusa','blouse','body','corset','camisola','tanga',
    'bikini','swimsuit','bañador','pareo','kimono','babydoll','pijama','nightwear',
    'leggings','yoga pants','sport bra','push up','realza','sin costuras',
    'strapless','sin tirantes','escote','espalda','abierto','transparente'],
};

const smartCategorizarProducto = (nombre: string, categoriaOriginal: string): string => {
  if (!nombre) return categoriaOriginal;
  const lower = nombre.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      // Si la categoría original difiere significativamente, corregir
      const origUp = (categoriaOriginal || '').toUpperCase();
      if (!origUp.includes(cat) && !cat.includes(origUp)) {
        return cat;
      }
      return categoriaOriginal;
    }
  }
  return categoriaOriginal;
};

// ==================== AGENT LINK GENERATOR ====================
const generateAgentLinks = (weidianUrl: string): {
  kakobuy: string;
  usfans: string;
  mulebuy: string;
  joyagoo: string;
  oppbuy: string;
  litbuy: string;
  hipobuy: string;
  superbuy: string;
  acbuy: string;
} | null => {
  if (!weidianUrl) return null;
  
  // Extraer ID del producto del link weidian
  const match = weidianUrl.match(/itemID[=:](\d+)/) || weidianUrl.match(/\/(\d+)(?:\?|$)/);
  if (!match) return null;
  
  const productId = match[1];
  
  return {
    kakobuy: `https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D${productId}&affcode=hc9hzsSI`,
    usfans: `https://www.usfans.com/product/3/${productId}?ref=RCGD5YSI`,
    mulebuy: `https://mulebuy.com/product/?shop_type=weidian&id=${productId}&ref=200642502`,
    joyagoo: `https://joyagoo.com/product?platform=WEIDIAN&id=${productId}&ref=300768147`,
    oppbuy: `https://oopbuy.com/product/weidian/${productId}?inviteCode=GH40R4J0O`,
    litbuy: `https://oopbuy.com/product/weidian/${productId}?inviteCode=GH40R4J0O`,
    hipobuy: `https://hipobuy.com/product/weidian/${productId}?inviteCode=YZKOGE9NE`,
    superbuy: `https://www.superbuy.com/en/page/buy/?platform=WD&id=${productId}&partnercode=Ey3NrI`,
    acbuy: `https://www.acbuy.com/product?id=${productId}&u=UD3WIU&source=WD`,
  };
};

export default function ValidateScreen() {
  const { t, i18n } = useTranslation();
  const { currency } = useAppSettings();
  const { canCompareProducts, isPremium } = usePremium();
  const searchParams = useLocalSearchParams();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  
  const [selectedCategory, setSelectedCategory] = useState('ZAPATOS');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);
   const scrollViewRef = useRef<ScrollView>(null);
   const hasHighlightedRef = useRef(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [isTopProductsMode, setIsTopProductsMode] = useState(false);

  const [showComparisonModal, setShowComparisonModal] = useState(false);
     const [productToCompare, setProductToCompare] = useState<Product | null>(null);
     const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
      const [showPaywall, setShowPaywall] = useState(false);
   const [selectedComparisonProduct, setSelectedComparisonProduct] = useState<Product | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [visibleProducts, setVisibleProducts] = useState(20);
  const [searchPriceMin, setSearchPriceMin] = useState('');
  const [searchPriceMax, setSearchPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
 const PRODUCTS_PER_PAGE = 20;
 const [showSearchModal, setShowSearchModal] = useState(false);
 const [searchName, setSearchName] = useState('');
 const [searchBrand, setSearchBrand] = useState('');
 const [sortBy, setSortBy] = useState<'default' | 'rating' | 'price_asc' | 'price_desc' | 'sales'>('default');

 const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Cargar favoritos al iniciar
  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const raw = await AsyncStorage.getItem('reps_favorites');
        if (raw) setFavorites(new Set(JSON.parse(raw)));
      } catch {}
    })();
  }, []);

  const toggleFavorite = useCallback(async (productId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      // Persistir en background
      (async () => {
        try {
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.setItem('reps_favorites', JSON.stringify([...next]));
        } catch {}
      })();
      return next;
    });
  }, []);

  const getCategoryName = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      return t(category.nameKey, categoryId.replace(/[^a-zA-Z\s]/g, ''));
    }
    return categoryId;
  };

  // ✅ IMPROVED: Use centralized currency rates
  const formatPrice = (price: number) => {
    const rate = CURRENCY_RATES[currency];
    const convertedPrice = (price * rate).toFixed(2);
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${convertedPrice}`;
  };

  useEffect(() => {
    fetchProducts();
    fetchAgents();
  }, []);

  useEffect(() => {
    // Solo hacer highlight la PRIMERA vez que llegas desde descubrir
    if (hasHighlightedRef.current) return;
    
    if (products.length === 0) return;
    const categoria = searchParams.categoria as string;
    const nombreProducto = searchParams.nombre as string;
    if (categoria) {
      const categoryExists = CATEGORIES.some(cat => cat.id === categoria);
      if (categoryExists) {
        setSelectedCategory(categoria);
      }
    }
    if (nombreProducto) {
      const foundProduct = products.find(p => p.nombre === nombreProducto);
      if (foundProduct) {
        hasHighlightedRef.current = true;
        setHighlightedProduct(nombreProducto);
        if (!categoria && foundProduct.categoria) {
          setSelectedCategory(foundProduct.categoria);
        }
        // Hacer scroll hacia el producto después de un breve delay
        setTimeout(() => {
          const productIndex = products.findIndex(p => p.nombre === nombreProducto);
          if (productIndex >= 0 && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: productIndex * 300,
              animated: true
            });
          }
        }, 500);
      }
    }
  }, [searchParams]);
  
  // Quitar highlight después de 3 segundos (solo una vez)
  useEffect(() => {
    if (highlightedProduct) {
      const timer = setTimeout(() => {
        setHighlightedProduct(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedProduct]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(AGENTS_URL);
      const text = await response.text();
      
      // ✅ Safe JSON parsing
      let json;
      try {
        // Remove lines starting with // (comments)
        let cleanText = text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
        
        const jsonString = cleanText.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
        
        // Find the actual JSON object
        const match = jsonString.match(/\{[\s\S]*\}/);
        if (match) {
          json = JSON.parse(match[0]);
        } else {
          throw new Error('Could not find valid JSON object in response');
        }
      } catch (parseError) {
        logger.error('Error parsing agents JSON:', parseError);
        logger.error('Response preview:', text.substring(0, 200));
        return;
      }
      
      if (!json?.table?.rows) {
        logger.error('Invalid agents data structure');
        return;
      }
      
       const rows = json.table.rows;
        
       // DEBUG DETALLADO: estructura de filas
       if (rows.length > 0) {
         rows[0].c?.forEach((cell: any, i: number) => {
         });
       }
       if (rows.length > 1) {
         rows[1].c?.forEach((cell: any, i: number) => {
         });
       }

        if (rows.length <= 1) return;

        const fetchedAgents = rows.map((row: any, index: number) => {
         const cells = row.c;
         
          // Debug: mostrar primera fila mapeada
          if (index === 0) {
            cells.forEach((cell: any, i: number) => {
            });
            // DEBUG de mostrar
            const mostrarRaw = cells[2]?.v;
            const mostrarStr = typeof mostrarRaw === 'string' ? String(mostrarRaw).trim().toUpperCase() : String(mostrarRaw ?? '');
          }
        
        const name = cells[0]?.v || '';
        const linkFormat = cells[1]?.v || '';
        const mostrarRaw = cells[2]?.v;
        const logo = cells[4]?.v || '';
        const id = name ? name.toString().toLowerCase() : `agent-${index}`;
         const mostrarStr = typeof mostrarRaw === 'string' ? String(mostrarRaw).trim().toUpperCase() : String(mostrarRaw ?? '');
         const isEmpty = mostrarStr === '';
         const mostrar = isEmpty || mostrarRaw === true || mostrarRaw === 1 || ['SI', 'SÍ', 'YES', 'TRUE', '1'].includes(mostrarStr);
       
        return {
          id,
          name: name || 'Agente',
          logo: logo || '',
          mostrar,
          linkFormat,
        };
       });
       
       // DEBUG: agentes antes de filtrar
        // fetchedAgents.forEach((agent: any, idx: number) => {
        // });

       const agentsToShow = fetchedAgents.filter((a: any) => a.mostrar && a.name);
        // agentsToShow.forEach((agent: any, idx: number) => {
        // });
      setAgents(agentsToShow);
   } catch (error) {
     Sentry.captureException(error as Error);
     logger.error('Error agentes:', error);
   }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const text = await response.text();
      
      // ✅ Safe JSON parsing
      let json;
      try {
        // Remove lines starting with // (comments)
        let cleanText = text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
        
        const jsonString = cleanText.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
        
        // Find the actual JSON object
        const match = jsonString.match(/\{[\s\S]*\}/);
        if (match) {
          json = JSON.parse(match[0]);
        } else {
          throw new Error('Could not find valid JSON object in response');
        }
      } catch (parseError) {
        logger.error('Error parsing products JSON:', parseError);
        logger.error('Response preview:', text.substring(0, 200));
        throw new Error('Failed to parse products data');
      }

      if (!json?.table?.rows) {
        logger.error('Invalid products data structure');
        setLoading(false);
        return;
      }
      
       const rows = json.table.rows;
       
       // DEBUG DETALLADO: estructura de filas de productos
       if (rows.length > 0) {
         rows[0].c?.forEach((cell: any, i: number) => {
         });
       }
       if (rows.length > 1) {
         rows[1].c?.forEach((cell: any, i: number) => {
         });
       }

        const allProducts = rows.map((row: any, index: number) => {
        const cells = row.c;
        const nombre = cells[1]?.v || '';
        const linkWeidian = cells[8]?.v || '';
        const agentLinks = generateAgentLinks(linkWeidian);
        
        // Parse precio
        const rawPrecio = cells[4]?.v || '0';
        const precioNum = typeof rawPrecio === 'string' 
          ? parseFloat(rawPrecio.replace(/[^0-9.]/g, '')) || 0 
          : rawPrecio;
        
        return {
          id: `product-${index}`,
          foto: cells[9]?.v || '',
          nombre,
          precio: precioNum,
          categoriaOriginal: cells[3]?.v || '',
          categoria: smartCategorizarProducto(nombre, cells[3]?.v || ''),
          activo: cells[6]?.v || '',
          rating: (() => {
            const val = cells[5]?.f;
            if (!val || val === '') return 0;
            const parsed = parseFloat(String(val).replace(',', '.'));
            return isNaN(parsed) ? 0 : parsed;
          })(),
          ventas: 0,
          linkWeidian,
          linkKakobuy: agentLinks?.kakobuy || '',
          linkUsfans: agentLinks?.usfans || '',
          linkMulebuy: agentLinks?.mulebuy || '',
          linkJoyagoo: agentLinks?.joyagoo || '',
          linkOppbuy: agentLinks?.oppbuy || '',
          linkLitbuy: agentLinks?.litbuy || '',
          linkHipobuy: agentLinks?.hipobuy || '',
          linkSuperbuy: agentLinks?.superbuy || '',
          linkAcbuy: agentLinks?.acbuy || '',
          foto1: cells[10]?.v || '',
          foto2: cells[11]?.v || '',
          foto3: cells[12]?.v || '',
          foto4: cells[13]?.v || '',
          foto5: cells[14]?.v || '',
          foto6: cells[15]?.v || '',
          descripcion: cells[16]?.v || '',
          descripcionEn: cells[17]?.v || '',
          marca: cells[2]?.v || extractBrand(nombre),
        };
      }).filter((p: any) => 
        p.activo &&
        p.activo.toString().toUpperCase() === 'SI' &&
        p.foto &&
        p.nombre
       );
       
       // DEBUG: productos después de filtrar
       if (allProducts.length > 0) {
         allProducts.slice(0, 3).forEach((p: any, idx: number) => {
         });
       }

        // Limitar a 500 productos para mejor rendimiento
        setProducts(allProducts);
        setLoading(false);
    } catch (error) {
      logger.error('Error productos:', error);
      setLoading(false);
    }
 };

  // Calcular marcas por categoría
  const brandsByCategory = useMemo(() => {
    const categoryProducts = products.filter(p => p.categoria === selectedCategory);
    const brandCount: { [key: string]: number } = {};
    
    categoryProducts.forEach(p => {
      const brand = p.marca || 'Other';
      brandCount[brand] = (brandCount[brand] || 0) + 1;
    });

    // Ordenar por cantidad y tomar top 20
    return Object.entries(brandCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([brand, count]) => ({ brand, count }));
  }, [products, selectedCategory]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    // En modo Top Products se busca en TODOS los productos, solo con filtro de rating
    if (isTopProductsMode) {
      let filtered = products.filter(p => (p.rating ?? 0) >= 4.8);
      // Acceso anticipado: usuarios gratis solo ven productos > 48h
      if (!isPremium) {
        const cutoff = Date.now() - (48 * 60 * 60 * 1000);
        filtered = filtered.filter(p => !p.fecha || parseInt(p.fecha) < cutoff);
      }
      return filtered;
    }

    let filtered = products.filter(p => p.categoria === selectedCategory);
    if (selectedBrand) {
      filtered = filtered.filter(p => p.marca === selectedBrand);
    }
    if (searchQuery.trim() || searchPriceMin || searchPriceMax) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const matchesQuery = !searchQuery.trim() || 
          p.nombre?.toLowerCase().includes(query) ||
          p.marca?.toLowerCase().includes(query) ||
          p.categoria?.toLowerCase().includes(query);
        
        const minPrice = searchPriceMin ? parseFloat(searchPriceMin) : 0;
        const maxPrice = searchPriceMax ? parseFloat(searchPriceMax) : Infinity;
        const matchesPrice = (p.precio ?? 0) >= minPrice && (p.precio ?? 0) <= maxPrice;
        
        return matchesQuery && matchesPrice;
      });
    }
    // Ordenar
    if (sortBy === 'rating') filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortBy === 'price_asc') filtered.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
    else if (sortBy === 'price_desc') filtered.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
    else if (sortBy === 'sales') filtered.sort((a, b) => (b.ventas ?? 0) - (a.ventas ?? 0));

    // Acceso anticipado: usuarios gratis solo ven productos > 48h
    if (!isPremium) {
      const cutoff = Date.now() - (48 * 60 * 60 * 1000);
      filtered = filtered.filter(p => !p.fecha || parseInt(p.fecha) < cutoff);
    }
    return filtered;
  }, [products, selectedCategory, selectedBrand, searchQuery, searchPriceMin, searchPriceMax, isTopProductsMode, isPremium, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const openAgentLink = (agent: any) => {
    if (!selectedProduct?.linkWeidian || !agent.linkFormat) return;
    
    // Extraer ID del producto del link weidian
    const match = selectedProduct.linkWeidian.match(/itemID[=:](\d+)/) || selectedProduct.linkWeidian.match(/\/(\d+)(?:\?|$)/);
    if (!match) return;
    
    const productId = match[1];
    
    // Extraer ID de ejemplo del formato del link
    const exampleIdMatch = agent.linkFormat.match(/(\d{5,})/);
    if (!exampleIdMatch) return;
    
    const exampleId = exampleIdMatch[1];
    
    // Reemplazar ID de ejemplo con ID real del producto
    const finalLink = agent.linkFormat.replace(exampleId, productId);
    
    Linking.openURL(finalLink);
    setShowAgentModal(false);
  };

  const getBadge = useCallback((product: any) => {
    if (product.rating >= 4.8) return { text: t('topRated'), color: '#8B5CF6' };
    if (product.rating >= 4.5) return { text: t('recommended'), color: '#4FACFE' };
    if (product.precio < 20) return { text: t('offer'), color: '#AB47BC' };
    return null;
  }, [t]);

  const openZoomImage = (uri: string | undefined) => {
    if (uri) {
      setZoomImage(uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />
      
      {/* BOTÓN FLOTANTE IA */}
      <AIChatFAB />
      
      {/* HEADER EXACTO COMO DESCUBRIR.TSX */}
       <ImageBackground
         source={{ uri: HEADER_BG }}
         style={[styles.header, { paddingTop: statusBarHeight + 20, paddingBottom: 5 }]}
         imageStyle={styles.headerImage}
       >
         <Text style={styles.logo}>RepsFinder</Text>
         <Text style={styles.tagline}>{t('tagline')}</Text>
         <View style={{ flex: 1 }} />
         {/* BARRA DEGRADADA AL FINAL DEL HEADER */}
         <View style={[styles.gradientBarContainer, { marginHorizontal: -20, width: SCREEN_WIDTH, marginTop: 5 }]}>
           <LinearGradient
             colors={[COLORS.SECONDARY, COLORS.ACCENT]}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 0 }}
             style={styles.gradientBar}
           />
         </View>
       </ImageBackground>

      {/* SUB-BANNER EXACTO COMO DESCUBRIR.TSX */}
      <View style={[styles.subBanner, { top: statusBarHeight + 70 }]}>
        <LinearGradient
          colors={[COLORS.SECONDARY, COLORS.ACCENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.subBannerGradient}
        />
      </View>

         <View style={[styles.content, { marginTop: statusBarHeight + 120 }]}>
          <View style={styles.sidebar}>
            {/* CATEGORÍAS Y BOTÓN MANIQUÍ */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              scrollEventThrottle={16}
            >
                {/* COMPARADOR */}
              <TouchableOpacity
                style={styles.catItem}
                onPress={() => router.push('/comparador')}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>🔗</Text>
                <Text style={styles.catText} numberOfLines={1}>
                  COMPARADOR
                </Text>
              </TouchableOpacity>

              {/* CATEGORÍA TOP PRODUCTS */}
              <TouchableOpacity
                style={[
                  styles.catItem,
                  isTopProductsMode && styles.catItemActive,
                  !isPremium && styles.catItemLocked,
                ]}
                onPress={() => {
                  if (isPremium) {
                    setIsTopProductsMode(!isTopProductsMode);
                    if (!isTopProductsMode) {
                      setSelectedBrand(null);
                      setVisibleProducts(20);
                    }
                } else {
                  setShowPaywall(true);
                }
                  }}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>⭐</Text>
                <Text style={[
                  styles.catText,
                  isTopProductsMode && styles.catTextActive,
                  !isPremium && styles.catTextLocked,
                ]} numberOfLines={1}>
                  TOP PRODUCTS
                </Text>
                {!isPremium && <Text style={styles.lockIcon}>🔒</Text>}
              </TouchableOpacity>

              {/* CATEGORÍAS */}
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id && !isTopProductsMode;
                const count = products.filter(p => p.categoria === cat.id).length;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catItem, isActive && styles.catItemActive]}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setIsTopProductsMode(false);
                      setSelectedBrand(null);
                      setCurrentPage(1);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text
                      style={[styles.catText, isActive && styles.catTextActive]}
                      numberOfLines={2}
                    >
                      {t(cat.nameKey, cat.id)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
             </ScrollView>
          </View>

        <View style={styles.productsArea}>
          {/* HEADER CON ETIQUETA DE MARCAS */}
          <View style={styles.productHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.categoryTitle}>{isTopProductsMode ? '⭐ TOP' : getCategoryName(selectedCategory)}</Text>

            {/* ETIQUETA PREMIUM DE MARCAS */}
            <TouchableOpacity 
              style={styles.brandTag}
              onPress={() => setShowBrandModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.brandTagIcon}>🏷️</Text>
              <Text style={styles.brandTagText}>
                {brandsByCategory.length}
              </Text>
            </TouchableOpacity>

            {/* BOTÓN DE BÚSQUEDA PREMIUM */}
            <TouchableOpacity 
              style={styles.brandTag}
              onPress={() => setShowSearchModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.brandTagIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
          </View>

          {/* CHIP DE MARCA SELECCIONADA */}
          {selectedBrand && (
            <View style={styles.selectedBrandChip}>
              <Text style={styles.selectedBrandText}>{selectedBrand}</Text>
              <TouchableOpacity onPress={() => setSelectedBrand(null)}>
                <Text style={styles.clearBrand}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <LinearGradient colors={['#00d4aa','#0066FF']} style={styles.loadingDot} />
              <Text style={styles.loadingText}>{t('validateLoading')}</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>{t('noProductsFound', 'Sin resultados')}</Text>
              <Text style={styles.emptySubtitle}>{t('tryOtherFilters', 'Prueba con otros filtros')}</Text>
            </View>
          ) : (
            <ScrollView 
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              scrollEventThrottle={16}
            >
              {filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map((product) => {
                const badge = getBadge(product);
                const isHighlighted = highlightedProduct === product.nombre;
                
                return (
                  <View 
                    key={product.id}
                    style={[styles.productCard, isHighlighted && styles.productCardHighlighted]}
                  >
                    {badge && (
                      <View style={[styles.badge, { backgroundColor: badge.color }]}>
                        <Text style={styles.badgeText}>{badge.text}</Text>
                      </View>
                    )}
                    
                    <View style={styles.imageBox}>
                      <Image
                        source={{ uri: product.foto }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    </View>
                    
                    <View style={styles.productInfo}>
                      {/* Marca + categoría */}
                      <View style={styles.productMetaRow}>
                        <Text style={styles.productBrandChip}>{product.marca}</Text>
                        {isTopProductsMode && (
                          <Text style={styles.productCatChip}>{product.categoria}</Text>
                        )}
                      </View>

                      {/* Nombre + corazón */}
                      <View style={styles.productNameRow}>
                        <Text style={[styles.productName, { flex: 1 }]} numberOfLines={2}>{product.nombre}</Text>
                        <TouchableOpacity
                          onPress={() => toggleFavorite(product.id)}
                          style={styles.favHeartBtn}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.favHeartIcon}>
                            {favorites.has(product.id) ? '❤️' : '🤍'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.priceRatingRow}>
                        <Text style={styles.productPrice}>{formatPrice(product.precio ?? 0)}</Text>
                        {(product.rating ?? 0) > 0 && (
                          <View style={styles.ratingPill}>
                            <Text style={styles.ratingPillStar}>★</Text>
                            <Text style={styles.ratingPillValue}>{(product.rating ?? 0).toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                      
                      {(product.ventas ?? 0) > 0 && (
                        <Text style={styles.salesText}>
                          🔥 {product.ventas}+ {t('soldUnits')}
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={() => { setSelectedProduct(product); setShowProductModal(true); }}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={styles.buyBtn}
                        >
                           <Text style={styles.buyText}>{t('buyWithAgent')}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              {/* PAGINACIÓN INTELIGENTE */}
              {totalPages > 1 && (() => {
                const delta = 2;
                const pages: (number | '...')[] = [];
                const left = Math.max(2, currentPage - delta);
                const right = Math.min(totalPages - 1, currentPage + delta);
                pages.push(1);
                if (left > 2) pages.push('...');
                for (let i = left; i <= right; i++) pages.push(i);
                if (right < totalPages - 1) pages.push('...');
                if (totalPages > 1) pages.push(totalPages);
                return (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.paginationButton, currentPage === 1 && { opacity: 0.3 }]}
                      onPress={() => currentPage > 1 && goToPage(currentPage - 1)}
                    >
                      <Text style={styles.paginationText}>‹</Text>
                    </TouchableOpacity>
                    {pages.map((page, idx) =>
                      page === '...' ? (
                        <Text key={`dots-${idx}`} style={[styles.paginationText, { paddingHorizontal: 4 }]}>…</Text>
                      ) : (
                        <TouchableOpacity
                          key={page}
                          style={[styles.paginationButton, currentPage === page && styles.paginationButtonActive]}
                          onPress={() => goToPage(page as number)}
                        >
                          <Text style={[styles.paginationText, currentPage === page && styles.paginationTextActive]}>{page}</Text>
                        </TouchableOpacity>
                      )
                    )}
                    <TouchableOpacity
                      style={[styles.paginationButton, currentPage === totalPages && { opacity: 0.3 }]}
                      onPress={() => currentPage < totalPages && goToPage(currentPage + 1)}
                    >
                      <Text style={styles.paginationText}>›</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </ScrollView>
          )}
        </View>
      </View>

      {/* MODAL DE MARCAS - DISEÑO PREMIUM */}
      <Modal
        visible={showBrandModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBrandModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.brandModalBox}>
            <View style={styles.brandModalHeader}>
                <View>
                  <Text style={styles.brandModalTitle}>
                  {t('filterByBrandTitle')}
                </Text>
                <Text style={styles.brandModalSub}>
                  {brandsByCategory.length} {t('brandsAvailableCategory')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowBrandModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.brandScroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBrand(null);
                    setShowBrandModal(false);
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.brandItem,
                    !selectedBrand && styles.brandItemSelected
                  ]}
                >
                  <View style={styles.brandInfo}>
                    <Text style={[
                      styles.brandName,
                      !selectedBrand && styles.brandNameSelected
                    ]}>
                      {t('allBrandsOption')}
                    </Text>
                    <Text style={styles.brandCount}>
                      {products.filter(p => p.categoria === selectedCategory).length}
                    </Text>
                  </View>
                  {!selectedBrand && <Text style={styles.brandCheck}>✓</Text>}
                </TouchableOpacity>

                {/* LISTA DE MARCAS */}
                {brandsByCategory.map(({ brand, count }) => (
                  <TouchableOpacity
                    key={brand}
                    onPress={() => {
                      setSelectedBrand(brand);
                      setShowBrandModal(false);
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.brandItem,
                      selectedBrand === brand && styles.brandItemSelected
                    ]}
                  >
                    <View style={styles.brandInfo}>
                      <Text style={[
                        styles.brandName,
                        selectedBrand === brand && styles.brandNameSelected
                      ]}>
                        {brand}
                      </Text>
                      <Text style={styles.brandCount}>{count}</Text>
                    </View>
                    {selectedBrand === brand && <Text style={styles.brandCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
</ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DE BÚSQUEDA PREMIUM */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.searchModalOverlay}
        >
          <View style={styles.searchModalBox}>
            <View style={styles.searchModalHeader}>
              <View>
                <Text style={styles.brandModalTitle}>
                   {t('advancedSearchTitle')}
                </Text>
                <Text style={styles.searchSubtitle}>
                  {t('advancedSearchDesc')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.searchModalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.filterLabel}>{t('productName')}</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={t('productNamePlaceholder')}
                placeholderTextColor={COLORS.TEXT_TERTIARY}
                value={searchName}
                onChangeText={setSearchName}
              />

              <Text style={styles.filterLabel}>{t('brand')}</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={t('brandPlaceholder')}
                placeholderTextColor={COLORS.TEXT_TERTIARY}
                value={searchBrand}
                onChangeText={setSearchBrand}
              />

              <Text style={styles.filterLabel}>{t('priceRange')}</Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.currencySymbol}>{CURRENCY_SYMBOLS[currency]}</Text>
                  <TextInput
                    style={[styles.searchInput, { flex: 1, paddingLeft: 25 }]}
                    placeholder={t('minPrice')}
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    value={searchPriceMin}
                    onChangeText={setSearchPriceMin}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.priceSeparator}>-</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.currencySymbol}>{CURRENCY_SYMBOLS[currency]}</Text>
                  <TextInput
                    style={[styles.searchInput, { flex: 1, paddingLeft: 25 }]}
                    placeholder={t('maxPrice')}
                    placeholderTextColor={COLORS.TEXT_TERTIARY}
                    value={searchPriceMax}
                    onChangeText={setSearchPriceMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.searchButtonsRow}>
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => {
                    setSearchName('');
                    setSearchBrand('');
                    setSearchPriceMin('');
                    setSearchPriceMax('');
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.clearSearchText}>{t('clearBtn')}</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applySearchButton}
                >
                  <TouchableOpacity 
                    onPress={() => {
                        let query = '';
                        if (searchName) query += searchName + ' ';
                        if (searchBrand) query += searchBrand;
                        setSearchQuery(query.trim());
                        setShowSearchModal(false);
                    }}
                  >
                    <Text style={styles.applySearchText}>{t('searchBtn')}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL DE AGENTES */}
      <Modal
        visible={showAgentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAgentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAgentModal(false)}
          />
          <View style={styles.modalBox}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {t('choosePurchaseAgent')}
                  </Text>
                  <Text style={styles.modalSub}>
                    {agents.length} {t('verifiedAgentsAvailable')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowAgentModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.agentScroll}>
                {agents.map((agent, index) => (
                  <TouchableOpacity
                    key={`${agent.id}-${index}`}
                    onPress={() => openAgentLink(agent)}
                    activeOpacity={0.7}
                    style={styles.agentItem}
                  >
                    <View style={styles.agentLogoBox}>
                      {agent.logo && agent.logo.startsWith('http') ? (
                        <Image
                          source={{ uri: agent.logo }}
                          style={styles.agentLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.agentEmoji}>🛒</Text>
                      )}
                    </View>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Text style={styles.agentArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE FOTOS DEL PRODUCTO */}
      <Modal
        visible={showProductModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowProductModal(false)}
          />
          <View style={styles.productModalBox}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                 <View>
                   <Text style={styles.modalTitle}>
                     {selectedProduct?.nombre}
                   </Text>
                 </View>
                 <TouchableOpacity onPress={() => setShowProductModal(false)}>
                   <Text style={styles.modalClose}>✕</Text>
                 </TouchableOpacity>
               </View>

                {/* Info del producto */}
                 <View style={styles.productInfoModal}>
                   <View style={styles.priceRow}>
                     <Text style={styles.productPriceModal}>{formatPrice(selectedProduct?.precio || 0)}</Text>
                      <TouchableOpacity 
                        style={styles.createAlertButton}
                        onPress={() => router.push('/alertas')}
                      >
                        <Text style={styles.createAlertText}>🔔 {t('alertBtn')}</Text>
                      </TouchableOpacity>
                   </View>
                   
                    {selectedProduct?.rating && selectedProduct.rating > 0 && (
                      <View style={styles.ratingContainerModal}>
                        <View style={styles.starsRow}>
                          {renderStars(selectedProduct.rating)}
                        </View>
                        <Text style={styles.ratingValueModal}>{selectedProduct.rating.toFixed(1)}</Text>
                      </View>
                    )}

                    {selectedProduct?.ventas && selectedProduct.ventas > 0 && (
                      <Text style={styles.salesTextModal}>
                        {selectedProduct.ventas}+ {t('soldUnits')}
                      </Text>
                    )}
                 </View>

                  {/* FOTOS DEL PRODUCTO - HORIZONTAL SIN ESPACIOS */}
                    <ScrollView 
                     horizontal 
                     showsHorizontalScrollIndicator={false}
                     style={styles.productPhotosScroll}
                     contentContainerStyle={{ flexGrow: 1 }}
                   >
                  {/* Foto principal */}
                  {selectedProduct?.foto && (
                    <TouchableOpacity onPress={() => openZoomImage(selectedProduct.foto)}>
                      <Image
                        source={{ uri: selectedProduct.foto }}
                        style={styles.productPhotoHorizontal}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {/* Fotos adicionales */}
                  {selectedProduct?.foto1 && (
                    <TouchableOpacity onPress={() => openZoomImage(selectedProduct.foto1)}>
                      <Image
                        source={{ uri: selectedProduct.foto1 }}
                        style={styles.productPhotoHorizontal}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {selectedProduct?.foto2 && (
                    <TouchableOpacity onPress={() => openZoomImage(selectedProduct.foto2)}>
                      <Image
                        source={{ uri: selectedProduct.foto2 }}
                        style={styles.productPhotoHorizontal}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {selectedProduct?.foto3 && (
                    <TouchableOpacity onPress={() => openZoomImage(selectedProduct.foto3)}>
                      <Image
                        source={{ uri: selectedProduct.foto3 }}
                        style={styles.productPhotoHorizontal}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {selectedProduct?.foto4 && (
                    <TouchableOpacity onPress={() => openZoomImage(selectedProduct.foto4)}>
                      <Image
                        source={{ uri: selectedProduct.foto4 }}
                        style={styles.productPhotoHorizontal}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {selectedProduct?.foto5 && (
                    <TouchableOpacity onPress={() => openZoomImage(selectedProduct.foto5)}>
                      <Image
                        source={{ uri: selectedProduct.foto5 }}
                        style={styles.productPhotoHorizontal}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                  {selectedProduct?.foto6 && (
                    <TouchableOpacity onPress={() => openZoomImage(selectedProduct.foto6)}>
                      <Image
                        source={{ uri: selectedProduct.foto6 }}
                         style={styles.productPhotoHorizontal}
                         resizeMode="contain"
                       />
                     </TouchableOpacity>
                    )}
                    {/* DESCRIPCIÓN COMO ÚLTIMA FOTO */}
                      {(selectedProduct?.descripcion || selectedProduct?.descripcionEn) && (
                         <View style={styles.productDescriptionCard}>
                           <Text style={styles.productDescriptionTitle}>
                             {t('productDescription')}
                           </Text>
                           <ScrollView nestedScrollEnabled>
                             <Text style={styles.productDescriptionText}>
                               {i18n.language === 'en' 
                                 ? (selectedProduct.descripcionEn || selectedProduct.descripcion)
                                 : (selectedProduct.descripcion || selectedProduct.descripcionEn)}
                             </Text>
                           </ScrollView>
                         </View>
                       )}
                   </ScrollView>
                   <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSecondary]}
                      onPress={() => {
                        if (!canCompareProducts()) {
                          setShowPaywall(true);
                          return;
                        }
                        setProductToCompare(selectedProduct);
                        const otherProducts = products.filter(p => 
                          p.id !== selectedProduct?.id && 
                          p.categoria === selectedProduct?.categoria
                        );
                        setComparisonProducts(otherProducts.slice(0, 5));
                        setShowComparisonModal(true);
                      }}
                    >
                       <Text style={styles.actionButtonSecondaryText}>
                          {t('compareProductsBtn')}
                        </Text>
                      </TouchableOpacity>
                      <LinearGradient
                        colors={[COLORS.SECONDARY, COLORS.ACCENT]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButtonPrimary}
                      >
                        <TouchableOpacity
                          onPress={() => setShowAgentModal(true)}
                        >
                          <Text style={styles.actionButtonPrimaryText}>
                            {t('buyNowBtn')}
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                   </View>
             </View>
          </View>
        </View>
      </Modal>



      {/* MODAL DE COMPARACIÓN */}
      <Modal
        visible={showComparisonModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowComparisonModal(false);
          setSelectedComparisonProduct(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowComparisonModal(false);
              setSelectedComparisonProduct(null);
            }}
          />
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedComparisonProduct ? t('productComparison') : t('selectProductToCompare')}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowComparisonModal(false);
                setSelectedComparisonProduct(null);
              }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {!selectedComparisonProduct ? (
                <View>
                  {comparisonProducts.map((product) => (
                     <TouchableOpacity
                       key={product.id || product.nombre}
                       style={styles.productCard}
                       onPress={() => setSelectedComparisonProduct(product)}
                     >
                       <View style={styles.productInfo}>
                         <Text style={styles.productName}>{product.nombre}</Text>
                         <Text style={styles.productPrice}>{formatPrice(product.precio ?? 0)}</Text>
                       </View>
                     </TouchableOpacity>
                   ))}
                </View>
              ) : (
                <View style={styles.comparisonContainer}>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonTitle}>{productToCompare?.nombre}</Text>
                    <Text style={styles.comparisonPrice}>{formatPrice(productToCompare?.precio || 0)}</Text>
                    <Text style={styles.comparisonDetail}>{t('ratingLabel')}: {productToCompare?.rating}</Text>
                    <Text style={styles.comparisonDetail}>{t('salesLabel')}: {productToCompare?.ventas}</Text>
                    <Text style={styles.comparisonDetail}>{t('categoryLabel')}: {productToCompare?.categoria}</Text>
                    <Text style={styles.comparisonDetail}>{t('brandLabel')}: {productToCompare?.marca}</Text>
                    {productToCompare?.foto && (
                      <Image source={{ uri: productToCompare.foto }} style={styles.comparisonImage} />
                    )}
                  </View>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonTitle}>{selectedComparisonProduct.nombre}</Text>
                    <Text style={styles.comparisonPrice}>{formatPrice(selectedComparisonProduct.precio ?? 0)}</Text>
                    <Text style={styles.comparisonDetail}>{t('ratingLabel')}: {selectedComparisonProduct.rating}</Text>
                    <Text style={styles.comparisonDetail}>{t('salesLabel')}: {selectedComparisonProduct.ventas}</Text>
                    <Text style={styles.comparisonDetail}>{t('categoryLabel')}: {selectedComparisonProduct.categoria}</Text>
                    <Text style={styles.comparisonDetail}>{t('brandLabel')}: {selectedComparisonProduct.marca}</Text>
                    {selectedComparisonProduct.foto && (
                      <Image source={{ uri: selectedComparisonProduct.foto }} style={styles.comparisonImage} />
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DE ZOOM DE IMAGEN */}
      <Modal
        visible={!!zoomImage}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomImage(null)}
      >
        <View style={styles.zoomModalOverlay}>
          <TouchableOpacity
            style={styles.zoomModalBackdrop}
            activeOpacity={1}
            onPress={() => setZoomImage(null)}
          />
          <View style={styles.zoomModalContent}>
            <TouchableOpacity
              style={styles.zoomCloseButton}
              onPress={() => setZoomImage(null)}
            >
              <Text style={styles.zoomCloseText}>✕</Text>
            </TouchableOpacity>
            {zoomImage && (
              <Image
                source={{ uri: zoomImage }}
                style={styles.zoomImage}
                resizeMode="contain"
              />
            )}
          </View>
</View>
      </Modal>

       <PaywallModal
         visible={showPaywall}
         onClose={() => setShowPaywall(false)}
       />

    </View>
  );
}

const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: COLORS.BACKGROUND
   },
   searchContainer: {
     paddingHorizontal: 20,
     paddingVertical: 16,
     backgroundColor: COLORS.BACKGROUND,
     borderBottomWidth: 1,
     borderBottomColor: COLORS.BORDER_LIGHT,
   },
   searchInputContainer: {
     position: 'relative',
   },
   searchInput: {
     backgroundColor: COLORS.CARD_BG,
     borderRadius: 12,
     paddingHorizontal: 16,
     paddingVertical: 14,
     paddingRight: 50,
     fontSize: 16,
     color: COLORS.TEXT_PRIMARY,
     borderWidth: 1,
     borderColor: COLORS.BORDER,
   },
   searchIcon: {
     position: 'absolute',
     right: 16,
     top: 14,
   },
   topProductsButton: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
     paddingVertical: 12,
     paddingHorizontal: 16,
     backgroundColor: COLORS.CARD_BG,
     borderRadius: 12,
     marginTop: 12,
     borderWidth: 1,
     borderColor: COLORS.BORDER,
   },
   topProductsButtonActive: {
     backgroundColor: COLORS.PRIMARY,
     borderColor: COLORS.PRIMARY,
   },
   topProductsText: {
     fontSize: 14,
     fontWeight: '600',
     color: COLORS.TEXT_SECONDARY,
   },
   topProductsTextActive: {
     color: COLORS.BACKGROUND,
   },
   compareButtonModal: {
     backgroundColor: COLORS.PRIMARY,
     paddingVertical: 12,
     paddingHorizontal: 20,
     borderRadius: 8,
     marginHorizontal: 20,
     marginVertical: 10,
     alignItems: 'center',
   },
   compareButtonText: {
     color: COLORS.BACKGROUND,
     fontSize: 16,
     fontWeight: 'bold',
   },
   paywallOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0,0,0,0.8)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   paywallContainer: {
     backgroundColor: COLORS.CARD_BG,
     borderRadius: 20,
     padding: 24,
     margin: 20,
     maxWidth: 400,
     width: '90%',
   },
   paywallTitle: {
     fontSize: 24,
     fontWeight: '900',
     color: COLORS.TEXT_PRIMARY,
     textAlign: 'center',
     marginBottom: 8,
   },
   paywallSubtitle: {
     fontSize: 16,
     color: COLORS.TEXT_SECONDARY,
     textAlign: 'center',
     marginBottom: 20,
   },
   paywallBenefits: {
     maxHeight: 200,
     marginBottom: 24,
   },
   paywallBenefit: {
     fontSize: 14,
     color: COLORS.TEXT_PRIMARY,
     marginBottom: 8,
     lineHeight: 20,
   },
   paywallButton: {
     backgroundColor: COLORS.PRIMARY,
     paddingVertical: 16,
     borderRadius: 12,
     alignItems: 'center',
     marginBottom: 16,
   },
   paywallButtonText: {
     color: COLORS.BACKGROUND,
     fontSize: 16,
     fontWeight: '900',
   },
   paywallClose: {
     alignItems: 'center',
     paddingVertical: 8,
   },
   paywallCloseText: {
     color: COLORS.TEXT_TERTIARY,
     fontSize: 14,
   },
  
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  headerImage: {
    opacity: 0.25,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
   tagline: {
     fontSize: 14,
     color: COLORS.TEXT_SECONDARY,
     marginTop: 4,
   },
   gradientBarContainer: {
     height: 6,
     width: '100%',
   },
   gradientBar: {
     height: '100%',
     borderRadius: 2,
   },
  subBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
  },
  subBannerGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 40,
  },
  
   content: { flex: 1, flexDirection: 'row' },
    sidebar: { width: 50, backgroundColor: COLORS.BACKGROUND, borderRightWidth: 1, borderRightColor: COLORS.BORDER_LIGHT },
   catItem: { paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#111' },
   catItemActive: { backgroundColor: COLORS.BORDER_LIGHT, borderLeftWidth: 3, borderLeftColor: COLORS.PRIMARY },
   catIcon: { fontSize: 22, marginBottom: 4 },
   catText: { fontSize: 9, color: COLORS.TEXT_TERTIARY, textAlign: 'center', fontWeight: '700' },
   catTextActive: { color: COLORS.PRIMARY, fontWeight: '900' },
   catCount: { fontSize: 8, color: COLORS.TEXT_DARK, marginTop: 2 },
   productsArea: { flex: 1, paddingHorizontal: 12 },
   
   // BOTÓN DE BÚSQUEDA EN HEADER
   searchButtonHeader: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: 'rgba(0, 212, 170, 0.15)',
     justifyContent: 'center',
     alignItems: 'center',
     borderWidth: 1,
     borderColor: COLORS.PRIMARY,
   },
  
  // HEADER CON ETIQUETA
  productHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.BORDER_LIGHT, 
    marginBottom: 12 
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  categoryTitle: { fontSize: 20, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  
  // ESTILOS DE BÚSQUEDA PREMIUM
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceSeparator: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 18,
  },
  searchButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearSearchButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  clearSearchText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },
  applySearchButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applySearchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  priceInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    zIndex: 1,
  },
  // ESTILOS DE BÚSQUEDA PREMIUM
  
  // ETIQUETA PREMIUM
  brandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.4)',
    gap: 6,
  },
  brandTagIcon: {
    fontSize: 16,
  },
  brandTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066FF',
  },
  
  productCount: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: '700' },
  
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  favHeartBtn: {
    paddingTop: 2,
  },
  favHeartIcon: {
    fontSize: 22,
  },

  // SORT BAR
  sortBar: { marginBottom: 6, height: 34 },
  sortBarContent: { paddingHorizontal: 2, paddingBottom: 0, gap: 6, flexDirection: 'row', alignItems: 'center' },
  sortChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    height: 28, justifyContent: 'center',
  },
  sortChipActive: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
  sortChipText: { fontSize: 10, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  sortChipTextActive: { color: '#000' },

  // PRODUCT META ROW
  productMetaRow: { flexDirection: 'row', gap: 4, marginBottom: 4, flexWrap: 'nowrap', alignItems: 'center' },
  productBrandChip: {
    fontSize: 9, fontWeight: '800', color: COLORS.PRIMARY,
    backgroundColor: 'rgba(0,212,170,0.1)', paddingHorizontal: 6,
    paddingVertical: 1, borderRadius: 4, overflow: 'hidden',
  },
  productCatChip: {
    fontSize: 9, fontWeight: '700', color: '#666',
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 6,
    paddingVertical: 1, borderRadius: 4, overflow: 'hidden',
  },
  heartBtn: {
    marginLeft: 'auto' as any,
    padding: 2,
  },
  heartIcon: {
    fontSize: 16,
    opacity: 0.4,
  },
  heartIconActive: {
    opacity: 1,
  },

  // PRICE + RATING ROW
  priceRatingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: 'rgba(255,215,0,0.12)', paddingHorizontal: 5,
    paddingVertical: 2, borderRadius: 6,
  },
  ratingPillStar: { fontSize: 9, color: '#FFD700' },
  ratingPillValue: { fontSize: 9, fontWeight: '800', color: '#FFD700' },

  // EMPTY STATE
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, textAlign: 'center' },

  // LOADING
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingDot: { width: 40, height: 4, borderRadius: 2, marginBottom: 16 },
  
  // CHIP DE MARCA SELECCIONADA
  selectedBrandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 8,
  },
  selectedBrandText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.BACKGROUND,
  },
  clearBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BACKGROUND,
  },
  
  loadingText: { fontSize: 14, color: COLORS.TEXT_TERTIARY, textAlign: 'center', marginTop: 30, fontWeight: '600' },
  
  // TARJETAS
  productCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  productCardHighlighted: { 
    borderColor: COLORS.PRIMARY, 
    borderWidth: 2,
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
  badgeText: { fontSize: 11, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: 0.5 },
  imageBox: { 
    backgroundColor: '#222', 
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    overflow: 'hidden',
    padding: 0,
  },
  productImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: { padding: 20 },
  productName: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY, lineHeight: 24 },
  productPrice: { fontSize: 28, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  starsRow: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 18, color: '#FFD700' },
  starHalf: { fontSize: 18, color: '#FFD700', opacity: 0.5 },
  starEmpty: { fontSize: 18, color: '#333' },
  ratingValue: { fontSize: 16, fontWeight: '800', color: '#FFD700' },
  salesText: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: '600', marginBottom: 16 },
  buyBtn: { 
    marginTop: 8,
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.6)',
  },
  buyText: { fontSize: 15, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: 0.5 },
  
  // MODAL DE MARCAS - PREMIUM
  brandModalBox: { 
    backgroundColor: '#141414',
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
  brandModalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingTop: 60,
  },
  brandModalTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY,
  },
  brandModalSub: { 
    fontSize: 15, 
    color: COLORS.TEXT_SECONDARY, 
    marginTop: 6,
    fontWeight: '600',
  },
  brandScroll: { 
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  // SEARCH MODAL
  searchModalBox: {
    backgroundColor: '#141414',
    width: '92%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  searchSubtitle: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  searchModalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brandItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.CARD_BG_DARK,
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
  },
  brandItemSelected: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    borderColor: COLORS.PRIMARY,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  brandNameSelected: {
    color: COLORS.PRIMARY,
  },
  brandCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT_TERTIARY,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  brandCheck: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.PRIMARY,
  },
  
  // FAVORITO
  favoriteBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  favoriteBtnText: { fontSize: 18 },

  // MODAL DE BÚSQUEDA — overlay propio centrado
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // MODAL DE AGENTES
  modalOverlay: { 
    flex: 1, 
    backgroundColor: '#141414',
    justifyContent: 'flex-end',
  },
  modalBackdrop: { flex: 1, backgroundColor: COLORS.OVERLAY },
  modalBox: {
    position: 'absolute',
    top: '2%',
    left: 10,
    right: 10,
    bottom: '2%',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  modalContent: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  modalSub: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginTop: 4 },
  modalClose: { fontSize: 28, color: COLORS.TEXT_SECONDARY },
  agentScroll: { paddingHorizontal: 20 },
  agentItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.CARD_BG_DARK,
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  agentLogoBox: { width: 40, height: 40, marginRight: 10, backgroundColor: COLORS.BACKGROUND, borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  agentLogo: { width: '100%', height: '100%' },
  agentEmoji: { fontSize: 24 },
  agentName: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  agentArrow: { fontSize: 20, color: COLORS.PRIMARY, fontWeight: '700', marginLeft: 8 },
  
  // MODAL DE FOTOS DEL PRODUCTO
  productModalBox: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 0 : 30,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 0,
    overflow: 'hidden',
  },
  productInfoModal: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productPriceModal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00d4aa',
  },
  createAlertButton: {
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00d4aa',
  },
  createAlertText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00d4aa',
  },
  ratingContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingValueModal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  salesTextModal: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  productPhotosScroll: {
    flex: 1,
    backgroundColor: '#000',
  },
  productPhotoLarge: {
    width: '100%',
    height: '85%',
    borderRadius: 0,
    backgroundColor: COLORS.BACKGROUND,
  },
  productPhotoHorizontal: {
    width: 340,
    height: 340,
    backgroundColor: '#000',
    marginRight: 0,
  },
  productDescriptionCard: {
    width: 340,
    height: 340,
    padding: 16,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 0,
  },
  productDescriptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#00d4aa',
    marginBottom: 12,
  },
  productDescriptionText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 20,
  },
  viewAgentsButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewAgentsGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
   viewAgentsText: {
     fontSize: 16,
     fontWeight: '900',
     color: COLORS.TEXT_PRIMARY,
   },
   comparisonContainer: {
     flexDirection: 'row',
     justifyContent: 'space-between',
   },
   comparisonItem: {
     flex: 1,
     padding: 16,
     margin: 8,
     backgroundColor: COLORS.CARD_BG_DARK,
     borderRadius: 12,
     borderWidth: 1,
     borderColor: COLORS.BORDER,
   },
   comparisonTitle: {
     fontSize: 16,
     fontWeight: '800',
     color: COLORS.TEXT_PRIMARY,
     marginBottom: 8,
   },
   comparisonPrice: {
     fontSize: 20,
     fontWeight: '900',
     color: COLORS.PRIMARY,
     marginBottom: 8,
   },
   comparisonDetail: {
     fontSize: 14,
     color: COLORS.TEXT_SECONDARY,
     marginBottom: 4,
   },
   comparisonImage: {
     width: '100%',
      height: 150,
      borderRadius: 8,
      marginTop: 8,
    },
   catItemLocked: {
    opacity: 0.6,
  },
  catTextLocked: {
    color: COLORS.TEXT_TERTIARY,
  },
  lockIcon: {
    position: 'absolute',
    right: 5,
    top: 5,
    fontSize: 12,
  },
  miniSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG_DARK,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  miniSearchInput: {
    flex: 1,
    fontSize: 10,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  miniSearchIcon: {
    marginLeft: 2,
  },
  actionButtonsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  actionButtonPrimary: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  actionButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.PRIMARY,
  },
  actionButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  actionButtonPremium: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  premiumGradient: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.BACKGROUND,
  },
  zoomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  zoomModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  zoomCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    padding: 10,
  },
  zoomCloseText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  zoomImage: {
    width: '100%',
    height: '80%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  paginationButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  paginationTextActive: {
    color: '#000',
  },
  brandTagLocked: {
    opacity: 0.6,
    borderColor: COLORS.ACCENT,
  },
  brandTagTextLocked: {
    color: COLORS.TEXT_TERTIARY,
  },
  lockIconSmall: {
    fontSize: 10,
    marginLeft: 2,
  },
 });