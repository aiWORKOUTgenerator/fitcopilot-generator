/**
 * Testing Lab API Client Module
 * 
 * Handles all AJAX requests and API communication for the Testing Lab
 */

import { TestingLabUtils } from './config.js';

export class TestingLabApiClient {
    constructor(config) {
        this.config = config;
        this.requestCount = 0;
        this.errorCount = 0;
    }
    
    /**
     * Make API request
     * 
     * @param {string} action WordPress AJAX action
     * @param {Object} data Request data
     * @param {Object} options Request options
     * @returns {Promise<Object>} API response
     */
    async request(action, data = {}, options = {}) {
        this.requestCount++;
        
        const requestData = {
            action: action,
            nonce: this.config.get('nonce'),
            ...data
        };
        
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestData).toString(),
            ...options
        };
        
        if (this.config.get('debug')) {
            console.log(`[API] ${action} request:`, requestData);
        }
        
        try {
            const response = await fetch(this.config.get('ajaxUrl'), requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseText = await response.text();
            const result = TestingLabUtils.parseJsonSafely(responseText);
            
            if (!result) {
                throw new Error('Invalid JSON response from server');
            }
            
            if (this.config.get('debug')) {
                console.log(`[API] ${action} response:`, result);
            }
            
            return result;
            
        } catch (error) {
            this.errorCount++;
            console.error(`[API] ${action} failed:`, error);
            throw error;
        }
    }
    
    /**
     * Test workout generation
     * 
     * @param {Object} testData Test parameters
     * @returns {Promise<Object>} Test results
     */
    async testWorkoutGeneration(testData) {
        return this.request('fitcopilot_debug_test_workout', {
            test_data: JSON.stringify(testData)
        });
    }
    
    /**
     * Test prompt building
     * 
     * @param {Object} testData Test parameters
     * @returns {Promise<Object>} Test results
     */
    async testPromptBuilding(testData) {
        return this.request('fitcopilot_debug_test_prompt', {
            test_data: JSON.stringify(testData)
        });
    }
    
    /**
     * Validate context
     * 
     * @param {Object} contextData Context data to validate
     * @returns {Promise<Object>} Validation results
     */
    async validateContext(contextData) {
        return this.request('fitcopilot_debug_validate_context', {
            context_data: JSON.stringify(contextData)
        });
    }
    
    /**
     * Test performance
     * 
     * @param {Object} testData Test parameters
     * @returns {Promise<Object>} Performance test results
     */
    async testPerformance(testData) {
        return this.request('fitcopilot_debug_performance_test', {
            test_data: JSON.stringify(testData)
        });
    }
    
    /**
     * Test profile-based workout generation
     * 
     * @param {Object} profileData Profile data
     * @returns {Promise<Object>} Test results
     */
    async testProfileWorkoutGeneration(profileData) {
        return this.request('fitcopilot_debug_test_profile_workout_generation', {
            profile_data: JSON.stringify(profileData)
        });
    }
    
    /**
     * Test prompt generation
     */
    async testPromptGeneration(testParams) {
        return this.request('fitcopilot_debug_test_prompt_generation', {
            test_params: JSON.stringify(testParams)
        });
    }
    
    /**
     * Toggle modular system
     */
    async toggleModularSystem(enabled) {
        return this.request('fitcopilot_debug_toggle_modular_system', {
            enabled: enabled ? '1' : '0'
        });
    }
    
    /**
     * Get system statistics
     * 
     * @returns {Promise<Object>} System stats
     */
    async getSystemStats() {
        return this.request('fitcopilot_debug_get_system_stats');
    }
    
    /**
     * Get logs
     * 
     * @param {Object} filters Log filters
     * @returns {Promise<Object>} Log data
     */
    async getLogs(filters = {}) {
        return this.request('fitcopilot_debug_get_logs', {
            filters: JSON.stringify(filters)
        });
    }
    
    /**
     * Clear logs
     * 
     * @returns {Promise<Object>} Clear result
     */
    async clearLogs() {
        return this.request('fitcopilot_debug_clear_logs');
    }
    
    /**
     * Export logs
     * 
     * @param {string} format Export format
     * @param {Object} filters Log filters
     * @returns {Promise<Object>} Export data
     */
    async exportLogs(format = 'json', filters = {}) {
        return this.request('fitcopilot_debug_export_logs', {
            format: format,
            filters: JSON.stringify(filters)
        });
    }
    
    /**
     * Get performance metrics
     * 
     * @param {number} hours Hours to look back
     * @returns {Promise<Object>} Performance metrics
     */
    async getPerformanceMetrics(hours = 24) {
        return this.request('fitcopilot_get_performance_metrics', {
            hours: hours
        });
    }
    
    /**
     * Get system health
     * 
     * @returns {Promise<Object>} System health data
     */
    async getSystemHealth() {
        return this.request('fitcopilot_get_system_health');
    }
    
    /**
     * Get user profile data
     * 
     * @param {number} userId WordPress user ID
     * @returns {Promise<Object>} User profile data
     */
    async getUserProfile(userId) {
        return this.request('fitcopilot_get_user_profile', {
            user_id: userId
        });
    }
    
    /**
     * Compare system performance
     */
    async compareSystemPerformance() {
        return this.request('fitcopilot_debug_compare_systems');
    }
    
    /**
     * Get API statistics
     * 
     * @returns {Object} API usage statistics
     */
    getStats() {
        return {
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            successRate: this.requestCount > 0 ? ((this.requestCount - this.errorCount) / this.requestCount * 100).toFixed(2) : 0
        };
    }
    
    /**
     * Reset API statistics
     */
    resetStats() {
        this.requestCount = 0;
        this.errorCount = 0;
    }
} 