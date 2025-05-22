# Workout Editor UI Design System

## Overview
This design system defines the UI components, layout structure, and responsive behavior for the workout editor. The editor follows the FitCopilot design language while adding specialized components for workout editing.

## Layout Structure

### Modal Container
- **Header**: Contains title, close button, and loading indicator
- **Content**: Scrollable area with metadata form and exercise list
- **Footer**: Action buttons (Cancel, Save)

```
┌─────────────────────────────────────────────┐
│ ╳  Create/Edit Workout            Loading...│ <- Header
├─────────────────────────────────────────────┤
│                                             │
│  Title: [_______________________________]   │
│                                             │
│  Difficulty: [Dropdown ▼]                   │
│  Duration: [Number Input] minutes           │
│                                             │
│  Exercises                                  │
│  ┌─────────────────────────────────────────┐│
│  │ ≡ 1. Exercise Name [____________]     ╳ ││
│  │   Sets: [__]  Reps: [__]  Rest: [__]    ││
│  │   Notes: [_________________________]     ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│ <- Content
│  │ ≡ 2. Exercise Name [____________]     ╳ ││
│  │   Sets: [__]  Reps: [__]  Rest: [__]    ││
│  │   Notes: [_________________________]     ││
│  └─────────────────────────────────────────┘│
│                                             │
│  + Add Exercise                             │
│                                             │
│  Notes                                      │
│  [_______________________________________]  │
│  [_______________________________________]  │
│                                             │
├─────────────────────────────────────────────┤
│        [Cancel]            [Save Workout]   │ <- Footer
└─────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (< 480px)
- Full-screen modal
- Stacked form controls
- Compact exercise items
- Full-width buttons

### Tablet (480px - 768px)
- 90% width modal, max 600px
- Semi-stacked form layout
- Standard exercise items
- Standard button sizing

### Desktop (> 768px)
- 80% width modal, max 800px
- Side-by-side form layout where appropriate
- Expanded exercise items
- Standard button sizing with increased spacing

## Spacing System
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

## UI Component Inventory

### Form Controls

#### Input
- Default from UI component library
- Added states:
  - Error: Red border + error message
  - Disabled: Gray background, reduced opacity

#### Select
- Default from UI component library
- Customized dropdown for difficulty levels

#### Textarea
- Default from UI component library
- Autogrow behavior for notes

#### Button
- **Primary**: Gradient background, white text
- **Secondary**: Outlined, dark text
- **Icon**: Icon only, tooltip on hover
- States: Default, Hover, Active, Disabled, Loading

### Editor-specific Components

#### Exercise Item
- Container with drag handle, number indicator, name input, remove button
- Expandable/collapsible details section
- Visual feedback during drag operation
- Hover state highlights the entire row

```
┌─────────────────────────────────────────────┐
│ ≡ 1. Exercise Name [____________]         ╳ │
│                                             │
│    Sets: [__]  Reps: [__]  Rest: [__] sec   │
│    Notes: [_____________________________]    │
└─────────────────────────────────────────────┘
```

#### Add Exercise Button
- Secondary button style
- "+" icon prepended
- Full width on mobile, auto width on larger screens

#### Loading Indicator
- Spinner animation
- Text label ("Saving...", "Loading...")
- Positioned in header to maintain layout stability

## Interaction Patterns

### Drag and Drop
- Grab handle visual indicator
- Item lifts and shows shadow when dragging
- Placeholder shows potential drop position
- Animation when items reorder
- Keyboard alternative: Up/Down buttons or keyboard shortcuts

### Form Validation
- Real-time validation as user types
- Error messages appear below invalid fields
- Submit button disabled if validation fails

### Saving Flow
- Loading state shows spinner in Save button
- All form controls disabled during save
- Success notification on completion
- Error handling with clear messages

## Accessibility Considerations

### Keyboard Navigation
- Tab order follows visual hierarchy
- Enter/Space to activate buttons
- Escape to close modal
- Arrow keys for select dropdowns

### Screen Reader Support
- ARIA labels for all controls
- Status announcements for operations
- Error messages linked to form fields
- Modal properly trapped and announced

### Focus Management
- Focus trap within modal
- Return focus to trigger element on close
- Visible focus indicators on all interactive elements

## Animation Guidelines

### Modal Transitions
- Open: Fade in + scale up (150ms)
- Close: Fade out + scale down (100ms)

### Interaction Feedback
- Button press: Subtle scale down
- Drag start: Lift effect (shadow + slight scale)
- Save completion: Success indicator pulse

## Implementation Notes

- Use CSS variables for all colors and spacing
- Component props should include all states (loading, disabled, error)
- Maintain 44px minimum touch target size for mobile
- Use proper semantic HTML elements 