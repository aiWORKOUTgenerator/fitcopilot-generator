/**
 * PromptBuilder - Phase 1: Main JavaScript Coordinator
 * 
 * Handles initialization, event listeners, form data collection,
 * and coordination between PromptBuilder modules
 */

(function($) {
    'use strict';
    
    // Global PromptBuilder namespace
    window.PromptBuilder = window.PromptBuilder || {};
    
    /**
     * Main PromptBuilder class
     */
    class PromptBuilderApp {
        constructor() {
            this.config = window.promptBuilderConfig || new (window.PromptBuilderConfig || function(){})();
            this.utils = window.promptBuilderUtils || new (window.PromptBuilderUtils || function(){})();
            this.isInitialized = false;
            
            // Form and UI elements
            this.form = null;
            this.promptDisplay = null;
            this.contextDisplay = null;
            this.testResults = null;
            
            // Current state
            this.currentFormData = {};
            this.currentPrompt = '';
            this.currentContext = {};
            
            // Bind methods
            this.init = this.init.bind(this);
            this.handleFormChange = this.handleFormChange.bind(this);
            this.generateLivePrompt = this.generateLivePrompt.bind(this);
            this.viewContextData = this.viewContextData.bind(this);
            this.testWorkoutGeneration = this.testWorkoutGeneration.bind(this);
            this.loadUserProfile = this.loadUserProfile.bind(this);
        }
        
        /**
         * Initialize PromptBuilder application
         */
        init() {
            if (this.isInitialized) {
                return;
            }
            
            console.log('[PromptBuilder] Initializing Phase 1 application...');
            
            try {
                // Initialize DOM elements
                this.initializeElements();
                
                // Setup event listeners
                this.setupEventListeners();
                
                // Initialize slider values
                this.initializeSliders();
                
                // Setup tabs and panels
                this.initializeTabs();
                
                // Initialize modals
                this.initializeModals();
                
                this.isInitialized = true;
                console.log('[PromptBuilder] Initialization completed successfully');
                
                // Show welcome message
                this.showMessage('PromptBuilder Phase 1 initialized successfully', 'success');
                
            } catch (error) {
                console.error('[PromptBuilder] Initialization failed:', error);
                this.showMessage('Failed to initialize PromptBuilder: ' + error.message, 'error');
            }
        }
        
        /**
         * Initialize DOM elements
         */
        initializeElements() {
            this.form = $('#prompt-builder-form');
            this.promptDisplay = $('#prompt-display');
            this.contextDisplay = $('#context-display');
            this.testResults = $('#test-results');
            
            if (!this.form.length) {
                throw new Error('PromptBuilder form not found');
            }
        }
        
        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Form change events for live updates
            this.form.on('change input', this.handleFormChange);
            
            // Action buttons
            $('#generate-prompt-btn').on('click', this.generateLivePrompt);
            $('#view-context-btn').on('click', this.viewContextData);
            $('#test-workout-btn').on('click', this.testWorkoutGeneration);
            $('#load-profile-btn').on('click', this.loadUserProfile);
            $('#reset-form-btn').on('click', () => this.resetForm());
            
            // Strategy inspector
            $('#view-strategy-btn').on('click', () => this.viewStrategyCode());
            $('#strategy-selector').on('change', () => this.onStrategyChange());
            
            // Prompt actions
            $('#copy-prompt-btn').on('click', () => this.copyPromptToClipboard());
            $('#save-template-btn').on('click', () => this.showSaveTemplateModal());
            
            // Template saving
            $('#confirm-save-template').on('click', () => this.saveTemplate());
            $('#cancel-save-template, #close-save-modal').on('click', () => this.hideSaveTemplateModal());
            
            // Context tabs
            $('.context-tab').on('click', (e) => this.switchContextTab(e));
            
            // Test result tabs
            $('.test-tab').on('click', (e) => this.switchTestTab(e));
        }
        
        /**
         * Initialize range sliders with live value updates
         */
        initializeSliders() {
            $('#session_energy').on('input', function() {
                $('#energy-value').text($(this).val());
            });
            
            $('#session_stress').on('input', function() {
                $('#stress-value').text($(this).val());
            });
            
            $('#session_sleep').on('input', function() {
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
         * Handle form changes for live updates
         */
        handleFormChange() {
            // Debounce form changes to avoid excessive API calls
            clearTimeout(this.formChangeTimeout);
            this.formChangeTimeout = setTimeout(() => {
                this.currentFormData = this.collectFormData();
                console.log('[PromptBuilder] Form data updated:', this.currentFormData);
            }, 300);
        }
        
        /**
         * Collect form data
         */
        collectFormData() {
            const formData = {
                basic_info: {
                    name: $('#basic_name').val(),
                    age: parseInt($('#basic_age').val()) || 0,
                    gender: $('#basic_gender').val(),
                    fitness_level: $('#basic_fitness_level').val(),
                    weight: parseFloat($('#basic_weight').val()) || 0,
                    height: parseFloat($('#basic_height').val()) || 0
                },
                goals: {
                    primary_goal: $('#goals_primary').val(),
                    secondary_goals: this.getCheckedValues('goals[secondary_goals][]'),
                    target_areas: this.getCheckedValues('goals[target_areas][]')
                },
                equipment: this.getCheckedValues('equipment[]'),
                session_params: {
                    duration: parseInt($('#session_duration').val()) || 30,
                    focus: $('#session_focus').val(),
                    energy_level: parseInt($('#session_energy').val()) || 3,
                    stress_level: parseInt($('#session_stress').val()) || 3,
                    sleep_quality: parseInt($('#session_sleep').val()) || 3
                },
                limitations: {
                    injuries: $('#limitations_injuries').val(),
                    restrictions: $('#limitations_restrictions').val(),
                    preferences: $('#limitations_preferences').val()
                },
                custom_instructions: $('#custom_instructions').val()
            };
            
            return formData;
        }
        
        /**
         * Get checked checkbox values
         */
        getCheckedValues(name) {
            return $(`input[name="${name}"]:checked`).map(function() {
                return $(this).val();
            }).get();
        }
        
        /**
         * Generate live prompt
         */
        async generateLivePrompt() {
            const button = $('#generate-prompt-btn');
            const originalText = button.html();
            
            try {
                // Update button state
                button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Generating...');
                
                // Collect current form data
                const formData = this.collectFormData();
                
                // Validate required fields
                if (!this.validateFormData(formData)) {
                    this.showMessage('Please fill in required fields: Name, Fitness Level, and Duration', 'warning');
                    return;
                }
                
                // Make AJAX request
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_generate', {
                    form_data: formData
                });
                
                if (response.success) {
                    this.displayPrompt(response.data);
                    this.showMessage('Live prompt generated successfully', 'success');
                } else {
                    throw new Error(this.getResponseMessage(response, 'Failed to generate prompt'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] Generate prompt failed:', error);
                this.showMessage('Failed to generate prompt: ' + error.message, 'error');
            } finally {
                // Restore button state
                button.prop('disabled', false).html(originalText);
            }
        }
        
        /**
         * Display generated prompt
         */
        displayPrompt(data) {
            const { prompt, prompt_stats, quality_analysis } = data;
            
            // Update prompt display
            this.promptDisplay.html(`<pre class="prompt-content">${this.utils.escapeHtml(prompt)}</pre>`);
            
            // Update prompt statistics
            this.updatePromptStats(prompt_stats);
            
            // Update quality analysis
            this.updateQualityAnalysis(quality_analysis);
            
            // Enable action buttons
            $('#copy-prompt-btn, #save-template-btn').prop('disabled', false);
            
            // Store current prompt
            this.currentPrompt = prompt;
        }
        
        /**
         * Update prompt statistics
         */
        updatePromptStats(stats) {
            $('#stat-characters').text(stats.characters || 0);
            $('#stat-words').text(stats.words || 0);
            $('#stat-lines').text(stats.lines || 0);
            $('#stat-tokens').text(stats.estimated_tokens || 0);
            $('#stat-sections').text(stats.sections || 0);
            $('#stat-readability').text(stats.readability_score || 0);
            
            $('#prompt-stats').show();
        }
        
        /**
         * Update quality analysis
         */
        updateQualityAnalysis(analysis) {
            // Update score bars
            this.updateScoreBar('personalization', analysis.personalization_score);
            this.updateScoreBar('completeness', analysis.completeness_score);
            this.updateScoreBar('clarity', analysis.clarity_score);
            
            // Update issues
            this.updateIssuesList(analysis.issues);
            
            // Update suggestions
            this.updateSuggestionsList(analysis.suggestions);
            
            $('#quality-analysis').show();
        }
        
        /**
         * Update score bar
         */
        updateScoreBar(type, score) {
            const fill = $(`#${type}-fill`);
            const value = $(`#${type}-score`);
            
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
        
        /**
         * Update issues list
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
         * Update suggestions list
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
         * View context data
         */
        async viewContextData() {
            const button = $('#view-context-btn');
            const originalText = button.html();
            
            try {
                button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Loading...');
                
                const formData = this.collectFormData();
                
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_get_context', {
                    form_data: formData
                });
                
                if (response.success) {
                    this.displayContextData(response.data);
                    this.showMessage('Context data loaded successfully', 'success');
                } else {
                    throw new Error(this.getResponseMessage(response, 'Failed to get context data'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] View context failed:', error);
                this.showMessage('Failed to load context data: ' + error.message, 'error');
            } finally {
                button.prop('disabled', false).html(originalText);
            }
        }
        
        /**
         * Display context data
         */
        displayContextData(data) {
            const { generation_params, context_sections, mapped_profile } = data;
            
            // Update context panels
            $('#generation-params-data').text(JSON.stringify(generation_params, null, 2));
            $('#profile-context-data').text(JSON.stringify(context_sections.profile_context, null, 2));
            $('#session-context-data').text(JSON.stringify(context_sections.session_context, null, 2));
            $('#mapped-profile-data').text(JSON.stringify(mapped_profile, null, 2));
            
            // Show context display
            this.contextDisplay.show();
            
            // Store current context
            this.currentContext = data;
        }
        
        /**
         * Test workout generation
         */
        async testWorkoutGeneration() {
            const button = $('#test-workout-btn');
            const originalText = button.html();
            
            try {
                button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Testing...');
                
                const formData = this.collectFormData();
                
                if (!this.validateFormData(formData)) {
                    this.showMessage('Please fill in required fields before testing', 'warning');
                    return;
                }
                
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_test_workout', {
                    test_data: formData
                });
                
                if (response.success) {
                    this.displayTestResults(response.data);
                    this.showMessage('Workout test completed successfully', 'success');
                } else {
                    throw new Error(this.getResponseMessage(response, 'Workout test failed'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] Test workout failed:', error);
                this.showMessage('Workout test failed: ' + error.message, 'error');
            } finally {
                button.prop('disabled', false).html(originalText);
            }
        }
        
        /**
         * Display test results
         */
        displayTestResults(data) {
            const { test_id, prompt, raw_response, timestamp, processing_time } = data;
            
            // Update test header
            $('#test-title').text(`Test ${test_id}`);
            $('#test-timestamp').text(timestamp);
            $('#test-duration').text(processing_time);
            
            // Update test content
            $('#workout-result-content').html(this.formatWorkoutResult(raw_response));
            $('#raw-response-content').text(raw_response);
            $('#test-prompt-content').text(prompt);
            
            // Show test results
            this.testResults.show();
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
         * Load user profile
         */
        async loadUserProfile() {
            const button = $('#load-profile-btn');
            const originalText = button.html();
            
            try {
                button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Loading...');
                
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_load_profile');
                
                if (response.success) {
                    this.populateFormWithProfile(response.data.profile_data);
                    this.showMessage('User profile loaded successfully', 'success');
                } else {
                    throw new Error(this.getResponseMessage(response, 'Failed to load profile'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] Load profile failed:', error);
                this.showMessage('Failed to load profile: ' + error.message, 'error');
            } finally {
                button.prop('disabled', false).html(originalText);
            }
        }
        
        /**
         * Populate form with profile data
         */
        populateFormWithProfile(profileData) {
            // Basic info
            if (profileData.basic_info) {
                $('#basic_name').val(profileData.basic_info.name);
                $('#basic_age').val(profileData.basic_info.age);
                $('#basic_gender').val(profileData.basic_info.gender);
                $('#basic_fitness_level').val(profileData.basic_info.fitness_level);
                $('#basic_weight').val(profileData.basic_info.weight);
                $('#basic_height').val(profileData.basic_info.height);
            }
            
            // Goals
            if (profileData.goals) {
                $('#goals_primary').val(profileData.goals.primary_goal);
                this.setCheckboxValues('goals[secondary_goals][]', profileData.goals.secondary_goals);
                this.setCheckboxValues('goals[target_areas][]', profileData.goals.target_areas);
            }
            
            // Equipment
            if (profileData.equipment) {
                this.setCheckboxValues('equipment[]', profileData.equipment);
            }
            
            // Session params
            if (profileData.session_params) {
                $('#session_duration').val(profileData.session_params.duration);
                $('#session_focus').val(profileData.session_params.focus);
                $('#session_energy').val(profileData.session_params.energy_level).trigger('input');
                $('#session_stress').val(profileData.session_params.stress_level).trigger('input');
                $('#session_sleep').val(profileData.session_params.sleep_quality).trigger('input');
            }
            
            // Limitations
            if (profileData.limitations) {
                $('#limitations_injuries').val(profileData.limitations.injuries);
                $('#limitations_restrictions').val(profileData.limitations.restrictions);
                $('#limitations_preferences').val(profileData.limitations.preferences);
            }
            
            // Custom instructions
            if (profileData.custom_instructions) {
                $('#custom_instructions').val(profileData.custom_instructions);
            }
        }
        
        /**
         * Set checkbox values
         */
        setCheckboxValues(name, values) {
            $(`input[name="${name}"]`).prop('checked', false);
            if (values && Array.isArray(values)) {
                values.forEach(value => {
                    $(`input[name="${name}"][value="${value}"]`).prop('checked', true);
                });
            }
        }
        
        /**
         * View strategy code
         */
        async viewStrategyCode() {
            const strategyName = $('#strategy-selector').val();
            const button = $('#view-strategy-btn');
            const originalText = button.html();
            
            try {
                button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Loading...');
                
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_view_code', {
                    strategy_name: strategyName
                });
                
                if (response.success) {
                    this.displayStrategyCode(response.data);
                    this.showMessage('Strategy code loaded successfully', 'success');
                } else {
                    throw new Error(this.getResponseMessage(response, 'Failed to load strategy code'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] View strategy failed:', error);
                this.showMessage('Failed to load strategy code: ' + error.message, 'error');
            } finally {
                button.prop('disabled', false).html(originalText);
            }
        }
        
        /**
         * Display strategy code
         */
        displayStrategyCode(data) {
            const { strategy_name, file_path, code_content, code_analysis, line_count, file_size } = data;
            
            // Update header
            $('#strategy-file-path').text(file_path);
            $('#code-lines').text(line_count);
            $('#code-size').text(file_size);
            $('#code-methods').text(code_analysis.methods?.length || 0);
            
            // Update code content
            $('#strategy-code-content').text(code_content);
            
            // Show code display
            $('#strategy-code-display').show();
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
                await navigator.clipboard.writeText(this.currentPrompt);
                this.showMessage('Prompt copied to clipboard', 'success');
            } catch (error) {
                // Fallback for older browsers
                this.fallbackCopyToClipboard(this.currentPrompt);
            }
        }
        
        /**
         * Fallback copy to clipboard
         */
        fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showMessage('Prompt copied to clipboard', 'success');
            } catch (error) {
                this.showMessage('Failed to copy prompt', 'error');
            }
            
            document.body.removeChild(textArea);
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
         * Save template
         */
        async saveTemplate() {
            const templateName = $('#template_name').val();
            const templateDescription = $('#template_description').val();
            const templateTags = $('#template_tags').val().split(',').map(tag => tag.trim()).filter(tag => tag);
            
            if (!templateName) {
                this.showMessage('Please enter a template name', 'warning');
                return;
            }
            
            try {
                const templateData = {
                    name: templateName,
                    description: templateDescription,
                    form_data: this.currentFormData,
                    prompt: this.currentPrompt,
                    tags: templateTags
                };
                
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_save_template', templateData);
                
                if (response.success) {
                    this.hideSaveTemplateModal();
                    this.showMessage('Template saved successfully', 'success');
                } else {
                    throw new Error(this.getResponseMessage(response, 'Failed to save template'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] Save template failed:', error);
                this.showMessage('Failed to save template: ' + error.message, 'error');
            }
        }
        
        /**
         * Reset form
         */
        resetForm() {
            if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
                this.form[0].reset();
                this.currentFormData = {};
                this.currentPrompt = '';
                this.currentContext = {};
                
                // Reset sliders
                $('#energy-value, #stress-value, #sleep-value').text('3');
                
                // Hide displays
                this.promptDisplay.html('<div class="prompt-placeholder"><p>Fill out the form and click "Generate Live Prompt" to see the AI prompt preview here.</p></div>');
                $('#prompt-stats, #quality-analysis').hide();
                this.contextDisplay.hide();
                this.testResults.hide();
                $('#strategy-code-display').hide();
                
                // Disable action buttons
                $('#copy-prompt-btn, #save-template-btn').prop('disabled', true);
                
                this.showMessage('Form reset successfully', 'info');
            }
        }
        
        /**
         * Switch context tab
         */
        switchContextTab(e) {
            const tab = $(e.target);
            const tabName = tab.data('tab');
            
            // Update tab states
            $('.context-tab').removeClass('active');
            tab.addClass('active');
            
            // Update panel states
            $('.context-panel').removeClass('active');
            $(`#${tabName}-panel`).addClass('active');
        }
        
        /**
         * Switch test tab
         */
        switchTestTab(e) {
            const tab = $(e.target);
            const tabName = tab.data('tab');
            
            // Update tab states
            $('.test-tab').removeClass('active');
            tab.addClass('active');
            
            // Update panel states
            $('.test-panel').removeClass('active');
            $(`#${tabName}-panel`).addClass('active');
        }
        
        /**
         * Validate form data
         */
        validateFormData(formData) {
            // Required fields: name, fitness_level, duration
            return formData.basic_info.name && 
                   formData.basic_info.fitness_level && 
                   formData.session_params.duration > 0;
        }
        
        /**
         * Make AJAX request
         */
        async makeAjaxRequest(action, data = {}) {
            const requestData = {
                action: action,
                nonce: fitcopilotPromptBuilder.nonce,
                ...data
            };
            
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: fitcopilotPromptBuilder.ajaxUrl,
                    type: 'POST',
                    data: requestData,
                    timeout: 30000,
                    success: function(response) {
                        // Ensure response is properly formatted
                        if (typeof response === 'string') {
                            try {
                                response = JSON.parse(response);
                            } catch (e) {
                                console.error('[PromptBuilder] Invalid JSON response:', response);
                                reject(new Error('Invalid server response format'));
                                return;
                            }
                        }
                        
                        // Validate response structure
                        if (!response || typeof response !== 'object') {
                            reject(new Error('Invalid response structure'));
                            return;
                        }
                        
                        resolve(response);
                    },
                    error: function(xhr, status, error) {
                        console.error('[PromptBuilder] AJAX Error:', {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            responseText: xhr.responseText,
                            error: error
                        });
                        
                        let errorMessage = `AJAX error: ${error}`;
                        
                        if (xhr.responseText) {
                            try {
                                const errorResponse = JSON.parse(xhr.responseText);
                                if (errorResponse && errorResponse.data && errorResponse.data.message) {
                                    errorMessage = errorResponse.data.message;
                                }
                            } catch (e) {
                                // Response is not JSON, use as is
                                errorMessage = `Server error: ${xhr.status} ${xhr.statusText}`;
                            }
                        }
                        
                        reject(new Error(errorMessage));
                    }
                });
            });
        }
        
        /**
         * Show message
         */
        showMessage(message, type = 'info') {
            const messageContainer = $('#prompt-builder-messages');
            
            // Fallback escapeHtml if utils not available
            const escapeHtml = (text) => {
                if (this.utils && this.utils.escapeHtml) {
                    return this.utils.escapeHtml(text);
                }
                // Fallback HTML escaping
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };
            
            const messageHtml = `
                <div class="notice notice-${type} is-dismissible">
                    <p>${escapeHtml(message)}</p>
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
         * Safe access to response message with fallbacks
         */
        getResponseMessage(response, fallback = 'Unknown error occurred') {
            if (!response) return fallback;
            
            // Try different response structures WordPress might return
            if (response.data && response.data.message) {
                return response.data.message;
            }
            
            if (response.message) {
                return response.message;
            }
            
            if (typeof response === 'string') {
                return response;
            }
            
            return fallback;
        }
        
        /**
         * Handle strategy change
         */
        onStrategyChange() {
            // Hide strategy code display when strategy changes
            $('#strategy-code-display').hide();
        }
    }
    
    // Initialize PromptBuilder when DOM is ready
    $(document).ready(function() {
        // Initialize PromptBuilder app
        window.PromptBuilder = new PromptBuilderApp();
        
        // Auto-initialize if config is available
        if (typeof fitcopilotPromptBuilder !== 'undefined') {
            window.PromptBuilder.init();
        } else {
            console.warn('[PromptBuilder] Configuration not found, waiting for manual initialization');
        }
    });
    
})(jQuery); 