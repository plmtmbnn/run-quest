import { beforeEach, describe, expect, it } from "vitest";
import {
  calculateDueExpenses,
  calculateExpenseAmount,
  getActiveBenefits,
  getExpenseById,
  isExpenseDue,
  processExpenses,
  RECURRING_EXPENSES,
} from "../../../src/economy/recurring-expenses";
import { useExpenseStore } from "../../../src/store/expense-store";

describe("Recurring Expenses Engine", () => {
  beforeEach(() => {
    useExpenseStore.getState().reset();
  });

  describe("Expense Scaling & Database", () => {
    it("scales living expenses correctly with player level", () => {
      const livingExpense = getExpenseById("living_expenses")!;
      expect(livingExpense).toBeDefined();

      expect(calculateExpenseAmount(livingExpense, 1)).toBe(160); // 150 + 1*10
      expect(calculateExpenseAmount(livingExpense, 5)).toBe(200); // 150 + 5*10
      expect(calculateExpenseAmount(livingExpense, 10)).toBe(250); // 150 + 10*10
    });

    it("returns base amount for non-scaling expenses", () => {
      const gymExpense = getExpenseById("gym_membership")!;
      expect(calculateExpenseAmount(gymExpense, 1)).toBe(100);
      expect(calculateExpenseAmount(gymExpense, 10)).toBe(100);
    });
  });

  describe("Frequency Check (isExpenseDue)", () => {
    it("correctly identifies weekly expense due days", () => {
      expect(isExpenseDue("weekly", 7, 0)).toBe(true);
      expect(isExpenseDue("weekly", 14, 7)).toBe(true);
      expect(isExpenseDue("weekly", 5, 0)).toBe(false);
      expect(isExpenseDue("weekly", 6, 0)).toBe(false);
    });

    it("correctly identifies monthly expense due days", () => {
      expect(isExpenseDue("monthly", 30, 0)).toBe(true);
      expect(isExpenseDue("monthly", 60, 30)).toBe(true);
      expect(isExpenseDue("monthly", 15, 0)).toBe(false);
    });
  });

  describe("calculateDueExpenses", () => {
    it("includes mandatory living expenses for level 1 player on day 30", () => {
      const due = calculateDueExpenses(30, 0, [], 1);
      expect(due.map((e) => e.id)).toContain("living_expenses");
    });

    it("excludes optional expenses if not in activeExpenses list", () => {
      const due = calculateDueExpenses(7, 0, [], 5);
      expect(due.map((e) => e.id)).not.toContain("gym_membership");
    });

    it("includes optional expenses if active and unlocked", () => {
      const due = calculateDueExpenses(7, 0, ["gym_membership"], 3);
      expect(due.map((e) => e.id)).toContain("gym_membership");
    });

    it("excludes active optional expenses if player level is too low", () => {
      const due = calculateDueExpenses(7, 0, ["personal_coaching"], 2); // Unlocked at level 8
      expect(due.map((e) => e.id)).not.toContain("personal_coaching");
    });
  });

  describe("processExpenses", () => {
    it("deducts money when funds are sufficient", () => {
      const dueExpenses = calculateDueExpenses(30, 0, ["gym_membership"], 3);
      const result = processExpenses(dueExpenses, 1000, 3, 30);

      // living (180) + gym (100) = 280
      expect(result.canAfford).toBe(true);
      expect(result.totalDue).toBe(280);
      expect(result.balanceAfter).toBe(720);
    });

    it("handles insufficient funds gracefully and provides consequences", () => {
      const dueExpenses = calculateDueExpenses(30, 0, [], 1);
      const result = processExpenses(dueExpenses, 100, 1, 30);

      expect(result.canAfford).toBe(false);
      expect(result.consequences.length).toBeGreaterThan(0);
      expect(result.balanceAfter).toBe(100);
    });
  });

  describe("getActiveBenefits", () => {
    it("aggregates benefits from active optional expenses", () => {
      const benefits = getActiveBenefits(["gym_membership", "personal_coaching"]);
      // gym (+5%) + personal_coaching (+10%) = 15%
      expect(benefits.trainingEffectiveness).toBeCloseTo(0.15);
      expect(benefits.xpBonus).toBeCloseTo(0.10);
    });
  });

  describe("useExpenseStore", () => {
    it("toggles optional expenses", () => {
      const store = useExpenseStore.getState();
      expect(store.expenseState.activeExpenses).not.toContain("gym_membership");

      store.toggleExpense("gym_membership");
      expect(useExpenseStore.getState().expenseState.activeExpenses).toContain("gym_membership");

      store.toggleExpense("gym_membership");
      expect(useExpenseStore.getState().expenseState.activeExpenses).not.toContain("gym_membership");
    });

    it("cannot toggle mandatory living expenses", () => {
      const store = useExpenseStore.getState();
      store.toggleExpense("living_expenses");
      expect(useExpenseStore.getState().expenseState.activeExpenses).not.toContain("living_expenses");
    });

    it("tracks payment history and unpaid status in store", () => {
      const store = useExpenseStore.getState();
      
      // Process with sufficient funds on day 30 (monthly due day)
      const res1 = store.processScheduledExpenses(30, 1000, 1);
      expect(res1.canAfford).toBe(true);
      expect(useExpenseStore.getState().hasUnpaidExpenses()).toBe(false);
      expect(useExpenseStore.getState().expenseState.expenseHistory).toHaveLength(1);

      // Process with insufficient funds on day 60
      const res2 = store.processScheduledExpenses(60, 50, 1);
      expect(res2.canAfford).toBe(false);
      expect(useExpenseStore.getState().hasUnpaidExpenses()).toBe(true);
    });
  });
});
