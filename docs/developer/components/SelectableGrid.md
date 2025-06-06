# 🎯 **Selectable Grid Component System**

## **Overview**

The Selectable Grid is a responsive, 5-column grid system designed for equipment, goals, and other multi-select interfaces. It provides consistent styling, accessibility features, and state management patterns across the application.

---

## **🏗️ Grid Architecture**

### **Responsive Breakpoints**
```scss
// 5-Column Responsive Grid Layout
&__checkbox-grid {
  display: grid !important;
  gap: 0.5rem; // 8px between items
  width: 100%;
  
  // Mobile (default)
  grid-template-columns: 1fr;
  
  // Small tablets (640px+)
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  // Medium tablets (768px+)
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  // Desktop (1024px+)
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  
  // Large desktop (1280px+)
  @media (min-width: 1280px) {
    grid-template-columns: repeat(5, minmax(0, 1fr)); // Target: 5 columns
  }
}
```

### **Container Integration**
```scss
// Required parent container overrides
&__form-grid {
  .form-field-enhanced {
    display: block !important; // Override flex layout
    
    .form-field-enhanced__input-wrapper {
      display: block !important;
    }
  }
  
  .checkbox-grid {
    display: grid !important; // Force grid display
  }
}
```

---

## **🎨 Item Styling System**

### **Base Item Structure**
```scss
&__checkbox-label {
  // Layout
  display: flex;
  align-items: flex-start;
  position: relative;
  
  // Dimensions (exact measurements from theme registration)
  padding: 0.625rem 1rem; // 10px 16px
  border-radius: 0.375rem; // 6px
  margin-bottom: 0.5rem; // 8px
  min-height: auto; // Content-driven
  width: 100%;
  box-sizing: border-box;
  
  // Visual styling
  background-color: rgba(51, 65, 85, 0.4); // #334155 at 40%
  border: none;
  color: #e5e7eb !important; // Light gray text
  cursor: pointer;
  
  // Smooth transitions
  transition: all 0.2s ease;
  transition-property: background-color, border-color, transform, opacity;
}
```

### **State Variations**

#### **🔵 Default State**
```scss
// Background & Colors
background-color: rgba(51, 65, 85, 0.4); // Neutral gray-blue
color: #e5e7eb; // Light gray text
border: none; // Clean appearance
```

#### **🟦 Hover State**
```scss
&:hover {
  background-color: rgba(51, 65, 85, 0.6); // Darker on hover
  color: #f3f4f6 !important; // Lighter text
}
```

#### **✅ Selected State**
```scss
&.checkbox-label--selected {
  background-color: rgba(139, 92, 246, 0.2); // Purple background at 20%
  border: 1px solid rgba(139, 92, 246, 0.4); // Purple border at 40%
  color: #c4b5fd !important; // Light purple text
  
  .checkbox-text {
    color: #c4b5fd !important;
    font-weight: 600; // Semi-bold when selected
  }
  
  .checkbox-box {
    background-color: #8b5cf6; // Solid purple
    border: none;
    
    .checkbox-indicator {
      opacity: 1;
      transform: scale(1);
      color: white !important;
    }
  }
}
```

#### **🎯 Focus State**
```scss
&:focus-within {
  outline: 2px solid rgba(139, 92, 246, 0.5); // Purple outline
  outline-offset: 2px;
  color: #f3f4f6 !important;
}
```

---

## **📦 Checkbox Component System**

### **Checkbox Indicator**
```scss
&__checkbox-box {
  // Dimensions
  width: 1.25rem; // 20px
  height: 1.25rem; // 20px
  border-radius: 0.25rem; // 4px
  margin-right: 0.75rem; // 12px
  
  // Layout
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  // Styling
  background-color: rgba(255, 255, 255, 0.1); // Subtle white background
  border: none;
  transition: all 0.2s ease;
}

&__checkbox-indicator {
  opacity: 0; // Hidden by default
  transform: scale(0.5);
  transition: all 0.2s ease;
  
  // Icon sizing
  font-size: 14px;
  font-weight: bold;
  width: 14px;
  height: 14px;
  
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### **Text Styling**
```scss
&__checkbox-text {
  // Typography
  font-size: 0.875rem; // 14px
  line-height: 1.25rem; // 20px
  font-weight: normal; // 400
  
  // Colors & Layout
  color: #e5e7eb !important; // Light gray - forced override
  transition: all 0.2s ease;
  word-break: break-word;
  flex: 1;
  
  // Accessibility
  opacity: 1 !important; // Prevent transparency
}
```

---

## **🚀 Implementation Guide**

### **Step 1: HTML Structure**
```tsx
<div className="component__checkbox-grid">
  {options.map(option => (
    <label 
      key={option.id} 
      className={`component__checkbox-label ${
        selectedItems.includes(option.id) ? 'checkbox-label--selected' : ''
      }`}
    >
      <input
        type="checkbox"
        className="component__checkbox-input"
        value={option.id}
        checked={selectedItems.includes(option.id)}
        onChange={() => handleToggle(option.id)}
        disabled={isDisabled}
      />
      <div className="component__checkbox-box">
        <IconComponent size={14} className="component__checkbox-indicator" />
      </div>
      <span className="component__checkbox-text">{option.label}</span>
    </label>
  ))}
</div>
```

### **Step 2: CSS Integration**
```scss
// Import the base grid system
@import 'path/to/selectable-grid-base';

// Apply to your component
.your-component {
  // Copy the checkbox-grid, checkbox-label, checkbox-box, 
  // checkbox-indicator, and checkbox-text styles
  
  // Customize the component prefix
  &__checkbox-grid { /* grid styles */ }
  &__checkbox-label { /* label styles */ }
  &__checkbox-box { /* checkbox styles */ }
  &__checkbox-indicator { /* indicator styles */ }
  &__checkbox-text { /* text styles */ }
  &__checkbox-input { /* hidden input styles */ }
}
```

### **Step 3: State Management Pattern**
```tsx
const [selectedItems, setSelectedItems] = useState<string[]>([]);

const handleToggle = (itemId: string) => {
  setSelectedItems(prev => 
    prev.includes(itemId)
      ? prev.filter(id => id !== itemId)
      : [...prev, itemId]
  );
};
```

---

## **🎯 Usage Examples**

### **Equipment Selection**
```tsx
// Equipment grid implementation
<div className="equipment-selector__checkbox-grid">
  {EQUIPMENT_OPTIONS.map(equipment => (
    <label 
      key={equipment.id} 
      className={`equipment-selector__checkbox-label ${
        selectedEquipment.includes(equipment.id) ? 'checkbox-label--selected' : ''
      }`}
    >
      <input
        type="checkbox"
        className="equipment-selector__checkbox-input"
        value={equipment.id}
        checked={selectedEquipment.includes(equipment.id)}
        onChange={() => handleEquipmentToggle(equipment.id)}
      />
      <div className="equipment-selector__checkbox-box">
        <Dumbbell size={14} className="equipment-selector__checkbox-indicator" />
      </div>
      <span className="equipment-selector__checkbox-text">{equipment.label}</span>
    </label>
  ))}
</div>
```

### **Goals Selection**
```tsx
// Goals grid implementation
<div className="goal-selector__checkbox-grid">
  {GOAL_OPTIONS.map(goal => (
    <label 
      key={goal.value} 
      className={`goal-selector__checkbox-label ${
        selectedGoals.includes(goal.value) ? 'checkbox-label--selected' : ''
      }`}
    >
      <input
        type="checkbox"
        className="goal-selector__checkbox-input"
        value={goal.value}
        checked={selectedGoals.includes(goal.value)}
        onChange={() => handleGoalToggle(goal.value)}
      />
      <div className="goal-selector__checkbox-box">
        <Target size={14} className="goal-selector__checkbox-indicator" />
      </div>
      <span className="goal-selector__checkbox-text">{goal.label}</span>
    </label>
  ))}
</div>
```

---

## **🔧 Customization Options**

### **Color Theme Variations**
```scss
// Purple theme (default)
--grid-bg-default: rgba(51, 65, 85, 0.4);
--grid-bg-hover: rgba(51, 65, 85, 0.6);
--grid-bg-selected: rgba(139, 92, 246, 0.2);
--grid-border-selected: rgba(139, 92, 246, 0.4);
--grid-text-selected: #c4b5fd;

// Blue theme variation
--grid-bg-selected: rgba(59, 130, 246, 0.2);
--grid-border-selected: rgba(59, 130, 246, 0.4);
--grid-text-selected: #93c5fd;

// Green theme variation
--grid-bg-selected: rgba(34, 197, 94, 0.2);
--grid-border-selected: rgba(34, 197, 94, 0.4);
--grid-text-selected: #86efac;
```

### **Size Variations**
```scss
// Compact variant
&--compact {
  .checkbox-label {
    padding: 0.5rem 0.75rem; // Smaller padding
    
    .checkbox-box {
      width: 1rem; // Smaller checkbox
      height: 1rem;
      margin-right: 0.5rem;
    }
    
    .checkbox-text {
      font-size: 0.75rem; // Smaller text
    }
  }
}

// Large variant
&--large {
  .checkbox-label {
    padding: 0.75rem 1.25rem; // Larger padding
    
    .checkbox-box {
      width: 1.5rem; // Larger checkbox
      height: 1.5rem;
      margin-right: 1rem;
    }
    
    .checkbox-text {
      font-size: 1rem; // Larger text
    }
  }
}
```

---

## **♿ Accessibility Features**

### **Keyboard Navigation**
- Tab navigation through all items
- Enter/Space to toggle selection
- Focus indicators with 2px outline

### **Screen Reader Support**
- Semantic checkbox inputs
- Proper labeling with checkbox text
- Selection state announcements

### **Reduced Motion**
```scss
@media (prefers-reduced-motion: reduce) {
  .checkbox-label {
    transition-duration: 0.01ms !important;
  }
}
```

---

## **📋 Integration Checklist**

- [ ] Copy base grid styles to your component
- [ ] Update CSS class prefixes to match your component
- [ ] Implement state management for selection
- [ ] Add proper TypeScript interfaces
- [ ] Test responsive behavior across breakpoints
- [ ] Verify accessibility with screen readers
- [ ] Test keyboard navigation
- [ ] Implement loading/disabled states if needed

---

## **🎨 Visual Specifications**

### **Grid Layout**
- **Mobile**: 1 column, 8px gap
- **Tablet**: 2-3 columns, 8px gap
- **Desktop**: 4-5 columns, 8px gap

### **Item Dimensions**
- **Padding**: 10px vertical, 16px horizontal
- **Border Radius**: 6px
- **Checkbox**: 20x20px with 4px radius
- **Typography**: 14px font, 20px line height

### **Color System**
- **Default**: Gray-blue background, light gray text
- **Selected**: Purple background/border, light purple text
- **Interactive**: Smooth 200ms transitions

This grid system provides a consistent, accessible, and visually appealing interface for multi-select scenarios throughout your application! 🎯 