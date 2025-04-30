# Design System Directory Cleanup Plan

## Overview
This document outlines the plan to clean up the design system directory structure, removing duplicate files and ensuring alignment with our target architecture.

## Files to Remove/Migrate

### Core Tokens
These files have duplicates in the new structure and should be removed after ensuring all references are updated:

| Current Location | Target Location | Status |
|-----------------|----------------|--------|
| `_typography.scss` | `tokens/core/_typography.scss` | ✅ Forward compatibility created |
| `_spacing.scss` | `tokens/core/_spacing.scss` | ✅ Forward compatibility created |
| `_shadows.scss` | `tokens/semantic/_surfaces.scss` (partial) | ⚠️ Verify Integration |

### Component Files
These files have new locations in the component structure:

| Current Location | Target Location | Status |
|-----------------|----------------|--------|
| `_input.scss` | `components/forms/_input.scss` | ✅ Forward compatibility created |
| `_select.scss` | `components/forms/_select.scss` | ✅ Forward compatibility created |
| `_form-controls.scss` | `components/forms/_index.scss` (partial) | ⚠️ Verify Integration |

### Theme Files
These files have new locations in the theme structure:

| Current Location | Target Location | Status |
|-----------------|----------------|--------|
| `_dark-theme.scss` | `themes/_dark.scss` | ✅ Forward compatibility created |

### Visual Design Files
These files need examination before migration:

| Current Location | Recommendation | Status |
|-----------------|----------------|--------|
| `_animations.scss` | Relocate to `tokens/semantic/_motion.scss` | ⚠️ Needs Migration |
| `_gradients.scss` | Relocate to `tokens/semantic/_surfaces.scss` | ⚠️ Needs Migration |
| `_backgrounds.scss` | Relocate to `tokens/semantic/_surfaces.scss` | ⚠️ Needs Migration |

## Implementation Steps

### Phase 1: Create Forward Compatibility Files ✅

1. For each file to be removed, check if there are any direct imports
2. Create forward compatibility files that simply import from the new location:

```scss
/**
 * @deprecated This file is deprecated. Use tokens/core/typography instead.
 */
// @warn "The file _typography.scss is deprecated. Import 'tokens/core/typography' directly instead.";
@import 'tokens/core/typography';
```

### Phase 2: Update Import References ✅

1. Identify all files that import the deprecated files
2. Update imports to point to the new locations:

```scss
// Before
@import '../../styles/design-system/spacing';

// After
@import '../../styles/design-system/tokens/core/spacing';
```

Component paths updated:
- Card.scss
- Button.scss

### Phase 3: Verify and Clean Up ⏳

1. Run a comprehensive test suite to ensure UI renders correctly
2. Remove duplicate files once all references are updated and tests pass

## Next Steps

1. Create forward compatibility files for remaining visual design files
2. Verify form controls integration
3. Migrate animations, gradients, and backgrounds to the new structure
4. Update documentation to reflect the new structure

## Files That Need Special Attention

1. `_components.scss` - Contains multiple component styles; may need to be split across component files
2. `_form-mixins.scss` - Verify no loss of functionality when migrated to mixins dir
3. `_shadows.scss` - Ensure all shadow tokens are properly integrated into the surfaces token file

## Testing Strategy

1. Visual regression tests after each set of changes
2. Component-by-component verification in Storybook
3. Full application testing to catch any missed references 