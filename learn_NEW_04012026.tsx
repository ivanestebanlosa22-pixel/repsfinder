import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { useAppSettings } from '../../AppSettingsContext';

const LEVELS = [
  { id: 'beginner', name: 'Principiante', nameEn: 'Beginner', icon: '🌱', color: '#4ade80' },
  { id: 'intermediate', name: 'Intermedio', nameEn: 'Intermediate', icon: '🔥', color: '#fbbf24' },
  { id: 'expert', name: 'Experto', nameEn: 'Expert', icon: '🏆', color: '#f87171' },
];

const GUIDES = [
  {
    id: 1,
    level: 'beginner',
    title: '¿Qué son las réplicas?',
    titleEn: 'What are replicas?',
    description: 'Entiende la diferencia entre reps, fakes y retails',
    descriptionEn: 'Understand the difference between reps, fakes and retails',
    duration: '5 min',
    icon: '📖',
    sections: [
      { title: 'Definición', content: 'Las réplicas son productos fabricados para imitar productos de marca, con diferentes niveles de calidad.' },
      { title: 'Tipos de calidad', content: 'Budget (¥50-150), Mid-tier (¥150-350), High-tier (¥350+)' },
      { title: 'Diferencias clave', content: 'Reps: Alta calidad. Fakes: Baja calidad. Retail: Original de marca.' },
    ],
  },
  {
    id: 2,
    level: 'beginner',
    title: 'Batches explicados',
    titleEn: 'Batches explained',
    description: 'M Batch, LJR, H12, VT - Qué significan',
    descriptionEn: 'M Batch, LJR, H12, VT - What they mean',
    duration: '8 min',
    icon: '🏭',
    sections: [
      { title: 'M Batch', content: 'Mejor para Dunks. Relación calidad-precio imbatible. Precio: ¥300-350. Popularidad: ⭐⭐⭐⭐⭐' },
      { title: 'LJR Batch', content: 'Rey de Jordan 1. Calidad premium. Precio: ¥450-550. Popularidad: ⭐⭐⭐⭐⭐' },
      { title: 'H12 Batch', content: 'Especialista en Jordan 4. Materiales top. Precio: ¥400-500. Popularidad: ⭐⭐⭐⭐' },
      { title: 'VT Batch', content: 'Budget confiable. Buen punto de entrada. Precio: ¥200-280. Popularidad: ⭐⭐⭐' },
      { title: 'PK Batch', content: 'Yeezy specialist. Boost perfecto. Precio: ¥380-480. Popularidad: ⭐⭐⭐⭐' },
    ],
  },
  {
    id: 3,
    level: 'beginner',
    title: 'Tu primer agente',
    titleEn: 'Your first agent',
    description: 'Registro y primer pedido paso a paso',
    descriptionEn: 'Registration and first order step by step',
    duration: '12 min',
    icon: '🚀',
    link: 'https://www.usfans.com/register?ref=RCGD5Y',
    sections: [
      { title: 'Paso 1: Registro', content: 'Ve a USfans.com → Sign Up → Email + contraseña → Verificar email' },
      { title: 'Paso 2: Depositar', content: 'Dashboard → Recharge → PayPal/Tarjeta → Mínimo $10' },
      { title: 'Paso 3: Buscar', content: 'Pega link de Weidian/Taobao → Select size → Add to cart' },
      { title: 'Paso 4: Comprar', content: 'Cart → Submit order → Espera 3-5 días llegada a warehouse' },
      { title: 'Paso 5: QC Photos', content: 'Warehouse → View photos → Approve o Request exchange' },
    ],
  },
];

const GLOSSARY = [
  { term: 'GL', meaning: 'Green Light - Aprobar las QC photos y proceder con envío' },
  { term: 'RL', meaning: 'Red Light - Rechazar y pedir cambio por defectos' },
  { term: 'QC', meaning: 'Quality Check - Fotos del producto en warehouse antes de enviar' },
  { term: 'W2C', meaning: 'Where To Cop - Dónde comprar, pedir link' },
  { term: 'GP', meaning: 'Guinea Pig - Ser el primero en comprar un producto nuevo' },
  { term: 'B&S', meaning: 'Bait & Switch - Mostrar un batch y enviar otro peor' },
  { term: 'Haul', meaning: 'Paquete con múltiples items comprados' },
  { term: 'Warehouse', meaning: 'Almacén del agente donde llegan tus compras antes de enviar' },
  { term: 'Batch', meaning: 'Lote de producción de una fábrica específica' },
  { term: '1:1', meaning: 'Réplica idéntica al retail (raramente 100% cierto)' },
  { term: 'Budget', meaning: 'Réplica económica, calidad básica (¥50-150)' },
  { term: 'Mid-tier', meaning: 'Calidad media, buen equilibrio (¥150-350)' },
  { term: 'High-tier', meaning: 'Máxima calidad disponible (¥350+)' },
];

const QUICK_LINKS = [
  { title: 'USFans', url: 'https://www.usfans.com/register?ref=RCGD5Y', icon: '🔗' },
  { title: 'Shipping Calculator', url: 'https://www.chinabuyhub.com/tools.html', icon: '📦' },
  { title: 'Agent Comparison', url: 'https://www.chinabuyhub.com/tools.html', icon: '⚖️' },
];

export default function LearnScreen() {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const { t, language } = useAppSettings();
  
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [completedGuides, setCompletedGuides] = useState<number[]>([]);

  const filteredGuides = GUIDES.filter(g => g.level === selectedLevel);
  const progress = (completedGuides.length / GUIDES.length) * 100;

  const toggleGuide = (id: number) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const markComplete = (id: number) => {
    if (!completedGuides.includes(id)) {
      setCompletedGuides([...completedGuides, id]);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={[styles.header, { paddingTop: statusBarHeight + 20 }]}>
        <Text style={styles.logo}>RepsFinder</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      <View style={[styles.progressContainer, { marginTop: statusBarHeight + 90 }]}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>{t.learnProgress}</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedGuides.length} {language === 'es' ? 'de' : 'of'} {GUIDES.length} {t.learnCompleted}
        </Text>
      </View>

      <View style={styles.levelSelector}>
        {LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelButton,
              selectedLevel === level.id && styles.levelButtonActive,
              selectedLevel === level.id && { borderColor: level.color }
            ]}
            onPress={() => setSelectedLevel(level.id)}
          >
            <Text style={styles.levelIcon}>{level.icon}</Text>
            <Text style={[
              styles.levelText,
              selectedLevel === level.id && { color: level.color }
            ]}>
              {language === 'es' ? level.name : level.nameEn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showGlossary ? (
          <View style={styles.glossaryContainer}>
            <Text style={styles.sectionTitle}>{t.learnGlossary}</Text>
            <Text style={styles.sectionSubtitle}>{t.learnGlossarySubtitle}</Text>
            {GLOSSARY.map((item, index) => (
              <View key={index} style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>{item.term}</Text>
                <Text style={styles.glossaryMeaning}>{item.meaning}</Text>
              </View>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.quickLinks}>
              <Text style={styles.quickLinksTitle}>{t.learnUsefulLinks}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {QUICK_LINKS.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickLinkCard}
                    onPress={() => openLink(link.url)}
                  >
                    <Text style={styles.quickLinkIcon}>{link.icon}</Text>
                    <Text style={styles.quickLinkText}>{link.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.guidesContainer}>
              {filteredGuides.map(guide => {
                const isExpanded = expandedGuide === guide.id;
                const isCompleted = completedGuides.includes(guide.id);

                return (
                  <View key={guide.id} style={styles.guideCard}>
                    <TouchableOpacity
                      style={styles.guideHeader}
                      onPress={() => toggleGuide(guide.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.guideLeft}>
                        <Text style={styles.guideIcon}>{guide.icon}</Text>
                        <View style={styles.guideInfo}>
                          <Text style={styles.guideTitle}>{language === 'es' ? guide.title : guide.titleEn}</Text>
                          <Text style={styles.guideDescription}>{language === 'es' ? guide.description : guide.descriptionEn}</Text>
                          <View style={styles.guideMeta}>
                            <Text style={styles.guideDuration}>⏱️ {guide.duration}</Text>
                            {isCompleted && (
                              <View style={styles.completedBadge}>
                                <Text style={styles.completedText}>{t.learnCompleteButton}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      <Text style={styles.expandIcon}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.guideContent}>
                        {guide.link && (
                          <TouchableOpacity
                            style={styles.externalLinkButton}
                            onPress={() => openLink(guide.link!)}
                          >
                            <Text style={styles.externalLinkIcon}>🔗</Text>
                            <Text style={styles.externalLinkText}>{t.learnExternalGuide}</Text>
                          </TouchableOpacity>
                        )}

                        {guide.sections.map((section, index) => (
                          <View key={index} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionContent}>{section.content}</Text>
                          </View>
                        ))}

                        <TouchableOpacity
                          style={[
                            styles.completeButton,
                            isCompleted && styles.completeButtonDone
                          ]}
                          onPress={() => markComplete(guide.id)}
                          disabled={isCompleted}
                        >
                          <Text style={styles.completeButtonText}>
                            {isCompleted ? t.learnCompleteButton : t.learnMarkComplete}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.glossaryToggleButton}
          onPress={() => setShowGlossary(!showGlossary)}
        >
          <Text style={styles.glossaryToggleIcon}>
            {showGlossary ? '📖' : '📚'}
          </Text>
          <Text style={styles.glossaryToggleText}>
            {showGlossary ? t.learnViewGuides : t.learnViewGlossary}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#000', paddingHorizontal: 20, paddingBottom: 12, zIndex: 10, borderBottomWidth: 1, borderBottomColor: '#111' },
  logo: { fontSize: 32, fontWeight: '900', color: '#00e5b0', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#888', marginTop: 4, fontWeight: '500' },
  progressContainer: { position: 'absolute', left: 20, right: 20, zIndex: 9, backgroundColor: '#0a0a0a', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1a1a1a' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  progressPercent: { fontSize: 16, fontWeight: '900', color: '#00e5b0' },
  progressBarBg: { height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#00e5b0', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#666', fontWeight: '600' },
  levelSelector: { position: 'absolute', top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 190 : 234, left: 20, right: 20, flexDirection: 'row', gap: 10, zIndex: 8 },
  levelButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: '#0a0a0a', borderWidth: 2, borderColor: '#1a1a1a' },
  levelButtonActive: { backgroundColor: '#111' },
  levelIcon: { fontSize: 18 },
  levelText: { fontSize: 13, fontWeight: '800', color: '#666' },
  content: { flex: 1, marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 250 : 294 },
  quickLinks: { paddingHorizontal: 20, marginBottom: 20 },
  quickLinksTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 12 },
  quickLinkCard: { backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 12, padding: 16, marginRight: 12, alignItems: 'center', width: 140 },
  quickLinkIcon: { fontSize: 32, marginBottom: 8 },
  quickLinkText: { fontSize: 12, fontWeight: '700', color: '#00e5b0', textAlign: 'center' },
  guidesContainer: { paddingHorizontal: 20, gap: 16 },
  guideCard: { backgroundColor: '#0a0a0a', borderRadius: 16, borderWidth: 1, borderColor: '#1a1a1a', overflow: 'hidden' },
  guideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  guideLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  guideIcon: { fontSize: 32 },
  guideInfo: { flex: 1 },
  guideTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  guideDescription: { fontSize: 14, color: '#aaa', marginBottom: 8 },
  guideMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideDuration: { fontSize: 12, color: '#666', fontWeight: '600' },
  completedBadge: { backgroundColor: '#1a3a1a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  completedText: { fontSize: 11, fontWeight: '700', color: '#4ade80' },
  expandIcon: { fontSize: 18, color: '#666', fontWeight: '700' },
  guideContent: { borderTopWidth: 1, borderTopColor: '#111', padding: 16 },
  externalLinkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#111', paddingVertical: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#00e5b0' },
  externalLinkIcon: { fontSize: 16 },
  externalLinkText: { fontSize: 14, fontWeight: '700', color: '#00e5b0' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#00e5b0', marginBottom: 8 },
  sectionContent: { fontSize: 14, color: '#ccc', lineHeight: 22 },
  completeButton: { backgroundColor: '#00e5b0', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  completeButtonDone: { backgroundColor: '#1a3a1a', borderWidth: 2, borderColor: '#4ade80' },
  completeButtonText: { fontSize: 15, fontWeight: '800', color: '#000', textAlign: 'center' },
  glossaryContainer: { paddingHorizontal: 20 },
  sectionSubtitle: { fontSize: 14, color: '#888', marginBottom: 20, fontWeight: '500' },
  glossaryItem: { backgroundColor: '#0a0a0a', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1a1a1a' },
  glossaryTerm: { fontSize: 16, fontWeight: '800', color: '#00e5b0', marginBottom: 6 },
  glossaryMeaning: { fontSize: 14, color: '#ccc', lineHeight: 20 },
  glossaryToggleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#0a0a0a', marginHorizontal: 20, marginTop: 24, marginBottom: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1a1a1a' },
  glossaryToggleIcon: { fontSize: 24 },
  glossaryToggleText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  bottomSpacer: { height: Platform.OS === 'ios' ? 100 : 95 },
});
