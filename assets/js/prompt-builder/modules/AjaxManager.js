/**
 * PromptBuilder - AjaxManager Module
 * 
 * Handles all AJAX requests and API communication
 * Extracted from monolithic index.js for performance optimization
 */

(function($, window) {
    'use strict';
    
    // Ensure jQuery is available for this module (though not directly used)
    if (typeof $ === 'undefined') {
        console.warn('AjaxManager: jQuery not available - some functionality may be limited');
    }
    
    /**
     * AjaxManager Module
     * Manages all AJAX requests with proper error handling and response processing
     */
    class AjaxManager {
        constructor(config, utils) {
            this.config = config;
            this.utils = utils;
            this.pendingRequests = new Map();
            this.requestCounter = 0;
            
            // Bind methods
            this.makeRequest = this.makeRequest.bind(this);
            this.cancelRequest = this.cancelRequest.bind(this);
            this.cancelAllRequests = this.cancelAllRequests.bind(this);
        }
        
        /**
         * Initialize AJAX manager
         */
        initialize() {
            console.log('[AjaxManager] Initialized successfully');
        }
        
        /**
         * Make AJAX request with comprehensive error handling
         */
        async makeRequest(action, data = {}, options = {}) {
            const requestId = ++this.requestCounter;
            const timeout = options.timeout || this.config.get('ajaxTimeout', 30000);
            
            console.log(`[AjaxManager] Making request ${requestId}: ${action}`);
            
            const requestData = {
                action: action,
                nonce: window.fitcopilotPromptBuilder?.nonce || '',
                ...data
            };
            
            const ajaxOptions = {
                url: window.fitcopilotPromptBuilder?.ajaxUrl || window.ajaxurl,
                type: 'POST',
                data: requestData,
                timeout: timeout,
                dataType: 'json'
            };
            
            return new Promise((resolve, reject) => {
                const xhr = $.ajax(ajaxOptions)
                    .done((response) => {
                        this.pendingRequests.delete(requestId);
                        
                        // Process response
                        const processedResponse = this.processResponse(response, action);
                        console.log(`[AjaxManager] Request ${requestId} completed successfully`);
                        resolve(processedResponse);
                    })
                    .fail((xhr, status, error) => {
                        this.pendingRequests.delete(requestId);
                        
                        const errorInfo = this.processError(xhr, status, error, action);
                        console.error(`[AjaxManager] Request ${requestId} failed:`, errorInfo);
                        reject(new Error(errorInfo.message));
                    });
                
                // Store request for potential cancellation
                this.pendingRequests.set(requestId, xhr);
            });
        }
        
        /**
         * Process AJAX response
         */
        processResponse(response, action) {
            // Ensure response is properly formatted
            if (typeof response === 'string') {
                try {
                    response = JSON.parse(response);
                } catch (e) {
                    console.error('[AjaxManager] Invalid JSON response:', response);
                    throw new Error('Invalid server response format');
                }
            }
            
            // Validate response structure
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response structure');
            }
            
            // Log successful responses in debug mode
            if (this.config.get('debug', false)) {
                console.log(`[AjaxManager] Response for ${action}:`, response);
            }
            
            return response;
        }
        
        /**
         * Process AJAX error
         */
        processError(xhr, status, error, action) {
            const errorInfo = {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText,
                error: error,
                action: action,
                message: `AJAX error: ${error}`
            };
            
            // Try to extract meaningful error message
            if (xhr.responseText) {
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse && errorResponse.data && errorResponse.data.message) {
                        errorInfo.message = errorResponse.data.message;
                    } else if (errorResponse && errorResponse.message) {
                        errorInfo.message = errorResponse.message;
                    }
                } catch (e) {
                    // Response is not JSON, use HTTP status
                    if (xhr.status === 0) {
                        errorInfo.message = 'Network error - please check your connection';
                    } else if (xhr.status === 403) {
                        errorInfo.message = 'Access denied - please refresh the page';
                    } else if (xhr.status === 404) {
                        errorInfo.message = 'Service not found - please contact support';
                    } else if (xhr.status >= 500) {
                        errorInfo.message = 'Server error - please try again later';
                    } else {
                        errorInfo.message = `Server error: ${xhr.status} ${xhr.statusText}`;
                    }
                }
            }
            
            return errorInfo;
        }
        
        /**
         * Generate live prompt
         */
        async generateLivePrompt(formData) {
            return this.makeRequest('fitcopilot_prompt_builder_generate', {
                form_data: formData
            });
        }
        
        /**
         * Get context data
         */
        async getContextData(formData) {
            return this.makeRequest('fitcopilot_prompt_builder_get_context', {
                form_data: formData
            });
        }
        
        /**
         * Test workout generation
         */
        async testWorkoutGeneration(testData) {
            return this.makeRequest('fitcopilot_prompt_builder_test_workout', {
                test_data: testData
            }, { timeout: 180000 }); // 3 minutes for workout generation
        }
        
        /**
         * Load user profile
         */
        async loadUserProfile(userId = null) {
            const data = {};
            if (userId) {
                data.user_id = userId;
            }
            
            return this.makeRequest('fitcopilot_prompt_builder_load_profile', data);
        }
        
        /**
         * View strategy code
         */
        async viewStrategyCode(strategyName) {
            return this.makeRequest('fitcopilot_prompt_builder_view_code', {
                strategy_name: strategyName
            });
        }
        
        /**
         * Save workout
         */
        async saveWorkout(workoutData) {
            return this.makeRequest('fitcopilot_prompt_builder_save_workout', {
                workout_data: workoutData
            });
        }
        
        /**
         * Save template
         */
        async saveTemplate(templateData) {
            return this.makeRequest('fitcopilot_prompt_builder_save_template', templateData);
        }
        
        /**
         * Get analytics dashboard data
         */
        async getAnalyticsDashboard(timeRange = '7 days') {
            return this.makeRequest('fitcopilot_analytics_get_dashboard', {
                time_range: timeRange,
                include_trends: true,
                include_comparisons: true
            });
        }
        
        /**
         * Run multi-provider comparison
         */
        async runProviderComparison(testParams) {
            return this.makeRequest('fitcopilot_multi_provider_compare', {
                test_params: JSON.stringify(testParams),
                providers: ['openai'] // Will expand as more providers are added
            });
        }
        
        /**
         * Toggle modular system
         */
        async toggleModularSystem(enabled) {
            return this.makeRequest('fitcopilot_toggle_modular_system', {
                enabled: enabled
            });
        }
        
        /**
         * Get system statistics
         */
        async getSystemStats() {
            return this.makeRequest('fitcopilot_get_system_stats');
        }
        
        /**
         * Test prompt generation (for testing lab)
         */
        async testPromptGeneration(testConfig) {
            return this.makeRequest('fitcopilot_test_prompt_generation', testConfig);
        }
        
        /**
         * Cancel specific request
         */
        cancelRequest(requestId) {
            const xhr = this.pendingRequests.get(requestId);
            if (xhr) {
                xhr.abort();
                this.pendingRequests.delete(requestId);
                console.log(`[AjaxManager] Request ${requestId} cancelled`);
                return true;
            }
            return false;
        }
        
        /**
         * Cancel all pending requests
         */
        cancelAllRequests() {
            let cancelledCount = 0;
            
            this.pendingRequests.forEach((xhr, requestId) => {
                xhr.abort();
                cancelledCount++;
            });
            
            this.pendingRequests.clear();
            
            if (cancelledCount > 0) {
                console.log(`[AjaxManager] Cancelled ${cancelledCount} pending requests`);
            }
            
            return cancelledCount;
        }
        
        /**
         * Get pending requests count
         */
        getPendingRequestsCount() {
            return this.pendingRequests.size;
        }
        
        /**
         * Check if request is pending
         */
        isRequestPending(requestId) {
            return this.pendingRequests.has(requestId);
        }
        
        /**
         * Get request statistics
         */
        getRequestStats() {
            return {
                totalRequests: this.requestCounter,
                pendingRequests: this.pendingRequests.size,
                completedRequests: this.requestCounter - this.pendingRequests.size
            };
        }
        
        /**
         * Destroy AJAX manager
         */
        destroy() {
            this.cancelAllRequests();
            console.log('[AjaxManager] Destroyed');
        }
    }
    
    // Export to global scope
    window.PromptBuilderAjaxManager = AjaxManager;
    
})(jQuery, window); 