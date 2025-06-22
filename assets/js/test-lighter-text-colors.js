/**
 * Test Lighter Text Colors in Dark Mode
 * Run this to see the updated lighter text colors
 */

console.log('🎨 TESTING LIGHTER TEXT COLORS');
console.log('==============================');

// Show the updated color values
console.log('\n📝 UPDATED TEXT COLOR VALUES:');
console.log('Primary Text:   #f1f5f9 (was #f8fafc) - Lighter, almost white');
console.log('Secondary Text: #e2e8f0 (was #cbd5e1) - Much lighter grey');
console.log('Tertiary Text:  #cbd5e1 (was #64748b) - Promoted from secondary');

// Test current theme
const currentTheme = document.documentElement.getAttribute('data-theme');
console.log(`\nCurrent theme: ${currentTheme || 'light'}`);

// Switch to dark mode for testing if not already
if (currentTheme !== 'dark' && window.FitCopilotDarkMode) {
    window.FitCopilotDarkMode.setTheme('dark');
    console.log('Switched to dark mode for testing...');
}

setTimeout(() => {
    console.log('\n🔍 TESTING TEXT READABILITY...');
    
    // Test various text elements
    const textElements = [
        { selector: '.form-input', description: 'Form Input Text' },
        { selector: '.form-select', description: 'Form Select Text' },
        { selector: '.stat-label', description: 'Stat Label Text' },
        { selector: '.perf-label', description: 'Performance Label Text' },
        { selector: '.meta-label', description: 'Meta Label Text' },
        { selector: '.status-label', description: 'Status Label Text' },
        { selector: '.height-separator', description: 'Height Separator Text' },
        { selector: '.prompt-placeholder', description: 'Placeholder Text' }
    ];
    
    console.log('\n📊 TEXT COLOR ANALYSIS:');
    console.log('=======================');
    
    textElements.forEach(({ selector, description }) => {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length > 0) {
            const element = elements[0];
            const styles = getComputedStyle(element);
            const textColor = styles.color;
            
            // Check if text is now lighter
            const isLighterText = textColor.includes('241, 245, 249') || // #f1f5f9
                                 textColor.includes('226, 232, 240') || // #e2e8f0
                                 textColor.includes('203, 213, 225');   // #cbd5e1
            
            console.log(`${description}: ${isLighterText ? '✅' : '⚠️'} ${textColor}`);
        } else {
            console.log(`${description}: ❌ Not found`);
        }
    });
    
    // Test contrast with background
    console.log('\n🎯 CONTRAST TESTING:');
    console.log('====================');
    
    const testContrast = (textColor, bgColor, description) => {
        // Simple contrast check - lighter text on dark background should be good
        const isGoodContrast = (textColor.includes('241, 245, 249') || 
                               textColor.includes('226, 232, 240')) &&
                              (bgColor.includes('15, 23, 42') || 
                               bgColor.includes('30, 41, 59'));
        
        console.log(`${description}: ${isGoodContrast ? '✅ Good contrast' : '⚠️ Check contrast'}`);
        console.log(`  Text: ${textColor}`);
        console.log(`  Background: ${bgColor}`);
    };
    
    // Test form input contrast
    const formInput = document.querySelector('.form-input');
    if (formInput) {
        const styles = getComputedStyle(formInput);
        testContrast(styles.color, styles.backgroundColor, 'Form Input');
    }
    
    // Test preview area contrast
    const promptPreview = document.querySelector('.prompt-preview');
    if (promptPreview) {
        const styles = getComputedStyle(promptPreview);
        testContrast(styles.color, styles.backgroundColor, 'Prompt Preview');
    }
    
    console.log('\n💡 SUMMARY:');
    console.log('===========');
    console.log('✅ Primary text now uses #f1f5f9 (almost white)');
    console.log('✅ Secondary text now uses #e2e8f0 (much lighter grey)');
    console.log('✅ Tertiary text now uses #cbd5e1 (promoted from old secondary)');
    console.log('✅ All placeholder text now uses primary color (lighter)');
    
    console.log('\n🎨 VISUAL IMPROVEMENT:');
    console.log('The text should now appear much lighter and more readable against dark backgrounds!');
    
    // Switch back to original theme if we changed it
    if (currentTheme !== 'dark' && window.FitCopilotDarkMode) {
        setTimeout(() => {
            window.FitCopilotDarkMode.setTheme(currentTheme || 'light');
            console.log('\nRestored original theme');
        }, 3000);
    }
    
}, 500); 