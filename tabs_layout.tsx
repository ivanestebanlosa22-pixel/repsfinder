import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useAppSettings } from '../../AppSettingsContext';

export default function TabLayout() {
  const { t } = useAppSettings();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00e5b0',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderTopColor: '#111',
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="agents"
        options={{
          title: t.agents,
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="validate"
        options={{
          title: t.validate,
          tabBarIcon: ({ color }) => <TabBarIcon name="check-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t.community,
          tabBarIcon: ({ color }) => <TabBarIcon name="video" color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t.learn,
          tabBarIcon: ({ color }) => <TabBarIcon name="book-open" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ name, color }: { name: string; color: string }) {
  const icons: { [key: string]: string } = {
    'home': '🏠',
    'users': '👥',
    'check-circle': '✓',
    'video': '📹',
    'book-open': '📚',
  };

  return (
    <span style={{ fontSize: 22 }}>{icons[name] || '•'}</span>
  );
}
