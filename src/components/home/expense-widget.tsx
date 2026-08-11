"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Hotel,
  Plane,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatCurrency } from "@/economy/currency-converter";
import { calculateLivingBreakdown } from "@/economy/recurring-expenses";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { loadRunnerState } from "@/runner/runner-persistence";
import { useExpenseStore } from "@/store/expense-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";

export function ExpenseWidget() {
  const router = useRouter();
  const { t } = useTranslation();
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";
  const { gameState } = useTimelineStore();
  const currentBalance = gameState?.economy.currentBalance ?? 0;
  const registeredMap = gameState?.scheduling?.registered || {};
  const registeredCount = Object.keys(registeredMap).length;

  const runnerLevel = loadRunnerState().profile.level || 1;

  const { initialize, getMonthlyTotal, hasUnpaidExpenses } = useExpenseStore();

  useEffect(() => {
    useExpenseStore.getState().initialize();
  }, []);

  const monthlyExpenses = getMonthlyTotal(runnerLevel, registeredCount);
  const monthsAffordable =
    monthlyExpenses > 0 ? Math.floor(currentBalance / monthlyExpenses) : 999;
  const isUnpaid = hasUnpaidExpenses();

  const livingBreakdown = calculateLivingBreakdown(
    runnerLevel,
    registeredCount,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[2rem] p-5 border shadow-sm hover:shadow-md transition-all ${
        isUnpaid
          ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
          : "bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-800"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isUnpaid
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>{t("expenses.monthly_expenses" as TranslationKey)}</span>
              {isUnpaid && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] uppercase font-bold tracking-wider">
                  {t("expenses.mandatory" as TranslationKey)}
                </span>
              )}
            </div>

            <div className="text-xl font-mono font-bold text-slate-800 dark:text-white flex items-baseline gap-1.5">
              <span>{formatCurrency(monthlyExpenses, preferredCurrency)}</span>
              <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">
                / {t("expenses.frequency.monthly" as TranslationKey)}
              </span>
            </div>

            {/* Dynamic Race Travel / Logistics Indicator */}
            <div className="pt-0.5">
              {registeredCount > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                  <Plane className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <Hotel className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span>
                    {(
                      t("expenses.race_logistics_active" as TranslationKey) ||
                      ""
                    )
                      .replace("{count}", String(registeredCount))
                      .replace(
                        "{amount}",
                        formatCurrency(
                          livingBreakdown.travelLogistics,
                          preferredCurrency,
                        ),
                      )}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t("expenses.no_race_logistics" as TranslationKey)}
                </span>
              )}
            </div>

            <div className="text-xs font-medium pt-0.5">
              {isUnpaid ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t("expenses.insufficient_funds" as TranslationKey)}
                </span>
              ) : monthsAffordable >= 3 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("expenses.status_good_monthly" as TranslationKey)}
                </span>
              ) : monthsAffordable >= 1 ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {(
                    t("expenses.status_warning_monthly" as TranslationKey) || ""
                  ).replace("{months}", String(monthsAffordable))}
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t("expenses.status_critical_monthly" as TranslationKey)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            router.push("/expenses");
          }}
          className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
        >
          <span>{t("expenses.manage" as TranslationKey)}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
