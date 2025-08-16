import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();
  const { completed, loading } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.debug('[Guard] Running. Loading:', loading, 'Completed:', completed, 'Segments:', segments);
    if (loading) {
      console.debug('[Guard] Waiting for onboarding status to load...');
      return;
    }

    const inOnboardingGroup = segments[0] === 'onboarding';

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
