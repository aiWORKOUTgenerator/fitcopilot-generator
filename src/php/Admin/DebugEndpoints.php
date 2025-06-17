<?php
/**
 * Debug Endpoints - WordPress Admin Integration for Debug Dashboard
 * 
 * Provides comprehensive admin dashboard interface for system debugging,
 * log streaming, performance monitoring, and development tools
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
        $this->initializeServices();
        $this->registerHooks();
    }
    
    /**
     * Initialize debug services
     *
     * @return void
     */
    private function initializeServices(): void {
        $this->services = [
            'log_manager' => new LogManager(),
            'log_streamer' => new LogStreamer(),
            'performance_monitor' => new PerformanceMonitor(),
            'response_debugger' => new ResponseDebugger()
        ];
    }
    
    /**
     * Register WordPress hooks
     *
     * @return void
     */
    private function registerHooks(): void {
        add_action('admin_menu', [$this, 'registerAdminMenus']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
        add_action('wp_ajax_fitcopilot_debug_logs', [$this, 'handleDebugLogsAjax']);
        add_action('wp_ajax_fitcopilot_debug_stream', [$this, 'handleDebugStreamAjax']);
        add_action('wp_ajax_fitcopilot_debug_performance', [$this, 'handlePerformanceAjax']);
        add_action('wp_ajax_fitcopilot_debug_response', [$this, 'handleResponseAnalysisAjax']);
        add_action('wp_ajax_fitcopilot_debug_clear_logs', [$this, 'handleClearLogsAjax']);
        add_action('wp_ajax_fitcopilot_debug_export_logs', [$this, 'handleExportLogsAjax']);
        add_action('wp_ajax_fitcopilot_debug_system_info', [$this, 'handleSystemInfoAjax']);
    }
    
    /**
     * Register admin menu pages
     *
     * @return void
     */
    public function registerAdminMenus(): void {
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
    }
    
    /**
     * Enqueue admin assets
     *
     * @param string $hook_suffix Current admin page
     * @return void
     */
    public function enqueueAdminAssets(string $hook_suffix): void {
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
    }
    
    /**
     * Render main debug dashboard
     *
     * @return void
     */
    public function renderDebugDashboard(): void {
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
     * @return void
     */
    public function handleDebugLogsAjax(): void {
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
    }
    
    /**
     * Handle debug stream AJAX request
     *
     * @return void
     */
    public function handleDebugStreamAjax(): void {
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
    }
    
    /**
     * Handle performance AJAX request
     *
     * @return void
     */
    public function handlePerformanceAjax(): void {
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $metrics = $this->services['performance_monitor']->getCurrentMetrics();
        wp_send_json_success($metrics);
    }
    
    /**
     * Handle response analysis AJAX request
     *
     * @return void
     */
    public function handleResponseAnalysisAjax(): void {
        check_ajax_referer('fitcopilot_debug_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $response_json = stripslashes($_POST['response'] ?? '');
        $analysis = $this->services['response_debugger']->analyzeResponse($response_json);
        
        wp_send_json_success($analysis);
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
} 