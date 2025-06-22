/**
 * UI Component Audit Tool
 * Day 3-4: Comprehensive UI Component Inventory & Dark Mode Testing
 */

console.group('🎯 UI Component Audit - Day 3-4');

// Component Categories & Inventory
const UI_COMPONENT_CATEGORIES = {
    wordpress_core: {
        name: 'WordPress Core Elements',
        selectors: [
            '.wrap',
            '.wp-core-ui .button',
            '.wp-core-ui .button-primary',
            '.wp-core-ui .button-secondary',
            '.notice',
            '.notice-success',
            '.notice-error',
            '.notice-warning',
            '#wpwrap',
            '#wpcontent',
            '#wpbody'
        ]
    },
    
    promptbuilder_containers: {
        name: 'PromptBuilder Containers',
        selectors: [
            '.prompt-builder-container',
            '.prompt-builder-left',
            '.prompt-builder-right',
            '.builder-section',
            '.dashboard-header',
            '.prompt-builder-status'
        ]
    },
    
    form_elements: {
        name: 'Form Elements',
        selectors: [
            '.form-input',
            '.form-select',
            '.form-textarea',
            '.form-group',
            '.form-row',
            '.checkbox-grid'
        ]
    },
    
    interactive_controls: {
        name: 'Interactive Controls',
        selectors: [
            '.strategy-select',
            '.user-select',
            '.button',
            '.button-primary',
            '.button-secondary'
        ]
    },
    
    status_feedback: {
        name: 'Status & Feedback',
        selectors: [
            '.status-item',
            '.status-label',
            '.status-value',
            '.prompt-builder-messages'
        ]
    }
};

function auditUIComponents() {
    console.log('🔍 Starting UI component audit...');
    
    const results = {
        categories: {},
        criticalIssues: [],
        summary: { totalComponents: 0, foundComponents: 0, darkModeIssues: 0 }
    };
    
    Object.entries(UI_COMPONENT_CATEGORIES).forEach(([key, category]) => {
        const categoryResults = { name: category.name, components: [] };
        
        category.selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            const componentResult = {
                selector,
                found: elements.length > 0,
                elementCount: elements.length,
                darkModeIssues: []
            };
            
            if (elements.length > 0) {
                // Test dark mode behavior
                const element = elements[0];
                
                // Get light mode styles
                document.documentElement.removeAttribute('data-theme');
                const lightStyles = getComputedStyle(element);
                
                // Get dark mode styles
                document.documentElement.setAttribute('data-theme', 'dark');
                const darkStyles = getComputedStyle(element);
                
                // Check for issues
                if (lightStyles.backgroundColor === darkStyles.backgroundColor && 
                    lightStyles.color === darkStyles.color) {
                    componentResult.darkModeIssues.push('No dark mode styling');
                }
                
                // Check for contrast issues
                if (darkStyles.backgroundColor.includes('255') && darkStyles.color.includes('255')) {
                    componentResult.darkModeIssues.push('White on white text');
                    results.criticalIssues.push({
                        selector,
                        issue: 'White on white text',
                        category: category.name
                    });
                }
            }
            
            categoryResults.components.push(componentResult);
            results.summary.totalComponents++;
            if (componentResult.found) results.summary.foundComponents++;
            if (componentResult.darkModeIssues.length > 0) results.summary.darkModeIssues++;
        });
        
        results.categories[key] = categoryResults;
    });
    
    return results;
}

// Execute audit
const auditResults = auditUIComponents();

console.log('📊 Audit Summary:');
console.table(auditResults.summary);

console.log('🚨 Critical Issues:');
auditResults.criticalIssues.forEach(issue => {
    console.log(`- ${issue.selector}: ${issue.issue} (${issue.category})`);
});

window.componentAudit = auditResults;
console.log('✅ Audit complete! Results in window.componentAudit');
console.groupEnd(); 