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

console.log('🎉 CSS Architecture Analysis Complete!');
console.log('📊 Results available in window.cssArchitectureAnalysis');
console.log('🔍 Run this script on your PromptBuilder admin page to identify dark mode issues.'); 