# TASK-003: Remove Target Time & Add Coach Prediction System

## Priority: MEDIUM
## Sprint: 41
## Estimated Effort: 3-4 hours

---

## Problem Statement

Currently, players must manually set a `target_time` for races in the preparation screen, which then appears in briefing and analytics. This creates several UX issues:

1. **Cognitive Overload**: Players must calculate realistic target times themselves
2. **Unrealistic Expectations**: Players often set targets they can't achieve, leading to frustration
3. **Redundant Input**: Target time doesn't meaningfully affect race simulation
4. **Missed Opportunity**: The coach could provide valuable guidance instead

### Current Flow:
```
Preparation Screen → Set Target Time → Briefing Shows Target → Race Analytics Compare to Target
```

### Proposed Flow:
```
Preparation Screen → Coach Suggests Winning Strategy → Player Chooses Pace → Race Provides Real-time Feedback
```

---

## Design Proposal

### Replace Target Time With: **Coach Win Prediction**

#### A. Coach Analysis Output
The coach analyzes:
- Player's fitness, fatigue, readiness
- Race distance, terrain, weather
- Competition level (AI runner strength distribution)
- Player's equipped gear, nutrition, shoes

#### B. Coach Provides:
1. **Win Probability**: `"High (75%)"`, `"Medium (45%)"`, `"Low (15%)"`
2. **Recommended Strategy**: `"Start conservatively, attack at 15K"`, `"Go hard early, hold on"`
3. **Suggested Pace Range**: `"4:20-4:35 min/km to stay competitive"`
4. **Key Threats**: `"Watch out for Sarah Chen - she's strong on hills"`

#### C. Player Freedom:
- Player can **ignore** coach advice completely
- Player chooses pacing strategy during race (jog/cruise/push/attack)
- Race simulation adjusts dynamically based on player decisions

---

## Implementation Plan

### Phase 1: Remove Target Time from Preparation

#### 1.1: Update Preparation Store
**File**: `src/store/preparation-store.ts`

Remove `targetTime` from preparation state:
```typescript
export interface Preparation {
  shoes: Shoe;
  nutrition: Record<string, number>;
  gear: string[];
  warmup: WarmupLevel;
  pacing: PacingPlan;
  mindset: Mindset;
  warmupBonus: number;
  // targetTime: number; ❌ REMOVE THIS
}

// Remove setTargetTime() method
```

#### 1.2: Update Preparation Screen UI
**File**: `src/features/preparation/preparation-screen.tsx`

Remove the target time input section (likely around lines 200-300):
```typescript
// ❌ REMOVE THIS SECTION
{/* Target Time Picker */}
<div className="...">
  <label>Target Finish Time</label>
  <input 
    type="time" 
    value={targetTime}
    onChange={(e) => setTargetTime(e.target.value)}
  />
</div>
```

---

### Phase 2: Remove Target Time from Briefing

#### 2.1: Update Briefing Screen
**File**: `src/features/briefing/briefing-screen.tsx`

Remove target time display (lines 39-46):
```typescript
// ❌ REMOVE THIS FUNCTION
const formatTargetTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};
```

Remove target time from UI (search for "Target Time" or similar):
```typescript
// ❌ REMOVE THIS DISPLAY
<div className="flex items-center gap-2">
  <Clock className="w-4 h-4" />
  <span>Target: {formatTargetTime(preparation.targetTime)}</span>
</div>
```

---

### Phase 3: Remove Target Time from Analytics

#### 3.1: Update Race Analytics Types
**File**: `src/services/analytics/race-analytics.ts`

Remove target time from analytics interface (lines 19-45):
```typescript
export interface RaceAnalytics {
  raceId: string;
  date: string;
  distance: number;
  splits: { km: number; pace: number; time: number }[];
  // ... keep existing fields
  // targetTime: number; ❌ REMOVE
  // targetPace: number; ❌ REMOVE
  // targetComparison: string; ❌ REMOVE
}
```

Remove target time calculations from `analyzeRacePerformance()`:
```typescript
// ❌ REMOVE target time comparison logic
const targetComparison = calculateTargetComparison(result, preparation.targetTime);
```

---

### Phase 4: Create Coach Prediction System

#### 4.1: Create Coach Prediction Engine
**File**: `src/coach/race-prediction.ts` (NEW FILE)

```typescript
/**
 * Coach Race Prediction Engine
 * Analyzes player stats vs competition to predict race outcome
 */

import type { RunnerProfile } from "@/runner/runner-types";
import type { DailyChallenge, Preparation } from "@/types/engine";

export interface RacePrediction {
  winProbability: number; // 0-100
  winProbabilityLabel: "Very High" | "High" | "Medium" | "Low" | "Very Low";
  recommendedStrategy: string;
  suggestedPaceRange: { min: number; max: number }; // seconds per km
  keyThreats: string[]; // Top 3 AI competitors to watch
  confidenceFactors: {
    fitness: "excellent" | "good" | "adequate" | "poor";
    fatigue: "fresh" | "normal" | "tired" | "exhausted";
    experience: "veteran" | "experienced" | "novice";
    conditions: "favorable" | "neutral" | "challenging";
  };
  coachNotes: string; // Personalized message
}

/**
 * Generate race prediction based on player state and race conditions
 */
export function predictRaceOutcome(
  profile: RunnerProfile,
  challenge: DailyChallenge,
  preparation: Preparation
): RacePrediction {
  // 1. Calculate player's effective race pace
  const basePace = calculatePlayerBasePace(profile, challenge.race.distance);
  const gearBonus = calculateGearBonus(preparation);
  const conditionPenalty = calculateConditionPenalty(challenge.environment);
  const effectivePace = basePace - gearBonus + conditionPenalty;

  // 2. Estimate AI field strength
  const aiFieldStrength = estimateAIStrength(challenge.race.tier, challenge.race.distance);
  
  // 3. Calculate win probability
  const winProbability = calculateWinProbability(
    effectivePace,
    aiFieldStrength,
    profile,
    challenge
  );

  // 4. Generate strategy recommendation
  const strategy = generateStrategy(profile, challenge, winProbability);

  // 5. Calculate suggested pace range
  const paceRange = calculatePaceRange(effectivePace, aiFieldStrength);

  // 6. Identify key threats
  const threats = identifyKeyThreats(challenge, aiFieldStrength);

  // 7. Assess confidence factors
  const factors = assessConfidenceFactors(profile, challenge);

  // 8. Generate personalized coach notes
  const notes = generateCoachNotes(winProbability, factors, challenge);

  return {
    winProbability,
    winProbabilityLabel: getWinProbabilityLabel(winProbability),
    recommendedStrategy: strategy,
    suggestedPaceRange: paceRange,
    keyThreats: threats,
    confidenceFactors: factors,
    coachNotes: notes,
  };
}

/**
 * Calculate player's base race pace (seconds per km)
 */
function calculatePlayerBasePace(
  profile: RunnerProfile,
  distance: number
): number {
  // Base pace from fitness level
  const fitnessLevel = profile.currentFitness || 50;
  const basePaceAt100Fitness = 240; // 4:00 min/km at 100 fitness
  const basePaceAt0Fitness = 420; // 7:00 min/km at 0 fitness
  
  let pace = basePaceAt0Fitness - (fitnessLevel / 100) * (basePaceAt0Fitness - basePaceAt100Fitness);

  // Adjust for distance (longer = slower per km)
  if (distance >= 42) pace += 30; // Marathon+ penalty
  else if (distance >= 21) pace += 15; // Half marathon penalty
  else if (distance >= 10) pace += 5; // 10K penalty

  // Adjust for fatigue
  const fatigue = profile.currentFatigue || 0;
  pace += (fatigue / 100) * 60; // Up to +60s/km when exhausted

  // Adjust for readiness
  const readiness = profile.currentReadiness || 100;
  pace += ((100 - readiness) / 100) * 30; // Up to +30s/km when not ready

  return Math.round(pace);
}

/**
 * Calculate gear bonus (seconds per km reduction)
 */
function calculateGearBonus(preparation: Preparation): number {
  let bonus = 0;
  
  // Shoes bonus (from shop-catalog stats)
  const shoeBonus: Record<string, number> = {
    carbon_racer: 3,
    lightweight: 1,
    plated_supershoe: 4,
    speed_flats: 3,
    marathon_racer: 2,
    // ... add others as 0 or small values
  };
  bonus += shoeBonus[preparation.shoes] || 0;

  // Gear bonus (minor effects)
  if (preparation.gear.includes("gps_watch")) bonus += 1;
  if (preparation.gear.includes("compression_socks")) bonus += 1;

  return bonus;
}

/**
 * Calculate condition penalty (seconds per km added)
 */
function calculateConditionPenalty(environment: DailyChallenge["environment"]): number {
  let penalty = 0;

  // Weather penalties
  if (environment.weather === "rain") penalty += 10;
  if (environment.weather === "storm") penalty += 20;
  if (environment.weather === "fog") penalty += 5;

  // Temperature penalties
  if (environment.temperature > 28) penalty += 15; // Hot
  if (environment.temperature > 32) penalty += 30; // Very hot
  if (environment.temperature < 5) penalty += 10; // Cold
  if (environment.temperature < -5) penalty += 20; // Very cold

  // Wind penalty
  if (environment.windSpeed > 20) penalty += 10;
  if (environment.windSpeed > 30) penalty += 20;

  return penalty;
}

/**
 * Estimate AI field average pace
 */
function estimateAIStrength(tier: string, distance: number): number {
  // Tier-based AI strength (seconds per km)
  const tierPace: Record<string, number> = {
    local: 300,      // 5:00 min/km average
    regional: 270,   // 4:30 min/km
    state: 255,      // 4:15 min/km
    national: 240,   // 4:00 min/km
    international: 225, // 3:45 min/km
  };

  let pace = tierPace[tier] || 300;

  // Distance adjustment
  if (distance >= 42) pace += 20;
  else if (distance >= 21) pace += 10;

  return pace;
}

/**
 * Calculate win probability (0-100%)
 */
function calculateWinProbability(
  playerPace: number,
  aiPace: number,
  profile: RunnerProfile,
  challenge: DailyChallenge
): number {
  // Pace differential (negative = player is faster)
  const paceDiff = playerPace - aiPace;

  // Base probability from pace comparison
  let probability = 50 - (paceDiff * 2); // ±2% per second difference

  // Adjust for experience
  const totalRaces = profile.totalRaces || 0;
  if (totalRaces > 50) probability += 10;
  else if (totalRaces > 20) probability += 5;
  else if (totalRaces < 5) probability -= 10;

  // Adjust for race tier (higher tier = more variance)
  if (challenge.race.tier === "international") probability -= 5;
  if (challenge.race.tier === "national") probability -= 3;

  // Clamp to 1-99% (never 0% or 100%)
  return Math.max(1, Math.min(99, Math.round(probability)));
}

/**
 * Generate recommended strategy
 */
function generateStrategy(
  profile: RunnerProfile,
  challenge: DailyChallenge,
  winProb: number
): string {
  const distance = challenge.race.distance;
  const fatigue = profile.currentFatigue || 0;

  if (winProb > 70) {
    return `Start conservatively and control the pace. Attack at ${Math.floor(distance * 0.7)}K to break away.`;
  } else if (winProb > 40) {
    return `Stay with the lead pack early. Make your move at the ${Math.floor(distance * 0.6)}K mark.`;
  } else if (fatigue > 60) {
    return `You're fatigued. Focus on finishing strong rather than winning. Consider cruising.`;
  } else {
    return `Take risks early and push hard. This will be a tough race—give it everything.`;
  }
}

/**
 * Calculate suggested pace range
 */
function calculatePaceRange(
  playerPace: number,
  aiPace: number
): { min: number; max: number } {
  // Suggest a range that's competitive but realistic
  const targetPace = Math.min(playerPace, aiPace);
  return {
    min: targetPace - 5,  // Push pace
    max: targetPace + 10, // Safe pace
  };
}

/**
 * Identify top 3 AI threats
 */
function identifyKeyThreats(
  challenge: DailyChallenge,
  aiStrength: number
): string[] {
  // Generate 3 realistic competitor names
  const names = [
    "Sarah Chen", "Marcus Rodriguez", "Emily Watson",
    "David Kim", "Anna Kowalski", "James Thompson",
    "Maria Silva", "Ahmed Hassan", "Sophie Dubois"
  ];

  // Pick 3 random names (seeded by challenge ID for consistency)
  const seed = challenge.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const threats: string[] = [];
  for (let i = 0; i < 3; i++) {
    const index = (seed + i * 17) % names.length;
    threats.push(names[index]);
  }

  return threats;
}

/**
 * Assess confidence factors
 */
function assessConfidenceFactors(
  profile: RunnerProfile,
  challenge: DailyChallenge
): RacePrediction["confidenceFactors"] {
  const fitness = profile.currentFitness || 50;
  const fatigue = profile.currentFatigue || 0;
  const totalRaces = profile.totalRaces || 0;
  const temp = challenge.environment.temperature;
  const weather = challenge.environment.weather;

  return {
    fitness: fitness > 80 ? "excellent" : fitness > 60 ? "good" : fitness > 40 ? "adequate" : "poor",
    fatigue: fatigue < 20 ? "fresh" : fatigue < 50 ? "normal" : fatigue < 75 ? "tired" : "exhausted",
    experience: totalRaces > 50 ? "veteran" : totalRaces > 10 ? "experienced" : "novice",
    conditions: (weather === "sunny" && temp > 10 && temp < 25) ? "favorable" :
                (weather === "rain" || temp > 30 || temp < 5) ? "challenging" : "neutral",
  };
}

/**
 * Generate personalized coach notes
 */
function generateCoachNotes(
  winProb: number,
  factors: RacePrediction["confidenceFactors"],
  challenge: DailyChallenge
): string {
  const notes: string[] = [];

  if (factors.fitness === "excellent") {
    notes.push("Your fitness is outstanding—this is a great opportunity.");
  } else if (factors.fitness === "poor") {
    notes.push("Your fitness isn't where it needs to be. Consider this a learning race.");
  }

  if (factors.fatigue === "exhausted") {
    notes.push("You're carrying significant fatigue. Be careful not to push too hard.");
  } else if (factors.fatigue === "fresh") {
    notes.push("You're well-rested and ready to perform.");
  }

  if (factors.experience === "novice") {
    notes.push("Stay calm and trust your training. Don't go out too fast.");
  } else if (factors.experience === "veteran") {
    notes.push("You know what to do. Trust your instincts.");
  }

  if (factors.conditions === "challenging") {
    notes.push("The conditions are tough today. Adjust expectations accordingly.");
  }

  if (winProb > 70) {
    notes.push("You're the favorite to win. Execute your race plan and it's yours.");
  } else if (winProb < 30) {
    notes.push("This will be an uphill battle. Focus on a strong finish, not the win.");
  }

  return notes.join(" ");
}

/**
 * Get win probability label
 */
function getWinProbabilityLabel(prob: number): RacePrediction["winProbabilityLabel"] {
  if (prob >= 80) return "Very High";
  if (prob >= 60) return "High";
  if (prob >= 40) return "Medium";
  if (prob >= 20) return "Low";
  return "Very Low";
}

/**
 * Format pace as MM:SS
 */
export function formatPace(secondsPerKm: number): string {
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
```

#### 4.2: Add Coach Prediction to Briefing Screen
**File**: `src/features/briefing/briefing-screen.tsx`

Add prediction display:
```typescript
import { predictRaceOutcome, formatPace } from "@/coach/race-prediction";
import { loadRunnerState } from "@/runner/runner-persistence";

export function BriefingScreen() {
  // ... existing code
  
  const runnerProfile = loadRunnerState().profile;
  const preparation = usePreparationStore((s) => s.preparation);
  const prediction = predictRaceOutcome(runnerProfile, challenge, preparation);

  return (
    <motion.div>
      {/* Existing race info */}
      
      {/* NEW: Coach Prediction Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800 rounded-[2rem] p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white mb-1">
              Coach's Race Analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Based on your current form and the competition
            </p>
          </div>
        </div>

        {/* Win Probability */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Win Probability
            </span>
            <span className={`text-lg font-black font-mono ${
              prediction.winProbability > 60 ? "text-emerald-600" :
              prediction.winProbability > 40 ? "text-amber-600" :
              "text-rose-600"
            }`}>
              {prediction.winProbability}%
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {prediction.winProbabilityLabel} chance of winning
          </div>
        </div>

        {/* Strategy Recommendation */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Recommended Strategy
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {prediction.recommendedStrategy}
          </p>
        </div>

        {/* Suggested Pace Range */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Competitive Pace Range
          </div>
          <p className="text-sm font-mono font-bold text-slate-800 dark:text-white">
            {formatPace(prediction.suggestedPaceRange.min)} - {formatPace(prediction.suggestedPaceRange.max)} min/km
          </p>
        </div>

        {/* Key Threats */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Key Competitors to Watch
          </div>
          <div className="flex flex-wrap gap-2">
            {prediction.keyThreats.map((name, i) => (
              <span key={i} className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Coach Notes */}
        <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-xl p-4 border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
            "{prediction.coachNotes}"
          </p>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            — Your Coach
          </p>
        </div>
      </div>

      {/* Existing Start Race button */}
    </motion.div>
  );
}
```

---

### Phase 5: Update Translations

#### 5.1: Add Translation Keys
**File**: `src/content/translations/en.json`

```json
{
  "coach": {
    "prediction": {
      "title": "Coach's Race Analysis",
      "subtitle": "Based on your current form and the competition",
      "win_probability": "Win Probability",
      "win_probability_very_high": "Very High",
      "win_probability_high": "High",
      "win_probability_medium": "Medium",
      "win_probability_low": "Low",
      "win_probability_very_low": "Very Low",
      "recommended_strategy": "Recommended Strategy",
      "competitive_pace": "Competitive Pace Range",
      "key_competitors": "Key Competitors to Watch",
      "coach_notes": "Coach Notes"
    }
  }
}
```

**File**: `src/content/translations/id.json`

```json
{
  "coach": {
    "prediction": {
      "title": "Analisis Lomba dari Pelatih",
      "subtitle": "Berdasarkan kondisi Anda dan kompetisi",
      "win_probability": "Probabilitas Menang",
      "win_probability_very_high": "Sangat Tinggi",
      "win_probability_high": "Tinggi",
      "win_probability_medium": "Sedang",
      "win_probability_low": "Rendah",
      "win_probability_very_low": "Sangat Rendah",
      "recommended_strategy": "Strategi yang Disarankan",
      "competitive_pace": "Rentang Pace Kompetitif",
      "key_competitors": "Kompetitor Kunci yang Perlu Diperhatikan",
      "coach_notes": "Catatan Pelatih"
    }
  }
}
```

---

## Testing Plan

### Unit Tests:
1. ✅ `predictRaceOutcome()` returns valid prediction object
2. ✅ Win probability is always 1-99 (never 0 or 100)
3. ✅ Pace calculation considers fitness, fatigue, readiness
4. ✅ Gear bonuses apply correctly
5. ✅ Condition penalties apply correctly
6. ✅ Strategy text changes based on win probability
7. ✅ Key threats are consistently generated (same seed = same names)

### Integration Tests:
1. ✅ Prediction displays in briefing screen
2. ✅ Prediction updates when preparation changes
3. ✅ Translations work for EN/ID
4. ✅ No errors when target time references are removed
5. ✅ Race simulation still works without target time

### Regression Tests:
1. ✅ Race completion works without target time
2. ✅ Analytics display works without target comparison
3. ✅ No broken links/references to target time
4. ✅ Preparation flow completes successfully

---

## Files to Modify

### Phase 1-3: Remove Target Time
1. `src/store/preparation-store.ts` - Remove targetTime state
2. `src/features/preparation/preparation-screen.tsx` - Remove input UI
3. `src/features/briefing/briefing-screen.tsx` - Remove display
4. `src/services/analytics/race-analytics.ts` - Remove from analytics

### Phase 4: Add Coach Prediction
5. `src/coach/race-prediction.ts` - **NEW FILE** - Prediction engine
6. `src/features/briefing/briefing-screen.tsx` - Add prediction display

### Phase 5: Translations
7. `src/content/translations/en.json` - English strings
8. `src/content/translations/id.json` - Indonesian strings

---

## Success Criteria

- [ ] Target time completely removed from codebase
- [ ] No TypeScript errors or broken references
- [ ] Coach prediction displays in briefing screen
- [ ] Win probability calculation is realistic
- [ ] Strategy recommendations vary appropriately
- [ ] Pace suggestions are helpful
- [ ] Key threats add personality/immersion
- [ ] Coach notes feel personalized
- [ ] Translations work correctly
- [ ] UI is visually appealing and informative

---

## Future Enhancements

- [ ] Track coach prediction accuracy over time
- [ ] Add "Coach was right/wrong" post-race analysis
- [ ] Allow player to "ask coach" for more detailed advice
- [ ] Add coach confidence meter based on data quality
- [ ] Show historical prediction accuracy in profile stats
- [ ] Add coach personality variants (aggressive, conservative, etc.)

---

## Notes

- Keep prediction algorithm transparent—avoid "black box" feeling
- Ensure predictions aren't always accurate (add variance for realism)
- Consider showing "confidence factors" breakdown to educate players
- Don't make predictions too conservative—players want to feel they can win
- Add easter egg: If player is extremely prepared, coach says "You've got this!"
