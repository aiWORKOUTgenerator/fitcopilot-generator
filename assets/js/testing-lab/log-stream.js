/**
 * Testing Lab Log Stream Module
 * 
 * Handles real-time log streaming and log management
 */

import { TestingLabUtils } from './config.js';

export class LogStream {
    constructor(apiClient, config) {
        this.apiClient = apiClient;
        this.config = config;
        this.isStreaming = false;
        this.streamInterval = null;
        this.logEntries = [];
        this.maxEntries = config.get('maxLogEntries', 1000);
        this.filters = {
            level: 'all',
            category: 'all'
        };
    }
    
    /**
     * Initialize log stream
     */
    initialize() {
        this.setupEventListeners();
        this.setupLogFiltering();
        this.setupLogLevelControls();
        
        if (this.config.get('autoRefresh')) {
            this.start();
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.config.set('autoRefresh', e.target.checked);
                if (e.target.checked) {
                    this.start();
                } else {
                    this.stop();
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
        
        // Log level filter
        const logLevelFilter = document.getElementById('log-level-filter');
        if (logLevelFilter) {
            logLevelFilter.addEventListener('change', (e) => {
                this.filters.level = e.target.value;
                this.refreshDisplay();
            });
        }
        
        // Log category filter
        const logCategoryFilter = document.getElementById('log-category-filter');
        if (logCategoryFilter) {
            logCategoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.refreshDisplay();
            });
        }
    }
    
    /**
     * Start log streaming
     */
    start() {
        if (this.isStreaming) return;
        
        this.isStreaming = true;
        this.updateStreamStatus('connected');
        
        // Initial load
        this.refreshLogs();
        
        // Set up periodic refresh
        this.streamInterval = setInterval(() => {
            this.refreshLogs();
        }, this.config.get('refreshInterval', 2000));
        
        if (this.config.get('debug')) {
            console.log('[LogStream] Started streaming');
        }
    }
    
    /**
     * Stop log streaming
     */
    stop() {
        if (!this.isStreaming) return;
        
        this.isStreaming = false;
        this.updateStreamStatus('disconnected');
        
        if (this.streamInterval) {
            clearInterval(this.streamInterval);
            this.streamInterval = null;
        }
        
        if (this.config.get('debug')) {
            console.log('[LogStream] Stopped streaming');
        }
    }
    
    /**
     * Refresh logs from server
     */
    async refreshLogs() {
        try {
            const result = await this.apiClient.getLogs(this.filters);
            
            if (result.success && result.data) {
                this.updateLogs(result.data.logs || []);
                this.updateLogStats(result.data.stats || {});
            }
            
        } catch (error) {
            console.error('[LogStream] Failed to refresh logs:', error);
            this.updateStreamStatus('error');
        }
    }
    
    /**
     * Update log entries
     */
    updateLogs(newLogs) {
        // Add new logs to the beginning
        this.logEntries = [...newLogs, ...this.logEntries];
        
        // Trim to max entries
        if (this.logEntries.length > this.maxEntries) {
            this.logEntries = this.logEntries.slice(0, this.maxEntries);
        }
        
        this.refreshDisplay();
    }
    
    /**
     * Refresh display with current filters
     */
    refreshDisplay() {
        const filteredLogs = this.filterLogs(this.logEntries);
        this.updateLogsDisplay(filteredLogs);
    }
    
    /**
     * Filter logs based on current filters
     */
    filterLogs(logs) {
        return logs.filter(log => {
            // Level filter
            if (this.filters.level !== 'all' && log.level !== this.filters.level) {
                return false;
            }
            
            // Category filter
            if (this.filters.category !== 'all' && log.category !== this.filters.category) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Update logs display
     */
    updateLogsDisplay(logs) {
        const container = document.getElementById('logs-container');
        if (!container) return;
        
        container.innerHTML = logs.map(log => this.createLogElement(log)).join('');
        
        // Auto-scroll to top for new entries
        container.scrollTop = 0;
    }
    
    /**
     * Create log element HTML
     */
    createLogElement(log) {
        const timestamp = TestingLabUtils.formatTimestamp(log.timestamp);
        const levelClass = `log-level-${log.level}`;
        const message = TestingLabUtils.escapeHtml(log.message);
        const context = log.context ? TestingLabUtils.formatContext(log.context) : '';
        
        return `
            <div class="log-entry ${levelClass}" data-level="${log.level}" data-category="${log.category}">
                <div class="log-header">
                    <span class="log-timestamp">${timestamp}</span>
                    <span class="log-level">${log.level.toUpperCase()}</span>
                    <span class="log-category">${log.category}</span>
                </div>
                <div class="log-message">${message}</div>
                ${context ? `<div class="log-context">${context}</div>` : ''}
            </div>
        `;
    }
    
    /**
     * Update stream status indicator
     */
    updateStreamStatus(status) {
        const indicator = document.querySelector('.stream-indicator');
        const statusText = document.querySelector('.stream-status span');
        
        if (indicator) {
            indicator.className = `stream-indicator ${status}`;
        }
        
        if (statusText) {
            const statusMap = {
                'connected': 'Connected',
                'disconnected': 'Disconnected',
                'error': 'Error'
            };
            statusText.textContent = statusMap[status] || status;
        }
    }
    
    /**
     * Update log statistics
     */
    updateLogStats(stats) {
        // Update any log statistics display
        const statsContainer = document.getElementById('log-stats');
        if (statsContainer && stats) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Total Logs:</span>
                    <span class="stat-value">${stats.total || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Errors:</span>
                    <span class="stat-value">${stats.errors || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Warnings:</span>
                    <span class="stat-value">${stats.warnings || 0}</span>
                </div>
            `;
        }
    }
    
    /**
     * Clear logs
     */
    async clearLogs() {
        try {
            const result = await this.apiClient.clearLogs();
            
            if (result.success) {
                this.logEntries = [];
                this.refreshDisplay();
                
                // Show success message
                this.showMessage('Logs cleared successfully', 'success');
            } else {
                this.showMessage('Failed to clear logs', 'error');
            }
            
        } catch (error) {
            console.error('[LogStream] Failed to clear logs:', error);
            this.showMessage('Error clearing logs: ' + error.message, 'error');
        }
    }
    
    /**
     * Export logs
     */
    async exportLogs() {
        try {
            const format = 'json'; // Could be made configurable
            const result = await this.apiClient.exportLogs(format, this.filters);
            
            if (result.success && result.data) {
                this.downloadLogs(result.data.export_data, format);
                this.showMessage('Logs exported successfully', 'success');
            } else {
                this.showMessage('Failed to export logs', 'error');
            }
            
        } catch (error) {
            console.error('[LogStream] Failed to export logs:', error);
            this.showMessage('Error exporting logs: ' + error.message, 'error');
        }
    }
    
    /**
     * Download exported logs
     */
    downloadLogs(data, format) {
        const blob = new Blob([data], { 
            type: format === 'json' ? 'application/json' : 'text/plain' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitcopilot-logs-${new Date().toISOString().slice(0, 10)}.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Setup log filtering
     */
    setupLogFiltering() {
        // Initialize filter controls if they exist
        const levelFilter = document.getElementById('log-level-filter');
        const categoryFilter = document.getElementById('log-category-filter');
        
        if (levelFilter) {
            levelFilter.value = this.filters.level;
        }
        
        if (categoryFilter) {
            categoryFilter.value = this.filters.category;
        }
    }
    
    /**
     * Setup log level controls
     */
    setupLogLevelControls() {
        // Add any additional log level control setup
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create a simple toast/notification
        const notification = document.createElement('div');
        notification.className = `log-notification ${type}`;
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
     * Get current log statistics
     */
    getStats() {
        return {
            totalEntries: this.logEntries.length,
            isStreaming: this.isStreaming,
            filters: { ...this.filters }
        };
    }
    
    /**
     * Set filters
     */
    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.refreshDisplay();
    }
} 