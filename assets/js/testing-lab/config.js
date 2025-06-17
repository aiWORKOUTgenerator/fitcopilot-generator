/**
 * Testing Lab Configuration Module
 * 
 * Centralized configuration and initialization for the Testing Lab
 */

export class TestingLabConfig {
    constructor() {
        this.config = {
            ajaxUrl: window.ajaxurl || window.fitcopilotTestingLab?.ajaxUrl || '/wp-admin/admin-ajax.php',
            nonce: window.fitcopilotTestingLab?.nonce || window.fitcopilotData?.nonce || '',
            refreshInterval: 2000, // 2 seconds
            maxLogEntries: 1000,
            autoRefresh: false,
            debug: window.fitcopilotTestingLab?.debug || false
        };
        
        this.validateConfig();
    }
    
    /**
     * Validate configuration
     */
    validateConfig() {
        if (!this.config.nonce) {
            console.warn('[TestingLab] No nonce found in configuration');
        }
        
        if (!this.config.ajaxUrl) {
            console.error('[TestingLab] No AJAX URL found in configuration');
        }
        
        if (this.config.debug) {
            console.log('[TestingLab] Configuration:', this.config);
        }
    }
    
    /**
     * Get configuration value
     * 
     * @param {string} key Configuration key
     * @param {*} defaultValue Default value if key not found
     * @returns {*} Configuration value
     */
    get(key, defaultValue = null) {
        return this.config[key] !== undefined ? this.config[key] : defaultValue;
    }
    
    /**
     * Set configuration value
     * 
     * @param {string} key Configuration key
     * @param {*} value Configuration value
     */
    set(key, value) {
        this.config[key] = value;
    }
    
    /**
     * Get all configuration
     * 
     * @returns {Object} Complete configuration object
     */
    getAll() {
        return { ...this.config };
    }
    
    /**
     * Update configuration from object
     * 
     * @param {Object} updates Configuration updates
     */
    update(updates) {
        this.config = { ...this.config, ...updates };
        this.validateConfig();
    }
}

/**
 * Test ID Generator
 */
export class TestIdGenerator {
    /**
     * Generate unique test ID
     * 
     * @param {string} prefix Test prefix
     * @returns {string} Unique test ID
     */
    static generate(prefix = 'test') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}_${random}`;
    }
}

/**
 * Utility functions
 */
export class TestingLabUtils {
    /**
     * Parse JSON safely
     * 
     * @param {string} jsonString JSON string to parse
     * @returns {Object|null} Parsed object or null
     */
    static parseJsonSafely(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('[TestingLab] JSON parsing failed:', e);
            return null;
        }
    }
    
    /**
     * Format timestamp
     * 
     * @param {number|string} timestamp Timestamp to format
     * @returns {string} Formatted timestamp
     */
    static formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }
    
    /**
     * Escape HTML
     * 
     * @param {string} text Text to escape
     * @returns {string} Escaped text
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Format context for display
     * 
     * @param {Object} context Context object
     * @returns {string} Formatted context
     */
    static formatContext(context) {
        return JSON.stringify(context, null, 2);
    }
    
    /**
     * Debounce function
     * 
     * @param {Function} func Function to debounce
     * @param {number} wait Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
} 