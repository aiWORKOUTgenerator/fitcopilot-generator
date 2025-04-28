# Token Refactoring Priorities

This document identifies and prioritizes components for color token refactoring based on usage frequency, UI visibility, and impact on the overall design system.

## Component Usage Analysis

The following components have been analyzed based on their usage throughout the application, with priority determined by:
1. **Frequency**: How often the component is reused across the application
2. **Visibility**: How prominently the component appears in the UI
3. **Impact**: How significant the component is for user experience
4. **Complexity**: Level of color complexity in the component
5. **Issues**: Number of hardcoded color values identified

## Priority Tiers

### Tier 1: Critical Components (High Priority)

These components form the foundation of the UI and should be addressed first:

| Component | File Path | Issues | Impact | Complexity |
|-----------|-----------|--------|--------|------------|
| Button | `/src/common/components/UI/Button/Button.tsx` | 8 | High | Medium |
| Card | `/src/common/components/UI/Card/Card.tsx` | 15 | High | Medium |
| ProgressBar | `/src/common/components/UI/ProgressBar/ProgressBar.scss` | 6 | Medium | Medium |
| WorkoutRequestForm | `/src/features/workout-generator/components/Form/form.scss` | 37 | High | High |

**Implementation Notes:**
- The Button component is used throughout the application and defines primary, secondary, and tertiary styles
- Card components establish surface and border token usage patterns
- ProgressBar has both light and dark theme styles
- These components represent the fundamental UI layer that all other interfaces are built upon

### Tier 2: Form Components (Medium-High Priority)

These components handle user input and are heavily used in the Workout Generator feature:

| Component | File Path | Issues | Impact | Complexity |
|-----------|-----------|--------|--------|------------|
| InputStep | `/src/features/workout-generator/components/Form/steps/InputStep.scss` | 43 | High | High |
| Checkbox | `/src/common/components/UI/Checkbox/Checkbox.tsx` | 5 | Medium | Low |
| Select | `/src/common/components/UI/Select/Select.tsx` | 7 | Medium | Medium |
| Textarea | `/src/common/components/UI/Textarea/Textarea.tsx` | 4 | Medium | Low |

**Implementation Notes:**
- InputStep has the highest number of color issues and is a central component for user interaction
- Form input components establish input field styling patterns
- These components define the interaction patterns for the application

### Tier 3: Shared Style Files (Medium Priority)

These shared style files define global patterns used across multiple components:

| Component | File Path | Issues | Impact | Complexity |
|-----------|-----------|--------|--------|------------|
| Component Tokens | `/src/features/workout-generator/styles/components/_component-tokens.scss` | 0 | High | High |
| Buttons | `/src/features/workout-generator/styles/components/_buttons.scss` | 10 | High | Medium |
| Cards | `/src/features/workout-generator/styles/components/_cards.scss` | 14 | High | Medium |
| Forms | `/src/features/workout-generator/styles/components/_form.scss` | 21 | High | High |
| Steps | `/src/features/workout-generator/styles/components/_steps.scss` | 12 | Medium | Medium |

**Implementation Notes:**
- Component tokens should be validated for completeness
- These files establish styling patterns used by multiple components
- Refactoring these files will have a cascading positive impact

### Tier 4: Animation and Visual Effects (Medium-Low Priority)

These files control animations and visual styles:

| Component | File Path | Issues | Impact | Complexity |
|-----------|-----------|--------|--------|------------|
| Animations | `/src/styles/design-system/_animations.scss` | 25 | Medium | High |
| Gradients | `/src/styles/design-system/_gradients.scss` | 23 | Medium | Medium |
| Shadows | `/src/styles/design-system/_shadows.scss` | 15 | Medium | Medium |

**Implementation Notes:**
- Animations use numerous RGBA values for subtle effects
- Gradients define color transitions that often use hardcoded values
- Shadow effects use hardcoded RGBA values that should be tokenized

### Tier 5: Feature UI Components (Low Priority)

Feature-specific components that have more isolated usage:

| Component | File Path | Issues | Impact | Complexity |
|-----------|-----------|--------|--------|------------|
| API Tracker | `/src/features/api-tracker/styles/api-tracker.css` | 74 | Low | High |
| Token Usage | `/src/features/token-usage/styles/token-usage.css` | 61 | Low | High |
| GeneratingStep | `/src/features/workout-generator/components/Form/steps/styles/generating-step.scss` | 5 | Medium | Low |
| LoadingIndicator | `/src/features/workout-generator/components/GenerationProcess/LoadingIndicator.scss` | 0 | Low | Low |

**Implementation Notes:**
- These are more isolated components with specific usage contexts
- API Tracker and Token Usage are administrative interfaces with many hardcoded values
- Feature UI components should be addressed after core UI is standardized

## Implementation Metrics

To track progress during the refactoring process, we'll use the following metrics:

1. **Token Coverage**: Percentage of color properties using design tokens vs. hardcoded values
2. **Component Completion**: Number of components fully refactored 
3. **Issue Reduction**: Reduction in total hardcoded values identified by token-validator.js

**Baseline Metrics:**
- Total issues: 376
- Files with issues: 20
- Hex color issues: 316
- RGBA color issues: 60

## Next Steps

1. Begin with Tier 1 components, creating a small PR for each component
2. Validate each refactored component in both light and dark modes
3. Update the token validation report after each tier is completed
4. Document any patterns or inconsistencies discovered during refactoring

The implementation process should follow the patterns defined in [token-mapping.md](./token-mapping.md) and maintain strict adherence to the design system architecture. 