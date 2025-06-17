/**
 * WordPress Admin Testing Lab - Main Entry Point
 * 
 * Lightweight entry point that loads the modular testing lab system
 */

console.log('[Admin Testing Lab] Loading modular system...');

// Import and initialize the modular testing lab system
import('./testing-lab/index.js')
    .then(({ TestingLab, initializeTestingLab }) => {
        console.log('[Admin Testing Lab] Modular system loaded successfully');
        
        // Initialize the testing lab
        const testingLab = initializeTestingLab();
        
        // Make available globally for debugging
        if (window.fitcopilotTestingLab?.debug) {
            window.adminTestingLab = testingLab;
            console.log('[Admin Testing Lab] Debug mode enabled - testingLab available globally');
        }
        
        console.log('[Admin Testing Lab] Initialization complete');
        
    })
    .catch(error => {
        console.error('[Admin Testing Lab] Critical Error: Failed to load modular system:', error);
        
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'notice notice-error';
        errorMessage.innerHTML = `
            <p><strong>Testing Lab Error:</strong> Failed to load the modular testing system.</p>
            <p>Error: ${error.message}</p>
            <p>Please check the browser console for more details and contact support if the issue persists.</p>
        `;
        
        // Insert error message at the top of the admin page
        const adminNotices = document.querySelector('.wrap') || document.body;
        if (adminNotices) {
            adminNotices.insertBefore(errorMessage, adminNotices.firstChild);
        }
    });

// Initialize when DOM is ready if not already
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Admin Testing Lab] DOM ready');
    });
} else {
    console.log('[Admin Testing Lab] DOM already ready');
} 