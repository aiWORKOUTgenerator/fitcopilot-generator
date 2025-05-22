# Exercise Drag-and-Drop Implementation Guide

This document provides guidelines for implementing the drag-and-drop functionality for reordering exercises in the workout editor.

## User Experience Goals

- Intuitive drag-and-drop reordering of exercises
- Visual feedback during dragging
- Smooth animations for position changes
- Accessible alternatives for keyboard users
- Touch-friendly implementation for mobile devices

## Implementation Approach

We'll use the React DnD library for its accessibility and extensibility. This approach provides:

1. Natural drag-and-drop behavior
2. Keyboard accessibility
3. Touch support
4. Screen reader announcements
5. Flexible styling options

## Component Structure

```
ExerciseList
└── ExerciseItem (Draggable)
    └── DragHandle (Drag Initiator)
```

## Implementation Steps

### 1. Set Up React DnD Context

```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from '../../utils/device';

// Use the appropriate backend based on device type
const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

// Wrap the ExerciseList component with the DndProvider
<DndProvider backend={backend}>
  <ExerciseList
    exercises={exercises}
    onReorderExercises={handleReorderExercises}
  />
</DndProvider>
```

### 2. Create Draggable Exercise Item

```tsx
import { useDrag, useDrop } from 'react-dnd';

interface DragItem {
  id: string;
  index: number;
  type: string;
}

const ITEM_TYPE = 'exercise';

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  index,
  onMove,
  ...props
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Set up drag source
  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { id: exercise.id, index, type: ITEM_TYPE } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: DragItem, monitor) => {
      if (!itemRef.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = itemRef.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  // Connect the drag preview to the entire item
  preview(itemRef);
  
  // Connect the drop target to the item
  drop(itemRef);
  
  // Connect the drag source to the drag handle only
  const dragHandleRef = useCallback((node) => {
    drag(node);
  }, [drag]);
  
  // Apply styles based on drag state
  const itemStyle = {
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'default',
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isDragging ? 'var(--wg-shadow-md)' : 'none',
    transition: 'transform 0.1s, box-shadow 0.1s, opacity 0.1s',
  };
  
  return (
    <div
      ref={itemRef}
      className={`workout-editor__exercise-item ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-over' : ''}`}
      style={itemStyle}
      aria-label={`Exercise ${index + 1}: ${exercise.name}`}
    >
      <div className="workout-editor__exercise-header">
        <div 
          ref={dragHandleRef}
          className="workout-editor__exercise-drag-handle"
          aria-hidden="true"
          title="Drag to reorder"
        >
          <GripVertical size={20} />
        </div>
        
        {/* Rest of the exercise item content */}
      </div>
    </div>
  );
};
```

### 3. Handle Reordering in the Parent Component

```tsx
const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onReorderExercises,
  ...props
}) => {
  // Function to move an item in the array
  const moveExercise = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newExercises = [...exercises];
      const draggedItem = newExercises[dragIndex];
      
      // Remove the dragged item
      newExercises.splice(dragIndex, 1);
      
      // Insert it at the new position
      newExercises.splice(hoverIndex, 0, draggedItem);
      
      // Pass the new array order to the parent via callback
      onReorderExercises(newExercises.map(ex => ex.id));
    },
    [exercises, onReorderExercises]
  );
  
  return (
    <div className="workout-editor__exercise-list">
      {exercises.map((exercise, index) => (
        <ExerciseItem
          key={exercise.id}
          exercise={exercise}
          index={index}
          onMove={moveExercise}
          {...props}
        />
      ))}
      
      {/* Add exercise button */}
    </div>
  );
};
```

## Keyboard Accessibility

To ensure keyboard accessibility, we'll add alternative controls for reordering:

```tsx
const ExerciseItem: React.FC<ExerciseItemProps> = ({
  // ...existing props
}) => {
  // ...existing code
  
  // Keyboard handlers for accessibility
  const handleMoveUp = () => {
    if (index > 0) {
      onMove(index, index - 1);
    }
  };
  
  const handleMoveDown = () => {
    onMove(index, index + 1);
  };
  
  return (
    <div ref={itemRef} /* ...existing props */>
      <div className="workout-editor__exercise-header">
        {/* Drag handle */}
        
        {/* For keyboard users, add accessible buttons */}
        <div className="workout-editor__exercise-keyboard-controls">
          <button
            type="button"
            className="workout-editor__move-button"
            onClick={handleMoveUp}
            disabled={index === 0}
            aria-label={`Move ${exercise.name} up`}
          >
            <ChevronUp size={16} />
          </button>
          
          <button
            type="button"
            className="workout-editor__move-button"
            onClick={handleMoveDown}
            disabled={index === exercises.length - 1}
            aria-label={`Move ${exercise.name} down`}
          >
            <ChevronDown size={16} />
          </button>
        </div>
        
        {/* Rest of the exercise item content */}
      </div>
    </div>
  );
};
```

## Mobile Touch Considerations

For better touch support:

1. Increase the size of the drag handle on touch devices
2. Add visual cues indicating draggability
3. Consider showing a "long press to drag" tooltip on first use
4. Ensure sufficient spacing between interactive elements

## Animation

To create smooth animations when items are reordered:

```css
.workout-editor__exercise-item {
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
}

.workout-editor__exercise-item.is-dragging {
  z-index: 10;
  box-shadow: var(--wg-shadow-md);
  opacity: 0.8;
  transform: scale(1.02);
}

.workout-editor__exercise-item.is-over {
  transform: translateY(4px);
}
```

## Screen Reader Announcements

To improve screen reader support, use ARIA live regions to announce changes:

```tsx
const ExerciseList: React.FC<ExerciseListProps> = ({
  // ...existing props
}) => {
  const [announcement, setAnnouncement] = useState('');
  
  const moveExercise = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      // ...existing move logic
      
      // Create an announcement for screen readers
      const movedExercise = exercises[dragIndex];
      const newPosition = hoverIndex + 1;
      setAnnouncement(
        `Moved exercise ${movedExercise.name} to position ${newPosition}`
      );
    },
    [exercises]
  );
  
  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      
      <div className="workout-editor__exercise-list">
        {/* Exercise items */}
      </div>
    </>
  );
};
```

## Performance Considerations

- Use memoization for drag items to prevent unnecessary re-renders
- Optimize hover detection logic to reduce calculations
- Consider virtual rendering for very large lists (unlikely for workouts)

This implementation provides a robust, accessible, and user-friendly drag-and-drop experience for reordering exercises in the workout editor. 