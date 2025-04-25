# Form Flow Architecture

This document outlines the architecture and workflow for form processing in the FitCopilot Generator plugin, with a focus on the multi-step form pattern.

## Overview

The FitCopilot Generator implements a multi-step form pattern for workout generation to improve user experience and provide feedback throughout the process. This pattern breaks down complex forms into manageable steps, provides immediate validation, and gives users clear progress indicators.

## Multi-Step Form Flow

The primary workout generation form follows this flow:

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────────┐
│  Input Form  │───▶│  Form Preview │───▶│  AI Generation  │───▶│  Display Result  │
└─────────────┘     └──────────────┘     └────────────────┘     └─────────────────┘
       ▲                   │                                            │
       └───────────────────┘                                            │
             Edit                                                       │
             Request                                                    │
                                   ┌───────────────────────┐            │
                                   │  Generate New Workout  │◀───────────
                                   └───────────────────────┘
```

### Architectural Components

Each step in the form flow is managed by a combination of:

1. **React Component State**: Manages UI rendering for the current step
2. **Context API**: Maintains form values across steps
3. **Custom Hooks**: Encapsulate business logic and API interactions

## Implementation Details

### State Management

The form flow uses a `FormStep` type to track the current form state:

```typescript
type FormStep = 'input' | 'preview' | 'generating' | 'completed';
```

State transitions are triggered by:
- User actions (submitting, navigating back)
- API responses (success, error)
- Validation results

### Form Validation

- Form validation occurs before transitioning from the input step to the preview step
- Validation errors are displayed inline to guide users
- The preview step can only be accessed with valid form data

### Data Persistence

Form data is persisted across sessions using:
- `sessionStorage`: Maintains form values during the current session
- Context API: Shares form state between components

### Analytics Integration

Analytics events are tracked at key points in the form flow:
- Form view
- Preview step view
- Form submission
- Errors
- Successful generation

## Key Components

### Components

1. **WorkoutRequestForm**: 
   - Main container component that manages form steps
   - Renders different UI based on the current step

2. **WorkoutPreview**:
   - Displays a summary of form values before submission
   - Provides visual feedback on selected parameters

### Hooks

1. **useWorkoutForm**:
   - Manages form values and validation
   - Handles form persistence

2. **useWorkoutGenerator**:
   - Manages the API interaction for workout generation
   - Tracks generation status and results

## Benefits of Multi-Step Form Flow

1. **Improved User Experience**:
   - Breaks down complex inputs into manageable chunks
   - Provides clear visual feedback on progress
   - Allows users to review selections before committing

2. **Error Reduction**:
   - Validates inputs before processing
   - Provides clear error messages
   - Allows users to fix issues before submission

3. **Better Performance**:
   - Reduces unnecessary API calls
   - Only processes complete and valid data

## Extension Patterns

The multi-step form pattern can be extended for other features by:

1. Defining a clear step sequence
2. Creating appropriate UI components for each step
3. Implementing step transitions with validation
4. Maintaining state across steps
5. Providing clear feedback throughout the process 