import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import OnboardingSelectableCard from './OnboardingSelectableCard';
import OnboardingTest from './OnboardingTest';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const {
    currentStep,
    getCurrentQuestion,
    getCurrentAnswer,
    canContinue,
    isLastStep,
    nextStep,
    previousStep,
    updateAnswer,
    complete,
    resetOnboarding,
  } = useOnboarding();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const progress = ((currentStep + 1) / 6) * 100; // Updated to 6 steps

  useEffect(() => {
    // Animate transition between questions
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentStep]);

  const handleOptionSelect = (option: string) => {
    updateAnswer(currentQuestion.id as any, option);
  };

  const handleContinue = async () => {
    if (!canContinue()) {
      return;
    }

    if (isLastStep()) {
      console.debug('[Onboarding] Last step. Calling complete().');
      await complete();
      // The root layout will handle the navigation
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  // Debug function to reset onboarding state
  const resetOnboardingState = async () => {
    await resetOnboarding();
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>4:29</Text>
        </View>
        <View style={styles.statusIcons}>
          <Text style={styles.statusText}>...</Text>
          <Text style={styles.statusText}>5G</Text>
          <Text style={styles.statusText}>29</Text>
        </View>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of 6
          </Text>
        </View>

        {/* Debug button */}
        {__DEV__ && (
          <TouchableOpacity style={styles.debugButton} onPress={resetOnboardingState}>
            <Text style={styles.debugButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <Text style={styles.title}>{currentQuestion.title}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <OnboardingSelectableCard
              key={option}
              label={option}
              selected={currentAnswer === option}
              onPress={() => handleOptionSelect(option)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !canContinue() && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
        disabled={!canContinue()}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>
          {isLastStep() ? 'Get Started' : 'Continue'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neonDarkBg,
    paddingTop: 50,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  timeContainer: {
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neonGrayBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neonGreenBorder,
  },
  backButtonText: {
    color: colors.neonGreen,
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.darkGray,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neonGreen,
    borderRadius: 3,
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  progressText: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 36,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 28,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.darkGray,
    opacity: 0.5,
  },
  continueButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '700',
  },
  debugButton: {
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '700',
  },
});
