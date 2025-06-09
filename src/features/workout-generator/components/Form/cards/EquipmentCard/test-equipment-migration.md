# EquipmentCard Migration Test Checklist

## Pre-Migration State ✅
- [ ] Original equipment card displays properly in WorkoutGeneratorGrid
- [ ] Profile equipment badges display correctly
- [ ] Equipment selection toggles work as expected
- [ ] Form state syncs with `useWorkoutForm` hook
- [ ] Console logging shows proper state updates

## Post-Migration Tests 🧪

### Visual/UI Tests
- [ ] Card title and description match original ("Equipment", "What do you have available?")
- [ ] Delay animation (400ms) works correctly
- [ ] Profile header section displays equipment badges when profile available
- [ ] Fallback header displays when no profile data
- [ ] Equipment grid displays all 12 options in proper layout
- [ ] Selected equipment items show visual selection state
- [ ] Responsive design works on mobile/tablet

### Functional Tests
- [ ] Equipment selection/deselection works correctly
- [ ] Multiple equipment selection allowed
- [ ] Profile equipment can be clicked to toggle selection
- [ ] Form state updates properly with `useWorkoutForm`
- [ ] Console debugging shows state changes
- [ ] Integration with broader workout form works

### Integration Tests
- [ ] Profile loading states handled properly
- [ ] Profile error states display fallback correctly
- [ ] Equipment data from profile maps correctly
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful

## Migration Validation Commands

```bash
# Test compilation
npm run build

# Run component tests (if available)
npm test -- EquipmentCard

# Check for TypeScript errors
npx tsc --noEmit

# Verify bundle size didn't increase dramatically
npm run analyze
```

## Rollback Plan
If issues are found:
1. Set `USE_MODULAR_CARDS.equipment = false` in WorkoutGeneratorGrid.tsx
2. Test that original implementation works
3. Fix issues in modular EquipmentCard
4. Re-enable modular version

## Next Migration Targets
After EquipmentCard validation:
1. 🎯 **WorkoutFocusCard** (already implemented)
2. 🎯 **DurationCard** (simple single-select)
3. 🎯 **IntensityCard** (simple 1-6 scale)

## Notes
- Keep legacy implementation until all cards migrated
- Ensure styling consistency between old and new
- Test form integration thoroughly
- Verify profile integration works identically 