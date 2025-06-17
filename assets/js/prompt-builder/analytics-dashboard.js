/**
 * PromptBuilder Analytics Dashboard - Phase 2 Week 1
 * 
 * Comprehensive analytics visualization for prompt performance, quality metrics,
 * A/B testing, and multi-provider comparison. Integrates with existing PromptBuilder architecture.
 */

import { TestingLabUtils } from '../testing-lab/config.js';

export class PromptAnalyticsDashboard {
    constructor(config, apiClient) {
        this.config = config;
        this.apiClient = apiClient;
        this.dashboardData = null;
        this.refreshInterval = null;
        this.charts = {};
        
        // Chart.js will be loaded dynamically
        this.chartLib = null;
    }
    
    /**
     * Initialize the analytics dashboard
     */
    async initialize() {
        console.log('[PromptAnalytics] Initializing dashboard...');
        
        try {
            // Load Chart.js library
            await this.loadChartLibrary();
            
            // Setup dashboard HTML
            this.setupDashboardHTML();
            
            // Load initial data
            await this.refreshDashboard();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start auto-refresh if enabled
            if (this.config.get('autoRefresh')) {
                this.startAutoRefresh();
            }
            
            console.log('[PromptAnalytics] Dashboard initialized successfully');
            
        } catch (error) {
            console.error('[PromptAnalytics] Failed to initialize dashboard:', error);
            this.showError('Failed to initialize analytics dashboard: ' + error.message);
        }
    }
    
    /**
     * Load Chart.js library dynamically
     */
    async loadChartLibrary() {
        if (window.Chart) {
            this.chartLib = window.Chart;
            return;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
            script.onload = () => {
                this.chartLib = window.Chart;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Chart.js'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Setup dashboard HTML structure
     */
    setupDashboardHTML() {
        const container = document.getElementById('analytics-dashboard');
        if (!container) {
            console.error('[PromptAnalytics] Dashboard container not found');
            return;
        }
        
        container.innerHTML = `
            <div class="analytics-dashboard">
                <!-- Dashboard Header -->
                <div class="dashboard-header">
                    <h3>📊 Prompt Analytics Dashboard</h3>
                    <div class="dashboard-controls">
                        <select id="analytics-time-range" class="time-range-selector">
                            <option value="1 day">Last 24 Hours</option>
                            <option value="7 days" selected>Last 7 Days</option>
                            <option value="30 days">Last 30 Days</option>
                            <option value="90 days">Last 90 Days</option>
                        </select>
                        <button id="refresh-analytics" class="button button-secondary">
                            🔄 Refresh
                        </button>
                        <button id="toggle-auto-refresh" class="button button-secondary">
                            ⏱️ Auto-Refresh: <span id="auto-refresh-status">Off</span>
                        </button>
                    </div>
                </div>
                
                <!-- Key Metrics Cards -->
                <div class="metrics-grid">
                    <div class="metric-card" id="total-generations-card">
                        <div class="metric-icon">🎯</div>
                        <div class="metric-content">
                            <div class="metric-value" id="total-generations">-</div>
                            <div class="metric-label">Total Generations</div>
                        </div>
                    </div>
                    
                    <div class="metric-card" id="avg-quality-card">
                        <div class="metric-icon">⭐</div>
                        <div class="metric-content">
                            <div class="metric-value" id="avg-quality-score">-</div>
                            <div class="metric-label">Avg Quality Score</div>
                        </div>
                    </div>
                    
                    <div class="metric-card" id="avg-performance-card">
                        <div class="metric-icon">⚡</div>
                        <div class="metric-content">
                            <div class="metric-value" id="avg-performance">-</div>
                            <div class="metric-label">Avg Generation Time</div>
                        </div>
                    </div>
                    
                    <div class="metric-card" id="success-rate-card">
                        <div class="metric-icon">✅</div>
                        <div class="metric-content">
                            <div class="metric-value" id="success-rate">-</div>
                            <div class="metric-label">Success Rate</div>
                        </div>
                    </div>
                </div>
                
                <!-- Charts Section -->
                <div class="charts-grid">
                    <!-- Quality Trends Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>📈 Quality Trends</h4>
                            <div class="chart-legend" id="quality-legend"></div>
                        </div>
                        <canvas id="quality-trends-chart"></canvas>
                    </div>
                    
                    <!-- Performance Metrics Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h4>⚡ Performance Metrics</h4>
                            <div class="chart-legend" id="performance-legend"></div>
                        </div>
                        <canvas id="performance-chart"></canvas>
                    </div>
                    
                    <!-- Provider Comparison Chart -->
                    <div class="chart-container full-width">
                        <div class="chart-header">
                            <h4>🏆 Provider Comparison</h4>
                            <div class="provider-controls">
                                <button id="compare-providers-btn" class="button button-primary">
                                    🔄 Run Live Comparison
                                </button>
                                <select id="comparison-metric">
                                    <option value="quality">Quality Score</option>
                                    <option value="performance">Generation Time</option>
                                    <option value="cost">Estimated Cost</option>
                                </select>
                            </div>
                        </div>
                        <canvas id="provider-comparison-chart"></canvas>
                    </div>
                </div>
                
                <!-- A/B Testing Section -->
                <div class="ab-testing-section">
                    <div class="section-header">
                        <h4>🧪 A/B Testing</h4>
                        <button id="create-ab-test-btn" class="button button-primary">
                            ➕ Create A/B Test
                        </button>
                    </div>
                    <div id="ab-tests-container" class="ab-tests-container">
                        <!-- A/B tests will be loaded here -->
                    </div>
                </div>
                
                <!-- Recommendations Section -->
                <div class="recommendations-section">
                    <div class="section-header">
                        <h4>💡 Recommendations</h4>
                    </div>
                    <div id="recommendations-container" class="recommendations-container">
                        <!-- Recommendations will be loaded here -->
                    </div>
                </div>
                
                <!-- Loading and Error States -->
                <div id="analytics-loading" class="analytics-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Loading analytics data...</p>
                </div>
                
                <div id="analytics-error" class="analytics-error" style="display: none;">
                    <p class="error-message"></p>
                    <button class="button button-secondary" onclick="window.promptAnalytics.refreshDashboard()">
                        🔄 Retry
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Time range selector
        const timeRangeSelector = document.getElementById('analytics-time-range');
        if (timeRangeSelector) {
            timeRangeSelector.addEventListener('change', () => {
                this.refreshDashboard();
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-analytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
        
        // Auto-refresh toggle
        const autoRefreshBtn = document.getElementById('toggle-auto-refresh');
        if (autoRefreshBtn) {
            autoRefreshBtn.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
        }
        
        // Provider comparison
        const compareBtn = document.getElementById('compare-providers-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.runProviderComparison();
            });
        }
        
        // A/B test creation
        const createABTestBtn = document.getElementById('create-ab-test-btn');
        if (createABTestBtn) {
            createABTestBtn.addEventListener('click', () => {
                this.showCreateABTestModal();
            });
        }
        
        // Comparison metric selector
        const comparisonMetric = document.getElementById('comparison-metric');
        if (comparisonMetric) {
            comparisonMetric.addEventListener('change', () => {
                this.updateProviderComparisonChart();
            });
        }
    }
    
    /**
     * Refresh dashboard data
     */
    async refreshDashboard() {
        this.showLoading(true);
        
        try {
            const timeRange = document.getElementById('analytics-time-range')?.value || '7 days';
            
            // Fetch dashboard data from API
            const response = await this.apiClient.request('fitcopilot_analytics_get_dashboard', {
                time_range: timeRange,
                include_trends: true,
                include_comparisons: true
            });
            
            if (response.success && response.data) {
                this.dashboardData = response.data;
                this.updateDashboard(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch analytics data');
            }
            
        } catch (error) {
            console.error('[PromptAnalytics] Failed to refresh dashboard:', error);
            this.showError('Failed to load analytics data: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Update dashboard with new data
     */
    updateDashboard(data) {
        console.log('[PromptAnalytics] Updating dashboard with data:', data);
        
        // Update key metrics
        this.updateKeyMetrics(data.performance_metrics || {});
        
        // Update charts
        this.updateQualityTrendsChart(data.quality_trends || []);
        this.updatePerformanceChart(data.performance_metrics || {});
        this.updateProviderComparisonChart(data.provider_comparison || []);
        
        // Update A/B tests
        this.updateABTestsSection(data.active_ab_tests || []);
        
        // Update recommendations
        this.updateRecommendations(data.recommendations || []);
        
        // Hide error state
        this.showError(null);
    }
    
    /**
     * Update key metrics cards
     */
    updateKeyMetrics(metrics) {
        // Total generations
        const totalElement = document.getElementById('total-generations');
        if (totalElement) {
            totalElement.textContent = this.formatNumber(metrics.total_generations || 0);
        }
        
        // Average quality score
        const qualityElement = document.getElementById('avg-quality-score');
        const qualityCard = document.getElementById('avg-quality-card');
        if (qualityElement && qualityCard) {
            const score = parseFloat(metrics.avg_personalization || 0);
            qualityElement.textContent = score.toFixed(1) + '%';
            qualityCard.className = 'metric-card ' + this.getQualityClass(score);
        }
        
        // Average performance
        const performanceElement = document.getElementById('avg-performance');
        const performanceCard = document.getElementById('avg-performance-card');
        if (performanceElement && performanceCard) {
            const time = parseFloat(metrics.avg_generation_time || 0);
            performanceElement.textContent = time.toFixed(0) + 'ms';
            performanceCard.className = 'metric-card ' + this.getPerformanceClass(time);
        }
        
        // Success rate
        const successElement = document.getElementById('success-rate');
        if (successElement) {
            const successRate = this.calculateSuccessRate(metrics);
            successElement.textContent = successRate.toFixed(1) + '%';
        }
    }
    
    /**
     * Update quality trends chart
     */
    updateQualityTrendsChart(trendsData) {
        const canvas = document.getElementById('quality-trends-chart');
        if (!canvas || !this.chartLib) return;
        
        // Destroy existing chart
        if (this.charts.qualityTrends) {
            this.charts.qualityTrends.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        // Prepare data
        const labels = trendsData.map(item => new Date(item.date).toLocaleDateString());
        const datasets = [
            {
                label: 'Personalization',
                data: trendsData.map(item => parseFloat(item.avg_personalization || 0)),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            },
            {
                label: 'Completeness',
                data: trendsData.map(item => parseFloat(item.avg_completeness || 0)),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            },
            {
                label: 'Clarity',
                data: trendsData.map(item => parseFloat(item.avg_clarity || 0)),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4
            }
        ];
        
        this.charts.qualityTrends = new this.chartLib(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update performance chart
     */
    updatePerformanceChart(metrics) {
        const canvas = document.getElementById('performance-chart');
        if (!canvas || !this.chartLib) return;
        
        // Destroy existing chart
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        const data = {
            labels: ['Generation Time', 'Token Count', 'Quality Score'],
            datasets: [{
                label: 'Performance Metrics',
                data: [
                    parseFloat(metrics.avg_generation_time || 0),
                    parseFloat(metrics.avg_tokens || 0) / 10, // Scale down for visualization
                    parseFloat(metrics.avg_personalization || 0)
                ],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',   // Red for time
                    'rgba(59, 130, 246, 0.7)',  // Blue for tokens
                    'rgba(16, 185, 129, 0.7)'   // Green for quality
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)'
                ],
                borderWidth: 2
            }]
        };
        
        this.charts.performance = new this.chartLib(ctx, {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    /**
     * Update provider comparison chart
     */
    updateProviderComparisonChart(comparisonData = null) {
        const canvas = document.getElementById('provider-comparison-chart');
        if (!canvas || !this.chartLib) return;
        
        // Use provided data or existing dashboard data
        const providerData = comparisonData || this.dashboardData?.provider_comparison || [];
        
        if (providerData.length === 0) {
            canvas.style.display = 'none';
            return;
        }
        
        canvas.style.display = 'block';
        
        // Destroy existing chart
        if (this.charts.providerComparison) {
            this.charts.providerComparison.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        const metric = document.getElementById('comparison-metric')?.value || 'quality';
        
        // Prepare data based on selected metric
        const labels = providerData.map(item => item.provider_name || item.name);
        let data, label, color;
        
        switch (metric) {
            case 'performance':
                data = providerData.map(item => parseFloat(item.avg_time || item.generation_time_ms || 0));
                label = 'Generation Time (ms)';
                color = 'rgba(239, 68, 68, 0.7)';
                break;
            case 'cost':
                data = providerData.map(item => parseFloat(item.avg_cost || item.estimated_cost || 0));
                label = 'Estimated Cost ($)';
                color = 'rgba(245, 158, 11, 0.7)';
                break;
            case 'quality':
            default:
                data = providerData.map(item => parseFloat(item.avg_quality || item.quality_score || 0));
                label = 'Quality Score (%)';
                color = 'rgba(16, 185, 129, 0.7)';
                break;
        }
        
        this.charts.providerComparison = new this.chartLib(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: color,
                    borderColor: color.replace('0.7', '1'),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    /**
     * Run live provider comparison
     */
    async runProviderComparison() {
        const compareBtn = document.getElementById('compare-providers-btn');
        if (compareBtn) {
            compareBtn.disabled = true;
            compareBtn.textContent = '🔄 Running Comparison...';
        }
        
        try {
            // Use sample workout parameters for comparison
            const testParams = {
                duration: 30,
                fitness_level: 'intermediate',
                goals: 'strength',
                equipment: ['dumbbells']
            };
            
            const response = await this.apiClient.request('fitcopilot_multi_provider_compare', {
                test_params: JSON.stringify(testParams),
                providers: ['openai'] // Will expand as more providers are added
            });
            
            if (response.success && response.data) {
                this.updateProviderComparisonChart(Object.values(response.data).filter(item => item.success));
                this.showMessage('Provider comparison completed successfully', 'success');
            } else {
                throw new Error(response.data?.message || 'Provider comparison failed');
            }
            
        } catch (error) {
            console.error('[PromptAnalytics] Provider comparison failed:', error);
            this.showMessage('Provider comparison failed: ' + error.message, 'error');
        } finally {
            if (compareBtn) {
                compareBtn.disabled = false;
                compareBtn.textContent = '🔄 Run Live Comparison';
            }
        }
    }
    
    /**
     * Update A/B tests section
     */
    updateABTestsSection(abTests) {
        const container = document.getElementById('ab-tests-container');
        if (!container) return;
        
        if (abTests.length === 0) {
            container.innerHTML = `
                <div class="no-ab-tests">
                    <p>🧪 No active A/B tests</p>
                    <p>Create an A/B test to compare different prompt strategies or configurations.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = abTests.map(test => `
            <div class="ab-test-card" data-test-id="${test.test_id}">
                <div class="ab-test-header">
                    <h5>${TestingLabUtils.escapeHtml(test.test_name)}</h5>
                    <span class="ab-test-status status-${test.status}">${test.status}</span>
                </div>
                <div class="ab-test-content">
                    <p class="ab-test-description">${TestingLabUtils.escapeHtml(test.description || 'No description')}</p>
                    <div class="ab-test-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(test.current_sample_size / test.target_sample_size) * 100}%"></div>
                        </div>
                        <span class="progress-text">${test.current_sample_size}/${test.target_sample_size} samples</span>
                    </div>
                </div>
                <div class="ab-test-actions">
                    <button class="button button-small" onclick="window.promptAnalytics.viewABTestResults('${test.test_id}')">
                        📊 View Results
                    </button>
                    <button class="button button-small button-secondary" onclick="window.promptAnalytics.stopABTest('${test.test_id}')">
                        ⏹️ Stop Test
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Update recommendations section
     */
    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendations-container');
        if (!container) return;
        
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="no-recommendations">
                    <p>✅ No recommendations at this time</p>
                    <p>Your prompt system is performing well!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card priority-${rec.priority}">
                <div class="recommendation-header">
                    <div class="recommendation-icon">${this.getRecommendationIcon(rec.type)}</div>
                    <div class="recommendation-priority">${rec.priority.toUpperCase()}</div>
                </div>
                <div class="recommendation-content">
                    <p class="recommendation-message">${TestingLabUtils.escapeHtml(rec.message)}</p>
                    ${rec.action ? `<button class="button button-small" onclick="window.promptAnalytics.executeRecommendation('${rec.action}')">Take Action</button>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Helper methods
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    getQualityClass(score) {
        if (score >= 80) return 'quality-excellent';
        if (score >= 60) return 'quality-good';
        if (score >= 40) return 'quality-fair';
        return 'quality-poor';
    }
    
    getPerformanceClass(time) {
        if (time <= 500) return 'performance-excellent';
        if (time <= 1000) return 'performance-good';
        if (time <= 2000) return 'performance-fair';
        return 'performance-poor';
    }
    
    calculateSuccessRate(metrics) {
        const total = parseFloat(metrics.total_generations || 0);
        const successful = parseFloat(metrics.successful_generations || total); // Assume all successful if not specified
        return total > 0 ? (successful / total) * 100 : 0;
    }
    
    getRecommendationIcon(type) {
        const icons = {
            'performance': '⚡',
            'quality': '⭐',
            'strategy': '🎯',
            'cost': '💰',
            'error': '⚠️'
        };
        return icons[type] || '💡';
    }
    
    /**
     * UI State Management
     */
    showLoading(show) {
        const loading = document.getElementById('analytics-loading');
        const dashboard = document.querySelector('.analytics-dashboard');
        
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
        if (dashboard) {
            dashboard.style.opacity = show ? '0.5' : '1';
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('analytics-error');
        const dashboard = document.querySelector('.analytics-dashboard');
        
        if (errorDiv) {
            if (message) {
                errorDiv.querySelector('.error-message').textContent = message;
                errorDiv.style.display = 'block';
                if (dashboard) dashboard.style.display = 'none';
            } else {
                errorDiv.style.display = 'none';
                if (dashboard) dashboard.style.display = 'block';
            }
        }
    }
    
    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `analytics-toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    /**
     * Auto-refresh functionality
     */
    toggleAutoRefresh() {
        const statusSpan = document.getElementById('auto-refresh-status');
        
        if (this.refreshInterval) {
            // Stop auto-refresh
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            this.config.set('autoRefresh', false);
            if (statusSpan) statusSpan.textContent = 'Off';
        } else {
            // Start auto-refresh
            this.refreshInterval = setInterval(() => {
                this.refreshDashboard();
            }, this.config.get('refreshInterval', 30000)); // 30 seconds default
            
            this.config.set('autoRefresh', true);
            if (statusSpan) statusSpan.textContent = 'On';
        }
    }
    
    startAutoRefresh() {
        if (!this.refreshInterval) {
            this.toggleAutoRefresh();
        }
    }
    
    /**
     * A/B Testing methods (to be implemented)
     */
    showCreateABTestModal() {
        // TODO: Implement A/B test creation modal
        console.log('[PromptAnalytics] A/B test creation not yet implemented');
        this.showMessage('A/B test creation coming soon!', 'info');
    }
    
    viewABTestResults(testId) {
        // TODO: Implement A/B test results viewer
        console.log('[PromptAnalytics] Viewing A/B test results:', testId);
        this.showMessage('A/B test results viewer coming soon!', 'info');
    }
    
    stopABTest(testId) {
        // TODO: Implement A/B test stopping
        console.log('[PromptAnalytics] Stopping A/B test:', testId);
        this.showMessage('A/B test stopping coming soon!', 'info');
    }
    
    executeRecommendation(action) {
        // TODO: Implement recommendation actions
        console.log('[PromptAnalytics] Executing recommendation:', action);
        this.showMessage('Recommendation actions coming soon!', 'info');
    }
    
    /**
     * Cleanup on destroy
     */
    destroy() {
        // Stop auto-refresh
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Destroy all charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        console.log('[PromptAnalytics] Dashboard destroyed');
    }
}

// Make available globally for inline event handlers
window.promptAnalytics = null; 