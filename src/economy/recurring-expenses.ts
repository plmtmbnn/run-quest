// recurring-expenses.ts
// Recurring expenses system for the game economy.

export type ExpenseCategory = 'living' | 'training' | 'medical' | 'equipment';
export type ExpenseFrequency = 'daily' | 'weekly' | 'monthly';

export interface ExpenseBenefits {
  trainingEffectiveness?: number; // 0.05 = +5%
  xpBonus?: number; // 0.10 = +10%
  injuryRiskReduction?: number; // 0.20 = -20%
  recoverySpeed?: number; // 0.10 = +10%
  treatmentDiscount?: number; // 0.40 = 40% off
  staminaRecovery?: number; // 0.15 = +15%
  nutritionEfficiency?: number; // 0.20 = +20%
}

export interface RecurringExpense {
  id: string;
  name: string;
  description: string;
  category: ExpenseCategory;
  baseAmount: number;
  frequency: ExpenseFrequency;
  mandatory: boolean;
  unlockedAtLevel: number;
  benefits?: ExpenseBenefits;
}

export interface ExpenseTransaction {
  dayIndex: number;
  expenses: Array<{
    id: string;
    name: string;
    amount: number;
    category: ExpenseCategory;
  }>;
  totalAmount: number;
  balanceAfter: number;
  successful: boolean;
}

export interface ExpenseState {
  activeExpenses: string[]; // IDs of enabled optional expenses
  lastProcessedDay: number;
  totalPaidAllTime: number;
  unpaidExpenses: number; // Count of unpaid mandatory expense occurrences
  expenseHistory: ExpenseTransaction[];
}

export interface ExpenseProcessingItem {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  mandatory: boolean;
}

export interface ExpenseProcessingResult {
  dueExpenses: ExpenseProcessingItem[];
  totalDue: number;
  canAfford: boolean;
  balanceAfter: number;
  consequences: string[];
}

/**
 * Default list of recurring expenses.
 */
export const RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: 'living_expenses',
    name: 'expenses.living_expenses.name',
    description: 'expenses.living_expenses.description',
    category: 'living',
    baseAmount: 150,
    frequency: 'monthly',
    mandatory: true,
    unlockedAtLevel: 1,
  },
  {
    id: 'gym_membership',
    name: 'expenses.gym_membership.name',
    description: 'expenses.gym_membership.description',
    category: 'training',
    baseAmount: 100,
    frequency: 'weekly',
    mandatory: false,
    unlockedAtLevel: 3,
    benefits: {
      trainingEffectiveness: 0.05,
    },
  },
  {
    id: 'personal_coaching',
    name: 'expenses.personal_coaching.name',
    description: 'expenses.personal_coaching.description',
    category: 'training',
    baseAmount: 250,
    frequency: 'weekly',
    mandatory: false,
    unlockedAtLevel: 8,
    benefits: {
      trainingEffectiveness: 0.10,
      xpBonus: 0.10,
    },
  },
  {
    id: 'health_insurance',
    name: 'expenses.health_insurance.name',
    description: 'expenses.health_insurance.description',
    category: 'medical',
    baseAmount: 150,
    frequency: 'weekly',
    mandatory: false,
    unlockedAtLevel: 5,
    benefits: {
      treatmentDiscount: 0.40,
      recoverySpeed: 0.10,
    },
  },
  {
    id: 'sports_massage',
    name: 'expenses.sports_massage.name',
    description: 'expenses.sports_massage.description',
    category: 'medical',
    baseAmount: 80,
    frequency: 'weekly',
    mandatory: false,
    unlockedAtLevel: 6,
    benefits: {
      injuryRiskReduction: 0.20,
    },
  },
  {
    id: 'nutritionist',
    name: 'expenses.nutritionist.name',
    description: 'expenses.nutritionist.description',
    category: 'training',
    baseAmount: 400,
    frequency: 'monthly',
    mandatory: false,
    unlockedAtLevel: 12,
    benefits: {
      staminaRecovery: 0.15,
      nutritionEfficiency: 0.20,
    },
  },
];

/**
 * Get expense by ID.
 */
export function getExpenseById(expenseId: string): RecurringExpense | null {
  return RECURRING_EXPENSES.find(e => e.id === expenseId) || null;
}

/**
 * Calculate Living Expense breakdown (base living + race logistics like accommodation & tickets).
 */
export function calculateLivingBreakdown(playerLevel: number, registeredCount: number = 0) {
  const baseLiving = 150 + Math.max(1, playerLevel) * 10;
  const travelLogistics = Math.max(0, registeredCount) * 200; // hotel, accommodation, flight/bus tickets
  return {
    baseLiving,
    travelLogistics,
    total: baseLiving + travelLogistics,
    registeredCount,
  };
}

/**
 * Calculate amount for an expense, accounting for level scaling and active race registrations.
 */
export function calculateExpenseAmount(
  expense: RecurringExpense,
  playerLevel: number,
  registeredCount: number = 0
): number {
  if (expense.id === 'living_expenses') {
    const breakdown = calculateLivingBreakdown(playerLevel, registeredCount);
    return breakdown.total;
  }
  return expense.baseAmount;
}

/**
 * Check if an expense is due based on frequency and time passed.
 */
export function isExpenseDue(
  frequency: ExpenseFrequency,
  currentDay: number,
  lastProcessedDay: number
): boolean {
  if (currentDay <= lastProcessedDay) return false;
  switch (frequency) {
    case 'daily':
      return currentDay > lastProcessedDay;
    case 'weekly': {
      const weeksPassed = Math.floor(currentDay / 7) - Math.floor(lastProcessedDay / 7);
      return weeksPassed > 0;
    }
    case 'monthly': {
      const monthsPassed = Math.floor(currentDay / 30) - Math.floor(lastProcessedDay / 30);
      return monthsPassed > 0;
    }
    default:
      return false;
  }
}

/**
 * Calculate which expenses are due on a given day.
 */
export function calculateDueExpenses(
  dayIndex: number,
  lastProcessedDay: number,
  activeExpenses: string[],
  playerLevel: number
): RecurringExpense[] {
  const dueExpenses: RecurringExpense[] = [];
  for (const expense of RECURRING_EXPENSES) {
    if (playerLevel < expense.unlockedAtLevel) continue;
    if (!expense.mandatory && !activeExpenses.includes(expense.id)) continue;
    if (isExpenseDue(expense.frequency, dayIndex, lastProcessedDay)) {
      dueExpenses.push(expense);
    }
  }
  return dueExpenses;
}

/**
 * Process expenses deduction and return transaction results.
 */
export function processExpenses(
  dueExpenses: RecurringExpense[],
  currentBalance: number,
  playerLevel: number,
  dayIndex: number,
  registeredCount: number = 0
): ExpenseProcessingResult {
  const expenseItems: ExpenseProcessingItem[] = dueExpenses.map(expense => ({
    id: expense.id,
    name: expense.name,
    amount: calculateExpenseAmount(expense, playerLevel, registeredCount),
    category: expense.category,
    mandatory: expense.mandatory,
  }));

  const totalDue = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const canAfford = currentBalance >= totalDue;
  const balanceAfter = canAfford ? currentBalance - totalDue : currentBalance;

  const consequences: string[] = [];
  if (!canAfford) {
    const unpaidMandatory = expenseItems.filter(e => e.mandatory);
    if (unpaidMandatory.length > 0) {
      consequences.push('Cannot train or race until expenses are paid');
    }
  }

  return {
    dueExpenses: expenseItems,
    totalDue,
    canAfford,
    balanceAfter,
    consequences,
  };
}

/**
 * Aggregate active benefits from enabled expenses.
 */
export function getActiveBenefits(activeExpenses: string[]): Record<string, number> {
  const benefits: Record<string, number> = {
    trainingEffectiveness: 0,
    xpBonus: 0,
    injuryRiskReduction: 0,
    recoverySpeed: 0,
    treatmentDiscount: 0,
    staminaRecovery: 0,
    nutritionEfficiency: 0,
  };

  for (const expenseId of activeExpenses) {
    const expense = getExpenseById(expenseId);
    if (expense?.benefits) {
      Object.entries(expense.benefits).forEach(([key, value]) => {
        if (value !== undefined) {
          benefits[key] = (benefits[key] || 0) + value;
        }
      });
    }
  }

  return benefits;
}

/**
 * Calculate weekly total cost for active expenses + mandatory expenses.
 */
export function getWeeklyExpenseTotal(
  activeExpenses: string[],
  playerLevel: number,
  registeredCount: number = 0
): number {
  let total = 0;
  for (const expense of RECURRING_EXPENSES) {
    if (playerLevel < expense.unlockedAtLevel) continue;
    if (expense.mandatory || activeExpenses.includes(expense.id)) {
      const amount = calculateExpenseAmount(expense, playerLevel, registeredCount);
      if (expense.frequency === 'weekly') {
        total += amount;
      } else if (expense.frequency === 'daily') {
        total += amount * 7;
      } else if (expense.frequency === 'monthly') {
        total += Math.round(amount / 4);
      }
    }
  }
  return total;
}

/**
 * Calculate monthly total cost for active expenses + mandatory expenses.
 */
export function getMonthlyExpenseTotal(
  activeExpenses: string[],
  playerLevel: number,
  registeredCount: number = 0
): number {
  let total = 0;
  for (const expense of RECURRING_EXPENSES) {
    if (playerLevel < expense.unlockedAtLevel) continue;
    if (expense.mandatory || activeExpenses.includes(expense.id)) {
      const amount = calculateExpenseAmount(expense, playerLevel, registeredCount);
      if (expense.frequency === 'weekly') {
        total += amount * 4;
      } else if (expense.frequency === 'daily') {
        total += amount * 30;
      } else if (expense.frequency === 'monthly') {
        total += amount;
      }
    }
  }
  return total;
}