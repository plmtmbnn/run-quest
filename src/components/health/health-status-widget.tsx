// health-status-widget.tsx
// Health status widget for displaying current health information.

"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Hospital,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHealthStore } from "@/health/health-store";
import { useTranslation } from "@/i18n/use-translation";

export function HealthStatusWidget() {
  const { t } = useTranslation();
  const router = useRouter();
  const healthStore = useHealthStore();

  // Load health state on mount
  useEffect(() => {
    useHealthStore.getState().loadFromStorage();
  }, []);

  const healthState = healthStore.healthState;
  const mostSevereInjury = healthStore.getMostSevereInjury();
  const canTrain = healthStore.canTrain();
  const canRace = healthStore.canRace();
  const performanceModifier = healthStore.getPerformanceModifier();

  const activeInjuries = healthState.currentInjuries;

  // Calculate overall health status
  const getHealthStatus = () => {
    if (mostSevereInjury) {
      if (mostSevereInjury.severity === "critical") {
        return {
          status: "critical",
          label: t("health.critical"),
          color: "red",
        };
      } else if (mostSevereInjury.severity === "major") {
        return {
          status: "major",
          label: t("health.major_injury"),
          color: "orange",
        };
      } else if (mostSevereInjury.severity === "moderate") {
        return {
          status: "moderate",
          label: t("health.moderate_injury"),
          color: "yellow",
        };
      } else {
        return {
          status: "minor",
          label: t("health.minor_injury"),
          color: "green",
        };
      }
    }

    if (healthState.overtrainLevel > 70) {
      return {
        status: "warning",
        label: t("health.high_overtrain"),
        color: "orange",
      };
    }

    if (healthState.fatigueLevel > 70) {
      return {
        status: "warning",
        label: t("health.high_fatigue"),
        color: "orange",
      };
    }

    return { status: "healthy", label: t("health.healthy"), color: "green" };
  };

  const healthStatus = getHealthStatus();

  const handleNavigateToMedical = () => {
    router.push("/medical");
  };

  if (
    !mostSevereInjury &&
    healthState.overtrainLevel <= 30 &&
    healthState.fatigueLevel <= 30
  ) {
    // Only show compact status if healthy
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shadow-sm">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("health.health_status")}
            </div>
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate tracking-tight">
              {t("health.healthy")}
            </div>
          </div>
          <button
            onClick={handleNavigateToMedical}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {t("health.view_details")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border ${
        healthStatus.color === "red"
          ? "border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/20"
          : healthStatus.color === "orange"
            ? "border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20"
            : healthStatus.color === "yellow"
              ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/10 dark:bg-amber-950/10"
              : "border-[#E5E7EB] dark:border-slate-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm ${
            healthStatus.color === "red"
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : healthStatus.color === "orange"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : healthStatus.color === "yellow"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {mostSevereInjury ? (
            <AlertTriangle className="w-4 h-4" />
          ) : healthStatus.color === "orange" ? (
            <Clock className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("health.health_status")}
          </div>
          <div
            className={`text-xs font-black truncate tracking-tight ${
              healthStatus.color === "red"
                ? "text-rose-600 dark:text-rose-400"
                : healthStatus.color === "orange"
                  ? "text-amber-600 dark:text-amber-400"
                  : healthStatus.color === "yellow"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {healthStatus.label}
          </div>

          {/* Show injury details if injured */}
          {mostSevereInjury && (
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {t(`health.injuries.${mostSevereInjury.type}`)} -{" "}
              {mostSevereInjury.daysToRecover - mostSevereInjury.daysElapsed}{" "}
              {t("common.days")}
            </div>
          )}
        </div>

        <button
          onClick={handleNavigateToMedical}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors whitespace-nowrap"
        >
          {t("health.medical_center")}
        </button>
      </div>

      {/* Show warning if cannot train or race */}
      {(!canTrain || !canRace) && (
        <div className="mt-3 flex gap-2">
          {!canTrain && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              {t("health.cannot_train")}
            </span>
          )}
          {!canRace && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              {t("health.cannot_race")}
            </span>
          )}
        </div>
      )}

      {/* Performance indicator */}
      {performanceModifier < 1.0 && (
        <div className="mt-2.5">
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {t("health.performance")}:{" "}
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              {Math.round(performanceModifier * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-rose-500 transition-all duration-300"
              style={{
                width: `${Math.round((1 - performanceModifier) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default HealthStatusWidget;
