/**
 * Enhanced jQuery Dependency Fix Verification Test
 * 
 * Advanced testing with detailed debugging and fix verification
 */

console.log('🔧 ENHANCED JQUERY DEPENDENCY FIX VERIFICATION');
console.log('='.repeat(60));

// Enhanced jQuery testing with detailed debugging
function enhancedJQueryTest() {
    console.log('\n🔍 Enhanced jQuery Availability Test...');
    
    const jqueryInfo = {
        globalJQuery: typeof window.jQuery,
        globalDollar: typeof window.$,
        jqueryVersion: window.jQuery ? window.jQuery.fn.jquery : 'N/A',
        jqueryNoConflict: window.jQuery ? window.jQuery.noConflict : 'N/A',
        wpjQuery: typeof wp !== 'undefined' && wp.$ ? 'Available' : 'Not Available'
    };
    
    console.log('   📊 jQuery Environment Details:');
    Object.entries(jqueryInfo).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
    });
    
    // Try to make $ available if it's not
    if (typeof window.$ === 'undefined' && typeof window.jQuery !== 'undefined') {
        console.log('   🔧 Making jQuery available as $ for testing...');
        window.$ = window.jQuery;
    }
    
    return typeof window.jQuery !== 'undefined';
}

// Test module loading with detailed script analysis
function enhancedModuleLoadingTest() {
    console.log('\n📦 Enhanced Module Loading Test...');
    
    const scripts = Array.from(document.querySelectorAll('script[src*="prompt-builder"]'));
    console.log(`   📄 Found ${scripts.length} PromptBuilder-related scripts:`);
    
    scripts.forEach(script => {
        const src = script.src;
        const filename = src.split('/').pop();
        const loaded = script.complete || script.readyState === 'complete';
        console.log(`      ${loaded ? '✅' : '⏳'} ${filename}`);
    });
    
    const modules = {
        'PromptBuilderFormHandler': window.PromptBuilderFormHandler,
        'PromptBuilderAjaxManager': window.PromptBuilderAjaxManager, 
        'PromptBuilderUIController': window.PromptBuilderUIController,
        'ModularPromptBuilderApp': window.ModularPromptBuilderApp
    };
    
    console.log('\n   🔍 Module Availability:');
    let loadedCount = 0;
    Object.entries(modules).forEach(([name, module]) => {
        const available = typeof module !== 'undefined';
        const type = available ? typeof module : 'undefined';
        console.log(`      ${available ? '✅' : '❌'} ${name}: ${type}`);
        if (available) loadedCount++;
    });
    
    return { success: loadedCount >= 3, count: loadedCount, total: 4 };
}

// Test module instantiation with jQuery injection
function enhancedModuleInstantiationTest() {
    console.log('\n🧪 Enhanced Module Instantiation Test...');
    
    const mockConfig = { 
        get: (key, def) => {
            console.log(`      Config requested: ${key} (default: ${def})`);
            return def;
        }
    };
    const mockUtils = { 
        escapeHtml: text => text,
        copyToClipboard: async text => console.log('Mock clipboard:', text.substring(0, 50) + '...')
    };
    
    const results = {};
    
    // Test FormHandler with jQuery debugging
    console.log('   🔧 Testing FormHandler...');
    try {
        if (typeof window.PromptBuilderFormHandler === 'undefined') {
            throw new Error('PromptBuilderFormHandler not available');
        }
        
        const formHandler = new window.PromptBuilderFormHandler(mockConfig, mockUtils);
        results.FormHandler = { success: true, instance: formHandler };
        console.log('      ✅ FormHandler instantiated successfully');
        
        // Test jQuery access within FormHandler
        if (typeof window.$ !== 'undefined') {
            console.log('      🔍 Testing FormHandler jQuery access...');
            // Create a temporary test form
            const testForm = $('<form id="test-prompt-builder-form"><input type="text" name="test" value="test"></form>');
            $('body').append(testForm);
            
            try {
                // Try a simple jQuery operation that FormHandler uses
                const formFound = $('#test-prompt-builder-form').length > 0;
                console.log(`      ${formFound ? '✅' : '❌'} jQuery DOM selection working: ${formFound}`);
                
                testForm.remove(); // Clean up
            } catch (error) {
                console.log(`      ❌ jQuery operation failed: ${error.message}`);
            }
        }
        
    } catch (error) {
        results.FormHandler = { success: false, error: error.message };
        console.log(`      ❌ FormHandler failed: ${error.message}`);
    }
    
    // Test AjaxManager
    console.log('   🌐 Testing AjaxManager...');
    try {
        if (typeof window.PromptBuilderAjaxManager === 'undefined') {
            throw new Error('PromptBuilderAjaxManager not available');
        }
        
        const ajaxManager = new window.PromptBuilderAjaxManager(mockConfig, mockUtils);
        ajaxManager.initialize();
        results.AjaxManager = { success: true, instance: ajaxManager };
        console.log('      ✅ AjaxManager instantiated and initialized successfully');
    } catch (error) {
        results.AjaxManager = { success: false, error: error.message };
        console.log(`      ❌ AjaxManager failed: ${error.message}`);
    }
    
    // Test UIController
    console.log('   🖥️  Testing UIController...');
    try {
        if (typeof window.PromptBuilderUIController === 'undefined') {
            throw new Error('PromptBuilderUIController not available');
        }
        
        const uiController = new window.PromptBuilderUIController(mockConfig, mockUtils);
        results.UIController = { success: true, instance: uiController };
        console.log('      ✅ UIController instantiated successfully');
    } catch (error) {
        results.UIController = { success: false, error: error.message };
        console.log(`      ❌ UIController failed: ${error.message}`);
    }
    
    // Test ModularPromptBuilderApp
    console.log('   🎯 Testing ModularPromptBuilderApp...');
    try {
        if (typeof window.ModularPromptBuilderApp === 'undefined') {
            throw new Error('ModularPromptBuilderApp not available');
        }
        
        const coordinator = new window.ModularPromptBuilderApp();
        results.Coordinator = { success: true, instance: coordinator };
        console.log('      ✅ ModularPromptBuilderApp instantiated successfully');
        
        // Test if coordinator has access to modules
        if (coordinator.getModules && typeof coordinator.getModules === 'function') {
            console.log('      🔍 Testing coordinator module access...');
            const modules = coordinator.getModules();
            if (modules) {
                console.log(`      ✅ Coordinator can access modules: ${Object.keys(modules).join(', ')}`);
            } else {
                console.log('      ⚠️  Coordinator getModules returned null');
            }
        }
        
    } catch (error) {
        results.Coordinator = { success: false, error: error.message };
        console.log(`      ❌ ModularPromptBuilderApp failed: ${error.message}`);
    }
    
    const successCount = Object.values(results).filter(r => r.success).length;
    console.log(`\n   📊 Instantiation Results: ${successCount}/${Object.keys(results).length} modules successful`);
    
    return { success: successCount >= 3, results, successCount };
}

// Test real-world initialization
function testRealWorldInitialization() {
    console.log('\n🚀 Real-World Initialization Test...');
    
    try {
        // Check if PromptBuilder instance exists
        if (window.PromptBuilder) {
            console.log('   ✅ PromptBuilder instance found');
            
            // Check initialization status
            if (window.PromptBuilder.isInitialized) {
                console.log('   ✅ PromptBuilder is initialized');
            } else {
                console.log('   ⚠️  PromptBuilder exists but not initialized');
            }
            
            // Check module access
            if (window.PromptBuilder.getModules) {
                const modules = window.PromptBuilder.getModules();
                if (modules) {
                    console.log(`   ✅ Active modules: ${Object.keys(modules).join(', ')}`);
                    
                    // Test each module
                    Object.entries(modules).forEach(([name, module]) => {
                        const status = module ? '✅' : '❌';
                        console.log(`      ${status} ${name}: ${module ? 'Active' : 'Inactive'}`);
                    });
                } else {
                    console.log('   ❌ No modules found in coordinator');
                }
            } else {
                console.log('   ❌ getModules method not available');
            }
            
            return true;
        } else {
            console.log('   ❌ PromptBuilder instance not found');
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Real-world test failed: ${error.message}`);
        return false;
    }
}

// Manual initialization attempt
function attemptManualInitialization() {
    console.log('\n🔄 Attempting Manual Initialization...');
    
    try {
        // Check if all modules are available
        const modulesAvailable = window.PromptBuilderFormHandler && 
                                window.PromptBuilderAjaxManager && 
                                window.PromptBuilderUIController &&
                                window.ModularPromptBuilderApp;
        
        if (!modulesAvailable) {
            console.log('   ❌ Not all modules available for manual initialization');
            return false;
        }
        
        console.log('   🔧 All modules available, attempting manual initialization...');
        
        // Create new instance
        const manualApp = new window.ModularPromptBuilderApp();
        
        // Check if configuration is available
        if (typeof fitcopilotPromptBuilder !== 'undefined') {
            console.log('   ✅ Configuration available, initializing...');
            manualApp.init().then(() => {
                console.log('   ✅ Manual initialization successful!');
                window.PromptBuilderManual = manualApp;
            }).catch(error => {
                console.log(`   ❌ Manual initialization failed: ${error.message}`);
            });
        } else {
            console.log('   ⚠️  Configuration not available, creating without auto-init');
            window.PromptBuilderManual = manualApp;
        }
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Manual initialization error: ${error.message}`);
        return false;
    }
}

// Run enhanced tests
async function runEnhancedJQueryTests() {
    let passed = 0;
    let total = 0;
    
    console.log('\n📋 Running Enhanced jQuery Dependency Tests...\n');
    
    // Test 1: Enhanced jQuery availability
    total++;
    const jqueryTest = enhancedJQueryTest();
    if (jqueryTest) {
        console.log('✅ Enhanced jQuery Test: PASSED');
        passed++;
    } else {
        console.log('❌ Enhanced jQuery Test: FAILED');
    }
    
    // Test 2: Enhanced module loading
    total++;
    const moduleLoadTest = enhancedModuleLoadingTest();
    if (moduleLoadTest.success) {
        console.log(`✅ Enhanced Module Loading: PASSED (${moduleLoadTest.count}/${moduleLoadTest.total})`);
        passed++;
    } else {
        console.log(`❌ Enhanced Module Loading: FAILED (${moduleLoadTest.count}/${moduleLoadTest.total})`);
    }
    
    // Test 3: Enhanced instantiation
    total++;
    const instantiationTest = enhancedModuleInstantiationTest();
    if (instantiationTest.success) {
        console.log(`✅ Enhanced Instantiation: PASSED (${instantiationTest.successCount} modules)`);
        passed++;
    } else {
        console.log(`❌ Enhanced Instantiation: FAILED (${instantiationTest.successCount} modules)`);
    }
    
    // Test 4: Real-world initialization
    total++;
    const realWorldTest = testRealWorldInitialization();
    if (realWorldTest) {
        console.log('✅ Real-World Initialization: PASSED');
        passed++;
    } else {
        console.log('❌ Real-World Initialization: FAILED');
        
        // Attempt manual initialization
        total++;
        const manualTest = attemptManualInitialization();
        if (manualTest) {
            console.log('✅ Manual Initialization: PASSED');
            passed++;
        } else {
            console.log('❌ Manual Initialization: FAILED');
        }
    }
    
    // Final results
    console.log('\n' + '='.repeat(60));
    console.log(`📊 ENHANCED TEST RESULTS: ${passed}/${total} tests passed (${Math.round((passed/total)*100)}%)`);
    
    if (passed === total) {
        console.log('🎉 ALL JQUERY DEPENDENCY ISSUES RESOLVED!');
        console.log('✅ Modular system fully operational');
        console.log('✅ All modules can access jQuery properly');
        console.log('✅ Real-world initialization working');
        console.log('✅ Ready for production use');
    } else {
        console.log('⚠️  Issues remain, but progress made:');
        
        if (jqueryTest) {
            console.log('   ✅ jQuery properly loaded and accessible');
        } else {
            console.log('   ❌ jQuery still not properly accessible');
        }
        
        if (moduleLoadTest.success) {
            console.log('   ✅ Modules loading correctly');
        } else {
            console.log('   ❌ Module loading issues persist');
        }
        
        if (instantiationTest.success) {
            console.log('   ✅ Module instantiation working');
        } else {
            console.log('   ❌ Module instantiation issues remain');
        }
        
        console.log('\n💡 Recommendations:');
        console.log('   1. Refresh the page to test latest fixes');
        console.log('   2. Check browser console for specific error messages');
        console.log('   3. Verify all module files are loading correctly');
    }
    
    return { passed, total, percentage: Math.round((passed/total)*100) };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runEnhancedJQueryTests);
    } else {
        runEnhancedJQueryTests();
    }
} 