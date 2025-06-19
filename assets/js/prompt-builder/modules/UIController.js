/**
 * PromptBuilder - UIController Module
 * 
 * Handles UI management, display updates, and user interactions
 * Extracted from monolithic index.js for performance optimization
 */

(function($, window) {
    'use strict';
    
    // Ensure jQuery is available for this module
    if (typeof $ === 'undefined') {
        throw new Error('UIController: jQuery is required but not available');
    }
    
    /**
     * UIController Module
     * Manages UI components, display updates, and user interface interactions
     */
    class UIController {
        constructor(config, utils) {
            this.config = config;
            this.utils = utils;
            
            // UI elements
            this.promptDisplay = null;
            this.contextDisplay = null;
            this.testResults = null;
            
            // Current display state
            this.currentPrompt = '';
            this.currentContext = {};
            this.currentTestData = null;
            this.currentStrategyCode = '';
            this.currentStrategyName = '';
            
            // Bind methods
            this.initializeElements = this.initializeElements.bind(this);
            this.setupEventListeners = this.setupEventListeners.bind(this);
            this.displayPrompt = this.displayPrompt.bind(this);
            this.displayContextData = this.displayContextData.bind(this);
            this.displayTestResults = this.displayTestResults.bind(this);
            this.showMessage = this.showMessage.bind(this);
        }
        
        /**
         * Initialize UI controller
         */
        initialize() {
            this.initializeElements();
            this.setupEventListeners();
            this.initializeSliders();
            this.initializeTabs();
            this.initializeModals();
            
            console.log('[UIController] Initialized successfully');
        }
        
        /**
         * Initialize DOM elements
         */
        initializeElements() {
            this.promptDisplay = $('#prompt-display');
            this.contextDisplay = $('#context-display');
            this.testResults = $('#test-results');
        }
        
        /**
         * Setup UI event listeners
         */
        setupEventListeners() {
            // Strategy code viewer controls
            $('#view-strategy-code').on('click', () => this.triggerEvent('viewStrategyCode'));
            $('#copy-strategy-code').on('click', () => this.copyStrategyCode());
            $('#toggle-line-numbers').on('click', () => this.toggleLineNumbers());
            $('#strategy-selector').on('change', () => this.onStrategyChange());
            
            // Live prompt preview controls
            $('#export-prompt').on('click', () => this.exportPrompt());
            $('#copy-prompt').on('click', () => this.copyPromptToClipboard());
            $('#clear-prompt').on('click', () => this.clearPrompt());
            
            // Workout test controls
            $('#export-workout').on('click', () => this.exportWorkout());
            $('#save-workout').on('click', () => this.triggerEvent('saveWorkout'));
            
            // Context inspector controls
            $('#context-search').on('input', () => this.searchContext());
            $('#toggle-compact-view').on('click', () => this.toggleCompactView());
            $('#expand-all-context').on('click', () => this.expandAllContext());
            
            // Template saving controls
            $('#confirm-save-template').on('click', () => this.triggerEvent('saveTemplate'));
            $('#cancel-save-template, #close-save-modal').on('click', () => this.hideSaveTemplateModal());
            
            // Tab controls
            $('.context-tab').on('click', (e) => this.switchContextTab(e));
            $('.test-tab').on('click', (e) => this.switchTestTab(e));
            
            // Reset form control
            $('#reset-form-btn').on('click', () => this.triggerEvent('resetForm'));
        }
        
        /**
         * Initialize range sliders with live value updates
         */
        initializeSliders() {
            $('#session_energy, #energyLevel').on('input', function() {
                $('#energy-value').text($(this).val());
            });
            
            $('#session_stress, #stressLevel').on('input', function() {
                $('#stress-value').text($(this).val());
            });
            
            $('#session_sleep, #sleepQuality').on('input', function() {
                $('#sleep-value').text($(this).val());
            });
        }
        
        /**
         * Initialize tabs and panels
         */
        initializeTabs() {
            // Context tabs
            $('.context-tab').first().addClass('active');
            $('.context-panel').first().addClass('active');
            
            // Test result tabs
            $('.test-tab').first().addClass('active');
            $('.test-panel').first().addClass('active');
        }
        
        /**
         * Initialize modals
         */
        initializeModals() {
            // Close modal when clicking outside
            $(document).on('click', '.prompt-builder-modal', function(e) {
                if (e.target === this) {
                    $(this).hide();
                }
            });
        }
        
        /**
         * Display generated prompt with enhanced formatting
         */
        displayPrompt(data) {
            const { prompt, prompt_stats, quality_analysis } = data;
            
            // Update prompt preview container
            const promptPreview = $('#prompt-preview');
            promptPreview.html(`
                <div class="prompt-content-wrapper">
                    <pre class="prompt-content syntax-highlighted">${this.utils.escapeHtml(prompt)}</pre>
                </div>
            `);
            
            // Update prompt statistics
            this.updatePromptStats(prompt_stats);
            
            // Update quality analysis if available
            if (quality_analysis) {
                this.updateQualityAnalysis(quality_analysis);
            }
            
            // Show controls and statistics
            $('.prompt-controls button').show();
            $('#prompt-stats').show();
            
            // Enable action buttons
            $('#export-prompt, #copy-prompt, #clear-prompt').prop('disabled', false).show();
            
            // Store current prompt
            this.currentPrompt = prompt;
            
            console.log('[UIController] Prompt display updated');
        }
        
        /**
         * Update prompt statistics display
         */
        updatePromptStats(stats) {
            if (!stats) return;
            
            // Update statistics using the UI structure
            $('#prompt-characters').text(stats.characters || 0);
            $('#prompt-words').text(stats.words || 0);
            $('#prompt-tokens').text(stats.estimated_tokens || 0);
            $('#prompt-lines').text(stats.lines || 0);
            
            // Show the statistics container
            $('#prompt-stats').show();
            
            console.log('[UIController] Prompt statistics updated:', stats);
        }
        
        /**
         * Update quality analysis display
         */
        updateQualityAnalysis(analysis) {
            if (!analysis) return;
            
            // Update score bars
            this.updateScoreBar('personalization', analysis.personalization_score);
            this.updateScoreBar('completeness', analysis.completeness_score);
            this.updateScoreBar('clarity', analysis.clarity_score);
            
            // Update issues and suggestions
            this.updateIssuesList(analysis.issues);
            this.updateSuggestionsList(analysis.suggestions);
            
            $('#quality-analysis').show();
        }
        
        /**
         * Update individual score bar
         */
        updateScoreBar(type, score) {
            const fill = $(`#${type}-fill`);
            const value = $(`#${type}-score`);
            
            if (fill.length && value.length) {
                fill.css('width', score + '%');
                value.text(Math.round(score) + '%');
                
                // Color coding
                fill.removeClass('score-low score-medium score-high');
                if (score < 50) {
                    fill.addClass('score-low');
                } else if (score < 80) {
                    fill.addClass('score-medium');
                } else {
                    fill.addClass('score-high');
                }
            }
        }
        
        /**
         * Update issues list display
         */
        updateIssuesList(issues) {
            const container = $('#quality-issues');
            const list = $('#issues-list');
            
            if (issues && issues.length > 0) {
                list.empty();
                issues.forEach(issue => {
                    list.append(`<li>${this.utils.escapeHtml(issue)}</li>`);
                });
                container.show();
            } else {
                container.hide();
            }
        }
        
        /**
         * Update suggestions list display
         */
        updateSuggestionsList(suggestions) {
            const container = $('#quality-suggestions');
            const list = $('#suggestions-list');
            
            if (suggestions && suggestions.length > 0) {
                list.empty();
                suggestions.forEach(suggestion => {
                    list.append(`<li>${this.utils.escapeHtml(suggestion)}</li>`);
                });
                container.show();
            } else {
                container.hide();
            }
        }
        
        /**
         * Display context data with hierarchical structure
         */
        displayContextData(data) {
            const { generation_params, context_sections, mapped_profile } = data;
            
            // Update context inspector
            const contextInspector = $('#context-inspector');
            contextInspector.html(this.buildContextTree(data));
            
            // Show context controls
            $('.context-controls input, .context-controls button').show();
            
            // Store current context
            this.currentContext = data;
            
            console.log('[UIController] Context display updated');
        }
        
        /**
         * Build hierarchical context tree structure
         */
        buildContextTree(data) {
            let html = '<div class="context-tree">';
            
            // Generation Parameters
            html += this.buildContextSection('Generation Parameters', data.generation_params, 'gen-params');
            
            // Context Sections
            if (data.context_sections) {
                html += this.buildContextSection('Profile Context', data.context_sections.profile_context, 'profile-ctx');
                html += this.buildContextSection('Session Context', data.context_sections.session_context, 'session-ctx');
            }
            
            // Mapped Profile
            html += this.buildContextSection('Mapped Profile', data.mapped_profile, 'mapped-profile');
            
            html += '</div>';
            return html;
        }
        
        /**
         * Build individual context section
         */
        buildContextSection(title, data, id) {
            let html = `<div class="context-section" id="${id}">`;
            html += `<div class="context-header" onclick="this.nextElementSibling.classList.toggle('collapsed')">`;
            html += `<span class="context-toggle">▼</span>`;
            html += `<strong>${title}</strong>`;
            html += `<span class="context-count">(${this.getDataCount(data)} items)</span>`;
            html += '</div>';
            
            html += '<div class="context-content">';
            if (data && typeof data === 'object') {
                html += this.buildDataTree(data, 0);
            } else {
                html += `<div class="context-value">${this.utils.escapeHtml(String(data || 'No data'))}</div>`;
            }
            html += '</div>';
            html += '</div>';
            
            return html;
        }
        
        /**
         * Build recursive data tree
         */
        buildDataTree(obj, level) {
            let html = '';
            
            for (const [key, value] of Object.entries(obj)) {
                html += `<div class="context-item" style="margin-left: ${level * 20}px;">`;
                
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    html += `<div class="context-key expandable" onclick="this.nextElementSibling.classList.toggle('collapsed')">`;
                    html += `<span class="expand-icon">▼</span> <strong>${key}:</strong>`;
                    html += '</div>';
                    html += `<div class="context-nested">`;
                    html += this.buildDataTree(value, level + 1);
                    html += '</div>';
                } else if (Array.isArray(value)) {
                    html += `<div class="context-key"><strong>${key}:</strong> <span class="context-array">[${value.length} items]</span></div>`;
                    html += `<div class="context-array-items">`;
                    value.forEach((item, index) => {
                        html += `<div class="array-item" style="margin-left: ${(level + 1) * 20}px;">`;
                        html += `<span class="array-index">[${index}]</span> ${this.utils.escapeHtml(String(item))}`;
                        html += '</div>';
                    });
                    html += '</div>';
                } else {
                    const valueClass = value ? 'has-value' : 'no-value';
                    html += `<div class="context-key"><strong>${key}:</strong> `;
                    html += `<span class="context-value ${valueClass}">${this.utils.escapeHtml(String(value || 'No data'))}</span></div>`;
                }
                
                html += '</div>';
            }
            
            return html;
        }
        
        /**
         * Get data count for context section
         */
        getDataCount(data) {
            if (!data) return 0;
            if (typeof data === 'object') {
                return Object.keys(data).length;
            }
            return 1;
        }
        
        /**
         * Display test results with performance metrics
         */
        displayTestResults(data) {
            const { test_id, prompt, raw_response, timestamp, processing_time, performance_metrics, match_score, estimated_cost } = data;
            
            // Update workout test preview
            const workoutPreview = $('#workout-test-preview');
            workoutPreview.html(this.formatWorkoutResult(raw_response));
            
            // Update performance metrics
            this.updateWorkoutPerformance({
                processing_time: processing_time || 0,
                match_score: match_score || 0,
                estimated_cost: estimated_cost || 0
            });
            
            // Show controls and performance metrics
            $('.workout-controls #export-workout, .workout-controls #save-workout').show();
            $('#workout-performance').show();
            
            // Store test data
            this.currentTestData = data;
            
            console.log('[UIController] Test results displayed');
        }
        
        /**
         * Update workout performance metrics display
         */
        updateWorkoutPerformance(metrics) {
            $('#workout-time').text(metrics.processing_time + 'ms');
            $('#workout-match').text(Math.round(metrics.match_score) + '%');
            $('#workout-cost').text('$' + (metrics.estimated_cost || 0).toFixed(4));
        }
        
        /**
         * Format workout result for display
         */
        formatWorkoutResult(rawResponse) {
            try {
                const workout = JSON.parse(rawResponse);
                let html = `<h4>${workout.title || 'Generated Workout'}</h4>`;
                
                if (workout.sections) {
                    workout.sections.forEach(section => {
                        html += `<h5>${section.name}</h5>`;
                        if (section.exercises) {
                            html += '<ul>';
                            section.exercises.forEach(exercise => {
                                html += `<li>${exercise.name}`;
                                if (exercise.duration) html += ` - ${exercise.duration}`;
                                html += '</li>';
                            });
                            html += '</ul>';
                        }
                    });
                }
                
                return html;
            } catch (error) {
                return `<pre>${this.utils.escapeHtml(rawResponse)}</pre>`;
            }
        }
        
        /**
         * Display strategy code with syntax highlighting
         */
        displayStrategyCode(data) {
            const { strategy_name, file_path, code_content, code_analysis, line_count, file_size } = data;
            
            // Update strategy code viewer
            const codeViewer = $('#strategy-code-viewer');
            codeViewer.html(this.formatStrategyCode(code_content, strategy_name));
            
            // Show code controls
            $('.code-controls button').show();
            
            // Store code data
            this.currentStrategyCode = code_content;
            this.currentStrategyName = strategy_name;
            
            console.log('[UIController] Strategy code displayed');
        }
        
        /**
         * Format strategy code with line numbers
         */
        formatStrategyCode(code, strategyName) {
            const lines = code.split('\n');
            let html = '<div class="code-display-wrapper">';
            
            // Code header
            html += `<div class="code-header">`;
            html += `<div class="code-title">📋 ${strategyName}.php</div>`;
            html += `<div class="code-info">${lines.length} lines</div>`;
            html += `</div>`;
            
            // Code content with line numbers
            html += '<div class="code-content-container">';
            html += '<div class="code-line-numbers">';
            for (let i = 1; i <= lines.length; i++) {
                html += `<div class="line-number">${i}</div>`;
            }
            html += '</div>';
            
            html += '<div class="code-content">';
            html += `<pre class="php-code">${this.utils.escapeHtml(code)}</pre>`;
            html += '</div>';
            html += '</div>';
            
            html += '</div>';
            return html;
        }
        
        /**
         * Show message with appropriate styling
         */
        showMessage(message, type = 'info') {
            const messageContainer = $('#prompt-builder-messages');
            
            const messageHtml = `
                <div class="notice notice-${type} is-dismissible">
                    <p>${this.utils.escapeHtml(message)}</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            `;
            
            messageContainer.html(messageHtml);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                messageContainer.find('.notice').fadeOut();
            }, 5000);
            
            // Handle dismiss button
            messageContainer.find('.notice-dismiss').on('click', function() {
                $(this).parent().fadeOut();
            });
        }
        
        /**
         * Search context data
         */
        searchContext() {
            const searchTerm = $('#context-search').val().toLowerCase();
            const contextItems = $('.context-item');
            
            if (!searchTerm) {
                contextItems.show();
                return;
            }
            
            contextItems.each(function() {
                const text = $(this).text().toLowerCase();
                if (text.includes(searchTerm)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
        
        /**
         * Toggle compact view for context
         */
        toggleCompactView() {
            const contextTree = $('.context-tree');
            
            if (contextTree.hasClass('compact-view')) {
                contextTree.removeClass('compact-view');
                $('#toggle-compact-view').text('📦 Compact');
            } else {
                contextTree.addClass('compact-view');
                $('#toggle-compact-view').text('📦 Expanded');
            }
        }
        
        /**
         * Expand all context sections
         */
        expandAllContext() {
            $('.context-content').removeClass('collapsed');
            $('.context-nested').removeClass('collapsed');
            $('.expand-icon').text('▼');
        }
        
        /**
         * Copy prompt to clipboard
         */
        async copyPromptToClipboard() {
            if (!this.currentPrompt) {
                this.showMessage('No prompt to copy', 'warning');
                return;
            }
            
            try {
                await this.utils.copyToClipboard(this.currentPrompt);
                this.showMessage('Prompt copied to clipboard', 'success');
            } catch (error) {
                this.showMessage('Failed to copy prompt', 'error');
            }
        }
        
        /**
         * Copy strategy code to clipboard
         */
        async copyStrategyCode() {
            if (!this.currentStrategyCode) {
                this.showMessage('No strategy code to copy', 'warning');
                return;
            }
            
            try {
                await this.utils.copyToClipboard(this.currentStrategyCode);
                this.showMessage('Strategy code copied to clipboard', 'success');
            } catch (error) {
                this.showMessage('Failed to copy strategy code', 'error');
            }
        }
        
        /**
         * Toggle line numbers in code viewer
         */
        toggleLineNumbers() {
            const codeViewer = $('#strategy-code-viewer');
            const lineNumbers = codeViewer.find('.code-line-numbers');
            
            if (lineNumbers.is(':visible')) {
                lineNumbers.hide();
                $('#toggle-line-numbers').text('🔢 Show Lines');
            } else {
                lineNumbers.show();
                $('#toggle-line-numbers').text('🔢 Hide Lines');
            }
        }
        
        /**
         * Export prompt to file
         */
        exportPrompt() {
            if (!this.currentPrompt) {
                this.showMessage('No prompt to export', 'warning');
                return;
            }
            
            const filename = `prompt_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
            this.utils.downloadAsFile(this.currentPrompt, filename);
            this.showMessage('Prompt exported successfully', 'success');
        }
        
        /**
         * Export workout to file
         */
        exportWorkout() {
            if (!this.currentTestData) {
                this.showMessage('No workout data to export', 'warning');
                return;
            }
            
            const workoutData = JSON.stringify(this.currentTestData, null, 2);
            const filename = `workout_test_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            this.utils.downloadAsFile(workoutData, filename, 'application/json');
            this.showMessage('Workout test data exported successfully', 'success');
        }
        
        /**
         * Clear prompt display
         */
        clearPrompt() {
            $('#prompt-preview').html(`
                <div class="prompt-placeholder">
                    <p>🎯 Ready to generate live prompts</p>
                    <p>Fill in the profile data and click "Generate Live Prompt" to see the AI prompt in real-time.</p>
                </div>
            `);
            
            $('#prompt-stats').hide();
            $('.prompt-controls button').hide();
            this.currentPrompt = '';
            
            this.showMessage('Prompt display cleared', 'success');
        }
        
        /**
         * Switch context tab
         */
        switchContextTab(e) {
            const tab = $(e.target);
            const tabName = tab.data('tab');
            
            $('.context-tab').removeClass('active');
            tab.addClass('active');
            
            $('.context-panel').removeClass('active');
            $(`#${tabName}-panel`).addClass('active');
        }
        
        /**
         * Switch test tab
         */
        switchTestTab(e) {
            const tab = $(e.target);
            const tabName = tab.data('tab');
            
            $('.test-tab').removeClass('active');
            tab.addClass('active');
            
            $('.test-panel').removeClass('active');
            $(`#${tabName}-panel`).addClass('active');
        }
        
        /**
         * Show save template modal
         */
        showSaveTemplateModal() {
            if (!this.currentPrompt) {
                this.showMessage('Generate a prompt first before saving', 'warning');
                return;
            }
            
            $('#save-template-modal').show();
        }
        
        /**
         * Hide save template modal
         */
        hideSaveTemplateModal() {
            $('#save-template-modal').hide();
            $('#save-template-form')[0].reset();
        }
        
        /**
         * Handle strategy change
         */
        onStrategyChange() {
            $('#strategy-code-display').hide();
        }
        
        /**
         * Trigger custom event for other modules
         */
        triggerEvent(eventName, data = null) {
            $(document).trigger(eventName, data);
        }
        
        /**
         * Get current prompt
         */
        getCurrentPrompt() {
            return this.currentPrompt;
        }
        
        /**
         * Get current test data
         */
        getCurrentTestData() {
            return this.currentTestData;
        }
        
        /**
         * Get current context
         */
        getCurrentContext() {
            return this.currentContext;
        }
        
        /**
         * Destroy UI controller
         */
        destroy() {
            // Remove event listeners
            $('#view-strategy-code, #copy-strategy-code, #toggle-line-numbers, #strategy-selector').off();
            $('#export-prompt, #copy-prompt, #clear-prompt').off();
            $('#export-workout, #save-workout').off();
            $('#context-search, #toggle-compact-view, #expand-all-context').off();
            $('#confirm-save-template, #cancel-save-template, #close-save-modal').off();
            $('.context-tab, .test-tab').off();
            $('#reset-form-btn').off();
            
            console.log('[UIController] Destroyed');
        }
    }
    
    // Export to global scope
    window.PromptBuilderUIController = UIController;
    
})(jQuery, window); 