import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider } from '@clerk/clerk-expo';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { BUILD_INFO } from '../src/lib/buildInfo';

const tokenCache = {
  async getToken(key: string) {
    try { return await SecureStore.getItemAsync("clerk_token"); } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { await SecureStore.setItemAsync("clerk_token", value); } catch {}
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const instanceUrl = process.env.EXPO_PUBLIC_CLERK_INSTANCE_URL;
const instanceDomain = instanceUrl ? new URL(instanceUrl).host : undefined;

export default function RootLayout() {
  useFrameworkReady();

  // Log build info once on app boot
  useEffect(() => {
    console.debug("[BUILD]", BUILD_INFO);
    
    // Development-only readiness probe
    if (__DEV__) {
      import('../src/lib/diagnostics').then(({ readinessProbe }) => {
        readinessProbe().catch(console.error);
      });
    }
  }, []);

  // Only render ClerkProvider if we have the required keys
  if (!publishableKey) {
    return (
      <>
        <Slot />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      instanceDomain={instanceDomain}
      tokenCache={tokenCache}
    >
      <Slot />
      <StatusBar style="auto" />
    </ClerkProvider>
  );
}
