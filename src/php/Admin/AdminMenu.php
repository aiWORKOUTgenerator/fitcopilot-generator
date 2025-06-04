<?php
/**
 * Admin Menu
 *
 * Manages the admin menu structure for FitCopilot.
 */

namespace FitCopilot\Admin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin Menu class
 */
class AdminMenu {
    
    /**
     * Constructor
     */
    public function __construct() {
        // Register main admin menu
        add_action('admin_menu', [$this, 'register_admin_menu']);
    }
    
    /**
     * Register the main admin menu and parent page
     */
    public function register_admin_menu() {
        // Add the main menu item with a dashboard page
        add_menu_page(
            __('FitCopilot', 'fitcopilot'), // Page title
            __('FitCopilot', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot', // Menu slug
            [$this, 'render_dashboard_page'], // Callback function
            'dashicons-universal-access-alt', // Icon
            30 // Position
        );
        
        // Add Dashboard submenu (duplicate of parent to keep proper naming)
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('Dashboard', 'fitcopilot'), // Page title
            __('Dashboard', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot', // Menu slug (same as parent)
            [$this, 'render_dashboard_page'] // Callback function
        );
        
        // Add Settings submenu
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('Settings', 'fitcopilot'), // Page title
            __('Settings', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot', // Menu slug (using 'fitcopilot' instead of 'fitcopilot-settings' to match Settings)
            'FitCopilot\\Admin\\render_settings' // Use the render_settings function from Settings class
        );
    }
    
    /**
     * Render the dashboard page
     */
    public function render_dashboard_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('FitCopilot Dashboard', 'fitcopilot'); ?></h1>
            
            <style>
                .dashboard-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                    max-width: 1600px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .dashboard-card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    border-left: 4px solid #2271b1;
                    transition: all 0.2s ease-in-out;
                }
                .dashboard-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                }
                .dashboard-card h2 {
                    margin-top: 0;
                    color: #2271b1;
                    font-weight: 600;
                }
                .dashboard-card p {
                    margin-bottom: 15px;
                }
                .dashboard-card .button {
                    display: inline-block;
                    margin-top: 5px;
                    background-color: #2271b1;
                    color: white;
                    border-radius: 4px;
                    border: none;
                    padding: 6px 12px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }
                .dashboard-card .button:hover {
                    background-color: #135e96;
                }
                .dashboard-layout {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 30px;
                    max-width: 1600px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .dashboard-profile-container {
                    flex: 2;
                    min-width: 300px;
                    background: #1e293b;
                    color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                    padding: 24px;
                    border-left: none;
                    transition: all 0.3s ease;
                }
                .dashboard-profile-container h2 {
                    margin-top: 0;
                    color: #7dd3fc;
                    font-weight: 600;
                    font-size: 20px;
                }
                .dashboard-profile-container p {
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 20px;
                }
                .dashboard-workout-container {
                    flex: 3;
                    min-width: 450px;
                    background: #1e293b;
                    color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                    padding: 24px;
                    border-left: none;
                }
                .dashboard-workout-container h2 {
                    margin-top: 0;
                    color: #7dd3fc;
                    font-weight: 600;
                    font-size: 20px;
                }
                .dashboard-workout-container p {
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 20px;
                }
                @media (max-width: 782px) {
                    .dashboard-container {
                        grid-template-columns: 1fr;
                    }
                    .dashboard-layout {
                        flex-direction: column;
                    }
                }
                /* Add dark mode support to WordPress admin area */
                body.admin-color-modern {
                    background: #0f172a;
                }
                body.admin-color-modern .wrap h1 {
                    color: white;
                }
                body.admin-color-modern .dashboard-card {
                    background: #1e293b;
                    color: white;
                    border-left: 4px solid #38bdf8;
                }
                body.admin-color-modern .dashboard-card h2 {
                    color: #7dd3fc;
                }
                body.admin-color-modern .dashboard-card p {
                    color: rgba(255, 255, 255, 0.7);
                }
            </style>
            
            <!-- Main dashboard layout with profile and workout generator -->
            <div class="dashboard-layout">
                <!-- Profile Feature -->
                <div class="dashboard-profile-container">
                    <h2><?php echo esc_html__('Your Fitness Profile', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('Manage your fitness profile settings to get personalized workouts.', 'fitcopilot'); ?></p>
                    <div data-fitcopilot-profile></div>
                    
                    <!-- Profile debug info -->
                    <div id="profile-debug-info" style="display:none; margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;">
                        <h3 style="color: #7dd3fc; margin-top: 0;">Profile Debug Information</h3>
                        <p style="color: rgba(255,255,255,0.7);">The profile component failed to load. Here are some possible reasons:</p>
                        <ul style="color: rgba(255,255,255,0.7);">
                            <li>API endpoint not reachable (404 error)</li>
                            <li>Profile scripts didn't load properly</li>
                            <li>React couldn't initialize the component</li>
                        </ul>
                        <p style="color: rgba(255,255,255,0.7);">Required scripts:</p>
                        <ul style="color: rgba(255,255,255,0.7);">
                            <li>profile.js: <span id="profile-check-script">❓</span></li>
                            <li>profile.css: <span id="profile-check-styles">❓</span></li>
                        </ul>
                        <p style="color: rgba(255,255,255,0.7);">Please check the browser console for detailed error messages.</p>
                    </div>
                </div>
                
                <!-- Workout Generator -->
                <div class="dashboard-workout-container">
                    <h2><?php echo esc_html__('Workout Generator', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('Generate personalized workouts based on your preferences.', 'fitcopilot'); ?></p>
                    <div id="fitcopilot-generator-root"></div>
                </div>
            </div>
            <!-- Other dashboard cards -->
            
            <div class="dashboard-container">
                <div class="dashboard-card">
                    <h2><?php echo esc_html__('Recent Activity', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('View your recent workout generation activity.', 'fitcopilot'); ?></p>
                </div>
                
                <div class="dashboard-card">
                    <h2><?php echo esc_html__('API Usage', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('Monitor your OpenAI API usage and costs.', 'fitcopilot'); ?></p>
                    <p><a href="<?php echo esc_url(admin_url('admin.php?page=fitcopilot-api-tracker')); ?>" class="button"><?php echo esc_html__('View API Tracker', 'fitcopilot'); ?></a></p>
                </div>
                
                <div class="dashboard-card">
                    <h2><?php echo esc_html__('Documentation', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('Learn how to use FitCopilot in your WordPress site.', 'fitcopilot'); ?></p>
                </div>
            </div>
            
            <script>
            /* <![CDATA[ */
            document.addEventListener('DOMContentLoaded', function() {
                // Any JavaScript code here will not be entity-encoded
                var container = document.querySelector('.dashboard-container');
                if (container && container.children.length > 0) {
                    console.log('Dashboard loaded with ' + container.children.length + ' cards');
                }
                
                // Initialize the workout generator if it's not already initialized
                if (typeof window.initializeApp === 'function' && document.getElementById('fitcopilot-generator-root')) {
                    window.initializeApp();
                }
                
                // Check profile component loading
                var profileContainer = document.querySelector('[data-fitcopilot-profile]');
                if (profileContainer) {
                    console.log('✅ Profile container found');
                    
                    // Enhanced debugging function
                    function checkProfileComponent() {
                        console.log('🔧 [Dashboard Debug] Profile component check:', {
                            container: {
                                exists: !!profileContainer,
                                isEmpty: profileContainer.innerHTML.trim() === '',
                                hasMountedFlag: profileContainer.hasAttribute('data-profile-mounted'),
                                innerHTML: profileContainer.innerHTML.substring(0, 100) + '...'
                            },
                            scripts: {
                                profileJs: Array.from(document.getElementsByTagName('script')).some(s => s.src.includes('profile.js')),
                                vendorsJs: Array.from(document.getElementsByTagName('script')).some(s => s.src.includes('vendors.js')),
                                react: typeof window.React !== 'undefined',
                                reactDOM: typeof window.ReactDOM !== 'undefined'
                            },
                            authentication: {
                                fitcopilotData: !!window.fitcopilotData,
                                hasNonce: !!(window.fitcopilotData && window.fitcopilotData.nonce),
                                apiBase: window.fitcopilotData ? window.fitcopilotData.apiBase : 'Not available'
                            },
                            debugFunctions: {
                                debugProfileAuth: typeof window.debugProfileAuth === 'function',
                                initializeProfileComponents: typeof window.initializeProfileComponents === 'function',
                                debugProfileMount: typeof window.debugProfileMount === 'function'
                            }
                        });
                        
                        // Test API connectivity if auth is available
                        if (window.fitcopilotData && window.fitcopilotData.nonce) {
                            console.log('🔧 [Dashboard Debug] Testing profile API...');
                            fetch('/wp-json/fitcopilot/v1/profile', {
                                method: 'GET',
                                headers: {
                                    'X-WP-Nonce': window.fitcopilotData.nonce,
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'same-origin'
                            })
                            .then(response => {
                                console.log('🔧 [Dashboard Debug] API response status:', response.status);
                                return response.json();
                            })
                            .then(data => {
                                console.log('🔧 [Dashboard Debug] API response data:', data);
                            })
                            .catch(error => {
                                console.error('🔧 [Dashboard Debug] API test failed:', error);
                            });
                        } else {
                            console.warn('🔧 [Dashboard Debug] Cannot test API - authentication not available');
                        }
                    }
                    
                    // Check if scripts were loaded
                    function checkProfileScripts() {
                        var profileScriptLoaded = false;
                        var profileStylesLoaded = false;
                        
                        // Check scripts
                        var scripts = document.getElementsByTagName('script');
                        for (var i = 0; i < scripts.length; i++) {
                            if (scripts[i].src.indexOf('profile.js') !== -1) {
                                var profileCheckElement = document.getElementById('profile-check-script');
                                if (profileCheckElement) {
                                    profileCheckElement.innerHTML = '✅';
                                }
                                profileScriptLoaded = true;
                                break;
                            }
                        }
                        
                        // Check styles
                        var styles = document.getElementsByTagName('link');
                        for (var j = 0; j < styles.length; j++) {
                            if (styles[j].href.indexOf('profile.css') !== -1) {
                                var stylesCheckElement = document.getElementById('profile-check-styles');
                                if (stylesCheckElement) {
                                    stylesCheckElement.innerHTML = '✅';
                                }
                                profileStylesLoaded = true;
                                break;
                            }
                        }
                        
                        return { script: profileScriptLoaded, styles: profileStylesLoaded };
                    }
                    
                    // Run enhanced check after a delay
                    setTimeout(function() {
                        checkProfileComponent();
                        
                        // If profile container is empty after 3 seconds, show debug info
                        if (profileContainer.innerHTML.trim() === '' || profileContainer.innerHTML.includes('Profile Component Failed')) {
                            console.warn('⚠️ [Dashboard Debug] Profile container appears to be empty or failed to load');
                            
                            // Show the debug panel
                            var debugPanel = document.getElementById('profile-debug-info');
                            if (debugPanel) {
                                debugPanel.style.display = 'block';
                            }
                            
                            // Add manual initialization button to the debug panel
                            if (debugPanel && !debugPanel.querySelector('.manual-init-btn')) {
                                var initButton = document.createElement('button');
                                initButton.textContent = 'Try Manual Initialization';
                                initButton.className = 'manual-init-btn';
                                initButton.style.cssText = 'background: #2271b1; color: white; border: none; border-radius: 4px; padding: 8px 16px; margin: 8px 4px 0 0; cursor: pointer;';
                                initButton.onclick = function() {
                                    console.log('🔧 [Dashboard Debug] Manual initialization triggered');
                                    if (typeof window.initializeProfileComponents === 'function') {
                                        window.initializeProfileComponents();
                                    } else {
                                        console.error('❌ initializeProfileComponents function not available');
                                    }
                                };
                                
                                var debugButton = document.createElement('button');
                                debugButton.textContent = 'Run Profile Debug';
                                debugButton.className = 'debug-profile-btn';
                                debugButton.style.cssText = 'background: #6366f1; color: white; border: none; border-radius: 4px; padding: 8px 16px; margin: 8px 4px 0 0; cursor: pointer;';
                                debugButton.onclick = function() {
                                    if (typeof window.debugProfileAuth === 'function') {
                                        window.debugProfileAuth().then(function(result) {
                                            console.log('🔧 Debug result:', result);
                                            alert('Debug completed. Check browser console for details.');
                                        }).catch(function(error) {
                                            console.error('❌ Debug failed:', error);
                                            alert('Debug failed: ' + error.message);
                                        });
                                    } else if (typeof window.debugProfileMount === 'function') {
                                        window.debugProfileMount();
                                        alert('Mount debug completed. Check browser console for details.');
                                    } else {
                                        alert('Debug functions not available.');
                                    }
                                };
                                
                                debugPanel.appendChild(initButton);
                                debugPanel.appendChild(debugButton);
                            }
                        } else {
                            console.log('✅ [Dashboard Debug] Profile container has content - component likely loaded successfully');
                        }
                    }, 3000);
                    
                    // Run initial script check
                    checkProfileScripts();
                } else {
                    console.warn('⚠️ Profile container not found on this page');
                }
            });
            /* ]]> */
            </script>
        </div>
        <?php
    }
}

// Initialize the admin menu
new AdminMenu(); 