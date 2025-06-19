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
                
                // Expose functions globally for validation testing
                window.loadUserProfile = this.loadUserProfile.bind(this);
                window.populateFormWithProfile = this.populateFormWithProfile.bind(this);
                
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
         * Setup event listeners (Enhanced for Dual Preview System)
         */
        setupEventListeners() {
            // Form change events for live updates
            this.form.on('change input', this.handleFormChange);
            
            // Action buttons
            $('#generate-prompt').on('click', this.generateLivePrompt);
            $('#inspect-context').on('click', this.viewContextData);
            $('#test-workout').on('click', this.testWorkoutGeneration);
            $('#load-profile').on('click', this.loadUserProfile);
            $('#reset-form-btn').on('click', () => this.resetForm());
            
            // Strategy code viewer controls
            $('#view-strategy-code').on('click', () => this.viewStrategyCode());
            $('#copy-strategy-code').on('click', () => this.copyStrategyCode());
            $('#toggle-line-numbers').on('click', () => this.toggleLineNumbers());
            $('#strategy-selector').on('change', () => this.onStrategyChange());
            
            // Live prompt preview controls
            $('#export-prompt').on('click', () => this.exportPrompt());
            $('#copy-prompt').on('click', () => this.copyPromptToClipboard());
            $('#clear-prompt').on('click', () => this.clearPrompt());
            
            // Workout test controls
            $('#export-workout').on('click', () => this.exportWorkout());
            $('#save-workout').on('click', () => this.saveWorkout());
            
            // Context inspector controls
            $('#context-search').on('input', () => this.searchContext());
            $('#toggle-compact-view').on('click', () => this.toggleCompactView());
            $('#expand-all-context').on('click', () => this.expandAllContext());
            
            // Template saving (if modal exists)
            $('#confirm-save-template').on('click', () => this.saveTemplate());
            $('#cancel-save-template, #close-save-modal').on('click', () => this.hideSaveTemplateModal());
            
            // Context tabs (if tabs exist)
            $('.context-tab').on('click', (e) => this.switchContextTab(e));
            
            // Test result tabs (if tabs exist)
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
         * Display generated prompt (Enhanced for Dual Preview System)
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
            
            // Update prompt statistics with enhanced formatting
            this.updatePromptStats(prompt_stats);
            
            // Show controls and statistics
            $('.prompt-controls button').show();
            $('#prompt-stats').show();
            
            // Enable action buttons with proper styling
            $('#export-prompt, #copy-prompt, #clear-prompt').prop('disabled', false).show();
            
            // Store current prompt
            this.currentPrompt = prompt;
            
            console.log('[PromptBuilder] Enhanced prompt display updated');
        }
        
        /**
         * Update prompt statistics (Enhanced with proper containers)
         */
        updatePromptStats(stats) {
            // Update statistics using the new UI structure
            $('#prompt-characters').text(stats.characters || 0);
            $('#prompt-words').text(stats.words || 0);
            $('#prompt-tokens').text(stats.estimated_tokens || 0);
            $('#prompt-lines').text(stats.lines || 0);
            
            // Show the statistics container
            $('#prompt-stats').show();
            
            console.log('[PromptBuilder] Prompt statistics updated:', stats);
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
         * Display context data (Enhanced with hierarchical tree structure)
         */
        displayContextData(data) {
            const { generation_params, context_sections, mapped_profile } = data;
            
            // Update context inspector with hierarchical structure
            const contextInspector = $('#context-inspector');
            contextInspector.html(this.buildContextTree(data));
            
            // Show context controls
            $('.context-controls input, .context-controls button').show();
            
            // Store current context
            this.currentContext = data;
            
            console.log('[PromptBuilder] Enhanced context inspector updated');
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
                const indent = '  '.repeat(level);
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
         * Display test results (Enhanced with performance metrics)
         */
        displayTestResults(data) {
            const { test_id, prompt, raw_response, timestamp, processing_time, performance_metrics, match_score, estimated_cost } = data;
            
            // Update workout test preview with formatted results
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
            
            // Store test data for export/save functionality
            this.currentTestData = data;
            
            console.log('[PromptBuilder] Enhanced workout test results displayed');
        }
        
        /**
         * Update workout performance metrics
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
         * Load user profile (Enhanced with better error handling)
         */
        async loadUserProfile() {
            const button = $('#load-profile');
            const originalText = button.html();
            
            try {
                button.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Loading...');
                
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_load_profile');
                
                console.log('[PromptBuilder] Profile load response:', response);
                
                if (response.success) {
                    // Extract profile data from nested response structure
                    let profileData = null;
                    
                    // The actual data is at response.data.data.profile_data
                    if (response.data && response.data.data && response.data.data.profile_data) {
                        profileData = response.data.data.profile_data;
                        console.log('[PromptBuilder] Found profile data at response.data.data.profile_data');
                    } else if (response.data && response.data.profile_data) {
                        profileData = response.data.profile_data;
                        console.log('[PromptBuilder] Found profile data at response.data.profile_data');
                    } else if (response.data) {
                        profileData = response.data;
                        console.log('[PromptBuilder] Using response.data directly');
                    }
                    
                    if (profileData) {
                        this.populateFormWithProfile(profileData);
                        this.showMessage('User profile loaded successfully', 'success');
                    } else {
                        console.warn('[PromptBuilder] No profile data found in response:', response);
                        this.showMessage('Profile loaded but no data found', 'warning');
                    }
                } else {
                    throw new Error(this.getResponseMessage(response, 'Failed to load profile'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] Load profile failed:', error);
                console.error('[PromptBuilder] Error stack:', error.stack);
                this.showMessage('Failed to load profile: ' + error.message, 'error');
            } finally {
                button.prop('disabled', false).html(originalText);
            }
        }
        
        /**
         * Populate form with profile data (Fixed field mapping)
         */
        populateFormWithProfile(profileData) {
            console.log('[PromptBuilder] Populating form with profile data:', profileData);
            
            try {
                // Handle different possible data structures
                let userData = profileData;
                
                // If profileData has a nested structure, extract the user data
                if (profileData.profile_data) {
                    userData = profileData.profile_data;
                } else if (profileData.user_data) {
                    userData = profileData.user_data;
                }
                
                // Basic info - comprehensive field mapping
                if (userData.basic_info) {
                    const basicInfo = userData.basic_info;
                    
                    // Name fields
                    if (basicInfo.first_name) $('#firstName').val(basicInfo.first_name);
                    if (basicInfo.last_name) $('#lastName').val(basicInfo.last_name);
                    
                    // Physical attributes
                    if (basicInfo.age) $('#age').val(basicInfo.age);
                    if (basicInfo.gender) $('#gender').val(basicInfo.gender);
                    if (basicInfo.fitness_level) $('#fitnessLevel').val(basicInfo.fitness_level);
                    if (basicInfo.weight) $('#weight').val(basicInfo.weight);
                    if (basicInfo.weight_unit) $('#weightUnit').val(basicInfo.weight_unit);
                    // Handle height with proper conversion
                    if (basicInfo.height && basicInfo.height_unit) {
                        $('#heightUnit').val(basicInfo.height_unit);
                        
                        if (basicInfo.height_unit === 'ft') {
                            // Convert total inches to feet and inches
                            const totalInches = parseInt(basicInfo.height);
                            const feet = Math.floor(totalInches / 12);
                            const inches = totalInches % 12;
                            $('#heightFeet').val(feet);
                            $('#heightInches').val(inches);
                            $('#height-imperial').show();
                            $('#height-metric').hide();
                        } else {
                            // Use cm directly
                            $('#heightCm').val(basicInfo.height);
                            $('#height-imperial').hide();
                            $('#height-metric').show();
                        }
                    }
                }
                
                // Handle flat structure (user fields directly in userData)
                if (!userData.basic_info) {
                    // Basic fields
                    if (userData.first_name) $('#firstName').val(userData.first_name);
                    if (userData.last_name) $('#lastName').val(userData.last_name);
                    if (userData.age) $('#age').val(userData.age);
                    if (userData.gender) $('#gender').val(userData.gender);
                    if (userData.fitness_level) $('#fitnessLevel').val(userData.fitness_level);
                    if (userData.weight) $('#weight').val(userData.weight);
                    if (userData.weight_unit) $('#weightUnit').val(userData.weight_unit);
                    // Handle height with proper conversion (flat structure)
                    if (userData.height && userData.height_unit) {
                        $('#heightUnit').val(userData.height_unit);
                        
                        if (userData.height_unit === 'ft') {
                            // Convert total inches to feet and inches
                            const totalInches = parseInt(userData.height);
                            const feet = Math.floor(totalInches / 12);
                            const inches = totalInches % 12;
                            $('#heightFeet').val(feet);
                            $('#heightInches').val(inches);
                            $('#height-imperial').show();
                            $('#height-metric').hide();
                        } else {
                            // Use cm directly
                            $('#heightCm').val(userData.height);
                            $('#height-imperial').hide();
                            $('#height-metric').show();
                        }
                    }
                    
                    // Additional flat structure fields
                    if (userData.preferred_location) $('#preferredLocation').val(userData.preferred_location);
                    if (userData.workout_frequency) $('#workoutFrequency').val(userData.workout_frequency);
                    if (userData.preferred_workout_duration) $('#testDuration').val(userData.preferred_workout_duration);
                    if (userData.limitation_notes) $('#limitationNotes').val(userData.limitation_notes);
                    if (userData.medical_conditions) $('#medicalConditions').val(userData.medical_conditions);
                    if (userData.favorite_exercises) $('#favoriteExercises').val(userData.favorite_exercises);
                    if (userData.disliked_exercises) $('#dislikedExercises').val(userData.disliked_exercises);
                }
                
                // Goals - map to correct checkbox names
                if (userData.goals) {
                    this.setCheckboxValues('goals[]', userData.goals);
                }
                
                // Equipment - map to correct checkbox names  
                if (userData.equipment || userData.availableEquipment) {
                    const equipment = userData.equipment || userData.availableEquipment;
                    this.setCheckboxValues('availableEquipment[]', equipment);
                }
                
                // Location preferences
                if (userData.location && userData.location.preferred_location) {
                    $('#preferredLocation').val(userData.location.preferred_location);
                }
                
                // Session params - comprehensive mapping
                if (userData.session_params) {
                    const sessionParams = userData.session_params;
                    if (sessionParams.duration) $('#testDuration').val(sessionParams.duration);
                    if (sessionParams.frequency) $('#workoutFrequency').val(sessionParams.frequency);
                    if (sessionParams.focus) $('#testFocus').val(sessionParams.focus);
                    if (sessionParams.energy_level) $('#energyLevel').val(sessionParams.energy_level);
                    if (sessionParams.stress_level) $('#stressLevel').val(sessionParams.stress_level);
                }
                
                // Physical limitations - comprehensive mapping
                if (userData.limitations) {
                    // Handle array of physical limitations
                    if (userData.limitations.physical_limitations) {
                        this.setCheckboxValues('limitations[]', userData.limitations.physical_limitations);
                    }
                    // Handle limitation notes
                    if (userData.limitations.limitation_notes) {
                        $('#limitationNotes').val(userData.limitations.limitation_notes);
                    }
                    // Handle medical conditions
                    if (userData.limitations.medical_conditions) {
                        $('#medicalConditions').val(userData.limitations.medical_conditions);
                    }
                    // Handle injuries (if separate field exists)
                    if (userData.limitations.injuries) {
                        $('#injuries').val(userData.limitations.injuries);
                    }
                }
                
                // Exercise preferences - new section
                if (userData.exercise_preferences) {
                    if (userData.exercise_preferences.favorite_exercises) {
                        $('#favoriteExercises').val(userData.exercise_preferences.favorite_exercises);
                    }
                    if (userData.exercise_preferences.disliked_exercises) {
                        $('#dislikedExercises').val(userData.exercise_preferences.disliked_exercises);
                    }
                }
                
                // Custom instructions - map to correct field ID
                if (userData.custom_notes || userData.custom_instructions) {
                    $('#customNotes').val(userData.custom_notes || userData.custom_instructions);
                }
                
                // Target muscle groups - handle muscle selection data
                if (userData.muscle_selection || userData.target_muscles) {
                    const muscleData = userData.muscle_selection || userData.target_muscles;
                    
                    // Clear existing muscle group selections
                    $('input[name="targetMuscleGroups[]"]').prop('checked', false);
                    
                    // Hide all detail grids and remove expanded classes
                    $('.muscle-detail-grid').hide();
                    $('.muscle-group-item').removeClass('expanded');
                    
                    // Uncheck all specific muscle checkboxes
                    $('input[name^="specificMuscles"]').prop('checked', false);
                    
                    // Populate muscle groups and show their detail grids
                    if (muscleData.selectedGroups && Array.isArray(muscleData.selectedGroups)) {
                        muscleData.selectedGroups.forEach(group => {
                            const checkbox = $(`input[name="targetMuscleGroups[]"][value="${group}"]`);
                            if (checkbox.length) {
                                checkbox.prop('checked', true);
                                
                                // Show the detail grid for this group
                                const detailGrid = $(`#muscle-detail-${group}`);
                                const groupItem = checkbox.closest('.muscle-group-item');
                                
                                detailGrid.show();
                                groupItem.addClass('expanded');
                            }
                        });
                    }
                    
                    // Populate specific muscles
                    if (muscleData.selectedMuscles) {
                        Object.entries(muscleData.selectedMuscles).forEach(([group, muscles]) => {
                            if (Array.isArray(muscles)) {
                                muscles.forEach(muscle => {
                                    const checkbox = $(`input[name="specificMuscles[${group}][]"][value="${muscle}"]`);
                                    if (checkbox.length) {
                                        checkbox.prop('checked', true);
                                    }
                                });
                            }
                        });
                    }
                    
                    // Update the muscle selection summary if the function exists
                    if (typeof updateMuscleSelectionSummary === 'function') {
                        updateMuscleSelectionSummary();
                    }
                }
                
                console.log('[PromptBuilder] Form populated successfully');
                
            } catch (error) {
                console.error('[PromptBuilder] Error populating form:', error);
                this.showMessage('Error populating form fields: ' + error.message, 'warning');
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
         * Display strategy code (Enhanced with syntax highlighting and line numbers)
         */
        displayStrategyCode(data) {
            const { strategy_name, file_path, code_content, code_analysis, line_count, file_size } = data;
            
            // Update strategy code viewer with syntax highlighting
            const codeViewer = $('#strategy-code-viewer');
            codeViewer.html(this.formatStrategyCode(code_content, strategy_name));
            
            // Show code controls
            $('.code-controls button').show();
            
            // Store code data for copy/export functionality
            this.currentStrategyCode = code_content;
            this.currentStrategyName = strategy_name;
            
            console.log('[PromptBuilder] Enhanced strategy code viewer updated');
        }
        
        /**
         * Format strategy code with syntax highlighting and line numbers
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
         * Copy strategy code to clipboard
         */
        async copyStrategyCode() {
            if (!this.currentStrategyCode) {
                this.showMessage('No strategy code to copy', 'warning');
                return;
            }
            
            try {
                await navigator.clipboard.writeText(this.currentStrategyCode);
                this.showMessage('Strategy code copied to clipboard', 'success');
            } catch (error) {
                this.fallbackCopyToClipboard(this.currentStrategyCode);
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
            
            const blob = new Blob([this.currentPrompt], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prompt_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            this.showMessage('Prompt exported successfully', 'success');
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
         * Export workout to file
         */
        exportWorkout() {
            if (!this.currentTestData) {
                this.showMessage('No workout data to export', 'warning');
                return;
            }
            
            const workoutData = JSON.stringify(this.currentTestData, null, 2);
            const blob = new Blob([workoutData], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `workout_test_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            this.showMessage('Workout test data exported successfully', 'success');
        }
        
        /**
         * Save workout to database
         */
        async saveWorkout() {
            if (!this.currentTestData) {
                this.showMessage('No workout data to save', 'warning');
                return;
            }
            
            try {
                const response = await this.makeAjaxRequest('fitcopilot_prompt_builder_save_workout', {
                    workout_data: this.currentTestData
                });
                
                if (response.success) {
                    this.showMessage('Workout saved successfully', 'success');
                } else {
                    throw new Error(this.getResponseMessage(response, 'Failed to save workout'));
                }
                
            } catch (error) {
                console.error('[PromptBuilder] Save workout failed:', error);
                this.showMessage('Failed to save workout: ' + error.message, 'error');
            }
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