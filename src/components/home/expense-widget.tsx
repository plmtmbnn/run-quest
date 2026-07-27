"use client";

import { motion } from "framer-motion";
import { Wallet, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatCurrency } from "@/economy/currency-converter";
import { useTranslation } from "@/i18n/use-translation";
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
  const runnerLevel = loadRunnerState().profile.level || 1;

  const { initialize, getWeeklyTotal, hasUnpaidExpenses } = useExpenseStore();

  useEffect(() => {
    useExpenseStore.getState().initialize();
  }, []);

  const weeklyExpenses = getWeeklyTotal(runnerLevel);
  const weeksAffordable =
    weeklyExpenses > 0 ? Math.floor(currentBalance / weeklyExpenses) : 999;
  const isUnpaid = hasUnpaidExpenses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all ${
        isUnpaid
          ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
          : "bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isUnpaid
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>{t("expenses.weekly_expenses")}</span>
              {isUnpaid && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] uppercase font-bold tracking-wider">
                  {t("expenses.mandatory")}
                </span>
              )}
            </div>

            <div className="text-lg font-mono font-bold text-slate-800 dark:text-white flex items-baseline gap-1 mt-0.5">
              <span>{formatCurrency(weeklyExpenses, preferredCurrency)}</span>
              <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">/ {t("expenses.frequency.weekly")}</span>
            </div>

            <div className="text-xs font-medium mt-0.5">
              {isUnpaid ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t("expenses.insufficient_funds")}
                </span>
              ) : weeksAffordable >= 4 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("expenses.status_good")}
                </span>
              ) : weeksAffordable >= 2 ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t("expenses.status_warning", { weeks: weeksAffordable })}
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t("expenses.status_critical")}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/expenses")}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
        >
          <span>{t("expenses.manage")}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
