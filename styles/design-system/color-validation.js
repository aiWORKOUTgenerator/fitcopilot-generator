/**
 * Color System Validation Tool
 * 
 * This script validates the contrast ratios of our color system
 * against WCAG 2.1 AA standards.
 * 
 * Run with: node color-validation.js
 */

import logger from '../../utils/logger';

const designLogger = logger.addContext('DesignSystem');

// Color definitions from our design system
const colors = {
  // Primary (blue)
  'primary-50': '#ebf8ff',
  'primary-100': '#bee3f8',
  'primary-200': '#90cdf4',
  'primary-300': '#63b3ed',
  'primary-400': '#4299e1',
  'primary-500': '#3498db',
  'primary-600': '#2980b9',
  'primary-700': '#2c5282',
  'primary-800': '#2a4365',
  'primary-900': '#1a365d',

  // Accent (lime) 
  'accent-50': '#faffed',
  'accent-100': '#f3ffcc',
  'accent-200': '#ebff99',
  'accent-300': '#e2ff66',
  'accent-400': '#ddff0e',
  'accent-500': '#b3cc0b',
  'accent-600': '#849909',
  'accent-700': '#566606',
  'accent-800': '#293303',
  'accent-900': '#141a01',

  // Gray scale
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
};

// Common combinations used in the UI
const combinations = [
  // Hero text combinations
  { name: 'Hero heading on dark bg', fg: colors['gray-50'], bg: colors['gray-900'] },
  { name: 'Hero paragraph on dark bg', fg: colors['gray-300'], bg: colors['gray-900'] },
  { name: 'Accent text on dark bg', fg: colors['accent-400'], bg: colors['gray-900'] },

  // Button combinations
  { name: 'Primary button text on accent bg', fg: colors['gray-900'], bg: colors['accent-400'] },
  { name: 'Secondary button text on dark bg', fg: colors['gray-50'], bg: colors['gray-800'] },

  // Tooltip combinations
  { name: 'Tooltip title on surface', fg: colors['gray-50'], bg: colors['gray-800'] },
  { name: 'Tooltip body on surface', fg: colors['gray-300'], bg: colors['gray-800'] },
];

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return { r, g, b };
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);

  // Convert RGB to luminance using the formula
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculate contrast ratio according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(color1, color2) {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  // Return the contrast ratio
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 * 4.5:1 for normal text, 3:1 for large text
 */
function passesWCAGAA(contrast, isLargeText = false) {
  return isLargeText ? contrast >= 3 : contrast >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standards
 * 7:1 for normal text, 4.5:1 for large text
 */
function passesWCAGAAA(contrast, isLargeText = false) {
  return isLargeText ? contrast >= 4.5 : contrast >= 7;
}

// Validate and output results
designLogger.debug('Color System Validation Results');
designLogger.debug('===============================');
designLogger.debug('');

// Test each combination
combinations.forEach(combo => {
  const contrast = getContrastRatio(combo.fg, combo.bg);
  const passesAA = passesWCAGAA(contrast);
  const passesAALarge = passesWCAGAA(contrast, true);
  const passesAAA = passesWCAGAAA(contrast);
  const passesAAALarge = passesWCAGAAA(contrast, true);

  designLogger.debug(`${combo.name}:`);
  designLogger.debug(`  Foreground: ${combo.fg}`);
  designLogger.debug(`  Background: ${combo.bg}`);
  designLogger.debug(`  Contrast Ratio: ${contrast.toFixed(2)}:1`);
  designLogger.debug(`  WCAG AA (Normal Text): ${passesAA ? '✅ PASS' : '❌ FAIL'}`);
  designLogger.debug(`  WCAG AA (Large Text): ${passesAALarge ? '✅ PASS' : '❌ FAIL'}`);
  designLogger.debug(`  WCAG AAA (Normal Text): ${passesAAA ? '✅ PASS' : '❌ FAIL'}`);
  designLogger.debug(`  WCAG AAA (Large Text): ${passesAAALarge ? '✅ PASS' : '❌ FAIL'}`);
  designLogger.debug('');
});

// Summary
designLogger.debug('Summary');
designLogger.debug('=======');
const passedCount = combinations.filter(combo =>
  passesWCAGAA(getContrastRatio(combo.fg, combo.bg))
).length;

designLogger.debug(`${passedCount}/${combinations.length} combinations pass WCAG AA standards`);
designLogger.debug(`${Math.round((passedCount / combinations.length) * 100)}% compliance rate`); 