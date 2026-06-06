import { Stack } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { PremiumProvider } from './context/PremiumContext';
import { SmartAlertsProvider } from './context/SmartAlertsContext';
import { AIProvider } from './context/AIContext';
import AnimatedBackground from './components/AnimatedBackground';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <AnimatedBackground />
        <I18nextProvider i18n={i18n}>
          <AppSettingsProvider>
             <PremiumProvider>
               <SmartAlertsProvider>
                 <AIProvider>
                   <Stack
                     screenOptions={{
                       headerShown: false,
                       contentStyle: { backgroundColor: 'transparent' }
                     }}
                   />
                 </AIProvider>
               </SmartAlertsProvider>
             </PremiumProvider>
          </AppSettingsProvider>
        </I18nextProvider>
      </View>
    </GestureHandlerRootView>
  );
}
