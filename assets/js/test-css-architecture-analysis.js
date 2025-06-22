/**
 * CSS Architecture Analysis Tool
 * Day 1-2: CSS Architecture Analysis for Dark Mode Audit
 * 
 * This script analyzes:
 * 1. CSS file loading order and conflicts
 * 2. CSS specificity mapping
 * 3. CSS variable inheritance chains
 * 4. WordPress admin integration conflicts
 * 5. Popup/modal styling issues
 */

console.group('🔍 CSS Architecture Analysis - Day 1-2');

// ================================================
// Task 1.1: CSS File Loading Order Analysis
// ================================================

console.group('📋 Task 1.1: CSS File Loading Order Analysis');

function analyzeCSSLoadingOrder() {
    console.log('🔍 Analyzing CSS file loading order...');
    
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const inlineStyles = Array.from(document.querySelectorAll('style'));
    
    console.log(`Found ${stylesheets.length} external stylesheets and ${inlineStyles.length} inline styles`);
    
    const results = {
        stylesheets: [],
        conflicts: [],
        fitcopilotFiles: []
    };
    
    stylesheets.forEach((sheet, index) => {
        const href = sheet.href || 'inline';
        const isFitcopilot = href.includes('fitcopilot') || href.includes('admin-prompt-builder');
        
        const sheetInfo = {
            index,
            href,
            isFitcopilot,
            disabled: sheet.disabled,
            media: sheet.media || 'all',
            crossOrigin: sheet.crossOrigin,
            integrity: sheet.integrity
        };
        
        results.stylesheets.push(sheetInfo);
        
        if (isFitcopilot) {
            results.fitcopilotFiles.push(sheetInfo);
        }
    });
    
    // Check for conflicts
    const optimizedCSS = results.fitcopilotFiles.find(f => f.href.includes('optimized'));
    const originalCSS = results.fitcopilotFiles.find(f => f.href.includes('admin-prompt-builder.css') && !f.href.includes('optimized'));
    
    if (optimizedCSS && originalCSS) {
        results.conflicts.push({
            type: 'duplicate_css',
            message: 'Both optimized and original CSS files are loaded',
            files: [optimizedCSS.href, originalCSS.href]
        });
        console.warn('⚠️ CONFLICT: Both optimized and original CSS files detected!');
    }
    
    console.table(results.stylesheets);
    console.log('🎯 FitCopilot CSS Files:', results.fitcopilotFiles);
    
    if (results.conflicts.length > 0) {
        console.warn('⚠️ CSS Loading Conflicts:', results.conflicts);
    } else {
        console.log('✅ No CSS loading conflicts detected');
    }
    
    return results;
}

const cssLoadingAnalysis = analyzeCSSLoadingOrder();

console.groupEnd(); // Task 1.1

// ================================================
// Task 1.2: CSS Specificity Mapping
// ================================================

console.group('📊 Task 1.2: CSS Specificity Mapping');

function calculateSpecificity(selector) {
    // CSS specificity calculation: [inline, IDs, class/attributes/pseudo-classes, elements]
    const specificity = [0, 0, 0, 0];
    
    // Remove pseudo-elements and pseudo-classes for analysis
    const cleanSelector = selector.replace(/::?[a-zA-Z-]+(\([^)]*\))?/g, '');
    
    // Count IDs
    const ids = cleanSelector.match(/#[a-zA-Z-_][a-zA-Z0-9-_]*/g);
    if (ids) specificity[1] = ids.length;
    
    // Count classes, attributes, and pseudo-classes
    const classes = cleanSelector.match(/\.[a-zA-Z-_][a-zA-Z0-9-_]*|\[[^\]]*\]/g);
    if (classes) specificity[2] = classes.length;
    
    // Count elements
    const elements = cleanSelector.match(/\b[a-zA-Z-_][a-zA-Z0-9-_]*\b/g);
    if (elements) {
        // Filter out classes and IDs
        const elementCount = elements.filter(e => 
            !e.startsWith('.') && 
            !e.startsWith('#') && 
            !['and', 'or', 'not'].includes(e.toLowerCase())
        ).length;
        specificity[3] = elementCount;
    }
    
    return {
        specificity,
        score: specificity[0] * 1000 + specificity[1] * 100 + specificity[2] * 10 + specificity[3],
        readable: `${specificity[0]},${specificity[1]},${specificity[2]},${specificity[3]}`
    };
}

function analyzeSpecificityConflicts() {
    console.log('🔍 Analyzing CSS specificity conflicts...');
    
    const problematicSelectors = [
        '.wp-core-ui .button',
        '.notice',
        '.popup-message',
        '.modal-content',
        '.form-input',
        '[data-theme="dark"] .button',
        '[data-theme="dark"] .notice',
        'body.fitcopilot-dark-mode .button',
        '#wpwrap',
        '#wpcontent',
        '#wpbody',
        '.wrap'
    ];
    
    const specificityAnalysis = problematicSelectors.map(selector => {
        const analysis = calculateSpecificity(selector);
        return {
            selector,
            ...analysis
        };
    });
    
    console.table(specificityAnalysis);
    
    // Find potential conflicts
    const conflicts = [];
    for (let i = 0; i < specificityAnalysis.length; i++) {
        for (let j = i + 1; j < specificityAnalysis.length; j++) {
            const a = specificityAnalysis[i];
            const b = specificityAnalysis[j];
            
            if (Math.abs(a.score - b.score) < 10) {
                conflicts.push({
                    selectors: [a.selector, b.selector],
                    scores: [a.score, b.score],
                    risk: 'high'
                });
            }
        }
    }
    
    if (conflicts.length > 0) {
        console.warn('⚠️ Potential specificity conflicts:', conflicts);
    } else {
        console.log('✅ No obvious specificity conflicts detected');
    }
    
    return specificityAnalysis;
}

const specificityAnalysis = analyzeSpecificityConflicts();

console.groupEnd(); // Task 1.2

// ================================================
// Task 1.3: CSS Variable Inheritance Analysis
// ================================================

console.group('🎨 Task 1.3: CSS Variable Inheritance Analysis');

function analyzeCSSVariableInheritance() {
    console.log('🔍 Analyzing CSS custom property inheritance...');
    
    const testElement = document.createElement('div');
    testElement.style.display = 'none';
    document.body.appendChild(testElement);
    
    const cssVariables = [
        '--bg-primary',
        '--bg-secondary',
        '--text-primary',
        '--text-secondary',
        '--border-primary',
        '--color-primary',
        '--color-secondary'
    ];
    
    const inheritanceAnalysis = {
        root: {},
        lightMode: {},
        darkMode: {}
    };
    
    // Test root values
    const rootStyles = getComputedStyle(document.documentElement);
    cssVariables.forEach(varName => {
        inheritanceAnalysis.root[varName] = rootStyles.getPropertyValue(varName) || 'not defined';
    });
    
    // Test light mode (remove dark theme)
    document.documentElement.removeAttribute('data-theme');
    const lightStyles = getComputedStyle(testElement);
    cssVariables.forEach(varName => {
        inheritanceAnalysis.lightMode[varName] = lightStyles.getPropertyValue(varName) || 'not defined';
    });
    
    // Test dark mode
    document.documentElement.setAttribute('data-theme', 'dark');
    const darkStyles = getComputedStyle(testElement);
    cssVariables.forEach(varName => {
        inheritanceAnalysis.darkMode[varName] = darkStyles.getPropertyValue(varName) || 'not defined';
    });
    
    // Clean up
    document.body.removeChild(testElement);
    
    console.log('🎯 CSS Variable Inheritance Analysis:');
    console.table(inheritanceAnalysis);
    
    // Check for missing variables
    const missingVars = [];
    cssVariables.forEach(varName => {
        if (inheritanceAnalysis.darkMode[varName] === 'not defined' || 
            inheritanceAnalysis.darkMode[varName] === inheritanceAnalysis.lightMode[varName]) {
            missingVars.push(varName);
        }
    });
    
    if (missingVars.length > 0) {
        console.warn('⚠️ Variables not properly overridden in dark mode:', missingVars);
    } else {
        console.log('✅ All CSS variables properly defined for dark mode');
    }
    
    return inheritanceAnalysis;
}

const variableInheritance = analyzeCSSVariableInheritance();

console.groupEnd(); // Task 1.3

// ================================================
// Task 1.4: WordPress Admin Integration Analysis
// ================================================

console.group('🔧 Task 1.4: WordPress Admin Integration Analysis');

function analyzeWordPressIntegration() {
    console.log('🔍 Analyzing WordPress admin integration...');
    
    const wpElements = {
        core: [
            '#wpwrap',
            '#wpcontent',
            '#wpbody',
            '#wpbody-content',
            '.wrap'
        ],
        admin: [
            '#adminmenumain',
            '#adminmenuback',
            '#adminmenu a',
            '.wp-submenu'
        ],
        ui: [
            '.wp-core-ui .button',
            '.notice',
            '.notice-success',
            '.notice-error',
            '.notice-warning'
        ]
    };
    
    const integrationAnalysis = {
        found: [],
        missing: [],
        styled: [],
        unstyled: []
    };
    
    Object.entries(wpElements).forEach(([category, selectors]) => {
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            const elementInfo = {
                selector,
                category,
                found: !!element,
                styles: {}
            };
            
            if (element) {
                const styles = getComputedStyle(element);
                elementInfo.styles = {
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    borderColor: styles.borderColor
                };
                integrationAnalysis.found.push(elementInfo);
                
                // Check if element has proper dark mode styling
                const hasDarkStyling = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                                     styles.backgroundColor !== 'transparent' &&
                                     styles.color !== 'rgba(0, 0, 0, 0)';
                
                if (hasDarkStyling) {
                    integrationAnalysis.styled.push(elementInfo);
                } else {
                    integrationAnalysis.unstyled.push(elementInfo);
                }
            } else {
                integrationAnalysis.missing.push(elementInfo);
            }
        });
    });
    
    console.log('🎯 WordPress Integration Analysis:');
    console.log('Found elements:', integrationAnalysis.found.length);
    console.log('Missing elements:', integrationAnalysis.missing.length);
    console.log('Properly styled:', integrationAnalysis.styled.length);
    console.log('Unstyled elements:', integrationAnalysis.unstyled.length);
    
    if (integrationAnalysis.unstyled.length > 0) {
        console.warn('⚠️ Elements without proper styling:', integrationAnalysis.unstyled);
    }
    
    return integrationAnalysis;
}

const wpIntegrationAnalysis = analyzeWordPressIntegration();

console.groupEnd(); // Task 1.4

// ================================================
// Task 1.5: Popup/Modal Styling Analysis
// ================================================

console.group('🎭 Task 1.5: Popup/Modal Styling Analysis');

function analyzePopupModalStyling() {
    console.log('🔍 Analyzing popup/modal styling...');
    
    const modalSelectors = [
        '.modal-overlay',
        '.popup-message',
        '.tooltip',
        '.dropdown-menu',
        '.notice-message',
        '.validation-error',
        '.success-message',
        '.ui-dialog',
        '.ui-dialog-content',
        '.ui-dialog-titlebar'
    ];
    
    const modalAnalysis = {
        found: [],
        missing: [],
        contrastIssues: []
    };
    
    modalSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length > 0) {
            elements.forEach((element, index) => {
                const styles = getComputedStyle(element);
                const elementInfo = {
                    selector: `${selector}[${index}]`,
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    borderColor: styles.borderColor,
                    hasContrast: checkContrast(styles.backgroundColor, styles.color)
                };
                
                modalAnalysis.found.push(elementInfo);
                
                if (!elementInfo.hasContrast) {
                    modalAnalysis.contrastIssues.push(elementInfo);
                }
            });
        } else {
            modalAnalysis.missing.push({ selector, reason: 'not found in DOM' });
        }
    });
    
    console.log('🎯 Popup/Modal Analysis:');
    console.log('Found elements:', modalAnalysis.found.length);
    console.log('Missing elements:', modalAnalysis.missing.length);
    console.log('Contrast issues:', modalAnalysis.contrastIssues.length);
    
    if (modalAnalysis.contrastIssues.length > 0) {
        console.warn('⚠️ Elements with contrast issues:', modalAnalysis.contrastIssues);
    }
    
    return modalAnalysis;
}

function checkContrast(backgroundColor, textColor) {
    // Simplified contrast check
    if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        return true; // Can't determine, assume it's okay
    }
    
    if (textColor === 'rgba(0, 0, 0, 0)' || textColor === 'transparent') {
        return false; // Invisible text
    }
    
    // Check for obviously problematic combinations
    const isLightBg = backgroundColor.includes('255') || backgroundColor.includes('white');
    const isLightText = textColor.includes('255') || textColor.includes('white');
    const isDarkBg = backgroundColor.includes('0,') || backgroundColor.includes('black');
    const isDarkText = textColor.includes('0,') || textColor.includes('black');
    
    // White on white or black on black
    if ((isLightBg && isLightText) || (isDarkBg && isDarkText)) {
        return false;
    }
    
    return true;
}

const modalAnalysis = analyzePopupModalStyling();

console.groupEnd(); // Task 1.5

// ================================================
// Summary Report
// ================================================

console.group('📊 CSS Architecture Analysis Summary');

const analysisReport = {
    timestamp: new Date().toISOString(),
    cssLoading: {
        totalStylesheets: cssLoadingAnalysis.stylesheets.length,
        fitcopilotFiles: cssLoadingAnalysis.fitcopilotFiles.length,
        conflicts: cssLoadingAnalysis.conflicts.length,
        status: cssLoadingAnalysis.conflicts.length === 0 ? 'PASS' : 'FAIL'
    },
    specificity: {
        analyzedSelectors: specificityAnalysis.length,
        potentialConflicts: specificityAnalysis.filter(s => s.score > 100).length,
        status: 'ANALYZED'
    },
    cssVariables: {
        totalVariables: Object.keys(variableInheritance.root).length,
        darkModeOverrides: Object.keys(variableInheritance.darkMode).filter(key => 
            variableInheritance.darkMode[key] !== variableInheritance.lightMode[key]
        ).length,
        status: 'ANALYZED'
    },
    wordpressIntegration: {
        foundElements: wpIntegrationAnalysis.found.length,
        styledElements: wpIntegrationAnalysis.styled.length,
        unstyledElements: wpIntegrationAnalysis.unstyled.length,
        status: wpIntegrationAnalysis.unstyled.length === 0 ? 'PASS' : 'NEEDS_ATTENTION'
    },
    popupModals: {
        foundElements: modalAnalysis.found.length,
        contrastIssues: modalAnalysis.contrastIssues.length,
        status: modalAnalysis.contrastIssues.length === 0 ? 'PASS' : 'CRITICAL'
    }
};

console.log('🎯 CSS ARCHITECTURE ANALYSIS COMPLETE');
console.table(analysisReport);

// Identify critical issues
const criticalIssues = [];

if (analysisReport.cssLoading.status === 'FAIL') {
    criticalIssues.push('CSS Loading Conflicts');
}

if (analysisReport.wordpressIntegration.status === 'NEEDS_ATTENTION') {
    criticalIssues.push('WordPress Integration Issues');
}

if (analysisReport.popupModals.status === 'CRITICAL') {
    criticalIssues.push('Popup/Modal Contrast Issues');
}

if (criticalIssues.length > 0) {
    console.error('🚨 CRITICAL ISSUES FOUND:', criticalIssues);
    console.log('📋 Recommended Actions:');
    
    if (criticalIssues.includes('CSS Loading Conflicts')) {
        console.log('  1. Remove conflicting CSS files from loading');
    }
    
    if (criticalIssues.includes('WordPress Integration Issues')) {
        console.log('  2. Add higher specificity selectors for WordPress elements');
    }
    
    if (criticalIssues.includes('Popup/Modal Contrast Issues')) {
        console.log('  3. Implement proper dark mode styling for popup/modal elements');
    }
} else {
    console.log('✅ No critical issues found in CSS architecture');
}

console.log('📄 Full analysis data available in window.cssArchitectureAnalysis');
window.cssArchitectureAnalysis = {
    cssLoading: cssLoadingAnalysis,
    specificity: specificityAnalysis,
    variables: variableInheritance,
    wordpress: wpIntegrationAnalysis,
    modals: modalAnalysis,
    report: analysisReport
};

console.groupEnd(); // Summary
console.groupEnd(); // Main analysis

console.log('🎉 CSS Architecture Analysis Complete!');
console.log('📊 Results available in window.cssArchitectureAnalysis');
console.log('🔍 Run this script on your PromptBuilder admin page to identify dark mode issues.'); 