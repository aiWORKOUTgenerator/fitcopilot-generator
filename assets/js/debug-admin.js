/**
 * FitCopilot Debug Admin Dashboard - JavaScript
 * 
 * Provides comprehensive functionality for the debug admin dashboard including
 * real-time log streaming, performance monitoring, response analysis, and system info
 */

(function($) {
    'use strict';

    // Global debug dashboard object
    window.FitCopilotDebug = {
        // Configuration
        config: {
            ajaxUrl: fitcopilotDebug.ajaxUrl,
            nonce: fitcopilotDebug.nonce,
            streamUrl: fitcopilotDebug.streamUrl,
            refreshInterval: fitcopilotDebug.refreshInterval || 5000,
            maxLogEntries: fitcopilotDebug.maxLogEntries || 1000
        },

        // State management
        state: {
            isStreaming: false,
            streamId: null,
            eventSource: null,
            logCount: 0,
            lastRefresh: Date.now(),
            performanceChart: null,
            autoRefresh: true
        },

        // Initialize dashboard
        initDashboard: function() {
            console.log('[FitCopilot Debug] Initializing dashboard...');
            
            this.bindEvents();
            this.initializeComponents();
            this.startAutoRefresh();
            
            console.log('[FitCopilot Debug] Dashboard initialized successfully');
        },

        // Bind event handlers
        bindEvents: function() {
            // Quick action buttons
            $('#clearLogsBtn').on('click', this.clearLogs.bind(this));
            $('#exportLogsBtn').on('click', this.exportLogs.bind(this));
            $('#startStreamBtn').on('click', this.startLogStream.bind(this));
            $('#refreshStatsBtn').on('click', this.refreshStats.bind(this));

            // Console controls
            $('#logLevelFilter, #categoryFilter').on('change', this.filterLogs.bind(this));
            $('#consoleFullscreen').on('click', this.toggleFullscreen.bind(this));

            // Live logs page controls
            $('#startStream').on('click', this.startLiveStream.bind(this));
            $('#stopStream').on('click', this.stopLiveStream.bind(this));
            $('#clearLogs').on('click', this.clearLogDisplay.bind(this));

            // Response analyzer
            $('#analyzeResponse').on('click', this.analyzeResponse.bind(this));

            // System info
            $('#downloadSystemInfo').on('click', this.downloadSystemInfo.bind(this));

            // Window events
            $(window).on('beforeunload', this.cleanup.bind(this));
            
            // Auto-refresh toggle
            $(document).on('keydown', function(e) {
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    FitCopilotDebug.refreshStats();
                }
            });
        },

        // Initialize components
        initializeComponents: function() {
            this.initPerformanceChart();
            this.loadInitialLogs();
            this.setupRealtimeUpdates();
        },

        // Initialize performance chart
        initPerformanceChart: function() {
            const canvas = document.getElementById('performanceChart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(0, 115, 170, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 115, 170, 0.05)');

            // Mock data for demonstration
            const data = {
                labels: ['5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'Now'],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [120, 135, 98, 142, 108, 95],
                    borderColor: '#0073aa',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            };

            // Simple canvas-based chart (fallback if Chart.js not available)
            this.drawSimpleChart(canvas, data);
        },

        // Draw simple performance chart
        drawSimpleChart: function(canvas, data) {
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Chart settings
            const padding = 40;
            const chartWidth = width - (padding * 2);
            const chartHeight = height - (padding * 2);
            
            // Get data values
            const values = data.datasets[0].data;
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            const valueRange = maxValue - minValue || 1;
            
            // Draw grid lines
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding + (i * chartHeight / 4);
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }
            
            // Draw data line
            ctx.strokeStyle = '#0073aa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            values.forEach((value, index) => {
                const x = padding + (index * chartWidth / (values.length - 1));
                const y = height - padding - ((value - minValue) / valueRange * chartHeight);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = '#0073aa';
            values.forEach((value, index) => {
                const x = padding + (index * chartWidth / (values.length - 1));
                const y = height - padding - ((value - minValue) / valueRange * chartHeight);
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // Draw labels
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            data.labels.forEach((label, index) => {
                const x = padding + (index * chartWidth / (data.labels.length - 1));
                ctx.fillText(label, x, height - 10);
            });
        },

        // Load initial logs
        loadInitialLogs: function() {
            this.ajaxRequest('fitcopilot_debug_logs', {
                level: 'all',
                category: 'all',
                limit: 50
            }).then(response => {
                if (response.success) {
                    this.displayLogs(response.data);
                }
            }).catch(error => {
                console.error('[FitCopilot Debug] Failed to load initial logs:', error);
            });
        },

        // Setup realtime updates
        setupRealtimeUpdates: function() {
            // Update metrics every 30 seconds
            setInterval(() => {
                if (this.state.autoRefresh) {
                    this.updateMetrics();
                }
            }, 30000);

            // Update activity feed every 10 seconds
            setInterval(() => {
                if (this.state.autoRefresh) {
                    this.updateActivityFeed();
                }
            }, 10000);
        },

        // Start auto refresh
        startAutoRefresh: function() {
            if (this.state.autoRefreshInterval) {
                clearInterval(this.state.autoRefreshInterval);
            }

            this.state.autoRefreshInterval = setInterval(() => {
                if (this.state.autoRefresh) {
                    this.refreshStats();
                }
            }, this.config.refreshInterval);
        },

        // Update metrics
        updateMetrics: function() {
            this.ajaxRequest('fitcopilot_debug_performance', {}).then(response => {
                if (response.success) {
                    this.updateMetricDisplay(response.data);
                }
            }).catch(error => {
                console.error('[FitCopilot Debug] Failed to update metrics:', error);
            });
        },

        // Update metric display
        updateMetricDisplay: function(metrics) {
            // Update memory usage
            $('.metric-value').each(function() {
                const $metric = $(this);
                const $label = $metric.siblings('.metric-label');
                
                if ($label.text().includes('Memory')) {
                    $metric.text(metrics.memory_usage + 'MB');
                } else if ($label.text().includes('Response')) {
                    $metric.text(metrics.avg_response_time + 'ms');
                }
            });
        },

        // Update activity feed
        updateActivityFeed: function() {
            this.ajaxRequest('fitcopilot_debug_logs', {
                level: 'all',
                category: 'all',
                since: Math.floor(this.state.lastRefresh / 1000),
                limit: 20
            }).then(response => {
                if (response.success && response.data.length > 0) {
                    this.prependActivityItems(response.data);
                    this.state.lastRefresh = Date.now();
                }
            }).catch(error => {
                console.error('[FitCopilot Debug] Failed to update activity feed:', error);
            });
        },

        // Prepend activity items
        prependActivityItems: function(logs) {
            const $activityList = $('.activity-list');
            
            logs.reverse().forEach(log => {
                const $item = $(`
                    <div class="activity-item level-${log.level} fade-in">
                        <div class="activity-time">${this.formatTime(log.timestamp)}</div>
                        <div class="activity-message">${this.escapeHtml(log.message)}</div>
                        <div class="activity-category">${log.category}</div>
                    </div>
                `);
                
                $activityList.prepend($item);
            });

            // Remove old items to maintain performance
            const $items = $activityList.children('.activity-item');
            if ($items.length > 100) {
                $items.slice(100).remove();
            }
        },

        // Clear logs
        clearLogs: function() {
            if (!confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
                return;
            }

            const $btn = $('#clearLogsBtn');
            const originalText = $btn.html();
            
            $btn.html('<span class="loading-spinner"></span> Clearing...').prop('disabled', true);

            this.ajaxRequest('fitcopilot_debug_clear_logs', {}).then(response => {
                if (response.success) {
                    $('.activity-list').empty();
                    $('#debugConsoleOutput').empty();
                    this.showNotification('Logs cleared successfully', 'success');
                } else {
                    this.showNotification('Failed to clear logs', 'error');
                }
            }).catch(error => {
                console.error('[FitCopilot Debug] Failed to clear logs:', error);
                this.showNotification('Failed to clear logs', 'error');
            }).finally(() => {
                $btn.html(originalText).prop('disabled', false);
            });
        },

        // Export logs
        exportLogs: function() {
            const $btn = $('#exportLogsBtn');
            const originalText = $btn.html();
            
            $btn.html('<span class="loading-spinner"></span> Exporting...').prop('disabled', true);

            this.ajaxRequest('fitcopilot_debug_export_logs', {
                format: 'json'
            }).then(response => {
                if (response.success) {
                    this.downloadFile(response.data.export_data, 'fitcopilot-debug-logs.json', 'application/json');
                    this.showNotification('Logs exported successfully', 'success');
                } else {
                    this.showNotification('Failed to export logs', 'error');
                }
            }).catch(error => {
                console.error('[FitCopilot Debug] Failed to export logs:', error);
                this.showNotification('Failed to export logs', 'error');
            }).finally(() => {
                $btn.html(originalText).prop('disabled', false);
            });
        },

        // Start log stream
        startLogStream: function() {
            if (this.state.isStreaming) {
                this.stopLogStream();
                return;
            }

            const $btn = $('#startStreamBtn');
            $btn.html('<span class="dashicons dashicons-controls-pause"></span> Stop Stream');

            this.ajaxRequest('fitcopilot_debug_stream', {
                stream_action: 'start',
                level: $('#logLevelFilter').val() || 'all',
                category: $('#categoryFilter').val() || 'all'
            }).then(response => {
                if (response.success) {
                    this.connectEventSource(response.data.stream_id);
                    this.state.isStreaming = true;
                    this.state.streamId = response.data.stream_id;
                    this.showNotification('Log stream started', 'success');
                } else {
                    this.showNotification('Failed to start log stream', 'error');
                    $btn.html('<span class="dashicons dashicons-controls-play"></span> Start Stream');
                }
            }).catch(error => {
                console.error('[FitCopilot Debug] Failed to start log stream:', error);
                this.showNotification('Failed to start log stream', 'error');
                $btn.html('<span class="dashicons dashicons-controls-play"></span> Start Stream');
            });
        },

        // Stop log stream
        stopLogStream: function() {
            if (!this.state.isStreaming) return;

            if (this.state.eventSource) {
                this.state.eventSource.close();
                this.state.eventSource = null;
            }

            if (this.state.streamId) {
                this.ajaxRequest('fitcopilot_debug_stream', {
                    stream_action: 'stop',
                    stream_id: this.state.streamId
                });
            }

            this.state.isStreaming = false;
            this.state.streamId = null;

            const $btn = $('#startStreamBtn');
            $btn.html('<span class="dashicons dashicons-controls-play"></span> Start Stream');

            this.showNotification('Log stream stopped', 'info');
        },

        // Connect to event source
        connectEventSource: function(streamId) {
            const url = `${this.config.streamUrl}/${streamId}`;
            
            this.state.eventSource = new EventSource(url);
            
            this.state.eventSource.onopen = () => {
                console.log('[FitCopilot Debug] Event source connected');
            };
            
            this.state.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleStreamMessage(data);
                } catch (error) {
                    console.error('[FitCopilot Debug] Failed to parse stream message:', error);
                }
            };
            
            this.state.eventSource.onerror = (error) => {
                console.error('[FitCopilot Debug] Event source error:', error);
                this.showNotification('Stream connection lost', 'warning');
                
                // Auto-reconnect after 5 seconds
                setTimeout(() => {
                    if (this.state.isStreaming) {
                        this.connectEventSource(streamId);
                    }
                }, 5000);
            };
        },

        // Handle stream message
        handleStreamMessage: function(data) {
            switch (data.type) {
                case 'connected':
                    console.log('[FitCopilot Debug] Stream connected:', data.stream_id);
                    break;
                    
                case 'log_batch':
                    this.displayStreamLogs(data.logs);
                    this.state.logCount += data.batch_size;
                    this.updateLogCount();
                    break;
                    
                case 'heartbeat':
                    this.updateStreamStatus(data);
                    break;
                    
                case 'error':
                    console.error('[FitCopilot Debug] Stream error:', data.message);
                    this.showNotification(`Stream error: ${data.message}`, 'error');
                    break;
                    
                case 'disconnected':
                    console.log('[FitCopilot Debug] Stream disconnected:', data.reason);
                    this.stopLogStream();
                    break;
            }
        },

        // Display stream logs
        displayStreamLogs: function(logs) {
            const $console = $('#debugConsoleOutput');
            
            logs.forEach(log => {
                const logLine = this.formatLogLine(log);
                $console.append(logLine + '\n');
            });

            // Auto-scroll to bottom
            $console.scrollTop($console[0].scrollHeight);

            // Limit console entries
            const lines = $console.text().split('\n');
            if (lines.length > this.config.maxLogEntries) {
                const trimmedLines = lines.slice(-this.config.maxLogEntries);
                $console.text(trimmedLines.join('\n'));
            }
        },

        // Format log line
        formatLogLine: function(log) {
            const timestamp = this.formatTime(log.timestamp);
            const level = log.level.toUpperCase().padEnd(7);
            const category = log.category.toUpperCase().padEnd(10);
            
            return `[${timestamp}] ${level} ${category} ${log.message}`;
        },

        // Update log count
        updateLogCount: function() {
            $('#logCount').text(`${this.state.logCount} logs`);
        },

        // Update stream status
        updateStreamStatus: function(data) {
            const $status = $('#streamStatus');
            if ($status.length) {
                $status.removeClass('disconnected').addClass('connected').text('Connected');
            }
        },

        // Start live stream (for live logs page)
        startLiveStream: function() {
            const level = $('#levelFilter').val() || 'all';
            const category = $('#categoryFilter').val() || 'all';
            
            this.ajaxRequest('fitcopilot_debug_stream', {
                stream_action: 'start',
                level: level,
                category: category
            }).then(response => {
                if (response.success) {
                    this.connectLiveEventSource(response.data.stream_id);
                    $('#streamStatus').removeClass('disconnected').addClass('connected').text('Connected');
                    $('#startStream').prop('disabled', true);
                    $('#stopStream').prop('disabled', false);
                }
            });
        },

        // Stop live stream
        stopLiveStream: function() {
            this.stopLogStream();
            $('#streamStatus').removeClass('connected').addClass('disconnected').text('Disconnected');
            $('#startStream').prop('disabled', false);
            $('#stopStream').prop('disabled', true);
        },

        // Connect live event source
        connectLiveEventSource: function(streamId) {
            this.connectEventSource(streamId);
            
            // Override message handler for live logs page
            if (this.state.eventSource) {
                this.state.eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'log_batch') {
                            this.displayLiveLogs(data.logs);
                        }
                    } catch (error) {
                        console.error('[FitCopilot Debug] Failed to parse live stream message:', error);
                    }
                };
            }
        },

        // Display live logs
        displayLiveLogs: function(logs) {
            const $container = $('#liveLogsContainer');
            
            logs.forEach(log => {
                const $logEntry = $(`
                    <div class="log-entry level-${log.level}">
                        <span class="log-timestamp">[${this.formatTime(log.timestamp)}]</span>
                        <span class="log-level">${log.level.toUpperCase()}</span>
                        <span class="log-category">${log.category}</span>
                        <span class="log-message">${this.escapeHtml(log.message)}</span>
                    </div>
                `);
                
                $container.append($logEntry);
            });

            // Auto-scroll and limit entries
            $container.scrollTop($container[0].scrollHeight);
            
            const $entries = $container.children('.log-entry');
            if ($entries.length > this.config.maxLogEntries) {
                $entries.slice(0, $entries.length - this.config.maxLogEntries).remove();
            }
        },

        // Clear log display
        clearLogDisplay: function() {
            $('#liveLogsContainer').empty();
            $('#debugConsoleOutput').empty();
            this.state.logCount = 0;
            this.updateLogCount();
        },

        // Filter logs
        filterLogs: function() {
            const level = $('#logLevelFilter').val();
            const category = $('#categoryFilter').val();
            
            // If streaming, restart with new filters
            if (this.state.isStreaming) {
                this.stopLogStream();
                setTimeout(() => {
                    this.startLogStream();
                }, 500);
            } else {
                // Load filtered logs
                this.loadFilteredLogs(level, category);
            }
        },

        // Load filtered logs
        loadFilteredLogs: function(level, category) {
            this.ajaxRequest('fitcopilot_debug_logs', {
                level: level || 'all',
                category: category || 'all',
                limit: 100
            }).then(response => {
                if (response.success) {
                    this.displayLogs(response.data);
                }
            });
        },

        // Display logs
        displayLogs: function(logs) {
            const $console = $('#debugConsoleOutput');
            $console.empty();
            
            logs.forEach(log => {
                const logLine = this.formatLogLine(log);
                $console.append(logLine + '\n');
            });
        },

        // Toggle fullscreen
        toggleFullscreen: function() {
            const $console = $('.debug-console');
            $console.toggleClass('fullscreen');
            
            const $btn = $('#consoleFullscreen');
            if ($console.hasClass('fullscreen')) {
                $btn.html('<span class="dashicons dashicons-fullscreen-exit-alt"></span>');
            } else {
                $btn.html('<span class="dashicons dashicons-fullscreen-alt"></span>');
            }
        },

        // Analyze response
        analyzeResponse: function() {
            const responseJson = $('#responseInput').val().trim();
            
            if (!responseJson) {
                this.showNotification('Please enter a response to analyze', 'warning');
                return;
            }

            const $btn = $('#analyzeResponse');
            const originalText = $btn.text();
            
            $btn.text('Analyzing...').prop('disabled', true);

            this.ajaxRequest('fitcopilot_debug_response', {
                response: responseJson
            }).then(response => {
                if (response.success) {
                    this.displayAnalysisResults(response.data);
                } else {
                    this.showNotification('Failed to analyze response', 'error');
                }
            }).catch(error => {
                console.error('[FitCopilot Debug] Failed to analyze response:', error);
                this.showNotification('Failed to analyze response', 'error');
            }).finally(() => {
                $btn.text(originalText).prop('disabled', false);
            });
        },

        // Display analysis results
        displayAnalysisResults: function(analysis) {
            const $results = $('#analysisResults');
            
            const formattedResults = JSON.stringify(analysis, null, 2);
            $results.text(formattedResults);
        },

        // Download system info
        downloadSystemInfo: function() {
            this.ajaxRequest('fitcopilot_debug_system_info', {}).then(response => {
                if (response.success) {
                    const systemInfo = JSON.stringify(response.data, null, 2);
                    this.downloadFile(systemInfo, 'fitcopilot-system-info.json', 'application/json');
                }
            });
        },

        // Refresh stats
        refreshStats: function() {
            const $btn = $('#refreshStatsBtn');
            const originalText = $btn.html();
            
            $btn.html('<span class="loading-spinner"></span> Refreshing...').prop('disabled', true);

            // Refresh all dashboard components
            Promise.all([
                this.updateMetrics(),
                this.updateActivityFeed()
            ]).finally(() => {
                $btn.html(originalText).prop('disabled', false);
                this.showNotification('Stats refreshed', 'success');
            });
        },

        // Utility functions
        ajaxRequest: function(action, data) {
            return $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: action,
                    nonce: this.config.nonce,
                    ...data
                },
                timeout: 30000
            });
        },

        downloadFile: function(content, filename, contentType) {
            const blob = new Blob([content], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },

        formatTime: function(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleTimeString();
        },

        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        showNotification: function(message, type) {
            // Create notification element
            const $notification = $(`
                <div class="debug-notification ${type} fade-in">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `);

            // Add to page
            if (!$('.debug-notifications').length) {
                $('body').append('<div class="debug-notifications"></div>');
            }
            
            $('.debug-notifications').append($notification);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                $notification.fadeOut(() => $notification.remove());
            }, 5000);

            // Manual close
            $notification.find('.notification-close').on('click', () => {
                $notification.fadeOut(() => $notification.remove());
            });
        },

        cleanup: function() {
            // Clean up event sources and intervals
            if (this.state.eventSource) {
                this.state.eventSource.close();
            }
            
            if (this.state.autoRefreshInterval) {
                clearInterval(this.state.autoRefreshInterval);
            }
            
            if (this.state.streamId) {
                // Attempt to stop stream
                this.ajaxRequest('fitcopilot_debug_stream', {
                    stream_action: 'stop',
                    stream_id: this.state.streamId
                });
            }
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        // Only initialize on debug pages
        if ($('.fitcopilot-debug-dashboard, .fitcopilot-debug-logs, .fitcopilot-debug-performance, .fitcopilot-debug-responses, .fitcopilot-debug-system').length) {
            FitCopilotDebug.initDashboard();
        }
    });

})(jQuery); 