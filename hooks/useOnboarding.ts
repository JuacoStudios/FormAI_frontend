import { useState } from 'react';

export interface OnboardingData {
  mainGoal: string;
  gymFrequency: string;
  workoutType: string;
  dietPlan: string;
  workoutTime: string;
  fitnessApps: string;
}

export const ONBOARDING_STEPS = [
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

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingData>>({});

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding completed - navigate to main app
      console.log('Onboarding completed with answers:', answers);
      // Here you would typically navigate to the main app
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnswer = (questionId: keyof OnboardingData, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const getCurrentQuestion = () => ONBOARDING_STEPS[currentStep];
  const getCurrentAnswer = () => answers[getCurrentQuestion().id];
  const canContinue = () => !!getCurrentAnswer();
  const isLastStep = () => currentStep === ONBOARDING_STEPS.length - 1;

  return {
    currentStep,
    answers,
    getCurrentQuestion,
    getCurrentAnswer,
    canContinue,
    isLastStep,
    nextStep,
    previousStep,
    updateAnswer,
  };
}
