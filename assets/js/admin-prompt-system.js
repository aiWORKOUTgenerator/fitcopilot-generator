/**
 * FitCopilot AI Prompt System - Admin Interface JavaScript
 * 
 * Comprehensive functionality for the AI Prompt System admin pages
 */

(function($) {
    'use strict';

    /**
     * Main FitCopilot Prompt System object
     */
    window.FitCopilotPromptSystem = {
        
        // Configuration
        config: {
            apiBase: '',
            nonce: '',
            adminUrl: '',
            version: '',
            debug: true
        },
        
        // Current page data
        currentPage: null,
        pageData: {},
        
        /**
         * Initialize the prompt system
         */
        init: function() {
            this.log('🚀 Initializing FitCopilot Prompt System');
            
            // Set configuration from localized data
            if (typeof fitcopilotPromptSystem !== 'undefined') {
                this.config = $.extend(this.config, fitcopilotPromptSystem);
            }
            
            // Initialize common functionality
            this.initCommonComponents();
            this.bindGlobalEvents();
            
            this.log('✅ FitCopilot Prompt System initialized');
        },
        
        /**
         * Initialize page-specific functionality
         */
        initPage: function(pageSlug) {
            this.currentPage = pageSlug;
            this.log(`📄 Initializing page: ${pageSlug}`);
            
            // Initialize page-specific functionality
            switch(pageSlug) {
                case 'ai-prompt-dashboard':
                    this.initAIPromptDashboard();
                    break;
                case 'prompt-dashboard':
                    this.initPromptDashboard();
                    break;
                case 'strategy-manager':
                    this.initStrategyManager();
                    break;
                case 'context-inspector':
                    this.initContextInspector();
                    break;
                case 'fragment-library':
                    this.initFragmentLibrary();
                    break;
                case 'testing-lab':
                    this.initTestingLab();
                    break;
                case 'system-logs':
                    this.initSystemLogs();
                    break;
                case 'ai-configuration':
                    this.initAIConfiguration();
                    break;
                case 'prompt-analytics':
                    this.initPromptAnalytics();
                    break;
                default:
                    this.log(`⚠️ Unknown page: ${pageSlug}`);
            }
        },
        
        /**
         * Initialize common components used across all pages
         */
        initCommonComponents: function() {
            this.log('🔧 Initializing common components');
            
            // Initialize tooltips
            this.initTooltips();
            
            // Initialize modals
            this.initModals();
            
            // Initialize notifications
            this.initNotifications();
            
            // Initialize API helper
            this.initAPIHelper();
        },
        
        /**
         * Bind global event handlers
         */
        bindGlobalEvents: function() {
            this.log('🔗 Binding global events');
            
            // Handle page navigation
            $(document).on('click', '.fitcopilot-nav-link', this.handleNavigation.bind(this));
            
            // Handle quick actions
            $(document).on('click', '.fitcopilot-quick-action', this.handleQuickAction.bind(this));
            
            // Handle refresh buttons
            $(document).on('click', '.fitcopilot-refresh', this.handleRefresh.bind(this));
            
            // Handle modal triggers
            $(document).on('click', '[data-fitcopilot-modal]', this.handleModalTrigger.bind(this));
        },
        
        // ========================================
        // PAGE-SPECIFIC INITIALIZERS
        // ========================================
        
        /**
         * Initialize AI Prompt Dashboard
         */
        initAIPromptDashboard: function() {
            this.log('🤖 Initializing AI Prompt Dashboard');
            
            // Load dashboard widgets
            this.loadDashboardWidgets();
            
            // Set up real-time updates
            this.setupRealTimeUpdates();
        },
        
        /**
         * Initialize Prompt Dashboard
         */
        initPromptDashboard: function() {
            this.log('📊 Initializing Prompt Dashboard');
            
            // Load performance metrics
            this.loadPerformanceMetrics();
            
            // Initialize charts
            this.initCharts();
        },
        
        /**
         * Initialize Strategy Manager
         */
        initStrategyManager: function() {
            this.log('⚙️ Initializing Strategy Manager');
            
            // Load strategies table
            this.loadStrategiesTable();
            
            // Initialize strategy editor
            this.initStrategyEditor();
        },
        
        /**
         * Initialize Context Inspector
         */
        initContextInspector: function() {
            this.log('🔍 Initializing Context Inspector');
            
            // Load context flow visualization
            this.loadContextFlow();
            
            // Set up real-time monitoring
            this.setupContextMonitoring();
        },
        
        /**
         * Initialize Fragment Library
         */
        initFragmentLibrary: function() {
            this.log('📚 Initializing Fragment Library');
            
            // Load fragment categories
            this.loadFragmentCategories();
            
            // Initialize fragment editor
            this.initFragmentEditor();
        },
        
        /**
         * Initialize Testing Lab
         */
        initTestingLab: function() {
            this.log('🧪 Initializing Testing Lab');
            
            // Initialize testing interface
            this.setupTestingInterface();
            
            // Bind testing events
            this.bindTestingEvents();
            this.initTestingInterface();
            
            // Load test presets
            this.loadTestPresets();
        },
        
        /**
         * Initialize System Logs
         */
        initSystemLogs: function() {
            this.log('📋 Initializing System Logs');
            
            // Load logs table
            this.loadLogsTable();
            
            // Set up auto-refresh
            this.setupLogAutoRefresh();
        },
        
        /**
         * Initialize AI Configuration
         */
        initAIConfiguration: function() {
            this.log('🔧 Initializing AI Configuration');
            
            // Load configuration form
            this.loadConfigurationForm();
            
            // Initialize connection testing
            this.initConnectionTesting();
        },
        
        /**
         * Initialize Prompt Analytics
         */
        initPromptAnalytics: function() {
            this.log('📈 Initializing Prompt Analytics');
            
            // Load analytics charts
            this.loadAnalyticsCharts();
            
            // Initialize date range picker
            this.initDateRangePicker();
        },
        
        // ========================================
        // COMMON COMPONENT METHODS
        // ========================================
        
        /**
         * Initialize tooltips
         */
        initTooltips: function() {
            // Check if jQuery UI tooltip is available
            if (typeof $.fn.tooltip !== 'undefined') {
                // Initialize jQuery UI tooltips
                $('.fitcopilot-tooltip').tooltip({
                    position: { my: "center bottom-20", at: "center top", using: function( position, feedback ) {
                        $( this ).css( position );
                        $( "<div>" )
                            .addClass( "arrow" )
                            .addClass( feedback.vertical )
                            .addClass( feedback.horizontal )
                            .appendTo( this );
                    }}
                });
                this.log('💬 jQuery UI tooltips initialized');
            } else {
                // Fallback to title attribute tooltips
                this.log('⚠️ jQuery UI tooltip not available, using title attributes');
            }
        },
        
        /**
         * Initialize modals
         */
        initModals: function() {
            // Modal functionality will be implemented here
            this.log('💬 Modals initialized');
        },
        
        /**
         * Initialize notifications
         */
        initNotifications: function() {
            // Notification system will be implemented here
            this.log('🔔 Notifications initialized');
        },
        
        /**
         * Initialize API helper
         */
        initAPIHelper: function() {
            // Set up API request defaults
            $.ajaxSetup({
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', window.FitCopilotPromptSystem.config.nonce);
                }
            });
            
            this.log('🌐 API helper initialized');
        },
        
        // ========================================
        // EVENT HANDLERS
        // ========================================
        
        /**
         * Handle navigation clicks
         */
        handleNavigation: function(e) {
            e.preventDefault();
            const target = $(e.currentTarget).attr('href');
            this.log(`🧭 Navigating to: ${target}`);
            window.location.href = target;
        },
        
        /**
         * Handle quick action clicks
         */
        handleQuickAction: function(e) {
            e.preventDefault();
            const action = $(e.currentTarget).data('action');
            this.log(`⚡ Quick action: ${action}`);
            
            switch(action) {
                case 'test-prompt':
                    this.testPrompt();
                    break;
                case 'view-analytics':
                    this.viewAnalytics();
                    break;
                case 'system-diagnostics':
                    this.runDiagnostics();
                    break;
                default:
                    this.log(`⚠️ Unknown action: ${action}`);
            }
        },
        
        /**
         * Handle refresh button clicks
         */
        handleRefresh: function(e) {
            e.preventDefault();
            const target = $(e.currentTarget).data('target');
            this.log(`🔄 Refreshing: ${target || 'page'}`);
            
            if (target) {
                this.refreshComponent(target);
            } else {
                this.refreshPage();
            }
        },
        
        /**
         * Handle modal trigger clicks
         */
        handleModalTrigger: function(e) {
            e.preventDefault();
            const modalId = $(e.currentTarget).data('fitcopilot-modal');
            this.log(`💬 Opening modal: ${modalId}`);
            this.openModal(modalId);
        },
        
        // ========================================
        // UTILITY METHODS
        // ========================================
        
        /**
         * Make API request
         */
        apiRequest: function(endpoint, data = {}, method = 'GET') {
            const url = `${this.config.apiBase}/${endpoint}`;
            
            return $.ajax({
                url: url,
                method: method,
                data: data,
                dataType: 'json'
            }).done((response) => {
                this.log(`✅ API success: ${endpoint}`, response);
            }).fail((xhr, status, error) => {
                this.log(`❌ API error: ${endpoint}`, { status, error, response: xhr.responseJSON });
                this.showNotification('API request failed', 'error');
            });
        },
        
        /**
         * Show notification
         */
        showNotification: function(message, type = 'info') {
            // WordPress admin notice
            const noticeClass = type === 'error' ? 'notice-error' : type === 'success' ? 'notice-success' : 'notice-info';
            const notice = $(`
                <div class="notice ${noticeClass} is-dismissible">
                    <p>${message}</p>
                </div>
            `);
            
            $('.wrap').first().prepend(notice);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                notice.fadeOut();
            }, 5000);
        },
        
        /**
         * Open modal
         */
        openModal: function(modalId) {
            // Modal implementation
            this.log(`💬 Modal opened: ${modalId}`);
        },
        
        /**
         * Refresh component
         */
        refreshComponent: function(componentId) {
            const $component = $(`#${componentId}`);
            
            // Show loading state
            $component.addClass('loading');
            
            // Reload component data
            this.log(`🔄 Refreshing component: ${componentId}`);
            
            // Simulate refresh (implement actual logic per component)
            setTimeout(() => {
                $component.removeClass('loading');
                this.showNotification('Component refreshed', 'success');
            }, 1000);
        },
        
        /**
         * Refresh entire page
         */
        refreshPage: function() {
            this.log('🔄 Refreshing page');
            location.reload();
        },
        
        /**
         * Debug logging
         */
        log: function(message, data = null) {
            if (this.config.debug) {
                if (data) {
                    console.log(`[FitCopilot Prompt System] ${message}`, data);
                } else {
                    console.log(`[FitCopilot Prompt System] ${message}`);
                }
            }
        },
        
        // ========================================
        // TESTING LAB METHODS
        // ========================================
        
        /**
         * Setup testing interface
         */
        setupTestingInterface: function() {
            this.log('🔧 Setting up testing interface');
            
            // Make testing functions globally available
            window.runPromptTest = this.runPromptTest.bind(this);
            window.runPerformanceComparison = this.runPerformanceComparison.bind(this);
            window.clearTestResults = this.clearTestResults.bind(this);
            window.getFormData = this.getFormData.bind(this);
            window.showLoading = this.showLoading.bind(this);
            window.hideLoading = this.hideLoading.bind(this);
            window.displayTestResults = this.displayTestResults.bind(this);
            window.displayPerformanceComparison = this.displayPerformanceComparison.bind(this);
            window.displayError = this.displayError.bind(this);
        },
        
        /**
         * Bind testing events
         */
        bindTestingEvents: function() {
            // Bind form submission
            $(document).on('submit', '#prompt-test-form', function(e) {
                e.preventDefault();
                window.runPromptTest();
            });
        },
        
        /**
         * Run prompt test
         */
        runPromptTest: function() {
            this.log('🧪 Running prompt test');
            this.showLoading();
            
            const formData = this.getFormData();
            
            $.post(this.config.ajaxUrl, {
                action: 'fitcopilot_test_prompt_generation',
                nonce: this.config.testStrategyNonce,
                ...formData
            })
            .done((response) => {
                this.hideLoading();
                if (response.success) {
                    this.displayTestResults(response.data);
                } else {
                    this.displayError(response.data || {message: 'Test failed'});
                }
            })
            .fail((xhr, status, error) => {
                this.hideLoading();
                this.displayError({message: `Network error: ${error}`});
            });
        },
        
        /**
         * Run performance comparison
         */
        runPerformanceComparison: function() {
            this.log('📊 Running performance comparison');
            this.showLoading();
            
            const formData = this.getFormData();
            
            $.post(this.config.ajaxUrl, {
                action: 'fitcopilot_test_prompt_generation',
                nonce: this.config.testStrategyNonce,
                ...formData
            })
            .done((response) => {
                this.hideLoading();
                if (response.success) {
                    this.displayPerformanceComparison(response.data);
                } else {
                    this.displayError(response.data || {message: 'Performance test failed'});
                }
            })
            .fail((xhr, status, error) => {
                this.hideLoading();
                this.displayError({message: `Network error: ${error}`});
            });
        },
        
        /**
         * Get form data
         */
        getFormData: function() {
            const form = document.getElementById('prompt-test-form');
            if (!form) return {};
            
            const formData = new FormData(form);
            const data = {};
            
            // Convert FormData to regular object
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    // Handle multiple values (like equipment checkboxes)
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
            
            // Handle equipment checkboxes specifically
            const equipmentCheckboxes = form.querySelectorAll('input[name="equipment[]"]:checked');
            if (equipmentCheckboxes.length > 0) {
                data.equipment = Array.from(equipmentCheckboxes).map(cb => cb.value);
            }
            
            return data;
        },
        
        /**
         * Show loading indicator
         */
        showLoading: function() {
            const resultsDiv = document.getElementById('test-results');
            const loadingDiv = document.getElementById('results-loading');
            
            if (resultsDiv) resultsDiv.style.display = 'block';
            if (loadingDiv) loadingDiv.style.display = 'block';
            
            // Hide previous results
            const outputDiv = document.getElementById('results-output');
            if (outputDiv) outputDiv.innerHTML = '';
        },
        
        /**
         * Hide loading indicator
         */
        hideLoading: function() {
            const loadingDiv = document.getElementById('results-loading');
            if (loadingDiv) loadingDiv.style.display = 'none';
        },
        
        /**
         * Display test results
         */
        displayTestResults: function(data) {
            this.log('📋 Displaying test results', data);
            
            const outputDiv = document.getElementById('results-output');
            if (!outputDiv) return;
            
            const html = `
                <div class="test-results-content">
                    <div class="results-summary">
                        <h4>Test Summary</h4>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <span class="label">Legacy Generation Time:</span>
                                <span class="value">${data.legacy?.generation_time || 'N/A'}ms</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">Modular Generation Time:</span>
                                <span class="value">${data.modular?.generation_time || 'N/A'}ms</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">Performance Improvement:</span>
                                <span class="value ${data.comparison?.performance_improvement > 0 ? 'positive' : 'negative'}">
                                    ${data.comparison?.performance_improvement || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="results-details">
                        <h4>Detailed Results</h4>
                        <div class="results-tabs">
                            <button class="tab-button active" onclick="showResultTab('legacy')">Legacy System</button>
                            <button class="tab-button" onclick="showResultTab('modular')">Modular System</button>
                        </div>
                        
                        <div id="legacy-results" class="tab-content active">
                            <div class="metrics-grid">
                                <div class="metric">
                                    <span class="metric-label">Character Count:</span>
                                    <span class="metric-value">${data.legacy?.character_count || 0}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Word Count:</span>
                                    <span class="metric-value">${data.legacy?.word_count || 0}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div id="modular-results" class="tab-content">
                            <div class="metrics-grid">
                                <div class="metric">
                                    <span class="metric-label">Estimated Tokens:</span>
                                    <span class="metric-value">${data.modular?.stats?.estimated_tokens || 0}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Context Types:</span>
                                    <span class="metric-value">${data.modular?.stats?.context_types?.length || 0}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Strategy:</span>
                                    <span class="metric-value">${data.modular?.stats?.strategy || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            outputDiv.innerHTML = html;
            
            // Make tab switching function global
            window.showResultTab = function(tabName) {
                // Hide all tabs
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Show selected tab
                const selectedTab = document.getElementById(tabName + '-results');
                const selectedButton = document.querySelector(`[onclick="showResultTab('${tabName}')"]`);
                
                if (selectedTab) selectedTab.classList.add('active');
                if (selectedButton) selectedButton.classList.add('active');
            };
        },
        
        /**
         * Display performance comparison
         */
        displayPerformanceComparison: function(data) {
            this.log('📊 Displaying performance comparison', data);
            
            const comparisonDiv = document.getElementById('performance-comparison');
            if (!comparisonDiv) return;
            
            comparisonDiv.style.display = 'block';
            
            // Update metrics
            this.updateMetric('legacy-time', data.legacy?.generation_time + 'ms');
            this.updateMetric('legacy-chars', data.legacy?.character_count);
            this.updateMetric('legacy-words', data.legacy?.word_count);
            
            this.updateMetric('modular-time', data.modular?.generation_time + 'ms');
            this.updateMetric('modular-tokens', data.modular?.stats?.estimated_tokens);
            this.updateMetric('modular-contexts', data.modular?.stats?.context_types?.length);
            
            this.updateMetric('performance-improvement', data.comparison?.performance_improvement + '%');
        },
        
        /**
         * Update metric display
         */
        updateMetric: function(elementId, value) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value || 'N/A';
            }
        },
        
        /**
         * Display error message
         */
        displayError: function(error) {
            this.log('❌ Displaying error', error);
            
            const outputDiv = document.getElementById('results-output');
            if (!outputDiv) return;
            
            const html = `
                <div class="error-message">
                    <h4>❌ Test Failed</h4>
                    <p>${error.message || 'An unknown error occurred'}</p>
                    ${error.type ? `<p><strong>Error Type:</strong> ${error.type}</p>` : ''}
                </div>
            `;
            
            outputDiv.innerHTML = html;
        },
        
        /**
         * Clear test results
         */
        clearTestResults: function() {
            this.log('🧹 Clearing test results');
            
            const resultsDiv = document.getElementById('test-results');
            const comparisonDiv = document.getElementById('performance-comparison');
            const outputDiv = document.getElementById('results-output');
            
            if (resultsDiv) resultsDiv.style.display = 'none';
            if (comparisonDiv) comparisonDiv.style.display = 'none';
            if (outputDiv) outputDiv.innerHTML = '';
        },
        
        // ========================================
        // PLACEHOLDER METHODS (TO BE IMPLEMENTED)
        // ========================================
        
        loadDashboardWidgets: function() { this.log('📊 Loading dashboard widgets...'); },
        setupRealTimeUpdates: function() { this.log('⚡ Setting up real-time updates...'); },
        loadPerformanceMetrics: function() { this.log('📈 Loading performance metrics...'); },
        initCharts: function() { this.log('📊 Initializing charts...'); },
        loadStrategiesTable: function() { this.log('📋 Loading strategies table...'); },
        initStrategyEditor: function() { this.log('✏️ Initializing strategy editor...'); },
        loadContextFlow: function() { this.log('🔍 Loading context flow...'); },
        setupContextMonitoring: function() { this.log('👁️ Setting up context monitoring...'); },
        loadFragmentCategories: function() { this.log('📚 Loading fragment categories...'); },
        initFragmentEditor: function() { this.log('✏️ Initializing fragment editor...'); },
        initTestingInterface: function() { this.log('🧪 Initializing testing interface...'); },
        loadTestPresets: function() { this.log('📋 Loading test presets...'); },
        loadLogsTable: function() { this.log('📋 Loading logs table...'); },
        setupLogAutoRefresh: function() { this.log('🔄 Setting up log auto-refresh...'); },
        loadConfigurationForm: function() { this.log('⚙️ Loading configuration form...'); },
        initConnectionTesting: function() { this.log('🔗 Initializing connection testing...'); },
        loadAnalyticsCharts: function() { this.log('📈 Loading analytics charts...'); },
        initDateRangePicker: function() { this.log('📅 Initializing date range picker...'); },
        testPrompt: function() { this.log('🧪 Testing prompt...'); },
        viewAnalytics: function() { this.log('📊 Viewing analytics...'); },
        runDiagnostics: function() { this.log('🔧 Running diagnostics...'); }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        window.FitCopilotPromptSystem.init();
    });

    // SPRINT 2: Strategy Manager JavaScript Functions

    /**
     * Delete strategy with confirmation
     */
    function deleteStrategy(strategyId, strategyName) {
        if (!confirm(`Are you sure you want to delete the strategy "${strategyName}"?\n\nThis action cannot be undone.`)) {
            return;
        }
        
        // Show loading state
        const deleteButton = document.querySelector(`[onclick*="${strategyId}"]`);
        const originalText = deleteButton.textContent;
        deleteButton.textContent = 'Deleting...';
        deleteButton.disabled = true;
        
        jQuery.post(ajaxurl, {
            action: 'fitcopilot_delete_strategy',
            strategy_id: strategyId,
            nonce: jQuery('[name="delete_strategy_nonce"]').val() || wp_create_nonce('fitcopilot_delete_strategy')
        })
        .done(function(response) {
            if (response.success) {
                // Remove the strategy card from the DOM
                const strategyCard = deleteButton.closest('.strategy-card');
                if (strategyCard) {
                    strategyCard.style.transition = 'all 0.3s ease';
                    strategyCard.style.opacity = '0';
                    strategyCard.style.transform = 'translateY(-20px)';
                    setTimeout(() => {
                        strategyCard.remove();
                        
                        // Check if no strategies remain
                        const remainingCards = document.querySelectorAll('.strategy-card');
                        if (remainingCards.length === 0) {
                            showEmptyState();
                        }
                    }, 300);
                }
                
                // Show success message
                showNotice('Strategy deleted successfully!', 'success');
            } else {
                showNotice('Error: ' + (response.data || 'Failed to delete strategy'), 'error');
                deleteButton.textContent = originalText;
                deleteButton.disabled = false;
            }
        })
        .fail(function() {
            showNotice('Failed to communicate with server', 'error');
            deleteButton.textContent = originalText;
            deleteButton.disabled = false;
        });
    }

    /**
     * Refresh strategy data
     */
    function refreshStrategyData() {
        const refreshButton = document.querySelector('[onclick="refreshStrategyData()"]');
        const originalText = refreshButton.textContent;
        refreshButton.textContent = '🔄 Refreshing...';
        refreshButton.disabled = true;
        
        // Simple page reload for now - could be enhanced with AJAX
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    /**
     * Test strategy functionality
     */
    function testStrategy(strategyId) {
        window.location.href = `${window.location.pathname}?page=fitcopilot-strategy-manager&action=test&strategy_id=${strategyId}`;
    }

    /**
     * Show empty state when no strategies exist
     */
    function showEmptyState() {
        const strategyGrid = document.querySelector('.strategy-grid');
        if (strategyGrid) {
            strategyGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;">📝</div>
                    <h3 style="color: #374151; font-size: 18px; margin-bottom: 8px;">No Strategies Found</h3>
                    <p style="margin-bottom: 20px; font-size: 14px;">Create your first strategy to get started with custom prompt engineering.</p>
                    <a href="${window.location.pathname}?page=fitcopilot-strategy-manager&action=new" class="button button-primary">
                        ➕ Create First Strategy
                    </a>
                </div>
            `;
        }
    }

    /**
     * Show admin notice
     */
    function showNotice(message, type = 'info') {
        const noticeHtml = `
            <div class="notice notice-${type} is-dismissible" style="margin: 20px 0;">
                <p>${message}</p>
                <button type="button" class="notice-dismiss" onclick="this.parentElement.remove()">
                    <span class="screen-reader-text">Dismiss this notice.</span>
                </button>
            </div>
        `;
        
        // Find the wrap container and prepend the notice
        const wrapContainer = document.querySelector('.wrap');
        if (wrapContainer) {
            const existingNotices = wrapContainer.querySelectorAll('.notice');
            existingNotices.forEach(notice => notice.remove());
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = noticeHtml;
            wrapContainer.insertBefore(tempDiv.firstElementChild, wrapContainer.firstElementChild);
        }
    }

    /**
     * Strategy form validation
     */
    function validateStrategyForm() {
        const form = document.getElementById('strategy-form');
        if (!form) return true;
        
        const requiredFields = [
            { field: 'strategy_name', label: 'Strategy Name' },
            { field: 'prompt_template', label: 'Prompt Template' }
        ];
        
        let isValid = true;
        const errors = [];
        
        requiredFields.forEach(({ field, label }) => {
            const input = form.querySelector(`[name="${field}"]`);
            const formField = input?.closest('.form-field');
            
            if (!input || !input.value.trim()) {
                isValid = false;
                errors.push(`${label} is required`);
                
                if (formField) {
                    formField.classList.add('error');
                    
                    // Remove existing error message
                    const existingError = formField.querySelector('.error-message');
                    if (existingError) existingError.remove();
                    
                    // Add error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = `${label} is required`;
                    formField.appendChild(errorDiv);
                }
            } else if (formField) {
                formField.classList.remove('error');
                const existingError = formField.querySelector('.error-message');
                if (existingError) existingError.remove();
            }
        });
        
        // Validate strategy ID format
        const strategyIdField = form.querySelector('[name="strategy_id_field"]');
        if (strategyIdField && strategyIdField.value) {
            const idPattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
            if (!idPattern.test(strategyIdField.value)) {
                isValid = false;
                errors.push('Strategy ID must start with a letter and contain only letters, numbers, hyphens, and underscores');
                
                const formField = strategyIdField.closest('.form-field');
                if (formField) {
                    formField.classList.add('error');
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = 'Invalid ID format';
                    formField.appendChild(errorDiv);
                }
            }
        }
        
        if (!isValid) {
            showNotice('Please fix the following errors: ' + errors.join(', '), 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Auto-generate strategy ID from name
     */
    function autoGenerateStrategyId() {
        const nameField = document.querySelector('[name="strategy_name"]');
        const idField = document.querySelector('[name="strategy_id_field"]');
        
        if (nameField && idField && !idField.value) {
            const name = nameField.value.trim();
            if (name) {
                // Convert to valid ID format
                const id = name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/-+/g, '-') // Replace multiple hyphens with single
                    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
                
                idField.value = id;
            }
        }
    }

    /**
     * Character counter for textarea
     */
    function updateCharacterCount(textarea, maxLength = 5000) {
        const currentLength = textarea.value.length;
        const counterElement = textarea.parentElement.querySelector('.char-counter');
        
        if (counterElement) {
            counterElement.textContent = `${currentLength}/${maxLength}`;
            counterElement.style.color = currentLength > maxLength ? '#dc2626' : '#6b7280';
        }
    }

    /**
     * Initialize strategy form
     */
    function initializeStrategyForm() {
        const form = document.getElementById('strategy-form');
        if (!form) return;
        
        // Auto-generate ID from name
        const nameField = form.querySelector('[name="strategy_name"]');
        if (nameField) {
            nameField.addEventListener('input', autoGenerateStrategyId);
        }
        
        // Character counters
        const textareas = form.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const maxLength = textarea.getAttribute('maxlength') || 5000;
            
            // Add character counter
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.fontSize = '12px';
            counter.style.color = '#6b7280';
            counter.style.marginTop = '4px';
            counter.style.textAlign = 'right';
            textarea.parentElement.appendChild(counter);
            
            // Update counter
            const updateCounter = () => updateCharacterCount(textarea, maxLength);
            textarea.addEventListener('input', updateCounter);
            updateCounter(); // Initial update
        });
        
        // Form validation on submit
        form.addEventListener('submit', function(e) {
            if (!validateStrategyForm()) {
                e.preventDefault();
                return false;
            }
        });
        
        // Clear validation errors on input
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const formField = this.closest('.form-field');
                if (formField && formField.classList.contains('error')) {
                    formField.classList.remove('error');
                    const errorMessage = formField.querySelector('.error-message');
                    if (errorMessage) errorMessage.remove();
                }
            });
        });
    }

    /**
     * Initialize strategy manager when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize strategy form if present
        initializeStrategyForm();
        
        // Add nonce for AJAX requests if not present
        if (!document.querySelector('[name="delete_strategy_nonce"]')) {
            const nonceInput = document.createElement('input');
            nonceInput.type = 'hidden';
            nonceInput.name = 'delete_strategy_nonce';
            // Use the nonce provided by WordPress via localized script data
            nonceInput.value = window.fitcopilotData?.nonce || window.ajaxurl_nonce || '';
            document.body.appendChild(nonceInput);
        }
        
        // Smooth scroll for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Auto-refresh strategy stats every 30 seconds
        if (document.querySelector('.strategy-list-container')) {
            setInterval(() => {
                const statsElements = document.querySelectorAll('.stat-value');
                if (statsElements.length > 0) {
                    // Could add auto-refresh functionality here
                    console.log('Strategy stats refresh interval');
                }
            }, 30000);
        }
    });

})(jQuery); 