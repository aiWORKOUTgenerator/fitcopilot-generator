/**
 * Tab System Components
 * 
 * Exports all tab system components for easy importing
 */

// Direct re-exports to ensure proper type handling
export { TabContainer, useTabNavigation } from './TabContainer';
export type { TabType } from './TabContainer';

export { default as TabHeader } from './TabHeader';
export { default as TabContent } from './TabContent';
export { default as TabPanel } from './TabPanel';

// Re-export everything as a namespace for convenience
export * as TabSystem from './TabContainer'; 