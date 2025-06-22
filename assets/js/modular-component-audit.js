/**
 * Modular PromptBuilder Component Audit Tool
 * 
 * Comprehensive audit for dark mode compatibility in the modularized PromptBuilderView.php system
 * Focus: Module integration, WordPress compatibility, advanced UI components
 */

console.log('🔍 MODULAR PROMPTBUILDER COMPONENT AUDIT');
console.log('========================================');

const ModularComponentAudit = {
    // Enhanced component categories for modular system
    componentCategories: {
        'WordPress Core Elements': [
            '.wrap',
            '.wp-core-ui .button',
            '.wp-core-ui .button-primary', 
            '.wp-core-ui .button-secondary',
            '.notice',
            '.notice-success',
            '.notice-error', 
            '.notice-warning',
            '.notice-info'
        ],
        'Dashboard & Header Components': [
            '.dashboard-header',
            '.dashboard-header-content',
            '.dashboard-controls',
            '.prompt-builder-status',
            '.status-item',
            '.status-label',
            '.status-value',
            '.status-value.active',
            '.status-value.inactive'
        ],
        'Modular Container System': [
            '.prompt-builder-container',
            '.prompt-builder-left',
            '.prompt-builder-right',
            '.builder-section',
            '.section-header-controls'
        ],
        'Strategy & User Management': [
            '.strategy-controls',
            '.strategy-select',
            '.strategy-description',
            '.profile-controls',
            '.user-select',
            '#strategy-selector',
            '#user-selector',
            '#load-profile'
        ],
        'Enhanced Form System': [
            '.prompt-form',
            '.form-group',
            '.form-row',
            '.form-input',
            '.form-select',
            '.form-textarea',
            '.height-input-group',
            '.height-separator',
            '.form-actions'
        ],
        'Advanced Muscle Selection Module': [
            '.muscle-selection-container',
            '.muscle-groups-section',
            '.specific-muscles-section',
            '.muscle-section-label',
            '.muscle-groups-grid',
            '.muscle-group-item',
            '.muscle-group-label',
            '.expand-indicator',
            '.muscle-detail-grid',
            '.muscle-options-grid',
            '.muscle-actions-section',
            '.muscle-selection-summary',
            '.muscle-count-badge',
            '.muscle-actions',
            '.muscle-icon'
        ],
        'Checkbox Grid Systems': [
            '.checkbox-grid',
            '.checkbox-grid label',
            '.checkbox-grid input[type="checkbox"]'
        ],
        'Code Viewer & Preview Systems': [
            '.strategy-code-viewer',
            '.strategy-code-viewer.with-line-numbers',
            '.code-line-numbers',
            '.code-placeholder',
            '.code-controls',
            '.code-controls button'
        ],
        'Live Preview & Analysis': [
            '.prompt-preview',
            '.prompt-placeholder',
            '.prompt-stats',
            '.stat-item',
            '.stat-value',
            '.stat-label',
            '.prompt-controls',
            '.prompt-controls button'
        ],
        'Workout Testing System': [
            '.workout-test-preview',
            '.workout-placeholder',
            '.workout-test-results',
            '.workout-meta',
            '.meta-item',
            '.meta-label',
            '.meta-value',
            '.workout-content',
            '.workout-section',
            '.exercise-item',
            '.workout-performance',
            '.perf-item',
            '.perf-label',
            '.perf-value',
            '.workout-controls'
        ],
        'Context Inspector System': [
            '.context-inspector',
            '.context-placeholder',
            '.context-search',
            '.context-tree',
            '.context-branch',
            '.context-field',
            '.context-field.missing',
            '.context-field-name',
            '.context-field-type',
            '.context-field-value',
            '.context-controls'
        ],
        'Dual Preview System': [
            '.dual-preview-container',
            '.preview-panel',
            '.preview-content',
            '.preview-placeholder'
        ],
        'Message & Notification System': [
            '.prompt-builder-messages',
            '.prompt-message',
            '.prompt-message.success',
            '.prompt-message.error',
            '.prompt-message.info'
        ],
        'Sleep Quality Module Integration': [
            '#sleepQuality',
            '.sleep-quality-container',
            '.sleep-quality-selector'
        ],
        'Action Buttons & Controls': [
            '#generate-prompt',
            '#inspect-context',
            '#test-workout',
            '#view-strategy-code',
            '#copy-strategy-code',
            '#toggle-line-numbers',
            '#export-prompt',
            '#copy-prompt',
            '#clear-prompt',
            '#export-workout',
            '#save-workout'
        ]
    },

    // Critical dark mode CSS rules needed for modular system
    criticalDarkModeRules: [
        // WordPress Core Overrides (Higher Specificity)
        'body[data-theme="dark"] .wp-core-ui .button',
        'body[data-theme="dark"] .wp-core-ui .button-primary', 
        'body[data-theme="dark"] .wp-core-ui .button-secondary',
        'body[data-theme="dark"] .notice',
        'body[data-theme="dark"] .notice-success',
        'body[data-theme="dark"] .notice-error',
        'body[data-theme="dark"] .notice-warning',

        // Dashboard Components
        '[data-theme="dark"] .dashboard-header',
        '[data-theme="dark"] .prompt-builder-status',
        '[data-theme="dark"] .status-value',

        // Form Elements
        '[data-theme="dark"] .form-input',
        '[data-theme="dark"] .form-select', 
        '[data-theme="dark"] .form-textarea',

        // Module-specific components
        '[data-theme="dark"] .muscle-selection-container',
        '[data-theme="dark"] .muscle-group-item',
        '[data-theme="dark"] .muscle-options-grid label',

        // Preview systems
        '[data-theme="dark"] .strategy-code-viewer',
        '[data-theme="dark"] .prompt-preview',
        '[data-theme="dark"] .workout-test-preview',
        '[data-theme="dark"] .context-inspector'
    ],

    // Run comprehensive audit
    runAudit() {
        console.log('\n🔍 PHASE 1: COMPONENT DISCOVERY');
        console.log('================================');
        
        const discoveredComponents = this.discoverComponents();
        
        console.log('\n📊 PHASE 2: DARK MODE COMPATIBILITY ANALYSIS');
        console.log('===========================================');
        
        const compatibilityResults = this.analyzeDarkModeCompatibility(discoveredComponents);
        
        console.log('\n⚠️  PHASE 3: CRITICAL ISSUE IDENTIFICATION');
        console.log('========================================');
        
        const criticalIssues = this.identifyCriticalIssues(discoveredComponents);
        
        console.log('\n🔧 PHASE 4: SPECIFIC FIXES FOR MODULAR SYSTEM');
        console.log('===========================================');
        
        this.generateModularSystemFixes(criticalIssues);
        
        return {
            discoveredComponents,
            compatibilityResults,
            criticalIssues,
            timestamp: new Date().toISOString()
        };
    },

    discoverComponents() {
        const discovered = {};
        let totalComponents = 0;

        Object.keys(this.componentCategories).forEach(category => {
            discovered[category] = {
                selectors: this.componentCategories[category],
                found: [],
                missing: [],
                darkModeStatus: []
            };

            this.componentCategories[category].forEach(selector => {
                const elements = document.querySelectorAll(selector);
                
                if (elements.length > 0) {
                    discovered[category].found.push({
                        selector,
                        count: elements.length,
                        elements: Array.from(elements)
                    });
                    totalComponents += elements.length;
                } else {
                    discovered[category].missing.push(selector);
                }
            });

            console.log(`📦 ${category}: ${discovered[category].found.length}/${this.componentCategories[category].length} found`);
        });

        console.log(`\n✅ TOTAL COMPONENTS DISCOVERED: ${totalComponents}`);
        return discovered;
    },

    analyzeDarkModeCompatibility(discovered) {
        const results = {
            compatible: [],
            incompatible: [],
            unknown: [],
            highRisk: []
        };

        Object.keys(discovered).forEach(category => {
            discovered[category].found.forEach(component => {
                component.elements.forEach(element => {
                    const analysis = this.analyzeElementDarkMode(element, component.selector);
                    
                    analysis.category = category;
                    analysis.selector = component.selector;

                    if (analysis.risk === 'high') {
                        results.highRisk.push(analysis);
                    } else if (analysis.compatible) {
                        results.compatible.push(analysis);
                    } else if (analysis.compatible === false) {
                        results.incompatible.push(analysis);
                    } else {
                        results.unknown.push(analysis);
                    }
                });
            });
        });

        console.log(`✅ Compatible: ${results.compatible.length}`);
        console.log(`❌ Incompatible: ${results.incompatible.length}`);
        console.log(`🔴 HIGH RISK: ${results.highRisk.length}`);
        console.log(`❓ Unknown: ${results.unknown.length}`);

        return results;
    },

    analyzeElementDarkMode(element, selector) {
        const computedStyle = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        // Check if element is visible
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden';

        if (!isVisible) {
            return { compatible: null, reason: 'Element not visible', risk: 'low' };
        }

        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        const borderColor = computedStyle.borderColor;

        // Check for white backgrounds or light colors
        const hasWhiteBackground = bgColor.includes('rgb(255, 255, 255)') || 
                                  bgColor.includes('rgba(255, 255, 255') ||
                                  bgColor === 'white';

        const hasLightText = textColor.includes('rgb(255, 255, 255)') || 
                            textColor.includes('rgba(255, 255, 255') ||
                            textColor === 'white';

        // WordPress-specific checks
        const isWordPressCore = selector.includes('.wp-core-ui') || 
                               selector.includes('.notice') ||
                               element.classList.contains('button');

        // Critical risk factors for modular system
        let risk = 'low';
        let compatible = true;
        let issues = [];

        if (hasWhiteBackground && hasLightText) {
            risk = 'high';
            compatible = false;
            issues.push('White background with white text - invisible in dark mode');
        }

        if (isWordPressCore && hasWhiteBackground) {
            risk = 'high';
            compatible = false;
            issues.push('WordPress core element with white background needs dark mode override');
        }

        // Form element specific checks
        if (selector.includes('form-input') || selector.includes('form-select') || selector.includes('form-textarea')) {
            if (hasWhiteBackground) {
                risk = 'medium';
                issues.push('Form element may need dark mode styling');
            }
        }

        // Module-specific checks
        if (selector.includes('muscle-') || selector.includes('sleep-') || selector.includes('strategy-')) {
            if (hasWhiteBackground) {
                risk = 'medium';
                issues.push('Module component may need dark mode integration');
            }
        }

        return {
            compatible,
            risk,
            issues,
            styles: {
                backgroundColor: bgColor,
                color: textColor,
                borderColor: borderColor
            },
            isWordPressCore,
            isVisible
        };
    },

    identifyCriticalIssues(discovered) {
        const critical = {
            wordpressConflicts: [],
            formElementIssues: [],
            moduleIntegrationIssues: [],
            previewSystemIssues: [],
            messageSystemIssues: []
        };

        // Check WordPress button conflicts
        const wpButtons = document.querySelectorAll('.wp-core-ui .button');
        wpButtons.forEach(btn => {
            const styles = getComputedStyle(btn);
            if (styles.backgroundColor.includes('255, 255, 255')) {
                critical.wordpressConflicts.push({
                    element: btn,
                    issue: 'WordPress button with white background',
                    selector: '.wp-core-ui .button',
                    priority: 'P0'
                });
            }
        });

        // Check notice system
        const notices = document.querySelectorAll('.notice');
        notices.forEach(notice => {
            const styles = getComputedStyle(notice);
            if (styles.backgroundColor.includes('255, 255, 255')) {
                critical.messageSystemIssues.push({
                    element: notice,
                    issue: 'Notice system with white background',
                    selector: '.notice',
                    priority: 'P0'
                });
            }
        });

        // Check form elements
        const formElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
        formElements.forEach(el => {
            const styles = getComputedStyle(el);
            if (styles.backgroundColor.includes('255, 255, 255') || styles.color.includes('255, 255, 255')) {
                critical.formElementIssues.push({
                    element: el,
                    issue: 'Form element with potential contrast issues',
                    selector: el.className,
                    priority: 'P1'
                });
            }
        });

        // Check module components
        const moduleElements = document.querySelectorAll('[class*="muscle-"], [class*="sleep-"], [class*="strategy-"]');
        moduleElements.forEach(el => {
            const styles = getComputedStyle(el);
            if (styles.backgroundColor.includes('255, 255, 255')) {
                critical.moduleIntegrationIssues.push({
                    element: el,
                    issue: 'Module component needs dark mode integration',
                    selector: el.className,
                    priority: 'P1'
                });
            }
        });

        // Check preview systems
        const previewElements = document.querySelectorAll('.prompt-preview, .strategy-code-viewer, .workout-test-preview, .context-inspector');
        previewElements.forEach(el => {
            const styles = getComputedStyle(el);
            if (styles.backgroundColor.includes('249, 249, 249') || styles.backgroundColor.includes('255, 255, 255')) {
                critical.previewSystemIssues.push({
                    element: el,
                    issue: 'Preview system with light background',
                    selector: el.className,
                    priority: 'P1'
                });
            }
        });

        console.log(`🔴 WordPress Conflicts: ${critical.wordpressConflicts.length}`);
        console.log(`📝 Form Element Issues: ${critical.formElementIssues.length}`);
        console.log(`🧩 Module Integration Issues: ${critical.moduleIntegrationIssues.length}`);
        console.log(`👁️  Preview System Issues: ${critical.previewSystemIssues.length}`);
        console.log(`💬 Message System Issues: ${critical.messageSystemIssues.length}`);

        return critical;
    },

    generateModularSystemFixes(criticalIssues) {
        console.log('\n🔧 RECOMMENDED FIXES FOR MODULAR PROMPTBUILDER:');
        console.log('=============================================\n');

        // Fix 1: WordPress Core Overrides with Higher Specificity
        console.log('📌 FIX 1: WordPress Core Dark Mode Overrides');
        console.log('-------------------------------------------');
        console.log(`/* Add to admin-prompt-builder-optimized.css */

/* WordPress Core Buttons - Higher Specificity */
body[data-theme="dark"] .wp-core-ui .button,
body[data-theme="dark"] .wp-core-ui .button-primary,
body[data-theme="dark"] .wp-core-ui .button-secondary {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-primary) !important;
}

body[data-theme="dark"] .wp-core-ui .button:hover {
    background-color: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
}

/* WordPress Notice System */
[data-theme="dark"] .notice,
[data-theme="dark"] .notice-success,
[data-theme="dark"] .notice-error,
[data-theme="dark"] .notice-warning,
[data-theme="dark"] .notice-info {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border-left-color: var(--border-primary) !important;
}`);

        // Fix 2: Enhanced Form System
        console.log('\n📌 FIX 2: Enhanced Form System Dark Mode');
        console.log('--------------------------------------');
        console.log(`/* Form Elements with Module Integration */
[data-theme="dark"] .form-input,
[data-theme="dark"] .form-select,
[data-theme="dark"] .form-textarea {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-primary) !important;
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-select:focus,
[data-theme="dark"] .form-textarea:focus {
    background-color: var(--bg-secondary) !important;
    border-color: var(--accent-primary) !important;
    outline: none !important;
    box-shadow: 0 0 0 2px var(--accent-primary-alpha) !important;
}`);

        // Fix 3: Muscle Module Integration
        console.log('\n📌 FIX 3: Advanced Muscle Selection Module');
        console.log('----------------------------------------');
        console.log(`/* Muscle Selection Module Dark Mode */
[data-theme="dark"] .muscle-selection-container {
    background-color: var(--bg-secondary) !important;
    border-color: var(--border-primary) !important;
}

[data-theme="dark"] .muscle-group-item {
    background-color: var(--bg-primary) !important;
    border-color: var(--border-primary) !important;
    color: var(--text-primary) !important;
}

[data-theme="dark"] .muscle-group-item:hover {
    border-color: var(--accent-primary) !important;
    box-shadow: 0 2px 4px var(--accent-primary-alpha) !important;
}

[data-theme="dark"] .muscle-group-label:hover {
    background-color: var(--bg-tertiary) !important;
}

[data-theme="dark"] .muscle-detail-grid {
    background-color: var(--bg-tertiary) !important;
    border-color: var(--border-primary) !important;
}

[data-theme="dark"] .muscle-options-grid label {
    background-color: var(--bg-primary) !important;
    border-color: var(--border-primary) !important;
    color: var(--text-primary) !important;
}

[data-theme="dark"] .muscle-options-grid label:hover {
    border-color: var(--accent-primary) !important;
    background-color: var(--accent-secondary) !important;
}

[data-theme="dark"] .muscle-selection-summary {
    background-color: var(--accent-secondary) !important;
    border-color: var(--accent-primary) !important;
    color: var(--text-primary) !important;
}`);

        // Fix 4: Preview Systems
        console.log('\n📌 FIX 4: Preview & Analysis Systems');
        console.log('----------------------------------');
        console.log(`/* Preview Systems Dark Mode */
[data-theme="dark"] .prompt-preview,
[data-theme="dark"] .context-inspector,
[data-theme="dark"] .workout-test-preview {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-primary) !important;
}

[data-theme="dark"] .strategy-code-viewer {
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
    border-color: var(--border-primary) !important;
}

[data-theme="dark"] .prompt-stats,
[data-theme="dark"] .workout-performance {
    background-color: var(--bg-tertiary) !important;
    border-color: var(--border-primary) !important;
}

[data-theme="dark"] .stat-value,
[data-theme="dark"] .perf-value {
    color: var(--accent-primary) !important;
}

[data-theme="dark"] .stat-label,
[data-theme="dark"] .perf-label {
    color: var(--text-secondary) !important;
}`);

        // Fix 5: Dashboard & Status System
        console.log('\n📌 FIX 5: Dashboard & Status System');
        console.log('---------------------------------');
        console.log(`/* Dashboard Components */
[data-theme="dark"] .prompt-builder-status {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
}

[data-theme="dark"] .status-label {
    color: var(--text-secondary) !important;
}

[data-theme="dark"] .status-value.active {
    color: var(--success-primary) !important;
}

[data-theme="dark"] .status-value.inactive {
    color: var(--error-primary) !important;
}

[data-theme="dark"] .builder-section {
    background-color: var(--bg-primary) !important;
    border-color: var(--border-primary) !important;
    color: var(--text-primary) !important;
}`);

        console.log('\n✅ IMPLEMENTATION PRIORITY:');
        console.log('==========================');
        console.log('P0 (Critical): WordPress buttons, notice system');
        console.log('P1 (High): Form elements, muscle module');
        console.log('P2 (Medium): Preview systems, dashboard components');
    },

    // Test dark mode switching with modular components
    testModularDarkMode() {
        console.log('\n🧪 TESTING MODULAR DARK MODE SWITCHING');
        console.log('====================================');

        // Test theme switching
        const currentTheme = document.documentElement.getAttribute('data-theme');
        console.log(`Current theme: ${currentTheme || 'light'}`);

        // Switch to dark mode
        document.documentElement.setAttribute('data-theme', 'dark');
        
        setTimeout(() => {
            console.log('Testing dark mode components...');
            
            // Test critical components
            const testResults = {
                wpButtons: this.testComponentContrast('.wp-core-ui .button'),
                formInputs: this.testComponentContrast('.form-input'),
                muscleComponents: this.testComponentContrast('.muscle-group-item'),
                previewSystems: this.testComponentContrast('.prompt-preview'),
                notices: this.testComponentContrast('.notice')
            };

            console.log('Dark mode test results:', testResults);

            // Switch back to original theme
            if (currentTheme) {
                document.documentElement.setAttribute('data-theme', currentTheme);
            } else {
                document.documentElement.removeAttribute('data-theme');
            }

        }, 500);
    },

    testComponentContrast(selector) {
        const elements = document.querySelectorAll(selector);
        let totalElements = elements.length;
        let passedElements = 0;

        elements.forEach(el => {
            const styles = getComputedStyle(el);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;

            // Simple contrast test - avoid white backgrounds with white text
            if (!bgColor.includes('255, 255, 255') || !textColor.includes('255, 255, 255')) {
                passedElements++;
            }
        });

        return {
            total: totalElements,
            passed: passedElements,
            failureRate: totalElements > 0 ? ((totalElements - passedElements) / totalElements * 100).toFixed(1) + '%' : '0%'
        };
    }
};

// Run the comprehensive audit
const auditResults = ModularComponentAudit.runAudit();

// Export results for further analysis
window.ModularPromptBuilderAuditResults = auditResults;

console.log('\n📊 AUDIT COMPLETE - Results saved to window.ModularPromptBuilderAuditResults');
console.log('Run ModularComponentAudit.testModularDarkMode() to test theme switching'); 