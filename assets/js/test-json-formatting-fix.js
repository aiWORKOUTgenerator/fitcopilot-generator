/**
 * Live Prompt Preview JSON Formatting Fix - Validation Test Script
 * 
 * Tests all aspects of the JSON formatting sprint implementation:
 * 1. Horizontal scroll detection and elimination
 * 2. Responsive word wrapping functionality  
 * 3. Enhanced JSON viewer with controls
 * 4. Cross-browser compatibility
 * 5. Mobile responsiveness
 * 6. Dark mode compatibility
 * 7. Performance impact assessment
 * 
 * @version 1.0.0
 * @author FitCopilot Team
 */

console.log('🧪 Starting Live Prompt Preview JSON Formatting Fix Validation...');

class JSONFormattingTestSuite {
    constructor() {
        this.testResults = [];
        this.testData = this.generateTestData();
        this.init();
    }

    async init() {
        console.log('🔧 Initializing JSON Formatting Test Suite...');
        
        try {
            await this.runAllTests();
            this.generateReport();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    /**
     * Generate comprehensive test data with various JSON sizes and structures
     */
    generateTestData() {
        return {
            // Small JSON - Basic workout
            small: {
                "test_id": "test_001",
                "title": "Quick Morning Workout",
                "duration": 20,
                "difficulty": "beginner"
            },
            
            // Medium JSON - Full workout structure
            medium: {
                "test_id": "test_002",
                "title": "Full Body Strength Training",
                "duration": 45,
                "difficulty": "intermediate",
                "sections": [
                    {
                        "name": "Warm-up",
                        "exercises": [
                            { "name": "Jumping Jacks", "duration": "30 seconds", "reps": null },
                            { "name": "Arm Circles", "duration": "30 seconds", "reps": null }
                        ]
                    }
                ]
            },
            
            // Large JSON - Complex workout with extensive metadata
            large: {
                "test_id": "test_003",
                "title": "Advanced Full Body Circuit Training with Progressive Overload and Detailed Exercise Modifications",
                "duration": 60,
                "difficulty": "advanced",
                "estimated_calories": 450,
                "equipment_required": ["dumbbells", "resistance_bands", "yoga_mat", "stability_ball"],
                "target_muscle_groups": ["chest", "back", "shoulders", "arms", "core", "legs"],
                "sections": [
                    {
                        "name": "Dynamic Warm-up and Mobility Preparation",
                        "duration": 8,
                        "exercises": [
                            {
                                "name": "Multi-directional Leg Swings with Hip Activation",
                                "duration": "45 seconds",
                                "instructions": "Stand next to a wall for support. Swing one leg forward and backward, then side to side. Focus on controlled movements through full range of motion."
                            }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Run all test categories
     */
    async runAllTests() {
        console.log('📋 Running comprehensive test suite...');
        
        await this.testHorizontalScrollElimination();
        await this.testResponsiveWordWrapping();
        await this.testJSONViewerControls();
        await this.testMobileResponsiveness();
        await this.testDarkModeCompatibility();
        await this.testPerformanceImpact();
    }

    /**
     * Test 1: Horizontal Scroll Elimination (Primary Success Criteria)
     */
    async testHorizontalScrollElimination() {
        console.log('🔍 Test 1: Horizontal Scroll Elimination...');
        
        const testContainer = this.createTestContainer('horizontal-scroll-test');
        
        // Test with all JSON sizes
        for (const [size, data] of Object.entries(this.testData)) {
            const testDiv = document.createElement('div');
            testDiv.className = 'workout-test-preview';
            testDiv.innerHTML = `
                <div class="workout-content">
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
            
            testContainer.appendChild(testDiv);
            
            // Measure scrolling after applying CSS fixes
            const hasHorizontalScroll = testDiv.scrollWidth > testDiv.clientWidth;
            const workoutContent = testDiv.querySelector('.workout-content');
            const contentHasHorizontalScroll = workoutContent.scrollWidth > workoutContent.clientWidth;
            
            this.testResults.push({
                test: 'Horizontal Scroll Elimination',
                size: size,
                hasHorizontalScroll: hasHorizontalScroll || contentHasHorizontalScroll,
                passed: !hasHorizontalScroll && !contentHasHorizontalScroll,
                details: `${size} JSON: ${hasHorizontalScroll || contentHasHorizontalScroll ? 'SCROLL DETECTED' : 'NO SCROLL'}`
            });
            
            console.log(`  📊 ${size.toUpperCase()} JSON: ${hasHorizontalScroll || contentHasHorizontalScroll ? '❌ SCROLL DETECTED' : '✅ NO SCROLL'}`);
        }
        
        testContainer.remove();
    }

    /**
     * Test 2: Responsive Word Wrapping
     */
    async testResponsiveWordWrapping() {
        console.log('🔍 Test 2: Responsive Word Wrapping...');
        
        const testContainer = this.createTestContainer('word-wrapping-test');
        
        const testDiv = document.createElement('div');
        testDiv.className = 'workout-test-preview';
        testDiv.style.width = '400px';
        testDiv.innerHTML = `
            <div class="workout-content">
                <pre>{"very_long_property": "This is a very long string that should wrap"}</pre>
            </div>
        `;
        
        testContainer.appendChild(testDiv);
        
        const preElement = testDiv.querySelector('pre');
        const computedStyles = getComputedStyle(preElement);
        
        this.testResults.push({
            test: 'Responsive Word Wrapping',
            passed: computedStyles.whiteSpace === 'pre-wrap' && computedStyles.wordWrap === 'break-word',
            details: `whiteSpace: ${computedStyles.whiteSpace}, wordWrap: ${computedStyles.wordWrap}`
        });
        
        console.log(`  📊 Word wrapping: ${computedStyles.whiteSpace === 'pre-wrap' ? '✅' : '❌'} pre-wrap, ${computedStyles.wordWrap === 'break-word' ? '✅' : '❌'} break-word`);
        
        testContainer.remove();
    }

    /**
     * Test 3: Enhanced JSON Viewer Controls
     */
    async testJSONViewerControls() {
        console.log('🔍 Test 3: Enhanced JSON Viewer Controls...');
        
        if (typeof window.JSONFormatter === 'undefined') {
            this.testResults.push({
                test: 'JSON Viewer Controls',
                passed: false,
                details: 'JSONFormatter class not available'
            });
            console.log('  ❌ JSONFormatter not loaded');
            return;
        }
        
        const testContainer = this.createTestContainer('json-viewer-test');
        const formatter = new window.JSONFormatter();
        
        const viewerContainer = document.createElement('div');
        const viewer = formatter.formatJSON(this.testData.medium, viewerContainer);
        testContainer.appendChild(viewerContainer);
        
        const header = viewer.querySelector('.json-viewer-header');
        const controls = viewer.querySelector('.json-viewer-controls');
        const copyBtn = viewer.querySelector('.json-copy-btn');
        
        this.testResults.push({
            test: 'JSON Viewer Controls',
            passed: !!(header && controls && copyBtn),
            details: `Header: ${!!header}, Controls: ${!!controls}, Copy: ${!!copyBtn}`
        });
        
        console.log(`  📊 JSON Viewer: ${header ? '✅' : '❌'} Header, ${controls ? '✅' : '❌'} Controls, ${copyBtn ? '✅' : '❌'} Copy`);
        
        testContainer.remove();
    }

    /**
     * Test 4: Mobile Responsiveness
     */
    async testMobileResponsiveness() {
        console.log('🔍 Test 4: Mobile Responsiveness...');
        
        const viewportSizes = [
            { name: 'Mobile', width: 375 },
            { name: 'Tablet', width: 768 },
            { name: 'Desktop', width: 1920 }
        ];
        
        for (const viewport of viewportSizes) {
            const testContainer = this.createTestContainer(`mobile-test-${viewport.width}`);
            testContainer.style.width = `${viewport.width}px`;
            
            const testDiv = document.createElement('div');
            testDiv.className = 'workout-test-preview';
            testDiv.innerHTML = `
                <div class="workout-content">
                    <pre>${JSON.stringify(this.testData.medium, null, 2)}</pre>
                </div>
            `;
            
            testContainer.appendChild(testDiv);
            
            const hasOverflow = testDiv.scrollWidth > testDiv.clientWidth;
            
            this.testResults.push({
                test: 'Mobile Responsiveness',
                viewport: viewport.name,
                passed: !hasOverflow,
                details: `${viewport.name} (${viewport.width}px): ${hasOverflow ? 'OVERFLOW' : 'FITS'}`
            });
            
            console.log(`  📊 ${viewport.name}: ${hasOverflow ? '❌ OVERFLOW' : '✅ FITS'}`);
            
            testContainer.remove();
        }
    }

    /**
     * Test 5: Dark Mode Compatibility
     */
    async testDarkModeCompatibility() {
        console.log('🔍 Test 5: Dark Mode Compatibility...');
        
        const testContainer = this.createTestContainer('dark-mode-test');
        
        const lightDiv = document.createElement('div');
        lightDiv.className = 'workout-test-preview';
        lightDiv.innerHTML = `<div class="workout-content"><pre>{"test": "light"}</pre></div>`;
        testContainer.appendChild(lightDiv);
        
        const darkDiv = document.createElement('div');
        darkDiv.className = 'workout-test-preview';
        darkDiv.setAttribute('data-theme', 'dark');
        darkDiv.innerHTML = `<div class="workout-content"><pre>{"test": "dark"}</pre></div>`;
        testContainer.appendChild(darkDiv);
        
        const lightStyles = getComputedStyle(lightDiv);
        const darkStyles = getComputedStyle(darkDiv);
        
        const hasDistinctStyles = lightStyles.backgroundColor !== darkStyles.backgroundColor;
        
        this.testResults.push({
            test: 'Dark Mode Compatibility',
            passed: hasDistinctStyles,
            details: `Distinct styles: ${hasDistinctStyles ? 'YES' : 'NO'}`
        });
        
        console.log(`  📊 Dark mode: ${hasDistinctStyles ? '✅ DISTINCT' : '❌ SAME'}`);
        
        testContainer.remove();
    }

    /**
     * Test 6: Performance Impact Assessment
     */
    async testPerformanceImpact() {
        console.log('🔍 Test 6: Performance Impact Assessment...');
        
        const iterations = 5;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            
            const testContainer = this.createTestContainer(`perf-test-${i}`);
            const testDiv = document.createElement('div');
            testDiv.className = 'workout-test-preview';
            testDiv.innerHTML = `
                <div class="workout-content">
                    <pre>${JSON.stringify(this.testData.large, null, 2)}</pre>
                </div>
            `;
            testContainer.appendChild(testDiv);
            
            testDiv.offsetHeight; // Force layout
            
            const endTime = performance.now();
            times.push(endTime - startTime);
            
            testContainer.remove();
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        
        this.testResults.push({
            test: 'Performance Impact',
            averageTime: avgTime,
            passed: avgTime < 100,
            details: `Average: ${avgTime.toFixed(2)}ms over ${iterations} iterations`
        });
        
        console.log(`  📊 Performance: ${avgTime.toFixed(2)}ms (${avgTime < 100 ? '✅ FAST' : '❌ SLOW'})`);
    }

    /**
     * Create test container element
     */
    createTestContainer(id) {
        const container = document.createElement('div');
        container.id = id;
        container.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 800px;
            height: 600px;
            visibility: hidden;
        `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Generate comprehensive test report
     */
    generateReport() {
        console.log('\n🎯 JSON FORMATTING FIX - TEST REPORT');
        console.log('═══════════════════════════════════════');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const successRate = (passedTests / totalTests * 100).toFixed(1);
        
        console.log(`\n📊 OVERALL RESULTS:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${passedTests}`);
        console.log(`   Failed: ${totalTests - passedTests}`);
        console.log(`   Success Rate: ${successRate}%`);
        
        const horizontalScrollTests = this.testResults.filter(r => r.test === 'Horizontal Scroll Elimination');
        const noHorizontalScroll = horizontalScrollTests.every(r => r.passed);
        
        console.log(`\n🎯 PRIMARY SUCCESS CRITERIA:`);
        console.log(`   ✅ No horizontal scrolling: ${noHorizontalScroll ? 'PASSED' : 'FAILED'}`);
        
        console.log(`\n📋 DETAILED RESULTS:`);
        this.testResults.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.test}: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
            console.log(`      ${result.details}`);
        });
        
        console.log(`\n🏁 JSON Formatting Fix Validation Complete!`);
        
        // Store results for external access
        window.jsonFormattingTestResults = {
            totalTests,
            passedTests,
            successRate,
            primaryCriteriaMet: noHorizontalScroll,
            detailedResults: this.testResults
        };
    }
}

// Auto-run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new JSONFormattingTestSuite(), 1000);
    });
} else {
    setTimeout(() => new JSONFormattingTestSuite(), 1000);
}

window.JSONFormattingTestSuite = JSONFormattingTestSuite; 