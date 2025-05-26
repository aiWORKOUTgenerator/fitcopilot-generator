/**
 * Tab Container Component
 * 
 * Main container that manages tab state and provides context for tab navigation.
 * Implements ARIA-compliant tabbed interface with keyboard navigation support.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import './TabSystem.scss';

export type TabType = 'register' | 'profile' | 'saved-workouts';

interface TabContextValue {
  activeTab: TabType;
  switchTab: (tab: TabType) => void;
  isTabActive: (tab: TabType) => boolean;
}

const TabContext = createContext<TabContextValue | undefined>(undefined);

export const useTabNavigation = (): TabContextValue => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabNavigation must be used within a TabContainer');
  }
  return context;
};

interface TabContainerProps {
  children: React.ReactNode;
  defaultTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  className?: string;
}

/**
 * TabContainer manages the overall tab state and provides navigation context
 */
export const TabContainer: React.FC<TabContainerProps> = ({
  children,
  defaultTab = 'register',
  onTabChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Handle tab switching with URL updates and callbacks
  const switchTab = useCallback((tab: TabType) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    
    // Update URL hash for deep linking
    window.history.replaceState({}, '', `#${tab}`);
    
    // Call external callback if provided
    onTabChange?.(tab);
    
    // Announce tab change to screen readers
    const announcement = `Switched to ${tab.replace('-', ' ')} tab`;
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  }, [activeTab, onTabChange]);

  // Check if a tab is active
  const isTabActive = useCallback((tab: TabType) => tab === activeTab, [activeTab]);

  // Initialize tab from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) as TabType;
    if (hash && (hash === 'register' || hash === 'profile' || hash === 'saved-workouts')) {
      setActiveTab(hash);
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1) as TabType;
      if (hash && (hash === 'register' || hash === 'profile' || hash === 'saved-workouts')) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const contextValue: TabContextValue = {
    activeTab,
    switchTab,
    isTabActive
  };

  return (
    <TabContext.Provider value={contextValue}>
      <div className={`tab-container ${className}`} role="tablist">
        {children}
      </div>
    </TabContext.Provider>
  );
};

export default TabContainer; 