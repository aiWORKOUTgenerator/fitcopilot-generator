# Workout Generator Cards Architecture

This directory contains the modular card components for the workout generator form, designed to replace the monolithic `WorkoutGeneratorGrid` implementation.

## Directory Structure

```
cards/
├── shared/                     # Shared components and utilities
│   ├── FormFieldCard/         # Base card wrapper component
│   ├── CardHeader/            # Reusable profile header component
│   ├── GridSelector/          # Reusable grid selection component
│   └── types.ts              # Shared TypeScript types
├── WorkoutFocusCard/         # ✅ Implemented - Focus selection
├── EquipmentCard/            # ✅ Implemented - Equipment selection
├── IntensityCard/            # 🚧 Placeholder - Intensity level
├── DurationCard/             # 🚧 Placeholder - Time duration
├── RestrictionsCard/         # 🚧 Placeholder - Health restrictions
├── LocationCard/             # 🚧 Placeholder - Workout location
├── MuscleGroupCard/          # ✅ Existing - Target muscles
└── index.ts                  # Barrel exports
```

## Architecture Principles

### 1. **Component Composition**
Each card follows a consistent structure:
- **FormFieldCard**: Base wrapper with animation and styling
- **CardHeader**: Profile data display with fallback states
- **GridSelector**: Reusable selection interface
- **Custom Hook**: Isolated state management

### 2. **Shared Components**

#### FormFieldCard
Base wrapper component providing:
- Consistent styling and animations
- Support for standard and complex variants
- Profile section integration
- Responsive design

#### CardHeader
Reusable header component for profile data:
- Badge display with overflow handling
- Loading and error states
- Fallback content for missing data

#### GridSelector
Generic grid selection component:
- Multi-select and single-select modes
- Configurable grid columns
- Consistent styling and interactions
- TypeScript generics for type safety

### 3. **Implementation Pattern**

Each card component follows this pattern:

```typescript
// Component
export const ExampleCard: React.FC<ExampleCardProps> = ({ delay, className }) => {
  const { options, selected, profile, isLoading, handleChange } = useExampleSelection();

  return (
    <FormFieldCard
      title="Example"
      description="Example description"
      delay={delay}
      variant="complex"
      profileSection={<CardHeader {...profileProps} />}
    >
      <GridSelector
        options={options}
        selectedValues={selected}
        onSelectionChange={handleChange}
        {...gridProps}
      />
    </FormFieldCard>
  );
};

// Hook
export const useExampleSelection = () => {
  const { formValues, setFormValue } = useWorkoutForm();
  const { profile } = useProfile();
  
  // State management logic
  // Profile data mapping
  // Event handlers
  
  return { options, selected, profile, isLoading, handleChange };
};
```

## Implementation Status

### ✅ **Completed Components**

1. **WorkoutFocusCard**
   - Focus area selection (6 options in 3x2 grid)
   - Profile goals integration
   - Single selection mode

2. **EquipmentCard**
   - Equipment selection (12 options in 4x3 grid)
   - Profile equipment integration
   - Multi-selection mode
   - Responsive grid (4→3→2 columns)

3. **Shared Infrastructure**
   - FormFieldCard base component
   - CardHeader with profile integration
   - GridSelector with TypeScript generics
   - Comprehensive SCSS styling

### 🚧 **Placeholder Components**

The following components have basic structure but need full implementation:

1. **IntensityCard** - Workout intensity level (1-6 scale)
2. **DurationCard** - Time duration selection (10-60 minutes)
3. **RestrictionsCard** - Health restrictions/soreness
4. **LocationCard** - Workout location (Home/Gym/Outdoors/Travel)
5. **StressLevelCard** - Current stress level
6. **EnergyLevelCard** - Energy/motivation level
7. **SleepQualityCard** - Sleep quality rating
8. **CustomizationCard** - Text input for custom requests

## Migration Strategy

### Phase 1: Infrastructure ✅
- [x] Create shared components
- [x] Implement FormFieldCard
- [x] Implement CardHeader
- [x] Implement GridSelector
- [x] Create type definitions

### Phase 2: Core Cards ✅
- [x] Implement WorkoutFocusCard
- [x] Implement EquipmentCard
- [x] Update MuscleGroupCard to use new architecture

### Phase 3: Remaining Cards 🚧
- [ ] Implement IntensityCard
- [ ] Implement DurationCard
- [ ] Implement RestrictionsCard
- [ ] Implement LocationCard
- [ ] Implement wellness cards (Stress, Energy, Sleep)
- [ ] Implement CustomizationCard

### Phase 4: Integration 🚧
- [ ] Update WorkoutGeneratorGrid to use modular cards
- [ ] Remove legacy card implementations
- [ ] Update SCSS imports
- [ ] Performance optimization (lazy loading)

## Benefits

1. **Maintainability**: Each card is self-contained and focused
2. **Reusability**: Shared components reduce code duplication
3. **Testability**: Individual cards can be unit tested in isolation
4. **Performance**: Cards can be lazy-loaded individually
5. **Scalability**: New cards can be added without modifying existing ones
6. **TypeScript**: Better type safety with focused interfaces
7. **Consistency**: Shared patterns ensure UI/UX consistency

## Usage Example

```typescript
import { WorkoutFocusCard, EquipmentCard } from './cards';

export const WorkoutGeneratorGrid = () => {
  return (
    <div className="workout-generator-grid">
      <WorkoutFocusCard delay={0} />
      <EquipmentCard delay={100} />
      {/* Additional cards... */}
    </div>
  );
};
```

## Next Steps

1. **Complete remaining card implementations** following the established pattern
2. **Update WorkoutGeneratorGrid** to use the new modular cards
3. **Add lazy loading** for performance optimization
4. **Implement comprehensive testing** for each card component
5. **Add Storybook stories** for component documentation 