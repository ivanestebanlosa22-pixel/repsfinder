import { Tabs } from 'expo-router';
import { Text, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

function Emoji({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 22 }}>
      {children}
    </Text>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#00e5b0',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            height: Platform.OS === 'android' ? 90 : 62 + insets.bottom,
            paddingBottom: Platform.OS === 'android' ? 25 : insets.bottom + 10,
            paddingTop: 8,
            backgroundColor: '#0f0f0f',
            borderTopColor: '#1a1a1a',
            borderTopWidth: 1,
            elevation: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
          sceneStyle: { backgroundColor: 'transparent' }
        }}
      >
        <Tabs.Screen
          name="descubrir"
          options={{
            title: t('tabDiscover'),
            tabBarIcon: () => <Emoji>🏠</Emoji>,
          }}
        />
        <Tabs.Screen
          name="agentes"
          options={{
            title: t('tabAgents'),
            tabBarIcon: () => <Emoji>👥</Emoji>,
          }}
        />
        <Tabs.Screen
          name="validar"
          options={{
            title: t('tabValidate'),
            tabBarIcon: () => <Emoji>✅</Emoji>,
          }}
        />
        <Tabs.Screen
          name="top-tiendas"
          options={{
            title: t('tabStores'),
            tabBarIcon: () => <Emoji>🛍️</Emoji>,
          }}
        />
        <Tabs.Screen
          name="aprender"
          options={{
            title: t('tabLearn'),
            tabBarIcon: () => <Emoji>📚</Emoji>,
          }}
        />
      </Tabs>
    </View>
  );
}
