import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import COLORS from './theme';
import { View, Text, Image } from 'react-native';

// Keep the splash screen visible while we fetch resources
//SplashScreen.preventAutoHideAsync();

function CustomSplash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 5000); // 5 seconds
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: '#ad79e3', justifyContent: 'center', alignItems: 'center' }}>
      <Image source={require('../assets/ECG_white.png')} style={{ width: 260, height: 260, marginBottom: 32 }} resizeMode="contain" />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add custom fonts here if needed
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !showSplash) {
      SplashScreen.hideAsync();
    }
  }, [loaded, showSplash]);

  if (!loaded) {
    return null;
  }

  if (showSplash) {
    return <CustomSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Stack
      screenOptions={{
        // headerStyle: {
        //   backgroundColor: COLORS.primary,
        // },
        headerShown:false,
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'ECareerGuide',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
        }}
      />
      {/* Keep other screens for navigation fallback or counselor role */}
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="counselors" options={{ title: 'Counselors' }} />
      <Stack.Screen name="ai-chat" options={{ title: 'AI Chat' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="resume-builder" options={{ title: 'Resume Builder' }} />
      <Stack.Screen name="learning-journey" options={{ title: 'Learning Journey' }} />
      <Stack.Screen name="top-careers" options={{ title: 'Top Careers' }} />
      <Stack.Screen name="elite-institutions" options={{ title: 'Elite Institutions' }} />
      <Stack.Screen name="document-optimizer" options={{ title: 'Document Optimizer' }} />
      <Stack.Screen name="counselor-inbox" options={{ title: 'Counselor Inbox' }} />
    </Stack>
  );
} 