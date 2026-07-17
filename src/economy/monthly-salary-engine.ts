// Monthly Salary Engine (MVP)
// Credits a fixed monthly salary on the first day of each month.
// Uses the game's DAY constants to determine month boundaries.
// This function mutates the provided GameState and returns the updated state.

import type { GameState } from "@/engine/timeline/time-types";
import { DAYS_PER_MONTH } from "@/engine/timeline/time-types";
import { formatCurrency } from "@/economy/currency-converter";
import { recordTransaction } from "@/economy/earning-engine";

/** Fixed monthly salary amount (could be derived from active job later) */
const MONTHLY_SALARY = 500; // base amount in default currency units

export function processMonthlySalary(state: GameState): GameState {
  // Only credit on the first day of a month (dayIndex starts at 0)
  if (state.dayIndex % DAYS_PER_MONTH !== 0) return state;

  // Record transaction using economy helper
  const { economy: updatedEconomy } = recordTransaction(
    state.economy,
    "earn",
    "work",
    MONTHLY_SALARY,
    state.dayIndex,
    `Monthly salary (${formatCurrency(MONTHLY_SALARY, "USD")})`
  );

  // Update resources money to reflect new balance
  const newResources = { ...state.resources, money: updatedEconomy.currentBalance };

  return { ...state, economy: updatedEconomy, resources: newResources };
}

