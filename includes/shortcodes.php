<?php
/**
 * Register the Color System Demo shortcode
 * Outputs a div with class .fitcopilot-color-system-demo which the JS will target
 * 
 * @return string The HTML output for the shortcode
 */
function fitcopilot_color_system_demo_shortcode() {
    // Ensure the script contains our component
    wp_enqueue_script(
        'fitcopilot-vendors',
        FITCOPILOT_URL . 'dist/js/vendors.js',
        [],
        FITCOPILOT_VERSION,
        true
    );
    
    wp_enqueue_script(
        'fitcopilot-frontend',
        FITCOPILOT_URL . 'dist/js/frontend.js',
        ['wp-element', 'wp-api-fetch', 'fitcopilot-vendors'],
        FITCOPILOT_VERSION,
        true
    );
    
    wp_enqueue_style(
        'fitcopilot-styles',
        FITCOPILOT_URL . 'dist/css/frontend.css',
        [],
        FITCOPILOT_VERSION
    );
    
    ob_start();
    $plugin_url = FITCOPILOT_URL;
    $version = FITCOPILOT_VERSION;
    ?>
    <div id="fitcopilot-color-system-demo" class="fitcopilot-color-system-demo"></div>
    
    <script>
    /* <![CDATA[ */
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[FitCopilot] Color System Demo: DOM ready, checking for container');
            
            // Check if container exists
            var container = document.getElementById('fitcopilot-color-system-demo');
            if (container) {
                console.log('[FitCopilot] Color System Demo: Container found');
            } else {
                console.log('[FitCopilot] Color System Demo: Container not found');
            }
            
            // Wait to see if the component gets mounted automatically
            setTimeout(function() {
                var container = document.getElementById('fitcopilot-color-system-demo');
                if (container && container.children.length === 0) {
                    console.log('[FitCopilot] Container is empty after timeout. Trying manual initialization...');
                    
                    // Try calling the init function if it exists
                    if (typeof window.initColorSystemDemo === 'function') {
                        console.log('[FitCopilot] Found init function, calling it...');
                        window.initColorSystemDemo();
                    } else {
                        console.log('[FitCopilot] Init function not found. Attempting to reload scripts...');
                        
                        // Create frontend script element
                        var frontendScript = document.createElement('script');
                        frontendScript.src = '<?php echo esc_url($plugin_url); ?>dist/js/frontend.js?ver=<?php echo esc_attr($version); ?>';
                        document.body.appendChild(frontendScript);
                        
                        frontendScript.onload = function() {
                            console.log('[FitCopilot] Frontend script reloaded');
                            
                            // Try to initialize after a short delay
                            setTimeout(function() {
                                if (typeof window.initColorSystemDemo === 'function') {
                                    window.initColorSystemDemo();
                                }
                            }, 500);
                        };
                    }
                }
            }, 2000);
        });
    /* ]]> */
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('fitcopilot_color_system_demo', 'fitcopilot_color_system_demo_shortcode'); 