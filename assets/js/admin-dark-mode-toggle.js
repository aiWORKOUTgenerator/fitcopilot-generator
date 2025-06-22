/**
 * FitCopilot Dark Mode Toggle
 * Sprint Goal: CSS Performance Optimization - Dark Mode Support
 * 
 * Features:
 * - Manual dark/light mode toggle
 * - Respects system preferences by default
 * - Smooth transitions between themes
 * - Local storage persistence
 * - Accessibility compliant
 */

class DarkModeToggle {
    constructor() {
        this.storageKey = 'fitcopilot-theme-preference';
        this.systemPreference = 'system';
        this.lightMode = 'light';
        this.darkMode = 'dark';
        
        this.init();
    }

    /**
     * Initialize the dark mode toggle
     */
    init() {
        // Set initial theme based on stored preference or system preference
        this.setInitialTheme();
        
        // Create toggle button if it doesn't exist
        this.createToggleButton();
        
        // Listen for system preference changes
        this.listenForSystemChanges();
        
        // Bind toggle events
        this.bindEvents();
        
        console.log('🌙 Dark Mode Toggle initialized');
    }

    /**
     * Set the initial theme based on stored preference or system preference
     */
    setInitialTheme() {
        const storedTheme = localStorage.getItem(this.storageKey);
        
        if (storedTheme && storedTheme !== this.systemPreference) {
            this.setTheme(storedTheme);
        } else {
            this.followSystemPreference();
        }
    }

    /**
     * Follow system preference for dark/light mode
     */
    followSystemPreference() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? this.darkMode : this.lightMode;
        this.setTheme(theme, false); // Don't store system preference
    }

    /**
     * Set the theme
     * @param {string} theme - 'light', 'dark', or 'system'
     * @param {boolean} store - Whether to store the preference
     */
    setTheme(theme, store = true) {
        const documentElement = document.documentElement;
        
        // Remove existing theme attributes
        documentElement.removeAttribute('data-theme');
        
        if (theme === this.systemPreference) {
            this.followSystemPreference();
            if (store) {
                localStorage.setItem(this.storageKey, this.systemPreference);
            }
        } else {
            documentElement.setAttribute('data-theme', theme);
            if (store) {
                localStorage.setItem(this.storageKey, theme);
            }
        }
        
        // Update toggle button state
        this.updateToggleButton(theme);
        
        // Dispatch custom event for other components
        this.dispatchThemeChangeEvent(theme);
    }

    /**
     * Create the toggle button in the dashboard controls
     */
    createToggleButton() {
        // Check if button already exists
        if (document.querySelector('.theme-toggle')) {
            return;
        }

        // Find dashboard controls container (with fallback)
        let controlsContainer = document.querySelector('.dashboard-controls');
        
        // Fallback: Create controls container if it doesn't exist
        if (!controlsContainer) {
            const header = document.querySelector('.dashboard-header') || 
                          document.querySelector('.wrap > h1')?.parentElement ||
                          document.querySelector('.wrap');
            
            if (header) {
                // Create dashboard controls container
                controlsContainer = document.createElement('div');
                controlsContainer.className = 'dashboard-controls';
                controlsContainer.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: var(--space-md, 1rem);
                    margin-top: var(--space-md, 1rem);
                `;
                
                if (header.querySelector('h1')) {
                    // Insert after h1
                    header.querySelector('h1').insertAdjacentElement('afterend', controlsContainer);
                } else {
                    // Append to header
                    header.appendChild(controlsContainer);
                }
            } else {
                console.warn('No suitable container found for theme toggle');
                return;
            }
        }

        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'theme-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle dark mode');
        toggleButton.setAttribute('title', 'Toggle dark mode');
        
        // Create icon span
        const iconSpan = document.createElement('span');
        iconSpan.className = 'theme-toggle-icon';
        iconSpan.innerHTML = this.getThemeIcon(this.getCurrentTheme());
        
        // Create label span (for screen readers)
        const labelSpan = document.createElement('span');
        labelSpan.className = 'sr-only';
        labelSpan.textContent = 'Toggle dark mode';
        
        toggleButton.appendChild(iconSpan);
        toggleButton.appendChild(labelSpan);
        
        // Insert at the beginning of controls
        controlsContainer.insertBefore(toggleButton, controlsContainer.firstChild);
    }

    /**
     * Get the current theme
     * @returns {string} Current theme
     */
    getCurrentTheme() {
        const storedTheme = localStorage.getItem(this.storageKey);
        
        if (storedTheme && storedTheme !== this.systemPreference) {
            return storedTheme;
        }
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? this.darkMode : this.lightMode;
    }

    /**
     * Get the appropriate icon for the theme
     * @param {string} theme - Current theme
     * @returns {string} SVG icon HTML
     */
    getThemeIcon(theme) {
        if (theme === this.darkMode) {
            // Sun icon for light mode (when in dark mode, show sun to switch to light)
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`;
        } else {
            // Moon icon for dark mode (when in light mode, show moon to switch to dark)
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>`;
        }
    }

    /**
     * Update the toggle button state
     * @param {string} theme - Current theme
     */
    updateToggleButton(theme) {
        const toggleButton = document.querySelector('.theme-toggle');
        const iconSpan = toggleButton?.querySelector('.theme-toggle-icon');
        
        if (iconSpan) {
            iconSpan.innerHTML = this.getThemeIcon(theme);
        }
        
        if (toggleButton) {
            const label = theme === this.darkMode ? 'Switch to light mode' : 'Switch to dark mode';
            toggleButton.setAttribute('aria-label', label);
            toggleButton.setAttribute('title', label);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle')) {
                this.toggleTheme();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.theme-toggle') && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.darkMode ? this.lightMode : this.darkMode;
        
        this.setTheme(newTheme);
        
        // Announce change to screen readers
        this.announceThemeChange(newTheme);
        
        // Add visual feedback
        this.addToggleFeedback();
    }

    /**
     * Listen for system preference changes
     */
    listenForSystemChanges() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            const storedTheme = localStorage.getItem(this.storageKey);
            
            // Only follow system changes if user hasn't set a manual preference
            if (!storedTheme || storedTheme === this.systemPreference) {
                this.followSystemPreference();
            }
        });
    }

    /**
     * Dispatch theme change event for other components
     * @param {string} theme - New theme
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('fitcopilot:theme-changed', {
            detail: {
                theme: theme,
                isDark: theme === this.darkMode
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Announce theme change to screen readers
     * @param {string} theme - New theme
     */
    announceThemeChange(theme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Switched to ${theme} mode`;
        
        document.body.appendChild(announcement);
        
        // Remove announcement after a short delay
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Add visual feedback to toggle action
     */
    addToggleFeedback() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (!toggleButton) return;
        
        // Add animation class
        toggleButton.classList.add('theme-toggle-active');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            toggleButton.classList.remove('theme-toggle-active');
        }, 200);
    }

    /**
     * Get performance metrics for the dark mode system
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            currentTheme: this.getCurrentTheme(),
            hasStoredPreference: !!localStorage.getItem(this.storageKey),
            systemSupportsDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            toggleButtonExists: !!document.querySelector('.theme-toggle'),
            cssCustomPropertiesSupported: CSS.supports('color', 'var(--color-primary)'),
            reducedMotionPreferred: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }
}

// CSS for toggle animation and states
const toggleStyles = `
.theme-toggle {
    position: relative;
    overflow: hidden;
}

.theme-toggle-active {
    animation: theme-toggle-pulse 0.2s ease-out;
}

@keyframes theme-toggle-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.theme-toggle:focus-visible {
    box-shadow: var(--shadow-focus);
}

/* Smooth theme transition */
* {
    transition: background-color var(--transition-normal), 
                color var(--transition-normal), 
                border-color var(--transition-normal);
}

@media (prefers-reduced-motion: reduce) {
    .theme-toggle-active {
        animation: none;
    }
    
    * {
        transition: none !important;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = toggleStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.FitCopilotDarkMode = new DarkModeToggle();
    });
} else {
    window.FitCopilotDarkMode = new DarkModeToggle();
}

// Performance monitoring integration
document.addEventListener('fitcopilot:theme-changed', (e) => {
    console.log(`🎨 Theme changed to: ${e.detail.theme}`);
    
    // Performance tracking (with safe check)
    if (window.FitCopilotPerformance && typeof window.FitCopilotPerformance.trackEvent === 'function') {
        try {
            window.FitCopilotPerformance.trackEvent('theme_change', {
                theme: e.detail.theme,
                isDark: e.detail.isDark,
                timestamp: Date.now()
            });
        } catch (error) {
            console.debug('Performance tracking not available:', error.message);
        }
    }
});

/**
 * Export for use in other modules
 */
window.FitCopilotDarkModeToggle = DarkModeToggle; 