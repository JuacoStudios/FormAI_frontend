import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SelectableCard } from "../../components/SelectableCard";
import { colors } from "../../theme/colors";

type Step = { key: string; title: string; subtitle?: string; options: string[] };

const STEPS: Step[] = [
  { key: "gender", title: "Choose your Gender", options: ["Male", "Female", "Other"] },
  { key: "workouts", title: "How many workouts do you do per week?", options: ["0–2", "3–5", "6+"] },
  { key: "triedApps", title: "Have you tried other calorie tracking apps?", options: ["Yes", "No"] },
  { key: "discovery", title: "Where did you hear about us?", options: ["Friend or family", "App Store", "YouTube", "Google", "TikTok", "Facebook", "X"] },
  { key: "goalWeight", title: "What is your desired weight?", options: ["Lose weight", "Maintain weight", "Gain weight"] }
];

export default function Diagnostic() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const step = STEPS[stepIdx];
  const selected = answers[step.key];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const onContinue = async () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(i => i + 1);
    } else {
      // TODO: Wire up to backend when ready
      await AsyncStorage.setItem("diagnosticCompleted", "true");
      router.replace("/");
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{step.title}</Text>
        {step.subtitle && <Text style={styles.subtitle}>{step.subtitle}</Text>}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {step.options.map(opt => (
            <SelectableCard
              key={opt}
              label={opt}
              selected={selected === opt}
              onPress={() => setAnswers(prev => ({ ...prev, [step.key]: opt }))}
            />
          ))}
        </View>
      </View>

      {/* Continue Button */}
      <Pressable
        disabled={!selected}
        onPress={onContinue}
        style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
      >
        <Text style={styles.continueButtonText}>
          {stepIdx < STEPS.length - 1 ? "Continue" : "Get Started"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  progressContainer: {
    marginTop: 60,
    marginBottom: 32,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.green,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.black,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray,
    fontSize: 16,
    marginBottom: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: colors.black,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
