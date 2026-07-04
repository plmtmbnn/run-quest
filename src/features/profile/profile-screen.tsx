"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import {
  calculateLifetimeDistance,
  calculateRunningStreak,
  getFatigueLevel,
  getFitnessLevel,
  getReadinessLevel,
} from "@/runner/runner-selectors";
import { useRunnerStore } from "@/runner/runner-store";

/**
 * Runner Profile screen.
 * Displays the runner's persistent profile and long-term progression metrics.
 */
export function ProfileScreen() {
  const router = useRouter();
  const { runnerState } = useRunnerStore();
  const profile = runnerState.profile;
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-background flex flex-col pb-16"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-surface/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-50 active:scale-95"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                {t("home.runner_profile" as TranslationKey)}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Your long-term progression and career stats
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6">
          {/* Runner Name */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Name</h2>
            <p className="text-gray-600">{profile.displayName}</p>
          </div>

          {/* Lifetime Stats */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Lifetime Distance
              </h2>
              <p className="text-gray-600">
                {calculateLifetimeDistance(profile)}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Total Runs
              </h2>
              <p className="text-gray-600">{profile.totalRuns}</p>
            </div>
          </div>

          {/* Current Metrics */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Current Fitness
              </h2>
              <p className="text-gray-600">
                {profile.currentFitness} ({getFitnessLevel(profile)})
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Current Fatigue
              </h2>
              <p className="text-gray-600">
                {profile.currentFatigue} ({getFatigueLevel(profile)})
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Today's Race Readiness
            </h2>
            <p className="text-gray-600">
              {profile.currentReadiness} ({getReadinessLevel(profile)})
            </p>
          </div>

          {/* Running Streak */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Current Running Streak
            </h2>
            <p className="text-gray-600">
              {calculateRunningStreak(profile)} days
            </p>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Preferred Surface
              </h2>
              <p className="text-gray-600">
                {profile.preferredSurface || "Not set"}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Preferred Distance
              </h2>
              <p className="text-gray-600">
                {profile.preferredDistance || "Not set"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              Preferred Strategy
            </h2>
            <p className="text-gray-600">
              {profile.preferredStrategy || "Not set"}
            </p>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
