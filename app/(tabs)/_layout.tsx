import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SOSIcon = ({ focused }) => (
  <View style={{
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FF3B30',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: focused ? '#FFE033' : '#FF6B6B',
    elevation: 12,
  }}>
    <Text style={{ color: 'white', fontSize: 13, fontWeight: '900', letterSpacing: 1 }}>SOS</Text>
  </View>
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#222',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 20,
        },
        tabBarActiveTintColor: '#FFE033',
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={26} color={color} /> }} />
      <Tabs.Screen name="protect" options={{ tabBarIcon: ({ color }) => <Ionicons name="shield-outline" size={26} color={color} /> }} />
      <Tabs.Screen name="sos" options={{ tabBarIcon: ({ focused }) => <SOSIcon focused={focused} /> }} />
      <Tabs.Screen name="tools" options={{ tabBarIcon: ({ color }) => <Ionicons name="construct-outline" size={26} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={26} color={color} /> }} />
      <Tabs.Screen name="safewalk" options={{ href: null }} />
      <Tabs.Screen name="fakecall" options={{ href: null }} />
      <Tabs.Screen name="contacts" options={{ href: null }} />
      <Tabs.Screen name="keywords" options={{ href: null }} />
      <Tabs.Screen name="crowd" options={{ href: null }} />
      <Tabs.Screen name="stress" options={{ href: null }} />
      <Tabs.Screen name="selfie" options={{ href: null }} />
      <Tabs.Screen name="disguise" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
