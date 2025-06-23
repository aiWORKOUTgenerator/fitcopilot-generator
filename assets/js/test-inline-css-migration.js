/**
 * Inline CSS Migration Test Suite
 * Tests to verify critical migration from PHP inline styles to modular CSS
 */

const InlineCSSMigrationTest = {
    
    /**
     * Test 1: Verify no critical inline styles remain
     */
    checkInlineStyles() {
        console.log('🔍 Test 1: Checking for remaining inline styles...');
        
        const inlineElements = document.querySelectorAll('[style]');
        const criticalInlineStyles = Array.from(inlineElements).filter(el => {
            const style = el.style;
            return style.display === 'grid' || 
                   style.gridTemplateColumns || 
                   style.backgroundColor ||
                   style.color;
        });
        
        console.log(`Found ${inlineElements.length} total inline styles`);
        console.log(`Found ${criticalInlineStyles.length} critical inline styles`);
        
        if (criticalInlineStyles.length > 0) {
            console.warn('❌ Critical inline styles still present:');
            criticalInlineStyles.forEach((el, i) => {
                console.log(`${i + 1}. ${el.tagName}.${el.className}: ${el.style.cssText}`);
            });
            return false;
        } else {
            console.log('✅ No critical inline styles found');
            return true;
        }
    },
    
    /**
     * Test 2: Verify modular CSS is loading
     */
    checkModularCSS() {
        console.log('\n🔍 Test 2: Checking modular CSS loading...');
        
        const modularCSS = document.querySelector('link[href*="prompt-builder/index.css"]');
        const adminDashboardCSS = document.querySelector('link[href*="admin-dashboard.css"]');
        const debugDashboardCSS = document.querySelector('link[href*="debug-dashboard.css"]');
        
        console.log('Modular CSS index loaded:', !!modularCSS);
        console.log('Admin Dashboard CSS loaded:', !!adminDashboardCSS);
        console.log('Debug Dashboard CSS loaded:', !!debugDashboardCSS);
        
        if (!modularCSS) {
            console.error('❌ Modular CSS index not loaded');
            return false;
        }
        
        console.log('✅ Modular CSS system is loading');
        return true;
    },
    
    /**
     * Test 3: Verify CSS variables are available
     */
    checkCSSVariables() {
        console.log('\n🔍 Test 3: Checking CSS variables...');
        
        const root = document.documentElement;
        const computedStyles = getComputedStyle(root);
        
        const testVariables = [
            '--color-success',
            '--color-error',
            '--color-background-light',
            '--color-background-card',
            '--color-border-light',
            '--color-border-medium',
            '--color-text-secondary'
        ];
        
        const missingVariables = [];
        testVariables.forEach(variable => {
            const value = computedStyles.getPropertyValue(variable).trim();
            if (!value) {
                missingVariables.push(variable);
            } else {
                console.log(`${variable}: ${value}`);
            }
        });
        
        if (missingVariables.length > 0) {
            console.error('❌ Missing CSS variables:', missingVariables);
            return false;
        } else {
            console.log('✅ All CSS variables are available');
            return true;
        }
    },
    
    /**
     * Test 4: Verify grid systems are working
     */
    checkGridSystems() {
        console.log('\n🔍 Test 4: Checking grid systems...');
        
        const gridElements = [
            '.system-status-grid',
            '.debug-dashboard-grid',
            '.status-grid'
        ];
        
        let workingGrids = 0;
        gridElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                const computed = window.getComputedStyle(element);
                if (computed.display === 'grid') {
                    console.log(`✅ ${selector}: ${computed.gridTemplateColumns}`);
                    workingGrids++;
                } else {
                    console.warn(`⚠️ ${selector} found but not using grid display`);
                }
            } else {
                console.log(`ℹ️ ${selector} not found on current page`);
            }
        });
        
        console.log(`Grid systems working: ${workingGrids}/${gridElements.length}`);
        return workingGrids > 0;
    },
    
    /**
     * Test 5: Verify component classes are being applied
     */
    checkComponentClasses() {
        console.log('\n🔍 Test 5: Checking component classes...');
        
        const componentClasses = [
            '.fitcopilot-quick-actions',
            '.status-enabled',
            '.status-disabled',
            '.debug-card'
        ];
        
        let foundComponents = 0;
        componentClasses.forEach(className => {
            const elements = document.querySelectorAll(className);
            if (elements.length > 0) {
                console.log(`✅ ${className}: ${elements.length} elements`);
                foundComponents++;
            } else {
                console.log(`ℹ️ ${className}: not found on current page`);
            }
        });
        
        console.log(`Component classes found: ${foundComponents}/${componentClasses.length}`);
        return foundComponents > 0;
    },
    
    /**
     * Test 6: Performance check - CSS file count
     */
    checkPerformance() {
        console.log('\n🔍 Test 6: Performance check...');
        
        const allStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const promptBuilderSheets = Array.from(allStylesheets).filter(sheet => 
            sheet.href && sheet.href.includes('prompt-builder')
        );
        
        console.log(`Total stylesheets: ${allStylesheets.length}`);
        console.log(`PromptBuilder stylesheets: ${promptBuilderSheets.length}`);
        
        if (promptBuilderSheets.length > 0) {
            console.log('PromptBuilder CSS files:');
            promptBuilderSheets.forEach((sheet, i) => {
                const filename = sheet.href.split('/').pop();
                console.log(`${i + 1}. ${filename}`);
            });
        }
        
        // Good performance if we have modular CSS but not too many files
        const performanceGood = promptBuilderSheets.length > 0 && promptBuilderSheets.length < 10;
        console.log(performanceGood ? '✅ Performance looks good' : '⚠️ Consider CSS optimization');
        return performanceGood;
    },
    
    /**
     * Run complete migration test suite
     */
    runCompleteTest() {
        console.log('🚀 Starting Inline CSS Migration Test Suite...\n');
        console.log('═══════════════════════════════════════════════');
        
        const testResults = {
            inlineStyles: this.checkInlineStyles(),
            modularCSS: this.checkModularCSS(),
            cssVariables: this.checkCSSVariables(),
            gridSystems: this.checkGridSystems(),
            componentClasses: this.checkComponentClasses(),
            performance: this.checkPerformance()
        };
        
        console.log('\n═══════════════════════════════════════════════');
        console.log('📊 MIGRATION TEST RESULTS:');
        console.log('═══════════════════════════════════════════════');
        
        const passed = Object.values(testResults).filter(Boolean).length;
        const total = Object.keys(testResults).length;
        
        Object.entries(testResults).forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${test.padEnd(20)}: ${status}`);
        });
        
        console.log(`\nOVERALL: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
        
        if (passed === total) {
            console.log('\n🎉 ALL TESTS PASSED! Migration is successful.');
            console.log('✅ Inline CSS has been successfully migrated to modular system');
            console.log('🚀 Layout system integrity verified');
        } else if (passed >= total * 0.8) {
            console.log('\n✅ Migration mostly successful with minor issues');
            console.log('⚠️ Review failed tests for optimization opportunities');
        } else {
            console.log('\n❌ Migration has significant issues');
            console.log('🔧 Critical fixes needed before deployment');
        }
        
        console.log('\nTip: Run individual tests for detailed diagnostics:');
        console.log('InlineCSSMigrationTest.checkInlineStyles()');
        console.log('InlineCSSMigrationTest.checkGridSystems()');
        
        return testResults;
    }
};

// Auto-run test if in browser console
if (typeof window !== 'undefined' && window.console) {
    console.log('🔧 Inline CSS Migration Test Suite loaded');
    console.log('Run: InlineCSSMigrationTest.runCompleteTest()');
}

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InlineCSSMigrationTest;
} 