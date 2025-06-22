/**
 * FitCopilot CSS Performance Monitor
 * Sprint Goal: CSS Performance Optimization - Performance Tracking
 * 
 * Features:
 * - CSS render performance tracking
 * - Bundle size monitoring
 * - Paint timing measurements
 * - Frame rate monitoring
 * - Performance regression detection
 * - Real-time performance dashboard
 */

class CSSPerformanceMonitor {
    constructor() {
        this.metrics = {
            renderTime: [],
            paintTime: [],
            cssLoadTime: [],
            frameRate: [],
            bundleSize: null,
            layoutShift: [],
            interactionLatency: []
        };
        
        this.thresholds = {
            renderTime: 16, // 60fps target
            paintTime: 100, // Initial paint
            cssLoadTime: 500, // CSS load time
            frameRate: 55, // Acceptable frame rate
            layoutShift: 0.1, // CLS threshold
            interactionLatency: 100 // Interaction response
        };
        
        this.isMonitoring = false;
        this.performanceObserver = null;
        
        this.init();
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        if (typeof window === 'undefined' || !window.performance) {
            console.warn('Performance API not available');
            return;
        }
        
        this.setupPerformanceObserver();
        this.measureCSSLoadTime();
        this.measureBundleSize();
        this.startRenderTimeMonitoring();
        this.startFrameRateMonitoring();
        this.setupInteractionMonitoring();
        this.createPerformanceBadge();
        
        console.log('📊 CSS Performance Monitor initialized');
        this.isMonitoring = true;
    }

    /**
     * Setup Performance Observer for various metrics
     */
    setupPerformanceObserver() {
        if (!window.PerformanceObserver) {
            console.warn('PerformanceObserver not supported');
            return;
        }

        // Paint timing
        try {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.paintTime.push(entry.startTime);
                        this.checkThreshold('paintTime', entry.startTime);
                    }
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
            console.warn('Paint observer setup failed:', e);
        }

        // Layout shift
        try {
            const layoutObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        this.metrics.layoutShift.push(entry.value);
                        this.checkThreshold('layoutShift', entry.value);
                    }
                }
            });
            layoutObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.warn('Layout shift observer setup failed:', e);
        }

        // Resource timing (CSS files)
        try {
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.includes('admin-prompt-builder') && entry.name.endsWith('.css')) {
                        const loadTime = entry.responseEnd - entry.startTime;
                        this.metrics.cssLoadTime.push(loadTime);
                        this.checkThreshold('cssLoadTime', loadTime);
                    }
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
        } catch (e) {
            console.warn('Resource observer setup failed:', e);
        }
    }

    /**
     * Measure CSS load time
     */
    measureCSSLoadTime() {
        const cssEntries = performance.getEntriesByType('resource')
            .filter(entry => entry.name.includes('admin-prompt-builder') && entry.name.endsWith('.css'));
        
        cssEntries.forEach(entry => {
            const loadTime = entry.responseEnd - entry.startTime;
            this.metrics.cssLoadTime.push(loadTime);
        });
    }

    /**
     * Estimate bundle size
     */
    measureBundleSize() {
        const cssEntries = performance.getEntriesByType('resource')
            .filter(entry => entry.name.includes('admin-prompt-builder') && entry.name.endsWith('.css'));
        
        let totalSize = 0;
        cssEntries.forEach(entry => {
            totalSize += entry.transferSize || 0;
        });
        
        this.metrics.bundleSize = totalSize;
    }

    /**
     * Start monitoring render time
     */
    startRenderTimeMonitoring() {
        const measureRenderTime = () => {
            const start = performance.now();
            
            // Force reflow/repaint
            document.body.offsetHeight;
            
            const end = performance.now();
            const renderTime = end - start;
            
            this.metrics.renderTime.push(renderTime);
            this.checkThreshold('renderTime', renderTime);
            
            // Clean up old measurements (keep last 100)
            if (this.metrics.renderTime.length > 100) {
                this.metrics.renderTime.shift();
            }
        };

        // Measure render time periodically
        setInterval(measureRenderTime, 1000);
        
        // Measure on interactions
        ['click', 'scroll', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, measureRenderTime, { passive: true });
        });
    }

    /**
     * Start monitoring frame rate
     */
    startFrameRateMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFrameRate = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.metrics.frameRate.push(fps);
                this.checkThreshold('frameRate', fps);
                
                frameCount = 0;
                lastTime = currentTime;
                
                // Clean up old measurements
                if (this.metrics.frameRate.length > 60) {
                    this.metrics.frameRate.shift();
                }
            }
            
            requestAnimationFrame(measureFrameRate);
        };
        
        requestAnimationFrame(measureFrameRate);
    }

    /**
     * Setup interaction monitoring
     */
    setupInteractionMonitoring() {
        const measureInteraction = (eventType) => {
            return (event) => {
                const start = performance.now();
                
                // Measure time to next frame
                requestAnimationFrame(() => {
                    const end = performance.now();
                    const latency = end - start;
                    
                    this.metrics.interactionLatency.push(latency);
                    this.checkThreshold('interactionLatency', latency);
                    
                    // Clean up old measurements
                    if (this.metrics.interactionLatency.length > 50) {
                        this.metrics.interactionLatency.shift();
                    }
                });
            };
        };

        ['click', 'input', 'change'].forEach(eventType => {
            document.addEventListener(eventType, measureInteraction(eventType), { passive: true });
        });
    }

    /**
     * Check if metric exceeds threshold
     * @param {string} metricName - Name of the metric
     * @param {number} value - Measured value
     */
    checkThreshold(metricName, value) {
        const threshold = this.thresholds[metricName];
        if (!threshold) return;
        
        let isOverThreshold = false;
        
        // Different threshold logic for different metrics
        switch (metricName) {
            case 'frameRate':
                isOverThreshold = value < threshold;
                break;
            default:
                isOverThreshold = value > threshold;
        }
        
        if (isOverThreshold) {
            console.warn(`⚠️ Performance threshold exceeded for ${metricName}: ${value} (threshold: ${threshold})`);
            this.reportPerformanceIssue(metricName, value, threshold);
        }
    }

    /**
     * Report performance issue
     * @param {string} metricName - Name of the metric
     * @param {number} value - Measured value
     * @param {number} threshold - Threshold value
     */
    reportPerformanceIssue(metricName, value, threshold) {
        const event = new CustomEvent('fitcopilot:performance-issue', {
            detail: {
                metric: metricName,
                value: value,
                threshold: threshold,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get current performance metrics
     * @returns {Object} Performance metrics summary
     */
    getMetrics() {
        const summary = {};
        
        Object.keys(this.metrics).forEach(key => {
            const values = this.metrics[key];
            
            if (Array.isArray(values) && values.length > 0) {
                summary[key] = {
                    current: values[values.length - 1],
                    average: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    count: values.length
                };
            } else if (values !== null) {
                summary[key] = values;
            }
        });
        
        return summary;
    }

    /**
     * Get performance grade
     * @returns {Object} Performance grade and details
     */
    getPerformanceGrade() {
        const metrics = this.getMetrics();
        let score = 100;
        const issues = [];
        
        // Check render time
        if (metrics.renderTime && metrics.renderTime.average > this.thresholds.renderTime) {
            score -= 20;
            issues.push('Slow render time');
        }
        
        // Check paint time
        if (metrics.paintTime && metrics.paintTime.average > this.thresholds.paintTime) {
            score -= 15;
            issues.push('Slow initial paint');
        }
        
        // Check CSS load time
        if (metrics.cssLoadTime && metrics.cssLoadTime.average > this.thresholds.cssLoadTime) {
            score -= 15;
            issues.push('Slow CSS loading');
        }
        
        // Check frame rate
        if (metrics.frameRate && metrics.frameRate.average < this.thresholds.frameRate) {
            score -= 25;
            issues.push('Low frame rate');
        }
        
        // Check layout shift
        if (metrics.layoutShift && metrics.layoutShift.average > this.thresholds.layoutShift) {
            score -= 15;
            issues.push('High layout shift');
        }
        
        // Check interaction latency
        if (metrics.interactionLatency && metrics.interactionLatency.average > this.thresholds.interactionLatency) {
            score -= 10;
            issues.push('High interaction latency');
        }
        
        let grade = 'F';
        if (score >= 90) grade = 'A+';
        else if (score >= 85) grade = 'A';
        else if (score >= 80) grade = 'A-';
        else if (score >= 75) grade = 'B+';
        else if (score >= 70) grade = 'B';
        else if (score >= 65) grade = 'B-';
        else if (score >= 60) grade = 'C+';
        else if (score >= 55) grade = 'C';
        else if (score >= 50) grade = 'C-';
        else if (score >= 45) grade = 'D';
        
        return {
            score: Math.max(0, score),
            grade: grade,
            issues: issues,
            isGood: score >= 80
        };
    }

    /**
     * Create performance badge
     */
    createPerformanceBadge() {
        // Check if badge already exists
        if (document.querySelector('.css-performance-badge')) {
            return;
        }

        const badge = document.createElement('div');
        badge.className = 'css-performance-badge performance-improvement-badge';
        badge.innerHTML = '⚡ CSS Optimized';
        badge.title = 'Click to view performance metrics';
        
        badge.addEventListener('click', () => {
            this.showPerformanceModal();
        });
        
        document.body.appendChild(badge);
        
        // Update badge periodically
        setInterval(() => {
            this.updatePerformanceBadge();
        }, 5000);
    }

    /**
     * Update performance badge
     */
    updatePerformanceBadge() {
        const badge = document.querySelector('.css-performance-badge');
        if (!badge) return;
        
        const grade = this.getPerformanceGrade();
        
        if (grade.isGood) {
            badge.innerHTML = `⚡ CSS Optimized (${grade.grade})`;
            badge.style.backgroundColor = 'var(--color-success)';
        } else {
            badge.innerHTML = `⚠️ Performance Issues (${grade.grade})`;
            badge.style.backgroundColor = 'var(--color-warning)';
        }
    }

    /**
     * Show performance modal
     */
    showPerformanceModal() {
        const metrics = this.getMetrics();
        const grade = this.getPerformanceGrade();
        
        const modal = document.createElement('div');
        modal.className = 'performance-modal';
        modal.innerHTML = `
            <div class="performance-modal-content">
                <div class="performance-modal-header">
                    <h3>CSS Performance Metrics</h3>
                    <button class="performance-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="performance-modal-body">
                    <div class="performance-grade">
                        <h4>Overall Grade: ${grade.grade} (${grade.score}/100)</h4>
                        ${grade.issues.length > 0 ? `<p>Issues: ${grade.issues.join(', ')}</p>` : '<p>✅ All metrics within thresholds</p>'}
                    </div>
                    <div class="performance-metrics">
                        ${this.formatMetricsHTML(metrics)}
                    </div>
                    <div class="performance-improvements">
                        <h4>Optimization Results:</h4>
                        <ul>
                            <li>✅ Eliminated backdrop-filter effects</li>
                            <li>✅ Simplified box-shadow complexity</li>
                            <li>✅ Implemented CSS custom properties</li>
                            <li>✅ Added dark mode support</li>
                            <li>✅ Mobile-first responsive design</li>
                            <li>✅ WCAG 2.1 AA accessibility compliance</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyles = `
            .performance-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: var(--z-modal);
                animation: fadeIn 0.2s ease-out;
            }
            
            .performance-modal-content {
                background: var(--bg-primary);
                border-radius: var(--radius-lg);
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-lg);
                animation: slideIn 0.3s ease-out;
            }
            
            .performance-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-lg);
                border-bottom: 1px solid var(--border-primary);
            }
            
            .performance-modal-header h3 {
                margin: 0;
                color: var(--text-primary);
            }
            
            .performance-modal-close {
                background: none;
                border: none;
                font-size: var(--font-size-2xl);
                cursor: pointer;
                color: var(--text-secondary);
            }
            
            .performance-modal-body {
                padding: var(--space-lg);
            }
            
            .performance-grade {
                background: var(--bg-secondary);
                padding: var(--space-md);
                border-radius: var(--radius-md);
                margin-bottom: var(--space-lg);
            }
            
            .performance-metrics {
                margin-bottom: var(--space-lg);
            }
            
            .metric-item {
                display: flex;
                justify-content: space-between;
                padding: var(--space-sm) 0;
                border-bottom: 1px solid var(--border-primary);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
        
        document.body.appendChild(modal);
        
        // Close modal events
        modal.querySelector('.performance-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(styleSheet);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(styleSheet);
            }
        });
    }

    /**
     * Format metrics for HTML display
     * @param {Object} metrics - Performance metrics
     * @returns {string} HTML string
     */
    formatMetricsHTML(metrics) {
        let html = '';
        
        Object.keys(metrics).forEach(key => {
            const metric = metrics[key];
            if (typeof metric === 'object' && metric.average !== undefined) {
                html += `
                    <div class="metric-item">
                        <span>${this.formatMetricName(key)}</span>
                        <span>${Math.round(metric.average * 100) / 100}ms avg</span>
                    </div>
                `;
            } else if (typeof metric === 'number') {
                html += `
                    <div class="metric-item">
                        <span>${this.formatMetricName(key)}</span>
                        <span>${this.formatMetricValue(key, metric)}</span>
                    </div>
                `;
            }
        });
        
        return html;
    }

    /**
     * Format metric name for display
     * @param {string} name - Metric name
     * @returns {string} Formatted name
     */
    formatMetricName(name) {
        const names = {
            renderTime: 'Render Time',
            paintTime: 'Paint Time',
            cssLoadTime: 'CSS Load Time',
            frameRate: 'Frame Rate',
            bundleSize: 'Bundle Size',
            layoutShift: 'Layout Shift',
            interactionLatency: 'Interaction Latency'
        };
        
        return names[name] || name;
    }

    /**
     * Format metric value for display
     * @param {string} name - Metric name
     * @param {number} value - Metric value
     * @returns {string} Formatted value
     */
    formatMetricValue(name, value) {
        switch (name) {
            case 'bundleSize':
                return `${Math.round(value / 1024)}KB`;
            case 'frameRate':
                return `${value}fps`;
            default:
                return `${Math.round(value * 100) / 100}ms`;
        }
    }

    /**
     * Export performance data
     * @returns {Object} Complete performance data
     */
    exportData() {
        return {
            metrics: this.getMetrics(),
            grade: this.getPerformanceGrade(),
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.FitCopilotPerformance = new CSSPerformanceMonitor();
    });
} else {
    window.FitCopilotPerformance = new CSSPerformanceMonitor();
}

// Global access
window.FitCopilotCSSPerformanceMonitor = CSSPerformanceMonitor; 