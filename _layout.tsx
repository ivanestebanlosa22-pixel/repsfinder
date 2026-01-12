import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useAppSettings } from '../../AppSettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Emoji({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 22,
        marginBottom: Platform.OS === 'ios' ? 2 : 0,
      }}
    >
      {children}
    </Text>
  );
}

export default function TabsLayout() {
  const { t, colors } = useAppSettings();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animationEnabled: true,

        // TEXTO (no emojis)
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,

        tabBarStyle: {
          position: 'absolute',
          height: 62,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 10 : 8,
          bottom: insets.bottom > 0 ? insets.bottom - 6 : 4,
          left: 8,
          right: 8,
          borderRadius: 14,

          // 🔴 CLAVE: fondo oscuro FIJO (como antes)
          backgroundColor: '#0f0f0f',

          borderTopWidth: 0,
          elevation: 6,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabHome,
          tabBarIcon: () => <Emoji>🏠</Emoji>,
        }}
      />

      <Tabs.Screen
        name="agents"
        options={{
          title: t.tabAgents,
          tabBarIcon: () => <Emoji>👥</Emoji>,
        }}
      />

      <Tabs.Screen
        name="validate"
        options={{
          title: t.tabValidate,
          tabBarIcon: () => <Emoji>✅</Emoji>,
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: t.tabCommunity,
          tabBarIcon: () => <Emoji>💬</Emoji>,
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: t.tabLearn,
          tabBarIcon: () => <Emoji>📚</Emoji>,
        }}
      />
    </Tabs>
  );
}
