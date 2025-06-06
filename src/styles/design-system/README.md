# Design System Documentation

## Overview

The Fitcopilot Generator design system provides a comprehensive set of tokens, mixins, and utilities for building consistent, accessible, and performant user interfaces.

## Recent Updates ✨

### CardThumbnail Text Enhancement (Stories 2.1-3.2)
Added comprehensive text mixins for optimal readability and accessibility in workout card headers.

## Core Tokens

### Colors
- **Primary Colors**: Brand colors and accent tones
- **Semantic Colors**: Success, warning, error, info states
- **Neutral Colors**: Text, borders, and surface colors
- **Surface Colors**: Background and card colors

### Typography
- **Font Families**: System font stack with fallbacks
- **Font Sizes**: Responsive scale with clamp() functions
- **Font Weights**: Regular, medium, semibold, bold
- **Line Heights**: Optimized for readability

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Scale**: Consistent spacing scale from xs to 3xl
- **Responsive**: Adaptive spacing for different screen sizes

### Motion
- **Duration**: Fast, normal, slow timing values
- **Easing**: Standard, emphasized, decelerated curves
- **Transition**: Consistent timing functions

## Text Mixins (New) 🚀

### High Contrast Text
Ensures optimal readability across all background colors with multiple strength levels.

```scss
@include text-high-contrast($strength: 'medium');
// Options: 'light', 'medium', 'strong', 'maximum'
```

**Features:**
- **Multi-layer text shadows**: Enhanced depth and readability
- **Adaptive contrast**: Automatically adjusts for background luminance
- **WCAG AA compliance**: Minimum 4.5:1 contrast ratio
- **Performance optimized**: Hardware acceleration with transform3d

### Readable on Any Background
Advanced text rendering for complex backgrounds and overlays.

```scss
@include text-readable-on-any-background($variant: 'default');
// Options: 'default', 'strong', 'maximum'
```

**Features:**
- **Backdrop blur**: Modern glass morphism effect
- **Gradient overlays**: Subtle background enhancement
- **Multiple shadow layers**: Enhanced text definition
- **Fallback support**: Graceful degradation for older browsers

### Responsive Text Truncation
Intelligent text truncation with adaptive line clamping.

```scss
@include text-truncate-responsive($mobile: 2, $tablet: 3, $desktop: 4);
```

**Features:**
- **Breakpoint-aware**: Different line limits per screen size
- **Cross-browser support**: WebKit and fallback implementations
- **Semantic truncation**: Preserves meaning with intelligent cutting
- **Tooltip integration**: Shows full text on hover for truncated content

### Card Thumbnail Title
Complete typography solution for workout card headers.

```scss
@include card-thumbnail-title();
```

**Features:**
- **Responsive sizing**: clamp() function for fluid typography
- **Optimal contrast**: Multi-layer shadows and backgrounds
- **Accessibility support**: High contrast mode and reduced motion
- **Cross-browser compatibility**: Comprehensive fallback support

### Motion Preferences
Respects user accessibility preferences for motion and animations.

```scss
@include text-respect-motion-preferences();
```

**Features:**
- **Reduced motion support**: Automatically disables animations when requested
- **Accessibility compliance**: WCAG motion sensitivity guidelines
- **Performance optimization**: Efficient CSS queries
- **User-centric design**: Honors operating system settings

## Component Patterns

### Workout Card Headers
Established pattern for displaying workout information prominently.

```scss
.workout-thumbnail {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  
  .thumbnail-title {
    @include card-thumbnail-title();
    @include text-high-contrast('strong');
    @include text-respect-motion-preferences();
    
    // Responsive truncation
    @include text-truncate-responsive(2, 3, 4);
    
    // Enhanced readability
    @include text-readable-on-any-background('strong');
  }
}
```

### Responsive Grid Layouts
Optimized grid patterns for workout card displays.

```scss
.workout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

.workout-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
```

## Usage Examples

### Basic Card Header
```scss
.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .title {
    @include card-thumbnail-title();
    color: white;
  }
}
```

### Advanced Typography
```scss
.complex-text {
  @include text-high-contrast('maximum');
  @include text-truncate-responsive(1, 2, 3);
  @include text-respect-motion-preferences();
  
  // Custom enhancements
  font-weight: 600;
  letter-spacing: 0.025em;
}
```

### Accessible Interactive Elements
```scss
.interactive-card {
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevated);
  }
  
  &:focus {
    @include focus-visible();
    outline: 2px solid var(--color-primary);
  }
  
  @include text-respect-motion-preferences();
}
```

## Browser Support

### Modern Features
- **CSS Grid**: Full support in modern browsers
- **CSS Custom Properties**: IE 11+ with PostCSS fallbacks
- **CSS clamp()**: Chrome 79+, Firefox 75+, Safari 13.1+
- **backdrop-filter**: Chrome 76+, Firefox 103+, Safari 9+

### Fallback Support
- **Text truncation**: WebKit line-clamp with overflow fallback
- **Typography scaling**: Fixed sizes for older browsers
- **Motion preferences**: Graceful degradation without media queries
- **High contrast**: Standard contrast ratios maintained

## Performance Considerations

### Optimization Features
- **CSS custom properties**: Efficient style updates
- **Hardware acceleration**: transform3d for smooth animations  
- **Efficient selectors**: Low specificity for better performance
- **Bundle optimization**: Tree-shaking friendly mixins

### Best Practices
1. **Use design tokens**: Leverage CSS custom properties
2. **Prefer mixins**: Consistent implementation across components
3. **Test accessibility**: Verify WCAG compliance
4. **Monitor performance**: Use browser dev tools for optimization

## Testing

### Visual Regression
- Test across all major browsers
- Verify responsive behavior
- Check dark mode compatibility
- Validate accessibility features

### Performance Testing  
- Measure render times
- Monitor memory usage
- Test with large datasets
- Verify animation smoothness

## Migration Guide

### From Custom Text Styles
```diff
- .custom-title {
-   color: white;
-   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
-   font-weight: 600;
- }

+ .custom-title {
+   @include card-thumbnail-title();
+   @include text-high-contrast('medium');
+ }
```

### From Manual Truncation
```diff
- .truncated-text {
-   overflow: hidden;
-   text-overflow: ellipsis;
-   white-space: nowrap;
- }

+ .truncated-text {
+   @include text-truncate-responsive(1, 2, 3);
+ }
```

## Changelog

### Version 3.2 (Current)
- ✅ Added comprehensive text mixin system
- ✅ Enhanced CardThumbnail typography patterns
- ✅ Improved accessibility compliance
- ✅ Added motion preferences support
- ✅ Implemented responsive truncation system

### Version 3.1  
- ✅ Advanced text processing capabilities
- ✅ Intelligent abbreviation expansion
- ✅ Enhanced contrast calculation
- ✅ Cross-browser compatibility improvements

### Version 2.2
- ✅ Responsive design system integration
- ✅ 5-breakpoint system implementation
- ✅ Mobile-first approach
- ✅ Orientation-aware design patterns

### Version 2.1
- ✅ Typography token system
- ✅ Color contrast utilities
- ✅ Accessibility-first design
- ✅ Performance optimization

---

**Design System Status**: ✅ Production Ready  
**Coverage**: Typography, Colors, Spacing, Motion, Components  
**Compliance**: WCAG AA, Cross-browser, Performance Optimized 