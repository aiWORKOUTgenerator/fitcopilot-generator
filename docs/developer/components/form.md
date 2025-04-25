# Form Components

This document describes the form components used in the FitCopilot Generator plugin.

## Component Overview

Form components handle user input collection and validation, providing interfaces for workout parameter selection and other user interactions.

## Components

### WorkoutRequestForm

The `WorkoutRequestForm` component provides the main interface for users to request AI-generated workout plans. It serves as the primary entry point for the workout generation feature, handling the entire workflow from collecting user preferences to displaying the generated workout.

#### Features

- Multi-step form flow (input → preview → generating → completed)
- Form fields for selecting workout preferences (goal, difficulty, duration)
- Advanced options for equipment and physical restrictions
- Real-time validation of form inputs
- Loading state management with rotating status messages
- Error and success state handling
- Analytics tracking for user interactions
- Form state persistence between sessions

#### Form Steps

1. **Input Step**: 
   - Collects all workout parameters
   - Includes validation before proceeding

2. **Preview Step**:
   - Shows a visual summary of the selected parameters via the `WorkoutPreview` component
   - Allows users to either edit their selection or proceed with generation

3. **Generating Step**:
   - Displays animated loading state with rotating status messages
   - Provides real-time feedback during API calls

4. **Completed Step**:
   - Shows the generated workout via the `WorkoutCard` component
   - Provides option to generate a new workout

#### Hooks Integration

The component integrates several hooks for state management and API interactions:

- `useWorkoutForm`: Manages form values, validation, and persistence
- `useWorkoutGenerator`: Handles the OpenAI API interaction for generating workouts
- `useAnalytics`: Tracks user interactions for analytics

#### Usage

```tsx
import { WorkoutRequestForm } from '../Form';

const WorkoutGeneratorFeature = () => {
  return (
    <div className="workout-generator">
      <h1>AI Workout Generator</h1>
      <WorkoutRequestForm />
    </div>
  );
};
```

#### Analytics Events

The component tracks several analytics events:

- `view_form`: When the form is first viewed
- `view_preview`: When the preview step is displayed
- `form_submit`: When the form is submitted for generation
- `form_error`: When validation or generation errors occur
- `workout_generated`: When a workout is successfully generated

### AdvancedOptionsPanel

The `AdvancedOptionsPanel` is a collapsible panel that provides additional workout customization options including equipment selection and physical restrictions or preferences.

#### Props

- `equipmentOptions`: Array of available equipment options
- `selectedEquipment`: Array of selected equipment IDs
- `onEquipmentChange`: Callback for equipment selection changes
- `restrictions`: Current restrictions text
- `onRestrictionsChange`: Callback for restrictions text changes

#### Usage

```tsx
import { AdvancedOptionsPanel } from '../Form';

<AdvancedOptionsPanel 
  equipmentOptions={equipmentOptions}
  selectedEquipment={selectedEquipment}
  onEquipmentChange={handleEquipmentChange}
  restrictions={restrictions}
  onRestrictionsChange={handleRestrictionsChange}
/>
```

### FormFeedback

The `FormFeedback` component displays success, error, or informational messages related to form submission and processing.

#### Props

- `type`: The type of message ('success', 'error', 'info')
- `message`: The message text to display

#### Usage

```tsx
import { FormFeedback } from '../Form';

<FormFeedback 
  type="error" 
  message="Please fill out all required fields."
/>
```

## Form Workflow

The form implements a multi-step workflow to provide a better user experience:

1. User fills out the workout request form (goals, difficulty, duration, etc.)
2. Form validation occurs upon attempting to proceed to the next step
3. If valid, a preview of the workout parameters is shown for confirmation
4. User can edit parameters or proceed with generation
5. During generation, loading indicators with rotating messages provide feedback
6. Upon completion, the generated workout is displayed with option to start over

This workflow enhances the user experience by:

- Providing clear visual confirmation before committing to generation
- Reducing errors by validating before sending to the AI
- Showing real-time feedback during the generation process
- Offering a seamless path to creating additional workouts 