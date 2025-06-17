/**
 * Testing Lab Prompt Tester Module
 * 
 * Handles prompt testing and modular system management
 */

import { TestingLabUtils } from './config.js';

export class PromptTester {
    constructor(apiClient, config) {
        this.apiClient = apiClient;
        this.config = config;
        this.currentSystemState = null;
        this.testHistory = [];
    }
    
    /**
     * Initialize prompt tester
     */
    initialize() {
        console.log('PromptTester initialized');
        this.setupEventListeners();
        this.loadSystemState();
        this.setupPromptComparison();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Modular system toggle
        const modularToggle = document.getElementById('modular-system-toggle');
        if (modularToggle) {
            modularToggle.addEventListener('change', (e) => {
                this.toggleModularSystem(e.target.checked);
            });
        }
        
        // Test prompt generation
        const testPromptBtn = document.getElementById('test-prompt-btn');
        if (testPromptBtn) {
            testPromptBtn.addEventListener('click', () => {
                this.testPromptGeneration();
            });
        }
        
        // Compare systems
        const compareBtn = document.getElementById('compare-systems-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.compareSystemPerformance();
            });
        }
        
        // Refresh system stats
        const refreshStatsBtn = document.getElementById('refresh-stats-btn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => {
                this.refreshSystemStats();
            });
        }
    }
    
    /**
     * Load current system state
     */
    async loadSystemState() {
        try {
            const result = await this.apiClient.getSystemStats();
            
            if (result.success && result.data) {
                this.currentSystemState = result.data;
                this.updateSystemDisplay(result.data);
            }
            
        } catch (error) {
            console.error('[PromptTester] Failed to load system state:', error);
        }
    }
    
    /**
     * Toggle modular system
     */
    async toggleModularSystem(enabled) {
        try {
            this.updateToggleState('loading');
            
            const result = await this.apiClient.toggleModularSystem(enabled);
            
            if (result.success) {
                this.currentSystemState = result.data;
                this.updateSystemDisplay(result.data);
                this.updateToggleState('success');
                
                // Show success message
                this.showMessage(
                    `Modular system ${enabled ? 'enabled' : 'disabled'} successfully`,
                    'success'
                );
            } else {
                this.updateToggleState('error');
                this.showMessage('Failed to toggle modular system', 'error');
            }
            
        } catch (error) {
            console.error('[PromptTester] Failed to toggle modular system:', error);
            this.updateToggleState('error');
            this.showMessage('Error toggling modular system: ' + error.message, 'error');
        }
    }
    
    /**
     * Test prompt generation
     */
    async testPromptGeneration() {
        const outputDiv = document.getElementById('prompt-test-output');
        if (!outputDiv) return;
        
        try {
            // Show loading state
            outputDiv.innerHTML = `
                <div class="wg-debug-loading">
                    <div class="loading-spinner"></div>
                    <p>Testing prompt generation...</p>
                </div>
            `;
            
            // Collect test parameters
            const testParams = this.collectPromptTestParams();
            
            // Run test
            const result = await this.apiClient.testPromptGeneration(testParams);
            
            if (result.success && result.data) {
                this.displayPromptTestResults(result.data, outputDiv);
                this.testHistory.push({
                    timestamp: Date.now(),
                    params: testParams,
                    result: result.data
                });
            } else {
                this.displayPromptTestError(result.data || 'Test failed', outputDiv);
            }
            
        } catch (error) {
            console.error('[PromptTester] Prompt test failed:', error);
            this.displayPromptTestError(error.message, outputDiv);
        }
    }
    
    /**
     * Compare system performance
     */
    async compareSystemPerformance() {
        const outputDiv = document.getElementById('comparison-output');
        if (!outputDiv) return;
        
        try {
            // Show loading state
            outputDiv.innerHTML = `
                <div class="wg-debug-loading">
                    <div class="loading-spinner"></div>
                    <p>Comparing system performance...</p>
                </div>
            `;
            
            // Run comparison test
            const result = await this.apiClient.compareSystemPerformance();
            
            if (result.success && result.data) {
                this.displayComparisonResults(result.data, outputDiv);
            } else {
                this.displayComparisonError(result.data || 'Comparison failed', outputDiv);
            }
            
        } catch (error) {
            console.error('[PromptTester] Comparison failed:', error);
            this.displayComparisonError(error.message, outputDiv);
        }
    }
    
    /**
     * Refresh system statistics
     */
    async refreshSystemStats() {
        try {
            const result = await this.apiClient.getSystemStats();
            
            if (result.success && result.data) {
                this.currentSystemState = result.data;
                this.updateSystemDisplay(result.data);
                this.showMessage('System stats refreshed', 'success');
            }
            
        } catch (error) {
            console.error('[PromptTester] Failed to refresh stats:', error);
            this.showMessage('Failed to refresh system stats', 'error');
        }
    }
    
    /**
     * Collect prompt test parameters
     */
    collectPromptTestParams() {
        const form = document.getElementById('prompt-test-form');
        if (!form) return {};
        
        const formData = new FormData(form);
        
        return {
            duration: parseInt(formData.get('duration')) || 30,
            fitness_level: formData.get('fitness_level') || 'intermediate',
            goals: formData.get('goals') || 'strength',
            equipment: formData.get('equipment') || ['bodyweight'],
            use_modular: formData.get('use_modular') === 'on'
        };
    }
    
    /**
     * Update system display
     */
    updateSystemDisplay(systemData) {
        // Update modular system status
        const statusElement = document.getElementById('modular-status');
        if (statusElement) {
            statusElement.textContent = systemData.modular_active ? 'Active' : 'Inactive';
            statusElement.className = `status ${systemData.modular_active ? 'active' : 'inactive'}`;
        }
        
        // Update toggle switch
        const toggle = document.getElementById('modular-system-toggle');
        if (toggle) {
            toggle.checked = systemData.modular_active;
        }
        
        // Update performance metrics
        this.updatePerformanceMetrics(systemData.performance || {});
        
        // Update system info
        this.updateSystemInfo(systemData.system || {});
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(performance) {
        const metricsContainer = document.getElementById('performance-metrics');
        if (!metricsContainer) return;
        
        metricsContainer.innerHTML = `
            <div class="metric-item">
                <span class="metric-label">Average Response Time:</span>
                <span class="metric-value">${performance.avgResponseTime || 'N/A'}ms</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Success Rate:</span>
                <span class="metric-value">${performance.successRate || 'N/A'}%</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Total Requests:</span>
                <span class="metric-value">${performance.totalRequests || 0}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Cache Hit Rate:</span>
                <span class="metric-value">${performance.cacheHitRate || 'N/A'}%</span>
            </div>
        `;
    }
    
    /**
     * Update system information
     */
    updateSystemInfo(systemInfo) {
        const infoContainer = document.getElementById('system-info');
        if (!infoContainer) return;
        
        infoContainer.innerHTML = `
            <div class="info-item">
                <span class="info-label">System Version:</span>
                <span class="info-value">${systemInfo.version || 'Unknown'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">AI Provider:</span>
                <span class="info-value">${systemInfo.aiProvider || 'Unknown'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">${TestingLabUtils.formatTimestamp(systemInfo.lastUpdated)}</span>
            </div>
        `;
    }
    
    /**
     * Display prompt test results
     */
    displayPromptTestResults(data, outputDiv) {
        const html = `
            <div class="wg-debug-results">
                <div class="results-header">
                    <h4>✅ Prompt Generation Test Results</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                
                <!-- Test Parameters -->
                <div class="result-section">
                    <h5>🔧 Test Parameters</h5>
                    <div class="test-params">
                        <div class="param-item"><strong>System:</strong> ${data.system_type || 'Unknown'}</div>
                        <div class="param-item"><strong>Duration:</strong> ${data.duration || 'N/A'} minutes</div>
                        <div class="param-item"><strong>Fitness Level:</strong> ${data.fitness_level || 'N/A'}</div>
                        <div class="param-item"><strong>Goals:</strong> ${data.goals || 'N/A'}</div>
                        <div class="param-item"><strong>Equipment:</strong> ${Array.isArray(data.equipment) ? data.equipment.join(', ') : 'N/A'}</div>
                    </div>
                </div>
                
                <!-- Performance Metrics -->
                <div class="result-section">
                    <h5>📊 Performance Metrics</h5>
                    <div class="performance-metrics">
                        <div class="metric-item">
                            <span class="metric-label">Generation Time:</span>
                            <span class="metric-value">${data.generation_time || 0}ms</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Prompt Length:</span>
                            <span class="metric-value">${data.prompt_length || 0} characters</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Context Blocks:</span>
                            <span class="metric-value">${data.context_blocks || 0}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Generated Prompt -->
                <div class="result-section">
                    <h5>📝 Generated Prompt</h5>
                    <div class="prompt-container">
                        <div class="prompt-header">
                            <span class="system-badge ${data.system_type}">${data.system_type || 'Unknown'} System</span>
                            <span class="length-badge">${data.prompt_length || 0} chars</span>
                        </div>
                        <pre class="prompt-content">${TestingLabUtils.escapeHtml(data.prompt || 'No prompt generated')}</pre>
                    </div>
                </div>
                
                <!-- System Context -->
                ${data.context ? `
                <div class="result-section">
                    <h5>🔍 System Context</h5>
                    <div class="context-details">
                        <pre>${TestingLabUtils.escapeHtml(JSON.stringify(data.context, null, 2))}</pre>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Display prompt test error
     */
    displayPromptTestError(message, outputDiv) {
        const html = `
            <div class="wg-debug-error">
                <div class="error-header">
                    <h4>❌ Prompt Generation Test Failed</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                <div class="error-content">
                    <p><strong>Error:</strong> ${TestingLabUtils.escapeHtml(message)}</p>
                    <div class="error-suggestions">
                        <h5>Troubleshooting:</h5>
                        <ul>
                            <li>Check that the modular system is properly configured</li>
                            <li>Verify your AI provider settings</li>
                            <li>Check the browser console for additional errors</li>
                            <li>Try refreshing the system stats</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Display comparison results
     */
    displayComparisonResults(data, outputDiv) {
        const html = `
            <div class="wg-debug-results comparison-results">
                <div class="results-header">
                    <h4>⚖️ System Performance Comparison</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                
                <!-- Comparison Summary -->
                <div class="result-section">
                    <h5>📈 Performance Summary</h5>
                    <div class="comparison-summary">
                        <div class="winner-badge">
                            <span class="winner-label">Faster System:</span>
                            <span class="winner-value">${data.winner || 'Tie'}</span>
                        </div>
                        <div class="improvement-badge">
                            <span class="improvement-label">Performance Improvement:</span>
                            <span class="improvement-value">${data.improvement || '0'}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Side by Side Comparison -->
                <div class="result-section">
                    <h5>🔄 Side by Side Comparison</h5>
                    <div class="comparison-grid">
                        <div class="system-comparison legacy">
                            <h6>Legacy System</h6>
                            <div class="system-metrics">
                                <div class="metric">
                                    <span>Response Time:</span>
                                    <span>${data.legacy?.responseTime || 'N/A'}ms</span>
                                </div>
                                <div class="metric">
                                    <span>Prompt Length:</span>
                                    <span>${data.legacy?.promptLength || 'N/A'} chars</span>
                                </div>
                                <div class="metric">
                                    <span>Memory Usage:</span>
                                    <span>${data.legacy?.memoryUsage || 'N/A'}MB</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="system-comparison modular">
                            <h6>Modular System</h6>
                            <div class="system-metrics">
                                <div class="metric">
                                    <span>Response Time:</span>
                                    <span>${data.modular?.responseTime || 'N/A'}ms</span>
                                </div>
                                <div class="metric">
                                    <span>Prompt Length:</span>
                                    <span>${data.modular?.promptLength || 'N/A'} chars</span>
                                </div>
                                <div class="metric">
                                    <span>Memory Usage:</span>
                                    <span>${data.modular?.memoryUsage || 'N/A'}MB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Display comparison error
     */
    displayComparisonError(message, outputDiv) {
        const html = `
            <div class="wg-debug-error">
                <div class="error-header">
                    <h4>❌ System Comparison Failed</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                <div class="error-content">
                    <p><strong>Error:</strong> ${TestingLabUtils.escapeHtml(message)}</p>
                </div>
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Update toggle state
     */
    updateToggleState(state) {
        const toggle = document.getElementById('modular-system-toggle');
        const statusElement = document.getElementById('toggle-status');
        
        if (toggle) {
            toggle.disabled = state === 'loading';
        }
        
        if (statusElement) {
            statusElement.className = `toggle-status ${state}`;
            
            const statusText = {
                'loading': 'Updating...',
                'success': 'Updated',
                'error': 'Error'
            };
            
            statusElement.textContent = statusText[state] || '';
        }
    }
    
    /**
     * Setup prompt comparison
     */
    setupPromptComparison() {
        // Initialize any comparison-specific UI elements
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create a simple toast/notification
        const notification = document.createElement('div');
        notification.className = `prompt-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * Get test history
     */
    getTestHistory() {
        return [...this.testHistory];
    }
    
    /**
     * Clear test history
     */
    clearTestHistory() {
        this.testHistory = [];
    }
} 