/**
 * Transaction Log Component (Sprint 26 - Task 6)
 *
 * Displays recent financial transactions.
 */

"use client";

import { formatCurrency } from "@/economy/currency-converter";
import { formatGameDate } from "@/engine/timeline/calendar";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useSettingsStore } from "@/store/settings-store";
import type { EconomyState } from "../../economy/economy-types";

interface TransactionLogProps {
  economy: EconomyState;
  getSummary: () => {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    raceEntrySpending: number;
    prizeEarnings: number;
    workEarnings: number;
    sponsorEarnings: number;
    netWorthVsStart: number;
  };
}

export function TransactionLog({ economy, getSummary }: TransactionLogProps) {
  const { t } = useTranslation();
  const summary = getSummary();
  const recentTransactions = economy.transactions.slice(0, 20);
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-3xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="text-center">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">{t("economy.balance_label" as TranslationKey)}</div>
          <div
            className={`text-5xl font-black font-heading tracking-tight ${summary.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {formatCurrency(summary.balance, preferredCurrency)}
          </div>
          <div
            className={`text-sm mt-2 font-semibold bg-slate-50 dark:bg-slate-800/50 inline-block px-3 py-1 rounded-full ${summary.netWorthVsStart >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {summary.netWorthVsStart >= 0 ? "↗" : "↘"} {formatCurrency(Math.abs(summary.netWorthVsStart), preferredCurrency)} {t("economy.net_change" as TranslationKey)}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t("economy.total_earned" as TranslationKey)}
          value={formatCurrency(summary.totalEarned, preferredCurrency)}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          label={t("economy.total_spent" as TranslationKey)}
          value={formatCurrency(summary.totalSpent, preferredCurrency)}
          color="text-red-600 dark:text-red-400"
        />
        <StatCard
          label={t("economy.race_entry_costs" as TranslationKey)}
          value={formatCurrency(summary.raceEntrySpending, preferredCurrency)}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label={t("economy.prize_earnings" as TranslationKey)}
          value={formatCurrency(summary.prizeEarnings, preferredCurrency)}
          color="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Earning Breakdown */}
      <div className="space-y-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-[#E5E7EB] dark:border-slate-800 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          💰 {t("economy.earnings_breakdown" as TranslationKey)}
        </h3>
        <div className="space-y-3">
          <EarningBar
            label={t("economy.race_prizes" as TranslationKey)}
            amount={summary.prizeEarnings}
            total={summary.totalEarned}
            color="bg-indigo-500"
            preferredCurrency={preferredCurrency}
          />
          <EarningBar
            label={t("economy.work" as TranslationKey)}
            amount={summary.workEarnings}
            total={summary.totalEarned}
            color="bg-blue-500"
            preferredCurrency={preferredCurrency}
          />
          <EarningBar
            label={t("economy.sponsors" as TranslationKey)}
            amount={summary.sponsorEarnings}
            total={summary.totalEarned}
            color="bg-green-500"
            preferredCurrency={preferredCurrency}
          />
          <EarningBar
            label={t("economy.other" as TranslationKey)}
            amount={
              summary.totalEarned -
              summary.prizeEarnings -
              summary.workEarnings -
              summary.sponsorEarnings
            }
            total={summary.totalEarned}
            color="bg-slate-400 dark:bg-slate-500"
            preferredCurrency={preferredCurrency}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-[#E5E7EB] dark:border-slate-800 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          📜 {t("economy.recent_transactions" as TranslationKey)}
        </h3>
        {recentTransactions.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400 text-sm text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            {t("economy.no_transactions" as TranslationKey)}
          </div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-3 rounded-xl text-sm transition-colors border ${
                  tx.type === "earn"
                    ? "bg-green-50/50 hover:bg-green-100/50 dark:bg-green-950/10 dark:hover:bg-green-900/20 border-green-100 dark:border-green-900/30"
                    : "bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/10 dark:hover:bg-red-900/20 border-red-100 dark:border-red-900/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${tx.type === "earn" ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}`}>
                    <span className="text-lg">
                      {tx.type === "earn" ? "💰" : "💸"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 capitalize mt-0.5">
                      {tx.category.replace(/_/g, " ")} • {formatGameDate(tx.dayIndex)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-black tracking-tight shrink-0 ml-3 text-[15px] ${
                    tx.type === "earn" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {tx.type === "earn" ? "+" : "-"}
                  {formatCurrency(tx.amount, preferredCurrency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/30 p-4 transition-transform hover:scale-[1.02] shadow-sm">
      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-black font-heading ${color}`}>{value}</div>
    </div>
  );
}

interface EarningBarProps {
  label: string;
  amount: number;
  total: number;
  color: string;
  preferredCurrency: any;
}

function EarningBar({
  label,
  amount,
  total,
  color,
  preferredCurrency,
}: EarningBarProps) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 text-sm group">
      <span className="w-24 text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{label}</span>
      <div className="flex-grow h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <span
        className={`w-28 text-right font-bold ${percentage > 0 ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}
      >
        {formatCurrency(amount, preferredCurrency)}
      </span>
    </div>
  );
}
