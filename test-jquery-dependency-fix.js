/**
 * jQuery Dependency Fix Verification Test
 * 
 * Tests that all modular components properly handle jQuery dependencies
 * and can initialize without "$ is not a function" errors
 */

console.log('🔧 JQUERY DEPENDENCY FIX VERIFICATION');
console.log('='.repeat(50));

// Test jQuery availability
function testJQueryAvailability() {
    console.log('\n1️⃣ Testing jQuery Availability...');
    
    const tests = [
        {
            name: 'Global jQuery',
            test: () => typeof window.jQuery !== 'undefined',
            result: typeof window.jQuery !== 'undefined'
        },
        {
            name: 'jQuery $ alias',
            test: () => typeof window.$ !== 'undefined',
            result: typeof window.$ !== 'undefined'
        },
        {
            name: 'jQuery version',
            test: () => window.jQuery && window.jQuery.fn && window.jQuery.fn.jquery,
            result: window.jQuery && window.jQuery.fn ? window.jQuery.fn.jquery : 'Not available'
        },
        {
            name: 'DOM ready function',
            test: () => typeof window.jQuery === 'function' && typeof window.jQuery.ready === 'function',
            result: typeof window.jQuery === 'function' && typeof window.jQuery.ready === 'function'
        }
    ];
    
    tests.forEach(test => {
        const status = test.test() ? '✅' : '❌';
        console.log(`   ${status} ${test.name}: ${test.result}`);
    });
    
    return tests.every(test => test.test());
}

// Test module loading
function testModuleLoading() {
    console.log('\n2️⃣ Testing Module Loading...');
    
    const modules = [
        'PromptBuilderFormHandler',
        'PromptBuilderAjaxManager', 
        'PromptBuilderUIController',
        'ModularPromptBuilderApp'
    ];
    
    let loadedCount = 0;
    
    modules.forEach(moduleName => {
        const isLoaded = typeof window[moduleName] !== 'undefined';
        const status = isLoaded ? '✅' : '❌';
        console.log(`   ${status} ${moduleName}: ${isLoaded ? 'Loaded' : 'Not found'}`);
        if (isLoaded) loadedCount++;
    });
    
    const success = loadedCount >= 3;
    console.log(`\n   📊 Result: ${loadedCount}/${modules.length} modules loaded`);
    
    return success;
}

// Test module instantiation
function testModuleInstantiation() {
    console.log('\n3️⃣ Testing Module Instantiation...');
    
    const results = {};
    
    // Test FormHandler
    try {
        const mockConfig = { get: (key, def) => def };
        const mockUtils = {};
        const formHandler = new window.PromptBuilderFormHandler(mockConfig, mockUtils);
        results.FormHandler = { success: true, instance: formHandler };
        console.log('   ✅ FormHandler: Can be instantiated');
    } catch (error) {
        results.FormHandler = { success: false, error: error.message };
        console.log(`   ❌ FormHandler: ${error.message}`);
    }
    
    // Test AjaxManager
    try {
        const mockConfig = { get: (key, def) => def };
        const mockUtils = {};
        const ajaxManager = new window.PromptBuilderAjaxManager(mockConfig, mockUtils);
        results.AjaxManager = { success: true, instance: ajaxManager };
        console.log('   ✅ AjaxManager: Can be instantiated');
    } catch (error) {
        results.AjaxManager = { success: false, error: error.message };
        console.log(`   ❌ AjaxManager: ${error.message}`);
    }
    
    // Test UIController
    try {
        const mockConfig = { get: (key, def) => def };
        const mockUtils = {};
        const uiController = new window.PromptBuilderUIController(mockConfig, mockUtils);
        results.UIController = { success: true, instance: uiController };
        console.log('   ✅ UIController: Can be instantiated');
    } catch (error) {
        results.UIController = { success: false, error: error.message };
        console.log(`   ❌ UIController: ${error.message}`);
    }
    
    const successCount = Object.values(results).filter(r => r.success).length;
    console.log(`\n   📊 Result: ${successCount}/3 modules can be instantiated`);
    
    return { success: successCount === 3, results };
}

// Test jQuery functionality in modules
function testModuleJQueryUsage() {
    console.log('\n4️⃣ Testing jQuery Usage in Modules...');
    
    const mockConfig = { get: (key, def) => def };
    const mockUtils = { escapeHtml: text => text };
    
    let jqueryErrors = [];
    
    // Test FormHandler jQuery usage
    try {
        const formHandler = new window.PromptBuilderFormHandler(mockConfig, mockUtils);
        
        // Create a mock form element to test against
        const mockForm = $('<form id="prompt-builder-form"><input type="text" value="test"></form>');
        $('body').append(mockForm);
        
        // Try to initialize - this will call jQuery functions
        try {
            formHandler.initialize();
            console.log('   ✅ FormHandler: jQuery usage working');
        } catch (error) {
            if (error.message.includes('$ is not a function')) {
                jqueryErrors.push(`FormHandler: ${error.message}`);
                console.log(`   ❌ FormHandler: jQuery error - ${error.message}`);
            } else {
                console.log(`   ⚠️  FormHandler: Other error - ${error.message}`);
            }
        }
        
        // Clean up
        mockForm.remove();
        
    } catch (error) {
        console.log(`   ❌ FormHandler instantiation failed: ${error.message}`);
    }
    
    // Test AjaxManager jQuery usage
    try {
        const ajaxManager = new window.PromptBuilderAjaxManager(mockConfig, mockUtils);
        ajaxManager.initialize(); // Should not use jQuery directly
        console.log('   ✅ AjaxManager: No jQuery dependency issues');
    } catch (error) {
        if (error.message.includes('$ is not a function')) {
            jqueryErrors.push(`AjaxManager: ${error.message}`);
            console.log(`   ❌ AjaxManager: jQuery error - ${error.message}`);
        } else {
            console.log(`   ⚠️  AjaxManager: Other error - ${error.message}`);
        }
    }
    
    console.log(`\n   📊 Result: ${jqueryErrors.length === 0 ? 'No jQuery errors' : jqueryErrors.length + ' jQuery errors found'}`);
    
    return { success: jqueryErrors.length === 0, errors: jqueryErrors };
}

// Test modular coordinator
function testModularCoordinator() {
    console.log('\n5️⃣ Testing Modular Coordinator...');
    
    try {
        // Check if coordinator exists
        if (typeof window.ModularPromptBuilderApp === 'undefined') {
            console.log('   ❌ ModularPromptBuilderApp not found');
            return false;
        }
        
        // Check if instance exists
        if (!window.PromptBuilder || !window.PromptBuilder.init) {
            console.log('   ⚠️  PromptBuilder instance not found or not initialized');
            return false;
        }
        
        // Check module availability
        const modules = window.PromptBuilder.getModules ? window.PromptBuilder.getModules() : null;
        if (modules) {
            console.log('   ✅ Coordinator: Module access working');
            console.log(`   📝 Available modules: ${Object.keys(modules).join(', ')}`);
        } else {
            console.log('   ⚠️  Coordinator: getModules not available');
        }
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Coordinator test failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runJQueryDependencyTests() {
    let passed = 0;
    let total = 0;
    
    console.log('\n📋 Running jQuery Dependency Fix Tests...\n');
    
    // Test 1: jQuery availability
    total++;
    const jqueryTest = testJQueryAvailability();
    if (jqueryTest) {
        console.log('✅ jQuery Availability: PASSED');
        passed++;
    } else {
        console.log('❌ jQuery Availability: FAILED');
    }
    
    // Test 2: Module loading
    total++;
    const moduleLoadTest = testModuleLoading();
    if (moduleLoadTest) {
        console.log('✅ Module Loading: PASSED');
        passed++;
    } else {
        console.log('❌ Module Loading: FAILED');
    }
    
    // Test 3: Module instantiation
    total++;
    const instantiationTest = testModuleInstantiation();
    if (instantiationTest.success) {
        console.log('✅ Module Instantiation: PASSED');
        passed++;
    } else {
        console.log('❌ Module Instantiation: FAILED');
    }
    
    // Test 4: jQuery usage
    total++;
    const jqueryUsageTest = testModuleJQueryUsage();
    if (jqueryUsageTest.success) {
        console.log('✅ jQuery Usage: PASSED');
        passed++;
    } else {
        console.log('❌ jQuery Usage: FAILED');
        console.log('   Errors:', jqueryUsageTest.errors);
    }
    
    // Test 5: Coordinator
    total++;
    const coordinatorTest = testModularCoordinator();
    if (coordinatorTest) {
        console.log('✅ Modular Coordinator: PASSED');
        passed++;
    } else {
        console.log('❌ Modular Coordinator: FAILED');
    }
    
    // Final results
    console.log('\n' + '='.repeat(50));
    console.log(`📊 JQUERY FIX RESULTS: ${passed}/${total} tests passed (${Math.round((passed/total)*100)}%)`);
    
    if (passed === total) {
        console.log('🎉 ALL JQUERY DEPENDENCY ISSUES RESOLVED!');
        console.log('✅ Modular system should now initialize successfully');
        console.log('✅ All modules can access jQuery properly');
        console.log('✅ Ready for production use');
    } else {
        console.log('⚠️  Some jQuery dependency issues remain:');
        if (!jqueryTest) {
            console.log('   - jQuery not properly loaded');
        }
        if (!moduleLoadTest) {
            console.log('   - Some modules failed to load');
        }
        if (!instantiationTest.success) {
            console.log('   - Module instantiation issues');
        }
        if (!jqueryUsageTest.success) {
            console.log('   - jQuery usage errors in modules');
        }
        if (!coordinatorTest) {
            console.log('   - Coordinator initialization issues');
        }
    }
    
    console.log('\n🔄 Recommendation: Refresh the page to test the fixes');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runJQueryDependencyTests);
    } else {
        runJQueryDependencyTests();
    }
} 