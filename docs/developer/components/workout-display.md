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

## Usage Patterns

The WorkoutCard component is designed to display complete workouts with organized sections for warm-up, main workout, and cool-down exercises.

See the [Form Components](./form.md) documentation for more details on the integration with the workout request form flow. 