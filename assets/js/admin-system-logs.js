/**
 * Sprint 3, Week 2: System Logs & Performance Monitoring Dashboard
 * Real-time log streaming and performance analytics interface
 */

class SystemLogsManager {
    constructor() {
        this.isStreamActive = false;
        this.currentStreamId = null;
        this.eventSource = null;
        this.logBuffer = [];
        this.maxLogEntries = 500;
        this.updateIntervals = {};
        this.currentFilters = {
            level: 'all',
            category: 'all',
            limit: 50
        };
        
        this.init();
    }
    
    /**
     * Initialize the System Logs Manager
     */
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startPerformanceUpdates();
        this.setupAutoRefresh();
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Stream control
        const streamButton = document.getElementById('toggle-stream');
        if (streamButton) {
            streamButton.addEventListener('click', () => this.toggleStream());
        }
        
        // Filter controls
        const levelFilter = document.getElementById('log-level-filter');
        const categoryFilter = document.getElementById('log-category-filter');
        
        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.currentFilters.level = e.target.value;
                this.applyFilters();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.applyFilters();
            });
        }
        
        // Export buttons
        document.querySelectorAll('.export-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.exportLogs(format);
            });
        });
        
        // Performance controls
        const refreshButton = document.getElementById('refresh-performance');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refreshPerformanceMetrics());
        }
        
        const clearButton = document.getElementById('clear-performance');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearPerformanceData());
        }
        
        // Chart controls
        document.querySelectorAll('.chart-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.switchChart(chartType);
            });
        });
        
        // Auto-scroll toggle
        const autoScrollToggle = document.getElementById('auto-scroll');
        if (autoScrollToggle) {
            autoScrollToggle.addEventListener('change', (e) => {
                this.autoScroll = e.target.checked;
            });
        }
    }
    
    /**
     * Load initial dashboard data
     */
    async loadInitialData() {
        try {
            this.showLoading('logs-content', true);
            await Promise.all([
                this.loadRecentLogs(),
                this.loadSystemHealth(),
                this.loadLogStatistics()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showAlert('Failed to load dashboard data', 'error');
        } finally {
            this.showLoading('logs-content', false);
        }
    }
    
    /**
     * Toggle log streaming
     */
    async toggleStream() {
        if (this.isStreamActive) {
            await this.stopStream();
        } else {
            await this.startStream();
        }
    }
    
    /**
     * Start real-time log streaming
     */
    async startStream() {
        try {
            this.showLoading('stream-controls', true);
            
            // Start stream via AJAX
            const response = await this.makeRequest('fitcopilot_start_log_stream', {
                level: this.currentFilters.level,
                category: this.currentFilters.category,
                since: Math.floor(Date.now() / 1000) - 3600, // Last hour
                limit: this.currentFilters.limit
            }, 'fitcopilot_log_stream');
            
            if (response.success) {
                this.currentStreamId = response.data.stream_id;
                this.setupServerSentEvents();
                this.updateStreamStatus(true);
                this.showAlert('Log streaming started successfully', 'success');
            } else {
                throw new Error(response.data.message || 'Failed to start stream');
            }
        } catch (error) {
            console.error('Failed to start stream:', error);
            this.showAlert('Failed to start log streaming: ' + error.message, 'error');
        } finally {
            this.showLoading('stream-controls', false);
        }
    }
    
    /**
     * Stop log streaming
     */
    async stopStream() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        
        this.currentStreamId = null;
        this.updateStreamStatus(false);
        this.showAlert('Log streaming stopped', 'info');
    }
    
    /**
     * Setup Server-Sent Events for real-time streaming
     */
    setupServerSentEvents() {
        if (!this.currentStreamId) return;
        
        // Note: In a real WordPress environment, you'd set up an endpoint for SSE
        // For now, we'll use polling as a fallback
        this.startPollingForLogs();
    }
    
    /**
     * Start polling for new logs (fallback for SSE)
     */
    startPollingForLogs() {
        this.updateIntervals.logPolling = setInterval(async () => {
            if (!this.isStreamActive) return;
            
            try {
                await this.pollForNewLogs();
            } catch (error) {
                console.error('Log polling error:', error);
            }
        }, 2000); // Poll every 2 seconds
    }
    
    /**
     * Poll for new logs
     */
    async pollForNewLogs() {
        try {
            const response = await this.makeRequest('fitcopilot_debug_get_logs', {}, 'fitcopilot_debug_logs');
            
            if (response.success && response.data.logs) {
                const newLogs = response.data.logs.slice(-10); // Get last 10 logs
                this.processNewLogs(newLogs);
            }
        } catch (error) {
            console.warn('Failed to poll for logs:', error);
        }
    }
    
    /**
     * Process new log entries
     */
    processNewLogs(logs) {
        logs.forEach(log => {
            if (!this.logBuffer.find(existingLog => existingLog.id === log.id)) {
                this.logBuffer.unshift(log);
                this.addLogEntry(log, true);
            }
        });
        
        // Maintain buffer size
        if (this.logBuffer.length > this.maxLogEntries) {
            this.logBuffer = this.logBuffer.slice(0, this.maxLogEntries);
            this.removeOldLogEntries();
        }
    }
    
    /**
     * Add log entry to the display
     */
    addLogEntry(log, isNew = false) {
        const logsContainer = document.getElementById('logs-container');
        if (!logsContainer) return;
        
        const logElement = this.createLogElement(log, isNew);
        logsContainer.insertBefore(logElement, logsContainer.firstChild);
        
        // Auto-scroll if enabled
        if (this.autoScroll) {
            logsContainer.scrollTop = 0;
        }
    }
    
    /**
     * Create log entry element
     */
    createLogElement(log, isNew = false) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry${isNew ? ' new-entry' : ''}`;
        logEntry.dataset.logId = log.id;
        logEntry.dataset.level = log.level;
        logEntry.dataset.category = log.category;
        
        const timestamp = new Date(log.timestamp * 1000).toLocaleString();
        const context = log.context ? JSON.stringify(log.context) : '';
        
        logEntry.innerHTML = `
            <div class="log-timestamp">${timestamp}</div>
            <div class="log-level ${log.level}">${log.level}</div>
            <div class="log-category">${log.category}</div>
            <div class="log-message">
                ${this.escapeHtml(log.message)}
                ${context ? `<div class="log-context">${this.escapeHtml(context)}</div>` : ''}
            </div>
        `;
        
        return logEntry;
    }
    
    /**
     * Apply current filters to log display
     */
    applyFilters() {
        const logEntries = document.querySelectorAll('.log-entry');
        
        logEntries.forEach(entry => {
            const level = entry.dataset.level;
            const category = entry.dataset.category;
            
            let visible = true;
            
            if (this.currentFilters.level !== 'all' && level !== this.currentFilters.level) {
                visible = false;
            }
            
            if (this.currentFilters.category !== 'all' && category !== this.currentFilters.category) {
                visible = false;
            }
            
            entry.style.display = visible ? 'flex' : 'none';
        });
        
        // If streaming is active, restart with new filters
        if (this.isStreamActive) {
            this.stopStream().then(() => this.startStream());
        }
    }
    
    /**
     * Load recent logs
     */
    async loadRecentLogs() {
        try {
            const response = await this.makeRequest('fitcopilot_debug_get_logs', {}, 'fitcopilot_debug_logs');
            
            if (response.success && response.data.logs) {
                this.logBuffer = response.data.logs;
                this.renderLogs(response.data.logs);
            }
        } catch (error) {
            console.error('Failed to load recent logs:', error);
        }
    }
    
    /**
     * Render logs in the display
     */
    renderLogs(logs) {
        const logsContainer = document.getElementById('logs-container');
        if (!logsContainer) return;
        
        logsContainer.innerHTML = '';
        
        logs.forEach(log => {
            const logElement = this.createLogElement(log);
            logsContainer.appendChild(logElement);
        });
    }
    
    /**
     * Load system health status
     */
    async loadSystemHealth() {
        try {
            const response = await this.makeRequest('fitcopilot_get_system_health', {}, 'fitcopilot_system_health');
            
            if (response.success) {
                this.updateSystemHealthDisplay(response.data);
            }
        } catch (error) {
            console.error('Failed to load system health:', error);
        }
    }
    
    /**
     * Update system health display
     */
    updateSystemHealthDisplay(healthData) {
        const healthIndicator = document.querySelector('.health-status');
        const healthIcon = document.querySelector('.health-indicator');
        
        if (healthIndicator && healthIcon) {
            // Remove existing status classes
            healthIndicator.className = 'health-status';
            healthIcon.className = 'health-indicator';
            
            // Add current status
            healthIndicator.classList.add(healthData.overall_status);
            healthIcon.classList.add(healthData.overall_status);
            
            healthIndicator.textContent = this.formatHealthStatus(healthData.overall_status);
        }
        
        // Update performance metrics
        this.updatePerformanceMetrics(healthData);
    }
    
    /**
     * Update performance metrics display
     */
    updatePerformanceMetrics(data) {
        // Memory usage
        const memoryElement = document.getElementById('memory-usage');
        if (memoryElement && data.memory) {
            memoryElement.querySelector('.metric-value').textContent = data.memory.usage_mb;
            memoryElement.querySelector('.metric-trend').textContent = 
                `${data.memory.percentage}% of ${data.memory.limit_mb}MB`;
        }
        
        // API performance
        const apiElement = document.getElementById('api-performance');
        if (apiElement && data.api_performance) {
            apiElement.querySelector('.metric-value').textContent = 
                Math.round(data.api_performance.avg_duration_ms);
            apiElement.querySelector('.metric-trend').textContent = 
                `${data.api_performance.total_calls} calls`;
        }
        
        // Error rate
        const errorElement = document.getElementById('error-rate');
        if (errorElement && data.error_rates) {
            errorElement.querySelector('.metric-value').textContent = 
                (data.error_rates.error_rate * 100).toFixed(1);
            errorElement.querySelector('.metric-trend').textContent = 
                `${data.error_rates.failed_operations}/${data.error_rates.total_operations}`;
        }
    }
    
    /**
     * Load log statistics
     */
    async loadLogStatistics() {
        try {
            const response = await this.makeRequest('fitcopilot_get_log_stats', {
                hours: 24
            }, 'fitcopilot_log_stats');
            
            if (response.success) {
                this.updateAnalyticsDisplay(response.data);
            }
        } catch (error) {
            console.error('Failed to load log statistics:', error);
        }
    }
    
    /**
     * Update analytics display
     */
    updateAnalyticsDisplay(statsData) {
        // This would typically update charts/graphs
        // For now, we'll just log the data
        console.log('Log Statistics:', statsData);
        
        // Update any analytics elements
        const totalLogsElement = document.getElementById('total-logs-24h');
        if (totalLogsElement) {
            totalLogsElement.textContent = statsData.total_logs || 0;
        }
    }
    
    /**
     * Export logs in specified format
     */
    async exportLogs(format) {
        try {
            this.showLoading('export-controls', true);
            
            const response = await this.makeRequest('fitcopilot_export_logs', {
                format: format,
                level: this.currentFilters.level,
                category: this.currentFilters.category,
                since: Math.floor(Date.now() / 1000) - (24 * 3600), // Last 24 hours
                until: Math.floor(Date.now() / 1000)
            }, 'fitcopilot_export_logs');
            
            if (response.success) {
                this.downloadExportedData(response.data.export_data, format);
                this.showAlert(`Logs exported successfully in ${format.toUpperCase()} format`, 'success');
            } else {
                throw new Error(response.data.message || 'Export failed');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showAlert('Failed to export logs: ' + error.message, 'error');
        } finally {
            this.showLoading('export-controls', false);
        }
    }
    
    /**
     * Download exported data
     */
    downloadExportedData(data, format) {
        const blob = new Blob([data], { 
            type: this.getMimeType(format) 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitcopilot-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Get MIME type for format
     */
    getMimeType(format) {
        const mimeTypes = {
            'json': 'application/json',
            'csv': 'text/csv',
            'xml': 'application/xml'
        };
        return mimeTypes[format] || 'text/plain';
    }
    
    /**
     * Refresh performance metrics
     */
    async refreshPerformanceMetrics() {
        await this.loadSystemHealth();
        this.showAlert('Performance metrics refreshed', 'success');
    }
    
    /**
     * Clear performance data
     */
    async clearPerformanceData() {
        if (!confirm('Are you sure you want to clear all performance data? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await this.makeRequest('fitcopilot_clear_performance_data', {}, 'fitcopilot_clear_performance');
            
            if (response.success) {
                this.showAlert('Performance data cleared successfully', 'success');
                await this.loadSystemHealth();
            } else {
                throw new Error(response.data.message || 'Clear operation failed');
            }
        } catch (error) {
            console.error('Failed to clear performance data:', error);
            this.showAlert('Failed to clear performance data: ' + error.message, 'error');
        }
    }
    
    /**
     * Start automatic performance updates
     */
    startPerformanceUpdates() {
        // Update system health every 30 seconds
        this.updateIntervals.systemHealth = setInterval(() => {
            this.loadSystemHealth();
        }, 30000);
        
        // Update log statistics every 5 minutes
        this.updateIntervals.logStats = setInterval(() => {
            this.loadLogStatistics();
        }, 300000);
    }
    
    /**
     * Setup auto-refresh
     */
    setupAutoRefresh() {
        // Refresh logs every 10 seconds if not streaming
        this.updateIntervals.logRefresh = setInterval(() => {
            if (!this.isStreamActive) {
                this.loadRecentLogs();
            }
        }, 10000);
    }
    
    /**
     * Update stream status display
     */
    updateStreamStatus(isActive) {
        this.isStreamActive = isActive;
        
        const streamButton = document.getElementById('toggle-stream');
        const streamIndicator = document.querySelector('.stream-indicator');
        const streamStatus = document.querySelector('.stream-status');
        
        if (streamButton) {
            streamButton.textContent = isActive ? 'Stop Stream' : 'Start Stream';
            streamButton.className = `stream-button ${isActive ? 'active' : ''}`;
        }
        
        if (streamIndicator) {
            streamIndicator.className = `stream-indicator ${isActive ? 'connected' : ''}`;
        }
        
        if (streamStatus) {
            streamStatus.textContent = isActive ? 'Connected' : 'Disconnected';
        }
    }
    
    /**
     * Switch chart display
     */
    switchChart(chartType) {
        // Update active button
        document.querySelectorAll('.chart-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');
        
        // Update chart display (placeholder for now)
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `<div>Chart: ${chartType}</div>`;
        }
    }
    
    /**
     * Remove old log entries to maintain performance
     */
    removeOldLogEntries() {
        const logEntries = document.querySelectorAll('.log-entry');
        for (let i = this.maxLogEntries; i < logEntries.length; i++) {
            logEntries[i].remove();
        }
    }
    
    /**
     * Show loading indicator
     */
    showLoading(containerId, show) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let overlay = container.querySelector('.loading-overlay');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'loading-overlay';
                overlay.innerHTML = `
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading...</div>
                `;
                container.style.position = 'relative';
                container.appendChild(overlay);
            }
        } else {
            if (overlay) {
                overlay.remove();
            }
        }
    }
    
    /**
     * Show alert notification
     */
    showAlert(message, type = 'info') {
        const alertsContainer = document.querySelector('.system-alerts') || this.createAlertsContainer();
        
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.innerHTML = `
            ${message}
            <button class="alert-close">&times;</button>
        `;
        
        alertsContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
        
        // Manual close
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.remove();
        });
    }
    
    /**
     * Create alerts container if it doesn't exist
     */
    createAlertsContainer() {
        const container = document.createElement('div');
        container.className = 'system-alerts';
        document.body.appendChild(container);
        return container;
    }
    
    /**
     * Format health status for display
     */
    formatHealthStatus(status) {
        const statusMap = {
            'healthy': 'System Healthy',
            'warning': 'Performance Warning',
            'critical': 'Critical Issues'
        };
        return statusMap[status] || 'Unknown Status';
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    /**
     * Make AJAX request to WordPress
     */
    async makeRequest(action, data = {}, nonce_action = null) {
        const formData = new FormData();
        formData.append('action', action);
        
        if (nonce_action && window.fitcopilot_admin) {
            formData.append('nonce', wp.ajax.generateNonce(nonce_action));
        }
        
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        
        const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    }
    
    /**
     * Cleanup when leaving page
     */
    cleanup() {
        // Clear all intervals
        Object.values(this.updateIntervals).forEach(interval => {
            clearInterval(interval);
        });
        
        // Close event source
        if (this.eventSource) {
            this.eventSource.close();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.fitcopilot-system-logs')) {
        window.systemLogsManager = new SystemLogsManager();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (window.systemLogsManager) {
                window.systemLogsManager.cleanup();
            }
        });
    }
}); 