import React, { useState, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';

export default function LegalScreen() {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const { t } = useTranslation();

  const LEGAL_SECTIONS = [
    { id: 'privacy', title: t('privacyTitle'), icon: '🔒' },
    { id: 'terms', title: t('termsTitle'), icon: '📜' },
    { id: 'affiliate', title: t('affiliateTitle'), icon: '💰' },
    { id: 'disclaimer', title: t('disclaimerTitle'), icon: '⚠️' },
    { id: 'cookies', title: t('cookiesTitle'), icon: '🍪' },
    { id: 'contact', title: t('contactTitle'), icon: '📧' },
  ];

  const renderContent = useMemo(() => {
    switch (selectedSection) {
      case 'privacy':
        return <PrivacyPolicy t={t} />;
      case 'terms':
        return <TermsConditions t={t} />;
      case 'affiliate':
        return <AffiliateDisclosure t={t} />;
      case 'disclaimer':
        return <ReplicaDisclaimer t={t} />;
      case 'cookies':
        return <CookiesPolicy t={t} />;
      case 'contact':
        return <LegalContact t={t} />;
      default:
        return null;
    }
  }, [selectedSection, t]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={[styles.header, { paddingTop: statusBarHeight + 20 }]}>
        {selectedSection ? (
          <TouchableOpacity onPress={() => setSelectedSection(null)}>
            <Text style={styles.backButton}>{t('legalBackButton')}</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.logo}>{t('legalTitle')}</Text>
            <Text style={styles.tagline}>{t('legalTagline')}</Text>
          </View>
        )}
      </View>

      {selectedSection ? (
        <ScrollView style={styles.contentContainer}>
          {renderContent}
        </ScrollView>
      ) : (
        <ScrollView style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>{t('legalMenuTitle')}</Text>
            <Text style={styles.menuSubtitle}>
              {t('legalMenuSubtitle')}
            </Text>
          </View>

          {LEGAL_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.menuItem}
              onPress={() => setSelectedSection(section.id)}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{section.icon}</Text>
                <Text style={styles.menuItemTitle}>{section.title}</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              {t('legalLastUpdate')}
            </Text>
            <Text style={styles.footerText}>
              {t('legalFooterRights')}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function PrivacyPolicy({ t }: { t: any }) {
  return (
    <View style={styles.document}>
      <Text style={styles.docTitle}>🔒 {t('privacyTitle')}</Text>
      <Text style={styles.docDate}>{t('legalLastUpdate')}</Text>

      <Text style={styles.sectionTitle}>{t('privacy1Title')}</Text>
      <Text style={styles.paragraph}>{t('privacy1Text')}</Text>
      <Text style={styles.listItem}>{t('privacy1Item1')}</Text>
      <Text style={styles.listItem}>{t('privacy1Item2')}</Text>
      <Text style={styles.listItem}>{t('privacy1Item3')}</Text>
      <Text style={styles.listItem}>{t('privacy1Item4')}</Text>
      <Text style={styles.listItem}>{t('privacy1Item5')}</Text>

      <Text style={styles.sectionTitle}>{t('privacy2Title')}</Text>
      <Text style={styles.listItem}>{t('privacy2Item1')}</Text>
      <Text style={styles.listItem}>{t('privacy2Item2')}</Text>
      <Text style={styles.listItem}>{t('privacy2Item3')}</Text>
      <Text style={styles.listItem}>{t('privacy2Item4')}</Text>
      <Text style={styles.listItem}>{t('privacy2Item5')}</Text>

      <Text style={styles.sectionTitle}>{t('privacy3Title')}</Text>
      <Text style={styles.paragraph}>{t('privacy3Text')}</Text>
      <Text style={styles.listItem}>{t('privacy3Item1')}</Text>
      <Text style={styles.listItem}>{t('privacy3Item2')}</Text>
      <Text style={styles.listItem}>{t('privacy3Item3')}</Text>

      <Text style={styles.sectionTitle}>{t('privacy4Title')}</Text>
      <Text style={styles.paragraph}>{t('privacy4Text')}</Text>
      <Text style={styles.listItem}>{t('privacy4Item1')}</Text>
      <Text style={styles.listItem}>{t('privacy4Item2')}</Text>
      <Text style={styles.listItem}>{t('privacy4Item3')}</Text>
      <Text style={styles.listItem}>{t('privacy4Item4')}</Text>
      <Text style={styles.listItem}>{t('privacy4Item5')}</Text>

      <Text style={styles.sectionTitle}>{t('privacy5Title')}</Text>
      <Text style={styles.paragraph}>{t('privacy5Text')}</Text>

      <Text style={styles.sectionTitle}>{t('privacy6Title')}</Text>
      <Text style={styles.paragraph}>{t('privacy6Text')}</Text>

      <Text style={styles.sectionTitle}>{t('privacy7Title')}</Text>
      <Text style={styles.paragraph}>{t('privacy7Text')}</Text>
      <Text style={styles.contactEmail}>{t('privacyEmail')}</Text>
    </View>
  );
}

function TermsConditions({ t }: { t: any }) {
  return (
    <View style={styles.document}>
      <Text style={styles.docTitle}>📜 {t('termsTitle')}</Text>
      <Text style={styles.docDate}>{t('legalLastUpdate')}</Text>

      <Text style={styles.sectionTitle}>{t('terms1Title')}</Text>
      <Text style={styles.paragraph}>{t('terms1Text')}</Text>

      <Text style={styles.sectionTitle}>{t('terms2Title')}</Text>
      <Text style={styles.paragraph}>{t('terms2Text')}</Text>

      <Text style={styles.sectionTitle}>{t('terms3Title')}</Text>
      <Text style={styles.paragraph}>{t('terms3Text')}</Text>
      <Text style={styles.listItem}>{t('terms3Item1')}</Text>
      <Text style={styles.listItem}>{t('terms3Item2')}</Text>
      <Text style={styles.listItem}>{t('terms3Item3')}</Text>
      <Text style={styles.listItem}>{t('terms3Item4')}</Text>
      <Text style={styles.listItem}>{t('terms3Item5')}</Text>

      <Text style={styles.sectionTitle}>{t('terms4Title')}</Text>
      <Text style={styles.paragraph}>{t('terms4Text')}</Text>
      <Text style={styles.listItem}>{t('terms4Item1')}</Text>
      <Text style={styles.listItem}>{t('terms4Item2')}</Text>
      <Text style={styles.listItem}>{t('terms4Item3')}</Text>
      <Text style={styles.listItem}>{t('terms4Item4')}</Text>
      <Text style={styles.listItem}>{t('terms4Item5')}</Text>
      <Text style={styles.listItem}>{t('terms4Item6')}</Text>

      <Text style={styles.sectionTitle}>{t('terms5Title')}</Text>
      <Text style={styles.paragraph}>{t('terms5Text')}</Text>
      <Text style={styles.listItem}>{t('terms5Item1')}</Text>
      <Text style={styles.listItem}>{t('terms5Item2')}</Text>
      <Text style={styles.listItem}>{t('terms5Item3')}</Text>
      <Text style={styles.listItem}>{t('terms5Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('terms6Title')}</Text>
      <Text style={styles.paragraph}>{t('terms6Text')}</Text>
      <Text style={styles.listItem}>{t('terms6Item1')}</Text>
      <Text style={styles.listItem}>{t('terms6Item2')}</Text>
      <Text style={styles.listItem}>{t('terms6Item3')}</Text>
      <Text style={styles.listItem}>{t('terms6Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('terms7Title')}</Text>
      <Text style={styles.warningBox}>{t('terms7WarningBox')}</Text>
      <Text style={styles.paragraph}>{t('terms7Text')}</Text>
      <Text style={styles.listItem}>{t('terms7Item1')}</Text>
      <Text style={styles.listItem}>{t('terms7Item2')}</Text>
      <Text style={styles.listItem}>{t('terms7Item3')}</Text>
      <Text style={styles.listItem}>{t('terms7Item4')}</Text>
      <Text style={styles.listItem}>{t('terms7Item5')}</Text>
      <Text style={styles.listItem}>{t('terms7Item6')}</Text>

      <Text style={styles.sectionTitle}>{t('terms8Title')}</Text>
      <Text style={styles.paragraph}>{t('terms8Text')}</Text>
      <Text style={styles.listItem}>{t('terms8Item1')}</Text>
      <Text style={styles.listItem}>{t('terms8Item2')}</Text>
      <Text style={styles.listItem}>{t('terms8Item3')}</Text>
      <Text style={styles.listItem}>{t('terms8Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('terms9Title')}</Text>
      <Text style={styles.paragraph}>{t('terms9Text')}</Text>
      <Text style={styles.listItem}>{t('terms9Item1')}</Text>
      <Text style={styles.listItem}>{t('terms9Item2')}</Text>
      <Text style={styles.listItem}>{t('terms9Item3')}</Text>
      <Text style={styles.listItem}>{t('terms9Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('terms10Title')}</Text>
      <Text style={styles.paragraph}>{t('terms10Text')}</Text>
    </View>
  );
}

function AffiliateDisclosure({ t }: { t: any }) {
  return (
    <View style={styles.document}>
      <Text style={styles.docTitle}>💰 {t('affiliateTitle')}</Text>
      <Text style={styles.docDate}>{t('legalLastUpdate')}</Text>

      <Text style={styles.sectionTitle}>{t('affiliate1Title')}</Text>
      <Text style={styles.paragraph}>{t('affiliate1Text')}</Text>

      <Text style={styles.sectionTitle}>{t('affiliate2Title')}</Text>
      <Text style={styles.listItem}>{t('affiliate2Item1')}</Text>
      <Text style={styles.listItem}>{t('affiliate2Item2')}</Text>
      <Text style={styles.listItem}>{t('affiliate2Item3')}</Text>
      <Text style={styles.listItem}>{t('affiliate2Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('affiliate3Title')}</Text>
      <Text style={styles.paragraph}>{t('affiliate3Text')}</Text>
      <Text style={styles.listItem}>{t('affiliate3Item1')}</Text>
      <Text style={styles.listItem}>{t('affiliate3Item2')}</Text>
      <Text style={styles.listItem}>{t('affiliate3Item3')}</Text>
      <Text style={styles.listItem}>{t('affiliate3Item4')}</Text>
      <Text style={styles.listItem}>{t('affiliate3Item5')}</Text>
      <Text style={styles.listItem}>{t('affiliate3Item6')}</Text>

      <Text style={styles.sectionTitle}>{t('affiliate4Title')}</Text>
      <Text style={styles.warningBox}>{t('affiliate4WarningBox')}</Text>
      <Text style={styles.paragraph}>{t('affiliate4Text')}</Text>
      <Text style={styles.listItem}>{t('affiliate4Item1')}</Text>
      <Text style={styles.listItem}>{t('affiliate4Item2')}</Text>
      <Text style={styles.listItem}>{t('affiliate4Item3')}</Text>
      <Text style={styles.listItem}>{t('affiliate4Item4')}</Text>
      <Text style={styles.listItem}>{t('affiliate4Item5')}</Text>

      <Text style={styles.sectionTitle}>{t('affiliate5Title')}</Text>
      <Text style={styles.paragraph}>{t('affiliate5Text')}</Text>

      <Text style={styles.sectionTitle}>{t('affiliate6Title')}</Text>
      <Text style={styles.paragraph}>{t('affiliate6Text')}</Text>
    </View>
  );
}

function ReplicaDisclaimer({ t }: { t: any }) {
  return (
    <View style={styles.document}>
      <Text style={styles.docTitle}>⚠️ {t('disclaimerTitle')}</Text>
      <Text style={styles.docDate}>{t('legalLastUpdate')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer1Title')}</Text>
      <Text style={styles.dangerBox}>{t('disclaimer1DangerBox')}</Text>
      <Text style={styles.paragraph}>{t('disclaimer1Text')}</Text>
      <Text style={styles.listItem}>{t('disclaimer1Item1')}</Text>
      <Text style={styles.listItem}>{t('disclaimer1Item2')}</Text>
      <Text style={styles.listItem}>{t('disclaimer1Item3')}</Text>
      <Text style={styles.listItem}>{t('disclaimer1Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer2Title')}</Text>
      <Text style={styles.paragraph}>{t('disclaimer2Text')}</Text>
      <Text style={styles.listItem}>{t('disclaimer2Item1')}</Text>
      <Text style={styles.listItem}>{t('disclaimer2Item2')}</Text>
      <Text style={styles.listItem}>{t('disclaimer2Item3')}</Text>
      <Text style={styles.listItem}>{t('disclaimer2Item4')}</Text>
      <Text style={styles.listItem}>{t('disclaimer2Item5')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer3Title')}</Text>
      <Text style={styles.warningBox}>{t('disclaimer3WarningBox')}</Text>
      <Text style={styles.listItem}>{t('disclaimer3Item1')}</Text>
      <Text style={styles.listItem}>{t('disclaimer3Item2')}</Text>
      <Text style={styles.listItem}>{t('disclaimer3Item3')}</Text>
      <Text style={styles.listItem}>{t('disclaimer3Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer4Title')}</Text>
      <Text style={styles.paragraph}>{t('disclaimer4Text')}</Text>
      <Text style={styles.listItem}>{t('disclaimer4Item1')}</Text>
      <Text style={styles.listItem}>{t('disclaimer4Item2')}</Text>
      <Text style={styles.listItem}>{t('disclaimer4Item3')}</Text>
      <Text style={styles.listItem}>{t('disclaimer4Item4')}</Text>
      <Text style={styles.listItem}>{t('disclaimer4Item5')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer5Title')}</Text>
      <Text style={styles.paragraph}>{t('disclaimer5Text')}</Text>
      <Text style={styles.listItem}>{t('disclaimer5Item1')}</Text>
      <Text style={styles.listItem}>{t('disclaimer5Item2')}</Text>
      <Text style={styles.listItem}>{t('disclaimer5Item3')}</Text>
      <Text style={styles.listItem}>{t('disclaimer5Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer6Title')}</Text>
      <Text style={styles.paragraph}>{t('disclaimer6Text')}</Text>
      <Text style={styles.listItem}>{t('disclaimer6Item1')}</Text>
      <Text style={styles.listItem}>{t('disclaimer6Item2')}</Text>
      <Text style={styles.listItem}>{t('disclaimer6Item3')}</Text>
      <Text style={styles.listItem}>{t('disclaimer6Item4')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer7Title')}</Text>
      <Text style={styles.warningBox}>{t('disclaimer7WarningBox')}</Text>

      <Text style={styles.sectionTitle}>{t('disclaimer8Title')}</Text>
      <Text style={styles.paragraph}>{t('disclaimer8Text')}</Text>
    </View>
  );
}

function CookiesPolicy({ t }: { t: any }) {
  return (
    <View style={styles.document}>
      <Text style={styles.docTitle}>🍪 {t('cookiesTitle')}</Text>
      <Text style={styles.docDate}>{t('legalLastUpdate')}</Text>

      <Text style={styles.sectionTitle}>{t('cookiesWhatTitle')}</Text>
      <Text style={styles.paragraph}>{t('cookiesWhatText')}</Text>

      <Text style={styles.sectionTitle}>{t('cookiesWeUseTitle')}</Text>
      
      <Text style={styles.cookieType}>{t('cookiesEssentialType')}</Text>
      <Text style={styles.listItem}>{t('cookiesEssentialItem1')}</Text>
      <Text style={styles.listItem}>{t('cookiesEssentialItem2')}</Text>
      <Text style={styles.listItem}>{t('cookiesEssentialItem3')}</Text>

      <Text style={styles.cookieType}>{t('cookiesAnalyticsType')}</Text>
      <Text style={styles.listItem}>{t('cookiesAnalyticsItem1')}</Text>
      <Text style={styles.listItem}>{t('cookiesAnalyticsItem2')}</Text>
      <Text style={styles.listItem}>{t('cookiesAnalyticsItem3')}</Text>

      <Text style={styles.cookieType}>{t('cookiesAffiliateType')}</Text>
      <Text style={styles.listItem}>{t('cookiesAffiliateItem1')}</Text>
      <Text style={styles.listItem}>{t('cookiesAffiliateItem2')}</Text>
      <Text style={styles.listItem}>{t('cookiesAffiliateItem3')}</Text>

      <Text style={styles.sectionTitle}>{t('cookiesManageTitle')}</Text>
      <Text style={styles.paragraph}>{t('cookiesManageText')}</Text>

      <Text style={styles.sectionTitle}>{t('cookiesThirdPartyTitle')}</Text>
      <Text style={styles.paragraph}>{t('cookiesThirdPartyText')}</Text>
      <Text style={styles.listItem}>{t('cookiesThirdPartyItem1')}</Text>
      <Text style={styles.listItem}>{t('cookiesThirdPartyItem2')}</Text>
      <Text style={styles.listItem}>{t('cookiesThirdPartyItem3')}</Text>
    </View>
  );
}

function LegalContact({ t }: { t: any }) {
  return (
    <View style={styles.document}>
      <Text style={styles.docTitle}>📧 {t('contactTitle')}</Text>

      <Text style={styles.sectionTitle}>{t('contactCompanyTitle')}</Text>
      <Text style={styles.paragraph}>{t('contactCompanyName')}</Text>
      <Text style={styles.paragraph}>{t('contactCompanyLocation')}</Text>
      <Text style={styles.paragraph}>{t('contactCompanyEmail')}</Text>

      <Text style={styles.sectionTitle}>{t('contactGeneralTitle')}</Text>
      <Text style={styles.paragraph}>{t('contactGeneralText')}</Text>
      <Text style={styles.contactEmail}>{t('contactGeneralEmail')}</Text>

      <Text style={styles.sectionTitle}>{t('contactPrivacyTitle')}</Text>
      <Text style={styles.paragraph}>{t('contactPrivacyText')}</Text>
      <Text style={styles.contactEmail}>{t('contactPrivacyEmail')}</Text>

      <Text style={styles.sectionTitle}>{t('contactReportTitle')}</Text>
      <Text style={styles.paragraph}>{t('contactReportText')}</Text>
      <Text style={styles.contactEmail}>{t('contactReportEmail')}</Text>

      <Text style={styles.sectionTitle}>{t('contactResponseTitle')}</Text>
      <Text style={styles.paragraph}>{t('contactResponseText')}</Text>

      <TouchableOpacity 
        style={styles.contactButton}
        onPress={() => Linking.openURL('mailto:legal@repsfinder.com')}
      >
        <Text style={styles.contactButtonText}>{t('contactButtonText')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#111' },
  backButton: { fontSize: 16, color: '#00e5b0', fontWeight: '700' },
  logo: { fontSize: 32, fontWeight: '900', color: '#00e5b0', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#888', marginTop: 4, fontWeight: '500' },
  menuContainer: { flex: 1, padding: 20 },
  menuHeader: { marginBottom: 30 },
  menuTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 8 },
  menuSubtitle: { fontSize: 14, color: '#888', lineHeight: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 18, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuItemIcon: { fontSize: 24 },
  menuItemTitle: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
  menuItemArrow: { fontSize: 20, color: '#00e5b0', fontWeight: '700' },
  footerInfo: { marginTop: 30, marginBottom: 20, alignItems: 'center', gap: 8 },
  footerText: { fontSize: 12, color: '#666', textAlign: 'center' },
  contentContainer: { flex: 1 },
  document: { padding: 20, paddingBottom: 40 },
  docTitle: { fontSize: 26, fontWeight: '900', color: '#00e5b0', marginBottom: 8 },
  docDate: { fontSize: 12, color: '#888', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 24, marginBottom: 12 },
  paragraph: { fontSize: 14, color: '#ddd', lineHeight: 22, marginBottom: 12 },
  listItem: { fontSize: 14, color: '#ddd', lineHeight: 22, marginLeft: 8, marginBottom: 8 },
  warningBox: { backgroundColor: 'rgba(255, 165, 0, 0.15)', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#ffa500', fontSize: 14, color: '#ffa500', lineHeight: 20, marginVertical: 16, fontWeight: '700' },
  dangerBox: { backgroundColor: 'rgba(255, 0, 0, 0.15)', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#ff0000', fontSize: 14, color: '#ff0000', lineHeight: 20, marginVertical: 16, fontWeight: '700' },
  contactEmail: { fontSize: 16, color: '#00e5b0', fontWeight: '700', marginTop: 8, marginBottom: 16 },
  cookieType: { fontSize: 16, fontWeight: '700', color: '#00e5b0', marginTop: 16, marginBottom: 8 },
  contactButton: { backgroundColor: '#00e5b0', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  contactButtonText: { fontSize: 16, fontWeight: '800', color: '#000' },
});
