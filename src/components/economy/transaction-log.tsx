/**
 * Transaction Log Component (Sprint 26 - Task 6)
 * 
 * Displays recent financial transactions.
 */

"use client";

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

export function TransactionLog({
  economy,
  getSummary,
}: TransactionLogProps) {
  const summary = getSummary();
  const recentTransactions = economy.transactions.slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Current Balance</div>
          <div className={`text-4xl font-bold ${summary.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${summary.balance}
          </div>
          <div className={`text-sm mt-1 ${summary.netWorthVsStart >= 0 ? "text-green-400" : "text-red-400"}`}>
            {summary.netWorthVsStart >= 0 ? "+" : ""}${summary.netWorthVsStart} net change
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Earned" value={`$${summary.totalEarned}`} color="text-green-400" />
        <StatCard label="Total Spent" value={`$${summary.totalSpent}`} color="text-red-400" />
        <StatCard label="Race Entry Costs" value={`$${summary.raceEntrySpending}`} color="text-yellow-400" />
        <StatCard label="Prize Earnings" value={`$${summary.prizeEarnings}`} color="text-purple-400" />
      </div>

      {/* Earning Breakdown */}
      <div className="space-y-1">
        <h3 className="font-semibold text-white text-sm">Earnings Breakdown</h3>
        <EarningBar label="Race Prizes" amount={summary.prizeEarnings} total={summary.totalEarned} color="bg-purple-500" />
        <EarningBar label="Work" amount={summary.workEarnings} total={summary.totalEarned} color="bg-blue-500" />
        <EarningBar label="Sponsors" amount={summary.sponsorEarnings} total={summary.totalEarned} color="bg-green-500" />
        <EarningBar label="Other" amount={summary.totalEarned - summary.prizeEarnings - summary.workEarnings - summary.sponsorEarnings} total={summary.totalEarned} color="bg-gray-500" />
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="font-semibold text-white text-sm mb-2">Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">No transactions yet</div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  tx.type === "earn"
                    ? "bg-green-500/5 hover:bg-green-500/10"
                    : "bg-red-500/5 hover:bg-red-500/10"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{tx.type === "earn" ? "💰" : "💸"}</span>
                  <div className="min-w-0">
                    <p className="text-gray-200 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {tx.category.replace(/_/g, " ")} • Day {tx.dayIndex}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold shrink-0 ml-2 ${
                    tx.type === "earn" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "earn" ? "+" : "-"}${tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}

function EarningBar({
  label,
  amount,
  total,
  color,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 text-gray-400 text-xs">{label}</span>
      <div className="flex-1 h-4 rounded bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded ${color} transition-all`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <span className={`w-16 text-right font-medium ${percentage > 0 ? "text-gray-200" : "text-gray-500"}`}>
        ${amount}
      </span>
    </div>
  );
}
