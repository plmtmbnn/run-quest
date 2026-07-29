# Sprint 37: Social Competition & Community Engagement

**Goal**: Transform races from isolated experiences into socially competitive events through live ghost runners, global leaderboards, spectator mode, and enhanced rival interactions.

**Focus**: Add social comparison features that create FOMO (Fear Of Missing Out), competitive drive, and community engagement without requiring real multiplayer infrastructure.

---

## 🎯 Sprint Objectives
- Implement live ghost runner visualization during races
- Create global leaderboard with live activity feed
- Add rival proximity alerts (audio/visual)
- Build spectator mode simulation (friends watching)
- Enhance milestone markers with upcoming achievements
- Create combo/streak reward system
- Add live XP/currency accumulation ticker

---

## 📋 Tasks

### 1. Live Ghost Runner System
**Priority**: HIGH  
**Estimate**: 8 points

**Description**:  
Add translucent ghost runners that show friends' best performances and global top times, creating constant visual comparison and competitive drive.

**Implementation Details**:
- Create `GhostRunner` component in `src/components/race/ghost-runner.tsx`
- Ghost types:
  1. **Personal Best**: Player's own best time (blue ghost)
  2. **Friend Ghost**: Selected friend's best time (green ghost)
  3. **World Record**: Global best time for distance (gold ghost)
  4. **Rival Ghost**: Current rival's best time (red ghost)

- Ghost data structure:
  ```typescript
  interface GhostRunner {
    id: string;
    name: string;
    type: 'personal' | 'friend' | 'world' | 'rival';
    splitTimes: number[]; // time at each km
    finalTime: number;
    avatarColor: string;
  }
  ```

- Visual rendering:
  - Integrate with `TrackPositionVisualizer` component
  - Translucent runner silhouettes: `opacity-40`
  - Color-coded based on type
  - Name label above ghost: `text-xs font-bold`
  - Show distance gap: "+15m ahead" or "-8m behind"
  - Maximum 3 ghosts simultaneously (avoid clutter)

- Position calculation:
  ```typescript
  Calculate ghost position at current race time:
  - Interpolate between split times
  - Show on track visualization
  - Update every simulation tick
  ```

- Comparative feedback:
  - When passing a ghost: "💪 You just beat your PB pace!"
  - When being passed: "⚠️ Your PB ghost is pulling away..."
  - At km splits: "You're 5s ahead of your friend Jake!"

- Ghost selection UI:
  - Pre-race ghost selection screen (part of preparation)
  - Choose up to 3 ghosts to race against
  - Preview their finish times

**Acceptance Criteria**:
- [x] Ghosts render accurately on track position
- [x] Position updates smoothly during race
- [x] Distance gaps calculated correctly
- [x] Passing/being passed triggers feedback
- [x] Works with existing TrackPositionVisualizer
- [x] Performance optimized (no frame drops)

**Files to create/modify**:
- `src/components/race/ghost-runner.tsx` (new)
- `src/components/race/track-position-visualizer.tsx` (modify for ghosts)
- `src/features/race/race-screen.tsx` (integrate ghosts)
- `src/store/ghost-store.ts` (new - ghost data management)
- `src/features/preparation/preparation-screen.tsx` (add ghost selection)

---

### 2. Global Leaderboard & Live Activity Feed
**Priority**: HIGH  
**Estimate**: 7 points

**Description**:  
Create global leaderboard system with live activity feed showing other players' achievements in real-time, creating FOMO and community connection.

**Implementation Details**:
- Create `GlobalLeaderboard` component in `src/components/social/global-leaderboard.tsx`
- Leaderboard categories:
  1. **Daily Top Times**: Best times for each distance today
  2. **Weekly Champions**: Top performers this week
  3. **All-Time Records**: Global best times
  4. **Rising Stars**: Fastest improving players this week
  5. **Most Active**: Players with most races completed

- Live Activity Feed:
  ```typescript
  interface ActivityFeedItem {
    playerName: string;
    achievement: string; // "Set new 5K record!", "Completed 100th race!"
    timestamp: number;
    distance: string;
    time: string;
  }
  ```

- Feed events:
  - New personal records
  - Top 10 finishes
  - Milestone achievements (100th race, 1000km total)
  - Rivalry victories
  - Major improvements (beat PB by >60s)

- Visual design:
  - Accessible from main menu: New "🌍 Global" tab
  - Card layout: `bg-white dark:bg-slate-900 rounded-[2rem] p-6`
  - Leaderboard table: Top 50 players per category
  - Activity feed: Scrolling list, latest 100 activities
  - Auto-refresh: Every 30 seconds
  - Highlight current player position in green

- Mini-feed during race:
  - Optional compact feed in race screen (top-right)
  - Shows only major achievements during your race
  - "🏆 Player XYZ just set a new 10K world record!"
  - Dismissible, non-intrusive

- Offline/local-only mode:
  - If no internet, show "Local Champion" status
  - Compare only against device records
  - Sync when connection restored

**Acceptance Criteria**:
- [x] Leaderboard displays top 50 for each category
- [x] Activity feed updates in real-time
- [x] Current player position highlighted
- [x] Mini-feed during race non-intrusive
- [x] Works offline (local mode)
- [x] Data persistence and sync

**Files to create/modify**:
- `src/components/social/global-leaderboard.tsx` (new)
- `src/components/race/live-activity-feed.tsx` (new - mini version)
- `src/services/leaderboard/leaderboard-service.ts` (new - API integration)
- `src/features/race/race-screen.tsx` (integrate mini-feed)
- `src/app/global/page.tsx` (new - leaderboard page)

---

### 3. Rival Proximity Alert System
**Priority**: HIGH  
**Estimate**: 6 points

**Description**:  
Add audio and visual alerts when rivals are close, creating tension and urgency similar to hearing footsteps behind you in a real race.

**Implementation Details**:
- Create `RivalProximityAlert` component in `src/components/race/rival-proximity-alert.tsx`
- Proximity detection:
  ```typescript
  Calculate distance between player and each rival:
  - Close (0-30m): IMMEDIATE THREAT
  - Near (30-100m): APPROACHING
  - Medium (100-200m): VISIBLE
  - Far (>200m): OUT OF RANGE
  ```

- Alert types:
  1. **Behind Alert**: Rival catching up from behind
     - Visual: Red indicator arrow pointing back "👤→"
     - Audio: Footsteps sound (increasing tempo)
     - Text: "{{rivalName}} is 15m behind - PUSH!"
  
  2. **Ahead Alert**: Catching up to rival ahead
     - Visual: Green indicator arrow pointing forward "→👤"
     - Audio: Motivational beep
     - Text: "You're gaining on {{rivalName}}! 20m gap!"
  
  3. **Side-by-Side**: Running even with rival
     - Visual: Yellow indicator "👤=👤"
     - Audio: Intense heartbeat overlay
     - Text: "HEAD TO HEAD with {{rivalName}}!"
  
  4. **Overtaking**: Passing a rival
     - Visual: Large green checkmark ✓
     - Audio: Triumphant chime
     - Text: "💪 You overtook {{rivalName}}!"
  
  5. **Being Overtaken**: Rival passes you
     - Visual: Red warning flash
     - Audio: Alert tone
     - Text: "⚠️ {{rivalName}} just passed you!"

- Visual design:
  - Position: Left side, below breathing control
  - Indicator size: `w-16 h-16` circle
  - Pulsing animation when close
  - Rival avatar/color shown
  - Distance display: `font-mono font-bold text-sm`

- Audio management:
  - Footsteps volume based on proximity (louder when closer)
  - Stereo positioning: Behind = back channels, ahead = front channels
  - Toggle in settings
  - Mute during decision moments

**Acceptance Criteria**:
- [x] Proximity calculated accurately for all rivals
- [x] Alerts trigger at correct distance thresholds
- [x] Audio feedback matches proximity and direction
- [x] Visual indicators clear and non-distracting
- [x] Works with multiple rivals simultaneously
- [x] Audio toggleable in settings

**Files to create/modify**:
- `src/components/race/rival-proximity-alert.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate alerts)
- `src/engine/simulation/engine.ts` (calculate rival positions)
- `public/audio/footsteps-close.mp3` (new audio asset)
- `public/audio/footsteps-approaching.mp3` (new audio asset)

---

### 4. Spectator Mode Simulation
**Priority**: MEDIUM  
**Estimate**: 5 points

**Description**:  
Simulate friends "watching" your race, creating social pressure and accountability through spectator count and reactions.

**Implementation Details**:
- Create `SpectatorMode` component in `src/components/race/spectator-mode.tsx`
- Spectator simulation:
  ```typescript
  Spectator count based on:
  - Player level (higher = more followers)
  - Race importance (championship > casual)
  - Recent performance streak
  - Social connections (real friend count if multiplayer)
  - Random variation (±30%)
  
  Base: 5-10 spectators
  Popular: 50-100 spectators
  Elite: 500+ spectators
  ```

- Spectator reactions:
  - **Positive events**: Overtaking, PB pace, good decisions
    - Reaction: "👏 +12 cheers"
    - Visual: Floating emoji upward
  - **Negative events**: Being overtaken, breaking point, poor pace
    - Reaction: "😬 Crowd gasps"
    - Visual: Concerned emoji
  - **Neutral**: Mid-race steady state
    - Reaction: Occasional "You got this!" message

- Pressure mechanic:
  - High spectator count = +5% performance pressure
  - Affects confidence and mental fatigue slightly
  - Can be motivating or stressful based on runner personality (future trait)

- Visual design:
  - Position: Top-right corner, compact indicator
  - Display: "👀 {{count}} watching"
  - Reaction popups: Small, brief, unobtrusive
  - Eye icon pulses when reactions occur
  - Expandable panel shows recent reactions list

- Post-race social:
  - "{{count}} people watched your race!"
  - Share result card with spectator count badge
  - Unlock achievement: "Celebrity Runner" (1000+ spectators)

**Acceptance Criteria**:
- [x] Spectator count calculated based on player status
- [x] Reactions trigger at appropriate race moments
- [x] Visual reactions smooth and non-distracting
- [x] Pressure mechanic applies correctly
- [x] Post-race summary includes spectator stats
- [x] Can be disabled in settings

**Files to create/modify**:
- `src/components/race/spectator-mode.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate spectators)
- `src/engine/simulation/engine.ts` (calculate spectator reactions)
- `src/components/race/result-card-generator.tsx` (add spectator badge)

---

### 5. Milestone Markers & Achievement Preview
**Priority**: MEDIUM  
**Estimate**: 5 points

**Description**:  
Show upcoming achievements and milestones during the race, creating anticipation and motivation to push harder.

**Implementation Details**:
- Create `MilestoneMarkers` component in `src/components/race/milestone-markers.tsx`
- Milestone types:
  1. **Achievement Unlocks**: "500m to unlock 'Speed Demon' achievement!"
  2. **PB Zone**: "Next km at PB pace - new record possible!"
  3. **Rival Catchup**: "Beat rival in next 2km for bonus XP!"
  4. **Level-Up**: "Race finish will trigger Level UP!"
  5. **Streak Bonus**: "Finish top 5 for 3-race win streak!"

- Visual design:
  - Position: Track visualization overlay
  - Marker icons on track at specific distances
  - Glow effect on upcoming milestone
  - Distance countdown: "1.2km to milestone"
  - Icon types: 🏆 (achievement), ⭐ (level), 🎯 (goal), 💰 (bonus)

- Notification system:
  - At 1km before: "Upcoming: [Milestone Name]"
  - At 500m before: Pulsing icon, increased emphasis
  - On achievement: Full celebration animation
  - On miss: "You missed [Milestone] - try again next time!"

- Dynamic calculation:
  ```typescript
  Continuously check:
  - Current pace vs PB pace
  - Position vs rivals
  - Distance remaining
  - Projected finish time
  - Update markers in real-time
  ```

- Marker categories filter:
  - Toggle which types to show
  - "Show only achievements" option
  - Avoid clutter (max 3 visible markers)

**Acceptance Criteria**:
- [x] Milestones calculated accurately in real-time
- [x] Markers display on track at correct positions
- [x] Notifications trigger at 1km and 500m
- [x] Celebration on achievement completion
- [x] No more than 3 markers visible simultaneously
- [x] Filter options work correctly

**Files to create/modify**:
- `src/components/race/milestone-markers.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate markers)
- `src/engine/achievements/race-achievements.ts` (expose upcoming achievements)
- `src/components/race/track-position-visualizer.tsx` (add marker overlay)

---

### 6. Combo & Streak Reward System
**Priority**: MEDIUM  
**Estimate**: 6 points

**Description**:  
Reward consecutive good decisions and consistent performance with combo multipliers and streak bonuses, creating addictive gameplay loop.

**Implementation Details**:
- Create `ComboStreak` component in `src/components/race/combo-streak.tsx`
- Combo triggers:
  ```typescript
  Good Decision: +1 combo
  Perfect Pacing (within 2% of target): +1 combo per km
  No breaking points: +1 combo per km
  Rhythm perfect hits (10+): +1 combo
  Overtaking rival: +2 combo
  
  Combo breaks on:
  - Bad decision
  - Breaking point
  - Pace deviation >10%
  - Being overtaken (unless already ahead)
  ```

- Combo multipliers:
  ```typescript
  Combo 3-5: 1.2x XP
  Combo 6-10: 1.5x XP + "On Fire 🔥" status
  Combo 11-15: 2x XP + "Unstoppable ⚡" status
  Combo 16+: 2.5x XP + "Legendary 👑" status
  ```

- Streak bonuses:
  ```typescript
  Win Streak (consecutive top 3 finishes):
  - 2 races: +10% prize money
  - 3 races: +20% prize money + "Hot Streak" badge
  - 5 races: +50% prize money + "Domination" badge
  - 10 races: +100% prize money + "Unstoppable Force" achievement
  ```

- Visual design:
  - Position: Top-center, below header
  - Combo display: Large number with fire animation
  - Color progression: White (1-5) → Yellow (6-10) → Orange (11-15) → Red (16+)
  - Status text: "UNSTOPPABLE ×2.5 XP"
  - Combo break: Screen flash, "-COMBO LOST-" message
  - Streak indicator: Small badge in corner "🔥 3 Race Streak"

- Audio feedback:
  - Combo building: Ascending pitch tones
  - Combo milestones: Dramatic stinger
  - Combo break: Descending tone (not punishing, just informative)

**Acceptance Criteria**:
- [x] Combo tracks all trigger events correctly
- [x] Multipliers apply to XP gains
- [x] Streak bonuses apply to race rewards
- [x] Visual feedback matches combo level
- [x] Combo break clearly communicated
- [x] Streak persists across races

**Files to create/modify**:
- `src/components/race/combo-streak.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate combo system)
- `src/engine/simulation/engine.ts` (track combo events)
- `src/economy/earning-engine.ts` (apply streak bonuses)
- `src/store/player-store.ts` (persist streak data)

---

### 7. Live XP & Currency Accumulation Ticker
**Priority**: MEDIUM  
**Estimate**: 4 points

**Description**:  
Show real-time XP and currency gains during the race as floating popups, creating immediate reward feedback.

**Implementation Details**:
- Create `LiveRewardTicker` component in `src/components/race/live-reward-ticker.tsx`
- Reward events:
  ```typescript
  Overtaking rival: +50 XP, +20 coins
  Km completion: +10 XP
  Good decision: +25 XP
  Breaking point survived: +40 XP
  Maintaining flow state: +5 XP per km
  Rhythm combo: +15 XP
  Achievement unlock: +100 XP (varies)
  ```

- Visual design:
  - Position: Near event location (rival position, decision button, etc.)
  - Floating animation: Rise upward and fade out
  - Color: XP = `text-blue-500`, Currency = `text-emerald-500`
  - Size: `text-lg font-mono font-bold`
  - Format: "+50 XP" or "+20 💰"
  - Duration: 2 seconds
  - Queue multiple popups (stack vertically)

- Running total display:
  - Small ticker in top-right: "Total this race: +450 XP | +180 💰"
  - Updates in real-time
  - Compare to previous race: "150% more than last race!"

- Multiplier indication:
  - Show active multipliers: "+50 XP ×2.5 🔥" (combo bonus)
  - Color shift when multiplier active

- Post-race summary:
  - Animated count-up of total earnings
  - Breakdown by source (overtakes, decisions, achievements, etc.)

**Acceptance Criteria**:
- [x] Popups appear at correct positions and times
- [x] All reward events tracked accurately
- [x] Running total updates in real-time
- [x] Multipliers display correctly
- [x] Popups don't clutter screen (queue management)
- [x] Post-race summary shows accurate totals

**Files to create/modify**:
- `src/components/race/live-reward-ticker.tsx` (new)
- `src/features/race/race-screen.tsx` (integrate ticker)
- `src/engine/simulation/engine.ts` (emit reward events)
- `src/economy/earning-engine.ts` (calculate real-time rewards)

---

## 🎨 Design System Compliance

All components MUST follow:
- **Social elements**: Use community colors `indigo-500`, `blue-500` for global features
- **Competition**: Use `emerald-500` (winning), `rose-500` (losing), `amber-500` (contested)
- **Badges/Streaks**: `text-[10px] font-bold uppercase tracking-wider`
- **Floating popups**: `animate-float-up` with `opacity-0` fade out
- **Numbers**: Always `font-mono font-bold`
- **Dark Mode**: All social UI must work in dark mode
- **Accessibility**: Spectator and audio features toggleable

---

## 🧪 Testing Requirements

### Unit Tests
- Ghost position interpolation accuracy
- Proximity distance calculations
- Combo trigger logic
- Streak persistence across races
- Reward event accumulation

### Integration Tests
- Ghosts sync with race simulation
- Leaderboard data fetch and update
- Proximity alerts trigger correctly
- Spectator reactions match events
- Milestone markers update dynamically

### Manual QA Checklist
- [ ] Ghosts render and move smoothly
- [ ] Leaderboard loads and refreshes
- [ ] Proximity audio matches rival position
- [ ] Spectator reactions appropriate
- [ ] Milestones trigger at correct distances
- [ ] Combo breaks on bad events
- [ ] Streak bonuses persist across races
- [ ] XP ticker shows all rewards
- [ ] All features work in dark mode
- [ ] Offline mode degrades gracefully

---

## 📦 Dependencies

No new dependencies required.

---

## 🚀 Definition of Done

- [x] All 7 tasks completed and tested
- [x] Design system guidelines followed
- [x] Dark mode fully supported
- [x] Offline/local-only mode functional
- [x] Audio toggles work for all sound effects
- [x] Performance maintained (60fps)
- [ ] Code reviewed and merged to master
- [ ] Analytics tracking implemented
- [ ] User feedback collected on social features

---

## 📊 Success Metrics

Track in analytics:
- Ghost runner usage rate (% of races with ghosts enabled)
- Leaderboard engagement (daily active users viewing)
- Combo achievement rate (% races with 10+ combo)
- Streak completion rate (% players with 3+ race streak)
- Spectator mode engagement (toggle on/off rate)
- Rival proximity alert reactions (player response)
- Social sharing increase (result card shares)

---

## 🎯 Implementation Priority

**Phase 1 (Week 1)**: Core social features
1. Live Ghost Runner System
2. Global Leaderboard & Activity Feed
3. Rival Proximity Alerts

**Phase 2 (Week 2)**: Reward systems
4. Combo & Streak System
5. Live XP Ticker
6. Milestone Markers

**Phase 3 (Polish)**: Optional features
7. Spectator Mode (can be added later if time constrained)

---

## 📝 Notes

- Leaderboard requires backend API (mock with local data initially)
- Consider privacy: Allow players to opt-out of global leaderboard
- Ghost data can be stored locally or fetched from cloud
- Audio feedback critical for immersion—prioritize quality
- Social features should enhance, not distract from race focus
