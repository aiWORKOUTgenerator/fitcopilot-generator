# Workout Editor UI Wireframes

## Desktop Layout (>768px)

```
┌────────────────────────────────────────────────────────────────────┐
│ ╳  Create/Edit Workout                                    Loading...│
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Title: [__________________________________________________]        │
│                                                                     │
│  ┌─────────────────────────┐ ┌─────────────────────────┐ ┌────────┐│
│  │ Difficulty: [Dropdown ▼]│ │ Duration: [____] minutes│ │Version 1││
│  └─────────────────────────┘ └─────────────────────────┘ └────────┘│
│                                                                     │
│  Exercises                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ≡ 1. Exercise Name [________________________]                 ╳ ││
│  │                                                                 ││
│  │   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        ││
│  │   │ Sets: [__]    │ │ Reps: [____]  │ │ Rest: [__] sec│        ││
│  │   └───────────────┘ └───────────────┘ └───────────────┘        ││
│  │                                                                 ││
│  │   Notes: [_______________________________________________]      ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ≡ 2. Exercise Name [________________________]                 ╳ ││
│  │                                                                 ││
│  │   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        ││
│  │   │ Sets: [__]    │ │ Reps: [____]  │ │ Rest: [__] sec│        ││
│  │   └───────────────┘ └───────────────┘ └───────────────┘        ││
│  │                                                                 ││
│  │   Notes: [_______________________________________________]      ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [+ Add Exercise]                                                   │
│                                                                     │
│  Notes                                                              │
│  [_____________________________________________________________]   │
│  [_____________________________________________________________]   │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│                                 [Cancel]        [Save Workout]      │
└────────────────────────────────────────────────────────────────────┘
```

## Tablet Layout (480px - 768px)

```
┌──────────────────────────────────────────┐
│ ╳  Create/Edit Workout          Loading...│
├──────────────────────────────────────────┤
│                                          │
│  Title: [___________________________]    │
│                                          │
│  ┌────────────────────┐ ┌───────────────┐│
│  │Difficulty:[Drop ▼] │ │Duration: [__] ││
│  └────────────────────┘ └───────────────┘│
│                                          │
│  Exercises                               │
│  ┌────────────────────────────────────┐  │
│  │ ≡ 1. Exercise Name [_________]  ╳  │  │
│  │                                    │  │
│  │   Sets: [__]  Reps: [__]          │  │
│  │   Rest: [__] sec                  │  │
│  │   Notes: [____________________]   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ≡ 2. Exercise Name [_________]  ╳  │  │
│  │                                    │  │
│  │   Sets: [__]  Reps: [__]          │  │
│  │   Rest: [__] sec                  │  │
│  │   Notes: [____________________]   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [+ Add Exercise]                        │
│                                          │
│  Notes                                   │
│  [__________________________________]    │
│  [__________________________________]    │
│                                          │
├──────────────────────────────────────────┤
│              [Cancel]  [Save Workout]    │
└──────────────────────────────────────────┘
```

## Mobile Layout (<480px)

```
┌────────────────────────────┐
│ ╳  Create Workout          │
├────────────────────────────┤
│                            │
│ Title:                     │
│ [________________________] │
│                            │
│ Difficulty:                │
│ [Dropdown ▼]               │
│                            │
│ Duration (minutes):        │
│ [______]                   │
│                            │
│ Exercises                  │
│ ┌──────────────────────┐   │
│ │ ≡ 1. Name:          │   │
│ │ [______________]  ╳  │   │
│ │                      │   │
│ │ Sets: [__]           │   │
│ │ Reps: [__]           │   │
│ │ Rest: [__] sec       │   │
│ │                      │   │
│ │ Notes:               │   │
│ │ [________________]   │   │
│ └──────────────────────┘   │
│                            │
│ ┌──────────────────────┐   │
│ │ ≡ 2. Name:          │   │
│ │ [______________]  ╳  │   │
│ │                      │   │
│ │ Sets: [__]           │   │
│ │ Reps: [__]           │   │
│ │ Rest: [__] sec       │   │
│ │                      │   │
│ │ Notes:               │   │
│ │ [________________]   │   │
│ └──────────────────────┘   │
│                            │
│ [+ Add Exercise]           │
│                            │
│ Notes:                     │
│ [________________________] │
│ [________________________] │
│                            │
├────────────────────────────┤
│ [Cancel]                   │
│ [Save Workout]             │
└────────────────────────────┘
```

## Component Behavior at Different Breakpoints

### Header Component
- **Desktop**: Title and close button left-aligned, loading state right-aligned
- **Tablet**: Same as desktop with reduced padding
- **Mobile**: Simplified title, stacked loading indicator if needed

### Metadata Form
- **Desktop**: Side-by-side fields with version on right
- **Tablet**: Side-by-side for difficulty and duration, version below if needed
- **Mobile**: Stacked fields, full width

### Exercise Items
- **Desktop**: Horizontal layout for sets/reps/rest controls
- **Tablet**: Semi-horizontal layout with wrapped controls if needed
- **Mobile**: Vertical stacked layout, all controls full width

### Action Buttons
- **Desktop**: Right-aligned button group
- **Tablet**: Right-aligned with reduced padding
- **Mobile**: Full-width stacked buttons, Save on top

## Interactive Elements

### Exercise Drag and Drop
Desktop & Tablet: Full drag and drop functionality
Mobile: Simplified reordering with up/down buttons

### Form Controls
- Input fields expand to fill available width at all breakpoints
- Touch targets min 44px height on mobile
- Dropdowns show appropriately sized option menus based on viewport

### Validation Messages
- Appear directly below the related form control
- Full width on all devices
- Remain visible until error is fixed 