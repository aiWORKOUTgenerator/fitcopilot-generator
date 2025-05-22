# Workout Editor Navigation Strategy

## Overview

This document outlines the navigation architecture for the workout editor, defining how users move between the workout generator, editor, and future workout library. The strategy prioritizes a seamless user experience while laying groundwork for future expansion.

## Core Principles

1. **Modal-first approach** - Use modal dialogs for quick edits from the generator
2. **Progressive enhancement** - Support deep linking and direct URL access
3. **State persistence** - Maintain editor state across navigation transitions
4. **Unified patterns** - Consistent interaction patterns between modal and full-page views

## URL Structure

| URL Pattern | Description | Implementation Phase |
|-------------|-------------|----------------------|
| `/workout-generator` | Main workout generator page | Current |
| `/workout-generator#workout=:id` | Generator with editor modal open | Current (Enhanced) |
| `/workouts` | Workout library main page | Future |
| `/workouts/:id` | View single workout details | Future |
| `/workouts/:id/edit` | Full-page editor for a workout | Future |

## Navigation Flows

### Current Flow
1. User generates workout on `/workout-generator`
2. User clicks "View Full Workout" button
3. Editor opens as modal with URL hash update: `#workout=:id`
4. User edits and saves, modal closes
5. URL returns to `/workout-generator`

### Future Flow
1. User navigates to `/workouts` to view library
2. User selects workout to view or edit
3. System decides between modal or full-page based on context:
   - Modal: When quick editing is preferred or on mobile
   - Full-page: When accessed directly or for longer editing sessions
4. After saving, user returns to previous context

## Decision Logic for Modal vs. Full-Page

The system will use these criteria to determine when to use a modal vs. a full-page transition:

```javascript
function shouldUseModal(context) {
  return (
    // Coming from workout generator - use modal
    context.referrer === 'generator' ||
    
    // Hash parameter is present - use modal
    context.hasHashParameter ||
    
    // On mobile when in compact view - use modal
    (context.isMobileView && context.isCompactView) ||
    
    // User preference is set to modal
    context.userPreference === 'modal'
  );
}
```

## State Management Strategy

To ensure a consistent user experience across modal and full-page views, we'll maintain workout state in a central location:

```javascript
// State shape
{
  editor: {
    currentWorkout: {...},    // Currently edited workout
    originalWorkout: {...},   // Workout before edits (for cancellation)
    isDirty: false,           // Whether unsaved changes exist
    isSaving: false,          // Whether save operation is in progress
    ui: {
      isModalOpen: false,     // Whether modal is currently displayed
      activeTab: 'exercises'  // Active tab in editor
    }
  },
  workouts: {
    items: {...},             // All saved workouts (for library)
    isLoading: false,         // Whether workouts are being loaded
    activeWorkout: null       // Selected workout in library view
  }
}
```

## URL Parameter Handling

For consistent deep linking, we'll use these URL parameter strategies:

### Hash Parameters (Current)
Used for modal state in current implementation:
```
/workout-generator#workout=123
```

### Route Parameters (Future)
Used for full-page navigation in future library:
```
/workouts/123/edit
```

## History State Management

To support browser back/forward navigation with modals:

1. When opening modal, push state with modal flag:
   ```javascript
   history.pushState({modal: true, workoutId: 123}, '', '#workout=123')
   ```

2. Listen for `popstate` events to handle modal closing:
   ```javascript
   window.addEventListener('popstate', (event) => {
     if (event.state?.modal) {
       openModalWithWorkout(event.state.workoutId)
     } else {
       closeModal()
     }
   })
   ```

## Transition Strategy to Library

For a smooth transition to the future library functionality:

1. **Phase 1 (Current)**: Modal-only with hash parameters
2. **Phase 2**: Add routes without changing behavior
3. **Phase 3**: Implement library with dual modal/page support 
4. **Phase 4**: Advanced routing with persistence and history

## User Experience Considerations

### Deep Linking
Users should be able to:
- Share a link directly to edit a specific workout
- Bookmark a workout for later editing
- Return to the same editing state after refresh

### Navigation Consistency
- Back button should close modal instead of navigating away
- Forward button should reopen modal if it was previously open
- ESC key should close modal and update URL appropriately

### Performance Considerations
- Lazy load editor components for faster initial page load
- Pre-fetch workout data when hovering over "View Full Workout" button
- Maintain editor state in memory when closing to allow fast reopening

## Implementation Plan

1. Enhance current modal with URL hash support
2. Add history management for back/forward navigation
3. Create route definitions for future pages
4. Implement shared state management
5. Add logic for modal vs. full-page decisions 