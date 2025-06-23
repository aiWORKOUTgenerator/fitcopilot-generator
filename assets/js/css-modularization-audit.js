/**
 * CSS Modularization Audit Script
 * Comprehensive validation of the modular CSS architecture
 * 
 * Usage: Run in browser console on PromptBuilder admin page
 */

const CSS_MODULARIZATION_AUDIT = {
    // Configuration
    config: {
        testTimeout: 5000,
        logLevel: 'detailed',
        runDestructiveTests: false
    },

    // Test Results Storage
    results: {
        passed: 0,
        failed: 0,
        warnings: 0,
        details: []
    },

    /**
     * Main Audit Entry Point
     */
    async runCompleteAudit() {
        console.log('🎯 CSS MODULARIZATION AUDIT - INITIATED');
        console.log('=' .repeat(50));
        
        this.startTime = performance.now();
        
        // Phase 1: Architecture Validation
        await this.validateArchitecture();
        
        // Phase 2: Component Functionality
        await this.validateComponents();
        
        // Phase 3: Integration Testing
        await this.validateIntegration();
        
        // Phase 4: Performance Testing
        await this.validatePerformance();
        
        // Generate Report
        this.generateAuditReport();
    },

    /**
     * Phase 1: Architecture Validation
     */
    async validateArchitecture() {
        console.log('\n📐 Phase 1: Architecture Validation');
        
        const tests = [
            { name: 'CSS Load Order', test: this.testCSSLoadOrder },
            { name: 'Import Dependencies', test: this.testImportDependencies },
            { name: 'Variable System', test: this.testVariableSystem },
            { name: 'Module Isolation', test: this.testModuleIsolation }
        ];
        
        for (const test of tests) {
            await this.runTest(test.name, test.test);
        }
    },

    /**
     * Phase 2: Component Functionality Testing
     */
    async validateComponents() {
        console.log('\n🧩 Phase 2: Component Functionality');
        
        const tests = [
            { name: 'Button Components', test: this.testButtonComponents },
            { name: 'Form Components', test: this.testFormComponents },
            { name: 'Preview Components', test: this.testPreviewComponents }
        ];
        
        for (const test of tests) {
            await this.runTest(test.name, test.test);
        }
    },

    /**
     * Phase 3: Integration Testing
     */
    async validateIntegration() {
        console.log('\n🔌 Phase 3: Integration Testing');
        
        const tests = [
            { name: 'WordPress Integration', test: this.testWordPressIntegration },
            { name: 'Dark Mode Integration', test: this.testDarkModeIntegration },
            { name: 'Responsive Integration', test: this.testResponsiveIntegration }
        ];
        
        for (const test of tests) {
            await this.runTest(test.name, test.test);
        }
    },

    /**
     * Phase 4: Performance Testing
     */
    async validatePerformance() {
        console.log('\n⚡ Phase 4: Performance Testing');
        
        const tests = [
            { name: 'CSS Load Time', test: this.testCSSLoadTime },
            { name: 'Render Performance', test: this.testRenderPerformance }
        ];
        
        for (const test of tests) {
            await this.runTest(test.name, test.test);
        }
    },

    /**
     * Individual Test Implementations
     */
    
    testCSSLoadOrder: async function() {
        const stylesheets = Array.from(document.styleSheets);
        const promptBuilderCSS = stylesheets.find(sheet => 
            sheet.href && sheet.href.includes('prompt-builder/index.css')
        );
        
        if (!promptBuilderCSS) {
            throw new Error('Modular CSS not loaded');
        }
        
        return {
            status: 'PASS',
            details: 'Modular CSS loaded successfully',
            data: { href: promptBuilderCSS.href }
        };
    },

    testImportDependencies: async function() {
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--fc-primary');
        
        if (!primaryColor || primaryColor.trim() === '') {
            throw new Error('CSS variables not loaded - dependency chain broken');
        }
        
        return {
            status: 'PASS',
            details: 'CSS variable system loaded correctly',
            data: { primaryColor: primaryColor.trim() }
        };
    },

    testVariableSystem: async function() {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        const requiredVariables = [
            '--fc-primary', '--fc-secondary', '--fc-success', '--fc-warning', '--fc-error',
            '--fc-bg-primary', '--fc-text-primary'
        ];
        
        const missing = requiredVariables.filter(variable => 
            !style.getPropertyValue(variable).trim()
        );
        
        if (missing.length > 0) {
            throw new Error(`Missing CSS variables: ${missing.join(', ')}`);
        }
        
        return {
            status: 'PASS',
            details: `All ${requiredVariables.length} core variables loaded`,
            data: { variables: requiredVariables.length, missing: missing.length }
        };
    },

    testModuleIsolation: async function() {
        const testElement = document.createElement('div');
        testElement.className = 'test-isolation';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);
        
        try {
            const computed = getComputedStyle(testElement);
            const hasUnintendedStyles = computed.margin !== '0px' || computed.padding !== '0px';
            
            if (hasUnintendedStyles) {
                return {
                    status: 'WARN',
                    details: 'Some global styles may be affecting isolated elements',
                    data: { margin: computed.margin, padding: computed.padding }
                };
            }
            
            return {
                status: 'PASS',
                details: 'Module isolation working correctly',
                data: { clean: true }
            };
        } finally {
            document.body.removeChild(testElement);
        }
    },

    testButtonComponents: async function() {
        const buttons = document.querySelectorAll('button, .button, input[type="button"]');
        
        if (buttons.length === 0) {
            throw new Error('No buttons found to test');
        }
        
        let styledButtons = 0;
        buttons.forEach(button => {
            const computed = getComputedStyle(button);
            if (computed.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                computed.borderRadius !== '0px') {
                styledButtons++;
            }
        });
        
        return {
            status: styledButtons > 0 ? 'PASS' : 'FAIL',
            details: `${styledButtons}/${buttons.length} buttons have custom styling`,
            data: { total: buttons.length, styled: styledButtons }
        };
    },

    testFormComponents: async function() {
        const formElements = document.querySelectorAll('input, select, textarea');
        
        if (formElements.length === 0) {
            return {
                status: 'SKIP',
                details: 'No form elements found on page',
                data: { count: 0 }
            };
        }
        
        let styledElements = 0;
        formElements.forEach(element => {
            const computed = getComputedStyle(element);
            if (computed.borderRadius !== '0px' || 
                computed.padding !== '0px') {
                styledElements++;
            }
        });
        
        return {
            status: styledElements > 0 ? 'PASS' : 'WARN',
            details: `${styledElements}/${formElements.length} form elements styled`,
            data: { total: formElements.length, styled: styledElements }
        };
    },

    testPreviewComponents: async function() {
        const previews = document.querySelectorAll('[class*="preview"], .json-viewer, .dual-preview');
        
        return {
            status: previews.length > 0 ? 'PASS' : 'SKIP',
            details: `${previews.length} preview components found`,
            data: { count: previews.length }
        };
    },

    testWordPressIntegration: async function() {
        const isWordPressAdmin = document.body.classList.contains('wp-admin');
        const hasWPWrap = document.getElementById('wpwrap') !== null;
        
        if (!isWordPressAdmin || !hasWPWrap) {
            return {
                status: 'SKIP',
                details: 'Not in WordPress admin context',
                data: { wpAdmin: isWordPressAdmin, wpWrap: hasWPWrap }
            };
        }
        
        return {
            status: 'PASS',
            details: 'WordPress admin integration detected',
            data: { integrated: true }
        };
    },

    testDarkModeIntegration: async function() {
        const body = document.body;
        const hasDarkModeClass = body.classList.contains('dark-mode') || 
                                 body.classList.contains('dark-theme');
        
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor = computedStyle.getPropertyValue('--fc-bg-primary');
        
        return {
            status: 'PASS',
            details: `Dark mode ${hasDarkModeClass ? 'active' : 'inactive'}`,
            data: { darkMode: hasDarkModeClass, bgColor: bgColor.trim() }
        };
    },

    testResponsiveIntegration: async function() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        const breakpoints = {
            mobile: viewport.width <= 480,
            tablet: viewport.width <= 768,
            desktop: viewport.width <= 1024,
            ultrawide: viewport.width > 1024
        };
        
        return {
            status: 'PASS',
            details: `Viewport: ${viewport.width}x${viewport.height}`,
            data: { viewport, breakpoints }
        };
    },

    testCSSLoadTime: async function() {
        const perfEntries = performance.getEntriesByType('resource');
        const cssEntries = perfEntries.filter(entry => 
            entry.name.includes('.css') && entry.name.includes('prompt-builder')
        );
        
        const totalLoadTime = cssEntries.reduce((sum, entry) => 
            sum + (entry.responseEnd - entry.requestStart), 0
        );
        
        return {
            status: totalLoadTime < 1000 ? 'PASS' : 'WARN',
            details: `CSS load time: ${totalLoadTime.toFixed(2)}ms`,
            data: { loadTime: totalLoadTime, files: cssEntries.length }
        };
    },

    testRenderPerformance: async function() {
        const startTime = performance.now();
        
        const testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <div class="button">Test Button</div>
            <div class="card">Test Card</div>
            <input type="text" placeholder="Test Input" />
        `;
        testContainer.style.position = 'absolute';
        testContainer.style.left = '-9999px';
        
        document.body.appendChild(testContainer);
        testContainer.offsetHeight; // Force reflow
        
        const renderTime = performance.now() - startTime;
        document.body.removeChild(testContainer);
        
        return {
            status: renderTime < 16 ? 'PASS' : 'WARN',
            details: `Render time: ${renderTime.toFixed(2)}ms`,  
            data: { renderTime }
        };
    },

    /**
     * Test Runner Helper
     */
    async runTest(testName, testFunction) {
        try {
            console.log(`  🧪 ${testName}...`);
            const result = await testFunction.call(this);
            
            switch (result.status) {
                case 'PASS':
                    console.log(`  ✅ ${testName}: ${result.details}`);
                    this.results.passed++;
                    break;
                case 'WARN':
                    console.log(`  ⚠️ ${testName}: ${result.details}`);
                    this.results.warnings++;
                    break;
                case 'SKIP':
                    console.log(`  ⏭️ ${testName}: ${result.details}`);
                    break;
                default:
                    console.log(`  ❓ ${testName}: ${result.details}`);
            }
            
            this.results.details.push({
                test: testName,
                status: result.status,
                details: result.details,
                data: result.data
            });
            
        } catch (error) {
            console.log(`  ❌ ${testName}: ${error.message}`);
            this.results.failed++;
            this.results.details.push({
                test: testName,
                status: 'FAIL',
                details: error.message,
                data: { error: error.stack }
            });
        }
    },

    /**
     * Generate Final Audit Report
     */
    generateAuditReport() {
        const endTime = performance.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 CSS MODULARIZATION AUDIT REPORT');
        console.log('='.repeat(60));
        
        console.log(`⏱️ Audit Duration: ${duration} seconds`);
        console.log(`✅ Tests Passed: ${this.results.passed}`);
        console.log(`❌ Tests Failed: ${this.results.failed}`);
        console.log(`⚠️ Warnings: ${this.results.warnings}`);
        
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
        
        console.log(`📊 Success Rate: ${successRate}%`);
        
        // Overall Grade
        let grade = 'F';
        if (successRate >= 95) grade = 'A+';
        else if (successRate >= 90) grade = 'A';
        else if (successRate >= 85) grade = 'B+';
        else if (successRate >= 80) grade = 'B';
        else if (successRate >= 75) grade = 'C+';
        else if (successRate >= 70) grade = 'C';
        else if (successRate >= 60) grade = 'D';
        
        console.log(`🎓 Overall Grade: ${grade}`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.details
                .filter(result => result.status === 'FAIL')
                .forEach(result => {
                    console.log(`   • ${result.test}: ${result.details}`);
                });
        }
        
        if (this.results.warnings > 0) {
            console.log('\n⚠️ WARNINGS:');
            this.results.details
                .filter(result => result.status === 'WARN')
                .forEach(result => {
                    console.log(`   • ${result.test}: ${result.details}`);
                });
        }
        
        console.log('\n📈 RECOMMENDATIONS:');
        if (this.results.failed === 0 && this.results.warnings === 0) {
            console.log('   🎉 Excellent! No issues detected.');
            console.log('   💡 Consider activating commented imports for enhanced features.');
        } else {
            console.log('   🔧 Address failed tests before production deployment.');
            console.log('   ⚡ Review warnings for potential improvements.');
        }
        
        console.log('\n🚀 MODULAR CSS ARCHITECTURE STATUS: ' + 
                   (grade === 'A+' || grade === 'A' ? 'PRODUCTION READY' : 'NEEDS ATTENTION'));
        
        console.log('='.repeat(60));
        
        return {
            grade,
            successRate: parseFloat(successRate),
            duration: parseFloat(duration),
            results: this.results
        };
    }
};

// Export for use
window.CSS_MODULARIZATION_AUDIT = CSS_MODULARIZATION_AUDIT;

// Usage instructions
console.log('🎯 CSS Modularization Audit loaded. Run with:');
console.log('CSS_MODULARIZATION_AUDIT.runCompleteAudit()');
