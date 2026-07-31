# Run-Quest Sprint 41 Task Index

## Overview
This sprint focuses on fixing critical bugs, enhancing gameplay systems, and improving UX across multiple features.

---

## Task Summary

### 🔴 HIGH Priority

#### [TASK-001: Fix XP Progression System Reset Bug](./TASK-001-fix-xp-progression-system.md)
**Effort**: 3-4 hours | **Status**: Not Started

**Problem**: XP and level reset to 0 when resting (1 day or 1 week). XP sources are too limited.

**Solution**:
- Debug and fix XP preservation during rest actions and timeline fast-forward
- Expand XP sources: training (15-30 XP), race registration (10-50 XP), race completion (50-1500+ XP based on placement), work (5-20 XP)
- Implement proportional XP rewards based on effort and achievement
- Create centralized XP reward system (`xp-rewards.ts`)

**Key Files**:
- `src/store/timeline-store.ts` - Fix preservation
- `src/training/training-engine.ts` - Update training XP
- `src/runner/xp-rewards.ts` - NEW: Centralized rewards
- `src/features/race/race-screen.tsx` - Add race completion XP
- `src/runner/progression-engine.ts` - Already correct

---

### 🟡 MEDIUM Priority

#### [TASK-002: Expand Shop Catalog with New Items](./TASK-002-expand-shop-catalog.md)
**Effort**: 4-6 hours | **Status**: Not Started

**Problem**: Limited variety in shop items across all categories. Players need more progression options.

**Solution**:
- Add 5 new nutrition items (beetroot juice, isotonic drink, protein bar, carb chews, endurance gel+)
- Add 4 new shoes (marathon racer, ultra trail, speed flats, plated supershoe)
- Add 5 new gear items (sunglasses, arm sleeves, running belt, headband, running backpack)
- Integrate into translations, race UI, events, and breaking points

**Key Files**:
- `src/shop/shop-catalog.ts` - Add items
- `src/content/translations/en.json` & `id.json` - Translations
- `src/components/race/mobile-race-navbar.tsx` - Race UI integration
- `src/content/events/decision-database.ts` - Event triggers
- `src/engine/breaking-points/breaking-database.ts` - Gear mitigations

---

#### [TASK-003: Remove Target Time & Add Coach Prediction System](./TASK-003-remove-target-time-add-coach-prediction.md)
**Effort**: 3-4 hours | **Status**: Not Started

**Problem**: Manual target time input creates cognitive overload and doesn't affect gameplay meaningfully.

**Solution**:
- Remove target time from preparation, briefing, and analytics
- Create coach prediction engine that analyzes:
  - Win probability (1-99%)
  - Recommended race strategy
  - Competitive pace range suggestions
  - Key competitor threats
  - Personalized coach notes
- Display prediction in briefing screen with beautiful UI

**Key Files**:
- `src/store/preparation-store.ts` - Remove targetTime
- `src/features/preparation/preparation-screen.tsx` - Remove input UI
- `src/coach/race-prediction.ts` - NEW: Prediction engine
- `src/features/briefing/briefing-screen.tsx` - Add prediction display
- `src/services/analytics/race-analytics.ts` - Remove target comparison

---

#### [TASK-005: Enhanced Live Standings (Top 10 + Bottom 3 + Player)](./TASK-005-enhanced-live-standings.md)
**Effort**: 3-4 hours | **Status**: Not Started

**Problem**: Current standings show limited runners, making it hard to understand player position in large fields (50-5000 runners).

**Solution**:
- Always show Top 10 runners
- Show Bottom 3 (including DNFs)
- Show player context when mid-pack (player ± 1 runner)
- Add intelligent dividers (`... 142 runners ...`)
- Add momentum indicators (↗️↘️ trending up/down)
- Medal icons for podium (🥇🥈🥉)
- Highlight player row with distinct styling

**Key Files**:
- `src/components/race/enhanced-standings.tsx` - NEW: Enhanced component
- `src/features/race/race-screen.tsx` - Desktop integration
- `src/components/race/mobile-race-navbar.tsx` - Mobile integration

---

### 🟢 LOW Priority

#### [TASK-004: Make Race Entrants Dynamic](./TASK-004-dynamic-race-entrants.md)
**Effort**: 2-3 hours | **Status**: Not Started

**Problem**: Race entry modal always shows "1 / X" entrants instead of realistic dynamic counts.

**Solution**:
- Create dynamic entrant calculation engine
- Simulate realistic registration patterns (sigmoid curve)
- Early bird registration (30+ days: 5-15%)
- Last-minute rush (final 3-7 days: 80-95%)
- Tier-based fill rates (International fills faster)
- Add visual fill rate bar and "Almost Full" indicators

**Key Files**:
- `src/scheduling/race-entrants-engine.ts` - NEW: Calculation engine
- `src/components/scheduling/race-entry-modal.tsx` - Dynamic display
- `src/features/scheduling/race-calendar.tsx` - Optional calendar badges

---

## Implementation Order Recommendation

### Phase 1: Critical Fixes (Week 1)
1. **TASK-001** (HIGH) - Fix XP progression bug first (blocks progression)
2. **TASK-003** (MEDIUM) - Remove target time and add coach prediction (improves UX)

### Phase 2: Content & Enhancement (Week 2)
3. **TASK-002** (MEDIUM) - Expand shop catalog (adds variety)
4. **TASK-005** (MEDIUM) - Enhanced standings (improves race experience)

### Phase 3: Polish (Week 3)
5. **TASK-004** (LOW) - Dynamic entrants (nice-to-have polish)

---

## Estimated Total Effort

| Priority | Tasks | Hours |
|----------|-------|-------|
| HIGH     | 1     | 3-4   |
| MEDIUM   | 3     | 10-14 |
| LOW      | 1     | 2-3   |
| **TOTAL**| **5** | **15-21** |

**Sprint Duration**: 2-3 weeks (at 8-10 hours/week pace)

---

## Dependencies & Conflicts

### Task Dependencies:
- **TASK-001** should be completed first (affects other systems)
- **TASK-002** and **TASK-003** are independent, can be done in parallel
- **TASK-004** and **TASK-005** are independent, can be done in parallel

### Potential Conflicts:
- **TASK-001** touches `timeline-store.ts` which is used by multiple systems
- **TASK-003** modifies `preparation-store.ts` and `briefing-screen.tsx`
- **TASK-005** modifies `race-screen.tsx` which is a large file

### Risk Mitigation:
- Complete TASK-001 first to avoid merge conflicts
- Test XP system thoroughly before moving to other tasks
- Use feature branches for each task
- Run full test suite after each task completion

---

## Testing Strategy

### Unit Tests:
- All calculation engines (XP, entrants, prediction, standings)
- State management functions
- Type safety across all changes

### Integration Tests:
- XP persistence across game actions
- Shop purchase flows with new items
- Coach prediction display in briefing
- Standings display in both desktop and mobile

### Regression Tests:
- Ensure rest actions work correctly
- Race completion flows
- Training system integrity
- Shop inventory system

### Manual QA Checklist:
- [ ] XP never resets to 0
- [ ] All new shop items purchasable and usable
- [ ] Coach predictions make sense
- [ ] Standings show correctly for all field sizes
- [ ] Entrant counts are realistic
- [ ] Dark mode looks good everywhere
- [ ] Translations work (EN/ID)
- [ ] Mobile layouts work properly

---

## Success Metrics

### Player Experience:
- XP progression feels rewarding and never regresses
- Shop has enough variety for strategic decisions
- Coach predictions help players without controlling them
- Race standings provide clear positional context
- Registration flows feel more realistic

### Technical Quality:
- No TypeScript errors
- All tests passing
- No performance regressions
- Clean, maintainable code
- Comprehensive documentation

---

## Notes

- All tasks include detailed implementation plans with code examples
- Each task has comprehensive testing plans
- Translations are included for both EN and ID
- Dark mode support is included in all UI changes
- Mobile-first design principles applied throughout

---

## Next Steps

1. Review all task documents with the team
2. Prioritize and assign tasks
3. Create feature branches for each task
4. Begin with TASK-001 (XP fix)
5. Set up daily standups to track progress
6. Plan sprint demo for Week 3

---

## Questions for Team Discussion

1. Should we add XP gain notifications to UI (toast/popup)?
2. Do we want coach personality variants (aggressive vs conservative)?
3. Should entrant counts be stored or always calculated on-the-fly?
4. Do we need analytics tracking for these new features?
5. Should we add achievements for new shop items?

---

**Created**: 2026-07-31  
**Sprint**: 41  
**Version**: 1.0
