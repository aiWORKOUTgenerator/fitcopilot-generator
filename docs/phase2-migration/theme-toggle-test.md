# ThemeToggle Component Migration Test Plan

## Component: ThemeToggle

**Migration Date:** [Current Date]  
**Developer:** [Your Name]

## Changes Made

1. Replaced hardcoded RGBA values with CSS custom properties using RGB variables:
   ```scss
   // Before
   background-color: rgba(0, 180, 216, 0.08);
   
   // After
   background-color: rgba(var(--color-primary-rgb), 0.08);
   ```

2. Added consistent focus state for dark mode:
   ```scss
   &--dark {
     &:focus {
       box-shadow: 0 0 0 2px rgba(var(--color-dark-primary-rgb), 0.3);
     }
   }
   ```

## Visual Testing

### Light Mode
- [ ] Default state appears correctly with light background
- [ ] Hover state shows light blue highlight
- [ ] Focus state shows blue outline
- [ ] Sun icon is properly colored
- [ ] Text is clearly visible

### Dark Mode
- [ ] Default state appears correctly with dark background
- [ ] Hover state shows appropriate highlight
- [ ] Focus state shows colored outline
- [ ] Moon icon is properly colored
- [ ] Text is clearly visible

## Functional Testing

- [ ] Clicking toggle switches from light to dark mode
- [ ] UI updates immediately when toggled
- [ ] Dark mode class is applied to HTML element
- [ ] Setting is persisted in localStorage
- [ ] System preference is respected on initial load

## Accessibility Testing

- [ ] Color contrast meets WCAG AA standards:
  - [ ] Text contrast in light mode: ≥ 4.5:1
  - [ ] Text contrast in dark mode: ≥ 4.5:1
- [ ] Focus state is clearly visible in both modes
- [ ] Component is keyboard navigable
- [ ] ARIA attributes work correctly with screen readers

## Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS/Android)

## Notes

- Verify that the toggle appears consistently across the application wherever it's used
- Check that transitions remain smooth between states
- Confirm that the animation works properly on hover

## Results

**Status:** ✅ Passed / ❌ Failed

**Issues Identified:**
1. 
2.

**Resolution:**
1. 
2.

## Sign-off

**Tested By:** _________________  
**Date:** _________________ 