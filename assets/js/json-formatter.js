/**
 * Enhanced JSON Formatter for Live Prompt Preview
 * 
 * Provides advanced JSON formatting capabilities including:
 * - Responsive word wrapping without horizontal scrolling
 * - Syntax highlighting for better readability
 * - Collapsible sections for large JSON objects
 * - Copy-to-clipboard functionality
 * - Mobile-optimized display
 * - Dark mode support
 * 
 * @version 1.0.0
 * @author FitCopilot Team
 */

class JSONFormatter {
    constructor(options = {}) {
        this.options = {
            maxLineLength: options.maxLineLength || 80,
            indentSize: options.indentSize || 2,
            enableSyntaxHighlighting: options.enableSyntaxHighlighting !== false,
            enableCollapsible: options.enableCollapsible !== false,
            enableCopyToClipboard: options.enableCopyToClipboard !== false,
            enableSizeIndicator: options.enableSizeIndicator !== false,
            truncateLongStrings: options.truncateLongStrings !== false,
            maxStringLength: options.maxStringLength || 200,
            ...options
        };
        
        this.bindEvents();
    }

    /**
     * Format JSON with enhanced display options
     * 
     * @param {Object|string} data - JSON data to format
     * @param {HTMLElement} container - Container element to render into
     * @param {Object} options - Display options
     * @returns {HTMLElement} - Formatted container
     */
    formatJSON(data, container, options = {}) {
        const formatOptions = { ...this.options, ...options };
        
        try {
            // Parse data if it's a string
            const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
            
            // Clear container
            container.innerHTML = '';
            
            // Create JSON viewer structure
            const viewer = this.createJSONViewer(jsonData, formatOptions);
            container.appendChild(viewer);
            
            // Bind events
            this.bindViewerEvents(viewer);
            
            return viewer;
            
        } catch (error) {
            console.error('[JSONFormatter] Failed to format JSON:', error);
            return this.createErrorDisplay(container, error, data);
        }
    }

    /**
     * Create enhanced JSON viewer with controls
     * 
     * @param {Object} jsonData - Parsed JSON data
     * @param {Object} options - Format options
     * @returns {HTMLElement} - JSON viewer element
     */
    createJSONViewer(jsonData, options) {
        const viewer = document.createElement('div');
        viewer.className = 'json-viewer-container';
        
        // Add header with controls
        if (options.enableControls !== false) {
            const header = this.createViewerHeader(jsonData, options);
            viewer.appendChild(header);
        }
        
        // Add size indicator
        if (options.enableSizeIndicator) {
            const sizeIndicator = this.createSizeIndicator(jsonData);
            viewer.appendChild(sizeIndicator);
        }
        
        // Add content area
        const content = this.createViewerContent(jsonData, options);
        viewer.appendChild(content);
        
        return viewer;
    }

    /**
     * Create viewer header with controls
     * 
     * @param {Object} jsonData - JSON data
     * @param {Object} options - Options
     * @returns {HTMLElement} - Header element
     */
    createViewerHeader(jsonData, options) {
        const header = document.createElement('div');
        header.className = 'json-viewer-header';
        
        const title = document.createElement('span');
        title.textContent = 'Workout Request JSON';
        title.className = 'json-viewer-title';
        
        const controls = document.createElement('div');
        controls.className = 'json-viewer-controls';
        
        // Format toggle buttons
        const formatButtons = [
            { id: 'formatted', label: '🎨 Formatted', active: true },
            { id: 'compact', label: '📋 Compact', active: false },
            { id: 'raw', label: '📄 Raw', active: false }
        ];
        
        formatButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.label;
            button.className = `json-format-btn ${btn.active ? 'active' : ''}`;
            button.dataset.format = btn.id;
            controls.appendChild(button);
        });
        
        // Copy button
        if (options.enableCopyToClipboard) {
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋 Copy';
            copyBtn.className = 'json-copy-btn';
            copyBtn.dataset.action = 'copy';
            controls.appendChild(copyBtn);
        }
        
        // Expand/Collapse all button
        if (options.enableCollapsible) {
            const expandBtn = document.createElement('button');
            expandBtn.textContent = '🔽 Collapse All';
            expandBtn.className = 'json-expand-btn';
            expandBtn.dataset.action = 'collapse';
            controls.appendChild(expandBtn);
        }
        
        header.appendChild(title);
        header.appendChild(controls);
        
        return header;
    }

    /**
     * Create viewer content area
     * 
     * @param {Object} jsonData - JSON data
     * @param {Object} options - Options
     * @returns {HTMLElement} - Content element
     */
    createViewerContent(jsonData, options) {
        const content = document.createElement('div');
        content.className = 'json-viewer-content';
        
        // Create formatted content
        const formattedContent = this.createFormattedJSON(jsonData, options);
        content.appendChild(formattedContent);
        
        return content;
    }

    /**
     * Create formatted JSON display
     * 
     * @param {Object} jsonData - JSON data
     * @param {Object} options - Options
     * @returns {HTMLElement} - Formatted JSON element
     */
    createFormattedJSON(jsonData, options) {
        const container = document.createElement('div');
        container.className = 'json-formatted';
        
        if (options.enableSyntaxHighlighting) {
            // Create syntax-highlighted version
            const highlighted = this.highlightJSON(jsonData, options);
            container.innerHTML = highlighted;
        } else {
            // Create simple pre-formatted version
            const pre = document.createElement('pre');
            pre.textContent = JSON.stringify(jsonData, null, options.indentSize);
            container.appendChild(pre);
        }
        
        return container;
    }

    /**
     * Create JSON with syntax highlighting
     * 
     * @param {Object} jsonData - JSON data
     * @param {Object} options - Options
     * @returns {string} - HTML string with syntax highlighting
     */
    highlightJSON(jsonData, options) {
        const jsonString = JSON.stringify(jsonData, null, options.indentSize);
        
        return jsonString
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")\s*:/g, '<span class="json-key">$1</span>:')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")/g, '<span class="json-string">$1</span>')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
            .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
            .replace(/\bnull\b/g, '<span class="json-null">null</span>');
    }

    /**
     * Create size indicator
     * 
     * @param {Object} jsonData - JSON data
     * @returns {HTMLElement} - Size indicator element
     */
    createSizeIndicator(jsonData) {
        const indicator = document.createElement('div');
        indicator.className = 'json-size-indicator';
        
        const jsonString = JSON.stringify(jsonData);
        const sizeKB = (jsonString.length / 1024).toFixed(2);
        const objectCount = this.countObjects(jsonData);
        
        indicator.innerHTML = `
            <span class="size-kb">${sizeKB}KB</span>
            <span class="size-separator">•</span>
            <span class="object-count">${objectCount} objects</span>
        `;
        
        return indicator;
    }

    /**
     * Count objects in JSON data
     * 
     * @param {*} data - Data to count
     * @returns {number} - Object count
     */
    countObjects(data) {
        let count = 0;
        
        if (typeof data === 'object' && data !== null) {
            count = 1;
            if (Array.isArray(data)) {
                data.forEach(item => {
                    count += this.countObjects(item);
                });
            } else {
                Object.values(data).forEach(value => {
                    count += this.countObjects(value);
                });
            }
        }
        
        return count;
    }

    /**
     * Create error display
     * 
     * @param {HTMLElement} container - Container element
     * @param {Error} error - Error object
     * @param {*} data - Original data
     * @returns {HTMLElement} - Error display element
     */
    createErrorDisplay(container, error, data) {
        container.innerHTML = `
            <div class="json-error">
                <h4>❌ JSON Format Error</h4>
                <p><strong>Error:</strong> ${error.message}</p>
                <div class="json-error-fallback">
                    <h5>Raw Data:</h5>
                    <pre class="json-raw-fallback">${this.escapeHtml(String(data))}</pre>
                </div>
            </div>
        `;
        
        return container;
    }

    /**
     * Bind viewer events
     * 
     * @param {HTMLElement} viewer - Viewer element
     */
    bindViewerEvents(viewer) {
        // Format toggle buttons
        const formatButtons = viewer.querySelectorAll('.json-format-btn');
        formatButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFormatToggle(e, viewer));
        });
        
        // Copy button
        const copyBtn = viewer.querySelector('.json-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => this.handleCopyToClipboard(e, viewer));
        }
        
        // Expand/Collapse button
        const expandBtn = viewer.querySelector('.json-expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => this.handleExpandCollapse(e, viewer));
        }
        
        // Collapsible sections
        const sections = viewer.querySelectorAll('.json-section-header');
        sections.forEach(section => {
            section.addEventListener('click', (e) => this.handleSectionToggle(e));
        });
    }

    /**
     * Handle format toggle
     * 
     * @param {Event} e - Click event
     * @param {HTMLElement} viewer - Viewer element
     */
    handleFormatToggle(e, viewer) {
        const button = e.target;
        const format = button.dataset.format;
        const content = viewer.querySelector('.json-viewer-content');
        
        // Update button states
        viewer.querySelectorAll('.json-format-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update content based on format
        switch (format) {
            case 'formatted':
                content.classList.remove('compact-view');
                content.classList.remove('raw-view');
                break;
            case 'compact':
                content.classList.add('compact-view');
                content.classList.remove('raw-view');
                break;
            case 'raw':
                content.classList.remove('compact-view');
                content.classList.add('raw-view');
                break;
        }
    }

    /**
     * Handle copy to clipboard
     * 
     * @param {Event} e - Click event
     * @param {HTMLElement} viewer - Viewer element
     */
    async handleCopyToClipboard(e, viewer) {
        const button = e.target;
        const content = viewer.querySelector('.json-formatted');
        
        try {
            // Get text content without HTML tags
            const textContent = content.textContent || content.innerText;
            
            // Copy to clipboard
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textContent);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            // Show success feedback
            this.showCopySuccess(viewer);
            
            // Update button temporarily
            const originalText = button.textContent;
            button.textContent = '✅ Copied!';
            button.classList.add('success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('success');
            }, 2000);
            
        } catch (error) {
            console.error('[JSONFormatter] Copy failed:', error);
            button.textContent = '❌ Failed';
            setTimeout(() => {
                button.textContent = '📋 Copy';
            }, 2000);
        }
    }

    /**
     * Show copy success feedback
     * 
     * @param {HTMLElement} viewer - Viewer element
     */
    showCopySuccess(viewer) {
        const feedback = document.createElement('div');
        feedback.className = 'copy-success';
        feedback.textContent = '✅ Copied to clipboard!';
        
        viewer.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    /**
     * Handle expand/collapse all
     * 
     * @param {Event} e - Click event
     * @param {HTMLElement} viewer - Viewer element
     */
    handleExpandCollapse(e, viewer) {
        const button = e.target;
        const isCollapsing = button.dataset.action === 'collapse';
        
        const sections = viewer.querySelectorAll('.json-section-content');
        const toggles = viewer.querySelectorAll('.json-section-toggle');
        
        sections.forEach(section => {
            if (isCollapsing) {
                section.classList.add('collapsed');
            } else {
                section.classList.remove('collapsed');
            }
        });
        
        toggles.forEach(toggle => {
            if (isCollapsing) {
                toggle.classList.add('collapsed');
            } else {
                toggle.classList.remove('collapsed');
            }
        });
        
        // Update button
        if (isCollapsing) {
            button.textContent = '🔼 Expand All';
            button.dataset.action = 'expand';
        } else {
            button.textContent = '🔽 Collapse All';
            button.dataset.action = 'collapse';
        }
    }

    /**
     * Handle section toggle
     * 
     * @param {Event} e - Click event
     */
    handleSectionToggle(e) {
        const header = e.target.closest('.json-section-header');
        const content = header.nextElementSibling;
        const toggle = header.querySelector('.json-section-toggle');
        
        if (content && content.classList.contains('json-section-content')) {
            content.classList.toggle('collapsed');
            toggle.classList.toggle('collapsed');
        }
    }

    /**
     * Bind global events
     */
    bindEvents() {
        // Responsive handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const viewers = document.querySelectorAll('.json-viewer-container');
        viewers.forEach(viewer => {
            this.adjustViewerForScreenSize(viewer);
        });
    }

    /**
     * Adjust viewer for screen size
     * 
     * @param {HTMLElement} viewer - Viewer element
     */
    adjustViewerForScreenSize(viewer) {
        const width = window.innerWidth;
        const content = viewer.querySelector('.json-viewer-content');
        
        if (width < 768) {
            // Mobile adjustments
            content.classList.add('mobile-view');
            content.classList.remove('desktop-view');
        } else {
            // Desktop adjustments
            content.classList.add('desktop-view');
            content.classList.remove('mobile-view');
        }
    }

    /**
     * Escape HTML for safe display
     * 
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for global use
window.JSONFormatter = JSONFormatter;

// Auto-initialize for existing workout previews
document.addEventListener('DOMContentLoaded', () => {
    const jsonFormatter = new JSONFormatter({
        enableSyntaxHighlighting: true,
        enableCollapsible: true,
        enableCopyToClipboard: true,
        enableSizeIndicator: true,
        maxLineLength: 80
    });
    
    // Enhance existing workout-test-preview elements
    const workoutPreviews = document.querySelectorAll('.workout-test-preview');
    workoutPreviews.forEach(preview => {
        // Add JSON formatter capability
        preview.jsonFormatter = jsonFormatter;
        
        // Add observer for dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const workoutContent = preview.querySelector('.workout-content');
                    if (workoutContent) {
                        jsonFormatter.enhanceWorkoutContent(workoutContent);
                    }
                }
            });
        });
        
        observer.observe(preview, { childList: true, subtree: true });
    });
    
    console.log('✅ JSONFormatter initialized for Live Prompt Preview');
});

/**
 * Enhanced workout content formatter
 * Integrates with existing PromptBuilder functionality
 */
JSONFormatter.prototype.enhanceWorkoutContent = function(workoutContent) {
    const preElement = workoutContent.querySelector('pre');
    if (preElement && preElement.textContent.trim().startsWith('{')) {
        try {
            const jsonData = JSON.parse(preElement.textContent);
            
            // Replace the simple pre element with enhanced JSON viewer
            const enhancedViewer = this.formatJSON(jsonData, document.createElement('div'), {
                enableControls: true,
                enableSyntaxHighlighting: true,
                enableCollapsible: true,
                enableCopyToClipboard: true,
                enableSizeIndicator: true
            });
            
            // Replace the workout-content with enhanced version
            workoutContent.innerHTML = '';
            workoutContent.appendChild(enhancedViewer);
            
            console.log('✅ Enhanced workout content with JSONFormatter');
            
        } catch (error) {
            console.log('ℹ️ Workout content is not valid JSON, keeping original formatting');
        }
    }
};

/**
 * Enhanced JSON Formatter for Live Prompt Preview
 * 
 * Provides advanced JSON formatting capabilities including:
 * - Responsive word wrapping without horizontal scrolling
 * - Syntax highlighting for better readability
 * - Collapsible sections for large JSON objects
 * - Copy-to-clipboard functionality
 * - Mobile-optimized display
 * - Dark mode support
 * 
 * @version 1.0.0
 * @author FitCopilot Team
 */

class JSONFormatter {
    constructor(options = {}) {
        this.options = {
            maxLineLength: options.maxLineLength || 80,
            indentSize: options.indentSize || 2,
            enableSyntaxHighlighting: options.enableSyntaxHighlighting !== false,
            enableCopyToClipboard: options.enableCopyToClipboard !== false,
            ...options
        };
    }

    /**
     * Format JSON with enhanced display options
     */
    formatJSON(data, container) {
        try {
            const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
            container.innerHTML = '';
            
            const viewer = this.createJSONViewer(jsonData);
            container.appendChild(viewer);
            this.bindViewerEvents(viewer);
            
            return viewer;
        } catch (error) {
            console.error('[JSONFormatter] Failed to format JSON:', error);
            return this.createErrorDisplay(container, error, data);
        }
    }

    /**
     * Create enhanced JSON viewer with controls
     */
    createJSONViewer(jsonData) {
        const viewer = document.createElement('div');
        viewer.className = 'json-viewer-container';
        
        const header = this.createViewerHeader();
        const content = this.createViewerContent(jsonData);
        
        viewer.appendChild(header);
        viewer.appendChild(content);
        
        return viewer;
    }

    /**
     * Create viewer header with controls
     */
    createViewerHeader() {
        const header = document.createElement('div');
        header.className = 'json-viewer-header';
        
        const title = document.createElement('span');
        title.textContent = 'Workout Request JSON';
        
        const controls = document.createElement('div');
        controls.className = 'json-viewer-controls';
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy';
        copyBtn.className = 'json-copy-btn';
        controls.appendChild(copyBtn);
        
        // Format toggle
        const formatBtn = document.createElement('button');
        formatBtn.textContent = '🎨 Formatted';
        formatBtn.className = 'json-format-btn active';
        controls.appendChild(formatBtn);
        
        header.appendChild(title);
        header.appendChild(controls);
        
        return header;
    }

    /**
     * Create viewer content area
     */
    createViewerContent(jsonData) {
        const content = document.createElement('div');
        content.className = 'json-viewer-content';
        
        const formattedContent = this.createFormattedJSON(jsonData);
        content.appendChild(formattedContent);
        
        return content;
    }

    /**
     * Create formatted JSON display
     */
    createFormattedJSON(jsonData) {
        const container = document.createElement('div');
        container.className = 'json-formatted';
        
        if (this.options.enableSyntaxHighlighting) {
            const highlighted = this.highlightJSON(jsonData);
            container.innerHTML = highlighted;
        } else {
            const pre = document.createElement('pre');
            pre.textContent = JSON.stringify(jsonData, null, this.options.indentSize);
            container.appendChild(pre);
        }
        
        return container;
    }

    /**
     * Create JSON with syntax highlighting
     */
    highlightJSON(jsonData) {
        const jsonString = JSON.stringify(jsonData, null, this.options.indentSize);
        
        return jsonString
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")\s*:/g, '<span class="json-key">$1</span>:')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")/g, '<span class="json-string">$1</span>')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
            .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
            .replace(/\bnull\b/g, '<span class="json-null">null</span>');
    }

    /**
     * Bind viewer events
     */
    bindViewerEvents(viewer) {
        const copyBtn = viewer.querySelector('.json-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => this.handleCopyToClipboard(e, viewer));
        }
    }

    /**
     * Handle copy to clipboard
     */
    async handleCopyToClipboard(e, viewer) {
        const button = e.target;
        const content = viewer.querySelector('.json-formatted');
        
        try {
            const textContent = content.textContent || content.innerText;
            
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textContent);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            const originalText = button.textContent;
            button.textContent = '✅ Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('[JSONFormatter] Copy failed:', error);
            button.textContent = '❌ Failed';
            setTimeout(() => {
                button.textContent = '📋 Copy';
            }, 2000);
        }
    }

    /**
     * Create error display
     */
    createErrorDisplay(container, error, data) {
        container.innerHTML = `
            <div class="json-error">
                <h4>❌ JSON Format Error</h4>
                <p><strong>Error:</strong> ${error.message}</p>
                <div class="json-error-fallback">
                    <h5>Raw Data:</h5>
                    <pre class="json-raw-fallback">${this.escapeHtml(String(data))}</pre>
                </div>
            </div>
        `;
        return container;
    }

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for global use
window.JSONFormatter = JSONFormatter;

// Auto-initialize for existing workout previews
document.addEventListener('DOMContentLoaded', () => {
    const jsonFormatter = new JSONFormatter({
        enableSyntaxHighlighting: true,
        enableCopyToClipboard: true,
        maxLineLength: 80
    });
    
    // Enhance existing workout-test-preview elements
    const workoutPreviews = document.querySelectorAll('.workout-test-preview');
    workoutPreviews.forEach(preview => {
        preview.jsonFormatter = jsonFormatter;
        
        // Add observer for dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const workoutContent = preview.querySelector('.workout-content');
                    if (workoutContent && workoutContent.querySelector('pre')) {
                        jsonFormatter.enhanceWorkoutContent(workoutContent);
                    }
                }
            });
        });
        
        observer.observe(preview, { childList: true, subtree: true });
    });
    
    console.log('✅ JSONFormatter initialized for Live Prompt Preview');
});

/**
 * Enhanced workout content formatter
 */
JSONFormatter.prototype.enhanceWorkoutContent = function(workoutContent) {
    const preElement = workoutContent.querySelector('pre');
    if (preElement && preElement.textContent.trim().startsWith('{')) {
        try {
            const jsonData = JSON.parse(preElement.textContent);
            
            // Replace with enhanced JSON viewer
            const enhancedViewer = this.formatJSON(jsonData, document.createElement('div'));
            workoutContent.innerHTML = '';
            workoutContent.appendChild(enhancedViewer);
            
            console.log('✅ Enhanced workout content with JSONFormatter');
        } catch (error) {
            console.log('ℹ️ Workout content is not valid JSON, keeping original formatting');
        }
    }
}; 