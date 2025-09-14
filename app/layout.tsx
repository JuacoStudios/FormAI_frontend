import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { BUILD_INFO } from '../src/lib/buildInfo';

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

  return (
    <>
      <Slot />
      <StatusBar style="auto" />
    </>
  );
}

