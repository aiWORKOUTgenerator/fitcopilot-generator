/**
 * Tab Panel Component
 * 
 * Individual tab content wrapper that handles conditional rendering,
 * lazy loading, and content preservation based on configuration.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTabNavigation } from './TabContainer';
import type { TabType } from './TabContainer';

interface TabPanelProps {
  tabId: TabType;
  children: React.ReactNode;
  className?: string;
  lazy?: boolean; // Only render when first activated
  preserveState?: boolean; // Keep rendered even when inactive
}

/**
 * TabPanel wraps content for a specific tab
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  children,
  className = '',
  lazy = true,
  preserveState = true
}) => {
  const { activeTab, isTabActive } = useTabNavigation();
  const [hasBeenActive, setHasBeenActive] = useState(!lazy);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const isActive = isTabActive(tabId);

  // Track if this tab has ever been active (for lazy loading)
  useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [isActive, hasBeenActive]);

  // Focus management when tab becomes active
  useEffect(() => {
    if (isActive && panelRef.current) {
      // Find the first focusable element in the panel
      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        // Small delay to ensure content is rendered
        setTimeout(() => {
          focusableElements[0].focus();
        }, 100);
      }
    }
  }, [isActive]);

  // Don't render anything if lazy loading and never been active
  if (lazy && !hasBeenActive) {
    return null;
  }

  // Render but hide if not preserving state and not active
  if (!preserveState && !isActive) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={`tab-panel ${className} ${isActive ? 'active' : 'inactive'}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      id={`tabpanel-${tabId}`}
      hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </div>
  );
};

export default TabPanel; 