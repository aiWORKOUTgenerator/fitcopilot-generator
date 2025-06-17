// Final verification script for nonce fix
// Run this in the browser console on the Testing Lab page after the fix

console.log("=== Nonce Fix Verification ===");

// Check both nonce sources
console.log("window.fitcopilotData:", window.fitcopilotData);
console.log("window.fitcopilotTestingLab:", window.fitcopilotTestingLab);

// Test the new config logic
const testConfig = {
    ajaxUrl: window.ajaxurl || window.fitcopilotTestingLab?.ajaxUrl || '/wp-admin/admin-ajax.php',
    nonce: window.fitcopilotTestingLab?.nonce || window.fitcopilotData?.nonce || '',
};

console.log("New config:", testConfig);
console.log("Selected nonce:", testConfig.nonce);
console.log("Selected ajaxUrl:", testConfig.ajaxUrl);

// Test FormData creation with new nonce
const formData = new FormData();
formData.append('action', 'fitcopilot_debug_test_workout');
formData.append('nonce', testConfig.nonce);
formData.append('test_data', JSON.stringify({
    duration: 30,
    fitness_level: "intermediate"
}));

console.log("FormData with new nonce:");
for (let [key, value] of formData.entries()) {
    console.log(`  ${key}: "${value}"`);
}

console.log("✅ Verification complete. The nonce should now be properly set."); 