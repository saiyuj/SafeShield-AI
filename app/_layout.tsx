import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="screens/safewalk" />
      <Stack.Screen name="screens/fakecall" />
      <Stack.Screen name="screens/keywords" />
      <Stack.Screen name="screens/crowd" />
      <Stack.Screen name="screens/stress" />
      <Stack.Screen name="screens/selfie" />
      <Stack.Screen name="screens/disguise" />
      <Stack.Screen name="screens/contacts" />
      <Stack.Screen name="screens/safetyfeatures" />
      <Stack.Screen name="screens/junior" />
      <Stack.Screen name="screens/aichat" />
      <Stack.Screen name="screens/safetymap" />
      <Stack.Screen name="screens/health" />
      <Stack.Screen name="screens/fakedetector" />
    </Stack>
  );
}
