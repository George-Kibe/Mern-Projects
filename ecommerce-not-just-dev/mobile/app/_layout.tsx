import React from 'react';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { ShoppingCart, User } from 'lucide-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const cartItemsNum = 1;
  const isLoggedIn = false;
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>    
      <GluestackUIProvider mode="light">
        <ThemeProvider 
        value={colorScheme === 'dark' ? DarkTheme :DefaultTheme}
        >
          <Stack screenOptions={{
              headerRight: () =>
                cartItemsNum > 0 && (
                  <Link href={'/cart'} asChild>
                    <Pressable className="flex-row gap-2">
                      <Icon as={ShoppingCart} />
                      <Text>{cartItemsNum}</Text>
                    </Pressable>
                  </Link>
                ),
            }}>
            {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
            <Stack.Screen
              name="index"
              options={{
                title: 'Home: Shop',
                headerTitleAlign: 'center',
                headerLeft: () =>
                  !isLoggedIn && (
                    <Link href={'/login'} asChild>
                      <Pressable className="flex-row gap-2">
                        <Icon as={User} />
                      </Pressable>
                    </Link>
                  ),
              }}
            />
            <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}
