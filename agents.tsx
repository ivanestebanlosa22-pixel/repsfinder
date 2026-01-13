import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { useAppSettings } from '../../AppSettingsContext';
import SettingsButton from '../../components/SettingsButton';
import AnimatedBackground from '../../components/AnimatedBackground';

const AGENTS_DATA = [
  {
    id: 1,
    name: 'Mulebuy',
    logo: 'https://play-lh.googleusercontent.com/me8g4K2VHs3N83yTMrIrl3pbNeTGl7j1zWECI6l3NtGEfb1-hUyx2qv1Xuny70Tp-aA',
    rating: 4.7,
    reviews: '1,643',
    bonus: '🏆 #1 Recomendado 2025',
    registerUrl: 'https://mulebuy.com/register?ref=200642502',
    color: '#4FACFE',
    badge: '🏆 TOP 1',
    pros: [
      '🏆 Mejor agente del mercado 2025',
      '⚡ Procesamiento ultra rápido (24-48h)',
      '📸 Fotos QC HD gratuitas de alta calidad',
      '💰 Precios de envío muy competitivos',
      '🎯 Interfaz limpia en inglés completo',
      '🌍 Excelente para Europa (rutas libres de impuestos)',
      '⭐ 84% de reseñas 5 estrellas verificadas',
      '📱 Comunidad Discord y Reddit muy activa',
      '💎 60 días almacenamiento gratuito',
    ],
    cons: [
      'Historial más corto que agentes veteranos',
      'Ocasional confusión en estructura de tarifas para nuevos',
      'Algunas promociones con errores técnicos',
    ],
    shippingTime: '5-8 días (Express) / 10-15 días (Standard)',
    qcSuccess: '97%',
    shippingCost: '¥75-85/kg',
    commission: '5%',
    founded: '2022',
    trustpilot: '4.7/5',
    storage: '60 días gratis',
    recommendation: 'IDEAL PARA: Todos los usuarios. Balance perfecto precio/calidad/servicio.',
  },
  {
    id: 2,
    name: 'Superbuy',
    logo: 'https://play-lh.googleusercontent.com/w6hnKJbR0JHOloGbhPDrZixe9sGMkBmQVh5RcHYko2ahiHtMHaKV9zOmOCKsjbNZ1UI',
    rating: 4.7,
    reviews: '1,018',
    bonus: '💎 Agente Premium',
    registerUrl: 'https://www.superbuy.com/en/page/login?partnercode=Ey3NrI&type=register',
    color: '#667eea',
    badge: '👑 PREMIUM',
    pros: [
      '🏢 Agente más establecido (fundado 2012)',
      '⭐ 2+ millones de usuarios satisfechos',
      '🎨 Mejor interfaz del mercado',
      '📸 Fotos QC gratuitas de máxima calidad',
      '💳 Acepta PayPal + múltiples métodos',
      '🔄 Política de reembolso de diferencias automática',
      '🌍 90 días almacenamiento gratuito',
      '🛒 Soporta Xianyu (marketplace segunda mano)',
      '🏆 99% tasa de éxito en QC',
    ],
    cons: [
      '💰 Precios de envío más altos del mercado',
      'Reportes de sobrestimación de peso en algunos casos',
      'PayPal suspendido desde octubre 2024',
      'Pérdida de conversión 5-8% (alta)',
      'Restricciones en artículos réplica',
    ],
    shippingTime: '10-16 días',
    qcSuccess: '99%',
    shippingCost: '¥95-105/kg',
    commission: '0%',
    founded: '2012',
    trustpilot: '4.7/5',
    storage: '90 días gratis',
    recommendation: 'IDEAL PARA: Principiantes que valoran experiencia premium sobre precio.',
  },
  {
    id: 3,
    name: 'ACBuy',
    logo: 'https://play-lh.googleusercontent.com/fh1ZfpdJU9HTop5oWvO72o52bKDkYlXbxp87DkTdCn78eWX4-xYFVhyaCLMJ447p9g',
    rating: 4.7,
    reviews: '813',
    bonus: '🎯 Mejor Servicio',
    registerUrl: 'https://www.acbuy.com/login?loginStatus=register&code=UD3WIU',
    color: '#f093fb',
    badge: '🎯 SERVICIO',
    pros: [
      '👨‍💼 Servicio al cliente excepcional (92% 5 estrellas)',
      '📸 Fotos QC PRE-COMPRA únicas en el mercado',
      '⚡ Respuestas en minutos, no horas',
      '🛡️ Evaluación de riesgo de vendedores',
      '🎁 Seguro gratuito en envíos',
      '💬 Discord muy activo con mods serviciales',
      '📱 App móvil dedicada y funcional',
      '✅ 96% tasa de respuesta a reviews negativas',
      '🚀 Procesamiento ultra rápido',
    ],
    cons: [
      'Precios de envío a veces superiores a competidores',
      'Problemas ocasionales procesamiento de pagos',
      'Discrepancias en estimación de peso reportadas',
    ],
    shippingTime: '5-8 días (Express) / 10-15 días (Standard)',
    qcSuccess: '96%',
    shippingCost: '¥82-92/kg',
    commission: '5%',
    founded: '2020',
    trustpilot: '4.7/5',
    storage: '60 días gratis',
    recommendation: 'IDEAL PARA: Compradores que priorizan seguridad y soporte sobre precio.',
  },
  {
    id: 4,
    name: 'USFans',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6825a376b16be873d3c23e82/0x0.png',
    rating: 4.7,
    reviews: '443',
    bonus: '800€ bono registro',
    registerUrl: 'https://www.usfans.com/register?ref=RCGD5Y',
    color: '#00c9ff',
    badge: '🇺🇸 USA/EU',
    pros: [
      '🎯 Optimizado para mercado USA y Europa',
      '💰 Precios de envío muy competitivos',
      '📸 Fotos QC HD 360° de máxima calidad',
      '💳 Acepta PayPal (protección compradores)',
      '⚡ 7-9 días con opciones express',
      '💎 $800 en cupones para nuevos usuarios',
      '✅ 100% tasa de respuesta a reviews negativas',
      '🛡️ Verificaciones de seguridad 80.7-100/100',
      '📦 60 días almacenamiento gratuito',
    ],
    cons: [
      '🇫🇷 Envíos a Francia lentos y caros',
      '💰 Procesamiento de reembolsos lento (+2 semanas)',
      'Daños ocasionales en paquetes',
      'Sin función de favoritos',
    ],
    shippingTime: '7-9 días (Express) / 12-16 días (Standard)',
    qcSuccess: '97%',
    shippingCost: '¥78-88/kg',
    commission: '6%',
    founded: '2020',
    trustpilot: '4.7/5',
    storage: '60 días gratis',
    recommendation: 'IDEAL PARA: Compradores en USA y Europa (excepto Francia).',
  },
  {
    id: 5,
    name: 'LitBuy',
    logo: 'https://litbuy.net/favicon.ico',
    rating: 4.7,
    reviews: '90',
    bonus: '💰 40% OFF envío nuevos',
    registerUrl: 'https://litbuy.com/register?inviteCode=YBMHFG55L',
    color: '#fa709a',
    badge: '💰 PRECIO',
    pros: [
      '💰 PRECIOS MÁS BARATOS: hasta 4x menos que competencia',
      '🚀 Procesamiento ultra rápido (2 días para QC)',
      '📸 Fotos QC de alta calidad gratuitas',
      '⚡ Envíos rápidos: 6-11 días express',
      '💎 95% de reseñas 5 estrellas',
      '📱 App móvil funcional con QR scanning',
      '🎁 40% descuento en primer envío',
      '✅ Verificación seguridad: 100/100 GridinSoft',
      '💳 "Pack First, Pay Later" disponible',
    ],
    cons: [
      '❌ No responde a reseñas negativas en Trustpilot',
      '⚠️ Ausencia notable en Reddit (señal cautela)',
      '📊 Base de usuarios pequeña vs. líderes',
      '💸 Disputa de reembolso documentada',
      '🆕 Menos historial que competidores',
    ],
    shippingTime: '6-11 días (Express) / 12-18 días (Economic)',
    qcSuccess: '95%',
    shippingCost: '¥65-75/kg',
    commission: '4%',
    founded: '2021',
    trustpilot: '4.7/5',
    storage: '50 días gratis',
    recommendation: 'IDEAL PARA: Compradores enfocados en precio. Empezar con pedidos pequeños + PayPal.',
  },
  {
    id: 6,
    name: 'Oopbuy',
    logo: 'https://play-lh.googleusercontent.com/Xd2k3p7CXVEDP3OsbQW986WN-Jo3LAGGeL7iJIBHdAkdRdisugQUISqfbWPp060vHjx1',
    rating: 4.4,
    reviews: '517',
    bonus: 'Bono disponible',
    registerUrl: 'https://oopbuy.com/register?inviteCode=GH40R4J0O',
    color: '#ff6b6b',
    badge: '⚖️ BALANCE',
    pros: [
      '💎 90 días almacenamiento (el más generoso)',
      '📸 Fotos QC gratuitas 1-2 días',
      '💳 Acepta PayPal',
      '🌍 Múltiples líneas de envío (DHL, UPS, FedEx)',
      '🔄 Triangle shipping para rutas libres impuestos',
      '🛒 Soporta Taobao, 1688, Weidian, Tmall, JD',
      '⏰ Servicio al cliente 24/7',
      '💰 0% comisión en compras',
    ],
    cons: [
      '⚠️ REPORTES DE COSTOS OCULTOS/SORPRESA',
      '📦 Cálculo volumétrico puede triplicar costos',
      '⭐ 10% de reseñas son 1 estrella',
      '💬 Soporte por email lento (usar Discord)',
      '🚨 Algunas alegaciones de estafa',
      '⚠️ Verificar costos ANTES de comprometerse',
    ],
    shippingTime: '7-9 días (Express) / 11-16 días (Standard)',
    qcSuccess: '94%',
    shippingCost: '¥80-90/kg',
    commission: '6%',
    founded: '2021',
    trustpilot: '4.4/5',
    storage: '90 días gratis',
    recommendation: 'IDEAL PARA: Usuarios intermedios que comprenden cálculo volumétrico. Usar calculadora envío.',
  },
  {
    id: 7,
    name: 'CSSBuy',
    logo: 'https://www.cssbuy.com/favicon.ico',
    rating: 4.3,
    reviews: '586',
    bonus: 'Mejor tasa cambio',
    registerUrl: 'https://www.cssbuy.com/register?inviteCode=CHINESE2024',
    color: '#feca57',
    badge: '📦 HAULS',
    pros: [
      '💰 MEJOR PRECIO para hauls grandes (+5kg)',
      '💱 Mejor tasa de cambio del mercado (~3% vs 5-8%)',
      '🇪🇺 Rutas "Tariffless" libres impuestos para UE',
      '📦 €11/kg a Europa (imbatible)',
      '🏢 Almacén propio en Hangzhou',
      '💎 90 días almacenamiento gratuito',
      '🔧 SAL no cuenta peso volumétrico',
      '🏪 Soporte dropshipping y B2B',
      '👨‍💼 Veterano del mercado (desde 2011)',
    ],
    cons: [
      '💵 6% comisión sobre precio + envío doméstico',
      '📸 Fotos QC cuestan 1 RMB extra c/u (no gratis)',
      '🐢 Procesamiento lento (2-3 días extra)',
      '🎨 Interfaz anticuada y con bugs',
      '📊 Calculadora de envío inexacta (+$20-50 sorpresa)',
    ],
    shippingTime: '10-15 días (Tariffless) / 15-25 días (Economic)',
    qcSuccess: '95%',
    shippingCost: '¥70-80/kg',
    commission: '6%',
    founded: '2011',
    trustpilot: '4.3/5',
    storage: '90 días gratis',
    recommendation: 'IDEAL PARA: Hauls grandes (+5kg) a Europa. Ahorros compensan comisión 6%.',
  },
  {
    id: 8,
    name: 'CNFans',
    logo: 'https://s3-eu-west-1.amazonaws.com/tpd/logos/6417ff57d88ad4baa8407f63/0x0.png',
    rating: 4.2,
    reviews: '12,921',
    bonus: '140 bono de registro',
    registerUrl: 'https://cnfans.com/register?ref=5267649',
    color: '#ee5a6f',
    badge: '📊 VOLUMEN',
    pros: [
      '📊 MAYOR VOLUMEN: 13K reseñas, 50K pedidos/día',
      '🌍 200K+ clientes en 200+ países',
      '💰 0% comisión por servicio',
      '📸 Fotos QC HD gratuitas',
      '💎 90 días almacenamiento gratis',
      '💳 Múltiples métodos pago (PayPal, Stripe, Wise)',
      '🛒 Soporte completo: Taobao, Tmall, 1688, Weidian',
      '⭐ 74% reseñas 5 estrellas',
    ],
    cons: [
      '⚠️ PRECIOS ENVÍO FRECUENTEMENTE > PRODUCTO',
      '💸 "$100 por enviar zapatillas" reportado',
      '💬 Servicio al cliente inconsistente',
      '🔒 Reportes problemas acceso a cuentas',
      '⚖️ Resolución de disputas cuestionable',
      '⏱️ "Agentes tardan eternidad en responder"',
    ],
    shippingTime: '12-18 días',
    qcSuccess: '96%',
    shippingCost: '¥90-110/kg',
    commission: '0%',
    founded: '2019',
    trustpilot: '4.2/5',
    storage: '90 días gratis',
    recommendation: 'IDEAL PARA: Quien valora tranquilidad de millones de transacciones. Comparar costos envío antes.',
  },
  {
    id: 9,
    name: 'Sugargoo',
    logo: 'https://www.sugargoo.com/favicon.ico',
    rating: 3.8,
    reviews: '617',
    bonus: 'Cupones disponibles',
    registerUrl: 'https://www.sugargoo.com/index/user/register/invite/NTkwODU1.html',
    color: '#48c6ef',
    badge: '🔖 BUDGET',
    pros: [
      '💰 Opción económica para presupuestos ajustados',
      '📸 5 fotos QC gratuitas por artículo',
      '⏰ 100 días almacenamiento (el más largo)',
      '💳 25+ métodos de pago (PayPal, Klarna, etc.)',
      '🛒 Soporta Xianyu (marketplace segunda mano)',
      '🌍 ~20% cuota de mercado',
      '📱 Presencia activa en Reddit',
    ],
    cons: [
      '⚠️ RESTRICCIONES DE MARCA molestas (Balenciaga, Supreme)',
      '💸 CASO GRAVE: Usuario perdió $5,000 en pedido mayorista',
      '💰 15% tarifas de retiro del propio balance',
      '⭐ 17% reseñas 1 estrella',
      '🐢 Retrasos frecuentes (hasta 4 meses documentados)',
      '📦 Calidad de empaque cuestionada',
      '❌ EVITAR ABSOLUTAMENTE PARA MAYORISTAS',
    ],
    shippingTime: '8-15 días (Tax-Free) / 30-60 días (Maritime)',
    qcSuccess: '93%',
    shippingCost: '¥85-95/kg',
    commission: '5%',
    founded: '2020',
    trustpilot: '3.8/5',
    storage: '100 días gratis',
    recommendation: 'IDEAL PARA: Hauls pequeños/medianos de marcas NO restringidas. NUNCA mayoristas.',
  },
  {
    id: 10,
    name: 'Haloobuy',
    logo: 'https://haloobuy.com/favicon.ico',
    rating: 4.5,
    reviews: '1,200+',
    bonus: 'Bono bienvenida',
    registerUrl: 'https://www.haloobuy.com/register?inviteCode=HALO2025',
    color: '#a8edea',
    badge: '🆕 NUEVO',
    pros: [
      '🆕 Plataforma moderna y actualizada',
      '💰 Precios competitivos en envíos',
      '📸 Fotos QC gratuitas de calidad',
      '⚡ Procesamiento rápido de pedidos',
      '🛒 Soporta principales plataformas chinas',
      '💎 60 días almacenamiento gratuito',
      '📱 Interfaz limpia y fácil de usar',
    ],
    cons: [
      'Agente más reciente del mercado',
      'Menos reseñas que competidores establecidos',
      'Comunidad aún en crecimiento',
      'Historial limitado',
    ],
    shippingTime: '10-16 días',
    qcSuccess: '95%',
    shippingCost: '¥82-92/kg',
    commission: '5%',
    founded: '2023',
    trustpilot: '4.5/5',
    storage: '60 días gratis',
    recommendation: 'IDEAL PARA: Usuarios que buscan alternativas modernas y en crecimiento.',
  },
  {
    id: 11,
    name: 'Joyagoo',
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ee/a4/16/eea41644-dd37-7212-9eac-ce82b8512c5e/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/512x512bb.jpg',
    rating: 4.3,
    reviews: '3,200+',
    bonus: 'Bono disponible',
    registerUrl: 'https://joyagoo.com/register?ref=300768147',
    color: '#34e7e4',
    badge: '👟 STREET',
    pros: [
      '👟 Especializado en streetwear y reps',
      '💰 Buenos precios para pedidos pequeños',
      '📱 App móvil intuitiva y moderna',
      '⚡ Proceso de QC rápido',
      '📸 Fotos QC incluidas',
      '🎯 Enfoque en comunidad street',
    ],
    cons: [
      'Menos establecido que otros agentes',
      'Opciones de envío limitadas',
      'Soporte solo en horario asiático',
      'Comisiones variables según producto',
    ],
    shippingTime: '14-22 días',
    qcSuccess: '94%',
    shippingCost: '¥88/kg',
    commission: '5-8%',
    founded: '2021',
    trustpilot: '4.3/5',
    storage: '60 días gratis',
    recommendation: 'IDEAL PARA: Fans de streetwear y pedidos pequeños especializados.',
  },
  {
    id: 12,
    name: 'Hipobuy',
    logo: 'https://play-lh.googleusercontent.com/wVlXLNuLd1NFyct0v9tLwimELSNB4arK5-ivLFrZM_R8sd9OWOtAGlQ-G2iMXB9HmknWwl_fVLfdhSBIEeA_Ng',
    rating: 4.2,
    reviews: '2,100+',
    bonus: 'Bono disponible',
    registerUrl: 'https://hipobuy.com/register?inviteCode=YZKOGE9NE',
    color: '#b06ab3',
    badge: '⚡ RÁPIDO',
    pros: [
      '⚡ Plataforma rápida y moderna',
      '💰 Buenos precios en envíos',
      '💬 Soporte reactivo',
      '🎨 Interfaz limpia y actualizada',
      '📸 Fotos QC de calidad',
      '🚀 Tiempos de procesamiento competitivos',
    ],
    cons: [
      'Agente relativamente nuevo',
      'Menos opciones de rutas de envío',
      'Comunidad más pequeña',
      'Menos reseñas que líderes',
    ],
    shippingTime: '13-19 días',
    qcSuccess: '96%',
    shippingCost: '¥84/kg',
    commission: '5%',
    founded: '2022',
    trustpilot: '4.2/5',
    storage: '60 días gratis',
    recommendation: 'IDEAL PARA: Usuarios que valoran velocidad y modernidad.',
  },
];

export default function AgentsScreen() {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const { t } = useAppSettings();

  const handleRegister = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <AnimatedBackground />

      {/* HEADER FIJO */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 15 }]}>
        <View>
          <Text style={styles.logo}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>
        <SettingsButton />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: statusBarHeight + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.pageTitle}>Ranking 2025: Agentes Verificados</Text>
          <Text style={styles.pageSubtitle}>
            Análisis exhaustivo de 20,000+ reseñas • {AGENTS_DATA.length} agentes comparados
          </Text>
        </View>

        {AGENTS_DATA.map((agent, index) => (
          <View key={agent.id} style={styles.agentCard}>
            {/* BADGE RANKING */}
            {index < 10 && (
              <View style={[styles.rankingBadge, { backgroundColor: agent.color }]}>
                <Text style={styles.rankingText}>#{index + 1}</Text>
              </View>
            )}

            {/* HEADER DEL AGENTE */}
            <View style={styles.agentHeader}>
              <View style={styles.agentLogoContainer}>
                <Image 
                  source={{ uri: agent.logo }} 
                  style={styles.agentLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.agentHeaderInfo}>
                <Text style={styles.agentName}>{agent.name}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={styles.ratingText}>{agent.rating}/5</Text>
                  <Text style={styles.reviewsText}>({agent.reviews} reseñas)</Text>
                </View>
                <View style={[styles.bonusTag, { backgroundColor: agent.color }]}>
                  <Text style={styles.bonusText}>{agent.badge || agent.bonus}</Text>
                </View>
              </View>
            </View>

            {/* INFO CLAVE */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Fundado</Text>
                <Text style={styles.statValue}>{agent.founded}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Envío</Text>
                <Text style={[styles.statValue, { fontSize: 11 }]}>{agent.shippingTime}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Éxito QC</Text>
                <Text style={[styles.statValue, { color: '#00e5b0' }]}>{agent.qcSuccess}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Coste/kg</Text>
                <Text style={styles.statValue}>{agent.shippingCost}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Comisión</Text>
                <Text style={styles.statValue}>{agent.commission}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Almacén</Text>
                <Text style={[styles.statValue, { fontSize: 11 }]}>{agent.storage}</Text>
              </View>
            </View>

            {/* RECOMENDACIÓN */}
            {agent.recommendation && (
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationIcon}>💡</Text>
                <Text style={styles.recommendationText}>{agent.recommendation}</Text>
              </View>
            )}

            {/* PROS */}
            <View style={styles.prosSection}>
              <Text style={styles.sectionLabel}>✅ Ventajas</Text>
              {agent.pros.map((pro, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{pro}</Text>
                </View>
              ))}
            </View>

            {/* CONS */}
            <View style={styles.consSection}>
              <Text style={styles.sectionLabel}>⚠️ Desventajas</Text>
              {agent.cons.map((con, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={[
                    styles.listText,
                    con.includes('⚠️') && styles.warningText
                  ]}>{con}</Text>
                </View>
              ))}
            </View>

            {/* BOTÓN REGISTRO */}
            <TouchableOpacity 
              style={[styles.registerButton, { backgroundColor: agent.color }]}
              onPress={() => handleRegister(agent.registerUrl)}
            >
              <Text style={styles.registerButtonText}>
                🚀 Registrarse en {agent.name}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* BANNER INFORMATIVO FINAL */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>⚠️ Agentes a evitar en 2025</Text>
          <Text style={styles.infoBannerText}>
            • <Text style={styles.bold}>Kakobuy</Text> (2.7/5) - Múltiples alertas de estafas, score 45/100
          </Text>
          <Text style={styles.infoBannerText}>
            • <Text style={styles.bold}>Pandabuy</Text> (2.5/5) - Redada policial abril 2024, filtración 1.3M usuarios
          </Text>
          <Text style={styles.infoBannerText}>
            • <Text style={styles.bold}>Wegobuy</Text> (1.9/5) - Pérdidas de $4,000+ sin resolución
          </Text>
          <Text style={[styles.infoBannerText, { marginTop: 12, fontStyle: 'italic' }]}>
            ✅ Recomendación: Usar TOP 5 (Mulebuy, Superbuy, ACBuy, USFans, LitBuy)
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#00e5b0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 95,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    lineHeight: 18,
  },
  agentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    position: 'relative',
  },
  rankingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 1,
  },
  rankingText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
  agentHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  agentLogoContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  agentLogo: {
    width: 60,
    height: 60,
  },
  agentHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 50,
  },
  agentName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  star: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
  },
  bonusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bonusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: '#0f1419',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#00e5b0',
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 12,
    color: '#aaa',
    lineHeight: 17,
    fontWeight: '600',
  },
  prosSection: {
    marginBottom: 14,
  },
  consSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  listText: {
    fontSize: 12,
    color: '#aaa',
    flex: 1,
    lineHeight: 17,
  },
  warningText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  infoBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#1a0000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff000030',
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#fff',
  },
  bottomSpacer: {
    height: 20,
  },
});
