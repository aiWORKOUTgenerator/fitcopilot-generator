/**
 * Live Prompt Preview Text Wrapping Fix - Verification Test
 * 
 * Tests the CSS fix for long text content in prompt previews
 * that was causing horizontal overflow and making containers
 * twice as wide as the laptop screen.
 * 
 * ISSUE FIXED:
 * - "WORKOUT REQUEST:" section with long paragraph
 * - "Note:" section with long paragraph
 * - Pre elements not wrapping text properly
 * 
 * SOLUTION:
 * - Added specific CSS rules for <pre> elements
 * - Applied white-space: pre-wrap !important
 * - Added word-wrap and overflow-wrap properties
 */

const PromptPreviewTextWrappingTest = {
    
    // Test 1: Verify CSS rules are loaded
    testCSSRulesLoaded() {
        console.log('🔍 Test 1: Checking CSS rules for text wrapping...');
        
        // Create a test element to check computed styles
        const testDiv = document.createElement('div');
        testDiv.className = 'prompt-preview';
        testDiv.style.position = 'absolute';
        testDiv.style.top = '-1000px';
        testDiv.innerHTML = '<pre class="prompt-content">Test content</pre>';
        document.body.appendChild(testDiv);
        
        const preElement = testDiv.querySelector('pre');
        const computedStyles = window.getComputedStyle(preElement);
        
        const results = {
            whiteSpace: computedStyles.whiteSpace,
            wordWrap: computedStyles.wordWrap,
            overflowWrap: computedStyles.overflowWrap,
            wordBreak: computedStyles.wordBreak,
            maxWidth: computedStyles.maxWidth,
            overflowX: computedStyles.overflowX
        };
        
        console.log('📊 Computed styles for pre element:', results);
        
        // Clean up
        document.body.removeChild(testDiv);
        
        // Check if styles are applied correctly
        const isFixed = results.whiteSpace === 'pre-wrap' && 
                       results.wordWrap === 'break-word' &&
                       results.overflowWrap === 'break-word';
        
        if (isFixed) {
            console.log('✅ CSS rules are properly applied');
            return true;
        } else {
            console.error('❌ CSS rules are not properly applied');
            return false;
        }
    },
    
    // Test 2: Test long text wrapping behavior
    testLongTextWrapping() {
        console.log('\n🔍 Test 2: Testing long text wrapping behavior...');
        
        // Find existing prompt preview or create one
        let promptPreview = document.querySelector('.prompt-preview');
        let isTemporary = false;
        
        if (!promptPreview) {
            console.log('📝 Creating temporary prompt preview for testing...');
            promptPreview = document.createElement('div');
            promptPreview.className = 'prompt-preview';
            promptPreview.style.width = '400px'; // Fixed width to test wrapping
            promptPreview.style.border = '1px solid red'; // Visible for testing
            promptPreview.style.marginTop = '20px';
            document.body.appendChild(promptPreview);
            isTemporary = true;
        }
        
        // Test with the exact long text causing the issue
        const longWorkoutRequest = `WORKOUT REQUEST:
Please generate a personalized workout based on the above parameters. Focus on exercises that match the user's fitness level and available equipment. Consider their current energy and stress levels when determining workout intensity. Ensure the workout duration aligns with the specified time constraint.`;
        
        const longNote = `Note: This is a live preview showing actual form data flowing through the prompt generation system. The PromptBuilder successfully captures and processes all user inputs for AI workout generation.`;
        
        const testContent = `${longWorkoutRequest}

${longNote}`;
        
        // Set the content as it would be in the actual system
        promptPreview.innerHTML = `<pre class="prompt-content">${testContent}</pre>`;
        
        // Check if content overflows
        const preElement = promptPreview.querySelector('pre');
        const containerWidth = promptPreview.offsetWidth;
        const contentWidth = preElement.scrollWidth;
        
        console.log(`📏 Container width: ${containerWidth}px`);
        console.log(`📏 Content scroll width: ${contentWidth}px`);
        
        const hasOverflow = contentWidth > containerWidth;
        
        if (!hasOverflow) {
            console.log('✅ Text wraps correctly - no horizontal overflow');
            if (isTemporary) {
                // Keep it visible for a moment, then clean up
                setTimeout(() => {
                    document.body.removeChild(promptPreview);
                }, 3000);
            }
            return true;
        } else {
            console.error('❌ Text still overflows horizontally');
            console.log('🔧 Check if CSS rules are properly loaded');
            if (isTemporary) {
                console.log('🚨 Temporary preview left visible for debugging');
            }
            return false;
        }
    },
    
    // Test 3: Test responsive behavior
    testResponsiveBehavior() {
        console.log('\n🔍 Test 3: Testing responsive behavior...');
        
        // Test at different screen widths
        const testWidths = [320, 768, 1024, 1440]; // Mobile, tablet, desktop, large
        const results = [];
        
        testWidths.forEach(width => {
            // Create test container
            const container = document.createElement('div');
            container.className = 'prompt-preview';
            container.style.width = `${width}px`;
            container.style.position = 'absolute';
            container.style.top = '-1000px';
            
            const longText = 'This is a very long line of text that should wrap properly at all screen sizes without causing horizontal overflow issues that make containers twice as wide as the screen.';
            container.innerHTML = `<pre class="prompt-content">${longText}</pre>`;
            
            document.body.appendChild(container);
            
            const preElement = container.querySelector('pre');
            const hasOverflow = preElement.scrollWidth > container.offsetWidth;
            
            results.push({
                width: width,
                hasOverflow: hasOverflow,
                containerWidth: container.offsetWidth,
                contentWidth: preElement.scrollWidth
            });
            
            document.body.removeChild(container);
        });
        
        console.log('📱 Responsive behavior test results:');
        results.forEach(result => {
            const status = result.hasOverflow ? '❌' : '✅';
            console.log(`${status} ${result.width}px: Container ${result.containerWidth}px, Content ${result.contentWidth}px`);
        });
        
        const allGood = results.every(result => !result.hasOverflow);
        
        if (allGood) {
            console.log('✅ All responsive breakpoints handle text wrapping correctly');
            return true;
        } else {
            console.error('❌ Some responsive breakpoints still have overflow issues');
            return false;
        }
    },
    
    // Test 4: Test with actual prompt preview if available
    testActualPromptPreview() {
        console.log('\n🔍 Test 4: Testing actual prompt preview if available...');
        
        const promptPreview = document.querySelector('#prompt-preview');
        if (!promptPreview) {
            console.log('ℹ️  No actual prompt preview found - test skipped');
            return true;
        }
        
        const preElements = promptPreview.querySelectorAll('pre');
        if (preElements.length === 0) {
            console.log('ℹ️  No pre elements in prompt preview - test skipped');
            return true;
        }
        
        let allGood = true;
        preElements.forEach((pre, index) => {
            const containerWidth = promptPreview.offsetWidth;
            const contentWidth = pre.scrollWidth;
            const hasOverflow = contentWidth > containerWidth;
            
            console.log(`📝 Pre element ${index + 1}: Container ${containerWidth}px, Content ${contentWidth}px`);
            
            if (hasOverflow) {
                console.error(`❌ Pre element ${index + 1} still has horizontal overflow`);
                allGood = false;
            } else {
                console.log(`✅ Pre element ${index + 1} wraps correctly`);
            }
        });
        
        return allGood;
    },
    
    // Run all tests
    runCompleteTest() {
        console.log('🚀 Starting Prompt Preview Text Wrapping Fix Verification...\n');
        
        const results = {
            cssRulesLoaded: this.testCSSRulesLoaded(),
            longTextWrapping: this.testLongTextWrapping(),
            responsiveBehavior: this.testResponsiveBehavior(),
            actualPromptPreview: this.testActualPromptPreview()
        };
        
        const passed = Object.values(results).filter(Boolean).length;
        const total = Object.keys(results).length;
        
        console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! Text wrapping fix is working correctly.');
            console.log('✅ Long workout requests and notes should now wrap properly');
            console.log('✅ No more horizontal overflow making containers too wide');
        } else {
            console.error('❌ Some tests failed. Check individual test results above.');
            console.log('🔧 CSS fix may need adjustment or additional rules');
        }
        
        return {
            success: passed === total,
            results: results,
            summary: `${passed}/${total} tests passed`
        };
    }
};

// Auto-run the test
console.log('🎯 Live Prompt Preview Text Wrapping Fix - Verification Test');
console.log('📋 This test verifies the CSS fix for horizontal overflow issues');
console.log('🔧 Fixes: WORKOUT REQUEST and Note sections causing wide containers\n');

PromptPreviewTextWrappingTest.runCompleteTest(); 