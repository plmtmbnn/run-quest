// expense-store.ts
// Zustand store for recurring expenses system.

import { create } from "zustand";
import {
  calculateDueExpenses,
  getActiveBenefits as getActiveBenefitsFromHelper,
  getMonthlyExpenseTotal,
  getWeeklyExpenseTotal,
  processExpenses,
  RECURRING_EXPENSES,
  type ExpenseCategory,
  type ExpenseProcessingResult,
  type ExpenseState,
  type ExpenseTransaction,
  type RecurringExpense,
} from "@/economy/recurring-expenses";
import { storageRepository } from "@/storage/storage-repository";

const STORAGE_KEY = "runquest.expenses";

export interface StoredExpenseState {
  version: number;
  expenseState: ExpenseState;
}

export const DEFAULT_EXPENSE_STATE: ExpenseState = {
  activeExpenses: [],
  lastProcessedDay: 0,
  totalPaidAllTime: 0,
  unpaidExpenses: 0,
  expenseHistory: [],
};

interface ExpenseStore {
  expenseState: ExpenseState;
  isInitialized: boolean;

  // Actions & Management
  initialize: () => void;
  toggleExpense: (expenseId: string) => void;
  processScheduledExpenses: (
    dayIndex: number,
    currentBalance: number,
    playerLevel: number
  ) => ExpenseProcessingResult;

  // Queries
  getDueExpenses: (dayIndex: number, playerLevel: number) => RecurringExpense[];
  getActiveBenefits: () => Record<string, number>;
  getWeeklyTotal: (playerLevel: number) => number;
  getMonthlyTotal: (playerLevel: number) => number;
  canAffordExpenses: (currentBalance: number, daysAhead: number, playerLevel: number) => boolean;
  hasUnpaidExpenses: () => boolean;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  reset: () => void;
}

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  expenseState: DEFAULT_EXPENSE_STATE,
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;
    get().loadFromStorage();
    set({ isInitialized: true });
  },

  toggleExpense: (expenseId: string) => {
    const expense = RECURRING_EXPENSES.find((e) => e.id === expenseId);
    if (!expense || expense.mandatory) return;

    set((state) => {
      const active = state.expenseState.activeExpenses.includes(expenseId)
        ? state.expenseState.activeExpenses.filter((id) => id !== expenseId)
        : [...state.expenseState.activeExpenses, expenseId];

      const nextState: ExpenseState = {
        ...state.expenseState,
        activeExpenses: active,
      };

      storageRepository.saveCustom(STORAGE_KEY, {
        version: 1,
        expenseState: nextState,
      });

      return { expenseState: nextState };
    });
  },

  processScheduledExpenses: (dayIndex, currentBalance, playerLevel) => {
    const currentState = get().expenseState;

    const dueExpenses = calculateDueExpenses(
      dayIndex,
      currentState.lastProcessedDay,
      currentState.activeExpenses,
      playerLevel
    );

    const result = processExpenses(dueExpenses, currentBalance, playerLevel, dayIndex);

    if (result.dueExpenses.length > 0) {
      const transaction: ExpenseTransaction = {
        dayIndex,
        expenses: result.dueExpenses,
        totalAmount: result.totalDue,
        balanceAfter: result.balanceAfter,
        successful: result.canAfford,
      };

      const newUnpaid = result.canAfford ? 0 : currentState.unpaidExpenses + 1;
      const newTotalPaid = currentState.totalPaidAllTime + (result.canAfford ? result.totalDue : 0);

      const nextState: ExpenseState = {
        ...currentState,
        lastProcessedDay: dayIndex,
        totalPaidAllTime: newTotalPaid,
        unpaidExpenses: newUnpaid,
        expenseHistory: [...currentState.expenseHistory, transaction].slice(-30),
      };

      set({ expenseState: nextState });
      storageRepository.saveCustom(STORAGE_KEY, {
        version: 1,
        expenseState: nextState,
      });
    }

    return result;
  },

  getDueExpenses: (dayIndex: number, playerLevel: number) => {
    const state = get().expenseState;
    return calculateDueExpenses(
      dayIndex,
      state.lastProcessedDay,
      state.activeExpenses,
      playerLevel
    );
  },

  getActiveBenefits: () => {
    return getActiveBenefitsFromHelper(get().expenseState.activeExpenses);
  },

  getWeeklyTotal: (playerLevel: number) => {
    return getWeeklyExpenseTotal(get().expenseState.activeExpenses, playerLevel);
  },

  getMonthlyTotal: (playerLevel: number) => {
    return getMonthlyExpenseTotal(get().expenseState.activeExpenses, playerLevel);
  },

  canAffordExpenses: (currentBalance: number, daysAhead: number, playerLevel: number) => {
    const weeklyTotal = getWeeklyExpenseTotal(get().expenseState.activeExpenses, playerLevel);
    const requiredAmount = (weeklyTotal / 7) * daysAhead;
    return currentBalance >= requiredAmount;
  },

  hasUnpaidExpenses: () => {
    return get().expenseState.unpaidExpenses > 0;
  },

  loadFromStorage: () => {
    try {
      const stored = storageRepository.loadCustom<StoredExpenseState>(STORAGE_KEY);
      if (stored && stored.expenseState) {
        set({ expenseState: stored.expenseState });
      }
    } catch (e) {
      console.warn("Failed to load expense state from storage", e);
    }
  },

  saveToStorage: () => {
    try {
      storageRepository.saveCustom(STORAGE_KEY, {
        version: 1,
        expenseState: get().expenseState,
      });
    } catch (e) {
      console.warn("Failed to save expense state to storage", e);
    }
  },

  reset: () => {
    set({ expenseState: DEFAULT_EXPENSE_STATE });
    storageRepository.saveCustom(STORAGE_KEY, {
      version: 1,
      expenseState: DEFAULT_EXPENSE_STATE,
    });
  },
}));
