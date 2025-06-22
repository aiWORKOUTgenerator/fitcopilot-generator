/**
 * Quick Dark Mode Fix Test
 * Run this in browser console after refreshing the page
 */

console.log('🔧 Testing Dark Mode Fix...');

// Check CSS loading
const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
const optimizedCSS = stylesheets.find(s => s.href.includes('admin-prompt-builder-optimized.css'));
const originalCSS = stylesheets.find(s => s.href.includes('admin-prompt-builder.css') && !s.href.includes('optimized'));

console.log('✅ Optimized CSS loaded:', !!optimizedCSS);
console.log('❌ Original CSS loaded:', !!originalCSS);

if (originalCSS) {
    console.log('⚠️  CONFLICT: Both CSS files are loaded! This will cause issues.');
} else {
    console.log('✅ Good: Only optimized CSS is loaded');
}

// Test dark mode functionality
if (window.FitCopilotDarkMode) {
    console.log('\n🌙 Testing theme switching...');
    
    // Get initial background color
    const initialBg = getComputedStyle(document.body).backgroundColor;
    console.log('Initial background:', initialBg);
    
    // Switch to dark mode
    window.FitCopilotDarkMode.setTheme('dark');
    
    setTimeout(() => {
        const darkBg = getComputedStyle(document.body).backgroundColor;
        console.log('Dark mode background:', darkBg);
        
        // Check if it actually changed
        if (initialBg !== darkBg) {
            console.log('🎉 SUCCESS: Dark mode is working!');
        } else {
            console.log('❌ FAILED: Background color did not change');
            
            // Debug info
            console.log('HTML data-theme:', document.documentElement.getAttribute('data-theme'));
            console.log('--bg-primary value:', getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'));
        }
        
        // Switch back to light
        window.FitCopilotDarkMode.setTheme('light');
    }, 500);
} else {
    console.log('❌ Dark mode script not loaded');
}

console.log('\n💡 If dark mode is still not working, try a hard refresh (Ctrl+F5 or Cmd+Shift+R)'); 