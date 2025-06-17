/**
 * Admin Testing Lab - Frontend JavaScript
 * 
 * Provides interactive testing interface for workout generation debugging,
 * real-time log streaming, performance monitoring, and comprehensive testing tools.
 */

class AdminTestingLab {
    constructor() {
        this.isInitialized = false;
        this.logStream = null;
        this.performanceMonitor = null;
        this.testResults = new Map();
        this.activeTests = new Set();
        
        // Configuration - Updated for WordPress AJAX
        this.config = {
            ajaxUrl: window.ajaxurl || '/wp-admin/admin-ajax.php',
            nonce: window.fitcopilotData?.nonce || '',
            refreshInterval: 2000, // 2 seconds
            maxLogEntries: 1000,
            autoRefresh: true
        };
        
        this.init();
    }
    
    /**
     * Initialize the Testing Lab
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🧪 Initializing Admin Testing Lab...');
        
        this.setupEventListeners();
        this.initializeComponents();
        this.startLogStream();
        this.loadSystemStats();
        
        this.isInitialized = true;
        console.log('✅ Admin Testing Lab initialized successfully');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Test execution buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-test-action]')) {
                e.preventDefault();
                this.handleTestAction(e.target);
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.testing-lab-form')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });
        
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('.testing-lab-tab')) {
                e.preventDefault();
                this.switchTab(e.target);
            }
        });
        
        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.config.autoRefresh = e.target.checked;
                if (this.config.autoRefresh) {
                    this.startLogStream();
                } else {
                    this.stopLogStream();
                }
            });
        }
        
        // Clear logs button
        const clearLogsBtn = document.getElementById('clear-logs-btn');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => this.clearLogs());
        }
        
        // Export logs button
        const exportLogsBtn = document.getElementById('export-logs-btn');
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', () => this.exportLogs());
        }
    }
    
    /**
     * Initialize components
     */
    initializeComponents() {
        this.initializeWorkoutTester();
        this.initializePromptTester();
        this.initializeContextValidator();
        this.initializePerformanceMonitor();
        this.initializeSystemLogs();
    }
    
    /**
     * Initialize workout tester
     */
    initializeWorkoutTester() {
        const workoutForm = document.getElementById('workout-test-form');
        if (!workoutForm) return;
        
        // Add preset test scenarios
        this.addPresetScenarios();
        
        // Initialize form validation
        this.setupFormValidation(workoutForm);
    }
    
    /**
     * Initialize prompt tester
     */
    initializePromptTester() {
        const promptForm = document.getElementById('prompt-test-form');
        if (!promptForm) return;
        
        // Add prompt templates
        this.addPromptTemplates();
        
        // Setup prompt preview
        this.setupPromptPreview();
    }
    
    /**
     * Initialize context validator
     */
    initializeContextValidator() {
        const contextForm = document.getElementById('context-validation-form');
        if (!contextForm) return;
        
        // Add context examples
        this.addContextExamples();
        
        // Setup real-time validation
        this.setupRealTimeValidation();
    }
    
    /**
     * Initialize performance monitor
     */
    initializePerformanceMonitor() {
        this.performanceMonitor = new PerformanceMonitor();
        this.loadPerformanceMetrics();
    }
    
    /**
     * Initialize system logs
     */
    initializeSystemLogs() {
        const logsContainer = document.getElementById('system-logs-container');
        if (!logsContainer) return;
        
        // Setup log filtering
        this.setupLogFiltering();
        
        // Setup log level controls
        this.setupLogLevelControls();
    }
    
    /**
     * Handle test action
     */
    async handleTestAction(button) {
        const action = button.dataset.testAction;
        const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.activeTests.add(testId);
        this.updateTestStatus(button, 'running');
        
        try {
            let result;
            
            switch (action) {
                case 'test-workout-generation':
                    result = await this.testWorkoutGeneration(testId);
                    break;
                case 'test-prompt-building':
                    result = await this.testPromptBuilding(testId);
                    break;
                case 'validate-context':
                    result = await this.validateContext(testId);
                    break;
                case 'test-performance':
                    result = await this.testPerformance(testId);
                    break;
                default:
                    throw new Error(`Unknown test action: ${action}`);
            }
            
            this.testResults.set(testId, result);
            this.displayTestResult(testId, result);
            this.updateTestStatus(button, 'success');
            
        } catch (error) {
            console.error(`Test ${action} failed:`, error);
            this.displayTestError(testId, error);
            this.updateTestStatus(button, 'error');
        } finally {
            this.activeTests.delete(testId);
        }
    }
    
    /**
     * Test workout generation
     */
    async testWorkoutGeneration(testId) {
        const form = document.getElementById('workout-test-form');
        const formData = new FormData(form);
        
        const testData = {
            duration: parseInt(formData.get('duration')) || 30,
            fitness_level: formData.get('fitness_level') || 'intermediate',
            goals: formData.get('goals') || 'strength',
            equipment: formData.getAll('equipment') || [],
            restrictions: formData.getAll('restrictions') || [],
            stress_level: formData.get('stress_level') || 'moderate',
            energy_level: formData.get('energy_level') || 'moderate',
            sleep_quality: formData.get('sleep_quality') || 'good'
        };
        
        const startTime = performance.now();
        
        const response = await this.apiRequest('debug_test_workout', {
            test_id: testId,
            test_data: testData,
            include_debug: true
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        return {
            test_id: testId,
            test_type: 'workout_generation',
            duration_ms: Math.round(duration),
            test_data: testData,
            response: response,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Test prompt building
     */
    async testPromptBuilding(testId) {
        const form = document.getElementById('prompt-test-form');
        const formData = new FormData(form);
        
        const testData = {
            prompt_type: formData.get('prompt_type') || 'workout_generation',
            context_data: this.parseJsonSafely(formData.get('context_data')) || {},
            strategy: formData.get('strategy') || 'single_workout',
            include_fragments: formData.get('include_fragments') === 'on'
        };
        
        const response = await this.apiRequest('debug_test_prompt', {
            test_id: testId,
            test_data: testData
        });
        
        return {
            test_id: testId,
            test_type: 'prompt_building',
            test_data: testData,
            response: response,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Validate context
     */
    async validateContext(testId) {
        const form = document.getElementById('context-validation-form');
        const formData = new FormData(form);
        
        const contextData = this.parseJsonSafely(formData.get('context_data')) || {};
        const validationType = formData.get('validation_type') || 'workout_generation';
        
        const response = await this.apiRequest('debug_validate_context', {
            test_id: testId,
            context_data: contextData,
            validation_type: validationType
        });
        
        return {
            test_id: testId,
            test_type: 'context_validation',
            context_data: contextData,
            validation_type: validationType,
            response: response,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Test performance
     */
    async testPerformance(testId) {
        const iterations = 5;
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            
            const response = await this.apiRequest('debug_performance_test', {
                test_id: `${testId}_${i}`,
                iteration: i + 1
            });
            
            const endTime = performance.now();
            
            results.push({
                iteration: i + 1,
                duration_ms: Math.round(endTime - startTime),
                response: response
            });
        }
        
        return {
            test_id: testId,
            test_type: 'performance',
            iterations: iterations,
            results: results,
            average_duration: Math.round(results.reduce((sum, r) => sum + r.duration_ms, 0) / iterations),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Start log stream
     */
    startLogStream() {
        if (this.logStream) {
            clearInterval(this.logStream);
        }
        
        if (!this.config.autoRefresh) return;
        
        this.logStream = setInterval(() => {
            this.refreshLogs();
        }, this.config.refreshInterval);
        
        // Initial load
        this.refreshLogs();
    }
    
    /**
     * Stop log stream
     */
    stopLogStream() {
        if (this.logStream) {
            clearInterval(this.logStream);
            this.logStream = null;
        }
    }
    
    /**
     * Refresh logs
     */
    async refreshLogs() {
        try {
            const response = await this.apiRequest('debug_get_logs', {});
            
            if (response.success) {
                this.updateLogsDisplay(response.data.logs || []);
                this.updateSystemStats(response.data.stats || {});
            }
        } catch (error) {
            console.error('Failed to refresh logs:', error);
        }
    }
    
    /**
     * Update logs display
     */
    updateLogsDisplay(logs) {
        const logsContainer = document.getElementById('logs-content');
        if (!logsContainer) return;
        
        // Clear existing logs if we have too many
        const existingLogs = logsContainer.querySelectorAll('.log-entry');
        if (existingLogs.length > this.config.maxLogEntries) {
            const toRemove = existingLogs.length - this.config.maxLogEntries + logs.length;
            for (let i = 0; i < toRemove; i++) {
                existingLogs[i].remove();
            }
        }
        
        // Add new logs
        logs.forEach(log => {
            const logElement = this.createLogElement(log);
            logsContainer.appendChild(logElement);
        });
        
        // Auto-scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    /**
     * Create log element
     */
    createLogElement(log) {
        const logElement = document.createElement('div');
        logElement.className = `log-entry log-level-${log.level}`;
        logElement.innerHTML = `
            <div class="log-timestamp">${this.formatTimestamp(log.timestamp)}</div>
            <div class="log-level">${log.level.toUpperCase()}</div>
            <div class="log-category">${log.category || 'GENERAL'}</div>
            <div class="log-message">${this.escapeHtml(log.message)}</div>
            ${log.context ? `<div class="log-context">${this.formatContext(log.context)}</div>` : ''}
        `;
        
        return logElement;
    }
    
    /**
     * Display test result
     */
    displayTestResult(testId, result) {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;
        
        const resultElement = document.createElement('div');
        resultElement.className = 'test-result';
        resultElement.innerHTML = `
            <div class="test-result-header">
                <h4>Test: ${result.test_type}</h4>
                <span class="test-id">${testId}</span>
                <span class="test-timestamp">${this.formatTimestamp(result.timestamp)}</span>
            </div>
            <div class="test-result-content">
                ${this.formatTestResult(result)}
            </div>
        `;
        
        resultsContainer.insertBefore(resultElement, resultsContainer.firstChild);
    }
    
    /**
     * Format test result
     */
    formatTestResult(result) {
        let html = '';
        
        switch (result.test_type) {
            case 'workout_generation':
                html = this.formatWorkoutGenerationResult(result);
                break;
            case 'prompt_building':
                html = this.formatPromptBuildingResult(result);
                break;
            case 'context_validation':
                html = this.formatContextValidationResult(result);
                break;
            case 'performance':
                html = this.formatPerformanceResult(result);
                break;
            default:
                html = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        }
        
        return html;
    }
    
    /**
     * Format workout generation result
     */
    formatWorkoutGenerationResult(result) {
        const response = result.response;
        
        return `
            <div class="result-section">
                <h5>Test Parameters</h5>
                <ul>
                    <li><strong>Duration:</strong> ${result.test_data.duration} minutes</li>
                    <li><strong>Fitness Level:</strong> ${result.test_data.fitness_level}</li>
                    <li><strong>Goals:</strong> ${result.test_data.goals}</li>
                    <li><strong>Equipment:</strong> ${result.test_data.equipment.join(', ') || 'None'}</li>
                </ul>
            </div>
            <div class="result-section">
                <h5>Performance</h5>
                <ul>
                    <li><strong>Duration:</strong> ${result.duration_ms}ms</li>
                    <li><strong>Status:</strong> ${response.success ? '✅ Success' : '❌ Failed'}</li>
                </ul>
            </div>
            <div class="result-section">
                <h5>Response</h5>
                <pre class="response-data">${JSON.stringify(response, null, 2)}</pre>
            </div>
        `;
    }
    
    /**
     * Format prompt building result
     */
    formatPromptBuildingResult(result) {
        const response = result.response;
        
        return `
            <div class="result-section">
                <h5>Prompt Configuration</h5>
                <ul>
                    <li><strong>Type:</strong> ${result.test_data.prompt_type}</li>
                    <li><strong>Strategy:</strong> ${result.test_data.strategy}</li>
                    <li><strong>Include Fragments:</strong> ${result.test_data.include_fragments ? 'Yes' : 'No'}</li>
                </ul>
            </div>
            <div class="result-section">
                <h5>Generated Prompt</h5>
                <pre class="prompt-content">${response.data?.prompt || 'No prompt generated'}</pre>
            </div>
        `;
    }
    
    /**
     * Format context validation result
     */
    formatContextValidationResult(result) {
        const response = result.response;
        const validation = response.data?.validation || {};
        
        return `
            <div class="result-section">
                <h5>Validation Summary</h5>
                <ul>
                    <li><strong>Valid:</strong> ${validation.is_valid ? '✅ Yes' : '❌ No'}</li>
                    <li><strong>Completeness Score:</strong> ${validation.completeness_score || 0}%</li>
                    <li><strong>Errors:</strong> ${validation.errors?.length || 0}</li>
                    <li><strong>Warnings:</strong> ${validation.warnings?.length || 0}</li>
                </ul>
            </div>
            ${validation.errors?.length ? `
                <div class="result-section">
                    <h5>Errors</h5>
                    <ul class="validation-errors">
                        ${validation.errors.map(error => `<li>${error.message}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${validation.recommendations?.length ? `
                <div class="result-section">
                    <h5>Recommendations</h5>
                    <ul class="validation-recommendations">
                        ${validation.recommendations.map(rec => `<li>${rec.message}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }
    
    /**
     * Format performance result
     */
    formatPerformanceResult(result) {
        return `
            <div class="result-section">
                <h5>Performance Summary</h5>
                <ul>
                    <li><strong>Iterations:</strong> ${result.iterations}</li>
                    <li><strong>Average Duration:</strong> ${result.average_duration}ms</li>
                    <li><strong>Min Duration:</strong> ${Math.min(...result.results.map(r => r.duration_ms))}ms</li>
                    <li><strong>Max Duration:</strong> ${Math.max(...result.results.map(r => r.duration_ms))}ms</li>
                </ul>
            </div>
            <div class="result-section">
                <h5>Individual Results</h5>
                <table class="performance-table">
                    <thead>
                        <tr>
                            <th>Iteration</th>
                            <th>Duration (ms)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.results.map(r => `
                            <tr>
                                <td>${r.iteration}</td>
                                <td>${r.duration_ms}</td>
                                <td>${r.response?.success ? '✅' : '❌'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    /**
     * Update test status
     */
    updateTestStatus(button, status) {
        button.classList.remove('running', 'success', 'error');
        button.classList.add(status);
        
        const originalText = button.dataset.originalText || button.textContent;
        button.dataset.originalText = originalText;
        
        switch (status) {
            case 'running':
                button.textContent = 'Running...';
                button.disabled = true;
                break;
            case 'success':
                button.textContent = '✅ Success';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                    button.classList.remove('success');
                }, 2000);
                break;
            case 'error':
                button.textContent = '❌ Error';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                    button.classList.remove('error');
                }, 2000);
                break;
        }
    }
    
    /**
     * Make AJAX request to WordPress admin-ajax.php
     */
    async apiRequest(action, data = {}) {
        const url = this.config.ajaxUrl;
        
        // Create FormData for WordPress AJAX
        const formData = new FormData();
        formData.append('action', `fitcopilot_${action}`);
        formData.append('nonce', this.config.nonce);
        
        // Add data fields
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'object' && data[key] !== null) {
                formData.append(key, JSON.stringify(data[key]));
            } else {
                formData.append(key, data[key]);
            }
        });
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * Utility methods
     */
    parseJsonSafely(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('Failed to parse JSON:', error);
            return null;
        }
    }
    
    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatContext(context) {
        if (typeof context === 'object') {
            return `<pre>${JSON.stringify(context, null, 2)}</pre>`;
        }
        return this.escapeHtml(String(context));
    }
    
    // Additional helper methods for UI components
    addPresetScenarios() {
        // Implementation for adding preset test scenarios
    }
    
    setupFormValidation(form) {
        // Implementation for form validation
    }
    
    addPromptTemplates() {
        // Implementation for adding prompt templates
    }
    
    setupPromptPreview() {
        // Implementation for prompt preview
    }
    
    addContextExamples() {
        // Implementation for adding context examples
    }
    
    setupRealTimeValidation() {
        // Implementation for real-time validation
    }
    
    loadPerformanceMetrics() {
        // Implementation for loading performance metrics
    }
    
    setupLogFiltering() {
        // Implementation for log filtering
    }
    
    setupLogLevelControls() {
        // Implementation for log level controls
    }
    
    async loadSystemStats() {
        try {
            const response = await this.apiRequest('debug_get_system_stats', {});
            
            if (response.success) {
                this.updateSystemStats(response.data || {});
            }
        } catch (error) {
            console.error('Failed to load system stats:', error);
        }
    }
    
    updateSystemStats(stats) {
        // Update system stats display elements
        const statsContainer = document.getElementById('system-stats');
        if (statsContainer && stats) {
            const statsHtml = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Requests:</span>
                        <span class="stat-value">${stats.total_requests || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Success Rate:</span>
                        <span class="stat-value">${stats.success_rate || '0%'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Response Time:</span>
                        <span class="stat-value">${stats.avg_response_time || 0}ms</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Active Tests:</span>
                        <span class="stat-value">${this.activeTests.size}</span>
                    </div>
                </div>
            `;
            statsContainer.innerHTML = statsHtml;
        }
    }
    
    switchTab(tabElement) {
        // Implementation for tab switching
    }
    
    handleFormSubmission(form) {
        // Implementation for form submission handling
    }
    
    displayTestError(testId, error) {
        // Implementation for displaying test errors
    }
    
    async clearLogs() {
        try {
            const response = await this.apiRequest('debug_clear_logs', {});
            
            if (response.success) {
                // Clear the logs display
                const logsContainer = document.getElementById('logs-content');
                if (logsContainer) {
                    logsContainer.innerHTML = '';
                }
                
                console.log('✅ Logs cleared successfully');
            } else {
                console.error('❌ Failed to clear logs:', response.data);
            }
        } catch (error) {
            console.error('❌ Error clearing logs:', error);
        }
    }
    
    async exportLogs() {
        try {
            const format = 'json'; // Default format
            const response = await this.apiRequest('export_logs', {
                format: format
            });
            
            if (response.success && response.data.export_data) {
                // Create download link
                const blob = new Blob([response.data.export_data], { 
                    type: format === 'json' ? 'application/json' : 'text/plain'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fitcopilot-logs-${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                console.log('✅ Logs exported successfully');
            } else {
                console.error('❌ Failed to export logs:', response.data);
            }
        } catch (error) {
            console.error('❌ Error exporting logs:', error);
        }
    }
}

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }
    
    start(operationName) {
        this.startTimes.set(operationName, performance.now());
    }
    
    end(operationName) {
        const startTime = this.startTimes.get(operationName);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.metrics.set(operationName, duration);
            this.startTimes.delete(operationName);
            return duration;
        }
        return null;
    }
    
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
    
    reset() {
        this.metrics.clear();
        this.startTimes.clear();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.testing-lab-container')) {
        window.adminTestingLab = new AdminTestingLab();
    }
}); 