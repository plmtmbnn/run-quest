import { motion } from "framer-motion";
import { Brain, Clock, Sparkles, Trophy, Wind } from "lucide-react";
import { formatPace, predictRaceOutcome } from "@/coach/race-prediction";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import type { RunnerProfile } from "@/runner/runner-types";
import type { DailyChallenge, Preparation } from "@/types/engine";

interface CoachPredictionPanelProps {
  challenge: DailyChallenge;
  preparation: Preparation;
  runnerProfile: RunnerProfile;
}

export function CoachPredictionPanel({
  challenge,
  preparation,
  runnerProfile,
}: CoachPredictionPanelProps) {
  const { t } = useTranslation();

  // Generate prediction
  const prediction = predictRaceOutcome(runnerProfile, challenge, preparation);

  // Get probability color based on win chance
  let probColor: string;
  if (prediction.winProbability >= 70) {
    probColor = "text-emerald-400";
  } else if (prediction.winProbability >= 45) {
    probColor = "text-amber-400";
  } else {
    probColor = "text-rose-400";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-blue-900/80 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-950/30 border border-indigo-800/30 overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-black text-lg sm:text-xl mb-1">
              {t("coach.analysis_title" as TranslationKey)}
            </h3>
            <p className="text-sm opacity-85">
              {t("coach.analysis_subtitle" as TranslationKey)}
            </p>
          </div>
        </div>

        {/* Win Probability Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm uppercase tracking-wider opacity-90">
              {t("coach.win_probability" as TranslationKey)}
            </span>
            <span className={`text-3xl font-black font-mono ${probColor}`}>
              {prediction.winProbability}%
            </span>
          </div>
          <p className="text-xs mt-2 opacity-80">
            {getProbabilityLabel(t, prediction.winProbabilityLabel)}
          </p>
        </div>

        {/* Strategy Recommendation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              {t("coach.strategy" as TranslationKey)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/95">
            {prediction.recommendedStrategy}
          </p>
        </div>

        {/* Pacing Range */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              {t("coach.pacing_range" as TranslationKey)}
            </span>
          </div>
          <p className="text-sm font-mono font-bold text-lg">
            {formatPace(prediction.suggestedPaceRange.min)} –{" "}
            {formatPace(prediction.suggestedPaceRange.max)} min/km
          </p>
          <p className="text-xs mt-1 opacity-75">
            {t("coach.pacing_suggestion" as TranslationKey)}
          </p>
        </div>

        {/* Key Competitors */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              {t("coach.competitors" as TranslationKey)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {prediction.keyThreats.map((threat, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold"
              >
                {threat}
              </span>
            ))}
          </div>
        </div>

        {/* Confidence Factors Grid */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider opacity-80 mb-3 font-bold">
            {t("coach.condition_factors" as TranslationKey)}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs opacity-75 mb-1">
                {t("coach.fitness" as TranslationKey)}
              </div>
              <div className="text-sm font-bold">
                {prediction.confidenceFactors.fitness}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs opacity-75 mb-1">
                {t("coach.fatigue" as TranslationKey)}
              </div>
              <div className="text-sm font-bold">
                {prediction.confidenceFactors.fatigue}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs opacity-75 mb-1">
                {t("coach.experience" as TranslationKey)}
              </div>
              <div className="text-sm font-bold">
                {prediction.confidenceFactors.experience}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs opacity-75 mb-1">
                {t("coach.conditions" as TranslationKey)}
              </div>
              <div className="text-sm font-bold">
                {prediction.confidenceFactors.conditions}
              </div>
            </div>
          </div>
        </div>

        {/* Coach Notes */}
        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border-l-4 border-cyan-400">
          <p className="text-sm italic opacity-90 leading-relaxed mb-2">
            "{prediction.coachNotes}"
          </p>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              — {t("coach.your_coach" as TranslationKey)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper to translate probability labels
function getProbabilityLabel(
  t: (key: TranslationKey) => string,
  label: string,
) {
  switch (label) {
    case "Very High":
      return t("coach.probability_very_high" as TranslationKey);
    case "High":
      return t("coach.probability_high" as TranslationKey);
    case "Medium":
      return t("coach.probability_medium" as TranslationKey);
    case "Low":
      return t("coach.probability_low" as TranslationKey);
    case "Very Low":
      return t("coach.probability_very_low" as TranslationKey);
      return label;
  }
}
