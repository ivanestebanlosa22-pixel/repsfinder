import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSettings } from '../AppSettingsContext';
import SettingsButton from '../components/SettingsButton';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LegalScreen() {
  const router = useRouter();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const { t } = useAppSettings();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <AnimatedBackground />

      <View style={[styles.header, { paddingTop: statusBarHeight + 15 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.logo}>{t.appName || 'RepsFinder'}</Text>
            <Text style={styles.tagline}>{t.tagline}</Text>
          </View>
        </View>
        <SettingsButton />
      </View>

      <ScrollView style={[styles.content, { marginTop: statusBarHeight + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.pageTitle}>{t.learnLegal}</Text>
          <Text style={styles.pageSubtitle}>{t.learnLegalSubtitle}</Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>📋 Información General</Text>
          <Text style={styles.cardText}>
            RepsFinder es una plataforma informativa que conecta usuarios con agentes de compras chinos verificados. No vendemos productos directamente ni gestionamos transacciones.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>⚖️ Aviso Legal</Text>
          <Text style={styles.cardText}>
            Esta aplicación proporciona información sobre agentes de compras y productos disponibles a través de plataformas chinas como Weidian, Taobao y 1688.
          </Text>
          <Text style={styles.cardText}>
            RepsFinder NO fabrica, vende ni distribuye productos. Somos un intermediario informativo entre compradores y agentes verificados.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>🔒 Privacidad</Text>
          <Text style={styles.cardText}>
            No recopilamos información personal identificable. Los datos de uso son anónimos y se utilizan únicamente para mejorar la experiencia del usuario.
          </Text>
          <Text style={styles.cardText}>
            Las compras se realizan directamente con los agentes seleccionados. Cada agente tiene sus propias políticas de privacidad.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>💳 Transacciones</Text>
          <Text style={styles.cardText}>
            Todas las transacciones se realizan directamente entre el usuario y el agente seleccionado. RepsFinder no procesa pagos ni almacena información financiera.
          </Text>
          <Text style={styles.cardText}>
            Los precios mostrados son referenciales y pueden variar. Consulta siempre con el agente antes de realizar una compra.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>📦 Envíos y Aduanas</Text>
          <Text style={styles.cardText}>
            Los envíos son responsabilidad del agente seleccionado. RepsFinder no se hace responsable de retrasos, pérdidas o incautaciones aduaneras.
          </Text>
          <Text style={styles.cardText}>
            Es responsabilidad del usuario conocer y cumplir las leyes de importación de su país.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>🔗 Enlaces de Afiliados</Text>
          <Text style={styles.cardText}>
            RepsFinder utiliza enlaces de afiliados para los agentes mostrados. Esto significa que podemos recibir una comisión si realizas una compra a través de nuestros enlaces.
          </Text>
          <Text style={styles.cardText}>
            Las comisiones no afectan el precio final que pagas. Son pagadas por el agente, no por ti.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>⚠️ Descargo de Responsabilidad</Text>
          <Text style={styles.cardText}>
            RepsFinder proporciona información "tal cual" sin garantías de ningún tipo. No garantizamos la exactitud, completitud o actualidad de la información.
          </Text>
          <Text style={styles.cardText}>
            No nos hacemos responsables de:
          </Text>
          <Text style={styles.bulletText}>• Calidad de los productos recibidos</Text>
          <Text style={styles.bulletText}>• Problemas con agentes o vendedores</Text>
          <Text style={styles.bulletText}>• Pérdidas financieras</Text>
          <Text style={styles.bulletText}>• Problemas legales derivados de importaciones</Text>
          <Text style={styles.bulletText}>• Infracciones de propiedad intelectual</Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>📜 Propiedad Intelectual</Text>
          <Text style={styles.cardText}>
            Muchos productos mostrados pueden ser réplicas de marcas registradas. RepsFinder no respalda ni promueve la violación de derechos de propiedad intelectual.
          </Text>
          <Text style={styles.cardText}>
            Es responsabilidad del usuario conocer y cumplir las leyes de propiedad intelectual de su jurisdicción.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>🌍 Jurisdicción</Text>
          <Text style={styles.cardText}>
            Este servicio se proporciona a nivel internacional. Los usuarios deben cumplir con las leyes aplicables en su país de residencia.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>📧 Contacto</Text>
          <Text style={styles.cardText}>
            Para consultas sobre esta política legal, puedes contactarnos a través de los canales de soporte de la aplicación.
          </Text>
        </View>

        <View style={styles.legalCard}>
          <Text style={styles.cardTitle}>🔄 Actualizaciones</Text>
          <Text style={styles.cardText}>
            Nos reservamos el derecho de actualizar estos términos en cualquier momento. El uso continuado de la aplicación implica la aceptación de los términos actualizados.
          </Text>
          <Text style={styles.cardText}>
            Última actualización: Enero 2025
          </Text>
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomText}>
            Al usar RepsFinder, aceptas estos términos y condiciones.
          </Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#00e5b0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  backIcon: { fontSize: 28, color: '#00e5b0', fontWeight: '900' },
  logo: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#888', marginTop: 4, fontWeight: '500' },
  content: { flex: 1 },
  section: { marginBottom: 20, paddingHorizontal: 20 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#666' },
  legalCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#0a0a0a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1a1a1a' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#00e5b0', marginBottom: 12 },
  cardText: { fontSize: 14, color: '#ccc', lineHeight: 22, marginBottom: 12 },
  bulletText: { fontSize: 14, color: '#aaa', lineHeight: 22, paddingLeft: 16, marginBottom: 4 },
  bottomCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#0a0a0a', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: '#00e5b0', alignItems: 'center' },
  bottomText: { fontSize: 14, color: '#fff', fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  versionText: { fontSize: 12, color: '#666', fontWeight: '600' },
  bottomSpacer: { height: Platform.OS === 'ios' ? 40 : 20 },
});
