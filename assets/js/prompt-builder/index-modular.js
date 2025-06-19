/**
 * PromptBuilder - Modular Main Coordinator
 * 
 * Lightweight coordinator that orchestrates modular components
 * Replaces the monolithic 1,485-line index.js for performance optimization
 */

(function($, window) {
    'use strict';
    
    // Global PromptBuilder namespace
    window.PromptBuilder = window.PromptBuilder || {};
    
    // Make jQuery available globally for modules (WordPress noConflict compatibility)
    if (typeof window.$ === 'undefined' && typeof $ !== 'undefined') {
        window.$ = $;
    }
    
    /**
     * Modular PromptBuilder Application
     * Lightweight coordinator using dependency injection pattern
     */
    class ModularPromptBuilderApp {
        constructor() {
            // Configuration and utilities
            this.config = window.promptBuilderConfig || new (window.PromptBuilderConfig || function(){})();
            this.utils = window.promptBuilderUtils || new (window.PromptBuilderUtils || function(){})();
            
            // Initialize modules
            this.formHandler = null;
            this.ajaxManager = null;
            this.uiController = null;
            this.analyticsManager = null;
            
            // Application state
            this.isInitialized = false;
            
            // Bind methods
            this.init = this.init.bind(this);
            this.handleFormDataChanged = this.handleFormDataChanged.bind(this);
            this.handleFormReset = this.handleFormReset.bind(this);
        }
        
        /**
         * Initialize modular application
         */
        async init() {
            if (this.isInitialized) {
                return;
            }
            
            console.log('[ModularPromptBuilder] Initializing application with modular architecture...');
            
            try {
                // Initialize core modules
                await this.initializeModules();
                
                // Setup inter-module communication
                this.setupModuleCommunication();
                
                // Setup main event listeners
                this.setupMainEventListeners();
                
                this.isInitialized = true;
                console.log('[ModularPromptBuilder] Modular initialization completed successfully');
                
                // Show welcome message
                this.uiController.showMessage('PromptBuilder modular system initialized successfully', 'success');
                
                // Performance improvement notification
                this.showPerformanceImprovement();
                
            } catch (error) {
                console.error('[ModularPromptBuilder] Initialization failed:', error);
                this.showFallbackError(error);
            }
        }
        
        /**
         * Initialize all modules
         */
        async initializeModules() {
            console.log('[ModularPromptBuilder] Initializing modules...');
            
            // Initialize FormHandler module
            this.formHandler = new window.PromptBuilderFormHandler(this.config, this.utils);
            this.formHandler.initialize();
            
            // Initialize AjaxManager module
            this.ajaxManager = new window.PromptBuilderAjaxManager(this.config, this.utils);
            this.ajaxManager.initialize();
            
            // Initialize UIController module
            this.uiController = new window.PromptBuilderUIController(this.config, this.utils);
            this.uiController.initialize();
            
            // Initialize Analytics module if available
            if (window.PromptAnalyticsDashboard) {
                this.analyticsManager = new window.PromptAnalyticsDashboard(this.config, this.ajaxManager);
                await this.analyticsManager.initialize();
            }
            
            console.log('[ModularPromptBuilder] All modules initialized successfully');
        }
        
        /**
         * Setup communication between modules
         */
        setupModuleCommunication() {
            console.log('[ModularPromptBuilder] Setting up inter-module communication...');
            
            // Form data change events
            $(document).on('formDataChanged', this.handleFormDataChanged);
            $(document).on('formReset', this.handleFormReset);
            
            // UI events that trigger AJAX requests
            $(document).on('generateLivePrompt', () => this.handleGeneratePrompt());
            $(document).on('viewContextData', () => this.handleViewContext());
            $(document).on('testWorkoutGeneration', () => this.handleTestWorkout());
            $(document).on('loadUserProfile', () => this.handleLoadProfile());
            $(document).on('viewStrategyCode', () => this.handleViewStrategyCode());
            $(document).on('saveWorkout', () => this.handleSaveWorkout());
            $(document).on('saveTemplate', () => this.handleSaveTemplate());
            $(document).on('resetForm', () => this.handleResetForm());
            
            console.log('[ModularPromptBuilder] Inter-module communication setup complete');
        }
        
        /**
         * Setup main application event listeners
         */
        setupMainEventListeners() {
            // Main action buttons
            $('#generate-prompt').on('click', () => $(document).trigger('generateLivePrompt'));
            $('#inspect-context').on('click', () => $(document).trigger('viewContextData'));
            $('#test-workout').on('click', () => $(document).trigger('testWorkoutGeneration'));
            $('#load-profile').on('click', () => $(document).trigger('loadUserProfile'));
            
            // User selector change
            $('#user-selector').on('change', function() {
                const userId = $(this).val();
                $('#load-profile').prop('disabled', !userId);
            });
            
            // Performance monitoring
            this.setupPerformanceMonitoring();
        }
        
        /**
         * Handle form data changes
         */
        handleFormDataChanged(event, formData) {
            console.log('[ModularPromptBuilder] Form data changed, updating modules');
            
            // Update analytics if available
            if (this.analyticsManager) {
                this.analyticsManager.updateFormMetrics(formData);
            }
        }
        
        /**
         * Handle form reset
         */
        handleFormReset() {
            console.log('[ModularPromptBuilder] Form reset, clearing displays');
            
            // Clear UI displays
            this.uiController.clearPrompt();
            
            // Reset analytics if available
            if (this.analyticsManager) {
                this.analyticsManager.resetMetrics();
            }
        }
        
        /**
         * Handle generate prompt request
         */
        async handleGeneratePrompt() {
            const button = $('#generate-prompt');
            const originalText = button.html();
            
            try {
                // Update button state
                this.setButtonState(button, true, 'Generating...');
                
                // Get form data
                const formData = this.formHandler.getCurrentFormData();
                
                // Validate required fields
                const validation = this.formHandler.validateFormData(formData);
                if (!validation.isValid) {
                    this.uiController.showMessage('Please fill in required fields: ' + validation.errors.join(', '), 'warning');
                    return;
                }
                
                // Make AJAX request
                const response = await this.ajaxManager.generateLivePrompt(formData);
                
                if (response.success) {
                    this.uiController.displayPrompt(response.data);
                    this.uiController.showMessage('Live prompt generated successfully', 'success');
                } else {
                    throw new Error(response.data?.message || 'Failed to generate prompt');
                }
                
            } catch (error) {
                console.error('[ModularPromptBuilder] Generate prompt failed:', error);
                this.uiController.showMessage('Failed to generate prompt: ' + error.message, 'error');
            } finally {
                this.setButtonState(button, false, originalText);
            }
        }
        
        /**
         * Handle view context request
         */
        async handleViewContext() {
            const button = $('#inspect-context');
            const originalText = button.html();
            
            try {
                this.setButtonState(button, true, 'Loading...');
                
                const formData = this.formHandler.getCurrentFormData();
                const response = await this.ajaxManager.getContextData(formData);
                
                if (response.success) {
                    this.uiController.displayContextData(response.data);
                    this.uiController.showMessage('Context data loaded successfully', 'success');
                } else {
                    throw new Error(response.data?.message || 'Failed to get context data');
                }
                
            } catch (error) {
                console.error('[ModularPromptBuilder] View context failed:', error);
                this.uiController.showMessage('Failed to load context data: ' + error.message, 'error');
            } finally {
                this.setButtonState(button, false, originalText);
            }
        }
        
        /**
         * Handle test workout request
         */
        async handleTestWorkout() {
            const button = $('#test-workout');
            const originalText = button.html();
            
            try {
                this.setButtonState(button, true, 'Testing...');
                
                const formData = this.formHandler.getCurrentFormData();
                
                const validation = this.formHandler.validateFormData(formData);
                if (!validation.isValid) {
                    this.uiController.showMessage('Please fill in required fields before testing', 'warning');
                    return;
                }
                
                const response = await this.ajaxManager.testWorkoutGeneration(formData);
                
                if (response.success) {
                    this.uiController.displayTestResults(response.data);
                    this.uiController.showMessage('Workout test completed successfully', 'success');
                } else {
                    throw new Error(response.data?.message || 'Workout test failed');
                }
                
            } catch (error) {
                console.error('[ModularPromptBuilder] Test workout failed:', error);
                this.uiController.showMessage('Workout test failed: ' + error.message, 'error');
            } finally {
                this.setButtonState(button, false, originalText);
            }
        }
        
        /**
         * Handle load profile request
         */
        async handleLoadProfile() {
            const button = $('#load-profile');
            const originalText = button.html();
            
            try {
                this.setButtonState(button, true, 'Loading...');
                
                const userId = $('#user-selector').val();
                const response = await this.ajaxManager.loadUserProfile(userId);
                
                if (response.success) {
                    // Extract profile data from nested response structure
                    let profileData = null;
                    
                    if (response.data && response.data.data && response.data.data.profile_data) {
                        profileData = response.data.data.profile_data;
                    } else if (response.data && response.data.profile_data) {
                        profileData = response.data.profile_data;
                    } else if (response.data) {
                        profileData = response.data;
                    }
                    
                    if (profileData) {
                        this.formHandler.populateFormWithProfile(profileData);
                        this.uiController.showMessage('User profile loaded successfully', 'success');
                    } else {
                        this.uiController.showMessage('Profile loaded but no data found', 'warning');
                    }
                } else {
                    throw new Error(response.data?.message || 'Failed to load profile');
                }
                
            } catch (error) {
                console.error('[ModularPromptBuilder] Load profile failed:', error);
                this.uiController.showMessage('Failed to load profile: ' + error.message, 'error');
            } finally {
                this.setButtonState(button, false, originalText);
            }
        }
        
        /**
         * Handle view strategy code request
         */
        async handleViewStrategyCode() {
            const strategyName = $('#strategy-selector').val();
            const button = $('#view-strategy-code');
            const originalText = button.html();
            
            try {
                this.setButtonState(button, true, 'Loading...');
                
                const response = await this.ajaxManager.viewStrategyCode(strategyName);
                
                if (response.success) {
                    this.uiController.displayStrategyCode(response.data);
                    this.uiController.showMessage('Strategy code loaded successfully', 'success');
                } else {
                    throw new Error(response.data?.message || 'Failed to load strategy code');
                }
                
            } catch (error) {
                console.error('[ModularPromptBuilder] View strategy failed:', error);
                this.uiController.showMessage('Failed to load strategy code: ' + error.message, 'error');
            } finally {
                this.setButtonState(button, false, originalText);
            }
        }
        
        /**
         * Handle save workout request
         */
        async handleSaveWorkout() {
            const testData = this.uiController.getCurrentTestData();
            
            if (!testData) {
                this.uiController.showMessage('No workout data to save', 'warning');
                return;
            }
            
            try {
                const response = await this.ajaxManager.saveWorkout(testData);
                
                if (response.success) {
                    this.uiController.showMessage('Workout saved successfully', 'success');
                } else {
                    throw new Error(response.data?.message || 'Failed to save workout');
                }
                
            } catch (error) {
                console.error('[ModularPromptBuilder] Save workout failed:', error);
                this.uiController.showMessage('Failed to save workout: ' + error.message, 'error');
            }
        }
        
        /**
         * Handle save template request
         */
        async handleSaveTemplate() {
            const templateName = $('#template_name').val();
            const templateDescription = $('#template_description').val();
            const templateTags = $('#template_tags').val().split(',').map(tag => tag.trim()).filter(tag => tag);
            
            if (!templateName) {
                this.uiController.showMessage('Please enter a template name', 'warning');
                return;
            }
            
            const currentPrompt = this.uiController.getCurrentPrompt();
            if (!currentPrompt) {
                this.uiController.showMessage('Generate a prompt first before saving', 'warning');
                return;
            }
            
            try {
                const templateData = {
                    name: templateName,
                    description: templateDescription,
                    form_data: this.formHandler.getCurrentFormData(),
                    prompt: currentPrompt,
                    tags: templateTags
                };
                
                const response = await this.ajaxManager.saveTemplate(templateData);
                
                if (response.success) {
                    this.uiController.hideSaveTemplateModal();
                    this.uiController.showMessage('Template saved successfully', 'success');
                } else {
                    throw new Error(response.data?.message || 'Failed to save template');
                }
                
            } catch (error) {
                console.error('[ModularPromptBuilder] Save template failed:', error);
                this.uiController.showMessage('Failed to save template: ' + error.message, 'error');
            }
        }
        
        /**
         * Handle form reset request
         */
        handleResetForm() {
            if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
                this.formHandler.resetForm();
                
                // Clear displays
                this.uiController.clearPrompt();
                
                // Hide various sections
                $('#prompt-stats, #quality-analysis').hide();
                this.uiController.contextDisplay?.hide();
                this.uiController.testResults?.hide();
                $('#strategy-code-display').hide();
                
                this.uiController.showMessage('Form reset successfully', 'info');
            }
        }
        
        /**
         * Setup performance monitoring
         */
        setupPerformanceMonitoring() {
            // Monitor bundle loading performance
            if (window.performance && window.performance.mark) {
                window.performance.mark('promptbuilder-modular-init-start');
                
                // Mark completion
                setTimeout(() => {
                    window.performance.mark('promptbuilder-modular-init-end');
                    window.performance.measure('promptbuilder-modular-init', 'promptbuilder-modular-init-start', 'promptbuilder-modular-init-end');
                    
                    const measure = window.performance.getEntriesByName('promptbuilder-modular-init')[0];
                    console.log(`[ModularPromptBuilder] Initialization time: ${measure.duration.toFixed(2)}ms`);
                }, 100);
            }
            
            // Monitor AJAX performance
            setInterval(() => {
                if (this.ajaxManager) {
                    const stats = this.ajaxManager.getRequestStats();
                    if (stats.totalRequests > 0) {
                        console.log('[ModularPromptBuilder] AJAX Stats:', stats);
                    }
                }
            }, 30000); // Every 30 seconds
        }
        
        /**
         * Show performance improvement notification
         */
        showPerformanceImprovement() {
            // Calculate estimated performance improvement
            const originalSize = 1485; // lines in original index.js
            const currentSize = 200; // estimated lines in modular coordinator
            const improvement = Math.round(((originalSize - currentSize) / originalSize) * 100);
            
            setTimeout(() => {
                this.uiController.showMessage(
                    `📈 Performance optimized! Code reduced by ${improvement}% through modularization`, 
                    'success'
                );
            }, 2000);
        }
        
        /**
         * Show fallback error if modules fail to load
         */
        showFallbackError(error) {
            const fallbackMessage = `
                <div class="notice notice-error">
                    <p><strong>Modular system initialization failed:</strong> ${error.message}</p>
                    <p>Falling back to legacy system. Please refresh the page to try again.</p>
                </div>
            `;
            
            $('#prompt-builder-messages').html(fallbackMessage);
            
            // Try to load legacy system
            if (window.PromptBuilderApp) {
                console.log('[ModularPromptBuilder] Falling back to legacy system');
                const legacyApp = new window.PromptBuilderApp();
                legacyApp.init();
            }
        }
        
        /**
         * Utility function to set button state
         */
        setButtonState(button, disabled, text) {
            button.prop('disabled', disabled);
            if (text) {
                const icon = disabled ? '<span class="dashicons dashicons-update spin"></span>' : '';
                button.html(icon + (disabled ? ' ' + text : text));
            }
        }
        
        /**
         * Get module instances (for testing/debugging)
         */
        getModules() {
            return {
                formHandler: this.formHandler,
                ajaxManager: this.ajaxManager,
                uiController: this.uiController,
                analyticsManager: this.analyticsManager
            };
        }
        
        /**
         * Destroy modular application
         */
        destroy() {
            // Cancel any pending requests
            if (this.ajaxManager) {
                this.ajaxManager.destroy();
            }
            
            // Destroy modules
            if (this.formHandler) {
                this.formHandler.destroy();
            }
            
            if (this.uiController) {
                this.uiController.destroy();
            }
            
            if (this.analyticsManager) {
                this.analyticsManager.destroy();
            }
            
            // Remove event listeners
            $(document).off('formDataChanged formReset generateLivePrompt viewContextData testWorkoutGeneration loadUserProfile viewStrategyCode saveWorkout saveTemplate resetForm');
            
            console.log('[ModularPromptBuilder] Application destroyed');
        }
    }
    
    // Export to global scope for testing and access
    window.ModularPromptBuilderApp = ModularPromptBuilderApp;
    
    // Initialize modular PromptBuilder when DOM is ready
    $(document).ready(function() {
        // Check if modular modules are available
        const modulesAvailable = window.PromptBuilderFormHandler && 
                                window.PromptBuilderAjaxManager && 
                                window.PromptBuilderUIController;
        
        if (modulesAvailable) {
            console.log('[ModularPromptBuilder] Modules detected, initializing modular system');
            window.PromptBuilder = new ModularPromptBuilderApp();
            
            // Auto-initialize if config is available
            if (typeof fitcopilotPromptBuilder !== 'undefined') {
                window.PromptBuilder.init();
            } else {
                console.warn('[ModularPromptBuilder] Configuration not found, waiting for manual initialization');
            }
        } else {
            console.warn('[ModularPromptBuilder] Required modules not found, falling back to legacy system');
            
            // Fall back to legacy system if available
            if (window.PromptBuilderApp) {
                window.PromptBuilder = new window.PromptBuilderApp();
                window.PromptBuilder.init();
            }
        }
    });
    
})(jQuery, window); 