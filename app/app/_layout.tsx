import { Stack } from 'expo-router';
import { PrediccionProvider } from '@/context/PrediccionContext';

export default function RootLayout() {
  return (
    <PrediccionProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PrediccionProvider>
  );
}
