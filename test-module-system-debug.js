/**
 * Module System Debug Test
 * Run this in browser console on PromptBuilder admin page
 */

console.log('🔍 MODULE SYSTEM DEBUG TEST');
console.log('=================================');

// Check if we can access WordPress admin AJAX
if (typeof ajaxurl !== 'undefined') {
    console.log('✅ WordPress AJAX URL available:', ajaxurl);
} else {
    console.log('❌ WordPress AJAX URL not available');
}

// Test module status endpoint
console.log('\n📡 Testing Module Status...');

fetch(ajaxurl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        action: 'fitcopilot_debug_module_status',
        nonce: 'test' // We'll need to create this endpoint
    })
})
.then(response => response.json())
.then(data => {
    console.log('📊 Module Status Response:', data);
})
.catch(error => {
    console.log('❌ Module Status Error:', error);
});

// Check WordPress debug log instructions
console.log('\n📝 TO CHECK PHP LOGS:');
console.log('1. Enable WordPress debug logging in wp-config.php:');
console.log('   define("WP_DEBUG", true);');
console.log('   define("WP_DEBUG_LOG", true);');
console.log('2. Check logs at: wp-content/debug.log');
console.log('3. Look for [ModuleManager] entries');

// Check current page for module indicators
console.log('\n🔍 CHECKING CURRENT PAGE...');

// Check if ModuleManager class exists in any scripts
const scripts = document.querySelectorAll('script[src*="fitcopilot"]');
console.log(`📄 Found ${scripts.length} FitCopilot scripts:`, Array.from(scripts).map(s => s.src));

// Check for any module-related elements
const moduleElements = document.querySelectorAll('[class*="module"], [id*="module"]');
console.log(`🎯 Found ${moduleElements.length} module-related elements:`, Array.from(moduleElements).map(e => e.className || e.id));

// Check for PHP error indicators
const phpErrors = document.querySelectorAll('.notice-error, .error');
if (phpErrors.length > 0) {
    console.log('⚠️ PHP Errors detected on page:', Array.from(phpErrors).map(e => e.textContent));
} else {
    console.log('✅ No PHP errors visible on page');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Refresh this page and check browser console for new logs');
console.log('2. Check WordPress debug.log for [ModuleManager] entries');
console.log('3. If no logs appear, the ModuleManager init hook may not be firing');

console.log('\n✅ MODULE SYSTEM DEBUG TEST COMPLETE'); 