# Workout Editor Component Inventory

This document catalogs all UI components needed for the workout editor implementation, specifying whether each component can be reused from the existing UI library or needs to be created as a new component.

## Core Components

| Component | Type | Source | Description |
|-----------|------|--------|-------------|
| WorkoutEditorModal | Container | New | Modal container with backdrop for the editor |
| WorkoutEditor | Container | New | Main editor component with layout structure |
| ExerciseList | Complex | New | Container for exercise items with add/remove functionality |
| ExerciseItem | Complex | New | Individual exercise item with editing controls |

## Form Controls

| Component | Type | Source | Description |
|-----------|------|--------|-------------|
| Input | Basic | Existing | Text input for exercise names, etc. |
| Select | Basic | Existing | Dropdown for difficulty selection |
| Textarea | Basic | Existing | Multiline input for notes |
| NumberInput | Basic | Existing | Input for numeric values (sets, duration) |
| Button | Basic | Existing | Action buttons for save, cancel, etc. |
| IconButton | Basic | Existing | Button with icon for exercise removal |

## Interactive Elements

| Component | Type | Source | Description |
|-----------|------|--------|-------------|
| DragHandle | Visual | New | Handle for drag-and-drop reordering |
| LoadingIndicator | Visual | Existing | Spinner for loading/saving states |
| ValidationMessage | Visual | Existing | Error message display for form validation |
| Tooltip | Visual | Existing | Hover tooltips for buttons and controls |

## Layout Components

| Component | Type | Source | Description |
|-----------|------|--------|-------------|
| ModalHeader | Structural | New | Header section of the modal with title and close button |
| ModalContent | Structural | New | Scrollable content area of the modal |
| ModalFooter | Structural | New | Footer section with action buttons |
| FormSection | Structural | New | Section container for grouped form elements |
| FormRow | Structural | New | Horizontal layout for form controls |
| FormColumn | Structural | New | Vertical layout for form controls |

## Component Dependencies and Relationships

```
WorkoutEditorModal
├── ModalHeader
│   ├── IconButton (close)
│   ├── Title
│   └── LoadingIndicator
├── ModalContent
│   ├── FormSection (metadata)
│   │   ├── Input (title)
│   │   └── FormRow
│   │       ├── FormColumn
│   │       │   └── Select (difficulty)
│   │       └── FormColumn
│   │           └── NumberInput (duration)
│   ├── FormSection (exercises)
│   │   ├── ExerciseList
│   │   │   ├── ExerciseItem
│   │   │   │   ├── DragHandle
│   │   │   │   ├── Input (name)
│   │   │   │   ├── IconButton (remove)
│   │   │   │   ├── NumberInput (sets)
│   │   │   │   ├── Input (reps)
│   │   │   │   ├── NumberInput (rest)
│   │   │   │   └── Input (notes)
│   │   │   └── Button (add exercise)
│   │   └── ValidationMessage
│   └── FormSection (notes)
│       └── Textarea
└── ModalFooter
    ├── Button (cancel)
    └── Button (save)
```

## Component Props Specifications

### WorkoutEditorModal Props
```typescript
interface WorkoutEditorModalProps {
  workout: GeneratedWorkout;
  postId?: number;
  onClose: () => void;
  onSave: (workout: GeneratedWorkout) => void;
}
```

### WorkoutEditor Props
```typescript
interface WorkoutEditorProps {
  workout: WorkoutEditorData;
  onSave: (workout: WorkoutEditorData) => void;
  onCancel: () => void;
  isNewWorkout?: boolean;
  isLoading?: boolean;
}
```

### ExerciseList Props
```typescript
interface ExerciseListProps {
  exercises: EditorExercise[];
  onAddExercise: () => void;
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (id: string, field: string, value: any) => void;
  onReorderExercises: (exerciseIds: string[]) => void;
  isDisabled?: boolean;
}
```

### ExerciseItem Props
```typescript
interface ExerciseItemProps {
  exercise: EditorExercise;
  index: number;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  isDisabled?: boolean;
}
```

## State Management Requirements

### Editor State
- Current workout data
- Original workout data (for comparison)
- Dirty state tracking
- Loading/saving states
- Validation errors by field

### Exercise State
- Array of exercises
- Drag state for reordering
- Validation state

## Implementation Priority

1. **Core Structure**
   - WorkoutEditorModal
   - WorkoutEditor
   - Basic form layout

2. **Exercise Management**
   - ExerciseList
   - ExerciseItem
   - Add/Remove functionality

3. **Advanced Interactions**
   - Drag and drop reordering
   - Validation
   - Loading states

4. **Responsive Behavior**
   - Mobile adaptations
   - Touch interactions 