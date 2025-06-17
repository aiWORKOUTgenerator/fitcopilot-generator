// Final nonce verification test
// Run this in the browser console on the Testing Lab page

console.log("=== Final Nonce Verification ===");

// Check all available nonce sources
console.log("window.fitcopilotData:", window.fitcopilotData);
console.log("window.fitcopilotTestingLab:", window.fitcopilotTestingLab);

// Test the exact logic from AdminTestingLab config
const testConfig = {
    ajaxUrl: window.ajaxurl || window.fitcopilotTestingLab?.ajaxUrl || '/wp-admin/admin-ajax.php',
    nonce: window.fitcopilotTestingLab?.nonce || window.fitcopilotData?.nonce || '',
};

console.log("AdminTestingLab config logic result:");
console.log("- ajaxUrl:", testConfig.ajaxUrl);
console.log("- nonce:", testConfig.nonce);
console.log("- nonce length:", testConfig.nonce.length);
console.log("- nonce is empty:", testConfig.nonce === '');

// Try to find the actual AdminTestingLab instance
if (window.AdminTestingLab) {
    console.log("AdminTestingLab class found");
} else {
    console.log("AdminTestingLab class NOT found");
}

// Check if there's a global instance
const scripts = document.querySelectorAll('script');
let testingLabScript = null;
scripts.forEach(script => {
    if (script.src && script.src.includes('admin-testing-lab.js')) {
        testingLabScript = script;
    }
});

console.log("admin-testing-lab.js script found:", !!testingLabScript);
if (testingLabScript) {
    console.log("Script src:", testingLabScript.src);
}

// Test creating FormData with the nonce
const formData = new FormData();
formData.append('action', 'fitcopilot_debug_test_workout');
formData.append('nonce', testConfig.nonce);
formData.append('test_id', 'manual_test_' + Date.now());

console.log("Test FormData entries:");
for (let [key, value] of formData.entries()) {
    console.log(`- ${key}: "${value}"`);
} 