import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { SettingsButton } from '../../components/SettingsButton';

// GOOGLE SHEETS CONFIG - PESTAÑA "AGENTS"
const SHEET_ID = '1YZmhCC4rBmGpv-IoIvjB8oMV6kVCgOpK4-1rDBa0Ha8';
const SHEET_NAME = 'AGENTS'; // Pestaña de agentes completos
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

interface Agent {
  name: string;
  register: string;
  productLink: string;
  logo: string;
  description: string;
  reputation: string;
  commission: string;
  shipping: string;
  qc: string;
  founded: string;
  pros: string;
  cons: string;
  mostrar: string;
}

export default function AgentsScreen() {
  const { t, currency } = useAppSettings();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  useEffect(() => {
    loadAgentsFromSheet();
  }, []);

  const loadAgentsFromSheet = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const text = await response.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;

      const loadedAgents: Agent[] = [];

      // Iterar desde la fila 1 (skip header)
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i]?.c || [];

        // Solo agregar si "mostrar" es "si"
        if (cells[12]?.v?.toLowerCase() === 'si') {
          loadedAgents.push({
            name: cells[0]?.v || '',
            register: cells[1]?.v || '',
            productLink: cells[2]?.v || '',
            logo: cells[3]?.v || 'https://via.placeholder.com/100',
            description: cells[4]?.v || '',
            reputation: cells[5]?.v || '',
            commission: cells[6]?.v || '',
            shipping: cells[7]?.v || '',
            qc: cells[8]?.v || '',
            founded: cells[9]?.v || '',
            pros: cells[10]?.v || '',
            cons: cells[11]?.v || '',
            mostrar: cells[12]?.v || '',
          });
        }
      }

      setAgents(loadedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const openURL = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
    }
  };

  const toggleAgent = (name: string) => {
    setExpandedAgent(expandedAgent === name ? null : name);
  };

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    if (filter === 'featured') return agent.reputation.includes('Muy buena');
    if (filter === 'budget') return agent.commission.includes('Baja');
    if (filter === 'premium') return agent.commission.includes('Media') || agent.commission.includes('Alta');
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <AnimatedBackground />

      {/* HEADER PREMIUM CON BANNER ESTANDARIZADO */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 15 }]}>
        <View>
          <Text style={styles.logo}>{t.appName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
        </View>
        <SettingsButton />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: statusBarHeight + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t.agentsTitle}</Text>
          <Text style={styles.heroSubtitle}>{t.agentsSubtitle}</Text>
          {!loading && (
            <Text style={styles.agentCount}>
              {filteredAgents.length} {t.agentsCount}
            </Text>
          )}
        </View>

        {/* FILTROS */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'featured', 'budget', 'premium'].map(filterType => (
              <TouchableOpacity
                key={filterType}
                style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
                onPress={() => setFilter(filterType)}
              >
                <Text style={[styles.filterText, filter === filterType && styles.filterTextActive]}>
                  {t[`agentsFilter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}` as keyof typeof t]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LOADING STATE */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00e5b0" />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        ) : (
          <>
            {/* LISTA DE AGENTES */}
            {filteredAgents.map((agent, index) => {
              const isExpanded = expandedAgent === agent.name;

              return (
                <View key={index} style={styles.agentCard}>
                  <TouchableOpacity
                    style={styles.agentHeader}
                    onPress={() => toggleAgent(agent.name)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: agent.logo }}
                      style={styles.agentLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.agentInfo}>
                      <Text style={styles.agentName}>{agent.name}</Text>
                      <Text style={styles.agentDescription} numberOfLines={2}>
                        {agent.description}
                      </Text>
                      <View style={styles.agentMeta}>
                        <Text style={styles.agentMetaText}>
                          {agent.reputation}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.agentDetails}>
                      {/* DATOS CLAVE */}
                      <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>{t.agentFounded}</Text>
                          <Text style={styles.detailValue}>{agent.founded}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>{t.agentCommission}</Text>
                          <Text style={styles.detailValue}>{agent.commission}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>{t.agentShipping}</Text>
                          <Text style={styles.detailValue}>{agent.shipping}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>{t.agentQC}</Text>
                          <Text style={styles.detailValue}>{agent.qc}</Text>
                        </View>
                      </View>

                      {/* PROS Y CONS */}
                      {agent.pros && (
                        <View style={styles.prosConsSection}>
                          <Text style={styles.prosTitle}>✓ {t.agentPros}</Text>
                          <Text style={styles.prosText}>{agent.pros}</Text>
                        </View>
                      )}

                      {agent.cons && (
                        <View style={styles.prosConsSection}>
                          <Text style={styles.consTitle}>✗ {t.agentCons}</Text>
                          <Text style={styles.consText}>{agent.cons}</Text>
                        </View>
                      )}

                      {/* BOTONES DE ACCIÓN */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.registerButton]}
                          onPress={() => openURL(agent.register)}
                        >
                          <Text style={styles.actionButtonText}>
                            {t.agentRegisterAt} {agent.name}
                          </Text>
                        </TouchableOpacity>

                        {agent.productLink && (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.visitButton]}
                            onPress={() => openURL(agent.productLink)}
                          >
                            <Text style={styles.actionButtonTextSecondary}>
                              {t.agentVisitSite}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {filteredAgents.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No se encontraron agentes</Text>
              </View>
            )}
          </>
        )}

        {/* FOOTER CON BOTÓN LEGAL */}
        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>{t.footerCopy}</Text>
          <Text style={styles.footerSubtitle}>{t.footerRights}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  // HEADER
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
  logo: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: '#a0a0a0', marginTop: 2, fontWeight: '500' },

  // SCROLL
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Platform.OS === 'ios' ? 100 : 95 },

  // HERO
  heroSection: { paddingHorizontal: 20, marginBottom: 24 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 12, lineHeight: 38 },
  heroSubtitle: { fontSize: 16, color: '#a0a0a0', lineHeight: 24, fontWeight: '500' },
  agentCount: { fontSize: 14, color: '#00e5b0', marginTop: 8, fontWeight: '700' },

  // FILTROS
  filterContainer: { paddingHorizontal: 20, marginBottom: 24 },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterButtonActive: { backgroundColor: '#00e5b0', borderColor: '#00e5b0' },
  filterText: { fontSize: 14, fontWeight: '700', color: '#666' },
  filterTextActive: { color: '#000' },

  // LOADING
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, color: '#666', marginTop: 16 },

  // AGENT CARDS
  agentCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  agentLogo: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#fff', marginRight: 16 },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  agentDescription: { fontSize: 13, color: '#a0a0a0', marginBottom: 8, lineHeight: 18 },
  agentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  agentMetaText: { fontSize: 12, color: '#00e5b0', fontWeight: '600' },
  expandIcon: { fontSize: 20, color: '#666', fontWeight: '700', marginLeft: 12 },

  // AGENT DETAILS
  agentDetails: { borderTopWidth: 1, borderTopColor: '#111', padding: 16 },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10,
  },
  detailLabel: { fontSize: 11, color: '#666', fontWeight: '600', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#fff', fontWeight: '700' },

  // PROS/CONS
  prosConsSection: { marginBottom: 12 },
  prosTitle: { fontSize: 14, fontWeight: '800', color: '#4ade80', marginBottom: 6 },
  prosText: { fontSize: 13, color: '#ccc', lineHeight: 20 },
  consTitle: { fontSize: 14, fontWeight: '800', color: '#f87171', marginBottom: 6 },
  consText: { fontSize: 13, color: '#ccc', lineHeight: 20 },

  // ACTION BUTTONS
  actionButtons: { gap: 10, marginTop: 16 },
  actionButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  registerButton: { backgroundColor: '#00e5b0' },
  visitButton: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#00e5b0' },
  actionButtonText: { fontSize: 15, fontWeight: '800', color: '#000' },
  actionButtonTextSecondary: { fontSize: 15, fontWeight: '800', color: '#00e5b0' },

  // EMPTY STATE
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', fontWeight: '600' },

  // FOOTER
  footerSection: {
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  footerTitle: { fontSize: 14, color: '#00e5b0', fontWeight: '700', marginBottom: 4 },
  footerSubtitle: { fontSize: 12, color: '#666', fontWeight: '500' },

  bottomSpacer: { height: 20 },
});
