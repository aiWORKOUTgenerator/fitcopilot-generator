/**
 * CardThumbnail Test Utilities
 * 
 * Story 4.1: Comprehensive Testing utilities for visual regression,
 * cross-browser compatibility, and performance testing.
 */

import { CardThumbnailDisplayConfig, CARD_THUMBNAIL_PRESETS } from './CardThumbnailConfig';

// 🚀 STORY 4.1: Test Workout Data Generation
export const TestWorkoutGenerator = {
  /**
   * Task 4.1.1: Generate test workouts with various title lengths
   */
  createTestWorkouts: () => ({
    shortTitles: [
      { id: 'short-1', title: 'HIIT', workoutType: 'High Intensity' },
      { id: 'short-2', title: 'Cardio', workoutType: 'Cardio' },
      { id: 'short-3', title: 'Quick', workoutType: 'Quick Session' },
      { id: 'short-4', title: 'AM Run', workoutType: 'Running' },
      { id: 'short-5', title: 'Core', workoutType: 'Core Training' }
    ],
    mediumTitles: [
      { id: 'medium-1', title: 'Morning HIIT Cardio Session', workoutType: 'HIIT' },
      { id: 'medium-2', title: 'Upper Body Strength Training', workoutType: 'Strength' },
      { id: 'medium-3', title: 'Full Body Circuit Workout', workoutType: 'Circuit' },
      { id: 'medium-4', title: 'Low Impact Yoga Flow', workoutType: 'Yoga' },
      { id: 'medium-5', title: 'Beginner Pilates Routine', workoutType: 'Pilates' }
    ],
    longTitles: [
      { id: 'long-1', title: 'Advanced High Intensity Interval Training with Compound Movements', workoutType: 'HIIT' },
      { id: 'long-2', title: 'Complete Full Body Strength and Conditioning Workout for Intermediate Athletes', workoutType: 'Strength' },
      { id: 'long-3', title: 'Comprehensive Functional Movement Pattern Training Session with Progressive Overload', workoutType: 'Functional' }
    ],
    specialCases: [
      { id: 'special-1', title: 'HIIT & Core (Test Version 2)', workoutType: 'HIIT' },
      { id: 'special-2', title: 'Morning Yoga 🧘‍♀️ [DRAFT]', workoutType: 'Yoga' },
      { id: 'special-3', title: 'AMRAP 20: Pull-ups & Push-ups', workoutType: 'AMRAP' },
      { id: 'special-4', title: 'WOD - RFT 5 Rounds', workoutType: 'WOD' },
      { id: 'special-5', title: 'LB + UB Combo Session', workoutType: 'Full Body' }
    ],
    edgeCases: [
      { id: 'edge-1', title: '', workoutType: 'General' },
      { id: 'edge-2', title: '   ', workoutType: 'Cardio' },
      { id: 'edge-3', title: 'Untitled', workoutType: 'Strength' },
      { id: 'edge-4', title: 'untitled workout', workoutType: 'HIIT' },
      { id: 'edge-5', title: null as any, workoutType: 'Yoga' }
    ]
  }),

  /**
   * Generate workouts for specific testing scenarios
   */
  createScenarioWorkouts: (scenario: 'grid' | 'list' | 'mixed') => {
    const testData = TestWorkoutGenerator.createTestWorkouts();
    
    if (scenario === 'grid') {
      // Optimized for grid testing - variety of lengths and types
      return [
        ...testData.shortTitles.slice(0, 2),
        ...testData.mediumTitles.slice(0, 3),
        ...testData.longTitles.slice(0, 2),
        ...testData.specialCases.slice(0, 2),
        ...testData.edgeCases.slice(0, 2)
      ];
    }
    
    if (scenario === 'list') {
      // Optimized for list testing - focus on horizontal layout
      return [
        ...testData.shortTitles.slice(0, 3),
        ...testData.mediumTitles.slice(0, 2),
        ...testData.longTitles.slice(0, 3),
        ...testData.specialCases.slice(0, 2)
      ];
    }
    
    // Mixed scenario - all types
    return Object.values(testData).flat();
  }
};

// 🚀 STORY 4.1: Visual Validation Utilities
export const VisualTestValidator = {
  /**
   * Validates CardThumbnail rendering across different configurations
   */
  validateThumbnailRendering: (element: HTMLElement, expectedTitle: string, config: CardThumbnailDisplayConfig) => {
    const results = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      measurements: {} as Record<string, any>
    };

    try {
      // Check if element exists and is visible
      if (!element || !element.offsetParent) {
        results.errors.push('Element is not visible or does not exist');
        results.isValid = false;
        return results;
      }

      // Get title element
      const titleElement = element.querySelector('.thumbnail-title, .thumbnail-emoji') as HTMLElement;
      if (!titleElement) {
        results.errors.push('Title or emoji element not found');
        results.isValid = false;
        return results;
      }

      // Validate content based on mode
      if (config.fallbackMode === 'emoji') {
        if (!titleElement.classList.contains('thumbnail-emoji')) {
          results.warnings.push('Expected emoji mode but found text title');
        }
      } else {
        if (titleElement.classList.contains('thumbnail-emoji')) {
          results.warnings.push('Expected text title but found emoji');
        }
      }

      // Measure text truncation
      const titleText = titleElement.textContent || '';
      const computedStyle = getComputedStyle(titleElement);
      
      results.measurements = {
        textContent: titleText,
        displayedLength: titleText.length,
        maxLength: config.maxTitleLength || 100,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        lineHeight: computedStyle.lineHeight,
        overflow: computedStyle.overflow,
        textOverflow: computedStyle.textOverflow
      };

      // Check for proper truncation
      if (titleText.length > (config.maxTitleLength || 100)) {
        if (!titleText.includes('...') && computedStyle.textOverflow !== 'ellipsis') {
          results.warnings.push('Long text not properly truncated');
        }
      }

      // Validate contrast ratio (simplified check)
      const backgroundColor = getComputedStyle(element.closest('.workout-thumbnail') || element).backgroundColor;
      const textColor = computedStyle.color;
      
      if (backgroundColor && textColor) {
        results.measurements.backgroundColor = backgroundColor;
        results.measurements.textColor = textColor;
        
        // Basic contrast check (could be enhanced with actual contrast ratio calculation)
        if (backgroundColor === textColor) {
          results.errors.push('Text and background colors are identical');
          results.isValid = false;
        }
      }

      // Check accessibility attributes
      const hasTitle = titleElement.hasAttribute('title');
      const hasAltText = titleElement.hasAttribute('alt') || titleElement.hasAttribute('aria-label');
      
      if (!hasTitle && !hasAltText) {
        results.warnings.push('Missing accessibility attributes (title, alt, or aria-label)');
      }

    } catch (error) {
      results.errors.push(`Validation error: ${error}`);
      results.isValid = false;
    }

    return results;
  },

  /**
   * Validates grid vs list layout rendering
   */
  validateLayoutMode: (container: HTMLElement, mode: 'grid' | 'list') => {
    const results = {
      isValid: true,
      errors: [] as string[],
      measurements: {} as Record<string, any>
    };

    try {
      const computedStyle = getComputedStyle(container);
      
      if (mode === 'grid') {
        if (computedStyle.display !== 'grid' && !computedStyle.display.includes('grid')) {
          results.errors.push('Container should use CSS Grid for grid mode');
          results.isValid = false;
        }
        
        results.measurements.gridTemplateColumns = computedStyle.gridTemplateColumns;
        results.measurements.gap = computedStyle.gap;
      } else if (mode === 'list') {
        if (computedStyle.display !== 'flex' && computedStyle.flexDirection !== 'column') {
          results.errors.push('Container should use flex column for list mode');
          results.isValid = false;
        }
        
        results.measurements.flexDirection = computedStyle.flexDirection;
        results.measurements.gap = computedStyle.gap;
      }

      // Check card sizing consistency
      const cards = container.querySelectorAll('.workout-card, .enhanced-workout-card');
      const cardHeights = Array.from(cards).map(card => card.getBoundingClientRect().height);
      
      results.measurements.cardCount = cards.length;
      results.measurements.cardHeights = cardHeights;
      
      if (mode === 'grid' && cardHeights.length > 1) {
        const heightVariance = Math.max(...cardHeights) - Math.min(...cardHeights);
        if (heightVariance > 50) { // 50px tolerance
          results.errors.push(`Significant height variance in grid mode: ${heightVariance}px`);
          results.isValid = false;
        }
      }

    } catch (error) {
      results.errors.push(`Layout validation error: ${error}`);
      results.isValid = false;
    }

    return results;
  }
};

// 🚀 STORY 4.1: Performance Testing
export const PerformanceTestRunner = {
  /**
   * Measures rendering performance with different title configurations
   */
  measureRenderPerformance: async (
    renderFunction: () => Promise<void> | void,
    testName: string,
    iterations: number = 10
  ) => {
    const results = {
      testName,
      iterations,
      measurements: [] as number[],
      average: 0,
      min: 0,
      max: 0,
      standardDeviation: 0
    };

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      await renderFunction();
      
      const endTime = performance.now();
      results.measurements.push(endTime - startTime);
    }

    // Calculate statistics
    results.average = results.measurements.reduce((a, b) => a + b, 0) / iterations;
    results.min = Math.min(...results.measurements);
    results.max = Math.max(...results.measurements);
    
    const variance = results.measurements.reduce((acc, val) => acc + Math.pow(val - results.average, 2), 0) / iterations;
    results.standardDeviation = Math.sqrt(variance);

    return results;
  },

  /**
   * Tests memory usage with large numbers of cards
   */
  measureMemoryUsage: () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        timestamp: Date.now()
      };
    }
    
    return {
      warning: 'Memory measurement not available in this browser',
      timestamp: Date.now()
    };
  }
};

// 🚀 STORY 4.1: Browser Compatibility Testing
export const BrowserCompatibilityChecker = {
  /**
   * Detects browser capabilities and potential issues
   */
  checkBrowserSupport: () => {
    const support = {
      browser: navigator.userAgent,
      cssGrid: CSS.supports('display', 'grid'),
      cssFlex: CSS.supports('display', 'flex'),
      cssClamp: CSS.supports('font-size', 'clamp(1rem, 2vw, 2rem)'),
      cssTextShadow: CSS.supports('text-shadow', '0 0 1px black'),
      cssBackdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
      webkitLineClamp: CSS.supports('-webkit-line-clamp', '3'),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      }
    };

    const warnings = [];
    if (!support.cssGrid) warnings.push('CSS Grid not supported');
    if (!support.cssFlex) warnings.push('CSS Flexbox not supported');
    if (!support.cssClamp) warnings.push('CSS clamp() not supported');
    if (!support.webkitLineClamp) warnings.push('Text line clamping not supported');

    return { support, warnings };
  },

  /**
   * Tests text rendering across different browsers
   */
  testTextRendering: (element: HTMLElement) => {
    const computedStyle = getComputedStyle(element);
    
    return {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      lineHeight: computedStyle.lineHeight,
      textRendering: computedStyle.textRendering,
      fontSmoothing: computedStyle.webkitFontSmoothing || 'not-supported',
      textSizeAdjust: computedStyle.textSizeAdjust || 'not-supported'
    };
  }
};

// 🚀 STORY 4.1: Test Reporter
export const TestReporter = {
  /**
   * Generates comprehensive test report
   */
  generateReport: (testResults: any[]) => {
    const report = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      testSummary: {
        total: testResults.length,
        passed: testResults.filter(r => r.isValid !== false).length,
        failed: testResults.filter(r => r.isValid === false).length,
        warnings: testResults.reduce((sum, r) => sum + (r.warnings?.length || 0), 0)
      },
      results: testResults
    };

    return report;
  },

  /**
   * Formats report for console output
   */
  logReport: (report: any) => {
    console.group('🧪 CardThumbnail Test Report');
    console.log('📊 Summary:', report.testSummary);
    console.log('🌐 Environment:', {
      browser: report.browser,
      viewport: report.viewport,
      pixelRatio: report.devicePixelRatio
    });
    
    if (report.testSummary.failed > 0) {
      console.group('❌ Failed Tests');
      report.results
        .filter((r: any) => r.isValid === false)
        .forEach((r: any) => console.error(r));
      console.groupEnd();
    }
    
    if (report.testSummary.warnings > 0) {
      console.group('⚠️ Warnings');
      report.results
        .filter((r: any) => r.warnings && r.warnings.length > 0)
        .forEach((r: any) => console.warn(r));
      console.groupEnd();
    }
    
    console.groupEnd();
  }
};

// 🚀 STORY 4.1: Default export for easy importing
export default {
  TestWorkoutGenerator,
  VisualTestValidator,
  PerformanceTestRunner,
  BrowserCompatibilityChecker,
  TestReporter
}; 