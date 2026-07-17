# Sprint 27: Integration & Polish

**Date**: 2026-07-17  
**Status**: 📋 PLANNED  
**Duration**: 2 weeks  
**Priority**: High  
**Theme**: "Make it work, make it shine"

---

## 🎯 Sprint Overview

Sprint 27 focuses on **integrating and polishing** the features delivered in Sprint 26 (Economy & Scheduling) and Sprint 26.5 (Quality of Life Enhancements). 

**Current State**: 
- ✅ Economy system works (Sprint 26)
- ✅ Starting balance fixed (Sprint 26 Bugfix)
- ✅ Multiple work types implemented (Sprint 26.5)
- ✅ Sponsor approval flow implemented (Sprint 26.5)
- ✅ Multi-currency display implemented (Sprint 26.5)
- ⚠️ **UI components exist but not wired into game flow**
- ⚠️ **Settings persistence not implemented**
- ⚠️ **No automated tests for new features**

**Goal**: Connect all the pieces, add polish, and ensure production readiness.

---

## 📊 Sprint 26 & 26.5 Recap

### What's Done (But Not Integrated)

| Feature | Implementation | UI | Integration | Settings |
|---------|---------------|----|-------------|----------|
| Multiple Work Types | ✅ Complete | ✅ Modal exists | ❌ Not wired | N/A |
| Sponsor Approval Flow | ✅ Complete | ✅ Modal + Notification | ❌ Not wired | N/A |
| Multi-Currency Display | ✅ Complete | ✅ Selector exists | ❌ Not wired | ❌ Not persisted |
| Economy Foundation | ✅ Complete | ✅ Integrated | ✅ Working | N/A |

### Current Gaps

1. **Work Selector**: Modal exists but no button to open it
2. **Sponsor Notifications**: System exists but not triggered in game loop
3. **Currency Settings**: Selector exists but preference not saved
4. **Currency Formatting**: Utilities exist but not used in existing UI
5. **Testing**: No automated tests for new features
6. **Documentation**: Need user-facing guides

---

## 🎯 Sprint 27 Objectives

### Primary Goal
> "Players can use all Sprint 26.5 features seamlessly in the main game"

### Secondary Goals
1. Wire all UI components into game flow
2. Add settings persistence for currency preference
3. Apply currency formatting throughout economy UI
4. Add automated tests for critical paths
5. Polish and bugfix

---

## 📋 Sprint 27 Tasks

### Task 1: Work Selector Integration (2 days)

**Objective**: Replace single "Work" action with dynamic work selection.

#### Subtasks

1.1 **Add work selection button to timeline UI** (1 day)
- Location: `src/components/timeline/` or `src/app/training/`
- Replace current "Work" button with "Choose Work" button
- Open `WorkSelectorModal` when clicked
- Pass `gameState` and handle selection

1.2 **Wire work type to action application** (1 day)
- Update `applyAction` call to use selected work type
- Ensure `workTypeId` is passed correctly
- Verify pay calculation uses correct work type
- Test all 6 work types work end-to-end

#### Acceptance Criteria
- ✅ "Choose Work" button visible in action menu
- ✅ Modal shows all available work types
- ✅ Locked work types show requirements
- ✅ Selecting work applies correct pay/energy
- ✅ All 6 work types functional

#### Files to Modify
```
src/components/timeline/actions-panel.tsx (or similar)
src/app/training/page.tsx (or similar)
src/engine/timeline/actions.ts (verify integration)
```

---

### Task 2: Sponsor System Integration (3 days)

**Objective**: Connect sponsor offer system to game events.

#### Subtasks

2.1 **Trigger offer checks after races** (1 day)
- Hook into race completion flow
- Call `checkForNewOffers()` after each race
- Show notification if new offers received
- Store in game state

2.2 **Add sponsor screen enhancements** (1 day)
- Show pending offers in sponsorship screen
- Add "View Offers" button/section
- Display offer history
- Show rejected sponsors with cooldown timer

2.3 **Integrate notification system** (1 day)
- Add toast notification container
- Show sponsor notifications when offers arrive
- Add badge to economy/sponsor menu items
- Handle notification dismissal

#### Acceptance Criteria
- ✅ Sponsor offers appear after meeting requirements
- ✅ Notification toast appears on new offer
- ✅ Pending offers visible in sponsor screen
- ✅ Accept/Reject flow works end-to-end
- ✅ Rejected sponsors can re-offer after 30 days

#### Files to Modify
```
src/components/scheduling/race-result-modal.tsx (or race completion handler)
src/components/economy/sponsorship-screen.tsx
src/app/sponsors/page.tsx
src/components/layout/notification-container.tsx (new)
```

---

### Task 3: Currency System Integration (2 days)

**Objective**: Enable currency selection and apply formatting everywhere.

#### Subtasks

3.1 **Add currency preference to settings store** (1 day)
- Extend `settings-store.ts` with `preferredCurrency`
- Add actions: `setCurrency()`, `getCurrency()`
- Persist to localStorage
- Default to "USD" for existing users

3.2 **Apply currency formatting to all economy UI** (1 day)
- Update `transaction-log.tsx` to use `formatCurrency()`
- Update `sponsorship-screen.tsx` to use `formatCurrency()`
- Update `race-entry-modal.tsx` to use `formatCurrency()`
- Update balance displays throughout app

#### Acceptance Criteria
- ✅ Currency selector works in settings
- ✅ Preference persists across sessions
- ✅ All money values display in chosen currency
- ✅ Formatting matches locale conventions
- ✅ No hardcoded "$" symbols remain

#### Files to Modify
```
src/store/settings-store.ts
src/components/economy/transaction-log.tsx
src/components/economy/sponsorship-screen.tsx
src/components/scheduling/race-entry-modal.tsx
src/components/layout/header.tsx (balance display)
...all components showing money
```

---

### Task 4: Automated Testing (2 days)

**Objective**: Add test coverage for new features.

#### Subtasks

4.1 **Unit tests for work types** (0.5 day)
- Test `isWorkTypeUnlocked()` with various game states
- Test `calculateWorkPay()` with different stat values
- Test `getAvailableWorkActions()` filtering

4.2 **Unit tests for sponsorship engine** (0.5 day)
- Test `checkForNewOffers()` with requirement thresholds
- Test `acceptOffer()` state transitions
- Test `rejectOffer()` and re-offer timing

4.3 **Unit tests for currency converter** (0.5 day)
- Test `convertToDisplayCurrency()` accuracy
- Test `formatCurrency()` with all 4 currencies
- Test `parseCurrencyInput()` edge cases

4.4 **Integration tests** (0.5 day)
- Test work → earn → balance flow
- Test sponsor offer → accept → benefits flow
- Test currency change → UI update flow

#### Acceptance Criteria
- ✅ All unit tests pass
- ✅ Test coverage > 80% for new features
- ✅ Tests run in CI pipeline
- ✅ No regressions in existing tests

#### Files to Create
```
src/economy/__tests__/work-types.test.ts
src/economy/__tests__/sponsorship-engine.test.ts
src/economy/__tests__/currency-converter.test.ts
```

---

### Task 5: Polish & Bugfixes (3 days)

**Objective**: Address edge cases, improve UX, and fix any issues.

#### Subtasks

5.1 **Work system polish** (0.5 day)
- Add work history to transaction log
- Show work type in transaction descriptions
- Add confirmation dialog for high-energy work
- Improve work type descriptions

5.2 **Sponsor system polish** (0.5 day)
- Add sponsor contract details screen
- Show time remaining until re-offer for rejected sponsors
- Add sponsor tier progression indicator
- Improve notification dismiss behavior

5.3 **Currency system polish** (0.5 day)
- Add currency conversion tooltip
- Show both currencies in settings (e.g., "$500 = Rp 7.85M")
- Add warning for very large numbers (IDR)
- Improve mobile responsiveness

5.4 **General bugfixes** (1 day)
- Fix any issues discovered during integration
- Address edge cases (e.g., negative balance)
- Improve error handling
- Optimize performance if needed

5.5 **Accessibility improvements** (0.5 day)
- Add ARIA labels to new components
- Ensure keyboard navigation works
- Check color contrast ratios
- Add screen reader support

#### Acceptance Criteria
- ✅ All polish items implemented
- ✅ No critical bugs
- ✅ Good UX across all features
- ✅ Accessible to all users

---

### Task 6: Documentation & Onboarding (2 days)

**Objective**: Help players understand and use new features.

#### Subtasks

6.1 **User-facing documentation** (1 day)
- Create "Economy Guide" help page
- Explain work types and when to use each
- Explain sponsor system and benefits
- Explain currency selection

6.2 **Developer documentation** (0.5 day)
- Update README with new features
- Add API documentation for new functions
- Document integration patterns
- Add examples for future developers

6.3 **Tutorial/onboarding updates** (0.5 day)
- Add economy tutorial to new player flow
- Show work types in early game tips
- Explain sponsor unlock requirements
- Add currency selection to settings tutorial

#### Acceptance Criteria
- ✅ Help documentation complete
- ✅ Developer docs updated
- ✅ Tutorial covers new features
- ✅ All documentation accurate

#### Files to Create/Modify
```
src/content/help/economy-guide.mdx
src/content/help/work-types.mdx
src/content/help/sponsors.mdx
README.md
```

---

## 📅 Sprint Timeline

### Week 1: Integration Focus

| Day | Focus | Tasks |
|-----|-------|-------|
| 1 | Work Integration | Task 1: Work Selector |
| 2 | Sponsor Integration | Task 2.1-2.2: Sponsor Flow |
| 3 | Sponsor Integration | Task 2.3: Notifications |
| 4 | Currency Integration | Task 3: Currency System |
| 5 | Testing | Task 4: Automated Tests |

### Week 2: Polish & Documentation

| Day | Focus | Tasks |
|-----|-------|-------|
| 6 | Polish | Task 5.1-5.2: Work & Sponsor Polish |
| 7 | Polish | Task 5.3-5.5: Currency Polish + Bugfixes |
| 8 | Documentation | Task 6.1-6.2: User & Dev Docs |
| 9 | Documentation | Task 6.3: Tutorial Updates |
| 10 | Buffer | Final testing, bugfixes, review |

---

## 🎮 User Flows (Post-Sprint 27)

### Work Selection Flow
```
Player opens action menu
→ Clicks "Choose Work" button
→ WorkSelectorModal opens
→ Sees 6 work types with unlock status
→ Selects "Coaching" (unlocked, Running 35+)
→ Modal closes
→ Action applied: +$75, -35 energy, +1 charisma
→ Transaction logged: "Coaching earnings"
```

### Sponsor Offer Flow
```
Player wins race, reaches 1600 rating
→ checkForNewOffers() triggered
→ Runner's Corner offer created
→ SponsorNotification toast appears
→ Player clicks "View Offer"
→ SponsorOfferModal opens
→ Player reviews benefits
→ Clicks "Sign Contract"
→ Sponsor activated
→ Benefits apply to next training/race
```

### Currency Selection Flow
```
Player opens Settings
→ Sees "Display Currency" option
→ Clicks dropdown
→ Selects "IDR (Rupiah)"
→ Preference saved to localStorage
→ All money values update instantly
→ Balance shows: "Rp 7.850.000" (was "$500")
```

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature adoption (work types) | >70% use 2+ types | Analytics |
| Sponsor acceptance rate | 75-85% | Telemetry |
| Currency customization | >15% change from USD | Settings data |
| Bug reports | <5 critical | Support tickets |
| Test coverage | >80% for new code | Code coverage |
| Player satisfaction | Positive feedback | Surveys |

---

## 🚨 Risks & Mitigations

### Risk 1: Integration Complexity
**Risk**: Connecting new systems to existing game flow is complex  
**Mitigation**: 
- Start with one feature at a time
- Use feature flags for gradual rollout
- Extensive manual testing between integrations

### Risk 2: Settings Persistence Issues
**Risk**: Currency preference not persisting correctly  
**Mitigation**:
- Use existing settings store pattern
- Test localStorage read/write thoroughly
- Add fallback to default (USD)

### Risk 3: Performance Impact
**Risk**: Currency formatting on every render causes lag  
**Mitigation**:
- Memoize formatted values
- Only reformat when currency or value changes
- Profile performance before/after

### Risk 4: Existing Save Compatibility
**Risk**: New state fields break existing saves  
**Mitigation**:
- All new fields have default values
- Test with existing save files
- Migration script if needed

---

## 🔗 Dependencies

### Sprint 26 Dependencies (All Complete ✅)
- Economy foundation
- Race scheduling
- Entry costs and prizes
- Transaction logging

### Sprint 26.5 Dependencies (All Complete ✅)
- Multiple work types implementation
- Sponsor approval flow implementation
- Multi-currency display implementation

### External Dependencies
- None - all features self-contained

---

## 📦 Deliverables

### Code Deliverables
- [ ] Work selector integrated into timeline UI
- [ ] Sponsor offer system wired to game events
- [ ] Currency preference in settings store
- [ ] Currency formatting applied throughout UI
- [ ] Automated tests for new features
- [ ] Polish improvements and bugfixes

### Documentation Deliverables
- [ ] Economy guide for players
- [ ] Work types documentation
- [ ] Sponsor system documentation
- [ ] Updated README
- [ ] Integration documentation for developers

### Testing Deliverables
- [ ] Unit tests for work types
- [ ] Unit tests for sponsorship engine
- [ ] Unit tests for currency converter
- [ ] Integration tests for all flows
- [ ] Manual testing checklist

---

## 🎯 Definition of Done

For Sprint 27 to be considered complete:

1. ✅ All UI components wired into game flow
2. ✅ Settings persistence working
3. ✅ Currency formatting applied everywhere
4. ✅ Automated tests passing
5. ✅ All polish items implemented
6. ✅ Documentation complete
7. ✅ No critical bugs
8. ✅ Build passes
9. ✅ All existing features still work
10. ✅ Ready for production deployment

---

## 📝 Sprint Planning Notes

### What We Learned from Sprint 26.5
- Implementation went faster than expected (1 day vs 5-7 days)
- Modular design made features easy to implement
- UI components were straightforward
- Integration is where the complexity lies

### Sprint 27 Focus
- **Integration over new features**
- **Quality over quantity**
- **Testing over assumptions**
- **Documentation over memory**

### Team Considerations
- Sprint 27 is integration-heavy, may need more time
- Consider splitting into 27A (Integration) and 27B (Polish)
- Ensure QA time is allocated

---

## 🚀 Next Steps

### Before Sprint 27 Starts
1. Review this plan with team
2. Confirm priorities
3. Assign tasks to team members
4. Set up tracking (Jira/GitHub Projects)
5. Create feature branches

### Sprint 27 Kickoff
1. Start with Task 1 (Work Integration)
2. Daily standups to track integration progress
3. Mid-sprint review after Week 1
4. Final review and testing in Week 2

---

## 📋 Checklist for Sprint Planning Meeting

- [ ] Review Sprint 26 & 26.5 accomplishments
- [ ] Confirm Sprint 27 objectives
- [ ] Prioritize tasks (MoSCoW method)
- [ ] Estimate effort for each task
- [ ] Identify dependencies and blockers
- [ ] Assign owners to tasks
- [ ] Set sprint timeline
- [ ] Define success criteria
- [ ] Identify risks and mitigations
- [ ] Confirm resource availability

---

**Status**: 📋 **READY FOR REVIEW**  
**Next Action**: Present to team for approval  
**Planned Start**: After approval  
**Estimated Completion**: 2 weeks from start

---

## 📞 Questions for Team

1. Should we split Sprint 27 into two shorter sprints (27A: Integration, 27B: Polish)?
2. Do we need to prioritize any specific feature for early delivery?
3. Are there any upcoming events that might affect sprint timeline?
4. Do we have QA resources available for testing?
5. Should we include any additional features in this sprint?

---

*Created: 2026-07-17*  
*Author: AI Assistant*  
*Version: 1.0*
