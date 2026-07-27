# Task: Add Injury & Health Management System

## Overview
Add a comprehensive injury and health management system that introduces risk/reward dynamics to training and racing. Players can get injured from overtraining or pushing too hard during races, requiring rest and medical treatment.

## Problem Statement
Currently, players can train and race indefinitely without physical consequences. This:
- Lacks realism for a running simulator
- Removes strategic depth from training decisions
- Makes energy the only limiting factor
- Doesn't create meaningful choices about risk management

## Proposed System

### Injury Types & Severity

#### Minor Injuries (1-3 days recovery)
- **Muscle Soreness** - From sudden intensity increase
- **Blisters** - From new shoes or long distances
- **Minor Strain** - From inadequate warmup
- **Effects**: -20% performance, -30% training effectiveness

#### Moderate Injuries (5-10 days recovery)
- **Muscle Pull** - From overexertion
- **Shin Splints** - From overtraining
- **Runner's Knee** - From high mileage without rest
- **Joint Pain** - From impact accumulation
- **Effects**: -40% performance, cannot train, cannot race

#### Major Injuries (14-28 days recovery)
- **Stress Fracture** - From severe overtraining
- **Ligament Strain** - From acute overexertion in race
- **Tendon Injury** - From chronic overload
- **Effects**: -60% performance, cannot train, cannot race, -1 fitness level per week

#### Critical Injuries (30-90 days recovery)
- **Fracture** - From severe race incident
- **Torn Ligament** - From extreme overexertion
- **Chronic Condition** - From ignoring moderate injuries
- **Effects**: Cannot do anything, potential permanent stat reduction

### Injury Risk Factors

#### Training Risk Factors
```typescript
interface TrainingRisk {
  consecutiveDaysTraining: number;     // 5+ days → +15% risk
  trainingVolumeWeekly: number;        // >50km/week → +10% risk
  intensitySpikes: boolean;            // Sudden hard workout → +20% risk
  inadequateRecovery: boolean;         // <2 rest days/week → +15% risk
  lowFitnessLevel: boolean;            // Training above level → +25% risk
}
```

#### Racing Risk Factors
```typescript
interface RacingRisk {
  raceLengthVsFitness: number;         // Racing above ability → +30% risk
  weatherConditions: 'extreme';        // Heat/cold extremes → +15% risk
  pushedPace: boolean;                 // Going all-out → +20% risk
  inadequatePrep: boolean;             // <3 days rest before race → +25% risk
  equipmentMismatch: boolean;          // Wrong shoes/gear → +10% risk
}
```

### Injury Prevention
- **Rest Days**: -10% injury risk per rest day in past 7 days
- **Proper Equipment**: Right shoes for surface/distance → -15% risk
- **Gradual Progression**: Following training plan → -20% risk
- **Good Nutrition**: Proper recovery foods → -10% risk
- **Stretching/Warmup**: Pre-activity routine → -15% risk

## Implementation Plan

### Phase 1: Core Injury System

#### Step 1: Define Injury Data Model
```typescript
// src/health/injury-types.ts
export type InjuryType =
  | 'muscle_soreness'
  | 'blister'
  | 'minor_strain'
  | 'muscle_pull'
  | 'shin_splints'
  | 'runners_knee'
  | 'joint_pain'
  | 'stress_fracture'
  | 'ligament_strain'
  | 'tendon_injury'
  | 'fracture'
  | 'torn_ligament'
  | 'chronic_condition';

export type InjurySeverity = 'minor' | 'moderate' | 'major' | 'critical';

export interface Injury {
  id: string;
  type: InjuryType;
  severity: InjurySeverity;
  daysToRecover: number;
  daysElapsed: number;
  acquiredOnDay: number;
  performanceImpact: number;      // 0.8 = -20% performance
  canTrain: boolean;
  canRace: boolean;
  description: string;
  treatment: string;
}

export interface HealthState {
  currentInjuries: Injury[];
  injuryHistory: Injury[];
  overtrainLevel: number;          // 0-100, higher = more risk
  fatigueLevel: number;            // 0-100, affects recovery
  consecutiveTrainingDays: number;
  totalRestDays: number;
  lastInjuryDay: number | null;
}
```

#### Step 2: Create Injury Risk Engine
```typescript
// src/health/injury-risk-engine.ts
export interface RiskFactors {
  baseRisk: number;
  trainingFactors: {
    consecutiveDays: number;
    weeklyVolume: number;
    intensitySpike: number;
    inadequateRecovery: number;
    lowFitness: number;
  };
  racingFactors?: {
    lengthVsFitness: number;
    weather: number;
    pushedPace: number;
    inadequatePrep: number;
    equipment: number;
  };
  preventionModifiers: {
    restDays: number;
    equipment: number;
    progression: number;
    nutrition: number;
    warmup: number;
  };
}

export function calculateInjuryRisk(
  healthState: HealthState,
  runnerState: RunnerState,
  activity: 'training' | 'racing',
  activityDetails: TrainingActivity | RaceDetails
): RiskFactors;

export function rollForInjury(risk: number): {
  injured: boolean;
  injuryType: InjuryType | null;
  severity: InjurySeverity | null;
};

export function createInjury(
  type: InjuryType,
  severity: InjurySeverity,
  dayIndex: number
): Injury;
```

#### Step 3: Create Health Store
```typescript
// src/health/health-store.ts
interface HealthStore {
  healthState: HealthState;
  
  // Injury management
  addInjury: (injury: Injury) => void;
  updateInjuryRecovery: (daysPassed: number) => void;
  removeInjury: (injuryId: string) => void;
  getActiveInjuries: () => Injury[];
  getMostSevereInjury: () => Injury | null;
  
  // Status checks
  canTrain: () => boolean;
  canRace: () => boolean;
  getPerformanceModifier: () => number;
  
  // Risk tracking
  incrementConsecutiveTrainingDays: () => void;
  resetConsecutiveTrainingDays: () => void;
  updateOvertrainLevel: (delta: number) => void;
  updateFatigueLevel: (delta: number) => void;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useHealthStore = create<HealthStore>((set, get) => ({
  // Implementation
}));
```

### Phase 2: Medical Treatment System

#### Step 4: Create Medical Treatment Options
```typescript
// src/health/medical-treatments.ts
export interface Treatment {
  id: string;
  name: string;
  description: string;
  cost: number;
  recoverySpeedup: number;         // 0.5 = cuts recovery time in half
  injurySeverityApplicable: InjurySeverity[];
  availableAtLevel: number;
}

export const TREATMENTS: Treatment[] = [
  {
    id: 'rest',
    name: 'Rest (Free)',
    description: 'Natural recovery through rest',
    cost: 0,
    recoverySpeedup: 1.0,
    injurySeverityApplicable: ['minor', 'moderate', 'major', 'critical'],
    availableAtLevel: 1,
  },
  {
    id: 'ice_compression',
    name: 'Ice & Compression',
    description: 'DIY treatment for minor injuries',
    cost: 50,
    recoverySpeedup: 0.8,
    injurySeverityApplicable: ['minor'],
    availableAtLevel: 1,
  },
  {
    id: 'physiotherapy',
    name: 'Physiotherapy Session',
    description: 'Professional treatment to speed recovery',
    cost: 200,
    recoverySpeedup: 0.7,
    injurySeverityApplicable: ['minor', 'moderate'],
    availableAtLevel: 5,
  },
  {
    id: 'sports_medicine',
    name: 'Sports Medicine Specialist',
    description: 'Expert treatment for serious injuries',
    cost: 500,
    recoverySpeedup: 0.6,
    injurySeverityApplicable: ['moderate', 'major'],
    availableAtLevel: 10,
  },
  {
    id: 'surgery',
    name: 'Surgical Intervention',
    description: 'Required for critical injuries',
    cost: 2000,
    recoverySpeedup: 0.5,
    injurySeverityApplicable: ['major', 'critical'],
    availableAtLevel: 15,
  },
];
```

#### Step 5: Create Medical Center UI
```typescript
// src/features/medical/medical-screen.tsx
export function MedicalScreen() {
  // Displays:
  // - Current health status
  // - Active injuries with recovery timeline
  // - Available treatments with costs
  // - Injury history
  // - Prevention tips
  // - Risk level indicator
}
```

### Phase 3: Integration with Existing Systems

#### Step 6: Update Training Screen
```typescript
// In training-screen.tsx
const healthStore = useHealthStore();
const canTrain = healthStore.canTrain();
const performanceModifier = healthStore.getPerformanceModifier();

// Before starting workout
if (!canTrain) {
  showError("Cannot train with current injuries. Visit Medical Center.");
  return;
}

// After workout, check for injury
const injuryRisk = calculateInjuryRisk(
  healthStore.healthState,
  runnerState,
  'training',
  workoutDetails
);

const injuryResult = rollForInjury(injuryRisk.totalRisk);
if (injuryResult.injured) {
  const injury = createInjury(
    injuryResult.injuryType!,
    injuryResult.severity!,
    dayIndex
  );
  healthStore.addInjury(injury);
  showInjuryNotification(injury);
}

// Update overtraining level
healthStore.incrementConsecutiveTrainingDays();
healthStore.updateOvertrainLevel(+5);
```

#### Step 7: Update Race Screen
```typescript
// In race-screen.tsx or race engine
const healthStore = useHealthStore();
const canRace = healthStore.canRace();
const performanceModifier = healthStore.getPerformanceModifier();

// Before race start
if (!canRace) {
  showError("Cannot race with current injuries.");
  return;
}

// Apply performance penalty to race simulation
const adjustedStats = {
  ...runnerStats,
  speed: runnerStats.speed * performanceModifier,
  stamina: runnerStats.stamina * performanceModifier,
  endurance: runnerStats.endurance * performanceModifier,
};

// After race, check for injury (higher risk than training)
const injuryRisk = calculateInjuryRisk(
  healthStore.healthState,
  runnerState,
  'racing',
  raceDetails
);
// ... injury roll logic
```

#### Step 8: Update Timeline/Rest System
```typescript
// When player rests (advances day)
healthStore.updateInjuryRecovery(1); // 1 day passed
healthStore.resetConsecutiveTrainingDays();
healthStore.updateOvertrainLevel(-10); // Rest reduces overtrain
healthStore.updateFatigueLevel(-15);
```

#### Step 9: Update Home Screen
```typescript
// In home-screen.tsx
const healthStore = useHealthStore();
const activeInjuries = healthStore.getActiveInjuries();
const mostSevere = healthStore.getMostSevereInjury();

// Show health status widget
{mostSevere && (
  <div className="health-alert">
    <AlertTriangle className="text-red-500" />
    <span>Injured: {mostSevere.type}</span>
    <span>{mostSevere.daysToRecover - mostSevere.daysElapsed} days recovery</span>
    <button onClick={() => router.push('/medical')}>
      Get Treatment
    </button>
  </div>
)}
```

### Phase 4: Additional Expenses System

#### Step 10: Add Recurring Expenses
```typescript
// src/economy/recurring-expenses.ts
export interface Expense {
  id: string;
  name: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: 'living' | 'training' | 'medical' | 'equipment';
  optional: boolean;
}

export const RECURRING_EXPENSES: Expense[] = [
  {
    id: 'weekly_living',
    name: 'Living Expenses',
    description: 'Food, rent, utilities',
    amount: 500,
    frequency: 'weekly',
    category: 'living',
    optional: false,
  },
  {
    id: 'gym_membership',
    name: 'Gym Membership',
    description: 'Access to training facilities',
    amount: 50,
    frequency: 'weekly',
    category: 'training',
    optional: true,
  },
  {
    id: 'coaching_fee',
    name: 'Coaching Services',
    description: 'Optional personal coaching',
    amount: 200,
    frequency: 'weekly',
    category: 'training',
    optional: true,
  },
  {
    id: 'insurance',
    name: 'Health Insurance',
    description: 'Reduces medical costs by 30%',
    amount: 100,
    frequency: 'monthly',
    category: 'medical',
    optional: true,
  },
];

export function processRecurringExpenses(
  dayIndex: number,
  currentBalance: number,
  activeExpenses: string[]
): {
  totalDeducted: number;
  expenses: Array<{ name: string; amount: number }>;
  newBalance: number;
  canAfford: boolean;
};
```

#### Step 11: Integrate Expenses with Timeline
```typescript
// When advancing timeline (weekly)
if (dayIndex % 7 === 0) { // Every 7 days
  const expenseResult = processRecurringExpenses(
    dayIndex,
    currentBalance,
    player.activeExpenses
  );
  
  if (!expenseResult.canAfford) {
    showWarning("Insufficient funds for expenses!");
    // Apply penalties or force expense reduction
  }
  
  deductMoney(expenseResult.totalDeducted);
  showExpenseBreakdown(expenseResult.expenses);
}
```

## UI/UX Design

### Health Status Indicator (Home Screen)
```
┌─────────────────────────────────┐
│ 🏥 Health Status                │
│                                 │
│ ✅ Healthy                      │
│ Overtrain Risk: ████░░░░░░ 40% │
│ Fatigue: ██████░░░░ 60%        │
│                                 │
│ [Visit Medical Center]          │
└─────────────────────────────────┘
```

### Injury Alert
```
┌─────────────────────────────────┐
│ ⚠️ INJURED                      │
│                                 │
│ Shin Splints (Moderate)         │
│ Recovery: 5 days remaining      │
│ Impact: -40% performance        │
│ Cannot train or race            │
│                                 │
│ [Get Treatment] [View Details]  │
└─────────────────────────────────┘
```

### Medical Center Screen
```
┌─────────────────────────────────┐
│ 🏥 Medical Center               │
│                                 │
│ Active Injuries:                │
│ • Shin Splints (Moderate)       │
│   5 days → 3.5 days with PT     │
│                                 │
│ Available Treatments:           │
│ ○ Rest (Free) - 5 days          │
│ ○ Physiotherapy ($200) - 3.5d   │
│ ● Sports Medicine ($500) - 3d   │
│                                 │
│ [Apply Treatment]               │
└─────────────────────────────────┘
```

## Validation Criteria

### Testing Checklist
- [ ] Injury occurs after excessive training
- [ ] Injury occurs during race when pushing too hard
- [ ] Cannot train when moderately+ injured
- [ ] Cannot race when moderately+ injured
- [ ] Performance reduced when minor injury
- [ ] Injury heals after specified days
- [ ] Treatment speeds up recovery
- [ ] Treatment costs money
- [ ] Recurring expenses deducted weekly
- [ ] Low funds shows warning
- [ ] Injury history tracked
- [ ] Risk indicator updates correctly
- [ ] Prevention measures reduce risk
- [ ] Overtraining accumulates over time
- [ ] Rest reduces overtrain level

## Translation Keys

Add to `en.json` and `id.json`:
```json
{
  "health": {
    "status": {
      "healthy": "Healthy",
      "injured": "Injured",
      "recovering": "Recovering"
    },
    "injuries": {
      "muscle_soreness": "Muscle Soreness",
      "shin_splints": "Shin Splints",
      "stress_fracture": "Stress Fracture"
    },
    "medical_center": "Medical Center",
    "get_treatment": "Get Treatment",
    "days_remaining": "{days} days remaining",
    "cannot_train_injured": "Cannot train while injured",
    "cannot_race_injured": "Cannot race with this injury"
  },
  "expenses": {
    "weekly_expenses": "Weekly Expenses",
    "living_expenses": "Living Expenses",
    "deducted": "Deducted: {amount}",
    "insufficient_funds": "Insufficient funds for expenses!"
  }
}
```

## Priority
**HIGH** - Adds strategic depth and realism

## Estimated Complexity
**HIGH** - Comprehensive new system with multiple integration points

## Dependencies
- Currency system (already exists)
- Timeline/rest system (already exists)
- Training system (already exists)
- Race system (already exists)

## Related Enhancements
- Add stretching/warmup mini-activity
- Add injury insurance mechanic
- Add physiotherapist NPC interactions
- Add injury prevention equipment (compression gear, etc.)
- Add achievement for staying injury-free for X days
