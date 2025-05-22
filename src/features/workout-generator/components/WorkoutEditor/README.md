# Workout Editor Components

This directory contains components for the workout editor functionality.

## Components

### WorkoutEditor

The main editor component that allows users to edit workout details including:
- Title, difficulty, and duration
- Exercise list with sets, reps, and rest periods
- Notes and additional metadata

```jsx
import { WorkoutEditor } from '../WorkoutEditor';

<WorkoutEditor
  onSave={handleSave}
  onCancel={handleCancel}
  isNewWorkout={true}
/>
```

### WorkoutEditorModal

A modal wrapper for the WorkoutEditor that handles the modal functionality:
- Modal backdrop with click-away to close
- Escape key handling
- Scroll locking while the modal is open

```jsx
import { WorkoutEditorModal } from '../WorkoutEditor';

<WorkoutEditorModal
  workout={workout}
  postId={postId}
  onClose={handleCloseModal}
  onSave={handleSaveWorkout}
/>
```

### ExerciseList

A component for managing the list of exercises in a workout:
- Add, remove, and update exercises
- Reorder exercises (UI only, drag-and-drop to be implemented)
- Edit sets, reps, and rest periods for each exercise

This component is used internally by WorkoutEditor.

### WorkoutEditorContext

Context provider for state management within the workout editor:
- Tracks editor state (workout data, dirty state, validation)
- Provides actions for modifying the workout

```jsx
import { WorkoutEditorProvider, useWorkoutEditor } from '../WorkoutEditor';

// Provider usage
<WorkoutEditorProvider initialWorkout={workoutData}>
  <MyComponent />
</WorkoutEditorProvider>

// Hook usage in child components
const MyComponent = () => {
  const { state, dispatch } = useWorkoutEditor();
  // Use state and dispatch...
};
```

## Usage

The primary entry point is the `WorkoutEditorModal` component, which should be used in situations where a workout needs to be edited:

```jsx
// Inside your component
const [isEditorOpen, setIsEditorOpen] = useState(false);

const handleSave = (updatedWorkout) => {
  // Handle saving the workout
  console.log('Saving workout:', updatedWorkout);
  setIsEditorOpen(false);
};

// In your render function
return (
  <>
    <Button onClick={() => setIsEditorOpen(true)}>
      Edit Workout
    </Button>
    
    {isEditorOpen && (
      <WorkoutEditorModal
        workout={workout}
        postId={workout.id}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
      />
    )}
  </>
);
```

## API Integration

The editor components are designed to work with the workout API endpoints:

- `GET /wp-json/fitcopilot/v1/workouts/{id}` - Fetch workout details
- `PUT /wp-json/fitcopilot/v1/workouts/{id}` - Update existing workout
- `POST /wp-json/fitcopilot/v1/workouts` - Create new workout

The `workoutEditorService.ts` file contains functions for interacting with these endpoints. 