/**
 * Testing Lab Main Module
 * 
 * Coordinates all testing lab functionality and sub-modules
 */

import { TestingLabConfig, TestingLabUtils } from './config.js';
import { TestingLabApiClient } from './api-client.js';
import { WorkoutTester } from './workout-tester.js';
import { LogStream } from './log-stream.js';
import { PromptTester } from './prompt-tester.js';

class TestingLab {
    constructor() {
        this.config = new TestingLabConfig();
        this.apiClient = new TestingLabApiClient(this.config);
        this.workoutTester = new WorkoutTester(this.apiClient, this.config);
        this.logStream = new LogStream(this.apiClient, this.config);
        this.promptTester = new PromptTester(this.apiClient, this.config);
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the testing lab
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('[TestingLab] Already initialized');
            return;
        }
        
        console.log('[TestingLab] Initializing...');
        
        try {
            // Initialize all modules
            this.workoutTester.initialize();
            this.logStream.initialize();
            this.promptTester.initialize();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Setup error handling
            this.setupErrorHandling();
            
            this.isInitialized = true;
            console.log('[TestingLab] Initialization complete');
            
        } catch (error) {
            console.error('[TestingLab] Initialization failed:', error);
        }
    }
    
    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Handle tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Handle refresh all button
        const refreshAllBtn = document.getElementById('refresh-all-btn');
        if (refreshAllBtn) {
            refreshAllBtn.addEventListener('click', () => {
                this.refreshAll();
            });
        }
        
        // Handle debug mode toggle
        const debugToggle = document.getElementById('debug-mode-toggle');
        if (debugToggle) {
            debugToggle.addEventListener('change', (e) => {
                this.config.set('debug', e.target.checked);
            });
        }
    }
    
    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Global error handler for uncaught errors
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('testing-lab')) {
                console.error('[TestingLab] Global error:', event.error);
                this.showGlobalError('An unexpected error occurred: ' + event.message);
            }
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[TestingLab] Unhandled promise rejection:', event.reason);
            this.showGlobalError('Promise rejection: ' + event.reason);
        });
    }
    
    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }
        
        // Add active class to selected button
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        // Notify modules about tab change
        this.onTabChanged(tabName);
    }
    
    /**
     * Handle tab change events
     */
    onTabChanged(tabName) {
        switch (tabName) {
            case 'workout-tester':
                // Refresh workout tester if needed
                break;
            case 'log-stream':
                // Ensure log stream is running if auto-refresh is on
                if (this.config.get('autoRefresh') && !this.logStream.isStreaming) {
                    this.logStream.start();
                }
                break;
            case 'prompt-tester':
                // Refresh system stats when switching to prompt tester
                this.promptTester.refreshSystemStats();
                break;
        }
    }
    
    /**
     * Refresh all modules
     */
    async refreshAll() {
        console.log('[TestingLab] Refreshing all modules...');
        
        try {
            // Show loading state
            this.showGlobalMessage('Refreshing all modules...', 'info');
            
            // Refresh each module
            await Promise.all([
                this.logStream.refreshLogs(),
                this.promptTester.refreshSystemStats()
            ]);
            
            this.showGlobalMessage('All modules refreshed successfully', 'success');
            
        } catch (error) {
            console.error('[TestingLab] Failed to refresh all modules:', error);
            this.showGlobalMessage('Failed to refresh modules: ' + error.message, 'error');
        }
    }
    
    /**
     * Show global message
     */
    showGlobalMessage(message, type = 'info') {
        // Create or update global message display
        let messageDiv = document.getElementById('global-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'global-message';
            messageDiv.className = 'global-message';
            
            // Insert at top of testing lab container
            const container = document.querySelector('.wg-debug-container');
            if (container) {
                container.insertBefore(messageDiv, container.firstChild);
            } else {
                document.body.appendChild(messageDiv);
            }
        }
        
        messageDiv.className = `global-message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-text">${TestingLabUtils.escapeHtml(message)}</span>
                <button class="message-close" onclick="this.parentNode.parentNode.style.display='none'">×</button>
            </div>
        `;
        
        messageDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (messageDiv.style.display !== 'none') {
                    messageDiv.style.display = 'none';
                }
            }, 5000);
        }
    }
    
    /**
     * Show global error
     */
    showGlobalError(message) {
        this.showGlobalMessage(message, 'error');
    }
    
    /**
     * Get overall system status
     */
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            modules: {
                workoutTester: !!this.workoutTester,
                logStream: {
                    available: !!this.logStream,
                    streaming: this.logStream?.isStreaming || false
                },
                promptTester: !!this.promptTester
            },
            apiClient: this.apiClient.getStats(),
            config: {
                debug: this.config.get('debug'),
                autoRefresh: this.config.get('autoRefresh')
            }
        };
    }
    
    /**
     * Cleanup and destroy
     */
    destroy() {
        console.log('[TestingLab] Destroying...');
        
        // Stop log streaming
        if (this.logStream && this.logStream.isStreaming) {
            this.logStream.stop();
        }
        
        // Clear any intervals or timeouts
        // (Individual modules should handle their own cleanup)
        
        this.isInitialized = false;
        console.log('[TestingLab] Destroyed');
    }
}

// Create and initialize global instance
let testingLabInstance = null;

/**
 * Initialize testing lab when DOM is ready
 */
export function initializeTestingLab() {
    if (testingLabInstance) {
        console.warn('[TestingLab] Instance already exists');
        return testingLabInstance;
    }
    
    testingLabInstance = new TestingLab();
    testingLabInstance.initialize();
    
    // Make available globally for debugging
    if (window.fitcopilotTestingLab?.debug) {
        window.testingLab = testingLabInstance;
    }
    
    return testingLabInstance;
}

// Export the class and initializer
export { TestingLab }; 