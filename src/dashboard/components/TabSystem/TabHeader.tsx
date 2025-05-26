/**
 * Tab Header Component
 * 
 * Renders the tab navigation buttons with proper ARIA attributes,
 * keyboard navigation, and visual indicators for active state.
 */
import React, { useRef, useEffect } from 'react';
import { useTabNavigation } from './TabContainer';
import type { TabType } from './TabContainer';

interface TabConfig {
  id: TabType;
  label: string;
  icon?: string;
  badge?: number;
}

interface TabHeaderProps {
  tabs: TabConfig[];
  className?: string;
}

/**
 * TabHeader renders the clickable tab navigation
 */
export const TabHeader: React.FC<TabHeaderProps> = ({
  tabs,
  className = ''
}) => {
  const { activeTab, switchTab, isTabActive } = useTabNavigation();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        return;
      }

      e.preventDefault();
      
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        switchTab(tabs[nextIndex].id);
        tabRefs.current[nextIndex]?.focus();
      }
    };

    // Add event listener to the active tab
    const activeTabElement = tabRefs.current.find((_, index) => 
      tabs[index]?.id === activeTab
    );
    
    if (activeTabElement) {
      activeTabElement.addEventListener('keydown', handleKeyDown);
      return () => activeTabElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeTab, switchTab, tabs]);

  return (
    <div className={`tab-header ${className}`} role="tablist">
      {tabs.map((tab, index) => {
        const isActive = isTabActive(tab.id);
        
        return (
          <button
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
          >
            {tab.icon && (
              <span className="tab-icon" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            
            <span className="tab-label">{tab.label}</span>
            
            {tab.badge !== undefined && tab.badge > 0 && (
              <span 
                className="tab-badge" 
                aria-label={`${tab.badge} items`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabHeader; 