/**
 * Final Dark Mode Test - Body Background Fix
 * Run this in browser console after refreshing the page
 */

console.log('🌙 Final Dark Mode Test...');

// Test CSS loading
const optimizedCSS = !!document.querySelector('link[href*="admin-prompt-builder-optimized.css"]');
const originalCSS = !!document.querySelector('link[href*="admin-prompt-builder.css"]:not([href*="optimized"])');

console.log('✅ Optimized CSS loaded:', optimizedCSS);
console.log('❌ Original CSS loaded:', originalCSS);

if (window.FitCopilotDarkMode) {
    console.log('\n🔄 Testing complete dark mode functionality...');
    
    // Function to get all relevant background colors
    function getThemeColors() {
        const body = getComputedStyle(document.body);
        const html = getComputedStyle(document.documentElement);
        const wrap = document.querySelector('.wrap');
        const wrapStyles = wrap ? getComputedStyle(wrap) : null;
        
        return {
            bodyBg: body.backgroundColor,
            bodyColor: body.color,
            htmlBg: html.backgroundColor,
            wrapBg: wrapStyles ? wrapStyles.backgroundColor : 'N/A',
            dataTheme: document.documentElement.getAttribute('data-theme'),
            bgPrimary: html.getPropertyValue('--bg-primary').trim(),
            textPrimary: html.getPropertyValue('--text-primary').trim()
        };
    }
    
    // Get initial state
    const lightColors = getThemeColors();
    console.log('📊 Light Mode Colors:', lightColors);
    
    // Switch to dark mode
    window.FitCopilotDarkMode.setTheme('dark');
    
    setTimeout(() => {
        const darkColors = getThemeColors();
        console.log('📊 Dark Mode Colors:', darkColors);
        
        // Check if changes are working
        const results = {
            dataThemeChanged: lightColors.dataTheme !== darkColors.dataTheme,
            cssVariablesChanged: lightColors.bgPrimary !== darkColors.bgPrimary,
            bodyBgChanged: lightColors.bodyBg !== darkColors.bodyBg,
            bodyColorChanged: lightColors.bodyColor !== darkColors.bodyColor
        };
        
        console.log('\n🔍 Analysis Results:');
        console.log('Data theme attribute changing:', results.dataThemeChanged);
        console.log('CSS variables updating:', results.cssVariablesChanged);
        console.log('Body background changing:', results.bodyBgChanged);
        console.log('Body text color changing:', results.bodyColorChanged);
        
        if (results.bodyBgChanged && results.bodyColorChanged) {
            console.log('🎉 SUCCESS: Dark mode is fully working!');
            console.log('✅ Body background changed from', lightColors.bodyBg, 'to', darkColors.bodyBg);
            console.log('✅ Body text changed from', lightColors.bodyColor, 'to', darkColors.bodyColor);
        } else {
            console.log('❌ ISSUE: Visual changes not applying');
            console.log('Debug info:');
            console.log('- CSS variables are updating:', results.cssVariablesChanged);
            console.log('- Body styles need !important flags or higher specificity');
        }
        
        // Test the toggle button
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            console.log('✅ Toggle button found and should be working');
        } else {
            console.log('❌ Toggle button not found');
        }
        
        // Switch back to light
        window.FitCopilotDarkMode.setTheme('light');
        
    }, 1000);
} else {
    console.log('❌ Dark mode script not available');
}

console.log('\n💡 Look for the sun/moon toggle button in the top-right area of the page');
console.log('💡 The entire page background should now change between light and dark themes'); 