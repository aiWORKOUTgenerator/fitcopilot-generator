/**
 * Enhanced Tab Header Component
 * 
 * Advanced tab navigation with mobile optimization, keyboard shortcuts,
 * hamburger menu for mobile, and enhanced accessibility features.
 */
import React, { useRef, useEffect, useState } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTabNavigation } from './TabContainer';
import type { TabType } from './TabContainer';

interface TabConfig {
  id: TabType;
  label: string;
  icon?: string;
  badge?: number;
  shortcut?: string; // Keyboard shortcut display (e.g., "Alt+1")
}

interface EnhancedTabHeaderProps {
  tabs: TabConfig[];
  className?: string;
  showShortcuts?: boolean;
  enableMobileMenu?: boolean;
}

/**
 * Enhanced Tab Header with mobile menu and keyboard shortcuts
 */
export const EnhancedTabHeader: React.FC<EnhancedTabHeaderProps> = ({
  tabs,
  className = '',
  showShortcuts = true,
  enableMobileMenu = true
}) => {
  const { activeTab, switchTab, isTabActive } = useTabNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Check scroll capability
  const checkScrollCapability = () => {
    const container = tabContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  // Handle scroll buttons
  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 200;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // Handle keyboard navigation within tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            switchTab('register');
            break;
          case '2':
            e.preventDefault();
            switchTab('profile');
            break;
          case '3':
            e.preventDefault();
            switchTab('saved-workouts');
            break;
        }
        return;
      }

      // Tab navigation within header
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        return;
      }

      // Only handle if focus is on a tab button
      const activeElement = document.activeElement;
      const tabIndex = tabRefs.current.findIndex(ref => ref === activeElement);
      if (tabIndex === -1) return;

      e.preventDefault();
      
      let nextIndex = tabIndex;

      switch (e.key) {
        case 'ArrowLeft':
          nextIndex = tabIndex > 0 ? tabIndex - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
          nextIndex = tabIndex < tabs.length - 1 ? tabIndex + 1 : 0;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
      }

      if (nextIndex !== tabIndex) {
        switchTab(tabs[nextIndex].id);
        tabRefs.current[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [switchTab, tabs]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Handle scroll monitoring
  useEffect(() => {
    const container = tabContainerRef.current;
    if (!container) return;

    checkScrollCapability();
    
    const handleScroll = () => {
      checkScrollCapability();
    };

    const handleResize = () => {
      checkScrollCapability();
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`enhanced-tab-header ${className}`}>
      {/* Desktop Tab Navigation */}
      <div className="desktop-tab-navigation">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            className="tab-scroll-button left"
            onClick={() => scrollTabs('left')}
            aria-label="Scroll tabs left"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        
        {/* Tab Container */}
        <div 
          ref={tabContainerRef}
          className="tab-header-container"
          role="tablist"
          onScroll={checkScrollCapability}
        >
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
                className={`enhanced-tab-button ${isActive ? 'active' : ''}`}
                onClick={() => switchTab(tab.id)}
                title={showShortcuts && tab.shortcut ? `${tab.label} (${tab.shortcut})` : tab.label}
              >
                {tab.icon && (
                  <span className="tab-icon" aria-hidden="true">
                    {tab.icon}
                  </span>
                )}
                
                <span className="tab-label">{tab.label}</span>
                
                {showShortcuts && tab.shortcut && (
                  <span className="tab-shortcut desktop-only" aria-hidden="true">
                    {tab.shortcut}
                  </span>
                )}
                
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span 
                    className="tab-badge" 
                    aria-label={`${tab.badge} items`}
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            className="tab-scroll-button right"
            onClick={() => scrollTabs('right')}
            aria-label="Scroll tabs right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      
      {/* Mobile Navigation */}
      {enableMobileMenu && (
        <div className="mobile-tab-navigation mobile-only">
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="mobile-menu-icon">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
            <span className="mobile-menu-label">
              {tabs.find(tab => tab.id === activeTab)?.label || 'Menu'}
            </span>
            {tabs.find(tab => tab.id === activeTab)?.badge && (
              <span className="mobile-menu-badge">
                {tabs.find(tab => tab.id === activeTab)!.badge}
              </span>
            )}
          </button>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div 
              ref={mobileMenuRef}
              className="mobile-menu-dropdown"
              role="menu"
            >
              {tabs.map((tab) => {
                const isActive = isTabActive(tab.id);
                
                return (
                  <button
                    key={tab.id}
                    role="menuitem"
                    className={`mobile-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      switchTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {tab.icon && (
                      <span className="menu-item-icon" aria-hidden="true">
                        {tab.icon}
                      </span>
                    )}
                    
                    <span className="menu-item-label">{tab.label}</span>
                    
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span 
                        className="menu-item-badge" 
                        aria-label={`${tab.badge} items`}
                      >
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </span>
                    )}
                    
                    {isActive && (
                      <span className="menu-item-indicator" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedTabHeader; 