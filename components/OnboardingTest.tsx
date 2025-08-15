import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingTest() {
  const { currentStep, answers } = useOnboarding();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding Test Panel</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Current Step:</Text>
        <Text style={styles.value}>{currentStep + 1} / 6</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>% Complete:</Text>
        <Text style={styles.value}>{((currentStep + 1) / 6) * 100}%</Text>
      </View>
      
      <View style={styles.answersContainer}>
        <Text style={styles.label}>Answers:</Text>
        {Object.entries(answers).map(([key, value]) => (
          <Text key={key} style={styles.answer}>
            {key}: {value}
          </Text>
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.neonGrayBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neonGreenBorder,
  },
  title: {
    color: colors.neonGreen,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: colors.neonGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  answersContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  answer: {
    color: colors.white,
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '600',
  },
});
