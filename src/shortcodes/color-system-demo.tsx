import React from 'react';
import { createRoot } from 'react-dom/client';
import ColorSystemDemo from '../components/ColorSystemDemo';

/**
 * Initialize the Color System Demo shortcode
 * Renders the ColorSystemDemo component in the DOM element with the given ID
 */
const initColorSystemDemo = () => {
  console.log('[FitCopilot] Initializing Color System Demo - Version 2');
  
  // Try both ID and class selector to ensure we find the element
  const container = document.getElementById('fitcopilot-color-system-demo');
  const containers = document.querySelectorAll('.fitcopilot-color-system-demo');
  
  if (!container && containers.length === 0) {
    console.error('[FitCopilot] No Color System Demo containers found on page');
    return;
  }
  
  console.log('[FitCopilot] Found Color System Demo container(s)', containers.length);
  
  // Check if ColorSystemDemo component is defined
  if (typeof ColorSystemDemo !== 'function') {
    console.error('[FitCopilot] ColorSystemDemo component is not defined or not a function');
    console.log('[FitCopilot] ColorSystemDemo type:', typeof ColorSystemDemo);
    return;
  }
  
  // If we have an ID container, prioritize that
  if (container) {
    console.log('[FitCopilot] Mounting to container with ID');
    try {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <ColorSystemDemo />
        </React.StrictMode>
      );
      console.log('[FitCopilot] Color System Demo mounted successfully to ID container');
    } catch (error) {
      console.error('[FitCopilot] Error mounting Color System Demo to ID container:', error);
    }
    return;
  }
  
  // Otherwise mount to all class containers
  containers.forEach((classContainer, index) => {
    console.log(`[FitCopilot] Mounting to container #${index + 1}`);
    try {
      const root = createRoot(classContainer);
      root.render(
        <React.StrictMode>
          <ColorSystemDemo />
        </React.StrictMode>
      );
      console.log(`[FitCopilot] Color System Demo mounted successfully to container #${index + 1}`);
    } catch (error) {
      console.error(`[FitCopilot] Error mounting Color System Demo to container #${index + 1}:`, error);
    }
  });
};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[FitCopilot] DOM content loaded, initializing Color System Demo');
  initColorSystemDemo();
});

// Also try to initialize if the document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('[FitCopilot] Document already loaded, initializing Color System Demo immediately');
  setTimeout(initColorSystemDemo, 100);
}

// Make the init function globally available
(window as any).initColorSystemDemo = initColorSystemDemo;

export default initColorSystemDemo; 