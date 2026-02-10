import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="order-history" options={{ headerShown: true, title: 'Order History', headerStyle: { backgroundColor: '#FFFCF8' }, headerTintColor: '#C2410C' }} />
          <Stack.Screen name="order/[id]" options={{ headerShown: true, title: 'Order Details', headerStyle: { backgroundColor: '#FFFCF8' }, headerTintColor: '#C2410C' }} />
          <Stack.Screen name="support" options={{ headerShown: true, title: 'Support', headerStyle: { backgroundColor: '#FFFCF8' }, headerTintColor: '#C2410C' }} />
          <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout', headerStyle: { backgroundColor: '#FFFCF8' }, headerTintColor: '#C2410C' }} />
        </Stack>
      </LanguageProvider>
    </AuthProvider>
  );
}
