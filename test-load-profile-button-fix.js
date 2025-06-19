// Load Profile Button Fix Verification Test
// Run this in browser console on the PromptBuilder page

console.log('🔧 LOAD PROFILE BUTTON FIX VERIFICATION');
console.log('='.repeat(50));

function testLoadProfileButtonFix() {
    console.log('🧪 Testing Load Profile Button Fix...');
    
    // 1. Check elements exist
    const userSelector = document.getElementById('user-selector');
    const loadButton = document.getElementById('load-profile');
    
    if (!userSelector) {
        console.error('❌ User selector not found');
        return false;
    }
    
    if (!loadButton) {
        console.error('❌ Load profile button not found');
        return false;
    }
    
    console.log('✅ Both elements found');
    
    // 2. Check initial state
    console.log('Initial state:');
    console.log('- User selector value:', userSelector.value);
    console.log('- Load button disabled:', loadButton.disabled);
    
    // 3. Check if we have user options
    const userOptions = Array.from(userSelector.options).filter(opt => opt.value !== '');
    console.log('Available user options:', userOptions.length);
    
    if (userOptions.length === 0) {
        console.error('❌ No user options available for testing');
        return false;
    }
    
    // 4. Test selecting a user
    console.log('🧪 Testing user selection...');
    
    // Select the first available user
    const firstUser = userOptions[0];
    userSelector.value = firstUser.value;
    console.log('Selected user:', firstUser.text, '(ID:', firstUser.value, ')');
    
    // Trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    userSelector.dispatchEvent(changeEvent);
    
    // Check if button is now enabled
    setTimeout(() => {
        console.log('After user selection:');
        console.log('- User selector value:', userSelector.value);
        console.log('- Load button disabled:', loadButton.disabled);
        
        if (loadButton.disabled) {
            console.error('❌ Button is still disabled after selecting user');
            
            // Try jQuery trigger as fallback
            if (typeof jQuery !== 'undefined') {
                console.log('🔄 Trying jQuery trigger...');
                jQuery(userSelector).trigger('change');
                
                setTimeout(() => {
                    console.log('After jQuery trigger:');
                    console.log('- Load button disabled:', loadButton.disabled);
                    
                    if (!loadButton.disabled) {
                        console.log('✅ Button enabled after jQuery trigger!');
                    } else {
                        console.error('❌ Button still disabled after jQuery trigger');
                        
                        // Manual fix
                        console.log('🔧 Applying manual fix...');
                        loadButton.disabled = false;
                        console.log('✅ Button manually enabled');
                    }
                }, 100);
            }
        } else {
            console.log('✅ Button is now enabled! Fix successful!');
        }
        
        // 5. Test deselecting user
        console.log('🧪 Testing user deselection...');
        userSelector.value = '';
        userSelector.dispatchEvent(new Event('change', { bubbles: true }));
        
        setTimeout(() => {
            console.log('After deselection:');
            console.log('- User selector value:', userSelector.value);
            console.log('- Load button disabled:', loadButton.disabled);
            
            if (loadButton.disabled) {
                console.log('✅ Button correctly disabled when no user selected');
            } else {
                console.error('❌ Button should be disabled when no user selected');
            }
        }, 100);
        
    }, 100);
    
    return true;
}

// Run the test
testLoadProfileButtonFix();

console.log('\n📋 INSTRUCTIONS:');
console.log('1. Watch the console output above');
console.log('2. Try manually selecting different users from the dropdown');
console.log('3. The "Load Profile" button should enable/disable automatically');
console.log('4. If it works, the JavaScript syntax error has been fixed!'); 