import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

const AZUL = '#1e3a5f';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, opacity: color === '#94a3b8' ? 0.5 : 1 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AZUL,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 80 : 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: AZUL },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tráfico',
          headerTitle: '🎓 ITTux · Tráfico',
          tabBarIcon: ({ color }) => <TabIcon emoji="🚦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Asistente',
          headerTitle: '💬 Asistente de tráfico',
          tabBarIcon: ({ color }) => <TabIcon emoji="💬" color={color} />,
        }}
      />
    </Tabs>
  );
}
