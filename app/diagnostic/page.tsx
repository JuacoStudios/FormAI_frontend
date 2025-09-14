'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      localStorage.setItem("diagnosticCompleted", "true");
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen bg-black p-5 pt-12">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-5 pb-4">
        <div className="bg-green-500 px-3 py-1.5 rounded-full">
          <span className="text-white text-sm font-semibold"></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium"></span>
          <span className="text-white text-sm font-medium"></span>
          <span className="text-white text-sm font-medium"></span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 mb-8">
        <div className="h-1.5 bg-gray-700 rounded-full">
          <div 
            className="h-1.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-green-500 text-xs font-semibold text-center mt-2">
          Step {stepIdx + 1} of {STEPS.length}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h1 className="text-white text-3xl font-bold mb-2 text-center leading-9">
          {step.title}
        </h1>
        {step.subtitle && (
          <p className="text-white text-base mb-8 text-center">
            {step.subtitle}
          </p>
        )}

        {/* Options */}
        <div className="flex-1 flex justify-center">
          <div className="space-y-4 w-full max-w-md">
            {step.options.map(opt => (
              <SelectableCard
                key={opt}
                label={opt}
                selected={selected === opt}
                onPress={() => setAnswers(prev => ({ ...prev, [step.key]: opt }))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        disabled={!selected}
        onClick={onContinue}
        className={`w-full py-4 rounded-3xl text-center text-lg font-bold mb-6 shadow-lg ${
          selected 
            ? 'bg-green-500 text-black shadow-green-500/30' 
            : 'bg-gray-700 text-gray-400 opacity-50'
        }`}
      >
        {stepIdx < STEPS.length - 1 ? "Continue" : "Get Started"}
      </button>
    </div>
  );
}
