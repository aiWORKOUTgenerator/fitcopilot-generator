<?php
/**
 * Debug Endpoints - WordPress Admin Integration for Debug Dashboard
 * 
 * ⚠️  DEPRECATED: This class has been migrated to a modular architecture.
 * 
 * NEW SYSTEM LOCATION:
 * - Main Coordinator: src/php/Admin/Debug/DebugManager.php
 * - Controllers: src/php/Admin/Debug/Controllers/
 * - Services: src/php/Admin/Debug/Services/
 * - Views: src/php/Admin/Debug/Views/
 * - Bootstrap: src/php/Admin/Debug/DebugBootstrap.php
 * 
 * This file is maintained for backward compatibility but most functionality
 * has been commented out and redirected to the new modular system.
 * 
 * @deprecated Use the modular debug system instead
 */

namespace FitCopilot\Admin;

use FitCopilot\Service\Debug\LogManager;
use FitCopilot\Service\Debug\LogStreamer;
use FitCopilot\Service\Debug\PerformanceMonitor;
use FitCopilot\Service\Debug\ResponseDebugger;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DebugEndpoints Class
 * 
 * WordPress admin integration for debug dashboard
 */
class DebugEndpoints {
    
    /**
     * Debug services
     *
     * @var array
     */
    private $services = [];
    
    /**
     * Initialize debug endpoints
     */
    public function __construct() {
        // Don't initialize services in constructor for initial build
        // This prevents 500 errors if debug services aren't fully implemented
        $this->registerHooks();
    }
    
    /**
     * Initialize debug services (lazy loading for initial build)
     *
     * @return void
     */
    private function initializeServices(): void {
        if (!empty($this->services)) {
            return; // Already initialized
        }

        // Try to initialize services with fallbacks for initial build
        try {
            $this->services = [
                'log_manager' => class_exists('FitCopilot\Service\Debug\LogManager') 
                    ? new LogManager() 
                    : $this->createMockService('LogManager'),
                'log_streamer' => class_exists('FitCopilot\Service\Debug\LogStreamer') 
                    ? new LogStreamer() 
                    : $this->createMockService('LogStreamer'),
                'performance_monitor' => class_exists('FitCopilot\Service\Debug\PerformanceMonitor') 
                    ? new PerformanceMonitor() 
                    : $this->createMockService('PerformanceMonitor'),
                'response_debugger' => class_exists('FitCopilot\Service\Debug\ResponseDebugger') 
                    ? new ResponseDebugger() 
                    : $this->createMockService('ResponseDebugger')
            ];
        } catch (\Exception $e) {
            // Fallback to mock services for initial build
            $this->services = [
                'log_manager' => $this->createMockService('LogManager'),
                'log_streamer' => $this->createMockService('LogStreamer'),
                'performance_monitor' => $this->createMockService('PerformanceMonitor'),
                'response_debugger' => $this->createMockService('ResponseDebugger')
            ];
        }
    }

    /**
     * Create mock service for initial build compatibility
     *
     * @param string $service_name Service name
     * @return object Mock service
     */
    private function createMockService(string $service_name): object {
        return new class($service_name) {
            private $name;
            
            public function __construct($name) {
                $this->name = $name;
            }
            
            public function __call($method, $args) {
                // Return sensible defaults for common methods
                switch ($method) {
                    case 'getRecentLogs':
                        return [];
                    case 'getCurrentMetrics':
                        return [
                            'avg_response_time' => 0,
                            'peak_memory' => 0,
                            'db_queries' => 0
                        ];
                    case 'getLogCount':
                        return 0;
                    case 'getActiveStreams':
                        return [];
                    default:
                        return null;
                }
            }
        };
    }
    
    /**
     * Register WordPress hooks
     * 
     * @deprecated Migrated to modular system (DebugBootstrap.php)
     * @return void
     */
    private function registerHooks(): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/DebugBootstrap.php
        /*
        add_action('admin_menu', [$this, 'registerAdminMenus']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
        add_action('wp_ajax_fitcopilot_debug_logs', [$this, 'handleDebugLogsAjax']);
        add_action('wp_ajax_fitcopilot_debug_stream', [$this, 'handleDebugStreamAjax']);
        add_action('wp_ajax_fitcopilot_debug_performance', [$this, 'handlePerformanceAjax']);
        add_action('wp_ajax_fitcopilot_debug_response', [$this, 'handleResponseAnalysisAjax']);
        add_action('wp_ajax_fitcopilot_debug_clear_logs', [$this, 'handleClearLogsAjax']);
        add_action('wp_ajax_fitcopilot_debug_export_logs', [$this, 'handleExportLogsAjax']);
        add_action('wp_ajax_fitcopilot_debug_system_info', [$this, 'handleSystemInfoAjax']);
        */
    }
    
    /**
     * Register admin menu pages
     * 
     * @deprecated Migrated to DebugManager.php
     * @return void
     */
    public function registerAdminMenus(): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/DebugManager.php
        /*
        // Main Debug Dashboard
        add_menu_page(
            'FitCopilot Debug Dashboard',
            'Debug Dashboard',
            'manage_options',
            'fitcopilot-debug',
            [$this, 'renderDebugDashboard'],
            'dashicons-search',
            58
        );
        
        // Sub-menu pages
        add_submenu_page(
            'fitcopilot-debug',
            'Live Logs',
            'Live Logs',
            'manage_options',
            'fitcopilot-debug-logs',
            [$this, 'renderLiveLogsPage']
        );
        
        add_submenu_page(
            'fitcopilot-debug',
            'Performance Monitor',
            'Performance',
            'manage_options',
            'fitcopilot-debug-performance',
            [$this, 'renderPerformancePage']
        );
        
        add_submenu_page(
            'fitcopilot-debug',
            'Response Analyzer',
            'Response Analyzer',
            'manage_options',
            'fitcopilot-debug-responses',
            [$this, 'renderResponseAnalyzerPage']
        );
        
        add_submenu_page(
            'fitcopilot-debug',
            'System Information',
            'System Info',
            'manage_options',
            'fitcopilot-debug-system',
            [$this, 'renderSystemInfoPage']
        );
        */
    }
    
    /**
     * Enqueue admin assets
     * 
     * @deprecated Migrated to DebugManager.php
     * @param string $hook_suffix Current admin page
     * @return void
     */
    public function enqueueAdminAssets(string $hook_suffix): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/DebugManager.php
        /*
        // Only load on debug pages
        if (strpos($hook_suffix, 'fitcopilot-debug') === false) {
            return;
        }
        
        // CSS
        wp_enqueue_style(
            'fitcopilot-debug-admin',
            plugins_url('assets/css/debug-admin.css', FITCOPILOT_PLUGIN_FILE),
            [],
            FITCOPILOT_VERSION
        );
        
        // JavaScript
        wp_enqueue_script(
            'fitcopilot-debug-admin',
            plugins_url('assets/js/debug-admin.js', FITCOPILOT_PLUGIN_FILE),
            ['jquery', 'wp-util'],
            FITCOPILOT_VERSION,
            true
        );
        
        // Localize script with AJAX endpoints
        wp_localize_script('fitcopilot-debug-admin', 'fitcopilotDebug', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('fitcopilot_debug_nonce'),
            'streamUrl' => home_url('/wp-json/fitcopilot/v1/debug/stream'),
            'refreshInterval' => 5000,
            'maxLogEntries' => 1000
        ]);
        */
    }
    
    /**
     * Render main debug dashboard
     * 
     * @deprecated Migrated to DebugDashboardView.php
     * @return void
     */
    public function renderDebugDashboard(): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/Views/DebugDashboardView.php
        /*
        $this->initializeServices(); // Lazy load services
        $system_stats = $this->getSystemStats();
        $recent_logs = $this->services['log_manager']->getRecentLogs(50);
        $performance_metrics = $this->services['performance_monitor']->getCurrentMetrics();
        
        ?>
        <div class="wrap fitcopilot-debug-dashboard">
            <h1 class="wp-heading-inline">
                <span class="dashicons dashicons-search"></span>
                FitCopilot Debug Dashboard
            </h1>
            <div class="debug-dashboard-meta">
                <span class="debug-status <?php echo $system_stats['status']; ?>">
                    System Status: <?php echo ucfirst($system_stats['status']); ?>
                </span>
                <span class="debug-timestamp">
                    Last Updated: <?php echo date('Y-m-d H:i:s'); ?>
                </span>
            </div>
            
            <div class="debug-dashboard-grid">
                <!-- System Overview Card -->
                <div class="debug-card system-overview">
                    <h2><span class="dashicons dashicons-dashboard"></span> System Overview</h2>
                    <div class="debug-metrics">
                        <div class="metric">
                            <span class="metric-label">Total Logs</span>
                            <span class="metric-value"><?php echo number_format($system_stats['total_logs']); ?></span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Error Rate</span>
                            <span class="metric-value <?php echo $system_stats['error_rate'] > 5 ? 'warning' : 'success'; ?>">
                                <?php echo $system_stats['error_rate']; ?>%
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Memory Usage</span>
                            <span class="metric-value"><?php echo $system_stats['memory_usage']; ?>MB</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Active Streams</span>
                            <span class="metric-value"><?php echo $system_stats['active_streams']; ?></span>
                        </div>
                    </div>
                </div>
                
                <!-- Performance Metrics Card -->
                <div class="debug-card performance-metrics">
                    <h2><span class="dashicons dashicons-performance"></span> Performance Metrics</h2>
                    <div class="performance-chart">
                        <canvas id="performanceChart" width="400" height="200"></canvas>
                    </div>
                    <div class="performance-summary">
                        <div class="perf-item">
                            <strong>Avg Response Time:</strong> <?php echo $performance_metrics['avg_response_time']; ?>ms
                        </div>
                        <div class="perf-item">
                            <strong>Peak Memory:</strong> <?php echo $performance_metrics['peak_memory']; ?>MB
                        </div>
                        <div class="perf-item">
                            <strong>Database Queries:</strong> <?php echo $performance_metrics['db_queries']; ?>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity Card -->
                <div class="debug-card recent-activity">
                    <h2><span class="dashicons dashicons-clock"></span> Recent Activity</h2>
                    <div class="activity-list">
                        <?php foreach ($recent_logs as $log): ?>
                            <div class="activity-item level-<?php echo $log['level']; ?>">
                                <div class="activity-time"><?php echo date('H:i:s', $log['timestamp']); ?></div>
                                <div class="activity-message"><?php echo esc_html($log['message']); ?></div>
                                <div class="activity-category"><?php echo $log['category']; ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                
                <!-- Quick Actions Card -->
                <div class="debug-card quick-actions">
                    <h2><span class="dashicons dashicons-admin-tools"></span> Quick Actions</h2>
                    <div class="action-buttons">
                        <button id="clearLogsBtn" class="button button-secondary">
                            <span class="dashicons dashicons-trash"></span>
                            Clear All Logs
                        </button>
                        <button id="exportLogsBtn" class="button button-secondary">
                            <span class="dashicons dashicons-download"></span>
                            Export Logs
                        </button>
                        <button id="startStreamBtn" class="button button-primary">
                            <span class="dashicons dashicons-controls-play"></span>
                            Start Live Stream
                        </button>
                        <button id="refreshStatsBtn" class="button button-secondary">
                            <span class="dashicons dashicons-update"></span>
                            Refresh Stats
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Debug Console -->
            <div class="debug-console">
                <h2><span class="dashicons dashicons-editor-code"></span> Debug Console</h2>
                <div class="console-controls">
                    <select id="logLevelFilter">
                        <option value="all">All Levels</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                    <select id="categoryFilter">
                        <option value="all">All Categories</option>
                        <option value="ai">AI Processing</option>
                        <option value="workout">Workout Generation</option>
                        <option value="api">API Calls</option>
                        <option value="database">Database</option>
                    </select>
                    <button id="consoleFullscreen" class="button">
                        <span class="dashicons dashicons-fullscreen-alt"></span>
                    </button>
                </div>
                <div id="debugConsoleOutput" class="console-output">
                    <!-- Real-time log output will appear here -->
                </div>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Initialize debug dashboard
            FitCopilotDebug.initDashboard();
        });
        </script>
        <?php
        */
    }
    
    /**
     * Render live logs page
     *
     * @return void
     */
    public function renderLiveLogsPage(): void {
        ?>
        <div class="wrap fitcopilot-debug-logs">
            <h1>Live Debug Logs</h1>
            
            <div class="logs-controls">
                <div class="controls-group">
                    <label for="levelFilter">Level:</label>
                    <select id="levelFilter">
                        <option value="all">All</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>
                
                <div class="controls-group">
                    <label for="categoryFilter">Category:</label>
                    <select id="categoryFilter">
                        <option value="all">All</option>
                        <option value="ai">AI Processing</option>
                        <option value="workout">Workout Generation</option>
                        <option value="api">API Calls</option>
                        <option value="database">Database</option>
                    </select>
                </div>
                
                <div class="controls-group">
                    <button id="startStream" class="button button-primary">Start Stream</button>
                    <button id="stopStream" class="button button-secondary">Stop Stream</button>
                    <button id="clearLogs" class="button">Clear Display</button>
                </div>
                
                <div class="stream-status">
                    <span id="streamStatus" class="status-indicator disconnected">Disconnected</span>
                    <span id="logCount">0 logs</span>
                </div>
            </div>
            
            <div id="liveLogsContainer" class="logs-container">
                <!-- Real-time logs will be displayed here -->
            </div>
        </div>
        <?php
    }
    
    /**
     * Render performance monitor page
     *
     * @return void
     */
    public function renderPerformancePage(): void {
        $metrics = $this->services['performance_monitor']->getDetailedMetrics();
        
        ?>
        <div class="wrap fitcopilot-debug-performance">
            <h1>Performance Monitor</h1>
            
            <div class="performance-dashboard">
                <div class="perf-charts">
                    <div class="chart-container">
                        <h3>Response Times</h3>
                        <canvas id="responseTimeChart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Memory Usage</h3>
                        <canvas id="memoryChart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Database Queries</h3>
                        <canvas id="dbQueriesChart"></canvas>
                    </div>
                </div>
                
                <div class="perf-tables">
                    <h3>Slowest Operations</h3>
                    <table class="wp-list-table widefat">
                        <thead>
                            <tr>
                                <th>Operation</th>
                                <th>Average Time</th>
                                <th>Peak Time</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($metrics['slow_operations'] as $op): ?>
                                <tr>
                                    <td><?php echo esc_html($op['name']); ?></td>
                                    <td><?php echo $op['avg_time']; ?>ms</td>
                                    <td><?php echo $op['peak_time']; ?>ms</td>
                                    <td><?php echo $op['count']; ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render response analyzer page
     *
     * @return void
     */
    public function renderResponseAnalyzerPage(): void {
        ?>
        <div class="wrap fitcopilot-debug-responses">
            <h1>OpenAI Response Analyzer</h1>
            
            <div class="response-analyzer-tools">
                <div class="analyzer-input">
                    <h3>Analyze Response</h3>
                    <textarea id="responseInput" placeholder="Paste OpenAI response JSON here..." rows="10"></textarea>
                    <button id="analyzeResponse" class="button button-primary">Analyze Response</button>
                </div>
                
                <div class="analyzer-output">
                    <h3>Analysis Results</h3>
                    <div id="analysisResults" class="analysis-results">
                        <!-- Analysis results will appear here -->
                    </div>
                </div>
            </div>
            
            <div class="recent-responses">
                <h3>Recent Response Analysis</h3>
                <div id="recentAnalysis" class="recent-analysis-list">
                    <!-- Recent analyses will be loaded here -->
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render system information page
     *
     * @return void
     */
    public function renderSystemInfoPage(): void {
        $system_info = $this->getDetailedSystemInfo();
        
        ?>
        <div class="wrap fitcopilot-debug-system">
            <h1>System Information</h1>
            
            <div class="system-info-grid">
                <?php foreach ($system_info as $section => $data): ?>
                    <div class="system-info-section">
                        <h3><?php echo esc_html(ucwords(str_replace('_', ' ', $section))); ?></h3>
                        <table class="wp-list-table widefat">
                            <tbody>
                                <?php foreach ($data as $key => $value): ?>
                                    <tr>
                                        <td class="info-key"><?php echo esc_html(ucwords(str_replace('_', ' ', $key))); ?></td>
                                        <td class="info-value"><?php echo esc_html($value); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="system-actions">
                <button id="downloadSystemInfo" class="button button-secondary">
                    <span class="dashicons dashicons-download"></span>
                    Download System Info
                </button>
            </div>
        </div>
        <?php
    }
    
    /**
     * Handle debug logs AJAX request
     * 
     * @deprecated Migrated to SystemLogsController.php
     * @return void
     */
    public function handleDebugLogsAjax(): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/Controllers/SystemLogsController.php
        /*
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $filters = [
            'level' => sanitize_text_field($_POST['level'] ?? 'all'),
            'category' => sanitize_text_field($_POST['category'] ?? 'all'),
            'since' => intval($_POST['since'] ?? 0),
            'limit' => intval($_POST['limit'] ?? 100)
        ];
        
        $logs = $this->services['log_manager']->getLogs($filters);
        
        wp_send_json_success($logs);
        */
    }
    
    /**
     * Handle debug stream AJAX request
     * 
     * @deprecated Migrated to SystemLogsController.php
     * @return void
     */
    public function handleDebugStreamAjax(): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/Controllers/SystemLogsController.php
        /*
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $action = sanitize_text_field($_POST['stream_action'] ?? '');
        
        switch ($action) {
            case 'start':
                $filters = [
                    'level' => sanitize_text_field($_POST['level'] ?? 'all'),
                    'category' => sanitize_text_field($_POST['category'] ?? 'all')
                ];
                $stream_id = $this->services['log_streamer']->startStream($filters);
                wp_send_json_success(['stream_id' => $stream_id]);
                break;
                
            case 'stop':
                $stream_id = sanitize_text_field($_POST['stream_id'] ?? '');
                $result = $this->services['log_streamer']->stopStream($stream_id);
                wp_send_json_success(['stopped' => $result]);
                        break;
                
            default:
                wp_send_json_error('Invalid stream action');
        }
        */
    }
    
    /**
     * Handle performance AJAX request
     * 
     * @deprecated Migrated to PerformanceController.php
     * @return void
     */
    public function handlePerformanceAjax(): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/Controllers/PerformanceController.php
        /*
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $metrics = $this->services['performance_monitor']->getCurrentMetrics();
        wp_send_json_success($metrics);
        */
    }
    
    /**
     * Handle response analysis AJAX request
     * 
     * @deprecated Migrated to ResponseAnalysisController.php
     * @return void
     */
    public function handleResponseAnalysisAjax(): void {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/Controllers/ResponseAnalysisController.php
        /*
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $response_json = stripslashes($_POST['response'] ?? '');
        $analysis = $this->services['response_debugger']->analyzeResponse($response_json);
        
        wp_send_json_success($analysis);
        */
    }
    
    /**
     * Handle clear logs AJAX request
     *
     * @return void
     */
    public function handleClearLogsAjax(): void {
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $result = $this->services['log_manager']->clearLogs();
        wp_send_json_success(['cleared' => $result]);
    }
    
    /**
     * Handle export logs AJAX request
     *
     * @return void
     */
    public function handleExportLogsAjax(): void {
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $format = sanitize_text_field($_POST['format'] ?? 'json');
        $export_data = $this->services['log_manager']->exportLogs($format);
        
        wp_send_json_success(['export_data' => $export_data]);
    }
    
    /**
     * Handle system info AJAX request
     *
     * @return void
     */
    public function handleSystemInfoAjax(): void {
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $system_info = $this->getDetailedSystemInfo();
        wp_send_json_success($system_info);
    }
    
    /**
     * Get system statistics
     *
     * @return array System stats
     */
    private function getSystemStats(): array {
        return [
            'status' => $this->getSystemStatus(),
            'total_logs' => $this->services['log_manager']->getLogCount(),
            'error_rate' => $this->calculateErrorRate(),
            'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'active_streams' => count($this->services['log_streamer']->getActiveStreams())
        ];
    }
    
    /**
     * Get system status
     *
     * @return string Status
     */
    private function getSystemStatus(): string {
        $error_rate = $this->calculateErrorRate();
        
        if ($error_rate > 10) {
            return 'critical';
        } elseif ($error_rate > 5) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }
    
    /**
     * Calculate error rate
     *
     * @return float Error rate percentage
     */
    private function calculateErrorRate(): float {
        $total_logs = $this->services['log_manager']->getLogCount();
        $error_logs = $this->services['log_manager']->getLogCount(['level' => 'error']);
        
        if ($total_logs === 0) {
            return 0.0;
        }
        
        return round(($error_logs / $total_logs) * 100, 2);
    }
    
    /**
     * Get detailed system information
     *
     * @return array System information
     */
    private function getDetailedSystemInfo(): array {
        global $wpdb;
        
        return [
            'wordpress' => [
                'version' => get_bloginfo('version'),
                'multisite' => is_multisite() ? 'Yes' : 'No',
                'debug_mode' => WP_DEBUG ? 'Enabled' : 'Disabled',
                'memory_limit' => WP_MEMORY_LIMIT,
                'max_execution_time' => ini_get('max_execution_time') . 's'
            ],
            'server' => [
                'php_version' => PHP_VERSION,
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'mysql_version' => $wpdb->db_version(),
                'memory_limit' => ini_get('memory_limit'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size')
            ],
            'plugin' => [
                'version' => FITCOPILOT_VERSION ?? 'Unknown',
                'debug_enabled' => defined('FITCOPILOT_DEBUG') && FITCOPILOT_DEBUG ? 'Yes' : 'No',
                'log_level' => get_option('fitcopilot_log_level', 'info'),
                'database_version' => get_option('fitcopilot_db_version', '1.0.0')
            ]
        ];
    }
    
    /**
     * Test workout generation (Testing Lab integration)
     * 
     * @deprecated Migrated to TestingLabController.php via TestingService.php
     * @param array $test_data Test parameters
     * @return array Test results
     */
    public function test_workout_generation(array $test_data): array {
        // MIGRATED TO MODULAR SYSTEM - See src/php/Admin/Debug/Controllers/TestingLabController.php
        /*
        $this->initializeServices(); // Lazy load services
        $start_time = microtime(true);
        
        try {
            // Extract test parameters
            $workout_params = $test_data['test_data'] ?? $test_data;
            
            // Initialize OpenAI provider
            $api_key = get_option('fitcopilot_openai_api_key', '');
            if (empty($api_key)) {
                throw new \Exception('OpenAI API key not configured');
            }
            
            $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
            
            // Build prompt
            $prompt_start = microtime(true);
            $prompt = $provider->buildPrompt($workout_params);
            $prompt_time = (microtime(true) - $prompt_start) * 1000;
            
            // For initial build, simulate API response to avoid costs during testing
            $api_start = microtime(true);
            $raw_response = json_encode([
                'title' => 'Test Workout - ' . date('H:i:s'),
                'sections' => [
                    [
                        'name' => 'Warm-up',
                        'duration' => 5,
                        'exercises' => [
                            [
                                'name' => 'Light Jogging',
                                'duration' => '3 minutes',
                                'description' => 'Start with a gentle jog to warm up your muscles'
                            ]
                        ]
                    ],
                    [
                        'name' => 'Main Workout',
                        'duration' => ($workout_params['duration'] ?? 30) - 10,
                        'exercises' => [
                            [
                                'name' => 'Push-ups',
                                'duration' => '3 sets of 10 reps',
                                'description' => 'Standard push-ups focusing on proper form'
                            ],
                            [
                                'name' => 'Squats',
                                'duration' => '3 sets of 15 reps',
                                'description' => 'Bodyweight squats with controlled movement'
                            ]
                        ]
                    ],
                    [
                        'name' => 'Cool-down',
                        'duration' => 5,
                        'exercises' => [
                            [
                                'name' => 'Stretching',
                                'duration' => '5 minutes',
                                'description' => 'Full body stretching routine'
                            ]
                        ]
                    ]
                ]
            ]);
            $parsed_response = json_decode($raw_response, true);
            $api_time = (microtime(true) - $api_start) * 1000;
            $total_time = (microtime(true) - $start_time) * 1000;
            
            // Validate response structure
            $validation_errors = [];
            if (empty($parsed_response['title'])) {
                $validation_errors[] = 'Missing workout title';
            }
            if (empty($parsed_response['sections'])) {
                $validation_errors[] = 'Missing workout sections';
            }
            
            return [
                'success' => empty($validation_errors),
                'test_id' => $test_data['test_id'] ?? 'test_' . time(),
                'test_type' => 'workout_generation',
                'test_data' => $workout_params,
                'prompt' => $prompt,
                'raw_response' => $raw_response,
                'parsed_response' => $parsed_response,
                'validation_errors' => $validation_errors,
                'performance_metrics' => [
                    'prompt_generation_time' => round($prompt_time, 2),
                    'api_call_time' => round($api_time, 2),
                    'total_time' => round($total_time, 2),
                    'prompt_length' => strlen($prompt),
                    'response_length' => strlen($raw_response)
                ],
                'context_analysis' => [
                    'provided_params' => array_keys($workout_params),
                    'param_count' => count($workout_params),
                    'completeness' => $this->calculateContextCompleteness($workout_params)
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            $total_time = (microtime(true) - $start_time) * 1000;
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'test_data' => $test_data,
                'performance_metrics' => [
                    'total_time' => round($total_time, 2)
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
        */
        
        // Return deprecated notice
        return [
            'success' => false,
            'error' => 'This method has been deprecated. Use TestingLabController instead.',
            'redirect' => 'src/php/Admin/Debug/Controllers/TestingLabController.php'
        ];
    }
    
    /**
     * Test prompt building (Testing Lab integration)
     *
     * @param array $test_data Test parameters
     * @return array Test results
     */
    public function test_prompt_building(array $test_data): array {
        $this->initializeServices(); // Lazy load services
        $start_time = microtime(true);
        
        try {
            $prompt_params = $test_data['test_data'] ?? $test_data;
            
            // Initialize OpenAI provider
            $api_key = get_option('fitcopilot_openai_api_key', '');
            $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
            
            // Build prompt
            $prompt = $provider->buildPrompt($prompt_params);
            $total_time = (microtime(true) - $start_time) * 1000;
            
            return [
                'success' => true,
                'test_id' => $test_data['test_id'] ?? 'test_' . time(),
                'test_type' => 'prompt_building',
                'prompt' => $prompt,
                'test_data' => $prompt_params,
                'performance_metrics' => [
                    'generation_time' => round($total_time, 2),
                    'prompt_length' => strlen($prompt),
                    'estimated_tokens' => round(strlen($prompt) / 4)
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            $total_time = (microtime(true) - $start_time) * 1000;
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'test_data' => $test_data,
                'performance_metrics' => [
                    'generation_time' => round($total_time, 2)
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Validate context data (Testing Lab integration)
     *
     * @param array $test_data Test parameters
     * @return array Validation results
     */
    public function validate_context(array $test_data): array {
        $context_data = $test_data['context_data'] ?? $test_data['test_data'] ?? [];
        $validation_type = $test_data['validation_type'] ?? 'workout_generation';
        
        $validation_results = [];
        $errors = [];
        $warnings = [];
        
        // Required fields for workout generation
        $required_fields = ['duration'];
        $recommended_fields = ['fitness_level', 'goals', 'equipment'];
        
        // Check required fields
        foreach ($required_fields as $field) {
            if (empty($context_data[$field])) {
                $errors[] = "Missing required field: {$field}";
            } else {
                $validation_results[$field] = 'valid';
            }
        }
        
        // Check recommended fields
        foreach ($recommended_fields as $field) {
            if (empty($context_data[$field])) {
                $warnings[] = "Missing recommended field: {$field}";
                $validation_results[$field] = 'missing';
            } else {
                $validation_results[$field] = 'valid';
            }
        }
        
        $completeness = $this->calculateContextCompleteness($context_data);
        
        return [
            'success' => empty($errors),
            'test_id' => $test_data['test_id'] ?? 'test_' . time(),
            'test_type' => 'context_validation',
            'validation_type' => $validation_type,
            'context_data' => $context_data,
            'validation_results' => $validation_results,
            'errors' => $errors,
            'warnings' => $warnings,
            'completeness' => $completeness,
            'field_count' => count($context_data),
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    /**
     * Calculate context completeness percentage
     *
     * @param array $context_data Context data
     * @return float Completeness percentage
     */
    private function calculateContextCompleteness(array $context_data): float {
        $expected_fields = [
            'duration', 'fitness_level', 'goals', 'equipment',
            'stress_level', 'energy_level', 'sleep_quality', 'restrictions'
        ];
        
        $present_fields = 0;
        foreach ($expected_fields as $field) {
            if (!empty($context_data[$field])) {
                $present_fields++;
            }
        }
        
        return round(($present_fields / count($expected_fields)) * 100, 1);
    }
} 