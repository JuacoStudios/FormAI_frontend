import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export interface OnboardingData {
  mainGoal: string;
  gymFrequency: string;
  workoutType: string;
  dietPlan: string;
  workoutTime: string;
  fitnessApps: string;
}

interface OnboardingStep {
  id: keyof OnboardingData;
  title: string;
  options: string[];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'mainGoal',
    title: 'What is your main goal at the gym?',
    options: ['Build muscle', 'Lose fat', 'Improve endurance', 'General fitness']
  },
  {
    id: 'gymFrequency',
    title: 'How often do you go to the gym?',
    options: ['0–2 times per week', '3–5 times per week', '6+ times per week']
  },
  {
    id: 'workoutType',
    title: 'What is your preferred workout type?',
    options: ['Weight training', 'Cardio', 'Mixed training', 'Classes (yoga, pilates, etc.)']
  },
  {
    id: 'dietPlan',
    title: 'Do you follow a specific diet plan?',
    options: ['Yes', 'No']
  },
  {
    id: 'workoutTime',
    title: 'What time of day do you usually work out?',
    options: ['Morning', 'Afternoon', 'Evening']
  },
  {
    id: 'fitnessApps',
    title: 'Have you tried other fitness apps?',
    options: ['Yes', 'No']
  }
];

const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({});
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setCompleted(value === '1');
      } catch (e) {
        console.error('Failed to load onboarding status', e);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const complete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, '1');
      setCompleted(true);
      // Navigate to main app after completing onboarding
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to save onboarding status', e);
    }
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnswer = (questionId: keyof OnboardingData, answer: string) => {
    setAnswers((prev: Partial<OnboardingData>) => ({ ...prev, [questionId]: answer }));
  };

  const getCurrentQuestion = () => ONBOARDING_STEPS[currentStep];
  const getCurrentAnswer = () => answers[getCurrentQuestion().id];
  const canContinue = () => !!getCurrentAnswer();
  const isLastStep = () => currentStep === ONBOARDING_STEPS.length - 1;

  // Debug function to reset onboarding state
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      setCompleted(false);
      setCurrentStep(0);
      setAnswers({});
      console.log('🔄 Onboarding reset complete');
    } catch (e) {
      console.error('Failed to reset onboarding', e);
    }
  };

  return {
    currentStep,
    answers,
    loading,
    completed,
    getCurrentQuestion,
    getCurrentAnswer,
    canContinue,
    isLastStep,
    nextStep,
    previousStep,
    updateAnswer,
    complete,
    resetOnboarding,
  };
}
