/**
 * UI Component Audit Tool
 * Day 3-4: Comprehensive UI Component Inventory & Dark Mode Testing
 * 
 * This script:
 * 1. Inventories all UI components in PromptBuilder system
 * 2. Tests each component's dark mode behavior
 * 3. Identifies white-on-white text issues
 * 4. Documents component behavior
 * 5. Provides actionable fix recommendations
 */

console.group('🎯 UI Component Audit - Day 3-4');

// ================================================
// Component Categories & Inventory
// ================================================

const UI_COMPONENT_CATEGORIES = {
    // WordPress Core Integration
    wordpress_core: {
        name: 'WordPress Core Elements',
        selectors: [
            '.wrap',
            '.wp-heading-inline',
            '.wp-core-ui .button',
            '.wp-core-ui .button-primary',
            '.wp-core-ui .button-secondary',
            '.wp-core-ui .button-small',
            '.notice',
            '.notice-success',
            '.notice-error',
            '.notice-warning',
            '.notice-info',
            '.postbox',
            '.inside',
            '#wpwrap',
            '#wpcontent',
            '#wpbody',
            '#wpbody-content',
            '#adminmenumain',
            '#adminmenuback',
            '.wp-submenu'
        ]
    },
    
    // PromptBuilder Container Structure
    promptbuilder_containers: {
        name: 'PromptBuilder Containers',
        selectors: [
            '.prompt-builder-container',
            '.prompt-builder-left',
            '.prompt-builder-right',
            '.builder-section',
            '.dashboard-header',
            '.dashboard-header-content',
            '.dashboard-controls',
            '.prompt-builder-status'
        ]
    },
    
    // Form Elements
    form_elements: {
        name: 'Form Elements',
        selectors: [
            '.prompt-form',
            '.form-group',
            '.form-row',
            '.form-input',
            '.form-select',
            '.form-textarea',
            '.form-label',
            '.form-description',
            '.form-actions',
            '.height-input-group',
            '.height-separator',
            '.checkbox-grid'
        ]
    },
    
    // Status & Feedback Elements
    status_feedback: {
        name: 'Status & Feedback',
        selectors: [
            '.status-item',
            '.status-label',
            '.status-value',
            '.status-value.active',
            '.status-value.inactive',
            '.prompt-builder-messages',
            '.user-load-status',
            '.section-description'
        ]
    },
    
    // Interactive Controls
    interactive_controls: {
        name: 'Interactive Controls',
        selectors: [
            '.strategy-controls',
            '.strategy-select',
            '.profile-controls',
            '.user-select',
            '.prompt-controls',
            '.code-controls',
            '.preview-controls'
        ]
    },
    
    // Content Display Areas
    content_display: {
        name: 'Content Display Areas',
        selectors: [
            '.strategy-code-viewer',
            '.code-placeholder',
            '.prompt-preview',
            '.preview-content',
            '.preview-placeholder',
            '.workout-test-preview',
            '.context-inspector'
        ]
    },
    
    // Statistics & Metrics
    stats_metrics: {
        name: 'Statistics & Metrics',
        selectors: [
            '.prompt-stats',
            '.stat-item',
            '.stat-value',
            '.stat-label',
            '.workout-performance',
            '.perf-item',
            '.perf-value',
            '.perf-label'
        ]
    },
    
    // Testing Lab Components
    testing_lab: {
        name: 'Testing Lab Components',
        selectors: [
            '.testing-lab-container',
            '.test-options-grid',
            '.test-card',
            '.test-card-icon',
            '.test-card-content',
            '.test-button',
            '.test-button-primary',
            '.test-button-secondary',
            '.test-results-section',
            '.test-results',
            '.test-results-placeholder'
        ]
    },
    
    // Module Components
    module_components: {
        name: 'Module Components',
        selectors: [
            '.sleep-quality-card',
            '.modular-card',
            '.card-header',
            '.card-title',
            '.card-icon',
            '.card-badge',
            '.card-content',
            '.card-summary',
            '.profile-module-container',
            '.profile-selection',
            '.profile-form',
            '.profile-actions',
            '.profile-stats'
        ]
    },
    
    // Special Effects & Animations
    special_effects: {
        name: 'Special Effects',
        selectors: [
            '.collapsible-section',
            '.collapsible-content',
            '.collapse-toggle',
            '.loading-spinner',
            '.modal-overlay',
            '.popup-message',
            '.tooltip',
            '.dropdown-menu'
        ]
    }
};

// ================================================
// Component Audit Functions
// ================================================

function auditUIComponents() {
    console.log('🔍 Starting comprehensive UI component audit...');
    
    const auditResults = {
        timestamp: new Date().toISOString(),
        categories: {},
        summary: {
            totalComponents: 0,
            foundComponents: 0,
            missingComponents: 0,
            darkModeIssues: 0,
            contrastIssues: 0
        },
        criticalIssues: [],
        recommendations: []
    };
    
    // Audit each category
    Object.entries(UI_COMPONENT_CATEGORIES).forEach(([categoryKey, category]) => {
        console.group(`📂 Auditing ${category.name}`);
        
        const categoryResults = {
            name: category.name,
            components: [],
            stats: {
                total: category.selectors.length,
                found: 0,
                missing: 0,
                darkModeIssues: 0,
                contrastIssues: 0
            }
        };
        
        category.selectors.forEach(selector => {
            const componentResult = auditSingleComponent(selector);
            categoryResults.components.push(componentResult);
            
            // Update stats
            if (componentResult.found) {
                categoryResults.stats.found++;
            } else {
                categoryResults.stats.missing++;
            }
            
            if (componentResult.darkModeIssues.length > 0) {
                categoryResults.stats.darkModeIssues++;
            }
            
            if (componentResult.contrastIssue) {
                categoryResults.stats.contrastIssues++;
            }
        });
        
        auditResults.categories[categoryKey] = categoryResults;
        
        // Update summary
        auditResults.summary.totalComponents += categoryResults.stats.total;
        auditResults.summary.foundComponents += categoryResults.stats.found;
        auditResults.summary.missingComponents += categoryResults.stats.missing;
        auditResults.summary.darkModeIssues += categoryResults.stats.darkModeIssues;
        auditResults.summary.contrastIssues += categoryResults.stats.contrastIssues;
        
        console.log(`✅ Found: ${categoryResults.stats.found}/${categoryResults.stats.total}`);
        console.log(`⚠️ Issues: ${categoryResults.stats.darkModeIssues} dark mode, ${categoryResults.stats.contrastIssues} contrast`);
        console.groupEnd();
    });
    
    // Identify critical issues
    identifyCriticalIssues(auditResults);
    
    // Generate recommendations
    generateRecommendations(auditResults);
    
    return auditResults;
}

function auditSingleComponent(selector) {
    const elements = document.querySelectorAll(selector);
    const componentResult = {
        selector,
        found: elements.length > 0,
        elementCount: elements.length,
        darkModeIssues: [],
        contrastIssue: false,
        styles: {
            light: {},
            dark: {}
        }
    };
    
    if (elements.length === 0) {
        return componentResult;
    }
    
    // Test first element (representative)
    const element = elements[0];
    
    // Get light mode styles
    document.documentElement.removeAttribute('data-theme');
    const lightStyles = getComputedStyle(element);
    componentResult.styles.light = {
        backgroundColor: lightStyles.backgroundColor,
        color: lightStyles.color,
        borderColor: lightStyles.borderColor
    };
    
    // Get dark mode styles
    document.documentElement.setAttribute('data-theme', 'dark');
    const darkStyles = getComputedStyle(element);
    componentResult.styles.dark = {
        backgroundColor: darkStyles.backgroundColor,
        color: darkStyles.color,
        borderColor: darkStyles.borderColor
    };
    
    // Analyze dark mode behavior
    analyzeDarkModeBehavior(componentResult);
    
    return componentResult;
}

function analyzeDarkModeBehavior(componentResult) {
    const { light, dark } = componentResult.styles;
    
    // Check if styles changed between light and dark mode
    const backgroundChanged = light.backgroundColor !== dark.backgroundColor;
    const colorChanged = light.color !== dark.color;
    const borderChanged = light.borderColor !== dark.borderColor;
    
    if (!backgroundChanged && !colorChanged && !borderChanged) {
        componentResult.darkModeIssues.push('No dark mode styling applied');
    }
    
    // Check for contrast issues
    const contrastIssue = checkContrastIssue(dark.backgroundColor, dark.color);
    if (contrastIssue) {
        componentResult.contrastIssue = true;
        componentResult.darkModeIssues.push(contrastIssue);
    }
    
    // Check for transparent/inherited colors
    if (dark.backgroundColor === 'rgba(0, 0, 0, 0)' || dark.backgroundColor === 'transparent') {
        if (dark.color === 'rgb(255, 255, 255)' || dark.color.includes('255')) {
            componentResult.darkModeIssues.push('White text on transparent background (potential invisibility)');
        }
    }
}

function checkContrastIssue(backgroundColor, textColor) {
    // Check for obviously problematic combinations
    
    // White on white
    if (backgroundColor.includes('255, 255, 255') && textColor.includes('255, 255, 255')) {
        return 'White text on white background';
    }
    
    // Black on black
    if (backgroundColor.includes('0, 0, 0') && textColor.includes('0, 0, 0')) {
        return 'Black text on black background';
    }
    
    // Light text on light background
    if (backgroundColor.includes('248, 250, 252') && textColor.includes('248, 250, 252')) {
        return 'Light text on light background';
    }
    
    // Dark text on dark background
    if (backgroundColor.includes('15, 23, 42') && textColor.includes('15, 23, 42')) {
        return 'Dark text on dark background';
    }
    
    return null;
}

function identifyCriticalIssues(auditResults) {
    console.log('🚨 Identifying critical issues...');
    
    Object.entries(auditResults.categories).forEach(([categoryKey, category]) => {
        category.components.forEach(component => {
            if (component.contrastIssue) {
                auditResults.criticalIssues.push({
                    type: 'contrast',
                    severity: 'critical',
                    selector: component.selector,
                    issue: component.darkModeIssues.join(', '),
                    category: category.name
                });
            }
            
            // Check for WordPress core elements without dark mode
            if (categoryKey === 'wordpress_core' && component.darkModeIssues.includes('No dark mode styling applied')) {
                auditResults.criticalIssues.push({
                    type: 'wordpress_integration',
                    severity: 'high',
                    selector: component.selector,
                    issue: 'WordPress core element lacks dark mode styling',
                    category: category.name
                });
            }
            
            // Check for notice/message elements
            if (component.selector.includes('notice') || component.selector.includes('message')) {
                if (component.darkModeIssues.length > 0) {
                    auditResults.criticalIssues.push({
                        type: 'user_feedback',
                        severity: 'critical',
                        selector: component.selector,
                        issue: 'User feedback element has dark mode issues',
                        category: category.name
                    });
                }
            }
        });
    });
    
    console.log(`🚨 Critical issues found: ${auditResults.criticalIssues.length}`);
}

function generateRecommendations(auditResults) {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // High specificity recommendation
    const wordpressIssues = auditResults.criticalIssues.filter(issue => issue.type === 'wordpress_integration');
    if (wordpressIssues.length > 0) {
        recommendations.push({
            priority: 'P0',
            title: 'Increase CSS Specificity for WordPress Elements',
            description: `${wordpressIssues.length} WordPress core elements lack dark mode styling`,
            solution: 'Add higher specificity selectors: body[data-theme="dark"] .wp-core-ui .button',
            impact: 'Fixes button and core UI element visibility'
        });
    }
    
    // Contrast issues recommendation
    const contrastIssues = auditResults.criticalIssues.filter(issue => issue.type === 'contrast');
    if (contrastIssues.length > 0) {
        recommendations.push({
            priority: 'P0',
            title: 'Fix Contrast Issues',
            description: `${contrastIssues.length} components have text visibility problems`,
            solution: 'Add specific dark mode styling for each affected component',
            impact: 'Eliminates white-on-white and black-on-black text issues'
        });
    }
    
    // User feedback elements
    const feedbackIssues = auditResults.criticalIssues.filter(issue => issue.type === 'user_feedback');
    if (feedbackIssues.length > 0) {
        recommendations.push({
            priority: 'P0',
            title: 'Fix Notice/Message Element Styling',
            description: `${feedbackIssues.length} user feedback elements have dark mode issues`,
            solution: 'Add dark mode styling for .notice, .popup-message, .modal-content',
            impact: 'Ensures user feedback is always visible'
        });
    }
    
    auditResults.recommendations = recommendations;
}

// ================================================
// Testing Functions
// ================================================

function testDarkModeToggle() {
    console.log('🌙 Testing dark mode toggle functionality...');
    
    const results = {
        toggleAvailable: false,
        toggleWorks: false,
        transitionSmooth: false,
        persistsSettings: false
    };
    
    // Check if dark mode toggle is available
    if (window.FitCopilotDarkMode) {
        results.toggleAvailable = true;
        
        // Test toggle functionality
        const initialTheme = document.documentElement.getAttribute('data-theme');
        
        try {
            window.FitCopilotDarkMode.setTheme('dark');
            const afterDark = document.documentElement.getAttribute('data-theme');
            
            window.FitCopilotDarkMode.setTheme('light');
            const afterLight = document.documentElement.getAttribute('data-theme');
            
            results.toggleWorks = (afterDark === 'dark' && afterLight !== 'dark');
            
            // Test persistence
            const storedTheme = localStorage.getItem('fitcopilot-theme-preference');
            results.persistsSettings = storedTheme !== null;
            
            // Restore initial theme
            if (initialTheme) {
                document.documentElement.setAttribute('data-theme', initialTheme);
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            
        } catch (error) {
            console.error('Dark mode toggle test failed:', error);
        }
    }
    
    return results;
}

function generateComponentReport(auditResults) {
    console.group('📊 Component Audit Report');
    
    console.log('🎯 AUDIT SUMMARY');
    console.table(auditResults.summary);
    
    console.log('\n📂 CATEGORY BREAKDOWN');
    Object.entries(auditResults.categories).forEach(([key, category]) => {
        console.log(`\n${category.name}:`);
        console.log(`  Found: ${category.stats.found}/${category.stats.total}`);
        console.log(`  Issues: ${category.stats.darkModeIssues} dark mode, ${category.stats.contrastIssues} contrast`);
        
        // Show problematic components
        const problematicComponents = category.components.filter(c => c.darkModeIssues.length > 0);
        if (problematicComponents.length > 0) {
            console.log(`  Problematic components:`);
            problematicComponents.forEach(comp => {
                console.log(`    - ${comp.selector}: ${comp.darkModeIssues.join(', ')}`);
            });
        }
    });
    
    console.log('\n🚨 CRITICAL ISSUES');
    auditResults.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.selector}`);
        console.log(`   Category: ${issue.category}`);
        console.log(`   Issue: ${issue.issue}`);
    });
    
    console.log('\n💡 RECOMMENDATIONS');
    auditResults.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.title}`);
        console.log(`   Description: ${rec.description}`);
        console.log(`   Solution: ${rec.solution}`);
        console.log(`   Impact: ${rec.impact}`);
    });
    
    console.groupEnd();
}

// ================================================
// Main Execution
// ================================================

console.log('🚀 Starting UI Component Audit...');

const auditResults = auditUIComponents();
const toggleResults = testDarkModeToggle();

// Generate comprehensive report
generateComponentReport(auditResults);

// Test dark mode toggle
console.log('\n🌙 Dark Mode Toggle Test Results:');
console.table(toggleResults);

// Store results globally
window.uiComponentAudit = {
    results: auditResults,
    toggleTest: toggleResults,
    timestamp: new Date().toISOString()
};

console.log('\n✅ UI Component Audit Complete!');
console.log('📊 Full results available in window.uiComponentAudit');
console.log('🔍 Run this script on the PromptBuilder admin page to identify all dark mode issues');

console.groupEnd(); // Main audit group 