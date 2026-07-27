"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Shield,
  Clock,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatCurrency } from "@/economy/currency-converter";
import {
  RECURRING_EXPENSES,
  calculateExpenseAmount,
} from "@/economy/recurring-expenses";
import { useTranslation, type TranslationKey } from "@/i18n/use-translation";
import { loadRunnerState } from "@/runner/runner-persistence";
import { useExpenseStore } from "@/store/expense-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";

export default function ExpensesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";
  const { gameState } = useTimelineStore();
  const currentBalance = gameState?.economy.currentBalance ?? 0;
  const runnerLevel = loadRunnerState().profile.level || 1;

  const {
    expenseState,
    initialize,
    toggleExpense,
    getActiveBenefits,
    getWeeklyTotal,
    getMonthlyTotal,
  } = useExpenseStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const weeklyTotal = getWeeklyTotal(runnerLevel);
  const monthlyTotal = getMonthlyTotal(runnerLevel);
  const activeBenefits = getActiveBenefits();
  const availableExpenses = RECURRING_EXPENSES.filter(
    (e) => runnerLevel >= e.unlockedAtLevel
  );

  const weeksAffordable =
    weeklyTotal > 0 ? Math.floor(currentBalance / weeklyTotal) : 999;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{t("expenses.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("expenses.summary")}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-500" />
              {t("expenses.weekly_total")}
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatCurrency(weeklyTotal, preferredCurrency)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-indigo-500" />
              {t("expenses.monthly_total")}
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {formatCurrency(monthlyTotal, preferredCurrency)}
            </div>
          </div>
        </div>

        {/* Affordability Status */}
        <div className="p-3 rounded-xl border flex items-center justify-between text-sm font-medium bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800">
          <span>{t("home.stats.money")}: {formatCurrency(currentBalance, preferredCurrency)}</span>
          <div>
            {weeksAffordable >= 4 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {t("expenses.status_good")}
              </span>
            ) : weeksAffordable >= 2 ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {t("expenses.status_warning", { weeks: weeksAffordable })}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {t("expenses.status_critical")}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Active Benefits Card */}
      {Object.entries(activeBenefits).some(([_, value]) => value > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <Zap className="w-5 h-5" />
            <h3>{t("expenses.active_benefits")}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(activeBenefits)
              .filter(([_, value]) => value > 0)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                >
                  <span>{t(`expenses.benefits.${key}` as TranslationKey)}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{Math.round(value * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Expense List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">{t("expenses.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableExpenses.map((expense) => {
            const isActive = expenseState.activeExpenses.includes(expense.id);
            const amount = calculateExpenseAmount(expense, runnerLevel);

            return (
              <div
                key={expense.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base">
                      {t(expense.name as TranslationKey)}
                    </h3>
                    {expense.mandatory ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {t("expenses.mandatory")}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {t("expenses.optional")}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(expense.description as TranslationKey)}
                  </p>

                  <div className="flex items-baseline gap-1 text-slate-900 dark:text-white pt-1">
                    <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      {formatCurrency(amount, preferredCurrency)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / {t(`expenses.frequency.${expense.frequency}` as TranslationKey)}
                    </span>
                  </div>

                  {expense.benefits && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {t("expenses.benefits_title")}
                      </span>
                      <ul className="text-xs space-y-1 text-emerald-600 dark:text-emerald-400">
                        {Object.entries(expense.benefits).map(([bKey, bVal]) => (
                          <li key={bKey} className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 shrink-0" />
                            <span>
                              +{Math.round((bVal ?? 0) * 100)}%{" "}
                              {t(`expenses.benefits.${bKey}` as TranslationKey)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {!expense.mandatory && (
                  <button
                    onClick={() => toggleExpense(expense.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition ${
                      isActive
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                    }`}
                  >
                    {isActive ? t("expenses.disable") : t("expenses.enable")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense History */}
      {expenseState.expenseHistory.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-lg font-bold">{t("expenses.history")}</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
            {expenseState.expenseHistory
              .slice(-10)
              .reverse()
              .map((tx, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between text-sm"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold flex items-center gap-2">
                      {tx.successful ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      <span>
                        {t("expenses.day" as TranslationKey, { day: tx.dayIndex })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {tx.expenses.map((e) => t(e.name as TranslationKey)).join(", ")}
                    </div>
                  </div>

                  <div
                    className={`font-bold text-base ${
                      tx.successful
                        ? "text-slate-900 dark:text-white"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formatCurrency(tx.totalAmount, preferredCurrency)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
