# Task: Fix Race Registration Status Logic

## Issue
In `race-calendar.tsx`, the race registration status logic has inconsistencies:
- `race_calendar.status.registration_open` shows "Registration Open"
- `race_calendar.status.opens_in` shows countdown like "Opens in X days"
- **Problem**: Race still shows as "Registration Open" even when it's several days away
- **Confusion**: Eligible players can register even when registration supposedly hasn't opened yet

## Current Behavior (lines 587-674)
```typescript
// Status determination logic
const isOpen =
  !race.isRegistered &&
  !race.isCompleted &&
  race.dayIndex > currentDay &&
  race.dayIndex - currentDay <= registrationWindow;

// Status text
const status = race.isCompleted
  ? t("race_calendar.status.completed")
  : race.isRegistered
    ? t("race_calendar.status.registered")
    : isOpen
      ? t("race_calendar.status.registration_open")
      : race.dayIndex < currentDay
        ? t("race_calendar.status.missed")
        : t("race_calendar.status.opens_in", { days: daysUntil });
```

The logic shows "Registration Open" when `isOpen` is true, but players can register even when it shows "Opens in X days" if they meet eligibility requirements.

## Expected Behavior

### Registration Windows
Races should have clear registration phases:

1. **Too Early** (> registration window): "Opens in X days" - Cannot register yet
2. **Registration Open** (within window): "Registration Open" - Can register
3. **Race Day** (dayIndex === currentDay): "Today!" - Too late to register, must compete
4. **Registered**: "Registered ✓" - Already signed up
5. **Completed**: "Completed" - Race finished
6. **Missed**: "Missed" - Race day passed without registration

### Registration Window Rules
Current window: `registrationWindow = 14` days

**Option A: Fixed Registration Period** (Recommended)
- Registration opens exactly 14 days before race
- Registration closes 1 day before race (prep day)
- Example: Race on Day 100
  - Day 85-98: "Registration Open" ✓
  - Day 99: "Tomorrow" (too late)
  - Day 100: "Today!" (race day)

**Option B: Always Open Until Race Day** (Current behavior?)
- Registration available anytime before race day
- Window only affects visibility/filtering
- Example: Race on Day 100
  - Day 1-99: Can register if discovered
  - Day 99: Last chance
  - Day 100: Race day

## Root Cause Analysis

### Identified Issues

1. **`isOpen` calculation is unclear**
   ```typescript
   const isOpen =
     !race.isRegistered &&
     !race.isCompleted &&
     race.dayIndex > currentDay &&
     race.dayIndex - currentDay <= registrationWindow;
   ```
   This means: "Not registered, not completed, race is in future, and within 14 days"
   - But does this prevent early registration?

2. **Registration eligibility vs. visibility confusion**
   - `isOpen` controls UI display ("Registration Open")
   - But actual registration might be allowed based on different criteria
   - Need to check `validateRaceEntry` and `processRaceEntry` logic

3. **No minimum advance registration time**
   - Can player register on race day itself?
   - Should require at least 1 day for preparation?

4. **Calendar view filtering**
   - Which races show in "Available" tab?
   - Does registration window affect discovery?

## Implementation Plan

### Step 1: Define Registration Business Rules

Create clear constants:
```typescript
// src/scheduling/race-calendar-constants.ts
export const REGISTRATION_RULES = {
  /** Days before race that registration opens */
  REGISTRATION_OPENS_DAYS: 14,
  
  /** Days before race that registration closes (0 = can register until race day) */
  REGISTRATION_CLOSES_DAYS: 1,
  
  /** Maximum days in future to show races in calendar */
  CALENDAR_LOOKAHEAD_DAYS: 90,
  
  /** Days to show past races in history */
  CALENDAR_LOOKBACK_DAYS: 90,
};
```

### Step 2: Create Registration Status Calculator

```typescript
// src/scheduling/race-registration-status.ts
export type RegistrationStatus =
  | 'completed'
  | 'registered'
  | 'available'    // Can register right now
  | 'opens_soon'   // Will open within lookahead window
  | 'today'        // Race is happening today
  | 'tomorrow'     // Race is tomorrow (prep day)
  | 'missed'       // Past race, not registered
  | 'too_early';   // Beyond registration window

export interface RegistrationStatusInfo {
  status: RegistrationStatus;
  canRegister: boolean;
  daysUntilRace: number;
  daysUntilRegistrationOpens: number | null;
  daysUntilRegistrationCloses: number | null;
}

export function getRegistrationStatus(
  race: RaceOccurrence,
  currentDay: number
): RegistrationStatusInfo {
  const daysUntilRace = race.dayIndex - currentDay;
  
  // Completed
  if (race.isCompleted) {
    return {
      status: 'completed',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
    };
  }
  
  // Already registered
  if (race.isRegistered) {
    return {
      status: 'registered',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
    };
  }
  
  // Race is today
  if (daysUntilRace === 0) {
    return {
      status: 'today',
      canRegister: false,
      daysUntilRace: 0,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
    };
  }
  
  // Race is tomorrow (prep day)
  if (daysUntilRace === 1) {
    return {
      status: 'tomorrow',
      canRegister: false, // Too late for registration
      daysUntilRace: 1,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: 0,
    };
  }
  
  // Past race (missed)
  if (daysUntilRace < 0) {
    return {
      status: 'missed',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
    };
  }
  
  // Calculate registration window
  const registrationOpensDay = race.dayIndex - REGISTRATION_RULES.REGISTRATION_OPENS_DAYS;
  const registrationClosesDay = race.dayIndex - REGISTRATION_RULES.REGISTRATION_CLOSES_DAYS;
  const daysUntilOpen = registrationOpensDay - currentDay;
  const daysUntilClose = registrationClosesDay - currentDay;
  
  // Too early - registration hasn't opened yet
  if (currentDay < registrationOpensDay) {
    return {
      status: 'too_early',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: daysUntilOpen,
      daysUntilRegistrationCloses: null,
    };
  }
  
  // Registration closed - too close to race
  if (currentDay >= registrationClosesDay) {
    return {
      status: 'tomorrow', // Or 'too_late'
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: 0,
    };
  }
  
  // Registration is open
  return {
    status: 'available',
    canRegister: true,
    daysUntilRace,
    daysUntilRegistrationOpens: 0,
    daysUntilRegistrationCloses: daysUntilClose,
  };
}
```

### Step 3: Update Race Calendar UI

```typescript
// In race-calendar.tsx, update RaceCard component
const registrationInfo = getRegistrationStatus(race, currentDay);

// Status text based on new status
const statusText = (() => {
  switch (registrationInfo.status) {
    case 'completed':
      return t("race_calendar.status.completed");
    case 'registered':
      return t("race_calendar.status.registered");
    case 'available':
      return t("race_calendar.status.registration_open");
    case 'today':
      return t("race_calendar.status.today");
    case 'tomorrow':
      return t("race_calendar.status.tomorrow");
    case 'missed':
      return t("race_calendar.status.missed");
    case 'too_early':
      return t("race_calendar.status.opens_in", { 
        days: registrationInfo.daysUntilRegistrationOpens 
      });
    case 'opens_soon':
      return t("race_calendar.status.opens_soon", { 
        days: registrationInfo.daysUntilRegistrationOpens 
      });
    default:
      return t("race_calendar.status.upcoming");
  }
})();

// Register button only shown when canRegister is true
{registrationInfo.canRegister && (
  <button
    onClick={onClick}
    className="..."
  >
    {t("race_calendar.actions.register")}
  </button>
)}
```

### Step 4: Update Registration Entry Validation

Ensure `validateRaceEntry` respects the registration window:
```typescript
// In race-entry-engine.ts
export function validateRaceEntry(
  race: RaceOccurrence,
  currentDay: number,
  // ... other params
): EntryValidation {
  const registrationInfo = getRegistrationStatus(race, currentDay);
  
  if (!registrationInfo.canRegister) {
    return {
      valid: false,
      reason: `Cannot register: ${registrationInfo.status}`,
      // ... other fields
    };
  }
  
  // ... rest of validation (level, funds, etc.)
}
```

### Step 5: Add Translation Keys

```typescript
// In en.json and id.json
{
  "race_calendar": {
    "status": {
      "registration_open": "Registration Open",
      "registered": "Registered ✓",
      "completed": "Completed",
      "missed": "Missed",
      "today": "Today!",
      "tomorrow": "Tomorrow",
      "opens_in": "Opens in {days}d",
      "opens_soon": "Opens Soon",
      "closes_in": "Closes in {days}d",
      "too_early": "Coming Soon",
      "upcoming": "Upcoming"
    }
  }
}
```

## Validation Criteria

### Test Scenarios

#### Scenario 1: Race in 20 days
- **Current Day**: 100
- **Race Day**: 120
- **Expected Status**: "Opens in 6 days" (120 - 14 = 106)
- **Can Register**: No

#### Scenario 2: Race in 10 days (registration open)
- **Current Day**: 100
- **Race Day**: 110
- **Expected Status**: "Registration Open"
- **Can Register**: Yes

#### Scenario 3: Race tomorrow
- **Current Day**: 100
- **Race Day**: 101
- **Expected Status**: "Tomorrow" or "Registration Closed"
- **Can Register**: No

#### Scenario 4: Race today
- **Current Day**: 100
- **Race Day**: 100
- **Expected Status**: "Today!"
- **Can Register**: No

#### Scenario 5: Already registered
- **Expected Status**: "Registered ✓"
- **Can Register**: No
- **Show**: Preparation or race start button

### UI States Checklist
- [ ] "Opens in X days" shows when too early
- [ ] "Registration Open" shows only during open window
- [ ] "Tomorrow" shows on race eve (day before)
- [ ] "Today!" shows on race day
- [ ] "Registered ✓" shows after successful registration
- [ ] "Completed" shows after race finish
- [ ] "Missed" shows for past unregistered races
- [ ] Register button only appears when `canRegister === true`
- [ ] Status color coding matches urgency
- [ ] Countdown is accurate

## Configuration Decision

Recommend using **Option A: Fixed Registration Period**:
- Opens 14 days before race
- Closes 1 day before race (prep day needed)
- Clear, predictable system
- Prevents last-minute registration without prep

This can be adjusted in constants if needed.

## Priority
**MEDIUM** - Affects user understanding and registration flow clarity

## Estimated Complexity
**MEDIUM** - Requires refactoring status logic and adding new status engine

## Related Issues
- Add calendar notifications for "Registration Opening Soon"
- Add countdown timer on race card for closing registration
- Filter calendar tabs by registration status
- Add registration reminder system
