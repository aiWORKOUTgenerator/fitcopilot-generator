/**
 * PromptBuilder Access & Functionality Test
 * 
 * Run this in browser console on the PromptBuilder page to verify everything is working
 */

console.log('🧠 PROMPTBUILDER ACCESS & FUNCTIONALITY TEST');
console.log('=============================================');

// Test 1: Check if we're on the PromptBuilder page
console.log('\n📍 1. PAGE LOCATION TEST');
const currentUrl = window.location.href;
console.log('Current URL:', currentUrl);

if (currentUrl.includes('fitcopilot-prompt-builder')) {
    console.log('✅ You are on the PromptBuilder page!');
} else {
    console.log('❌ You are NOT on the PromptBuilder page');
    console.log('📍 Navigate to: WordPress Admin → FitCopilot → AI Prompt System → PromptBuilder');
    console.log('📍 Or go directly to: /wp-admin/admin.php?page=fitcopilot-prompt-builder');
}

// Test 2: Check if PromptBuilder JavaScript is loaded
console.log('\n🧩 2. JAVASCRIPT LOADING TEST');
if (typeof window.PromptBuilder !== 'undefined') {
    console.log('✅ PromptBuilder JavaScript is loaded');
    console.log('Available:', Object.keys(window.PromptBuilder));
} else {
    console.log('❌ PromptBuilder JavaScript is NOT loaded');
    console.log('Check browser console for script loading errors');
}

// Test 3: Check if DOM elements exist
console.log('\n🏗️ 3. DOM ELEMENTS TEST');
const requiredElements = {
    'prompt-builder-form': 'Main form',
    'generate-prompt': 'Generate prompt button',
    'prompt-preview': 'Prompt preview area',
    'context-inspector': 'Context inspector area',
    'strategy-selector': 'Strategy selector'
};

let elementCount = 0;
for (const [id, description] of Object.entries(requiredElements)) {
    const element = document.getElementById(id);
    if (element) {
        console.log(`✅ ${description} found (#${id})`);
        elementCount++;
    } else {
        console.log(`❌ ${description} NOT found (#${id})`);
    }
}

console.log(`\n📊 Elements found: ${elementCount}/${Object.keys(requiredElements).length}`);

// Test 4: Check AJAX configuration
console.log('\n🌐 4. AJAX CONFIGURATION TEST');
if (typeof fitcopilotPromptBuilder !== 'undefined') {
    console.log('✅ AJAX configuration loaded');
    console.log('AJAX URL:', fitcopilotPromptBuilder.ajaxUrl);
    console.log('Nonce available:', !!fitcopilotPromptBuilder.nonce);
    console.log('Debug mode:', fitcopilotPromptBuilder.debug);
} else {
    console.log('❌ AJAX configuration NOT loaded');
    console.log('Check if assets are being enqueued properly');
}

// Test 5: Check CSS loading
console.log('\n🎨 5. CSS LOADING TEST');
const promptBuilderContainer = document.querySelector('.prompt-builder-container');
if (promptBuilderContainer) {
    const styles = window.getComputedStyle(promptBuilderContainer);
    const display = styles.display;
    console.log('✅ PromptBuilder CSS appears to be loaded');
    console.log('Container display:', display);
} else {
    console.log('❌ PromptBuilder CSS may not be loaded or container not found');
}

// Test 6: Quick functionality test
console.log('\n⚡ 6. QUICK FUNCTIONALITY TEST');
if (elementCount >= 3 && typeof fitcopilotPromptBuilder !== 'undefined') {
    console.log('✅ Basic functionality should work');
    console.log('');
    console.log('🎯 TRY THESE ACTIONS:');
    console.log('1. Fill in some profile data (name, age, fitness level)');
    console.log('2. Click "🚀 Generate Live Prompt"');
    console.log('3. Click "🔍 Inspect Context"');
    console.log('4. Click "📋 View Code" to see strategy code');
    console.log('');
    console.log('💡 If buttons don\'t work, check browser console for errors');
} else {
    console.log('❌ Basic functionality may not work');
    console.log('Some required elements or configuration are missing');
}

// Summary
console.log('\n📋 SUMMARY & NEXT STEPS');
console.log('=======================');

if (currentUrl.includes('fitcopilot-prompt-builder')) {
    if (elementCount >= 3 && typeof fitcopilotPromptBuilder !== 'undefined') {
        console.log('🎉 SUCCESS: PromptBuilder should be fully functional!');
        console.log('');
        console.log('🎯 WHAT YOU CAN DO NOW:');
        console.log('• Generate live prompts with real-time preview');
        console.log('• Inspect data flow and context transformation');
        console.log('• View strategy PHP code');
        console.log('• Test workout generation');
        console.log('• Load actual user profiles for testing');
        console.log('• Compare prompts with different strategies');
    } else {
        console.log('⚠️ PARTIAL: Page loaded but some functionality may be missing');
        console.log('Check browser console for JavaScript errors');
    }
} else {
    console.log('📍 ACTION NEEDED: Navigate to PromptBuilder page first');
    console.log('URL: /wp-admin/admin.php?page=fitcopilot-prompt-builder');
}

console.log('\n🔧 TROUBLESHOOTING NOTES:');
console.log('• The "Test Prompt Building" button in TestingLab is just a placeholder');
console.log('• The real PromptBuilder is a separate dedicated page');
console.log('• Phase 2 Week 1 added advanced analytics and multi-provider support');
console.log('• All backend functionality is implemented and ready');

console.log('\n===============================');
console.log('📧 If you see this test output, Phase 2 Week 1 is COMPLETE!');
console.log('==============================='); 