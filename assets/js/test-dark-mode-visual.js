/**
 * Visual Dark Mode Test - Debug Theme Switching
 * Run this in browser console on PromptBuilder page
 */

console.log('🎨 Visual Dark Mode Test Starting...');

// Function to check current theme state
function checkThemeState() {
    const htmlElement = document.documentElement;
    const dataTheme = htmlElement.getAttribute('data-theme');
    const computedBg = getComputedStyle(document.body).backgroundColor;
    
    console.log('HTML data-theme attribute:', dataTheme);
    console.log('Body background color:', computedBg);
    console.log('CSS custom property --bg-primary:', getComputedStyle(htmlElement).getPropertyValue('--bg-primary'));
    
    return {
        dataTheme,
        computedBg,
        bgPrimary: getComputedStyle(htmlElement).getPropertyValue('--bg-primary')
    };
}

// Initial state check
console.log('📋 Initial Theme State:');
const initialState = checkThemeState();

// Test theme switching manually
console.log('\n🔄 Testing Manual Theme Switch...');

if (window.FitCopilotDarkMode) {
    // Switch to dark mode
    console.log('Switching to dark mode...');
    window.FitCopilotDarkMode.setTheme('dark');
    
    setTimeout(() => {
        console.log('📊 Dark Mode State:');
        const darkState = checkThemeState();
        
        // Switch back to light mode
        console.log('Switching to light mode...');
        window.FitCopilotDarkMode.setTheme('light');
        
        setTimeout(() => {
            console.log('📊 Light Mode State:');
            const lightState = checkThemeState();
            
            // Analysis
            console.log('\n🔍 Analysis:');
            console.log('Theme switching working:', 
                darkState.dataTheme !== lightState.dataTheme);
            console.log('CSS variables changing:', 
                darkState.bgPrimary !== lightState.bgPrimary);
            console.log('Visual changes applying:', 
                darkState.computedBg !== lightState.computedBg);
                
            // Visual indicator test
            console.log('\n🎯 Creating Visual Indicator...');
            createVisualIndicator();
            
        }, 500);
    }, 500);
} else {
    console.log('❌ FitCopilotDarkMode not available');
}

// Create a visual indicator element to test theme changes
function createVisualIndicator() {
    // Remove existing indicator
    const existing = document.getElementById('theme-test-indicator');
    if (existing) existing.remove();
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.id = 'theme-test-indicator';
    indicator.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 2px solid var(--border-primary);
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            box-shadow: var(--shadow-lg);
            min-width: 200px;
        ">
            <div><strong>Theme Test Indicator</strong></div>
            <div>Background: <span id="bg-color-display"></span></div>
            <div>Text: <span id="text-color-display"></span></div>
            <div>Theme: <span id="theme-display"></span></div>
            <button onclick="window.FitCopilotDarkMode.toggleTheme()" 
                    style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">
                Toggle Theme
            </button>
        </div>
    `;
    
    document.body.appendChild(indicator);
    
    // Update indicator function
    function updateIndicator() {
        const bgDisplay = document.getElementById('bg-color-display');
        const textDisplay = document.getElementById('text-color-display');
        const themeDisplay = document.getElementById('theme-display');
        
        if (bgDisplay && textDisplay && themeDisplay) {
            const styles = getComputedStyle(document.documentElement);
            bgDisplay.textContent = styles.getPropertyValue('--bg-primary').trim();
            textDisplay.textContent = styles.getPropertyValue('--text-primary').trim();
            themeDisplay.textContent = document.documentElement.getAttribute('data-theme') || 'auto';
        }
    }
    
    // Initial update
    updateIndicator();
    
    // Listen for theme changes
    document.addEventListener('fitcopilot:theme-changed', updateIndicator);
    
    console.log('✅ Visual indicator created! Look for the test panel in the top-right corner.');
    console.log('Click the "Toggle Theme" button to test theme switching.');
}

// Cleanup function
window.cleanupThemeTest = function() {
    const indicator = document.getElementById('theme-test-indicator');
    if (indicator) {
        indicator.remove();
        console.log('🧹 Theme test indicator removed');
    }
};

console.log('\n💡 Run cleanupThemeTest() to remove the test indicator when done.'); 