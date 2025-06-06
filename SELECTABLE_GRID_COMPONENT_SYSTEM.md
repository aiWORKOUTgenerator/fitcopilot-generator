# 🎯 **Selectable Grid Component System**

## **Overview**

The Selectable Grid is a responsive, 5-column grid system designed for equipment, goals, and other multi-select interfaces. It provides consistent styling, accessibility features, and state management patterns across the application.

**Implemented in**: `src/features/workout-generator/components/WorkoutEditor/workoutEditor.scss`  
**Used by**: WorkoutEditorModal (Equipment & Goals sections)

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
// Required parent container overrides for FormFieldEnhanced
&__form-grid {
  .form-field-enhanced {
    display: block !important; // Override flex layout
    
    .form-field-enhanced__input-wrapper {
      display: block !important;
    }
  }
  
  .workout-editor__checkbox-grid {
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
  
  // Force light text for all children
  * {
    color: inherit !important;
  }
  
  // Smooth transitions
  transition: all 0.2s ease;
  transition-property: background-color, border-color, transform, opacity;
}
```

### **State Variations**

#### **🔵 Default State**
```scss
background-color: rgba(51, 65, 85, 0.4); // Neutral gray-blue
color: #e5e7eb !important; // Light gray text
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

---

## **🚀 Implementation Guide**

### **Step 1: HTML Structure Pattern**
```tsx
<div className="component__checkbox-grid">
  {options.map(option => {
    const isSelected = selectedItems.includes(option.id);
    const isDisabled = isLoading || isSaving;
    
    return (
      <label 
        key={option.id} 
        className={`component__checkbox-label ${
          isSelected ? 'checkbox-label--selected' : ''
        }`}
      >
        <input
          type="checkbox"
          className="component__checkbox-input"
          value={option.id}
          checked={isSelected}
          onChange={() => handleToggle(option.id)}
          disabled={isDisabled}
        />
        <div className="component__checkbox-box">
          <IconComponent size={14} className="component__checkbox-indicator" />
        </div>
        <span className="component__checkbox-text">{option.label}</span>
      </label>
    );
  })}
</div>
```

### **Step 2: State Management Pattern**
```tsx
const [selectedItems, setSelectedItems] = useState<string[]>([]);

const handleToggle = (itemId: string) => {
  setSelectedItems(prev => {
    if (prev.includes(itemId)) {
      return prev.filter(id => id !== itemId); // Remove if selected
    } else {
      return [...prev, itemId]; // Add if not selected
    }
  });
};
```

---

## **🎯 Usage Examples**

### **Equipment Selection (Working Example)**
```tsx
// From WorkoutEditor.tsx
<div className="workout-editor__checkbox-grid">
  {EQUIPMENT_OPTIONS.map(equipment => (
    <label 
      key={equipment.id} 
      className={`workout-editor__checkbox-label ${
        selectedEquipment.includes(equipment.id) ? 'checkbox-label--selected' : ''
      }`}
    >
      <input
        type="checkbox"
        className="workout-editor__checkbox-input"
        value={equipment.id}
        checked={selectedEquipment.includes(equipment.id)}
        onChange={() => handleEquipmentToggle(equipment.id)}
        disabled={isDisabled}
      />
      <div className="workout-editor__checkbox-box">
        <Dumbbell size={14} className="workout-editor__checkbox-indicator" />
      </div>
      <span className="workout-editor__checkbox-text">{equipment.label}</span>
    </label>
  ))}
</div>
```

---

## **🎨 Visual Specifications Summary**

### **Grid Layout**
- **Mobile**: 1 column, 8px gap
- **Small Tablet**: 2 columns, 8px gap  
- **Medium Tablet**: 3 columns, 8px gap
- **Desktop**: 4 columns, 8px gap
- **Large Desktop**: 5 columns, 8px gap

### **Item Dimensions**
- **Padding**: 10px top/bottom, 16px left/right
- **Border Radius**: 6px
- **Checkbox**: 20×20px with 4px radius
- **Typography**: 14px font, 20px line height

### **Color System**
- **Default Background**: `rgba(51, 65, 85, 0.4)`
- **Selected Background**: `rgba(139, 92, 246, 0.2)`
- **Default Text**: `#e5e7eb`
- **Selected Text**: `#c4b5fd`

This grid system provides a consistent, accessible, and visually appealing interface for multi-select scenarios throughout your application! 🎯
