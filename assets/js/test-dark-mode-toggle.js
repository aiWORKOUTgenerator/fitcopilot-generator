/**
 * Dark Mode Toggle Verification Test
 * Run this in browser console on PromptBuilder page
 */

console.log('🌙 Testing Dark Mode Toggle...');

// Check if dark mode toggle class exists
const darkModeToggle = document.querySelector('.theme-toggle');
console.log('Dark mode toggle found:', !!darkModeToggle);

// Check if dark mode script is loaded
const darkModeAvailable = typeof window.FitCopilotDarkMode !== 'undefined';
console.log('Dark mode script loaded:', darkModeAvailable);

// Check if CSS variables are working
const testEl = document.createElement('div');
testEl.style.color = 'var(--text-primary)';
document.body.appendChild(testEl);
const hasVariables = getComputedStyle(testEl).color !== '';
document.body.removeChild(testEl);
console.log('CSS variables working:', hasVariables);

// Check if dashboard controls exist
const dashboardControls = document.querySelector('.dashboard-controls');
console.log('Dashboard controls found:', !!dashboardControls);

// Manual dark mode test
if (darkModeAvailable) {
    console.log('✅ Testing dark mode functionality...');
    
    // Test theme switching
    window.FitCopilotDarkMode.setTheme('dark');
    setTimeout(() => {
        console.log('Dark mode applied');
        window.FitCopilotDarkMode.setTheme('light');
        setTimeout(() => {
            console.log('Light mode restored');
        }, 1000);
    }, 1000);
} else {
    console.log('❌ Dark mode not available - checking why...');
    
    // Debug information
    console.log('DOM ready state:', document.readyState);
    console.log('Scripts in head:', Array.from(document.querySelectorAll('script[src*="dark-mode"]')).length);
}

// Help instructions
console.log('\n📋 Dark Mode Toggle Location:');
console.log('The dark mode toggle should appear in the top-right area of the PromptBuilder page');
console.log('Look for a sun/moon icon button next to the page title');
console.log('\nIf you don\'t see it:');
console.log('1. Refresh the page');
console.log('2. Check browser console for errors');
console.log('3. Verify you\'re on the PromptBuilder admin page'); 