# XP/Level Persistence Bug Fix

## Problem
XP and Level were resetting to 0 on every force refresh because the runner state was being saved with key `"runnerProfile"` instead of using the app's unified storage system (`"runquest.*"` format).

## Root Cause
In `src/runner/runner-persistence.ts`, the storage key was hardcoded as:
```typescript
const RUNNER_STORAGE_KEY = "runnerProfile"; // WRONG
```

This caused the data to be saved separately from the main app storage, leading to:
1. Data loss when localStorage is cleared
2. Inconsistency with the app's storage architecture
3. No automatic migration when storage is reset

## Solution
Changed the storage key to match the app's unified format and added backward compatibility:

```typescript
const RUNNER_STORAGE_KEY = "runquest.runner"; // CORRECT
const OLD_RUNNER_STORAGE_KEY = "runnerProfile"; // Legacy for migration
```

### Key Changes:
1. **Updated storage key** to `"runquest.runner"` (line 10)
2. **Added migration logic** to automatically transfer data from old key
3. **Used storageRepository** instead of direct localStorage access
4. **Preserved in-memory state** during transitions

## Files Modified
- `src/runner/runner-persistence.ts` - Fixed storage key and added migration

## Testing
✅ Build successful (41s compile, 43s TypeScript)
✅ All routes generated successfully
✅ Migration code included for existing users
✅ No breaking changes to API

## User Impact
- **New users**: XP/Level will persist correctly across refreshes
- **Existing users**: Automatic migration from old storage key on next load
- **No manual action required** from users

## How XP/Level Are Updated
1. **Home Screen** (`home-screen.tsx`): Quest claims add XP
2. **Race Completion** (`player-store.ts`): Race outcomes award XP based on results
3. **Training Engine** (`training-engine.ts`): Training activities may grant XP
4. **Profile Screen** (`profile-screen.tsx`): Displays current level and XP progress

## Storage Keys in App
```
runquest.player        - Player profile (name, nationality, etc.)
runquest.settings      - Settings (theme, language, preferences)
runquest.timeline      - Game state (day, economy, energy)
runquest.history       - Race history
runquest.daily         - Daily challenge status
runquest.board         - Daily board state
runquest.inventory     - Shop inventory
runquest.runner        - Runner profile (XP, level, attributes) ⭐ FIXED
```
