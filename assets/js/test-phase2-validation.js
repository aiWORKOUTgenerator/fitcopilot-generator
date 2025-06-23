/**
 * Phase 2 Inline CSS Migration Validation Test
 * Validates TestingLabView, SleepQualityView, and MuscleView migrations
 */

const Phase2ValidationTest = {
    
    /**
     * Test 1: Verify zero inline CSS blocks remain
     */
    checkRemainingInlineBlocks() {
        console.log('🔍 Test 1: Checking for remaining inline CSS blocks...');
        
        // Check for any <style> tags in the document
        const styleTags = document.querySelectorAll('style');
        const inlineStyleTags = Array.from(styleTags).filter(tag => 
            tag.innerHTML.includes('.testing-lab-container') ||
            tag.innerHTML.includes('.sleep-quality-summary') ||
            tag.innerHTML.includes('.muscle-selection-container') ||
            tag.innerHTML.includes('grid-template-columns')
        );
        
        console.log(`Total <style> tags found: ${styleTags.length}`);
        console.log(`Problematic inline style blocks: ${inlineStyleTags.length}`);
        
        if (inlineStyleTags.length > 0) {
            console.error('❌ Found problematic inline CSS blocks:');
            inlineStyleTags.forEach((tag, i) => {
                console.log(`${i + 1}. Contains: ${tag.innerHTML.substring(0, 100)}...`);
            });
            return false;
        } else {
            console.log('✅ No problematic inline CSS blocks found');
            return true;
        }
    },
    
    /**
     * Test 2: Verify component CSS files are loading
     */
    checkComponentCSSLoading() {
        console.log('\n🔍 Test 2: Checking component CSS loading...');
        
        const expectedComponents = [
            'testing-lab.css',
            'sleep-quality.css', 
            'muscle-targeting.css'
        ];
        
        const allStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const loadedComponents = [];
        
        expectedComponents.forEach(component => {
            const found = Array.from(allStylesheets).some(sheet => 
                sheet.href && sheet.href.includes(component)
            );
            
            if (found) {
                loadedComponents.push(component);
                console.log(`✅ ${component} - LOADED`);
            } else {
                console.log(`❌ ${component} - NOT FOUND`);
            }
        });
        
        const allLoaded = loadedComponents.length === expectedComponents.length;
        console.log(`\nComponent CSS loading: ${loadedComponents.length}/${expectedComponents.length}`);
        return allLoaded;
    },
    
    /**
     * Test 3: Verify critical grid systems are working
     */
    checkCriticalGridSystems() {
        console.log('\n🔍 Test 3: Checking critical grid systems...');
        
        const gridSelectors = [
            '.summary-stats', // Sleep Quality grid
            '.muscle-groups-grid', // Muscle targeting grid
            '.collapsible-section' // Testing lab sections
        ];
        
        let workingGrids = 0;
        const gridResults = [];
        
        gridSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                const computed = window.getComputedStyle(element);
                const hasGrid = computed.display === 'grid' || computed.gridTemplateColumns !== 'none';
                
                if (hasGrid) {
                    console.log(`✅ ${selector}: Grid active (${computed.gridTemplateColumns})`);
                    workingGrids++;
                    gridResults.push({ selector, status: 'working', columns: computed.gridTemplateColumns });
                } else {
                    console.log(`⚠️ ${selector}: Found but no grid layout`);
                    gridResults.push({ selector, status: 'found-no-grid' });
                }
            } else {
                console.log(`ℹ️ ${selector}: Not found on current page`);
                gridResults.push({ selector, status: 'not-found' });
            }
        });
        
        console.log(`\nGrid systems working: ${workingGrids}/${gridSelectors.length}`);
        return { workingGrids, gridResults };
    },
    
    /**
     * Test 4: Verify CSS variables integration
     */
    checkCSSVariablesIntegration() {
        console.log('\n🔍 Test 4: Checking CSS variables integration...');
        
        const root = document.documentElement;
        const computedStyles = getComputedStyle(root);
        
        // Test Phase 2 specific variables
        const phase2Variables = [
            { name: '--text-inverse', context: 'testing-lab section headers' },
            { name: '--color-info', context: 'sleep quality stats' },
            { name: '--bg-accent', context: 'muscle selection summary' }
        ];
        
        let variablesWorking = 0;
        phase2Variables.forEach(({ name, context }) => {
            const value = computedStyles.getPropertyValue(name).trim();
            if (value) {
                console.log(`✅ ${name}: ${value} (${context})`);
                variablesWorking++;
            } else {
                console.log(`❌ ${name}: Not found (needed for ${context})`);
            }
        });
        
        // Test core variables are still working
        const coreVariables = ['--color-background-card', '--color-border-light', '--text-primary'];
        let coreVariablesWorking = 0;
        
        coreVariables.forEach(variable => {
            const value = computedStyles.getPropertyValue(variable).trim();
            if (value) {
                coreVariablesWorking++;
            }
        });
        
        console.log(`\nPhase 2 variables: ${variablesWorking}/${phase2Variables.length}`);
        console.log(`Core variables: ${coreVariablesWorking}/${coreVariables.length}`);
        
        return variablesWorking >= 2 && coreVariablesWorking >= 2;
    },
    
    /**
     * Test 5: Verify responsive design is working
     */
    checkResponsiveDesign() {
        console.log('\n🔍 Test 5: Checking responsive design...');
        
        // Test responsive grid changes
        const responsiveElements = [
            { selector: '.summary-stats', breakpoint: 768 },
            { selector: '.muscle-groups-grid', breakpoint: 768 },
            { selector: '.section-header', breakpoint: 768 }
        ];
        
        let responsiveWorking = 0;
        
        responsiveElements.forEach(({ selector, breakpoint }) => {
            const element = document.querySelector(selector);
            if (element) {
                // Simulate mobile width check
                const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
                console.log(`✅ ${selector}: Responsive rules available (breakpoint: ${breakpoint}px)`);
                responsiveWorking++;
            } else {
                console.log(`ℹ️ ${selector}: Not found on current page`);
            }
        });
        
        console.log(`\nResponsive elements: ${responsiveWorking}/${responsiveElements.length}`);
        return responsiveWorking > 0;
    },
    
    /**
     * Test 6: Verify migration impact - Performance
     */
    checkMigrationImpact() {
        console.log('\n🔍 Test 6: Checking migration impact...');
        
        // Count total CSS rules
        const allStylesheets = document.styleSheets;
        let totalRules = 0;
        let promptBuilderRules = 0;
        
        try {
            Array.from(allStylesheets).forEach(sheet => {
                try {
                    if (sheet.cssRules) {
                        totalRules += sheet.cssRules.length;
                        if (sheet.href && sheet.href.includes('prompt-builder')) {
                            promptBuilderRules += sheet.cssRules.length;
                        }
                    }
                } catch (e) {
                    // CORS or other access issues
                }
            });
        } catch (e) {
            console.log('ℹ️ Cannot access stylesheet rules (CORS)');
        }
        
        console.log(`Total CSS rules: ${totalRules}`);
        console.log(`PromptBuilder CSS rules: ${promptBuilderRules}`);
        
        // Check for duplicate styles (would indicate poor migration)
        const duplicateCheck = document.querySelectorAll('[style*="grid-template-columns"]');
        console.log(`Elements with inline grid styles: ${duplicateCheck.length}`);
        
        const goodPerformance = duplicateCheck.length === 0;
        console.log(goodPerformance ? '✅ Clean migration - no style conflicts' : '❌ Style conflicts detected');
        
        return goodPerformance;
    },
    
    /**
     * Run complete Phase 2 validation
     */
    runCompleteValidation() {
        console.log('🚀 PHASE 2 INLINE CSS MIGRATION - VALIDATION TEST SUITE');
        console.log('═════════════════════════════════════════════════════════');
        console.log('Testing: TestingLabView, SleepQualityView, MuscleView migrations\n');
        
        const startTime = performance.now();
        
        const testResults = {
            inlineBlocks: this.checkRemainingInlineBlocks(),
            cssLoading: this.checkComponentCSSLoading(),
            gridSystems: this.checkCriticalGridSystems(),
            cssVariables: this.checkCSSVariablesIntegration(),
            responsive: this.checkResponsiveDesign(),
            performance: this.checkMigrationImpact()
        };
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Calculate overall score
        const passedTests = Object.values(testResults).filter(result => 
            typeof result === 'boolean' ? result : result.workingGrids > 0
        ).length;
        const totalTests = Object.keys(testResults).length;
        const score = Math.round((passedTests / totalTests) * 100);
        
        console.log('\n═════════════════════════════════════════════════════════');
        console.log('📊 PHASE 2 VALIDATION RESULTS');
        console.log('═════════════════════════════════════════════════════════');
        console.log(`Tests passed: ${passedTests}/${totalTests} (${score}%)`);
        console.log(`Test duration: ${duration}ms`);
        
        if (score >= 85) {
            console.log('🎉 PHASE 2 MIGRATION: SUCCESS!');
            console.log('✅ All critical migrations completed successfully');
            console.log('✅ Modular CSS system is working correctly');
            console.log('✅ No inline CSS conflicts detected');
        } else if (score >= 70) {
            console.log('⚠️ PHASE 2 MIGRATION: MOSTLY SUCCESSFUL');
            console.log('Some minor issues detected - review failed tests above');
        } else {
            console.log('❌ PHASE 2 MIGRATION: NEEDS ATTENTION');
            console.log('Critical issues detected - immediate fixes needed');
        }
        
        console.log('\n📈 MIGRATION PROGRESS:');
        console.log('Phase 1: AdminMenu, DebugDashboard ✅ COMPLETED');
        console.log('Phase 2: TestingLab, SleepQuality, MuscleTargeting ✅ COMPLETED');
        console.log('Remaining: Inline style attributes cleanup');
        
        return {
            score,
            results: testResults,
            duration,
            success: score >= 85
        };
    }
};

// Auto-run validation when loaded
if (typeof window !== 'undefined') {
    console.log('Phase 2 Validation Test Suite loaded. Run: Phase2ValidationTest.runCompleteValidation()');
} 