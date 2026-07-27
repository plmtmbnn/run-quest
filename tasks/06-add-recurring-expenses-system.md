# Task: Add Weekly Recurring Expenses System

## Overview
Implement a recurring expenses system to create ongoing financial pressure and meaningful economic decisions. Players must manage weekly living costs, optional training expenses, and balance earning vs. spending.

## Problem Statement
Currently, money only flows one direction - players earn from work, sponsorships, and race prizes, but have limited ongoing expenses. This makes money accumulate without meaningful spending decisions beyond one-time shop purchases.

## Proposed System

### Expense Categories

#### 1. **Mandatory Expenses**
Cannot be disabled, automatically deducted:

- **Living Expenses** (Weekly)
  - Base cost: $500/week
  - Scales with player level: `500 + (level * 25)`
  - Covers: Food, housing, utilities, transportation
  - Cannot race or train if unpaid (blocks activities)

#### 2. **Training Expenses** (Optional)
Can be enabled/disabled by player:

- **Gym Membership** (Weekly)
  - Cost: $100/week
  - Benefit: +5% training effectiveness
  - Unlocked at: Level 3

- **Personal Coaching** (Weekly)
  - Cost: $250/week
  - Benefit: Better training plan recommendations, +10% XP from training
  - Unlocked at: Level 8

- **Nutritionist Consultation** (Monthly)
  - Cost: $400/month
  - Benefit: +15% stamina recovery, nutrition items last 20% longer
  - Unlocked at: Level 12

#### 3. **Medical Expenses** (Optional)
Preventive care:

- **Health Insurance** (Weekly)
  - Cost: $150/week
  - Benefit: 40% discount on injury treatments, faster recovery (+10%)
  - Unlocked at: Level 5

- **Sports Massage** (Weekly)
  - Cost: $80/week
  - Benefit: -20% injury risk, -10% overtrain accumulation
  - Unlocked at: Level 6

#### 4. **Equipment Maintenance** (Automatic)
Based on usage:

- **Shoe Degradation**
  - Cost: 5% of shoe value per 100km
  - Must repair or replace when condition < 20%
  - Worn shoes: -15% performance, +25% injury risk

- **Gear Maintenance** (Monthly)
  - Cost: $50-200 depending on gear owned
  - Skipping maintenance: Gear effectiveness reduced by 30%

## Implementation Plan

### Phase 1: Core Expenses System

#### Step 1: Define Expense Data Model
```typescript
// src/economy/recurring-expenses-types.ts
export type ExpenseFrequency = 'daily' | 'weekly' | 'monthly';
export type ExpenseCategory = 'living' | 'training' | 'medical' | 'equipment';

export interface RecurringExpense {
  id: string;
  name: TranslationKey;
  description: TranslationKey;
  category: ExpenseCategory;
  baseAmount: number;
  frequency: ExpenseFrequency;
  
  // Availability
  mandatory: boolean;
  unlockedAtLevel: number;
  
  // Benefits
  benefits?: {
    trainingEffectiveness?: number;    // 0.05 = +5%
    xpBonus?: number;                  // 0.10 = +10%
    injuryRiskReduction?: number;      // 0.20 = -20%
    recoverySpeed?: number;            // 0.10 = +10%
    treatmentDiscount?: number;        // 0.40 = 40% off
    staminaRecovery?: number;          // 0.15 = +15%
    nutritionEfficiency?: number;      // 0.20 = +20%
  };
}

export interface ExpenseState {
  activeExpenses: string[];           // IDs of enabled optional expenses
  lastProcessedDay: number;
  totalPaidAllTime: number;
  unpaidExpenses: number;             // Days with unpaid mandatory expenses
  expenseHistory: ExpenseTransaction[];
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
```

#### Step 2: Create Expense Database
```typescript
// src/economy/recurring-expenses-database.ts
export const RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: 'living_expenses',
    name: 'expenses.living_expenses.name' as TranslationKey,
    description: 'expenses.living_expenses.description' as TranslationKey,
    category: 'living',
    baseAmount: 500,
    frequency: 'weekly',
    mandatory: true,
    unlockedAtLevel: 1,
  },
  {
    id: 'gym_membership',
    name: 'expenses.gym_membership.name' as TranslationKey,
    description: 'expenses.gym_membership.description' as TranslationKey,
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
    name: 'expenses.personal_coaching.name' as TranslationKey,
    description: 'expenses.personal_coaching.description' as TranslationKey,
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
    name: 'expenses.health_insurance.name' as TranslationKey,
    description: 'expenses.health_insurance.description' as TranslationKey,
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
    name: 'expenses.sports_massage.name' as TranslationKey,
    description: 'expenses.sports_massage.description' as TranslationKey,
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
    name: 'expenses.nutritionist.name' as TranslationKey,
    description: 'expenses.nutritionist.description' as TranslationKey,
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
```

#### Step 3: Create Expense Processing Engine
```typescript
// src/economy/expense-engine.ts
export interface ExpenseProcessingResult {
  dueExpenses: Array<{
    id: string;
    name: string;
    amount: number;
    category: ExpenseCategory;
    mandatory: boolean;
  }>;
  totalDue: number;
  canAfford: boolean;
  balanceAfter: number;
  consequences: string[];
}

/**
 * Calculate which expenses are due on a given day
 */
export function calculateDueExpenses(
  dayIndex: number,
  lastProcessedDay: number,
  activeExpenses: string[],
  playerLevel: number
): RecurringExpense[] {
  const dueExpenses: RecurringExpense[] = [];
  
  // Check each frequency type
  const daysElapsed = dayIndex - lastProcessedDay;
  
  for (const expense of RECURRING_EXPENSES) {
    // Skip if not unlocked
    if (playerLevel < expense.unlockedAtLevel) continue;
    
    // Skip if optional and not active
    if (!expense.mandatory && !activeExpenses.includes(expense.id)) continue;
    
    const isDue = isExpenseDue(
      expense.frequency,
      dayIndex,
      lastProcessedDay
    );
    
    if (isDue) {
      dueExpenses.push(expense);
    }
  }
  
  return dueExpenses;
}

/**
 * Check if expense is due based on frequency
 */
function isExpenseDue(
  frequency: ExpenseFrequency,
  currentDay: number,
  lastProcessedDay: number
): boolean {
  switch (frequency) {
    case 'daily':
      return currentDay > lastProcessedDay;
    case 'weekly':
      const weeksPassed = Math.floor(currentDay / 7) - Math.floor(lastProcessedDay / 7);
      return weeksPassed > 0;
    case 'monthly':
      const monthsPassed = Math.floor(currentDay / 30) - Math.floor(lastProcessedDay / 30);
      return monthsPassed > 0;
  }
}

/**
 * Process expense deduction
 */
export function processExpenses(
  dueExpenses: RecurringExpense[],
  currentBalance: number,
  playerLevel: number,
  dayIndex: number
): ExpenseProcessingResult {
  const expenseItems = dueExpenses.map(expense => {
    // Scale living expenses with level
    let amount = expense.baseAmount;
    if (expense.id === 'living_expenses') {
      amount = 500 + (playerLevel * 25);
    }
    
    return {
      id: expense.id,
      name: expense.name,
      amount,
      category: expense.category,
      mandatory: expense.mandatory,
    };
  });
  
  const totalDue = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const canAfford = currentBalance >= totalDue;
  const balanceAfter = canAfford ? currentBalance - totalDue : currentBalance;
  
  const consequences: string[] = [];
  if (!canAfford) {
    const unpaidMandatory = expenseItems.filter(e => e.mandatory);
    if (unpaidMandatory.length > 0) {
      consequences.push('Cannot train or race until expenses are paid');
      consequences.push('Sponsor reputation decreased');
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
 * Get active benefits from paid expenses
 */
export function getActiveBenefits(
  activeExpenses: string[]
): Record<string, number> {
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
    const expense = RECURRING_EXPENSES.find(e => e.id === expenseId);
    if (expense?.benefits) {
      Object.entries(expense.benefits).forEach(([key, value]) => {
        benefits[key] = (benefits[key] || 0) + value;
      });
    }
  }
  
  return benefits;
}
```

#### Step 4: Create Expense Store
```typescript
// src/economy/expense-store.ts
interface ExpenseStore {
  expenseState: ExpenseState;
  
  // Expense management
  toggleExpense: (expenseId: string) => void;
  processScheduledExpenses: (dayIndex: number, currentBalance: number, playerLevel: number) => ExpenseProcessingResult;
  
  // Queries
  getDueExpenses: (dayIndex: number, playerLevel: number) => RecurringExpense[];
  getActiveBenefits: () => Record<string, number>;
  getWeeklyTotal: (playerLevel: number) => number;
  getMonthlyTotal: (playerLevel: number) => number;
  canAffordExpenses: (currentBalance: number, daysAhead: number, playerLevel: number) => boolean;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenseState: {
        activeExpenses: [],
        lastProcessedDay: 0,
        totalPaidAllTime: 0,
        unpaidExpenses: 0,
        expenseHistory: [],
      },
      
      toggleExpense: (expenseId) => {
        const expense = RECURRING_EXPENSES.find(e => e.id === expenseId);
        if (!expense || expense.mandatory) return;
        
        set(state => ({
          expenseState: {
            ...state.expenseState,
            activeExpenses: state.expenseState.activeExpenses.includes(expenseId)
              ? state.expenseState.activeExpenses.filter(id => id !== expenseId)
              : [...state.expenseState.activeExpenses, expenseId],
          },
        }));
      },
      
      processScheduledExpenses: (dayIndex, currentBalance, playerLevel) => {
        const state = get().expenseState;
        const dueExpenses = calculateDueExpenses(
          dayIndex,
          state.lastProcessedDay,
          state.activeExpenses,
          playerLevel
        );
        
        const result = processExpenses(dueExpenses, currentBalance, playerLevel, dayIndex);
        
        // Record transaction
        if (result.dueExpenses.length > 0) {
          const transaction: ExpenseTransaction = {
            dayIndex,
            expenses: result.dueExpenses,
            totalAmount: result.totalDue,
            balanceAfter: result.balanceAfter,
            successful: result.canAfford,
          };
          
          set(state => ({
            expenseState: {
              ...state.expenseState,
              lastProcessedDay: dayIndex,
              totalPaidAllTime: state.expenseState.totalPaidAllTime + (result.canAfford ? result.totalDue : 0),
              unpaidExpenses: result.canAfford ? 0 : state.expenseState.unpaidExpenses + 1,
              expenseHistory: [...state.expenseState.expenseHistory, transaction].slice(-30), // Keep last 30
            },
          }));
        }
        
        return result;
      },
      
      getActiveBenefits: () => {
        return getActiveBenefits(get().expenseState.activeExpenses);
      },
      
      // ... other methods
    }),
    {
      name: 'runquest.expenses',
    }
  )
);
```

### Phase 2: Integration with Timeline

#### Step 5: Update Timeline Advance Logic
```typescript
// In timeline-store.ts or timeline actions
export function advanceTimeline(days: number = 1): TimelineAction {
  return (state) => {
    const newDayIndex = state.dayIndex + days;
    const expenseStore = useExpenseStore.getState();
    const economy = state.economy;
    const runnerLevel = useRunnerStore.getState().runnerState.profile.level || 1;
    
    // Process expenses when advancing time
    const expenseResult = expenseStore.processScheduledExpenses(
      newDayIndex,
      economy.currentBalance,
      runnerLevel
    );
    
    // Deduct money if can afford
    let newBalance = economy.currentBalance;
    if (expenseResult.canAfford) {
      newBalance = expenseResult.balanceAfter;
    }
    
    // Show notification
    if (expenseResult.dueExpenses.length > 0) {
      showExpenseNotification(expenseResult);
    }
    
    return {
      ...state,
      dayIndex: newDayIndex,
      economy: {
        ...economy,
        currentBalance: newBalance,
      },
    };
  };
}
```

#### Step 6: Block Activities When Unpaid
```typescript
// In training-screen.tsx and race-screen.tsx
const expenseStore = useExpenseStore();
const hasUnpaidExpenses = expenseStore.expenseState.unpaidExpenses > 0;

if (hasUnpaidExpenses) {
  return (
    <div className="alert alert-error">
      <AlertTriangle />
      <p>You have unpaid living expenses!</p>
      <p>Please earn money to pay your bills before training or racing.</p>
      <button onClick={() => router.push('/work')}>
        Find Work
      </button>
    </div>
  );
}
```

### Phase 3: Expense Management UI

#### Step 7: Create Expense Management Screen
```typescript
// src/features/economy/expenses-screen.tsx
export function ExpensesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const expenseStore = useExpenseStore();
  const { currentBalance } = useTimelineStore(s => s.gameState?.economy ?? {});
  const runnerLevel = useRunnerStore(s => s.runnerState.profile.level || 1);
  const { preferredCurrency } = useSettingsStore();
  
  const weeklyTotal = expenseStore.getWeeklyTotal(runnerLevel);
  const monthlyTotal = expenseStore.getMonthlyTotal(runnerLevel);
  const activeBenefits = expenseStore.getActiveBenefits();
  
  const availableExpenses = RECURRING_EXPENSES.filter(
    e => runnerLevel >= e.unlockedAtLevel
  );
  
  return (
    <motion.div className="...">
      <header>
        <button onClick={() => router.back()}>
          <ArrowLeft />
        </button>
        <h1>{t('expenses.title')}</h1>
      </header>
      
      <main>
        {/* Summary Card */}
        <div className="summary-card">
          <h2>{t('expenses.summary')}</h2>
          <div className="expense-totals">
            <div>
              <span>{t('expenses.weekly_total')}</span>
              <span className="amount">{formatCurrency(weeklyTotal, preferredCurrency)}</span>
            </div>
            <div>
              <span>{t('expenses.monthly_total')}</span>
              <span className="amount">{formatCurrency(monthlyTotal, preferredCurrency)}</span>
            </div>
          </div>
          
          <div className="affordability-indicator">
            {currentBalance >= weeklyTotal * 4 ? (
              <span className="status-good">✓ Can afford 4+ weeks</span>
            ) : currentBalance >= weeklyTotal * 2 ? (
              <span className="status-warning">⚠ Low funds (2 weeks left)</span>
            ) : (
              <span className="status-critical">❌ Critical (< 2 weeks)</span>
            )}
          </div>
        </div>
        
        {/* Active Benefits */}
        {Object.entries(activeBenefits).some(([_, v]) => v > 0) && (
          <div className="benefits-card">
            <h3>{t('expenses.active_benefits')}</h3>
            {Object.entries(activeBenefits)
              .filter(([_, value]) => value > 0)
              .map(([key, value]) => (
                <div key={key} className="benefit-item">
                  <span>{t(`expenses.benefits.${key}`)}</span>
                  <span className="benefit-value">+{Math.round(value * 100)}%</span>
                </div>
              ))}
          </div>
        )}
        
        {/* Expense List */}
        <div className="expenses-list">
          {availableExpenses.map(expense => {
            const isActive = expenseStore.expenseState.activeExpenses.includes(expense.id);
            const amount = expense.id === 'living_expenses' 
              ? 500 + (runnerLevel * 25)
              : expense.baseAmount;
            
            return (
              <div key={expense.id} className="expense-card">
                <div className="expense-header">
                  <h3>{t(expense.name)}</h3>
                  {expense.mandatory && (
                    <span className="badge mandatory">{t('expenses.mandatory')}</span>
                  )}
                </div>
                
                <p className="expense-description">{t(expense.description)}</p>
                
                <div className="expense-details">
                  <span className="amount">{formatCurrency(amount, preferredCurrency)}</span>
                  <span className="frequency">/ {t(`expenses.frequency.${expense.frequency}`)}</span>
                </div>
                
                {expense.benefits && (
                  <div className="expense-benefits">
                    <h4>{t('expenses.benefits_title')}</h4>
                    <ul>
                      {Object.entries(expense.benefits).map(([key, value]) => (
                        <li key={key}>
                          +{Math.round(value * 100)}% {t(`expenses.benefits.${key}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {!expense.mandatory && (
                  <button
                    onClick={() => expenseStore.toggleExpense(expense.id)}
                    className={isActive ? 'btn-active' : 'btn-inactive'}
                  >
                    {isActive ? t('expenses.disable') : t('expenses.enable')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Expense History */}
        <div className="expense-history">
          <h2>{t('expenses.history')}</h2>
          {expenseStore.expenseState.expenseHistory.slice(-10).reverse().map((transaction, i) => (
            <div key={i} className={`history-item ${transaction.successful ? 'paid' : 'unpaid'}`}>
              <div className="history-date">Day {transaction.dayIndex}</div>
              <div className="history-items">
                {transaction.expenses.map((e, j) => (
                  <span key={j}>{e.name}</span>
                ))}
              </div>
              <div className="history-amount">
                {transaction.successful ? '✓' : '✗'} {formatCurrency(transaction.totalAmount, preferredCurrency)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </motion.div>
  );
}
```

#### Step 8: Add Expense Widget to Home Screen
```typescript
// In home-screen.tsx
const expenseStore = useExpenseStore();
const weeklyExpenses = expenseStore.getWeeklyTotal(runnerLevel);
const weeksAffordable = Math.floor(currentBalance / weeklyExpenses);

<div className="expense-widget">
  <div className="widget-header">
    <Wallet className="icon" />
    <h3>{t('expenses.weekly_expenses')}</h3>
  </div>
  <div className="widget-content">
    <div className="weekly-amount">
      {formatCurrency(weeklyExpenses, preferredCurrency)}/week
    </div>
    <div className="affordability">
      {weeksAffordable >= 4 ? (
        <span className="status-good">✓ {weeksAffordable} weeks</span>
      ) : weeksAffordable >= 2 ? (
        <span className="status-warning">⚠ {weeksAffordable} weeks left</span>
      ) : (
        <span className="status-critical">❌ Critical!</span>
      )}
    </div>
  </div>
  <button onClick={() => router.push('/expenses')}>
    {t('expenses.manage')}
  </button>
</div>
```

## Validation Criteria

### Testing Checklist
- [ ] Living expenses deducted weekly
- [ ] Living expenses scale with player level
- [ ] Optional expenses can be enabled/disabled
- [ ] Benefits apply when expenses are active
- [ ] Cannot train when unpaid expenses exist
- [ ] Cannot race when unpaid expenses exist
- [ ] Expense history tracks transactions
- [ ] Low funds warning shows appropriately
- [ ] Monthly expenses deduct at correct interval
- [ ] Expense amounts respect preferred currency
- [ ] Benefits stack correctly when multiple active
- [ ] Unlocking new expenses at correct levels

## Translation Keys

Add to `en.json` and `id.json`:
```json
{
  "expenses": {
    "title": "Expenses",
    "summary": "Expense Summary",
    "weekly_total": "Weekly Total",
    "monthly_total": "Monthly Total",
    "mandatory": "Mandatory",
    "enable": "Enable",
    "disable": "Disable",
    "manage": "Manage Expenses",
    "history": "Payment History",
    "active_benefits": "Active Benefits",
    "benefits_title": "Benefits:",
    "frequency": {
      "daily": "day",
      "weekly": "week",
      "monthly": "month"
    },
    "living_expenses": {
      "name": "Living Expenses",
      "description": "Food, housing, utilities, and transportation"
    },
    "gym_membership": {
      "name": "Gym Membership",
      "description": "Access to training facilities"
    },
    "unpaid_warning": "You have unpaid expenses! Pay your bills to continue.",
    "insufficient_funds": "Insufficient funds to cover expenses!"
  }
}
```

## Priority
**MEDIUM** - Adds economic depth but not critical

## Estimated Complexity
**MEDIUM** - Clear implementation path with existing economy system

## Related Features
- Achievement: "Financially Stable" - Pay 52 weeks of expenses
- Achievement: "Budget Runner" - Complete month without optional expenses
- Add expense forecasting tool
- Add automatic payment toggle (if balance allows)
