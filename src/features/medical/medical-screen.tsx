// medical-screen.tsx
// Medical Center screen for injury treatment and health management.

"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Hospital,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScreenTour } from "@/components/tour/screen-tour";
import { formatCurrency } from "@/economy/currency-converter";
import { useHealthStore } from "@/health/health-store";
import type { InjurySeverity } from "@/health/injury-types";
import {
  getAvailableTreatments,
  getTreatmentById,
  TREATMENTS,
} from "@/health/medical-treatments";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useRunnerStore } from "@/runner/runner-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";

export function MedicalScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [runTour, setRunTour] = useState(false);
  const healthStore = useHealthStore();
  const timelineStore = useTimelineStore();
  const runnerStore = useRunnerStore();
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";

  const [selectedInjuryId, setSelectedInjuryId] = useState<string | null>(null);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(
    null,
  );
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentSuccess, setTreatmentSuccess] = useState<boolean | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    useHealthStore.getState().loadFromStorage();
  }, []);

  const healthState = healthStore.healthState;
  const gameState = timelineStore.gameState;
  const runnerProfile = runnerStore.runnerState.profile;

  const currentBalance = gameState?.economy?.currentBalance || 0;
  const runnerLevel = runnerProfile?.level || 1;

  const activeInjuries = healthState.currentInjuries;
  const mostSevereInjury = healthStore.getMostSevereInjury();
  const canTrain = healthStore.canTrain();
  const canRace = healthStore.canRace();
  const performanceModifier = healthStore.getPerformanceModifier();

  // Get selected injury
  const selectedInjury =
    activeInjuries.find((i) => i.id === selectedInjuryId) || null;

  // Get available treatments for selected injury
  const availableTreatments = selectedInjury
    ? getAvailableTreatments(
        selectedInjury.severity as InjurySeverity,
        runnerLevel,
        currentBalance,
      )
    : [];

  // Get selected treatment
  const selectedTreatment = selectedTreatmentId
    ? getTreatmentById(selectedTreatmentId)
    : null;

  const handleApplyTreatment = () => {
    if (!selectedInjury || !selectedTreatment) return;

    // Check if treatment is affordable
    if (
      selectedTreatment.cost > currentBalance &&
      selectedTreatment.id !== "rest"
    ) {
      setErrorMessage(t("health.insufficient_funds"));
      return;
    }

    // Check if treatment is successful (based on success rate)
    const isSuccessful = Math.random() <= selectedTreatment.successRate;
    setTreatmentSuccess(isSuccessful);

    if (isSuccessful) {
      // Apply treatment
      healthStore.applyTreatment(
        selectedInjury.id,
        selectedTreatment.id,
        selectedTreatment.recoverySpeedup,
      );

      // Deduct cost if not free
      if (selectedTreatment.cost > 0) {
        timelineStore.setGameState((prev) => ({
          ...prev!,
          economy: {
            ...prev!.economy,
            currentBalance:
              prev!.economy.currentBalance - selectedTreatment.cost,
          },
          resources: {
            ...prev!.resources,
            money: prev!.resources.money - selectedTreatment.cost,
          },
        }));
      }

      // If instant heal, remove injury immediately
      if (selectedTreatment.instantHeal) {
        healthStore.removeInjury(selectedInjury.id);
      }
    }

    setShowTreatmentModal(true);
  };

  const handleCloseTreatmentModal = () => {
    setShowTreatmentModal(false);
    setTreatmentSuccess(null);
    setSelectedInjuryId(null);
    setSelectedTreatmentId(null);
    setErrorMessage(null);
  };

  const handleRestDay = () => {
    // Apply rest day benefits
    healthStore.addRestDay();
    healthStore.updateOvertrainLevel(-10);
    healthStore.updateFatigueLevel(-15);
    healthStore.updateInjuryRecovery(1);

    // Show success message
    setTreatmentSuccess(true);
    setShowTreatmentModal(true);
  };

  // Calculate recovery progress for each injury
  const getRecoveryProgress = (injury: {
    daysElapsed: number;
    daysToRecover: number;
  }) => {
    return Math.min(
      100,
      Math.round((injury.daysElapsed / injury.daysToRecover) * 100),
    );
  };

  // Get estimated recovery time with best treatment
  const getEstimatedRecoveryWithTreatment = (
    injury: {
      type: string;
      severity: InjurySeverity;
      daysToRecover: number;
      daysElapsed: number;
    } | null,
  ) => {
    if (!injury) {
      return 0;
    }

    const bestTreatment = getAvailableTreatments(
      injury.severity as InjurySeverity,
      runnerLevel,
      currentBalance,
    ).sort((a, b) => a.recoverySpeedup - b.recoverySpeedup)[0];

    if (!bestTreatment || bestTreatment.id === "rest") {
      return injury.daysToRecover - injury.daysElapsed;
    }

    const remainingDays = injury.daysToRecover - injury.daysElapsed;
    return Math.max(
      1,
      Math.round(remainingDays * bestTreatment.recoverySpeedup),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-16 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-[#E5E7EB] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              <X size={16} />
              <span>{t("common.back")}</span>
            </button>

            <div className="flex items-center gap-2 ml-1">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Hospital size={24} />
              </div>
              <h1 className="font-heading font-black text-xl md:text-2xl text-slate-800 dark:text-white">
                {t("health.medical_center")}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setRunTour(true)}
              className="rounded-full min-h-[38px] px-3 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/50 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              aria-label="Start Medical Tour"
            >
              <span>🧭</span>
              <span>{t("tour.button" as TranslationKey)}</span>
            </button>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("common.level")}
              </div>
              <div className="font-heading font-black text-base text-slate-800 dark:text-white">
                {runnerLevel}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("common.balance")}
              </div>
              <div className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                {formatCurrency(currentBalance, preferredCurrency)}
              </div>
            </div>
          </div>
        </div>

        {/* Health Status Overview */}
        <div
          id="tour-medical-status"
          className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm"
        >
          <h2 className="font-heading font-black text-base text-slate-800 dark:text-white mb-4">
            {t("health.health_status")}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Overall Health */}
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2">
                {mostSevereInjury ? (
                  <AlertTriangle className="text-rose-500" size={24} />
                ) : (
                  <CheckCircle className="text-emerald-500" size={24} />
                )}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t("health.overall_status")}
              </div>
              <div className="font-heading font-black text-sm text-slate-800 dark:text-white">
                {mostSevereInjury ? t("health.injured") : t("health.healthy")}
              </div>
            </div>

            {/* Overtraining Level */}
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <Clock className="text-amber-500" size={24} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t("health.overtrain_risk")}
              </div>
              <div className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                {healthState.overtrainLevel}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${healthState.overtrainLevel > 70 ? "bg-rose-500" : healthState.overtrainLevel > 40 ? "bg-amber-500" : "bg-indigo-500"}`}
                  style={{
                    width: `${Math.min(100, healthState.overtrainLevel)}%`,
                  }}
                />
              </div>
            </div>

            {/* Fatigue Level */}
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <Heart className="text-purple-500" size={24} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t("health.fatigue_level")}
              </div>
              <div className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                {healthState.fatigueLevel}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${healthState.fatigueLevel > 70 ? "bg-rose-500" : healthState.fatigueLevel > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{
                    width: `${Math.min(100, healthState.fatigueLevel)}%`,
                  }}
                />
              </div>
            </div>

            {/* Performance Impact */}
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="text-indigo-500" size={24} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {t("health.performance")}
              </div>
              <div
                className={`font-mono font-bold text-sm ${performanceModifier < 0.8 ? "text-rose-600 dark:text-rose-400" : performanceModifier < 0.95 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {Math.round(performanceModifier * 100)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleRestDay}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>{t("health.take_rest_day")}</span>
            </button>

            {!canTrain && (
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-[#E5E7EB] dark:border-slate-800 opacity-60 cursor-not-allowed"
                disabled
              >
                <X size={16} />
                <span>{t("health.cannot_train")}</span>
              </button>
            )}

            {!canRace && (
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-[#E5E7EB] dark:border-slate-800 opacity-60 cursor-not-allowed"
                disabled
              >
                <X size={16} />
                <span>{t("health.cannot_race")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Injuries */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
          <h2 className="font-heading font-black text-base text-slate-800 dark:text-white mb-4">
            {t("health.active_injuries")}
          </h2>

          {activeInjuries.length === 0 ? (
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <CheckCircle className="text-emerald-500 mb-3" size={40} />
              <p className="font-heading font-black text-sm text-slate-800 dark:text-white">
                {t("health.no_active_injuries")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInjuries.map((injury) => (
                <div
                  key={injury.id}
                  className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                    selectedInjuryId === injury.id
                      ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm"
                      : "border-[#E5E7EB] dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                  onClick={() => setSelectedInjuryId(injury.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <AlertTriangle className="text-rose-500" size={16} />
                        <span className="font-heading font-black text-sm text-slate-800 dark:text-white">
                          {t(`health.injuries.${injury.type}`)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            injury.severity === "critical"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : injury.severity === "major"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : injury.severity === "moderate"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {t(`health.severity_${injury.severity}`)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {injury.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2 flex-wrap text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">
                            {t("health.days_remaining")}:{" "}
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-white">
                            {injury.daysToRecover - injury.daysElapsed}{" "}
                            {t("common.days")}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 dark:text-slate-400">
                            {t("health.performance_impact")}:{" "}
                          </span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {Math.round((1 - injury.performanceImpact) * 100)}%{" "}
                            {t("common.reduction")}
                          </span>
                        </div>
                      </div>

                      {/* Recovery Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${getRecoveryProgress(injury)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInjuryId(injury.id);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all whitespace-nowrap"
                    >
                      {t("health.view_treatments")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Treatment Options (when injury selected) */}
        {selectedInjury && (
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
            <h2 className="font-heading font-black text-base text-slate-800 dark:text-white mb-4">
              {t("health.treatment_options_for", {
                injury: t(`health.injuries.${selectedInjury.type}`),
              })}
            </h2>

            {availableTreatments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("health.no_treatments_available")}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTreatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTreatmentId === treatment.id
                        ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm"
                        : "border-[#E5E7EB] dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                    onClick={() => setSelectedTreatmentId(treatment.id)}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                          {treatment.name}
                        </h3>
                        {treatment.id !== "rest" && (
                          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(treatment.cost, preferredCurrency)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                        {treatment.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>
                            {treatment.instantHeal
                              ? t("health.instant_heal")
                              : t("health.recovery_time", {
                                  days: getEstimatedRecoveryWithTreatment(
                                    selectedInjury,
                                  ),
                                })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-slate-400" />
                          <span>
                            {t("health.success_rate", {
                              rate: Math.round(treatment.successRate * 100),
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedTreatmentId === treatment.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTreatment();
                        }}
                        className="w-full mt-4 py-2.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                      >
                        {t("health.apply_treatment")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Injury History */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
          <h2 className="font-heading font-black text-base text-slate-800 dark:text-white mb-4">
            {t("health.injury_history")}
          </h2>

          {healthState.injuryHistory.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("health.no_injury_history")}
            </p>
          ) : (
            <div className="space-y-2.5">
              {healthState.injuryHistory.slice(0, 10).map((injury, index) => (
                <div
                  key={`${injury.id}_${index}`}
                  className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <div className="font-heading font-black text-slate-800 dark:text-white">
                        {t(`health.injuries.${injury.type}`)}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {t(`health.severity_${injury.severity}`)} -{" "}
                        {t("health.healed")}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-slate-500 dark:text-slate-400">
                    {t("health.day", { day: injury.acquiredOnDay })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Treatment Result Modal */}
        {showTreatmentModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white">
                  {treatmentSuccess
                    ? t("health.treatment_success")
                    : t("health.treatment_failed")}
                </h3>
                <button
                  onClick={handleCloseTreatmentModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center justify-center my-6">
                {treatmentSuccess ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle size={40} />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <X size={40} />
                  </div>
                )}
              </div>

              <p className="text-center text-xs font-medium text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {treatmentSuccess
                  ? selectedTreatment?.instantHeal
                    ? t("health.injury_instantly_healed")
                    : t("health.treatment_applied", {
                        treatment: selectedTreatment?.name || "",
                        days: getEstimatedRecoveryWithTreatment(selectedInjury),
                      })
                  : t("health.treatment_failed_try_again")}
              </p>

              {errorMessage && (
                <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 mb-4">
                  <p className="text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {errorMessage}
                  </p>
                </div>
              )}

              <button
                onClick={handleCloseTreatmentModal}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                {t("common.continue")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen Tour */}
      <ScreenTour
        run={runTour}
        onFinish={() => setRunTour(false)}
        steps={[
          {
            target: "body",
            placement: "center",
            title: t("tour.screens.medical.welcome.title" as TranslationKey),
            content: t(
              "tour.screens.medical.welcome.content" as TranslationKey,
            ),
            skipBeacon: true,
          },
          {
            target: "#tour-medical-status",
            title: t("tour.screens.medical.status.title" as TranslationKey),
            content: t("tour.screens.medical.status.content" as TranslationKey),
          },
        ]}
      />
    </div>
  );
}

export default MedicalScreen;
