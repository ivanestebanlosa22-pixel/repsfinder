import { Stack } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../src/i18n';
import { AppSettingsProvider } from '../src/context/AppSettingsContext';
import { PremiumProvider } from '../src/context/PremiumContext';
import { SmartAlertsProvider } from '../src/context/SmartAlertsContext';
import { AIProvider } from '../src/context/AIContext';
import AnimatedBackground from '../src/components/AnimatedBackground';
import { supabase } from '../src/utils/supabase';
import OnboardingScreen from './onboarding';

Sentry.init({
  dsn: 'https://0df894bc3ae2fd19c977f0448be7442b@o4511503651373056.ingest.de.sentry.io/4511503654649936',
  enabled: !__DEV__,
  tracesSampleRate: 1.0,
  environment: 'production',
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const safetyNet = setTimeout(() => {
      if (!cancelled) {
        SplashScreen.hideAsync();
      }
    }, 10000);

    const init = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          await supabase.auth.signOut();
        }
      } catch {
        await supabase.auth.signOut();
      }

      try {
        const onboarded = await AsyncStorage.getItem('repsfinder_onboarded');
        if (!cancelled) {
          setShowOnboarding(onboarded !== 'true');
        }
      } catch {
        if (!cancelled) {
          setShowOnboarding(false);
        }
      } finally {
        if (!cancelled) {
          SplashScreen.hideAsync();
          clearTimeout(safetyNet);
        }
      }
    };

    init();
    return () => { cancelled = true; clearTimeout(safetyNet); };
  }, []);

  if (showOnboarding === null) {
    return null;
  }

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <I18nextProvider i18n={i18n}>
          <AppSettingsProvider>
            <PremiumProvider>
              <SmartAlertsProvider>
                <AIProvider>
                  <OnboardingScreen />
                </AIProvider>
              </SmartAlertsProvider>
            </PremiumProvider>
          </AppSettingsProvider>
        </I18nextProvider>
      </GestureHandlerRootView>
    );
  }

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
