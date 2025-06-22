/**
 * Quick Test Script for Modular PromptBuilder Dark Mode Issues
 * Run this in browser console on the PromptBuilder page
 */

console.log('🔍 TESTING MODULAR PROMPTBUILDER DARK MODE');
console.log('========================================');

// Test 1: Check if dark mode toggle is available
console.log('\n1. Dark Mode Toggle Check:');
if (window.FitCopilotDarkMode) {
    console.log('✅ Dark mode script loaded');
    console.log('Current theme:', document.documentElement.getAttribute('data-theme') || 'light');
} else {
    console.log('❌ Dark mode script not loaded');
}

// Test 2: Check WordPress button visibility
console.log('\n2. WordPress Button Test:');
const wpButtons = document.querySelectorAll('.wp-core-ui .button');
console.log(`Found ${wpButtons.length} WordPress buttons`);

wpButtons.forEach((btn, index) => {
    const styles = getComputedStyle(btn);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    console.log(`Button ${index + 1}:`, {
        id: btn.id || 'no-id',
        background: bgColor,
        color: textColor,
        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0,
        hasWhiteBackground: bgColor.includes('255, 255, 255')
    });
});

// Test 3: Check form elements
console.log('\n3. Form Elements Test:');
const formElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
console.log(`Found ${formElements.length} form elements`);

let whiteBackgroundCount = 0;
formElements.forEach((el, index) => {
    const styles = getComputedStyle(el);
    const bgColor = styles.backgroundColor;
    
    if (bgColor.includes('255, 255, 255')) {
        whiteBackgroundCount++;
    }
});

console.log(`${whiteBackgroundCount}/${formElements.length} form elements have white backgrounds`);

// Test 4: Check muscle module components
console.log('\n4. Muscle Module Test:');
const muscleComponents = document.querySelectorAll('[class*="muscle-"]');
console.log(`Found ${muscleComponents.length} muscle module components`);

if (muscleComponents.length > 0) {
    console.log('✅ Muscle module components found');
    
    // Check if muscle selection container exists
    const muscleContainer = document.querySelector('.muscle-selection-container');
    if (muscleContainer) {
        const styles = getComputedStyle(muscleContainer);
        console.log('Muscle container background:', styles.backgroundColor);
    }
} else {
    console.log('❌ No muscle module components found');
}

// Test 5: Check preview systems
console.log('\n5. Preview Systems Test:');
const previewSystems = document.querySelectorAll('.prompt-preview, .strategy-code-viewer, .workout-test-preview, .context-inspector');
console.log(`Found ${previewSystems.length} preview systems`);

previewSystems.forEach((system, index) => {
    const styles = getComputedStyle(system);
    const bgColor = styles.backgroundColor;
    const className = system.className;
    
    console.log(`Preview ${index + 1}:`, {
        type: className,
        background: bgColor,
        hasLightBackground: bgColor.includes('249, 249, 249') || bgColor.includes('255, 255, 255')
    });
});

// Test 6: Check notice system
console.log('\n6. Notice System Test:');
const notices = document.querySelectorAll('.notice');
console.log(`Found ${notices.length} notice elements`);

if (notices.length === 0) {
    console.log('ℹ️  No notices currently displayed (this is normal)');
} else {
    notices.forEach((notice, index) => {
        const styles = getComputedStyle(notice);
        console.log(`Notice ${index + 1}:`, {
            classes: notice.className,
            background: styles.backgroundColor,
            color: styles.color
        });
    });
}

// Test 7: Test theme switching (if available)
console.log('\n7. Theme Switching Test:');
if (window.FitCopilotDarkMode) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    console.log('Testing theme switch...');
    
    // Switch to dark mode
    window.FitCopilotDarkMode.setTheme('dark');
    
    setTimeout(() => {
        const newTheme = document.documentElement.getAttribute('data-theme');
        console.log('Theme after switch:', newTheme);
        
        // Test a WordPress button in dark mode
        const testButton = document.querySelector('.wp-core-ui .button');
        if (testButton) {
            const styles = getComputedStyle(testButton);
            console.log('WordPress button in dark mode:', {
                background: styles.backgroundColor,
                color: styles.color,
                stillHasWhiteBackground: styles.backgroundColor.includes('255, 255, 255')
            });
        }
        
        // Switch back to original theme
        if (currentTheme) {
            window.FitCopilotDarkMode.setTheme(currentTheme);
        } else {
            window.FitCopilotDarkMode.setTheme('light');
        }
        
        console.log('Theme restored to:', currentTheme || 'light');
        
    }, 1000);
} else {
    console.log('❌ Cannot test theme switching - dark mode script not available');
}

// Summary
console.log('\n📊 SUMMARY:');
console.log('===========');
console.log(`WordPress Buttons: ${wpButtons.length} found`);
console.log(`Form Elements: ${formElements.length} found`);
console.log(`Muscle Components: ${muscleComponents.length} found`);
console.log(`Preview Systems: ${previewSystems.length} found`);
console.log(`Notices: ${notices.length} found`);
console.log(`Dark Mode Available: ${!!window.FitCopilotDarkMode}`);

console.log('\n💡 RECOMMENDATIONS:');
console.log('If you see white backgrounds in dark mode, the fixes in MODULAR_COMPONENT_AUDIT_REPORT.md are needed.');
console.log('Run this test again after implementing the CSS fixes to verify improvements.'); 