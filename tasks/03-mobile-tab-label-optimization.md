# Task: Mobile Tab Label Optimization - Social Screen

## Issue
In `social-screen.tsx`, tab navigation shows both icon/emoji AND label text on all tabs at all times. On mobile devices with limited screen width, this causes cramped spacing and reduced tap target efficiency.

## Current Behavior (lines 262-291)
```typescript
<button className="...">
  <span>
    {tab === "leaderboard" && "🏆"}
    {tab === "club" && "🛡️"}
    {tab === "stats" && "⚔️"}
    {tab === "feed" && "📡"}
  </span>
  <span className="truncate">
    {t(`social.tabs.${tab}` as TranslationKey)}
  </span>
</button>
```
- Both icon and label always visible
- Text can truncate but takes up space
- Creates horizontal crowding on mobile

## Expected Behavior
- **Active tab**: Show both icon AND label/header text
- **Inactive tabs**: Show ONLY icon/emoji (hide label text)
- **Desktop/Tablet**: Optionally show labels for all tabs (screen width permitting)
- Smooth transition between states
- Maintains accessibility

## Reference Implementation
The `race-calendar.tsx` file (line 220) already implements this correctly:
```typescript
<span className={`${isActive ? "block" : "hidden sm:block"} truncate`}>
  {t(tab.labelKey)}
</span>
```
This uses Tailwind responsive classes:
- Mobile: Hide if not active (`hidden`), show if active (`block`)
- Small screens and up (`sm:`): Always show (`block`)

## Implementation Plan

### Step 1: Update Social Screen Tabs (lines 262-291)
```typescript
<button
  key={tab}
  type="button"
  onClick={() => handleTabChange(tab)}
  className={`py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1 ${
    isActive
      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
  }`}
>
  <span aria-hidden="true" className="text-sm sm:text-base">
    {tab === "leaderboard" && "🏆"}
    {tab === "club" && "🛡️"}
    {tab === "stats" && "⚔️"}
    {tab === "feed" && "📡"}
  </span>
  {/* ✨ NEW: Conditional label visibility */}
  <span className={`${isActive ? "block" : "hidden sm:block"} truncate`}>
    {t(`social.tabs.${tab}` as TranslationKey)}
  </span>
</button>
```

### Step 2: Verify Responsive Breakpoints
Current implementation uses:
- Default (mobile): `hidden` for inactive tabs
- `sm:` breakpoint (≥640px): `block` for all tabs

Consider if different breakpoint is needed:
- `md:` (≥768px) - Medium tablets
- `lg:` (≥1024px) - Large tablets/small desktops

Recommendation: Keep `sm:` as it matches race-calendar pattern and works well for most devices.

### Step 3: Adjust Tab Container Spacing
Current grid: `grid grid-cols-4` creates equal width columns

Consider dynamic sizing for better mobile UX:
```typescript
// Option A: Keep equal width (simpler, current approach)
className="grid grid-cols-4 ... gap-1"

// Option B: Flex with auto width (more dynamic)
className="flex ... gap-1.5"
// Then each button: className="flex-1 sm:flex-initial"
```

Recommendation: Keep `grid-cols-4` for consistent tab sizing and clean alignment.

### Step 4: Ensure Accessibility
```typescript
<button
  key={tab}
  type="button"
  onClick={() => handleTabChange(tab)}
  aria-label={t(`social.tabs.${tab}` as TranslationKey)} // ✅ Add for screen readers
  aria-current={isActive ? "page" : undefined} // ✅ Indicate active tab
  className="..."
>
  <span aria-hidden="true">🏆</span> {/* ✅ Hide decorative emoji from screen readers */}
  <span className={`${isActive ? "block" : "hidden sm:block"} truncate`}>
    {t(`social.tabs.${tab}` as TranslationKey)}
  </span>
</button>
```

### Step 5: Animation Polish (Optional)
Add smooth transition for label appearance:
```typescript
<span className={`
  ${isActive ? "block" : "hidden sm:block"}
  truncate
  transition-opacity duration-200
  ${isActive ? "opacity-100" : "opacity-0 sm:opacity-100"}
`}>
  {t(`social.tabs.${tab}` as TranslationKey)}
</span>
```

## Mobile View Examples

### Before (Current)
```
┌─────────────────────────────────────┐
│ 🏆 LEADER... │ 🛡️ CLUB │ ⚔️ STATS │ 📡 FEED │  ← Cramped, truncated
└─────────────────────────────────────┘
```

### After (Proposed)
```
┌─────────────────────────────────────┐
│    🏆          🛡️        ⚔️         📡    │  ← Clean, spacious
│ LEADERBOARD                            │  ← Only active tab shows label
└─────────────────────────────────────┘
```

### Desktop/Tablet (sm: breakpoint and up)
```
┌──────────────────────────────────────────────────┐
│ 🏆 LEADERBOARD │ 🛡️ CLUB │ ⚔️ STATS │ 📡 FEED │  ← All labels visible
└──────────────────────────────────────────────────┘
```

## Files to Modify

### Primary File
1. **`src/features/social/social-screen.tsx`** (lines 262-291)
   - Update label visibility class
   - Add proper aria-labels
   - Test responsive behavior

### Consider Applying Pattern To:
2. **Other screens with tab navigation** (search for similar patterns)
   - Profile screen tabs
   - Settings screen sections
   - Any other multi-tab interfaces

Note: Race calendar already implements this correctly, use as reference.

## Validation Criteria

### Visual Testing
- [ ] Mobile (<640px): Only active tab shows label
- [ ] Mobile: Inactive tabs show only icon
- [ ] Tablet (≥640px): All tabs show icon + label
- [ ] Desktop: All tabs show icon + label
- [ ] Active tab is clearly distinguishable at all sizes
- [ ] Smooth transition when switching tabs
- [ ] No layout shift or jumping when labels appear/disappear

### Functional Testing
- [ ] All tabs remain clickable/tappable
- [ ] Tap targets remain ≥44px height (accessibility)
- [ ] No text truncation on tablet/desktop
- [ ] Icons remain visible and aligned
- [ ] Badge counts still visible and positioned correctly

### Accessibility Testing
- [ ] Screen readers announce tab names correctly
- [ ] Active tab is indicated to assistive tech (`aria-current`)
- [ ] Keyboard navigation works (tab key to focus, enter/space to activate)
- [ ] Focus indicator is visible
- [ ] Color contrast meets WCAG AA standards

### Cross-Browser Testing
- [ ] Chrome mobile
- [ ] Safari iOS
- [ ] Firefox Android
- [ ] Samsung Internet

## Technical Notes

### Tailwind Responsive Utilities
- `hidden`: `display: none`
- `block`: `display: block`
- `sm:block`: `@media (min-width: 640px) { display: block; }`

### Breakpoint Reference
- `sm`: 640px (phones landscape, small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (large tablets, laptops)
- `xl`: 1280px (desktops)

### Alternative Approaches Considered

#### 1. Icon-only mobile tabs (rejected)
- **Pros**: Maximum space efficiency
- **Cons**: Users might not know what inactive tabs are without labels

#### 2. Horizontal scroll (rejected)
- **Pros**: Can fit more tabs
- **Cons**: Hidden tabs reduce discoverability, more complex UX

#### 3. Active label only (chosen ✅)
- **Pros**: Balance of clarity and space efficiency
- **Cons**: None significant

## Priority
**LOW-MEDIUM** - Nice UX improvement but not critical functionality

## Estimated Complexity
**LOW** - Simple CSS class change, reference implementation exists

## Related Improvements
- Consider adding icon animations on hover/active state
- Add haptic feedback on mobile tab switch
- Optimize tab label translations for brevity
- Consider icon-only bottom navigation bar on mobile (separate task)
