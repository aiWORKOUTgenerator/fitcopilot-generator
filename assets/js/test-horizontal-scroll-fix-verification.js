/**
 * Horizontal Scroll Fix Verification Test Suite
 * 
 * This test specifically validates that the word-break: break-all fix
 * eliminates horizontal scrolling for long JSON strings in the Live Prompt Preview
 */

class HorizontalScrollFixTest {
    constructor() {
        this.testResults = [];
        this.init();
    }

    init() {
        console.log('🔧 Initializing Horizontal Scroll Fix Verification...');
        this.runAllTests();
    }

    async runAllTests() {
        console.log('📋 Running horizontal scroll fix verification tests...');
        
        try {
            // Test 1: Create test container with exact same structure
            await this.testContainerCreation();
            
            // Test 2: Test with the actual long string that causes the issue
            await this.testLongJsonString();
            
            // Test 3: Test with multiple long strings
            await this.testMultipleLongStrings();
            
            // Test 4: Test responsive behavior
            await this.testResponsiveBehavior();
            
            // Test 5: Verify no horizontal scroll at different viewport sizes
            await this.testViewportSizes();
            
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    async testContainerCreation() {
        console.log('🔍 Test 1: Container Creation...');
        
        // Create exact replica of the workout test preview structure
        const testContainer = document.createElement('div');
        testContainer.id = 'horizontal-scroll-test-container';
        testContainer.className = 'workout-test-preview';
        testContainer.style.width = '400px'; // Simulate narrow container
        testContainer.style.border = '1px solid red';
        testContainer.style.margin = '20px';
        
        const workoutContent = document.createElement('div');
        workoutContent.className = 'workout-content';
        
        const preElement = document.createElement('pre');
        
        // The exact long string that causes horizontal scrolling
        const problematicJson = {
            "WORKOUT REQUEST": "Please generate a personalized workout based on the above parameters. Focus on exercises that match the user's fitness level and available equipment. Consider their current energy and stress levels when determining workout intensity. Ensure the workout duration aligns with the specified time constraint."
        };
        
        preElement.textContent = JSON.stringify(problematicJson, null, 2);
        
        workoutContent.appendChild(preElement);
        testContainer.appendChild(workoutContent);
        document.body.appendChild(testContainer);
        
        // Measure if horizontal scroll is present
        const hasHorizontalScroll = preElement.scrollWidth > preElement.clientWidth;
        
        this.addTestResult('Container Creation', !hasHorizontalScroll, 
            hasHorizontalScroll ? 'Horizontal scroll detected' : 'No horizontal scroll');
        
        // Keep container for visual inspection
        const label = document.createElement('div');
        label.textContent = 'Test 1: Container with Long JSON String';
        label.style.fontWeight = 'bold';
        label.style.marginTop = '10px';
        testContainer.insertBefore(label, testContainer.firstChild);
    }

    async testLongJsonString() {
        console.log('🔍 Test 2: Long JSON String...');
        
        // Create test with the actual PromptBuilder data structure
        const testContainer = document.createElement('div');
        testContainer.className = 'workout-test-preview';
        testContainer.style.width = '350px'; // Even narrower
        testContainer.style.border = '1px solid blue';
        testContainer.style.margin = '20px';
        
        const workoutContent = document.createElement('div');
        workoutContent.className = 'workout-content';
        
        const preElement = document.createElement('pre');
        
        // Simulate actual PromptBuilder response data
        const actualData = {
            "test_id": "test-123",
            "prompt": "ENHANCED WORKOUT GENERATION REQUEST\n\nUSER PROFILE:\n- Duration: 30 minutes\n- Difficulty: moderate\n- Goals:\n- Equipment:\n- Stress Level: 3/5\n- Energy Level: 3/5\n- Sleep Quality: 3/5\n- Location: home\n\nSESSION PARAMETERS:\n- Today's Focus:\n- Intensity Preference: Based on moderate fitness level\n- Current State: Energy 3/5, Stress 3/5\n- Recovery Status: Sleep quality 3/5\n\nWORKOUT REQUEST:\nPlease generate a personalized workout based on the above parameters. Focus on exercises that match the user's fitness level and available equipment. Consider their current energy and stress levels when determining workout intensity. Ensure the workout duration aligns with the specified time constraint.\n\nCONTEXT INSTRUCTIONS:\n- Adapt exercise selection to available equipment\n- Scale intensity based on current energy and stress levels\n- Include proper warm-up and cool-down phases\n- Provide exercise modifications if restrictions are present\n- Format output as structured workout plan with clear exercise descriptions",
            "timestamp": new Date().toISOString(),
            "processing_time": 1500
        };
        
        preElement.textContent = JSON.stringify(actualData, null, 2);
        
        workoutContent.appendChild(preElement);
        testContainer.appendChild(workoutContent);
        document.body.appendChild(testContainer);
        
        // Measure horizontal scroll
        const hasHorizontalScroll = preElement.scrollWidth > preElement.clientWidth;
        
        this.addTestResult('Long JSON String', !hasHorizontalScroll, 
            hasHorizontalScroll ? `Scroll width: ${preElement.scrollWidth}px > Client width: ${preElement.clientWidth}px` : 'Fits within container');
        
        const label = document.createElement('div');
        label.textContent = 'Test 2: Actual PromptBuilder Data Structure';
        label.style.fontWeight = 'bold';
        label.style.marginTop = '10px';
        testContainer.insertBefore(label, testContainer.firstChild);
    }

    async testMultipleLongStrings() {
        console.log('🔍 Test 3: Multiple Long Strings...');
        
        const testContainer = document.createElement('div');
        testContainer.className = 'workout-test-preview';
        testContainer.style.width = '300px'; // Very narrow
        testContainer.style.border = '1px solid green';
        testContainer.style.margin = '20px';
        
        const workoutContent = document.createElement('div');
        workoutContent.className = 'workout-content';
        
        const preElement = document.createElement('pre');
        
        // Multiple long strings that would cause horizontal scrolling
        const multiStringData = {
            "WORKOUT_REQUEST_SECTION_1": "Please generate a personalized workout based on the above parameters. Focus on exercises that match the user's fitness level and available equipment.",
            "WORKOUT_REQUEST_SECTION_2": "Consider their current energy and stress levels when determining workout intensity. Ensure the workout duration aligns with the specified time constraint.",
            "CONTEXT_INSTRUCTIONS_SECTION": "Adapt exercise selection to available equipment. Scale intensity based on current energy and stress levels. Include proper warm-up and cool-down phases.",
            "ADDITIONAL_REQUIREMENTS": "Provide exercise modifications if restrictions are present. Format output as structured workout plan with clear exercise descriptions and timing information."
        };
        
        preElement.textContent = JSON.stringify(multiStringData, null, 2);
        
        workoutContent.appendChild(preElement);
        testContainer.appendChild(workoutContent);
        document.body.appendChild(testContainer);
        
        const hasHorizontalScroll = preElement.scrollWidth > preElement.clientWidth;
        
        this.addTestResult('Multiple Long Strings', !hasHorizontalScroll, 
            hasHorizontalScroll ? 'Multiple strings cause overflow' : 'All strings wrap properly');
        
        const label = document.createElement('div');
        label.textContent = 'Test 3: Multiple Long JSON Strings';
        label.style.fontWeight = 'bold';
        label.style.marginTop = '10px';
        testContainer.insertBefore(label, testContainer.firstChild);
    }

    async testResponsiveBehavior() {
        console.log('🔍 Test 4: Responsive Behavior...');
        
        // Test at different container widths
        const widths = [250, 300, 400, 500];
        let allResponsive = true;
        
        widths.forEach((width, index) => {
            const testContainer = document.createElement('div');
            testContainer.className = 'workout-test-preview';
            testContainer.style.width = `${width}px`;
            testContainer.style.border = '1px solid orange';
            testContainer.style.margin = '10px';
            testContainer.style.display = 'inline-block';
            
            const workoutContent = document.createElement('div');
            workoutContent.className = 'workout-content';
            
            const preElement = document.createElement('pre');
            const testData = {
                "RESPONSIVE_TEST": `This is a responsive test at ${width}px width. The text should wrap properly without causing horizontal scrolling regardless of container width.`
            };
            
            preElement.textContent = JSON.stringify(testData, null, 2);
            
            workoutContent.appendChild(preElement);
            testContainer.appendChild(workoutContent);
            
            const label = document.createElement('div');
            label.textContent = `${width}px width`;
            label.style.fontSize = '12px';
            label.style.fontWeight = 'bold';
            testContainer.insertBefore(label, testContainer.firstChild);
            
            document.body.appendChild(testContainer);
            
            // Check for horizontal scroll
            if (preElement.scrollWidth > preElement.clientWidth) {
                allResponsive = false;
            }
        });
        
        this.addTestResult('Responsive Behavior', allResponsive, 
            allResponsive ? 'All widths work correctly' : 'Some widths have horizontal scroll');
    }

    async testViewportSizes() {
        console.log('🔍 Test 5: Viewport Sizes...');
        
        // Simulate different viewport sizes by changing container width
        const viewportTests = [
            { name: 'Mobile', width: '320px' },
            { name: 'Tablet', width: '768px' },
            { name: 'Desktop', width: '1200px' }
        ];
        
        let allViewportsPass = true;
        
        viewportTests.forEach(viewport => {
            const testContainer = document.createElement('div');
            testContainer.className = 'workout-test-preview';
            testContainer.style.width = viewport.width;
            testContainer.style.border = '1px solid purple';
            testContainer.style.margin = '10px';
            
            const workoutContent = document.createElement('div');
            workoutContent.className = 'workout-content';
            
            const preElement = document.createElement('pre');
            const testData = {
                "VIEWPORT_TEST": `Testing ${viewport.name} viewport at ${viewport.width}. This long string should wrap properly without horizontal scrolling on any device size.`,
                "ADDITIONAL_CONTENT": "Additional content to test wrapping behavior with multiple JSON properties and long string values that might cause overflow issues."
            };
            
            preElement.textContent = JSON.stringify(testData, null, 2);
            
            workoutContent.appendChild(preElement);
            testContainer.appendChild(workoutContent);
            
            const label = document.createElement('div');
            label.textContent = `${viewport.name} (${viewport.width})`;
            label.style.fontWeight = 'bold';
            label.style.marginBottom = '5px';
            testContainer.insertBefore(label, testContainer.firstChild);
            
            document.body.appendChild(testContainer);
            
            if (preElement.scrollWidth > preElement.clientWidth) {
                allViewportsPass = false;
            }
        });
        
        this.addTestResult('Viewport Sizes', allViewportsPass, 
            allViewportsPass ? 'All viewport sizes work' : 'Some viewport sizes have issues');
    }

    addTestResult(testName, passed, details) {
        this.testResults.push({
            test: testName,
            passed: passed,
            details: details
        });
        
        console.log(`   ${passed ? '✅' : '❌'} ${testName}: ${details}`);
    }

    displayResults() {
        console.log('\n🎯 HORIZONTAL SCROLL FIX VERIFICATION RESULTS');
        console.log('═══════════════════════════════════════════════');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`\n📊 OVERALL RESULTS:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${passedTests}`);
        console.log(`   Failed: ${totalTests - passedTests}`);
        console.log(`   Success Rate: ${successRate}%`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 HORIZONTAL SCROLLING ISSUE COMPLETELY RESOLVED!');
            console.log('✅ The word-break: break-all fix successfully eliminates horizontal scrolling');
        } else {
            console.log('\n⚠️ Some tests failed - horizontal scrolling may still be present');
        }
        
        console.log('\n📋 DETAILED RESULTS:');
        this.testResults.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.test}: ${result.passed ? '✅' : '❌'} PASSED`);
            console.log(`      ${result.details}`);
        });
        
        console.log('\n🔍 Visual inspection containers have been added to the page for manual verification.');
        console.log('🏁 Horizontal Scroll Fix Verification Complete!');
    }
}

// Auto-run the test when the script is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HorizontalScrollFixTest();
    });
} else {
    new HorizontalScrollFixTest();
} 