import { Stack } from 'expo-router';
import { AppSettingsProvider } from '../contexts/AppSettingsContext';

export default function RootLayout() {
  return (
    <AppSettingsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="legal" options={{ headerShown: false }} />
      </Stack>
    </AppSettingsProvider>
  );
}
