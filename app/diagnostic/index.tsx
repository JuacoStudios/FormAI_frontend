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
  { key: "triedApps", title: "Have you tried other fitness apps?", options: ["Yes", "No"] },
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
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}></Text>
        </View>
        <View style={styles.statusIcons}>
          <Text style={styles.statusText}></Text>
          <Text style={styles.statusText}></Text>
          <Text style={styles.statusText}></Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {stepIdx + 1} of {STEPS.length}
        </Text>
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
    backgroundColor: colors.neonDarkBg,
    padding: 20,
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
  progressContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.darkGray,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
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
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: colors.neonGreen,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
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
    fontWeight: "700",
  },
});

