/**
 * Tab Content Component
 * 
 * Manages the display of tab panels with smooth transitions,
 * proper ARIA labeling, and content preservation.
 */
import React, { useRef, useEffect } from 'react';
import { useTabNavigation } from './TabContainer';
import type { TabType } from './TabContainer';

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
  preserveContent?: boolean; // Keep inactive tabs in DOM for state preservation
  animationDuration?: number; // Animation duration in ms
}

/**
 * TabContent manages the display of active tab panels
 */
export const TabContent: React.FC<TabContentProps> = ({
  children,
  className = '',
  preserveContent = true,
  animationDuration = 200
}) => {
  const { activeTab } = useTabNavigation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle smooth transitions when tab changes
  useEffect(() => {
    if (!contentRef.current) return;

    const content = contentRef.current;
    
    // Add transition class
    content.style.transition = `opacity ${animationDuration}ms ease-in-out`;
    content.style.opacity = '0';
    
    // Fade in after a brief delay
    const timer = setTimeout(() => {
      content.style.opacity = '1';
    }, 50);

    return () => {
      clearTimeout(timer);
      content.style.transition = '';
    };
  }, [activeTab, animationDuration]);

  // Announce content changes to screen readers
  useEffect(() => {
    const announcement = `${activeTab.replace('-', ' ')} content loaded`;
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    
    const timer = setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div 
      ref={contentRef}
      className={`tab-content ${className}`}
      role="tabpanel"
      aria-labelledby={`tab-${activeTab}`}
      id={`tabpanel-${activeTab}`}
    >
      {children}
    </div>
  );
};

export default TabContent; 