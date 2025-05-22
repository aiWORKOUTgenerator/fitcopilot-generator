# Workout Editor User Flow Diagrams

This document visually represents the user flows for the workout editor, including both current implementation and future library integration.

## Current Flow: Generator → Editor Modal

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Form Step 1    │ ──► │  Form Step 2    │ ──► │  Result Step    │
│  (Goals)        │     │  (Details)      │     │  (Generated     │
│                 │     │                 │     │   Workout)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          │ "View Full Workout"
                                                          │  (URL: #workout=id)
                                                          ▼
                                       ┌─────────────────────────────────────┐
                                       │                                     │
                                       │        Workout Editor Modal         │
                                       │        (Edit Generated Workout)     │
                                       │                                     │
                                       └─────────────┬───────────────────────┘
                                                     │
                             ┌─────────────────────┬─┴────────────────────┐
                             │                     │                      │
                             ▼                     ▼                      ▼
                  ┌─────────────────┐  ┌─────────────────┐   ┌─────────────────┐
                  │                 │  │                 │   │                 │
                  │  Save Workout   │  │  Cancel Edit    │   │  Print Workout  │
                  │  (Returns to    │  │  (Returns to    │   │  (Keeps modal   │
                  │   Result Step)  │  │   Result Step)  │   │   open)         │
                  │                 │  │                 │   │                 │
                  └─────────────────┘  └─────────────────┘   └─────────────────┘
```

## Future Flow: Library → Editor

```
┌─────────────────┐                                  ┌─────────────────┐
│                 │                                  │                 │
│  Workout        │                                  │  Generator      │
│  Library        │◄─────── New Workout ────────────┤  Result Step    │
│  (/workouts)    │                                  │                 │
└────────┬────────┘                                  └─────────────────┘
         │
         │ Select Workout
         │
         ▼
┌─────────────────┐
│                 │
│  Single Workout │
│  View           │
│  (/workouts/:id)│
│                 │
└────────┬────────┘
         │
         │ "Edit Workout"
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   shouldUseModal() decision                                  │
│                                                              │
└──────┬──────────────────────────────────────┬───────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────────┐                   ┌─────────────────┐
│                 │                   │                 │
│  Modal Editor   │                   │  Full Page      │
│  (Hash URL:     │                   │  Editor         │
│   #workout=id)  │                   │  (/workouts/:id/│
│                 │                   │   edit)         │
└────────┬────────┘                   └────────┬────────┘
         │                                     │
         └───────────────┬─────────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │                 │
                │  Save Workout   │
                │  (Return to     │
                │   Library)      │
                │                 │
                └─────────────────┘
```

## Navigation State Transitions

The following table outlines the URL and state changes during navigation:

| User Action | URL Before | URL After | State Change |
|-------------|------------|-----------|--------------|
| Generate workout | `/workout-generator` | `/workout-generator` | `workout` populated with generated data |
| View Full Workout | `/workout-generator` | `/workout-generator#workout=123` | `isEditorOpen: true` |
| Save Workout | `/workout-generator#workout=123` | `/workout-generator` | `isEditorOpen: false`, `savedWorkouts` updated |
| Cancel Edit | `/workout-generator#workout=123` | `/workout-generator` | `isEditorOpen: false`, no state change |
| Open Library | `/workout-generator` | `/workouts` | Load `savedWorkouts` |
| Select Workout | `/workouts` | `/workouts/123` | `activeWorkout: '123'` |
| Edit (Modal) | `/workouts/123` | `/workouts/123#edit` | `isEditorOpen: true` |
| Edit (Full Page) | `/workouts/123` | `/workouts/123/edit` | Route change, editor component mounted |

## Modal vs. Full Page Decision Flow

```
┌─────────────────┐
│                 │
│  Edit Request   │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Context from   │     │                 │
│  Generator?     │ Yes │  Use Modal      │
│                 │────►│                 │
└────────┬────────┘     └─────────────────┘
         │ No
         ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Hash Parameter │ Yes │  Use Modal      │
│  Present?       │────►│                 │
│                 │     │                 │
└────────┬────────┘     └─────────────────┘
         │ No
         ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Mobile View?   │ Yes │  Use Modal      │
│                 │────►│                 │
└────────┬────────┘     └─────────────────┘
         │ No
         ▼
┌─────────────────┐
│                 │
│  Use Full Page  │
│                 │
└─────────────────┘
```

## Entry/Exit Points

### Entry Points
- Generator "View Full Workout" button
- Library "Edit" button
- Direct URL access (`/workouts/:id/edit`)
- Deep link via hash (`#workout=123`)

### Exit Points
- Save button (return to previous context)
- Cancel button (return to previous context)
- Modal close (X) button
- Browser back button
- ESC key (modal only)

## Interaction Patterns

### Modal Interactions
- Modal appears with animation from center
- Background overlay prevents interaction with content behind
- ESC key closes modal
- Clicking outside modal closes it
- Browser back button closes modal

### Full Page Interactions
- Standard page transitions
- Browser back returns to library
- Form submission prevents navigation if unsaved changes
- Save action redirects to workout view 