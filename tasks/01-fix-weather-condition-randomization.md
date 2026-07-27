# Task: Fix Weather & Condition Randomization in Preparation Screen

## Issue
Weather and environmental conditions are always fixing/constant for every race in the preparation screen, rather than being dynamically generated based on the race parameters. This makes all races feel repetitive and doesn't impact race variables as intended.

## Current Behavior
- Weather conditions appear to be hardcoded or static in `preparation-screen.tsx`
- Every race shows similar weather patterns regardless of race tier, location, or timing
- The environmental impact on race performance is not properly variable

## Expected Behavior
- Weather and conditions should be **dynamically generated** for each race based on:
  - Race tier (local, regional, state, national, international)
  - Race schedule ID (seed for consistency)
  - Day index (seasonal variations)
  - Race location/region
- Different weather patterns should have measurable impacts on:
  - Pace difficulty modifiers
  - Stamina consumption rates
  - Hydration needs
  - Equipment effectiveness

## Files to Modify

### Primary Files
1. **`src/features/preparation/preparation-screen.tsx`** (lines 40-62)
   - Currently uses `generateDailyChallenge(dayIndex.toString())` which may not include proper weather randomization
   - Need to ensure weather is generated from race-specific parameters

2. **`src/services/challenge/generator.ts`**
   - Review weather generation logic
   - Ensure it accepts race parameters (tier, location, schedule ID) as seeds
   - Implement varied weather patterns

### Supporting Files
3. **`src/types/engine.ts`** (DailyChallenge type)
   - Verify `environment` interface includes all necessary weather properties
   - Ensure weather types are comprehensive (sunny, cloudy, rainy, windy, hot, cold, etc.)

4. **`src/engine/race/weather-engine.ts`** (if exists, or create new)
   - Create weather generation system
   - Weather impact calculations on performance
   - Seasonal weather patterns

## Implementation Plan

### Step 1: Create Weather Generation System
```typescript
// src/engine/race/weather-engine.ts
export interface WeatherCondition {
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'windy';
  temperature: number; // Celsius
  humidity: number; // 0-100%
  wind: {
    direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
    speed: number; // km/h
  };
  timeOfDay: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
}

// Generate weather based on race parameters + day/season
export function generateRaceWeather(
  scheduleId: string,
  dayIndex: number,
  tier: RaceTier,
  region?: string
): WeatherCondition;

// Calculate performance impact modifiers
export function getWeatherImpact(weather: WeatherCondition): {
  paceModifier: number; // 0.9 = 10% slower, 1.1 = 10% faster
  staminaDrainModifier: number;
  hydrationNeedModifier: number;
};
```

### Step 2: Update Challenge Generator
- Modify `generateDailyChallenge` to accept optional race parameters
- Or create new `generateRaceChallenge` function specifically for scheduled races
- Use `scheduleId` + `dayIndex` as seed for deterministic but varied weather

### Step 3: Update Preparation Screen
```typescript
// In preparation-screen.tsx
const challenge = useMemo(() => {
  if (currentChallenge?.scheduleId) {
    // For scheduled races, generate weather based on race parameters
    return generateRaceChallenge({
      scheduleId: currentChallenge.scheduleId,
      dayIndex,
      tier: currentChallenge.tier,
      distance: currentChallenge.race.distance,
      // ... other race params
    });
  }
  return currentChallenge || generateDailyChallenge(dayIndex.toString());
}, [currentChallenge, dayIndex]);
```

### Step 4: Apply Weather Impact in Race Engine
- Update race simulation to apply weather modifiers
- Show weather impact in race briefing UI
- Display weather warnings if conditions are extreme
- Suggest gear/nutrition based on weather (e.g., more water for hot weather)

## Validation Criteria

### Testing Checklist
- [ ] Different races on the same day have different weather
- [ ] Same race (scheduleId) generates consistent weather when viewed multiple times
- [ ] Weather varies by season (summer = hotter, winter = colder)
- [ ] Weather impacts race performance measurably
- [ ] Extreme weather shows appropriate warnings
- [ ] Weather data is displayed correctly in preparation screen
- [ ] Weather persists correctly through briefing → race → results flow

### Expected Weather Variety
- **Local races**: More predictable, regional weather patterns
- **Regional/State**: Moderate variety
- **National/International**: Higher chance of challenging conditions

### Performance Impact Examples
- **Hot + Humid**: -5% to -15% pace, +20% hydration need
- **Cold + Rainy**: -3% to -10% pace, +10% stamina drain
- **Strong Wind**: -5% to -20% pace (depending on direction vs. course)
- **Optimal Conditions**: +2% to +5% pace bonus

## Technical Notes

### Randomization Strategy
- Use `scheduleId` + `dayIndex` as seed for deterministic pseudo-random generation
- This ensures:
  - Same race viewed multiple times shows same weather
  - Different races have different weather
  - Weather is deterministic for debugging and consistency

### UI/UX Considerations
- Weather icons should be prominent and clear
- Add tooltip/info explaining weather impact
- Color-code weather severity (green = optimal, yellow = challenging, red = extreme)
- Show recommended gear/nutrition adjustments for weather

## Priority
**HIGH** - This affects core game variety and race preparation strategy

## Estimated Complexity
**Medium** - Requires new weather system but clear implementation path

## Related Issues
- Weather should also affect training recommendations
- Seasonal weather patterns should align with calendar system
- Equipment bonuses should interact with weather (rain jacket helps in rain, etc.)
