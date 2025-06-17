/**
 * PromptBuilder - Phase 1: Configuration and Utilities
 * 
 * Contains configuration management and utility functions
 * for the PromptBuilder system
 */

(function(window) {
    'use strict';
    
    /**
     * PromptBuilder Configuration Class
     * Manages settings and configuration for the PromptBuilder system
     */
    class PromptBuilderConfig {
        constructor() {
            this.settings = {
                // API Configuration
                ajaxTimeout: 30000, // 30 seconds
                debounceDelay: 300, // 300ms for form changes
                
                // UI Configuration
                animationDuration: 250,
                messageDisplayTime: 5000,
                
                // Validation Rules
                requiredFields: ['basic_info.name', 'basic_info.fitness_level', 'session_params.duration'],
                minDuration: 10,
                maxDuration: 180,
                minAge: 13,
                maxAge: 100,
                
                // Prompt Generation
                maxPromptLength: 10000,
                maxTemplateNameLength: 100,
                maxDescriptionLength: 500,
                
                // Statistics
                tokensPerCharacter: 0.25, // Rough approximation
                
                // Quality Thresholds
                qualityThresholds: {
                    personalization: {
                        low: 30,
                        medium: 60,
                        high: 80
                    },
                    completeness: {
                        low: 50,
                        medium: 75,
                        high: 90
                    },
                    clarity: {
                        low: 40,
                        medium: 70,
                        high: 85
                    }
                }
            };
            
            // Merge with global config if available
            if (window.fitcopilotPromptBuilder && window.fitcopilotPromptBuilder.config) {
                this.settings = Object.assign(this.settings, window.fitcopilotPromptBuilder.config);
            }
        }
        
        /**
         * Get configuration value
         */
        get(key, defaultValue = null) {
            const keys = key.split('.');
            let value = this.settings;
            
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return defaultValue;
                }
            }
            
            return value;
        }
        
        /**
         * Set configuration value
         */
        set(key, value) {
            const keys = key.split('.');
            let target = this.settings;
            
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!(k in target) || typeof target[k] !== 'object') {
                    target[k] = {};
                }
                target = target[k];
            }
            
            target[keys[keys.length - 1]] = value;
        }
        
        /**
         * Get all settings
         */
        getAll() {
            return this.settings;
        }
        
        /**
         * Update settings
         */
        update(newSettings) {
            this.settings = Object.assign(this.settings, newSettings);
        }
    }
    
    /**
     * PromptBuilder Utilities Class
     * Provides utility functions for common operations
     */
    class PromptBuilderUtils {
        constructor() {
            this.config = new PromptBuilderConfig();
        }
        
        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml(text) {
            if (typeof text !== 'string') {
                return text;
            }
            
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            
            return text.replace(/[&<>"']/g, function(m) {
                return map[m];
            });
        }
        
        /**
         * Safe JSON parsing
         */
        parseJSON(jsonString, defaultValue = null) {
            try {
                return JSON.parse(jsonString);
            } catch (error) {
                console.warn('[PromptBuilder Utils] JSON parse error:', error);
                return defaultValue;
            }
        }
        
        /**
         * Safe JSON stringification
         */
        stringifyJSON(data, pretty = false) {
            try {
                return JSON.stringify(data, null, pretty ? 2 : 0);
            } catch (error) {
                console.warn('[PromptBuilder Utils] JSON stringify error:', error);
                return '{}';
            }
        }
        
        /**
         * Calculate prompt statistics
         */
        calculatePromptStats(prompt) {
            if (typeof prompt !== 'string') {
                return this.getEmptyStats();
            }
            
            const characters = prompt.length;
            const words = this.countWords(prompt);
            const lines = this.countLines(prompt);
            const sentences = this.countSentences(prompt);
            const paragraphs = this.countParagraphs(prompt);
            const sections = this.countSections(prompt);
            const estimatedTokens = Math.ceil(characters * this.config.get('tokensPerCharacter', 0.25));
            const readabilityScore = this.calculateReadabilityScore(prompt);
            
            return {
                characters,
                words,
                lines,
                sentences,
                paragraphs,
                sections,
                estimatedTokens,
                readabilityScore
            };
        }
        
        /**
         * Get empty statistics object
         */
        getEmptyStats() {
            return {
                characters: 0,
                words: 0,
                lines: 0,
                sentences: 0,
                paragraphs: 0,
                sections: 0,
                estimatedTokens: 0,
                readabilityScore: 0
            };
        }
        
        /**
         * Count words in text
         */
        countWords(text) {
            if (!text) return 0;
            return text.trim().split(/\s+/).filter(word => word.length > 0).length;
        }
        
        /**
         * Count lines in text
         */
        countLines(text) {
            if (!text) return 0;
            return text.split('\n').length;
        }
        
        /**
         * Count sentences in text
         */
        countSentences(text) {
            if (!text) return 0;
            return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
        }
        
        /**
         * Count paragraphs in text
         */
        countParagraphs(text) {
            if (!text) return 0;
            return text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
        }
        
        /**
         * Count sections in text (lines starting with capital letters or numbers)
         */
        countSections(text) {
            if (!text) return 0;
            const matches = text.match(/^[A-Z0-9]/gm);
            return matches ? matches.length : 0;
        }
        
        /**
         * Calculate readability score (simplified Flesch Reading Ease)
         */
        calculateReadabilityScore(text) {
            if (!text) return 0;
            
            const words = this.countWords(text);
            const sentences = this.countSentences(text);
            const syllables = this.countSyllables(text);
            
            if (sentences === 0 || words === 0) return 0;
            
            // Simplified Flesch Reading Ease formula
            const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
            
            return Math.max(0, Math.min(100, Math.round(score)));
        }
        
        /**
         * Count syllables in text (approximation)
         */
        countSyllables(text) {
            if (!text) return 0;
            
            const words = text.toLowerCase().match(/\b[a-z]+\b/g);
            if (!words) return 0;
            
            let syllableCount = 0;
            
            words.forEach(word => {
                // Count vowel groups
                const vowelGroups = word.match(/[aeiouy]+/g);
                let syllables = vowelGroups ? vowelGroups.length : 0;
                
                // Adjust for silent e
                if (word.endsWith('e') && syllables > 1) {
                    syllables--;
                }
                
                // Ensure at least one syllable per word
                syllableCount += Math.max(1, syllables);
            });
            
            return syllableCount;
        }
        
        /**
         * Validate form data
         */
        validateFormData(formData) {
            const errors = [];
            const requiredFields = this.config.get('requiredFields', []);
            
            requiredFields.forEach(fieldPath => {
                const value = this.getNestedValue(formData, fieldPath);
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    errors.push(`Field ${fieldPath} is required`);
                }
            });
            
            // Validate specific fields
            if (formData.basic_info) {
                if (formData.basic_info.age && (formData.basic_info.age < this.config.get('minAge', 13) || formData.basic_info.age > this.config.get('maxAge', 100))) {
                    errors.push('Age must be between 13 and 100');
                }
            }
            
            if (formData.session_params) {
                const duration = formData.session_params.duration;
                if (duration && (duration < this.config.get('minDuration', 10) || duration > this.config.get('maxDuration', 180))) {
                    errors.push('Duration must be between 10 and 180 minutes');
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }
        
        /**
         * Get nested value from object
         */
        getNestedValue(obj, path) {
            const keys = path.split('.');
            let value = obj;
            
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return null;
                }
            }
            
            return value;
        }
        
        /**
         * Format file size
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        /**
         * Format duration
         */
        formatDuration(milliseconds) {
            if (milliseconds < 1000) {
                return `${milliseconds}ms`;
            } else if (milliseconds < 60000) {
                return `${(milliseconds / 1000).toFixed(1)}s`;
            } else {
                return `${(milliseconds / 60000).toFixed(1)}m`;
            }
        }
        
        /**
         * Copy text to clipboard
         */
        async copyToClipboard(text) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    // Fallback for older browsers or non-secure contexts
                    return this.fallbackCopyToClipboard(text);
                }
            } catch (error) {
                console.warn('[PromptBuilder Utils] Copy to clipboard failed:', error);
                return this.fallbackCopyToClipboard(text);
            }
        }
        
        /**
         * Fallback copy to clipboard method
         */
        fallbackCopyToClipboard(text) {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                return result;
            } catch (error) {
                console.warn('[PromptBuilder Utils] Fallback copy failed:', error);
                return false;
            }
        }
        
        /**
         * Download text as file
         */
        downloadAsFile(content, filename, mimeType = 'text/plain') {
            try {
                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
                return true;
            } catch (error) {
                console.warn('[PromptBuilder Utils] Download failed:', error);
                return false;
            }
        }
        
        /**
         * Debounce function
         */
        debounce(func, wait, immediate = false) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func.apply(this, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(this, args);
            };
        }
        
        /**
         * Throttle function
         */
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
        
        /**
         * Generate unique ID
         */
        generateId(prefix = 'pb') {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        /**
         * Format timestamp
         */
        formatTimestamp(date = null) {
            const d = date ? new Date(date) : new Date();
            return d.toLocaleString();
        }
        
        /**
         * Get quality level based on score
         */
        getQualityLevel(type, score) {
            const thresholds = this.config.get(`qualityThresholds.${type}`, {});
            
            if (score >= thresholds.high) return 'high';
            if (score >= thresholds.medium) return 'medium';
            if (score >= thresholds.low) return 'low';
            return 'very-low';
        }
        
        /**
         * Get quality color based on level
         */
        getQualityColor(level) {
            const colors = {
                'very-low': '#dc3545',   // Red
                'low': '#fd7e14',        // Orange
                'medium': '#ffc107',     // Yellow
                'high': '#28a745'        // Green
            };
            
            return colors[level] || colors['very-low'];
        }
        
        /**
         * Sanitize filename
         */
        sanitizeFilename(filename) {
            return filename
                .replace(/[^\w\s.-]/gi, '')
                .replace(/\s+/g, '_')
                .toLowerCase();
        }
        
        /**
         * Check if object is empty
         */
        isEmpty(obj) {
            if (obj == null) return true;
            if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
            return Object.keys(obj).length === 0;
        }
        
        /**
         * Deep clone object
         */
        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
            return obj;
        }
        
        /**
         * Log message with timestamp
         */
        log(message, level = 'info') {
            const timestamp = this.formatTimestamp();
            const logMessage = `[${timestamp}] [PromptBuilder] ${message}`;
            
            switch (level) {
                case 'error':
                    console.error(logMessage);
                    break;
                case 'warn':
                    console.warn(logMessage);
                    break;
                case 'debug':
                    if (this.config.get('debug', false)) {
                        console.debug(logMessage);
                    }
                    break;
                default:
                    console.log(logMessage);
            }
        }
    }
    
    // Export to global scope
    window.PromptBuilderConfig = PromptBuilderConfig;
    window.PromptBuilderUtils = PromptBuilderUtils;
    
    // Initialize global instances
    window.promptBuilderConfig = new PromptBuilderConfig();
    window.promptBuilderUtils = new PromptBuilderUtils();
    
})(window); 