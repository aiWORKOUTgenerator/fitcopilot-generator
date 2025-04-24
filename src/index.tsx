/**
 * FitCopilot Workout Generator
 * 
 * Main entry point for the plugin's frontend
 */

import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkoutGeneratorFeature } from './features/workout-generator/WorkoutGeneratorFeature';

/**
 * Initialize the application when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Find the container where our app should be mounted
  const container = document.getElementById('fitcopilot-generator-root');
  
  // Only initialize if the container exists
  if (container) {
    createRoot(container).render(<WorkoutGeneratorFeature />);
  }
}); 