# Workout Display Components

This document describes the components used for displaying workout information in the FitCopilot Generator plugin.

## Component Overview

The Workout Display components are responsible for visualizing workout data to users in various formats, from detailed workout plans to summary previews.

## Components

### WorkoutCard

The `WorkoutCard` component displays a complete workout with all details, exercises, and metadata.

#### Props

- `postId` (number): WordPress post ID of the workout
- `workout` (WorkoutData, optional): Workout data object if already loaded

#### Usage

```tsx
import { WorkoutCard } from '../WorkoutDisplay';

// Using post ID (will fetch workout data)
<WorkoutCard postId={123} />

// Using pre-loaded workout data
<WorkoutCard postId={123} workout={workoutData} />
```

### WorkoutPreview

The `WorkoutPreview` component provides a visual summary of workout parameters before generation. It helps users understand exactly what they're requesting before committing to the full AI generation process.

#### Props

- `goal` (string): The selected workout goal
- `difficulty` (WorkoutDifficulty): User's experience level
- `duration` (number): Workout duration in minutes
- `equipment` (string[], optional): Selected equipment IDs
- `restrictions` (string, optional): Physical restrictions or preferences

#### Features

- Visual representation of selected workout parameters
- Summary of key workout attributes (goal, difficulty, duration)
- Equipment list display
- Restrictions/limitations display

#### Usage

```tsx
import { WorkoutPreview } from '../WorkoutDisplay';

<WorkoutPreview 
  goal="build-muscle"
  difficulty="intermediate"
  duration={45}
  equipment={['dumbbells', 'bench']}
  restrictions="Shoulder injury, prefer no overhead movements"
/>
```

#### Visual Elements

The component includes:

1. **Parameter Cards**:
   - Goal (blue background)
   - Experience Level (green background)
   - Duration (purple background)

2. **Equipment Tags**: 
   - Displayed as rounded pills
   - Only shown when equipment is selected
   
3. **Restrictions Box**:
   - Shows user-entered physical limitations
   - Only displayed when provided

4. **Animation**:
   - Subtle fade-in and slide-up animation
   - Provides visual feedback when the preview appears

## Usage Patterns

### Multi-step Form Integration

The WorkoutPreview component is designed to be used in a multi-step form process, particularly between the initial input stage and the final generation stage. It provides users with a confirmation step before committing to the potentially time-consuming AI generation process.

See the [Form Components](./form.md) documentation for more details on the integration with the workout request form flow. 