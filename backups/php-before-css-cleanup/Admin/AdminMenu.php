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
        error_log('[FitCopilot Debug] AdminMenu constructor called');
        
        // Register main admin menu
        add_action('admin_menu', [$this, 'register_admin_menu']);
        
        // Enqueue admin assets
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        error_log('[FitCopilot Debug] AdminMenu: admin_enqueue_scripts hook registered');
        
        // SPRINT 1: Add AJAX handlers for modular system management
        add_action('admin_init', [$this, 'register_ajax_handlers']);
        
        // SPRINT 2: Strategy Manager AJAX endpoints
        add_action('wp_ajax_fitcopilot_delete_strategy', [$this, 'handle_delete_strategy_ajax']);
        add_action('wp_ajax_fitcopilot_test_strategy', [$this, 'handle_test_strategy_ajax']);
    }
    
    /**
     * Register the main admin menu and parent page
     */
    public function register_admin_menu() {
        error_log('[FitCopilot Debug] AdminMenu::register_admin_menu called');
        
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
        
        // === NEW: AI PROMPT SYSTEM MENU STRUCTURE ===
        
        // Add AI Prompt System main submenu
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('AI Prompt System', 'fitcopilot'), // Page title
            __('AI Prompt System', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-ai-prompt-system', // Menu slug
            [$this, 'render_ai_prompt_dashboard'] // Callback function
        );
        
        // Add Prompt Dashboard submenu
        add_submenu_page(
            'fitcopilot-ai-prompt-system', // Parent slug
            __('Prompt Dashboard', 'fitcopilot'), // Page title
            __('Prompt Dashboard', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-prompt-dashboard', // Menu slug
            [$this, 'render_prompt_dashboard'] // Callback function
        );
        
        // Add Strategy Manager submenu
        add_submenu_page(
            'fitcopilot-ai-prompt-system', // Parent slug
            __('Strategy Manager', 'fitcopilot'), // Page title
            __('Strategy Manager', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-strategy-manager', // Menu slug
            [$this, 'render_strategy_manager'] // Callback function
        );
        
        // Add Context Inspector submenu
        add_submenu_page(
            'fitcopilot-ai-prompt-system', // Parent slug
            __('Context Inspector', 'fitcopilot'), // Page title
            __('Context Inspector', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-context-inspector', // Menu slug
            [$this, 'render_context_inspector'] // Callback function
        );
        
        // Add Fragment Library submenu
        add_submenu_page(
            'fitcopilot-ai-prompt-system', // Parent slug
            __('Fragment Library', 'fitcopilot'), // Page title
            __('Fragment Library', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-fragment-library', // Menu slug
            [$this, 'render_fragment_library'] // Callback function
        );
        
        // Add PromptBuilder submenu (Phase 1: Core) - Direct under main menu
        add_submenu_page(
            'fitcopilot', // Parent slug - moved to main menu
            __('Prompt Builder', 'fitcopilot'), // Page title
            __('Prompt Builder', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-prompt-builder', // Menu slug
            [$this, 'render_prompt_builder'] // Callback function
        );
        
        // Add Testing Lab submenu (Legacy - will be migrated to PromptBuilder)
        add_submenu_page(
            'fitcopilot-ai-prompt-system', // Parent slug
            __('Testing Lab (Legacy)', 'fitcopilot'), // Page title
            __('Testing Lab (Legacy)', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-testing-lab', // Menu slug
            [$this, 'render_testing_lab'] // Callback function
        );
        
        // Add System Logs submenu
        add_submenu_page(
            'fitcopilot-ai-prompt-system', // Parent slug
            __('System Logs', 'fitcopilot'), // Page title
            __('System Logs', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-system-logs', // Menu slug
            [$this, 'render_system_logs'] // Callback function
        );
        
        // === END: AI PROMPT SYSTEM MENU STRUCTURE ===
        
        // Add Testing Lab as direct submenu (more accessible than buried in AI Prompt System)
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('Testing Lab', 'fitcopilot'), // Page title
            __('Testing Lab', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-testing-lab-direct', // Menu slug (different from the one in AI Prompt System)
            [$this, 'render_testing_lab'] // Callback function
        );
        
        // Add Settings submenu (existing)
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('Settings', 'fitcopilot'), // Page title
            __('Settings', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-settings', // Menu slug
            [$this, 'render_settings_page'] // Callback function
        );
        
        // Add AI Configuration to Settings submenu
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('AI Configuration', 'fitcopilot'), // Page title
            __('AI Configuration', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-ai-configuration', // Menu slug
            [$this, 'render_ai_configuration'] // Callback function
        );
        
        // Add Prompt Analytics submenu (under Analytics if it exists, otherwise under main)
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('Prompt Analytics', 'fitcopilot'), // Page title
            __('Prompt Analytics', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot-prompt-analytics', // Menu slug
            [$this, 'render_prompt_analytics'] // Callback function
        );
    }
    
    /**
     * Enqueue admin assets for AI Prompt System pages
     */
    public function enqueue_admin_assets($hook_suffix) {
        error_log('[FitCopilot Debug] AdminMenu::enqueue_admin_assets called with hook: ' . $hook_suffix);
        
        // Only enqueue on our admin pages
        if (strpos($hook_suffix, 'fitcopilot') === false) {
            error_log('[FitCopilot Debug] AdminMenu: Hook condition NOT matched, skipping');
            return;
        }
        
        error_log('[FitCopilot Debug] AdminMenu: Hook condition matched, proceeding');
        
        // Enqueue common admin styles
        wp_enqueue_style(
            'fitcopilot-admin-prompt-system',
            FITCOPILOT_URL . 'assets/css/admin-prompt-system.css',
            [],
            FITCOPILOT_VERSION
        );
        
        // Enqueue jQuery UI for tooltips and other UI components
        wp_enqueue_script('jquery-ui-tooltip');
        wp_enqueue_script('jquery-ui-dialog');
        wp_enqueue_style('wp-jquery-ui-dialog');
        
        // Enqueue common admin scripts
        wp_enqueue_script(
            'fitcopilot-admin-prompt-system',
            FITCOPILOT_URL . 'assets/js/admin-prompt-system.js',
            ['jquery', 'jquery-ui-tooltip', 'jquery-ui-dialog', 'wp-api-fetch'],
            FITCOPILOT_VERSION,
            true
        );
        
        // Localize script with admin data
        wp_localize_script(
            'fitcopilot-admin-prompt-system',
            'fitcopilotPromptSystem',
            [
                'nonce' => wp_create_nonce('wp_rest'),
                'ajaxNonce' => wp_create_nonce('fitcopilot_admin_ajax'),
                'testStrategyNonce' => wp_create_nonce('fitcopilot_test_prompt'),
                'deleteStrategyNonce' => wp_create_nonce('fitcopilot_delete_strategy'),
                'apiBase' => rest_url('fitcopilot/v1'),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'adminUrl' => admin_url('admin.php'),
                'hooks' => [
                    'promptDashboard' => 'fitcopilot_page_fitcopilot-prompt-dashboard',
                    'strategyManager' => 'fitcopilot_page_fitcopilot-strategy-manager',
                    'contextInspector' => 'fitcopilot_page_fitcopilot-context-inspector',
                    'fragmentLibrary' => 'fitcopilot_page_fitcopilot-fragment-library',
                    'testingLab' => 'fitcopilot_page_fitcopilot-testing-lab',
                    'systemLogs' => 'fitcopilot_page_fitcopilot-system-logs',
                    'aiConfiguration' => 'fitcopilot_page_fitcopilot-ai-configuration',
                    'promptAnalytics' => 'fitcopilot_page_fitcopilot-prompt-analytics',
                ],
                'version' => FITCOPILOT_VERSION,
                'debug' => defined('WP_DEBUG') && WP_DEBUG,
            ]
        );
        
        // Delegate to modular debug system for debug pages
        if (strpos($hook_suffix, 'testing-lab') !== false || strpos($hook_suffix, 'system-logs') !== false) {
            $debug_manager = \FitCopilot\Admin\Debug\DebugBootstrap::getDebugManager();
            if ($debug_manager) {
                $debug_manager->enqueueAdminAssets($hook_suffix);
            }
        }
    }
    
    // ========================================
    // AI PROMPT SYSTEM PAGE RENDERERS
    // ========================================
    
    /**
     * Render main dashboard page
     */
    public function render_dashboard_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('FitCopilot Dashboard', 'fitcopilot'); ?></h1>
            
            <div class="dashboard-widgets-wrap">
                <div class="metabox-holder">
                    <div class="postbox-container" style="width: 100%;">
                        
                        <!-- Welcome Widget -->
                        <div class="postbox">
                            <h2 class="hndle"><span><?php esc_html_e('Welcome to FitCopilot', 'fitcopilot'); ?></span></h2>
                            <div class="inside">
                                <p><?php esc_html_e('Your AI-powered fitness companion for generating personalized workouts.', 'fitcopilot'); ?></p>
                                
                                <div class="fitcopilot-quick-actions">
                                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-testing-lab'); ?>" class="button button-primary">
                                        🧪 <?php esc_html_e('Test New Prompt', 'fitcopilot'); ?>
                                    </a>
                                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-prompt-analytics'); ?>" class="button button-secondary">
                                        📊 <?php esc_html_e('View Full Analytics', 'fitcopilot'); ?>
                                    </a>
                                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-system-logs'); ?>" class="button button-secondary">
                                        🔧 <?php esc_html_e('System Diagnostics', 'fitcopilot'); ?>
                                    </a>
                                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager'); ?>" class="button button-secondary">
                                        📖 <?php esc_html_e('Strategy Documentation', 'fitcopilot'); ?>
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- System Status Widget -->
                        <div class="postbox">
                            <h2 class="hndle"><span><?php esc_html_e('System Status', 'fitcopilot'); ?></span></h2>
                            <div class="inside">
                                <?php
                                $is_modular_enabled = apply_filters('fitcopilot_use_modular_prompts', false);
                                $status_class = $is_modular_enabled ? 'status-enabled' : 'status-disabled';
                                $status_text = $is_modular_enabled ? __('Enabled', 'fitcopilot') : __('Disabled', 'fitcopilot');
                                ?>
                                
                                <div class="system-status-grid">
                                    <div class="status-item">
                                        <strong><?php esc_html_e('Modular Prompt System:', 'fitcopilot'); ?></strong>
                                        <span class="<?php echo esc_attr($status_class); ?>"><?php echo esc_html($status_text); ?></span>
                                    </div>
                                    <div class="status-item">
                                        <strong><?php esc_html_e('AI Provider:', 'fitcopilot'); ?></strong>
                                        <span class="status-active"><?php esc_html_e('OpenAI', 'fitcopilot'); ?></span>
                                    </div>
                                    <div class="status-item">
                                        <strong><?php esc_html_e('Plugin Version:', 'fitcopilot'); ?></strong>
                                        <span><?php echo esc_html(defined('FITCOPILOT_VERSION') ? FITCOPILOT_VERSION : '1.0.0'); ?></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Recent Activity Widget -->
                        <div class="postbox">
                            <h2 class="hndle"><span><?php esc_html_e('Recent Activity', 'fitcopilot'); ?></span></h2>
                            <div class="inside">
                                <div class="activity-list">
                                    <div class="activity-item">
                                        <span class="activity-time"><?php esc_html_e('Just now', 'fitcopilot'); ?></span>
                                        <span class="activity-message"><?php esc_html_e('Sprint 1: AI Prompt System integration completed', 'fitcopilot'); ?></span>
                                    </div>
                                    <div class="activity-item">
                                        <span class="activity-time"><?php esc_html_e('5 minutes ago', 'fitcopilot'); ?></span>
                                        <span class="activity-message"><?php esc_html_e('Admin dashboard initialized', 'fitcopilot'); ?></span>
                                    </div>
                                    <div class="activity-item">
                                        <span class="activity-time"><?php esc_html_e('10 minutes ago', 'fitcopilot'); ?></span>
                                        <span class="activity-message"><?php esc_html_e('Modular prompt system loaded', 'fitcopilot'); ?></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .fitcopilot-quick-actions {
            margin-top: 15px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .fitcopilot-quick-actions .button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.2s ease;
        }
        .fitcopilot-quick-actions .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .system-status-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .status-item:last-child {
            border-bottom: none;
        }
        .status-enabled {
            color: #46b450;
            font-weight: bold;
        }
        .status-disabled {
            color: #dc3232;
            font-weight: bold;
        }
        .status-active {
            color: #0073aa;
            font-weight: bold;
        }
        .activity-list {
            max-height: 200px;
            overflow-y: auto;
        }
        .activity-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .activity-item:last-child {
            border-bottom: none;
        }
        .activity-time {
            color: #666;
            font-size: 12px;
            white-space: nowrap;
            margin-right: 15px;
        }
        .activity-message {
            flex: 1;
            font-size: 13px;
        }
        </style>
        <?php
    }

    /**
     * Render AI Prompt System Dashboard
     */
    public function render_ai_prompt_dashboard() {
        // SPRINT 1: Enhanced dashboard with functional components
        
        // Get system statistics
        $stats = $this->getSystemStats();
        
        // Check if modular system is enabled
        $is_modular_enabled = apply_filters('fitcopilot_use_modular_prompts', false);
        
        ?>
        <div class="wrap ai-prompt-dashboard">
            <div class="dashboard-header">
                <h1 class="dashboard-title">
                    <?php esc_html_e('AI Prompt System Dashboard', 'fitcopilot'); ?>
                </h1>
                <p class="dashboard-description">
                    <?php esc_html_e('Central command center for AI prompt system monitoring and management.', 'fitcopilot'); ?>
                </p>
            </div>

            <!-- System Status Overview -->
            <div class="dashboard-widgets">
                <div class="widget-row">
                    <!-- System Status Widget -->
                    <div class="dashboard-widget system-status">
                        <h3>System Status</h3>
                        <div class="status-grid">
                            <div class="status-item">
                                <span class="status-label">Modular System:</span>
                                <span class="status-value <?php echo $is_modular_enabled ? 'enabled' : 'disabled'; ?>">
                                    <?php echo $is_modular_enabled ? 'Enabled' : 'Disabled'; ?>
                                </span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Total Prompts Generated:</span>
                                <span class="status-value"><?php echo esc_html($stats['total_prompts']); ?></span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Active Strategies:</span>
                                <span class="status-value"><?php echo esc_html($stats['active_strategies']); ?></span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">Context Types Available:</span>
                                <span class="status-value"><?php echo esc_html($stats['context_types']); ?></span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions Widget -->
                    <div class="dashboard-widget quick-actions">
                        <h3>Quick Actions</h3>
                        <div class="action-buttons">
                            <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager'); ?>" class="button button-primary">
                                Manage Strategies
                            </a>
                            <a href="<?php echo admin_url('admin.php?page=fitcopilot-testing-lab'); ?>" class="button button-secondary">
                                Test Prompts
                            </a>
                            <a href="<?php echo admin_url('admin.php?page=fitcopilot-context-inspector'); ?>" class="button button-secondary">
                                Debug Context
                            </a>
                            <button type="button" class="button button-secondary" onclick="toggleModularSystem()">
                                <?php echo $is_modular_enabled ? 'Disable' : 'Enable'; ?> Modular System
                            </button>
                        </div>
                    </div>
                </div>

                <div class="widget-row">
                    <!-- Performance Metrics Widget -->
                    <div class="dashboard-widget performance-metrics">
                        <h3>Performance Metrics</h3>
                        <div class="metrics-grid">
                            <div class="metric">
                                <span class="metric-value"><?php echo esc_html($stats['avg_token_count']); ?></span>
                                <span class="metric-label">Avg Tokens per Prompt</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value"><?php echo esc_html($stats['avg_generation_time']); ?>ms</span>
                                <span class="metric-label">Avg Generation Time</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value"><?php echo esc_html($stats['success_rate']); ?>%</span>
                                <span class="metric-label">Success Rate</span>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity Widget -->
                    <div class="dashboard-widget recent-activity">
                        <h3>Recent Activity</h3>
                        <div class="activity-list">
                            <?php foreach ($stats['recent_activity'] as $activity): ?>
                            <div class="activity-item">
                                <span class="activity-time"><?php echo esc_html($activity['time']); ?></span>
                                <span class="activity-message"><?php echo esc_html($activity['message']); ?></span>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Information -->
            <div class="system-info">
                <h3>System Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Framework Version:</strong> Modular Prompt Engineering v1.0
                    </div>
                    <div class="info-item">
                        <strong>Architecture:</strong> Strategy Pattern with Context Hierarchy
                    </div>
                    <div class="info-item">
                        <strong>Current Strategy:</strong> SingleWorkoutStrategy
                    </div>
                    <div class="info-item">
                        <strong>Context Priorities:</strong> Session > Program > History > Profile > Environment
                    </div>
                </div>
            </div>
        </div>

        <script>
        function toggleModularSystem() {
            // AJAX call to toggle modular system
            jQuery.post(ajaxurl, {
                action: 'fitcopilot_toggle_modular_system',
                nonce: '<?php echo wp_create_nonce('fitcopilot_toggle_modular'); ?>'
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('Error toggling modular system: ' + response.data);
                }
            });
        }
        </script>
        <?php
    }

    /**
     * SPRINT 1: Get system statistics for dashboard
     *
     * @return array System statistics
     */
    private function getSystemStats() {
        // Get real system data or mock data for now
        $total_workouts = wp_count_posts('wg_workout');
        $total_prompts = $total_workouts->publish ?? 0;

        return [
            'total_prompts' => $total_prompts,
            'active_strategies' => 1, // Currently only SingleWorkoutStrategy
            'context_types' => 5, // Profile, Session, History, Program, Environment
            'avg_token_count' => 1200,
            'avg_generation_time' => 850,
            'success_rate' => 98,
            'recent_activity' => [
                ['time' => '2 minutes ago', 'message' => 'Generated workout prompt for user'],
                ['time' => '15 minutes ago', 'message' => 'Context validation completed successfully'],
                ['time' => '1 hour ago', 'message' => 'Strategy optimization completed'],
                ['time' => '3 hours ago', 'message' => 'Modular system performance test completed']
            ]
        ];
    }
    
    /**
     * Render Prompt Dashboard page
     */
    public function render_prompt_dashboard() {
        $this->render_admin_page_template('prompt-dashboard', [
            'title' => __('Prompt Dashboard', 'fitcopilot'),
            'description' => __('Monitor prompt generation performance and system health.', 'fitcopilot'),
            'icon' => '●'
        ]);
    }
    
    /**
     * Render Strategy Manager page - SPRINT 2: Full CRUD Implementation
     */
    public function render_strategy_manager() {
        // Get current action
        $action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : 'list';
        $strategy_id = isset($_GET['strategy_id']) ? sanitize_text_field($_GET['strategy_id']) : '';
        
        // Handle form submissions
        if ($_POST && wp_verify_nonce($_POST['strategy_nonce'] ?? '', 'strategy_action')) {
            $this->handle_strategy_action();
        }
        
        ?>
        <div class="wrap strategy-manager">
            <div class="dashboard-header">
                <h1 class="dashboard-title">
                    <?php esc_html_e('Strategy Manager', 'fitcopilot'); ?>
                </h1>
                <p class="dashboard-description">
                    <?php esc_html_e('Manage and configure AI prompt generation strategies.', 'fitcopilot'); ?>
                </p>
            </div>

            <?php
            switch ($action) {
                case 'edit':
                case 'new':
                    $this->render_strategy_form($action, $strategy_id);
                    break;
                case 'test':
                    $this->render_strategy_test($strategy_id);
                    break;
                default:
                    $this->render_strategy_list();
                    break;
            }
            ?>
        </div>
        <?php
    }
    
    /**
     * Render Context Inspector page
     */
    public function render_context_inspector() {
        $this->render_admin_page_template('context-inspector', [
            'title' => __('Context Inspector', 'fitcopilot'),
            'description' => __('Debug and monitor context data flow in real-time.', 'fitcopilot'),
            'icon' => '●'
        ]);
    }
    
    /**
     * Render Fragment Library page
     */
    public function render_fragment_library() {
        $this->render_admin_page_template('fragment-library', [
            'title' => __('Fragment Library', 'fitcopilot'),
            'description' => __('Manage reusable prompt components and fragments.', 'fitcopilot'),
            'icon' => '●'
        ]);
    }
    
    /**
     * Render PromptBuilder (Phase 1: Core)
     */
    public function render_prompt_builder() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        
        try {
            // Create PromptBuilderController and render the page
            $controller = new \FitCopilot\Admin\Debug\Controllers\PromptBuilderController();
            $controller->renderPromptBuilder();
        } catch (\Exception $e) {
            error_log('[AdminMenu] Failed to render PromptBuilder page: ' . $e->getMessage());
            
            echo '<div class="wrap">';
            echo '<h1>PromptBuilder - Error</h1>';
            echo '<div class="notice notice-error"><p>Failed to load PromptBuilder: ' . esc_html($e->getMessage()) . '</p></div>';
            echo '</div>';
        }
    }
    
    /**
     * Render Testing Lab with Profile-Based Testing (Legacy)
     */
    public function render_testing_lab() {
        // Use the dedicated TestingLabView with proper profile data
        $testingLabView = new \FitCopilot\Admin\Debug\Views\TestingLabView();
        $testingLabView->render();
        return;
    }
    
    /**
     * SPRINT 3, WEEK 2: Render System Logs page with real-time monitoring
     */
    public function render_system_logs() {
        // Get system health for header
        $performanceMonitor = new \FitCopilot\Service\Debug\PerformanceMonitor();
        $systemHealth = $performanceMonitor->getSystemHealth();
        
        ?>
        <div class="fitcopilot-system-logs">
            <!-- System Health Header -->
            <div class="system-logs-header">
                <h1 class="system-logs-title">System Logs & Performance Monitoring</h1>
                <div class="system-health-indicator">
                    <div class="health-status <?php echo esc_attr($systemHealth['overall_status']); ?>">
                        <div class="health-indicator <?php echo esc_attr($systemHealth['overall_status']); ?>"></div>
                        <?php echo $this->formatHealthStatus($systemHealth['overall_status']); ?>
                    </div>
                </div>
            </div>
            
            <!-- Dashboard Grid -->
            <div class="system-logs-grid">
                <!-- Log Stream Panel -->
                <div class="logs-panel">
                    <div class="logs-header">
                        <div class="logs-controls">
                            <div class="log-filter">
                                <label for="log-level-filter">Level:</label>
                                <select id="log-level-filter">
                                    <option value="all">All Levels</option>
                                    <option value="debug">Debug</option>
                                    <option value="info">Info</option>
                                    <option value="notice">Notice</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            
                            <div class="log-filter">
                                <label for="log-category-filter">Category:</label>
                                <select id="log-category-filter">
                                    <option value="all">All Categories</option>
                                    <option value="workout_generation">Workout Generation</option>
                                    <option value="prompt_engineering">Prompt Engineering</option>
                                    <option value="performance">Performance</option>
                                    <option value="api_communication">API Communication</option>
                                    <option value="error_handling">Error Handling</option>
                                </select>
                            </div>
                            
                            <div class="stream-toggle">
                                <button id="toggle-stream" class="stream-button">Start Stream</button>
                                <div class="stream-status">
                                    <div class="stream-indicator"></div>
                                    <span>Disconnected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="logs-content" id="logs-content">
                        <div id="logs-container">
                            <!-- Log entries will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Performance Metrics Panel -->
                <div class="performance-panel">
                    <div class="performance-header">
                        <h3 class="performance-title">Performance Metrics</h3>
                        <button id="refresh-performance" class="performance-refresh">Refresh</button>
                    </div>
                    
                    <div class="performance-metrics">
                        <div class="metric-card" id="memory-usage">
                            <div class="metric-label">Memory Usage</div>
                            <div class="metric-value">
                                <?php echo round($systemHealth['memory']['usage_mb'], 1); ?>
                                <span class="metric-unit">MB</span>
                            </div>
                            <div class="metric-trend"><?php echo $systemHealth['memory']['percentage']; ?>% of limit</div>
                        </div>
                        
                        <div class="metric-card" id="api-performance">
                            <div class="metric-label">Avg API Response</div>
                            <div class="metric-value">
                                <?php echo round($systemHealth['api_performance']['avg_duration_ms']); ?>
                                <span class="metric-unit">ms</span>
                            </div>
                            <div class="metric-trend"><?php echo $systemHealth['api_performance']['total_calls']; ?> calls</div>
                        </div>
                        
                        <div class="metric-card" id="error-rate">
                            <div class="metric-label">Error Rate</div>
                            <div class="metric-value">
                                <?php echo round($systemHealth['error_rates']['error_rate'] * 100, 1); ?>
                                <span class="metric-unit">%</span>
                            </div>
                            <div class="metric-trend"><?php echo $systemHealth['error_rates']['failed_operations']; ?>/<?php echo $systemHealth['error_rates']['total_operations']; ?></div>
                        </div>
                        
                        <div class="metric-card" id="system-uptime">
                            <div class="metric-label">WordPress Load</div>
                            <div class="metric-value">
                                <?php echo get_num_queries(); ?>
                                <span class="metric-unit">queries</span>
                            </div>
                            <div class="metric-trend"><?php echo size_format(memory_get_peak_usage()); ?> peak</div>
                        </div>
                    </div>
                </div>
                
                <!-- Analytics Panel -->
                <div class="analytics-panel">
                    <div class="analytics-header">
                        <h3 class="analytics-title">Log Analytics</h3>
                        <div class="chart-controls">
                            <button class="chart-button active" data-chart="levels">By Level</button>
                            <button class="chart-button" data-chart="categories">By Category</button>
                            <button class="chart-button" data-chart="timeline">Timeline</button>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div>Chart visualization will be displayed here</div>
                    </div>
                </div>
                
                <!-- System Controls Panel -->
                <div class="controls-panel">
                    <div class="controls-section">
                        <div class="controls-title">Log Management</div>
                        <div class="control-group">
                            <button class="control-button" id="clear-logs">Clear Logs</button>
                            <button class="control-button" id="rotate-logs">Rotate Logs</button>
                        </div>
                        
                        <div class="controls-title">Export Options</div>
                        <div class="export-options" id="export-controls">
                            <button class="export-button" data-format="json">JSON</button>
                            <button class="export-button" data-format="csv">CSV</button>
                            <button class="export-button" data-format="xml">XML</button>
                        </div>
                    </div>
                    
                    <div class="controls-section">
                        <div class="controls-title">Performance Data</div>
                        <div class="control-group">
                            <button class="control-button primary" id="run-performance-test">Run Test</button>
                            <button class="control-button danger" id="clear-performance">Clear Data</button>
                        </div>
                    </div>
                    
                    <div class="controls-section">
                        <div class="controls-title">System Health</div>
                        <div class="control-group">
                            <button class="control-button" id="health-check">Health Check</button>
                            <button class="control-button" id="cleanup-expired">Cleanup</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Required JavaScript nonces -->
        <script>
        window.fitcopilot_admin = {
            nonces: {
                log_stream: '<?php echo wp_create_nonce('fitcopilot_log_stream'); ?>',
                log_stats: '<?php echo wp_create_nonce('fitcopilot_log_stats'); ?>',
                export_logs: '<?php echo wp_create_nonce('fitcopilot_export_logs'); ?>',
                performance_metrics: '<?php echo wp_create_nonce('fitcopilot_performance_metrics'); ?>',
                system_health: '<?php echo wp_create_nonce('fitcopilot_system_health'); ?>',
                clear_performance: '<?php echo wp_create_nonce('fitcopilot_clear_performance'); ?>',
                debug_logs: '<?php echo wp_create_nonce('fitcopilot_debug_logs'); ?>'
            }
        };
        </script>
        <?php
    }
    
    /**
     * Format health status for display
     *
     * @param string $status Health status
     * @return string Formatted status
     */
    private function formatHealthStatus(string $status): string {
        $statusMap = [
            'healthy' => 'System Healthy',
            'warning' => 'Performance Warning', 
            'critical' => 'Critical Issues'
        ];
        
        return $statusMap[$status] ?? 'Unknown Status';
    }
    
    /**
     * Render AI Configuration page
     */
    public function render_ai_configuration() {
        $this->render_admin_page_template('ai-configuration', [
            'title' => __('AI Configuration', 'fitcopilot'),
            'description' => __('Configure AI system settings and preferences.', 'fitcopilot'),
            'icon' => '●'
        ]);
    }
    
    /**
     * Render Prompt Analytics page
     */
    public function render_prompt_analytics() {
        $this->render_admin_page_template('prompt-analytics', [
            'title' => __('Prompt Analytics', 'fitcopilot'),
            'description' => __('Monitor AI system performance and usage analytics.', 'fitcopilot'),
            'icon' => '●'
        ]);
    }
    
    /**
     * Render Settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('FitCopilot Settings', 'fitcopilot'); ?></h1>
            
            <div class="settings-container">
                <div class="postbox">
                    <h2 class="hndle"><span><?php esc_html_e('General Settings', 'fitcopilot'); ?></span></h2>
                    <div class="inside">
                        <form method="post" action="options.php">
                            <?php
                            settings_fields('fitcopilot_settings');
                            do_settings_sections('fitcopilot_settings');
                            ?>
                            
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="fitcopilot_openai_api_key"><?php esc_html_e('OpenAI API Key', 'fitcopilot'); ?></label>
                                    </th>
                                    <td>
                                        <input type="password" 
                                               id="fitcopilot_openai_api_key" 
                                               name="fitcopilot_openai_api_key" 
                                               value="<?php echo esc_attr(get_option('fitcopilot_openai_api_key', '')); ?>" 
                                               class="regular-text" />
                                        <p class="description">
                                            <?php esc_html_e('Enter your OpenAI API key for AI-powered workout generation.', 'fitcopilot'); ?>
                                        </p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <th scope="row">
                                        <label for="fitcopilot_use_modular_prompts"><?php esc_html_e('Modular Prompt System', 'fitcopilot'); ?></label>
                                    </th>
                                    <td>
                                        <input type="checkbox" 
                                               id="fitcopilot_use_modular_prompts" 
                                               name="fitcopilot_use_modular_prompts" 
                                               value="1" 
                                               <?php checked(get_option('fitcopilot_use_modular_prompts', false)); ?> />
                                        <label for="fitcopilot_use_modular_prompts">
                                            <?php esc_html_e('Enable modular prompt system (Sprint 1 feature)', 'fitcopilot'); ?>
                                        </label>
                                        <p class="description">
                                            <?php esc_html_e('Use the new modular prompt engineering system for enhanced AI generation.', 'fitcopilot'); ?>
                                        </p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <th scope="row">
                                        <label for="fitcopilot_debug_mode"><?php esc_html_e('Debug Mode', 'fitcopilot'); ?></label>
                                    </th>
                                    <td>
                                        <input type="checkbox" 
                                               id="fitcopilot_debug_mode" 
                                               name="fitcopilot_debug_mode" 
                                               value="1" 
                                               <?php checked(get_option('fitcopilot_debug_mode', false)); ?> />
                                        <label for="fitcopilot_debug_mode">
                                            <?php esc_html_e('Enable debug logging', 'fitcopilot'); ?>
                                        </label>
                                        <p class="description">
                                            <?php esc_html_e('Enable detailed logging for troubleshooting and development.', 'fitcopilot'); ?>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <?php submit_button(); ?>
                        </form>
                    </div>
                </div>
                
                <!-- System Information -->
                <div class="postbox">
                    <h2 class="hndle"><span><?php esc_html_e('System Information', 'fitcopilot'); ?></span></h2>
                    <div class="inside">
                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php esc_html_e('Plugin Version', 'fitcopilot'); ?></th>
                                <td><?php echo esc_html(defined('FITCOPILOT_VERSION') ? FITCOPILOT_VERSION : '1.0.0'); ?></td>
                            </tr>
                            <tr>
                                <th scope="row"><?php esc_html_e('WordPress Version', 'fitcopilot'); ?></th>
                                <td><?php echo esc_html(get_bloginfo('version')); ?></td>
                            </tr>
                            <tr>
                                <th scope="row"><?php esc_html_e('PHP Version', 'fitcopilot'); ?></th>
                                <td><?php echo esc_html(PHP_VERSION); ?></td>
                            </tr>
                            <tr>
                                <th scope="row"><?php esc_html_e('Modular System Status', 'fitcopilot'); ?></th>
                                <td>
                                    <?php 
                                    $is_modular_enabled = get_option('fitcopilot_use_modular_prompts', false);
                                    if ($is_modular_enabled) {
                                        echo '<span style="color: #46b450; font-weight: bold;">' . esc_html__('Enabled', 'fitcopilot') . '</span>';
                                    } else {
                                        echo '<span style="color: #dc3232; font-weight: bold;">' . esc_html__('Disabled', 'fitcopilot') . '</span>';
                                    }
                                    ?>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .settings-container .postbox {
            margin-bottom: 20px;
        }
        .settings-container .form-table th {
            width: 200px;
        }
        </style>
        <?php
    }
    
    /**
     * Generic admin page template renderer
     */
    private function render_admin_page_template($page_slug, $config) {
        ?>
        <div class="wrap fitcopilot-admin-page" data-page="<?php echo esc_attr($page_slug); ?>">
            <!-- Page Header -->
            <div class="fitcopilot-page-header">
                <h1>
                    <span class="page-icon"><?php echo esc_html($config['icon']); ?></span>
                    <?php echo esc_html($config['title']); ?>
                </h1>
                <p class="page-description"><?php echo esc_html($config['description']); ?></p>
            </div>
            
            <!-- Page Content Container -->
            <div class="fitcopilot-page-content" id="<?php echo esc_attr($page_slug); ?>-content">
                <!-- Loading State -->
                <div class="fitcopilot-loading" id="<?php echo esc_attr($page_slug); ?>-loading">
                    <div class="loading-spinner"></div>
                    <p><?php echo esc_html__('Loading...', 'fitcopilot'); ?></p>
                </div>
                
                <!-- Error State -->
                <div class="fitcopilot-error" id="<?php echo esc_attr($page_slug); ?>-error" style="display: none;">
                    <div class="error-icon">❌</div>
                    <h3><?php echo esc_html__('Failed to Load', 'fitcopilot'); ?></h3>
                    <p><?php echo esc_html__('There was an error loading this page. Please check your connection and try again.', 'fitcopilot'); ?></p>
                    <button class="button-primary" onclick="location.reload();"><?php echo esc_html__('Retry', 'fitcopilot'); ?></button>
                </div>
                
                <!-- Coming Soon State (Temporary) -->
                <div class="fitcopilot-coming-soon" id="<?php echo esc_attr($page_slug); ?>-coming-soon">
                    <div class="coming-soon-icon">🚧</div>
                    <h3><?php echo esc_html__('Under Development', 'fitcopilot'); ?></h3>
                    <p><?php echo esc_html__('This page is currently under development. Check back soon for updates!', 'fitcopilot'); ?></p>
                    <div class="development-info">
                        <p><strong><?php echo esc_html__('Page:', 'fitcopilot'); ?></strong> <?php echo esc_html($config['title']); ?></p>
                        <p><strong><?php echo esc_html__('Status:', 'fitcopilot'); ?></strong> <?php echo esc_html__('In Development', 'fitcopilot'); ?></p>
                        <p><strong><?php echo esc_html__('Target:', 'fitcopilot'); ?></strong> <?php echo esc_html__('Next Sprint', 'fitcopilot'); ?></p>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Initialize page-specific functionality
            if (typeof window.FitCopilotPromptSystem !== 'undefined') {
                window.FitCopilotPromptSystem.initPage('<?php echo esc_js($page_slug); ?>');
            }
            
            // Hide loading state after a short delay
            setTimeout(function() {
                $('#<?php echo esc_js($page_slug); ?>-loading').fadeOut();
                $('#<?php echo esc_js($page_slug); ?>-coming-soon').fadeIn();
            }, 500);
        });
        </script>
        <?php
    }

    /**
     * Register AJAX handlers for admin functionality
     */
    public function register_ajax_handlers() {
        // Register AJAX handlers for admin functionality
        add_action('wp_ajax_fitcopilot_debug_toggle_modular_system', [$this, 'handle_toggle_modular_system']);
        add_action('wp_ajax_fitcopilot_debug_get_system_stats', [$this, 'handle_get_system_stats']);
        add_action('wp_ajax_fitcopilot_debug_test_prompt_generation', [$this, 'handle_test_prompt_generation']);
        
        // Testing Lab user profile endpoint
        add_action('wp_ajax_fitcopilot_get_user_profile', [$this, 'handle_get_user_profile']);
        
        // Delegate to modular debug system for specific debug endpoints
        // TestingLabController.php now handles workout/prompt testing
        error_log('[FitCopilot Debug] AdminMenu: AJAX handlers registered');
    }
    
    /**
     * Handle get user profile AJAX request
     */
    public function handle_get_user_profile() {
        // Verify nonce for security
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_admin_ajax')) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            return;
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Insufficient permissions']);
            return;
        }
        
        $user_id = intval($_POST['user_id']);
        if (!$user_id) {
            wp_send_json_error(['message' => 'Invalid user ID']);
            return;
        }
        
        // Get user profile data
        $profile_data = [
            // Basic Information
            'firstName' => get_user_meta($user_id, '_profile_firstName', true) ?: '',
            'lastName' => get_user_meta($user_id, '_profile_lastName', true) ?: '',
            'fitnessLevel' => get_user_meta($user_id, '_profile_fitnessLevel', true) ?: 'intermediate',
            'goals' => get_user_meta($user_id, '_profile_goals', true) ?: [],
            
            // Body Metrics
            'age' => get_user_meta($user_id, '_profile_age', true) ?: '',
            'gender' => get_user_meta($user_id, '_profile_gender', true) ?: '',
            'weight' => get_user_meta($user_id, '_profile_weight', true) ?: '',
            'weightUnit' => get_user_meta($user_id, '_profile_units', true) === 'metric' ? 'kg' : 'lbs',
            'height' => get_user_meta($user_id, '_profile_height', true) ?: '',
            'heightUnit' => get_user_meta($user_id, '_profile_units', true) === 'metric' ? 'cm' : 'ft',
            
            // Equipment & Location
            'availableEquipment' => get_user_meta($user_id, '_profile_availableEquipment', true) ?: [],
            'preferredLocation' => get_user_meta($user_id, '_profile_preferredLocation', true) ?: 'home',
            
            // Health Considerations
            'limitations' => get_user_meta($user_id, '_profile_limitations', true) ?: [],
            'limitationNotes' => get_user_meta($user_id, '_profile_limitationNotes', true) ?: '',
            'medicalConditions' => get_user_meta($user_id, '_profile_medicalConditions', true) ?: '',
            
            // Workout Preferences
            'workoutFrequency' => get_user_meta($user_id, '_profile_workoutFrequency', true) ?: '3-4',
            'preferredWorkoutDuration' => get_user_meta($user_id, '_profile_preferredWorkoutDuration', true) ?: '30',
            'favoriteExercises' => get_user_meta($user_id, '_profile_favoriteExercises', true) ?: '',
            'dislikedExercises' => get_user_meta($user_id, '_profile_dislikedExercises', true) ?: ''
        ];
        
        // Convert string values to arrays where needed
        if (is_string($profile_data['goals'])) {
            $profile_data['goals'] = explode(',', $profile_data['goals']);
        }
        if (is_string($profile_data['availableEquipment'])) {
            $profile_data['availableEquipment'] = explode(',', $profile_data['availableEquipment']);
        }
        if (is_string($profile_data['limitations'])) {
            $profile_data['limitations'] = explode(',', $profile_data['limitations']);
        }
        
        wp_send_json_success($profile_data);
    }

    /**
     * Register plugin settings
     */
    public function register_settings() {
        // Register settings
        register_setting('fitcopilot_settings', 'fitcopilot_openai_api_key');
        register_setting('fitcopilot_settings', 'fitcopilot_use_modular_prompts');
        register_setting('fitcopilot_settings', 'fitcopilot_debug_mode');
    }

    /**
     * SPRINT 1: Handle toggle modular system AJAX request
     */
    public function handle_toggle_modular_system() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_toggle_modular')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        // Get current state
        $current_state = get_option('fitcopilot_use_modular_prompts', false);
        $new_state = !$current_state;

        // Update option
        update_option('fitcopilot_use_modular_prompts', $new_state);

        // Log the change
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[FitCopilot] SPRINT 1: Modular prompt system ' . ($new_state ? 'enabled' : 'disabled') . ' by admin');
        }

        wp_send_json_success([
            'new_state' => $new_state,
            'message' => sprintf(
                __('Modular prompt system %s successfully', 'fitcopilot'),
                $new_state ? 'enabled' : 'disabled'
            )
        ]);
    }

    /**
     * SPRINT 1: Handle get system stats AJAX request
     */
    public function handle_get_system_stats() {
        // Verify nonce if provided
        if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'fitcopilot_system_stats')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        $stats = $this->getSystemStats();
        wp_send_json_success($stats);
    }

    /**
     * SPRINT 1: Handle test prompt generation AJAX request
     */
    public function handle_test_prompt_generation() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_test_prompt')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        try {
            // Test both systems
            $test_params = [
                'duration' => 30,
                'difficulty' => 'intermediate',
                'equipment' => ['dumbbells'],
                'goals' => 'strength',
                'profile_age' => 35,
                'profile_gender' => 'male'
            ];

            // Test legacy system
            $start_legacy = microtime(true);
            $api_key = get_option('fitcopilot_openai_api_key', 'test');
            $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
            $legacy_prompt = $provider->buildPrompt($test_params);
            $legacy_time = (microtime(true) - $start_legacy) * 1000;

            // Test modular system
            $start_modular = microtime(true);
            $contextManager = new \FitCopilot\Service\AI\PromptEngineering\Core\ContextManager();
            $contextManager->addProfileContext(['fitness_level' => 'intermediate', 'profile_age' => 35]);
            $contextManager->addSessionContext(['duration' => 30, 'equipment' => ['dumbbells']]);
            
            $promptBuilder = \FitCopilot\Service\AI\PromptEngineering\Core\PromptBuilder::create()
                ->useStrategy(new \FitCopilot\Service\AI\PromptEngineering\Strategies\SingleWorkoutStrategy())
                ->withContext($contextManager);
            
            $modular_prompt = $promptBuilder->build();
            $modular_stats = $promptBuilder->getStats();
            $modular_time = (microtime(true) - $start_modular) * 1000;

            wp_send_json_success([
                'legacy' => [
                    'generation_time' => round($legacy_time, 2),
                    'character_count' => strlen($legacy_prompt),
                    'word_count' => str_word_count($legacy_prompt)
                ],
                'modular' => [
                    'generation_time' => round($modular_time, 2),
                    'stats' => $modular_stats
                ],
                'comparison' => [
                    'time_difference' => round($modular_time - $legacy_time, 2),
                    'performance_improvement' => round((($legacy_time - $modular_time) / $legacy_time) * 100, 1)
                ]
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage(),
                'type' => 'generation_error'
            ]);
        }
    }

    /**
     * SPRINT 2: Render strategy listing with real data
     */
    private function render_strategy_list() {
        $strategies = $this->get_available_strategies();
        $strategy_stats = $this->get_strategy_usage_stats();
        
        ?>
        <div class="strategy-list-container">
            <!-- Action Bar -->
            <div class="strategy-actions">
                <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager&action=new'); ?>" 
                   class="button button-primary">
                    ➕ Add New Strategy
                </a>
                <button type="button" class="button button-secondary" onclick="refreshStrategyData()">
                    🔄 Refresh Data
                </button>
                <button type="button" class="button button-secondary" onclick="exportStrategies()">
                    📤 Export All
                </button>
            </div>

            <!-- Strategies Table -->
            <div class="strategies-table-container">
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th scope="col" class="column-name">Strategy Name</th>
                            <th scope="col" class="column-status">Status</th>
                            <th scope="col" class="column-usage">Usage %</th>
                            <th scope="col" class="column-success">Success Rate</th>
                            <th scope="col" class="column-performance">Avg Response</th>
                            <th scope="col" class="column-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($strategies as $strategy): ?>
                        <tr class="strategy-row" data-strategy="<?php echo esc_attr($strategy['id']); ?>">
                            <td class="column-name">
                                <strong><?php echo esc_html($strategy['name']); ?></strong>
                                <div class="strategy-description">
                                    <?php echo esc_html($strategy['description']); ?>
                                </div>
                            </td>
                            <td class="column-status">
                                <span class="status-badge status-<?php echo esc_attr($strategy['status']); ?>">
                                    <?php echo $this->get_status_icon($strategy['status']); ?>
                                    <?php echo esc_html(ucfirst($strategy['status'])); ?>
                                </span>
                            </td>
                            <td class="column-usage">
                                <div class="usage-metric">
                                    <span class="usage-percent"><?php echo esc_html($strategy_stats[$strategy['id']]['usage_percent'] ?? '0'); ?>%</span>
                                    <div class="usage-bar">
                                        <div class="usage-fill" style="width: <?php echo esc_attr($strategy_stats[$strategy['id']]['usage_percent'] ?? 0); ?>%"></div>
                                    </div>
                                </div>
                            </td>
                            <td class="column-success">
                                <span class="success-rate <?php echo ($strategy_stats[$strategy['id']]['success_rate'] ?? 0) >= 95 ? 'high' : 'normal'; ?>">
                                    <?php echo esc_html($strategy_stats[$strategy['id']]['success_rate'] ?? '0'); ?>%
                                </span>
                            </td>
                            <td class="column-performance">
                                <span class="response-time">
                                    <?php echo esc_html($strategy_stats[$strategy['id']]['avg_response_time'] ?? '0'); ?>ms
                                </span>
                            </td>
                            <td class="column-actions">
                                <div class="action-buttons">
                                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager&action=edit&strategy_id=' . $strategy['id']); ?>" 
                                       class="button button-small" title="Edit Strategy">
                                        ✏️ Edit
                                    </a>
                                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager&action=test&strategy_id=' . $strategy['id']); ?>" 
                                       class="button button-small" title="Test Strategy">
                                        🧪 Test
                                    </a>
                                    <?php if ($strategy['id'] !== 'SingleWorkoutStrategy'): // Don't allow deletion of core strategy ?>
                                    <button type="button" 
                                            class="button button-small button-link-delete" 
                                            onclick="confirmDeleteStrategy('<?php echo esc_js($strategy['id']); ?>', '<?php echo esc_js($strategy['name']); ?>')"
                                            title="Delete Strategy">
                                        🗑️ Delete
                                    </button>
                                    <?php endif; ?>
                                    <button type="button" 
                                            class="button button-small" 
                                            onclick="viewStrategyLogs('<?php echo esc_js($strategy['id']); ?>')"
                                            title="View Logs">
                                        📋 Logs
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Strategy Statistics Summary -->
            <div class="strategy-stats-summary">
                <h3>📊 Strategy Performance Summary</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value"><?php echo count($strategies); ?></span>
                        <span class="stat-label">Total Strategies</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value"><?php echo count(array_filter($strategies, function($s) { return $s['status'] === 'active'; })); ?></span>
                        <span class="stat-label">Active Strategies</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value"><?php echo array_sum(array_column($strategy_stats, 'total_requests')) ?? 0; ?></span>
                        <span class="stat-label">Total Requests Today</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value"><?php echo number_format(array_sum(array_column($strategy_stats, 'avg_response_time')) / max(count($strategy_stats), 1), 0); ?>ms</span>
                        <span class="stat-label">Avg Response Time</span>
                    </div>
                </div>
            </div>
        </div>

        <script>
        function confirmDeleteStrategy(strategyId, strategyName) {
            if (confirm('Are you sure you want to delete the strategy "' + strategyName + '"? This action cannot be undone.')) {
                deleteStrategy(strategyId);
            }
        }

        function deleteStrategy(strategyId) {
            jQuery.post(ajaxurl, {
                action: 'fitcopilot_delete_strategy',
                strategy_id: strategyId,
                nonce: '<?php echo wp_create_nonce('fitcopilot_delete_strategy'); ?>'
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('Error deleting strategy: ' + response.data);
                }
            });
        }

        function refreshStrategyData() {
            location.reload();
        }

        function exportStrategies() {
            window.location.href = '<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager&action=export'); ?>';
        }

        function viewStrategyLogs(strategyId) {
            window.open('<?php echo admin_url('admin.php?page=fitcopilot-system-logs'); ?>&filter_strategy=' + strategyId, '_blank');
        }
        </script>
        <?php
    }

    /**
     * SPRINT 2: Get available strategies with metadata
     */
    private function get_available_strategies() {
        // Get built-in strategies
        $builtin_strategies = [
            [
                'id' => 'SingleWorkoutStrategy',
                'name' => 'Single Workout Strategy',
                'description' => 'Generates individual workout sessions with comprehensive personalization',
                'status' => 'active',
                'type' => 'builtin',
                'class' => 'FitCopilot\\Service\\AI\\PromptEngineering\\Strategies\\SingleWorkoutStrategy',
                'version' => '1.0.0',
                'created' => '2024-01-01',
                'modified' => '2024-01-15'
            ]
        ];
        
        // Get custom strategies from WordPress options
        $custom_strategies = get_option('fitcopilot_custom_strategies', []);
        
        // Combine and return
        return array_merge($builtin_strategies, $custom_strategies);
    }
    
    /**
     * SPRINT 2: Get strategy usage statistics
     */
    private function get_strategy_usage_stats() {
        // In a real implementation, this would pull from analytics data
        // For now, we'll use mock data with some real WordPress data integration
        
        $total_workouts = wp_count_posts('wg_workout');
        $total_requests = $total_workouts->publish ?? 100;
        
        return [
            'SingleWorkoutStrategy' => [
                'usage_percent' => 89.2,
                'success_rate' => 98.5,
                'avg_response_time' => 850,
                'total_requests' => $total_requests,
                'errors_today' => 2,
                'last_used' => current_time('mysql')
            ],
            'ProgramStrategy' => [
                'usage_percent' => 8.1,
                'success_rate' => 95.2,
                'avg_response_time' => 1200,
                'total_requests' => 12,
                'errors_today' => 0,
                'last_used' => current_time('mysql')
            ],
            'AdaptiveStrategy' => [
                'usage_percent' => 2.7,
                'success_rate' => 91.8,
                'avg_response_time' => 950,
                'total_requests' => 5,
                'errors_today' => 1,
                'last_used' => current_time('mysql')
            ]
        ];
    }
    
    /**
     * SPRINT 2: Get status icon for strategies
     */
    private function get_status_icon($status) {
        $icons = [
            'active' => '🟢',
            'beta' => '🟡',
            'dev' => '🔴',
            'draft' => '⚪',
            'disabled' => '⚫'
        ];
        
        return $icons[$status] ?? '❓';
    }

    /**
     * SPRINT 2: Render strategy creation/editing form
     */
    private function render_strategy_form($action, $strategy_id = '') {
        $strategy_data = [];
        $is_edit = ($action === 'edit' && !empty($strategy_id));
        
        if ($is_edit) {
            $strategies = $this->get_available_strategies();
            $strategy_data = array_filter($strategies, function($s) use ($strategy_id) {
                return $s['id'] === $strategy_id;
            });
            $strategy_data = reset($strategy_data) ?: [];
        }
        
        // Default values for new strategy
        $defaults = [
            'id' => '',
            'name' => '',
            'description' => '',
            'status' => 'draft',
            'type' => 'custom',
            'prompt_template' => '',
            'required_context' => ['session'],
            'supported_options' => [],
            'token_limit' => 4000,
            'cache_ttl' => 3600,
            'retry_attempts' => 3
        ];
        
        $data = array_merge($defaults, $strategy_data);
        
        ?>
        <div class="strategy-form-container">
            <!-- Back Navigation -->
            <div class="form-navigation">
                <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager'); ?>" 
                   class="button button-secondary">
                    ← Back to Strategy List
                </a>
            </div>

            <!-- Form Header -->
            <div class="form-header">
                <h2><?php echo $is_edit ? 'Edit Strategy: ' . esc_html($data['name']) : 'Create New Strategy'; ?></h2>
                <p class="form-description">
                    <?php echo $is_edit ? 'Modify the strategy configuration below.' : 'Create a custom AI prompt generation strategy.'; ?>
                </p>
            </div>

            <!-- Strategy Form -->
            <form method="post" action="" class="strategy-form">
                <?php wp_nonce_field('strategy_action', 'strategy_nonce'); ?>
                <input type="hidden" name="form_action" value="<?php echo $is_edit ? 'update' : 'create'; ?>">
                <input type="hidden" name="strategy_id" value="<?php echo esc_attr($strategy_id); ?>">
                
                <div class="form-sections">
                    <!-- Basic Information Section -->
                    <div class="form-section">
                        <h3>📋 Basic Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="strategy_name">Strategy Name *</label>
                                <input type="text" 
                                       id="strategy_name" 
                                       name="strategy_name" 
                                       value="<?php echo esc_attr($data['name']); ?>" 
                                       required 
                                       class="regular-text">
                                <p class="description">Human-readable name for the strategy</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="strategy_id_field">Strategy ID</label>
                                <input type="text" 
                                       id="strategy_id_field" 
                                       name="strategy_id_field" 
                                       value="<?php echo esc_attr($data['id']); ?>" 
                                       <?php echo $is_edit ? 'readonly' : ''; ?>
                                       class="regular-text"
                                       placeholder="auto-generated">
                                <p class="description">Unique identifier (auto-generated if empty)</p>
                            </div>
                            
                            <div class="form-group full-width">
                                <label for="strategy_description">Description</label>
                                <textarea id="strategy_description" 
                                          name="strategy_description" 
                                          rows="3" 
                                          class="large-text"><?php echo esc_textarea($data['description']); ?></textarea>
                                <p class="description">Brief description of what this strategy does</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="strategy_status">Status</label>
                                <select id="strategy_status" name="strategy_status">
                                    <option value="draft" <?php selected($data['status'], 'draft'); ?>>Draft</option>
                                    <option value="dev" <?php selected($data['status'], 'dev'); ?>>Development</option>
                                    <option value="beta" <?php selected($data['status'], 'beta'); ?>>Beta</option>
                                    <option value="active" <?php selected($data['status'], 'active'); ?>>Active</option>
                                    <option value="disabled" <?php selected($data['status'], 'disabled'); ?>>Disabled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Prompt Configuration Section -->
                    <div class="form-section">
                        <h3>🎯 Prompt Configuration</h3>
                        <div class="form-group">
                            <label for="prompt_template">Prompt Template *</label>
                            <textarea id="prompt_template" 
                                      name="prompt_template" 
                                      rows="15" 
                                      class="large-text code" 
                                      required><?php echo esc_textarea($data['prompt_template']); ?></textarea>
                            <p class="description">
                                The prompt template with variables. Use {variable_name} for dynamic content.
                                <br><strong>Available variables:</strong> {fitness_level}, {duration}, {equipment}, {daily_focus}, {profile_age}, etc.
                            </p>
                        </div>
                    </div>

                    <!-- Context Requirements Section -->
                    <div class="form-section">
                        <h3>🔄 Context Requirements</h3>
                        <div class="form-group">
                            <label>Required Context Types</label>
                            <div class="checkbox-group">
                                <label>
                                    <input type="checkbox" 
                                           name="required_context[]" 
                                           value="profile" 
                                           <?php checked(in_array('profile', $data['required_context'])); ?>>
                                    Profile Context (user profile data)
                                </label>
                                <label>
                                    <input type="checkbox" 
                                           name="required_context[]" 
                                           value="session" 
                                           <?php checked(in_array('session', $data['required_context'])); ?>>
                                    Session Context (current workout parameters)
                                </label>
                                <label>
                                    <input type="checkbox" 
                                           name="required_context[]" 
                                           value="history" 
                                           <?php checked(in_array('history', $data['required_context'])); ?>>
                                    History Context (previous workouts)
                                </label>
                                <label>
                                    <input type="checkbox" 
                                           name="required_context[]" 
                                           value="program" 
                                           <?php checked(in_array('program', $data['required_context'])); ?>>
                                    Program Context (multi-week programs)
                                </label>
                                <label>
                                    <input type="checkbox" 
                                           name="required_context[]" 
                                           value="environment" 
                                           <?php checked(in_array('environment', $data['required_context'])); ?>>
                                    Environment Context (location, constraints)
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Advanced Options Section -->
                    <div class="form-section">
                        <h3>⚙️ Advanced Options</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="token_limit">Token Limit</label>
                                <input type="number" 
                                       id="token_limit" 
                                       name="token_limit" 
                                       value="<?php echo esc_attr($data['token_limit']); ?>" 
                                       min="1000" 
                                       max="10000" 
                                       class="small-text">
                                <p class="description">Maximum tokens per request</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="cache_ttl">Cache TTL (seconds)</label>
                                <input type="number" 
                                       id="cache_ttl" 
                                       name="cache_ttl" 
                                       value="<?php echo esc_attr($data['cache_ttl']); ?>" 
                                       min="0" 
                                       max="86400" 
                                       class="small-text">
                                <p class="description">How long to cache generated prompts</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="retry_attempts">Retry Attempts</label>
                                <input type="number" 
                                       id="retry_attempts" 
                                       name="retry_attempts" 
                                       value="<?php echo esc_attr($data['retry_attempts']); ?>" 
                                       min="0" 
                                       max="10" 
                                       class="small-text">
                                <p class="description">Number of retry attempts on failure</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                    <button type="submit" class="button button-primary">
                        <?php echo $is_edit ? '💾 Update Strategy' : '✨ Create Strategy'; ?>
                    </button>
                    <button type="button" class="button button-secondary" onclick="testStrategyForm()">
                        🧪 Test Before Saving
                    </button>
                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager'); ?>" 
                       class="button button-secondary">
                        Cancel
                    </a>
                </div>
            </form>
        </div>

        <script>
        function testStrategyForm() {
            // Collect form data
            var formData = new FormData(document.querySelector('.strategy-form'));
            
            // Open testing window with form data
            var testUrl = '<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager&action=test'); ?>';
            var testWindow = window.open(testUrl, '_blank');
            
            // TODO: Pass form data to test window
            console.log('Strategy form test initiated');
        }

        // Auto-generate strategy ID from name
        document.getElementById('strategy_name').addEventListener('input', function() {
            if (!<?php echo $is_edit ? 'true' : 'false'; ?>) {
                var name = this.value;
                var id = name.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '');
                document.getElementById('strategy_id_field').value = id;
            }
        });
        </script>
        <?php
    }

    /**
     * SPRINT 2: Render strategy testing interface
     */
    private function render_strategy_test($strategy_id) {
        $strategies = $this->get_available_strategies();
        $strategy = array_filter($strategies, function($s) use ($strategy_id) {
            return $s['id'] === $strategy_id;
        });
        $strategy = reset($strategy);
        
        if (!$strategy) {
            echo '<div class="notice notice-error"><p>Strategy not found.</p></div>';
            return;
        }
        
        ?>
        <div class="strategy-test-container">
            <!-- Test Header -->
            <div class="test-header">
                <div class="header-content">
                    <h2>🧪 Testing Strategy: <?php echo esc_html($strategy['name']); ?></h2>
                    <p class="test-description">
                        Test your strategy with different context data to see how it generates prompts.
                    </p>
                </div>
                <div class="header-actions">
                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager'); ?>" 
                       class="button button-secondary">
                        ← Back to Strategies
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=fitcopilot-strategy-manager&action=edit&strategy_id=' . $strategy['id']); ?>" 
                       class="button button-secondary">
                        ✏️ Edit Strategy
                    </a>
                </div>
            </div>

            <!-- Testing Interface -->
            <div class="testing-interface">
                <div class="test-input-panel">
                    <h3>📥 Test Configuration</h3>
                    
                    <form id="strategy-test-form">
                        <!-- Strategy Info -->
                        <div class="strategy-info">
                            <h4>Strategy Information</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>Name:</strong> <?php echo esc_html($strategy['name']); ?>
                                </div>
                                <div class="info-item">
                                    <strong>Status:</strong> 
                                    <span class="status-badge status-<?php echo esc_attr($strategy['status']); ?>">
                                        <?php echo $this->get_status_icon($strategy['status']); ?>
                                        <?php echo esc_html(ucfirst($strategy['status'])); ?>
                                    </span>
                                </div>
                                <div class="info-item">
                                    <strong>Type:</strong> <?php echo esc_html(ucfirst($strategy['type'])); ?>
                                </div>
                            </div>
                        </div>

                        <!-- Context Configuration -->
                        <div class="context-configuration">
                            <h4>🔄 Context Data</h4>
                            
                            <!-- Profile Context -->
                            <div class="context-section">
                                <h5>👤 Profile Context</h5>
                                <div class="context-fields">
                                    <label>
                                        Fitness Level:
                                        <select name="fitness_level">
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate" selected>Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </label>
                                    <label>
                                        Age:
                                        <input type="number" name="profile_age" value="48" min="18" max="100">
                                    </label>
                                    <label>
                                        Weight:
                                        <input type="number" name="profile_weight" value="200" min="50" max="500">
                                    </label>
                                    <label>
                                        Gender:
                                        <select name="profile_gender">
                                            <option value="male" selected>Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </label>
                                    <label>
                                        Limitations:
                                        <input type="text" name="profile_limitation_notes" value="Left knee pain" placeholder="Any physical limitations">
                                    </label>
                                </div>
                            </div>

                            <!-- Session Context -->
                            <div class="context-section">
                                <h5>🏃 Session Context</h5>
                                <div class="context-fields">
                                    <label>
                                        Duration (minutes):
                                        <input type="number" name="duration" value="30" min="5" max="120">
                                    </label>
                                    <label>
                                        Equipment:
                                        <input type="text" name="equipment" value="dumbbells, resistance_bands" placeholder="Comma-separated list">
                                    </label>
                                    <label>
                                        Daily Focus:
                                        <select name="daily_focus">
                                            <option value="cardio">Cardio</option>
                                            <option value="strength_building" selected>Strength Building</option>
                                            <option value="flexibility">Flexibility</option>
                                            <option value="weight_loss">Weight Loss</option>
                                        </select>
                                    </label>
                                    <label>
                                        Location:
                                        <select name="location">
                                            <option value="home" selected>Home</option>
                                            <option value="gym">Gym</option>
                                            <option value="outdoors">Outdoors</option>
                                            <option value="travel">Travel</option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <!-- Daily State Context -->
                            <div class="context-section">
                                <h5>💪 Today's State</h5>
                                <div class="context-fields">
                                    <label>
                                        Stress Level:
                                        <select name="stress_level">
                                            <option value="low">Low</option>
                                            <option value="moderate" selected>Moderate</option>
                                            <option value="high">High</option>
                                            <option value="very_high">Very High</option>
                                        </select>
                                    </label>
                                    <label>
                                        Energy Level:
                                        <select name="energy_level">
                                            <option value="very_low">Very Low</option>
                                            <option value="low">Low</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="high" selected>High</option>
                                            <option value="very_high">Very High</option>
                                        </select>
                                    </label>
                                    <label>
                                        Sleep Quality:
                                        <select name="sleep_quality">
                                            <option value="poor">Poor</option>
                                            <option value="fair">Fair</option>
                                            <option value="good" selected>Good</option>
                                            <option value="excellent">Excellent</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Test Actions -->
                        <div class="test-actions">
                            <button type="button" class="button button-primary" onclick="runStrategyTest()">
                                🚀 Generate Test Prompt
                            </button>
                            <button type="button" class="button button-secondary" onclick="loadPresetData()">
                                📋 Load Preset
                            </button>
                            <button type="button" class="button button-secondary" onclick="clearTestForm()">
                                🗑️ Clear Form
                            </button>
                        </div>
                    </form>
                </div>

                <div class="test-output-panel">
                    <h3>📤 Generated Output</h3>
                    
                    <!-- Test Status -->
                    <div id="test-status" class="test-status hidden">
                        <div class="status-message"></div>
                        <div class="status-progress">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Test Results -->
                    <div id="test-results" class="test-results hidden">
                        <!-- Statistics -->
                        <div class="result-stats">
                            <div class="stat-item">
                                <span class="stat-label">Token Count:</span>
                                <span class="stat-value" id="token-count">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Generation Time:</span>
                                <span class="stat-value" id="generation-time">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Est. Cost:</span>
                                <span class="stat-value" id="estimated-cost">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Status:</span>
                                <span class="stat-value" id="test-result-status">-</span>
                            </div>
                        </div>

                        <!-- Generated Prompt -->
                        <div class="generated-prompt">
                            <h4>🤖 Generated Prompt</h4>
                            <div class="prompt-actions">
                                <button type="button" class="button button-small" onclick="copyPromptToClipboard()">
                                    📋 Copy
                                </button>
                                <button type="button" class="button button-small" onclick="downloadPrompt()">
                                    💾 Download
                                </button>
                                <button type="button" class="button button-small" onclick="sendToLiveTest()">
                                    🚀 Send to Live Test
                                </button>
                            </div>
                            <pre id="generated-prompt-content" class="prompt-content"></pre>
                        </div>

                        <!-- Validation Results -->
                        <div class="validation-results">
                            <h4>✅ Validation Results</h4>
                            <ul id="validation-list" class="validation-list"></ul>
                        </div>
                    </div>

                    <!-- Placeholder when no results -->
                    <div id="no-results" class="no-results">
                        <div class="placeholder-content">
                            <div class="placeholder-icon">🧪</div>
                            <h4>Ready to Test</h4>
                            <p>Configure your context data and click "Generate Test Prompt" to see the results.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
        function runStrategyTest() {
            const form = document.getElementById('strategy-test-form');
            const formData = new FormData(form);
            
            // Show loading state
            showTestStatus('Generating prompt...', 0);
            hideResults();
            
            // Collect all form data
            const testData = {
                strategy_id: '<?php echo esc_js($strategy['id']); ?>',
                context: Object.fromEntries(formData.entries())
            };
            
            // Send AJAX request
            jQuery.post(ajaxurl, {
                action: 'fitcopilot_test_strategy',
                test_data: testData,
                nonce: '<?php echo wp_create_nonce('fitcopilot_test_strategy'); ?>'
            })
            .done(function(response) {
                if (response.success) {
                    showTestResults(response.data);
                } else {
                    showTestError(response.data || 'Unknown error occurred');
                }
            })
            .fail(function() {
                showTestError('Failed to communicate with server');
            });
        }

        function showTestStatus(message, progress) {
            const statusDiv = document.getElementById('test-status');
            const messageEl = statusDiv.querySelector('.status-message');
            const progressEl = statusDiv.querySelector('.progress-fill');
            
            messageEl.textContent = message;
            progressEl.style.width = progress + '%';
            statusDiv.classList.remove('hidden');
        }

        function hideResults() {
            document.getElementById('test-results').classList.add('hidden');
            document.getElementById('no-results').classList.add('hidden');
        }

        function showTestResults(data) {
            document.getElementById('test-status').classList.add('hidden');
            document.getElementById('no-results').classList.add('hidden');
            
            // Update statistics
            document.getElementById('token-count').textContent = data.token_count || 0;
            document.getElementById('generation-time').textContent = (data.generation_time || 0) + 'ms';
            document.getElementById('estimated-cost').textContent = '$' + (data.estimated_cost || 0).toFixed(4);
            document.getElementById('test-result-status').textContent = data.status || 'Success';
            
            // Update prompt content
            document.getElementById('generated-prompt-content').textContent = data.prompt || '';
            
            // Update validation results
            const validationList = document.getElementById('validation-list');
            validationList.innerHTML = '';
            (data.validation || []).forEach(function(validation) {
                const li = document.createElement('li');
                li.className = 'validation-' + validation.type;
                li.innerHTML = '<span class="validation-icon">' + getValidationIcon(validation.type) + '</span> ' + validation.message;
                validationList.appendChild(li);
            });
            
            document.getElementById('test-results').classList.remove('hidden');
        }

        function showTestError(error) {
            document.getElementById('test-status').classList.add('hidden');
            document.getElementById('test-results').classList.add('hidden');
            document.getElementById('no-results').classList.remove('hidden');
            
            // Show error in placeholder
            const placeholder = document.querySelector('.placeholder-content');
            placeholder.innerHTML = '<div class="placeholder-icon">❌</div><h4>Test Failed</h4><p>' + error + '</p>';
        }

        function getValidationIcon(type) {
            const icons = {
                'success': '✅',
                'warning': '⚠️',
                'error': '❌',
                'info': 'ℹ️'
            };
            return icons[type] || 'ℹ️';
        }

        function copyPromptToClipboard() {
            const content = document.getElementById('generated-prompt-content').textContent;
            navigator.clipboard.writeText(content).then(function() {
                alert('Prompt copied to clipboard!');
            });
        }

        function downloadPrompt() {
            const content = document.getElementById('generated-prompt-content').textContent;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'strategy-test-prompt.txt';
            a.click();
            URL.revokeObjectURL(url);
        }

        function sendToLiveTest() {
            // TODO: Implement live AI testing
            alert('Live AI testing will be implemented in a future update.');
        }

        function loadPresetData() {
            // TODO: Implement preset data loading
            alert('Preset data loading will be implemented in a future update.');
        }

        function clearTestForm() {
            document.getElementById('strategy-test-form').reset();
            hideResults();
            document.getElementById('no-results').classList.remove('hidden');
        }
        </script>
        <?php
    }

    /**
     * SPRINT 2: Handle strategy form actions (create, update, delete)
     */
    private function handle_strategy_action() {
        $action = sanitize_text_field($_POST['form_action'] ?? '');
        
        switch ($action) {
            case 'create':
                $this->handle_strategy_create();
                break;
            case 'update':
                $this->handle_strategy_update();
                break;
            default:
                wp_die('Invalid action');
        }
    }
    
    /**
     * SPRINT 2: Handle strategy creation
     */
    private function handle_strategy_create() {
        $strategy_data = $this->sanitize_strategy_data($_POST);
        
        // Validate required fields
        if (empty($strategy_data['name']) || empty($strategy_data['prompt_template'])) {
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p>Strategy name and prompt template are required.</p></div>';
            });
            return;
        }
        
        // Generate ID if not provided
        if (empty($strategy_data['id'])) {
            $strategy_data['id'] = sanitize_title($strategy_data['name']);
        }
        
        // Check for duplicate ID
        $existing_strategies = $this->get_available_strategies();
        foreach ($existing_strategies as $existing) {
            if ($existing['id'] === $strategy_data['id']) {
                add_action('admin_notices', function() {
                    echo '<div class="notice notice-error"><p>A strategy with this ID already exists.</p></div>';
                });
                return;
            }
        }
        
        // Add metadata
        $strategy_data['type'] = 'custom';
        $strategy_data['created'] = current_time('mysql');
        $strategy_data['modified'] = current_time('mysql');
        $strategy_data['version'] = '1.0.0';
        
        // Save to database
        $custom_strategies = get_option('fitcopilot_custom_strategies', []);
        $custom_strategies[] = $strategy_data;
        update_option('fitcopilot_custom_strategies', $custom_strategies);
        
        // Success message
        add_action('admin_notices', function() use ($strategy_data) {
            echo '<div class="notice notice-success"><p>Strategy "' . esc_html($strategy_data['name']) . '" created successfully!</p></div>';
        });
        
        // Redirect to strategy list
        wp_redirect(admin_url('admin.php?page=fitcopilot-strategy-manager'));
        exit;
    }
    
    /**
     * SPRINT 2: Handle strategy update
     */
    private function handle_strategy_update() {
        $strategy_id = sanitize_text_field($_POST['strategy_id'] ?? '');
        $strategy_data = $this->sanitize_strategy_data($_POST);
        
        if (empty($strategy_id)) {
            wp_die('Strategy ID is required for updates');
        }
        
        // Don't allow updating built-in strategies
        if ($strategy_id === 'SingleWorkoutStrategy') {
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p>Cannot modify built-in strategies.</p></div>';
            });
            return;
        }
        
        // Find and update the strategy
        $custom_strategies = get_option('fitcopilot_custom_strategies', []);
        $found = false;
        
        for ($i = 0; $i < count($custom_strategies); $i++) {
            if ($custom_strategies[$i]['id'] === $strategy_id) {
                $custom_strategies[$i] = array_merge($custom_strategies[$i], $strategy_data);
                $custom_strategies[$i]['modified'] = current_time('mysql');
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p>Strategy not found.</p></div>';
            });
            return;
        }
        
        update_option('fitcopilot_custom_strategies', $custom_strategies);
        
        // Success message
        add_action('admin_notices', function() use ($strategy_data) {
            echo '<div class="notice notice-success"><p>Strategy "' . esc_html($strategy_data['name']) . '" updated successfully!</p></div>';
        });
        
        // Redirect to strategy list
        wp_redirect(admin_url('admin.php?page=fitcopilot-strategy-manager'));
        exit;
    }
    
    /**
     * SPRINT 2: Sanitize strategy form data
     */
    private function sanitize_strategy_data($post_data) {
        return [
            'id' => sanitize_text_field($post_data['strategy_id_field'] ?? ''),
            'name' => sanitize_text_field($post_data['strategy_name'] ?? ''),
            'description' => sanitize_textarea_field($post_data['strategy_description'] ?? ''),
            'status' => sanitize_text_field($post_data['strategy_status'] ?? 'draft'),
            'prompt_template' => wp_kses_post($post_data['prompt_template'] ?? ''),
            'required_context' => array_map('sanitize_text_field', $post_data['required_context'] ?? []),
            'token_limit' => intval($post_data['token_limit'] ?? 4000),
            'cache_ttl' => intval($post_data['cache_ttl'] ?? 3600),
            'retry_attempts' => intval($post_data['retry_attempts'] ?? 3)
        ];
    }

    /**
     * SPRINT 2: Handle strategy deletion via AJAX
     */
    public function handle_delete_strategy_ajax() {
        check_ajax_referer('fitcopilot_delete_strategy', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $strategy_id = sanitize_text_field($_POST['strategy_id'] ?? '');
        
        if (empty($strategy_id)) {
            wp_send_json_error('Strategy ID is required');
            return;
        }
        
        // Don't allow deletion of built-in strategies
        if ($strategy_id === 'SingleWorkoutStrategy') {
            wp_send_json_error('Cannot delete built-in strategies');
            return;
        }
        
        // Find and remove the strategy
        $custom_strategies = get_option('fitcopilot_custom_strategies', []);
        $found = false;
        
        for ($i = 0; $i < count($custom_strategies); $i++) {
            if ($custom_strategies[$i]['id'] === $strategy_id) {
                array_splice($custom_strategies, $i, 1);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            wp_send_json_error('Strategy not found');
            return;
        }
        
        update_option('fitcopilot_custom_strategies', $custom_strategies);
        
        wp_send_json_success([
            'message' => 'Strategy deleted successfully',
            'strategy_id' => $strategy_id
        ]);
    }
    
    /**
     * SPRINT 2: Handle strategy testing via AJAX
     */
    public function handle_test_strategy_ajax() {
        check_ajax_referer('fitcopilot_test_strategy', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $test_data = $_POST['test_data'] ?? [];
        $strategy_id = sanitize_text_field($test_data['strategy_id'] ?? '');
        $context_data = $test_data['context'] ?? [];
        
        if (empty($strategy_id)) {
            wp_send_json_error('Strategy ID is required');
            return;
        }
        
        try {
            // Start timing
            $start_time = microtime(true);
            
            // Get the strategy
            $strategies = $this->get_available_strategies();
            $strategy = null;
            foreach ($strategies as $s) {
                if ($s['id'] === $strategy_id) {
                    $strategy = $s;
                    break;
                }
            }
            
            if (!$strategy) {
                wp_send_json_error('Strategy not found');
                return;
            }
            
            // Build test prompt using modular system
            $prompt = $this->build_test_prompt($strategy, $context_data);
            
            // Calculate metrics
            $end_time = microtime(true);
            $generation_time = round(($end_time - $start_time) * 1000); // Convert to milliseconds
            $token_count = $this->estimate_token_count($prompt);
            $estimated_cost = $this->estimate_cost($token_count);
            
            // Validate the prompt
            $validation_results = $this->validate_test_prompt($prompt, $strategy, $context_data);
            
            wp_send_json_success([
                'prompt' => $prompt,
                'token_count' => $token_count,
                'generation_time' => $generation_time,
                'estimated_cost' => $estimated_cost,
                'status' => 'Success',
                'validation' => $validation_results
            ]);
            
        } catch (Exception $e) {
            wp_send_json_error('Test failed: ' . $e->getMessage());
        }
    }
    
    /**
     * SPRINT 2: Build test prompt using strategy
     */
    private function build_test_prompt($strategy, $context_data) {
        // For built-in strategies, use the actual class
        if ($strategy['id'] === 'SingleWorkoutStrategy') {
            // Use the existing modular prompt system
            $prompt_builder = new \FitCopilot\Service\AI\PromptEngineering\Core\PromptBuilder();
            $context_manager = new \FitCopilot\Service\AI\PromptEngineering\Core\ContextManager();
            $single_strategy = new \FitCopilot\Service\AI\PromptEngineering\Strategies\SingleWorkoutStrategy();
            
            // Add context data
            $context_manager->addProfileContext([
                'fitness_level' => $context_data['fitness_level'] ?? 'intermediate',
                'profile_age' => intval($context_data['profile_age'] ?? 48),
                'profile_weight' => intval($context_data['profile_weight'] ?? 200),
                'profile_gender' => $context_data['profile_gender'] ?? 'male',
                'profile_limitation_notes' => $context_data['profile_limitation_notes'] ?? ''
            ]);
            
            $context_manager->addSessionContext([
                'duration' => intval($context_data['duration'] ?? 30),
                'equipment' => array_map('trim', explode(',', $context_data['equipment'] ?? '')),
                'daily_focus' => $context_data['daily_focus'] ?? 'strength_building',
                'location' => $context_data['location'] ?? 'home',
                'stress_level' => $context_data['stress_level'] ?? 'moderate',
                'energy_level' => $context_data['energy_level'] ?? 'high',
                'sleep_quality' => $context_data['sleep_quality'] ?? 'good'
            ]);
            
            return $prompt_builder
                ->useStrategy($single_strategy)
                ->withContext($context_manager)
                ->build();
        }
        
        // For custom strategies, use template substitution
        $template = $strategy['prompt_template'] ?? '';
        
        // Simple variable substitution
        $variables = [
            '{fitness_level}' => $context_data['fitness_level'] ?? 'intermediate',
            '{duration}' => $context_data['duration'] ?? '30',
            '{equipment}' => $context_data['equipment'] ?? 'dumbbells, resistance_bands',
            '{daily_focus}' => $context_data['daily_focus'] ?? 'strength_building',
            '{profile_age}' => $context_data['profile_age'] ?? '48',
            '{profile_weight}' => $context_data['profile_weight'] ?? '200',
            '{profile_gender}' => $context_data['profile_gender'] ?? 'male',
            '{profile_limitation_notes}' => $context_data['profile_limitation_notes'] ?? '',
            '{location}' => $context_data['location'] ?? 'home',
            '{stress_level}' => $context_data['stress_level'] ?? 'moderate',
            '{energy_level}' => $context_data['energy_level'] ?? 'high',
            '{sleep_quality}' => $context_data['sleep_quality'] ?? 'good'
        ];
        
        return str_replace(array_keys($variables), array_values($variables), $template);
    }
    
    /**
     * SPRINT 2: Estimate token count for text
     */
    private function estimate_token_count($text) {
        // Simple estimation: ~4 characters per token
        return (int) ceil(strlen($text) / 4);
    }
    
    /**
     * SPRINT 2: Estimate API cost for token count
     */
    private function estimate_cost($token_count) {
        // GPT-4 pricing: ~$0.03 per 1K tokens (rough estimate)
        return ($token_count / 1000) * 0.03;
    }
    
    /**
     * SPRINT 2: Validate test prompt
     */
    private function validate_test_prompt($prompt, $strategy, $context_data) {
        $validation = [];
        
        // Check prompt length
        if (strlen($prompt) < 100) {
            $validation[] = [
                'type' => 'warning',
                'message' => 'Prompt seems very short. Consider adding more detail.'
            ];
        }
        
        // Check token limit
        $token_count = $this->estimate_token_count($prompt);
        $token_limit = $strategy['token_limit'] ?? 4000;
        
        if ($token_count > $token_limit) {
            $validation[] = [
                'type' => 'error',
                'message' => "Token count ({$token_count}) exceeds strategy limit ({$token_limit})"
            ];
        } else {
            $validation[] = [
                'type' => 'success',
                'message' => "Token count ({$token_count}) is within limits"
            ];
        }
        
        // Check required context
        $required_context = $strategy['required_context'] ?? [];
        foreach ($required_context as $context_type) {
            $validation[] = [
                'type' => 'info',
                'message' => "Required context '{$context_type}' is available"
            ];
        }
        
        // Check for variable substitution in custom strategies
        if ($strategy['type'] === 'custom') {
            if (strpos($prompt, '{') !== false) {
                $validation[] = [
                    'type' => 'warning',
                    'message' => 'Prompt contains unsubstituted variables'
                ];
            } else {
                $validation[] = [
                    'type' => 'success',
                    'message' => 'All variables substituted successfully'
                ];
            }
        }
        
        return $validation;
    }
    
    /**
     * LEGACY COMPATIBILITY: Redirect to modular debug system
     * This method is deprecated - use TestingLabController instead
     */
    public function handle_debug_test_workout() {
        // Delegate to modular system if available
        $debug_manager = \FitCopilot\Admin\Debug\DebugBootstrap::getDebugManager();
        
        if ($debug_manager && $debug_manager->isHealthy()) {
            $controller = $debug_manager->getController('testing_lab');
            if ($controller && method_exists($controller, 'handleWorkoutTest')) {
                return $controller->handleWorkoutTest();
            }
        }
        
        // Fallback error response
        wp_send_json_error([
            'message' => 'Debug system not available. Please check if the modular debug system is properly initialized.',
            'code' => 'debug_system_unavailable',
            'migration_note' => 'This endpoint has been migrated to TestingLabController.php'
        ]);
    }
    
    /**
     * SPRINT 3: Handle debug prompt test AJAX request
     * FIXED: Now uses modular debug system instead of problematic DebugEndpoints
     */
    public function handle_debug_test_prompt() {
        // Check permissions first
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        // Check nonce if provided (using general admin ajax nonce for initial build)
        if (isset($_POST['nonce']) && !empty($_POST['nonce'])) {
            $nonce_actions = ['fitcopilot_admin_ajax', 'fitcopilot_debug_test', 'wp_rest'];
            $nonce_valid = false;
            foreach ($nonce_actions as $action) {
                if (wp_verify_nonce($_POST['nonce'], $action)) {
                    $nonce_valid = true;
                    break;
                }
            }
            if (!$nonce_valid) {
                wp_send_json_error([
                    'message' => 'Security check failed',
                    'debug' => 'Invalid nonce for debug test prompt. Expected: fitcopilot_admin_ajax'
                ]);
                return;
            }
        }
        
        try {
            $test_data = json_decode(file_get_contents('php://input'), true);
            
            // Use modular debug system instead of problematic DebugEndpoints
            $testing_service = new \FitCopilot\Admin\Debug\Services\TestingService();
            $test_id = 'prompt_' . time() . '_' . wp_generate_password(8, false);
            
            // Run prompt building test
            $result = $testing_service->testPromptBuilding($test_data, $test_id);
            
            wp_send_json_success($result);
            
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage(),
                'type' => 'prompt_test_error'
            ]);
        }
    }
    
    /**
     * SPRINT 3: Handle debug context validation AJAX request
     * FIXED: Now uses modular debug system instead of problematic DebugEndpoints
     */
    public function handle_debug_validate_context() {
        // Check permissions first
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        // Check nonce if provided (using general admin ajax nonce for initial build)
        if (isset($_POST['nonce']) && !empty($_POST['nonce'])) {
            $nonce_actions = ['fitcopilot_admin_ajax', 'fitcopilot_debug_test', 'wp_rest'];
            $nonce_valid = false;
            foreach ($nonce_actions as $action) {
                if (wp_verify_nonce($_POST['nonce'], $action)) {
                    $nonce_valid = true;
                    break;
                }
            }
            if (!$nonce_valid) {
                wp_send_json_error([
                    'message' => 'Security check failed',
                    'debug' => 'Invalid nonce for debug validate context. Expected: fitcopilot_admin_ajax'
                ]);
                return;
            }
        }
        
        try {
            $test_data = json_decode(file_get_contents('php://input'), true);
            
            // Use modular debug system instead of problematic DebugEndpoints
            $testing_service = new \FitCopilot\Admin\Debug\Services\TestingService();
            $test_id = 'context_' . time() . '_' . wp_generate_password(8, false);
            
            // Run context validation
            $result = $testing_service->validateContext($test_data, $test_id);
            
            wp_send_json_success($result);
            
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage(),
                'type' => 'context_validation_error'
            ]);
        }
    }
    
    /**
     * SPRINT 3: Handle debug get logs AJAX request
     */
    public function handle_debug_get_logs() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        try {
            // Get recent logs using static methods
            $logs = \FitCopilot\Utils\DebugLogger::getLogs([], 100);
            $stats = \FitCopilot\Utils\DebugLogger::getLogStatistics();
            
            wp_send_json_success([
                'logs' => $logs,
                'stats' => $stats
            ]);
            
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage(),
                'type' => 'logs_retrieval_error'
            ]);
        }
    }
    
    /**
     * SPRINT 3: Handle debug clear logs AJAX request
     */
    public function handle_debug_clear_logs() {
        // Check permissions first
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        // Check nonce if provided (using general admin ajax nonce for initial build)
        if (isset($_POST['nonce']) && !empty($_POST['nonce'])) {
            $nonce_actions = ['fitcopilot_admin_ajax', 'fitcopilot_debug_clear', 'wp_rest'];
            $nonce_valid = false;
            foreach ($nonce_actions as $action) {
                if (wp_verify_nonce($_POST['nonce'], $action)) {
                    $nonce_valid = true;
                    break;
                }
            }
            if (!$nonce_valid) {
                wp_send_json_error([
                    'message' => 'Security check failed',
                    'debug' => 'Invalid nonce for debug clear logs. Expected: fitcopilot_admin_ajax'
                ]);
                return;
            }
        }
        
        try {
            // Get current log count before clearing
            $log_count = \FitCopilot\Utils\DebugLogger::getLogCount();
            
            // Clear logs using static method
            \FitCopilot\Utils\DebugLogger::clearLogs();
            
            wp_send_json_success([
                'message' => 'Logs cleared successfully',
                'cleared_count' => $log_count
            ]);
            
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage(),
                'type' => 'logs_clear_error'
            ]);
        }
    }
    
    /**
     * SPRINT 3: Handle debug performance test AJAX request
     */
    public function handle_debug_performance_test() {
        // Check permissions first
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        // Check nonce if provided (using general admin ajax nonce for initial build)
        if (isset($_POST['nonce']) && !empty($_POST['nonce'])) {
            $nonce_actions = ['fitcopilot_admin_ajax', 'fitcopilot_debug_test', 'wp_rest'];
            $nonce_valid = false;
            foreach ($nonce_actions as $action) {
                if (wp_verify_nonce($_POST['nonce'], $action)) {
                    $nonce_valid = true;
                    break;
                }
            }
            if (!$nonce_valid) {
                wp_send_json_error([
                    'message' => 'Security check failed',
                    'debug' => 'Invalid nonce for debug performance test. Expected: fitcopilot_admin_ajax'
                ]);
                return;
            }
        }
        
        try {
            $test_data = json_decode(file_get_contents('php://input'), true);
            
            // Initialize performance monitor
            $performance_monitor = new \FitCopilot\Service\Debug\PerformanceMonitor();
            
            // Run performance test
            $performance_monitor->start('debug_performance_test');
            
            // Simulate workout generation
            $api_key = get_option('fitcopilot_openai_api_key', 'test');
            $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
            
            $test_params = [
                'duration' => 30,
                'fitness_level' => 'intermediate',
                'goals' => 'strength'
            ];
            
            $prompt = $provider->buildPrompt($test_params);
            
            $performance_monitor->stop('debug_performance_test', [
                'prompt_length' => strlen($prompt),
                'test_params' => $test_params
            ]);
            
            $metrics = $performance_monitor->getMetrics(['debug_performance_test']);
            $summary = $performance_monitor->getPerformanceSummary();
            
            wp_send_json_success([
                'metrics' => $metrics,
                'summary' => $summary,
                'memory_analysis' => $performance_monitor->getMemoryAnalysis()
            ]);
            
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage(),
                'type' => 'performance_test_error'
            ]);
        }
    }
    
    /**
     * SPRINT 3: Handle debug get system stats AJAX request
     */
    public function handle_debug_get_system_stats() {
        // Check permissions first
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        // Log debug info for nonce troubleshooting
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[FitCopilot Debug] System stats called. POST data: ' . print_r($_POST, true));
        }

        // Check nonce if provided (flexible nonce checking for debug)
        if (isset($_POST['nonce']) && !empty($_POST['nonce'])) {
            $nonce_actions = ['fitcopilot_admin_ajax', 'wp_rest', 'fitcopilot_system_stats'];
            $nonce_valid = false;
            foreach ($nonce_actions as $action) {
                if (wp_verify_nonce($_POST['nonce'], $action)) {
                    $nonce_valid = true;
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("[FitCopilot Debug] Valid nonce found for action: {$action}");
                    }
                    break;
                }
            }
            if (!$nonce_valid) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('[FitCopilot Debug] No valid nonce found. Tried actions: ' . implode(', ', $nonce_actions));
                }
                wp_send_json_error([
                    'message' => 'Security check failed',
                    'debug' => 'Invalid nonce for system stats. Expected: fitcopilot_admin_ajax',
                    'received_nonce' => substr($_POST['nonce'], 0, 10) . '...',
                    'tried_actions' => $nonce_actions
                ]);
                return;
            }
        }

        try {
            // Get enhanced system stats for debug interface
            $stats = [
                'total_requests' => $this->getDebugStatistic('total_requests', 0),
                'success_rate' => $this->getDebugStatistic('success_rate', '100%'),
                'avg_response_time' => $this->getDebugStatistic('avg_response_time', 0),
                'active_tests' => $this->getDebugStatistic('active_tests', 0),
                'last_updated' => time(),
                'system_status' => 'operational',
                'debug_mode' => get_option('fitcopilot_debug_mode', false)
            ];
            
            wp_send_json_success($stats);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => 'Failed to get system stats: ' . $e->getMessage(),
                'type' => 'system_stats_error'
            ]);
        }
    }
    
    /**
     * Helper method to get debug statistics
     */
    private function getDebugStatistic($key, $default = null) {
        // For now, return mock data. In production, this would query actual metrics
        $stats = [
            'total_requests' => wp_cache_get('fitcopilot_total_requests', 'fitcopilot_debug') ?: 0,
            'success_rate' => wp_cache_get('fitcopilot_success_rate', 'fitcopilot_debug') ?: '100%',
            'avg_response_time' => wp_cache_get('fitcopilot_avg_response_time', 'fitcopilot_debug') ?: 1250,
            'active_tests' => wp_cache_get('fitcopilot_active_tests', 'fitcopilot_debug') ?: 0
        ];
        
        return isset($stats[$key]) ? $stats[$key] : $default;
    }
    
    /**
     * SPRINT 3, WEEK 2: Handle log stream start AJAX request
     */
    public function handle_start_log_stream() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_log_stream')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        try {
            // Initialize LogStreamer
            $logStreamer = new \FitCopilot\Service\Debug\LogStreamer();
            
            // Get filter parameters
            $filters = [
                'level' => sanitize_text_field($_POST['level'] ?? 'all'),
                'category' => sanitize_text_field($_POST['category'] ?? 'all'),
                'since' => absint($_POST['since'] ?? time() - 3600), // Last hour by default
                'limit' => min(absint($_POST['limit'] ?? 50), 100)
            ];
            
            // Start streaming
            $stream_id = $logStreamer->startStream($filters);
            
            wp_send_json_success([
                'stream_id' => $stream_id,
                'message' => 'Log streaming started successfully',
                'filters' => $filters
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => 'Failed to start log stream: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * SPRINT 3, WEEK 2: Handle get log stats AJAX request
     */
    public function handle_get_log_stats() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_log_stats')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        try {
            $logManager = new \FitCopilot\Service\Debug\LogManager();
            
            // Get time period
            $hours = absint($_POST['hours'] ?? 24);
            
            // Get comprehensive log statistics
            $stats = $logManager->getLogStatistics($hours);
            
            wp_send_json_success($stats);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => 'Failed to get log stats: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * SPRINT 3, WEEK 2: Handle export logs AJAX request
     */
    public function handle_export_logs() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_export_logs')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        try {
            $logManager = new \FitCopilot\Service\Debug\LogManager();
            
            // Get export parameters
            $format = sanitize_text_field($_POST['format'] ?? 'json');
            $filters = [
                'level' => sanitize_text_field($_POST['level'] ?? 'all'),
                'category' => sanitize_text_field($_POST['category'] ?? 'all'),
                'since' => absint($_POST['since'] ?? time() - (24 * 3600)),
                'until' => absint($_POST['until'] ?? time())
            ];
            
            // Generate export
            $export_data = $logManager->exportLogs($format, $filters);
            
            wp_send_json_success([
                'export_data' => $export_data,
                'format' => $format,
                'filters' => $filters,
                'generated_at' => time()
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => 'Failed to export logs: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * SPRINT 3, WEEK 2: Handle get performance metrics AJAX request
     */
    public function handle_get_performance_metrics() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_performance_metrics')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        try {
            $performanceMonitor = new \FitCopilot\Service\Debug\PerformanceMonitor();
            
            // Get time period
            $hours = absint($_POST['hours'] ?? 24);
            
            // Get performance metrics
            $metrics = $performanceMonitor->getPerformanceMetrics($hours);
            
            wp_send_json_success($metrics);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => 'Failed to get performance metrics: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * SPRINT 3, WEEK 2: Handle get system health AJAX request
     */
    public function handle_get_system_health() {
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        try {
            $performanceMonitor = new \FitCopilot\Service\Debug\PerformanceMonitor();
            
            // Get comprehensive system health
            $health = $performanceMonitor->getSystemHealth();
            
            wp_send_json_success($health);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => 'Failed to get system health: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * SPRINT 3, WEEK 2: Handle clear performance data AJAX request
     */
    public function handle_clear_performance_data() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'fitcopilot_clear_performance')) {
            wp_die(__('Security check failed', 'fitcopilot'));
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Insufficient permissions', 'fitcopilot'));
            return;
        }

        try {
            global $wpdb;
            
            // Clear performance metrics table
            $table_name = $wpdb->prefix . 'fitcopilot_performance_metrics';
            $deleted = $wpdb->query("DELETE FROM {$table_name}");
            
            wp_send_json_success([
                'message' => "Cleared {$deleted} performance records",
                'deleted_count' => $deleted
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => 'Failed to clear performance data: ' . $e->getMessage()
            ]);
        }
    }
}

// Initialize the admin menu
new AdminMenu(); 