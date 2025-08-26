import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { BUILD_INFO } from '../src/lib/buildInfo';

export default function RootLayout() {
  useFrameworkReady();
  const { completed, loading } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  // Log build info once on app boot
  useEffect(() => {
    console.debug("[BUILD]", BUILD_INFO);
  }, []);

  useEffect(() => {
    console.debug('[Guard] Running. Loading:', loading, 'Completed:', completed, 'Segments:', segments);
    if (loading) {
      console.debug('[Guard] Waiting for onboarding status to load...');
      return;
    }

    const inOnboardingGroup = segments[0] === 'onboarding';
    const SHOW_ONBOARDING = process.env.EXPO_PUBLIC_SHOW_ONBOARDING === "true";

    // Disable onboarding by default in production
    if (!SHOW_ONBOARDING && !completed && !inOnboardingGroup) {
      console.debug('[Guard] Onboarding disabled, redirecting to main app');
      router.replace('/(tabs)');
      return;
    }

    if (!completed && !inOnboardingGroup) {
      console.debug('[Guard] Not completed and not in onboarding. Redirecting to /onboarding.');
      router.replace('/onboarding');
    }
    if (completed && inOnboardingGroup) {
      console.debug('[Guard] Completed and in onboarding. Redirecting to /(tabs)/scan.');
      router.replace('/(tabs)');
    }
  }, [completed, loading, segments, router]);

  return (
    <>
      <Slot />
      <StatusBar style="auto" />
    </>
  );
}
