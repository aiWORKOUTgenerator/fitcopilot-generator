/**
 * Theme Initialization
 * 
 * Sets up the initial theme based on localStorage or defaults to dark theme.
 * This script runs immediately to prevent any flash of unthemed content.
 */

// Function to initialize theme
const initTheme = (): void => {
  // Check localStorage first
  const storedTheme = localStorage.getItem('theme');
  
  // Set theme based on stored preference or default to dark
  if (storedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  } else {
    // Default to dark theme
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
    
    // Save to localStorage if not already set
    if (!storedTheme) {
      localStorage.setItem('theme', 'dark');
    }
  }
};

// Run immediately
initTheme();

export default initTheme; 