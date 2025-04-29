# Radio Component

## Overview
The Radio component provides styled radio button inputs with various states and customization options. It is built on top of the token system and offers both class-based and mixin-based implementation options.

## Usage

### Basic Usage
```html
<div class="radio-container">
  <input type="radio" class="radio" id="option1" name="options" value="option1">
  <label for="option1" class="radio-label">Option 1</label>
</div>
```

### Radio Group
```html
<div class="radio-group">
  <h4 class="radio-group__title">Select an option</h4>
  
  <div class="radio-group--vertical">
    <div class="radio-container">
      <input type="radio" class="radio" id="option1" name="options" value="option1">
      <label for="option1" class="radio-label">Option 1</label>
    </div>
    
    <div class="radio-container">
      <input type="radio" class="radio" id="option2" name="options" value="option2">
      <label for="option2" class="radio-label">Option 2</label>
    </div>
  </div>
</div>
```

### Horizontal Layout
```html
<div class="radio-group radio-group--horizontal">
  <!-- Radio containers here -->
</div>
```

### Disabled State
```html
<div class="radio-container">
  <input type="radio" class="radio" id="option3" name="options" value="option3" disabled>
  <label for="option3" class="radio-label radio-label--disabled">Disabled Option</label>
</div>
```

## Using Mixins
The Radio component provides several mixins for more customized implementations:

### Basic Radio Mixin
```scss
.my-radio {
  @include radio();
}
```

### Custom Radio Size
```scss
.my-large-radio {
  @include radio((
    $size: 1.5rem,
    $dot-size: 0.75rem
  ));
}
```

### Radio Group Mixin
```scss
.my-radio-group {
  @include radio-group('horizontal');
}
```

### Custom Radio Button Implementation
For a completely custom implementation with hidden native inputs:

```scss
.custom-radio-wrapper {
  position: relative;
  
  input[type="radio"] {
    position: absolute;
    opacity: 0;
  }
  
  .custom-radio-button {
    @include custom-radio-button((
      $size: 1.25rem,
      $border-width: 2px
    ));
  }
  
  input[type="radio"]:checked + .custom-radio-button {
    @include custom-radio-button-checked((
      $dot-size: 0.625rem
    ));
  }
}
```

## Migration Guide

### From Previous Version
If you were using the previous `.form-control` or `.radio` classes directly:

1. Replace `.form-control__container` with `.radio-container`
2. Replace `.form-control__label` with `.radio-label`
3. Keep using the `.radio` class for the input element

### From Custom Implementations
If you have custom radio button implementations:

1. Adopt the new mixins for consistent styling
2. Use the token system for custom theming rather than hardcoded values

## Customization
The Radio component uses the token system for styling. You can customize the appearance by modifying the token values in:

```
src/styles/design-system/tokens/components/_form-controls-tokens.scss
```

Key tokens for radio buttons:
- `'radio'.'border'` - Default border color
- `'radio'.'bg'` - Background color
- `'radio'.'checked'.'indicator'` - Color of the checked indicator dot
- `'radio'.'focus'.'ring'` - Focus ring color

## Accessibility
- Always associate radio buttons with labels using the `for` attribute
- Group related radio buttons in a fieldset with a legend when appropriate
- Ensure keyboard navigation works (using Tab and arrow keys) 