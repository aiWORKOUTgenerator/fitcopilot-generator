<?php
/**
 * PerformanceMonitor - AI System Performance Monitoring
 * 
 * Comprehensive performance tracking for API calls, memory usage, token estimation,
 * error rates, and system health metrics for the AI workout generation system.
 */

namespace FitCopilot\Service\Debug;

use FitCopilot\Service\Debug\DebugLogger;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PerformanceMonitor Class
 * 
 * Real-time performance monitoring and analytics
 */
class PerformanceMonitor {
    
    /**
     * Performance tracking data
     *
     * @var array
     */
    private $metrics = [];
    
    /**
     * Active performance sessions
     *
     * @var array
     */
    private $sessions = [];
    
    /**
     * Performance thresholds
     *
     * @var array
     */
    private $thresholds = [
        'api_timeout_warning' => 25000,    // 25 seconds
        'api_timeout_critical' => 30000,   // 30 seconds
        'memory_warning_mb' => 64,         // 64 MB
        'memory_critical_mb' => 128,       // 128 MB
        'error_rate_warning' => 0.1,       // 10%
        'error_rate_critical' => 0.25,     // 25%
        'token_efficiency_minimum' => 0.7  // 70% efficiency
    ];
    
    /**
     * Start performance monitoring session
     *
     * @param string $session_id Unique session identifier
     * @param string $operation Operation being monitored
     * @param array $context Additional context data
     * @return void
     */
    public function startSession(string $session_id, string $operation, array $context = []): void {
        $this->sessions[$session_id] = [
            'operation' => $operation,
            'start_time' => microtime(true),
            'start_memory' => memory_get_usage(true),
            'start_peak_memory' => memory_get_peak_usage(true),
            'context' => $context,
            'checkpoints' => [],
            'status' => 'active'
        ];
        
        DebugLogger::log("Performance monitoring started for {$operation}", 'debug', [
            'session_id' => $session_id,
            'operation' => $operation,
            'context' => $context
        ]);
    }
    
    /**
     * Add checkpoint to performance session
     *
     * @param string $session_id Session identifier
     * @param string $checkpoint_name Checkpoint identifier
     * @param array $data Additional checkpoint data
     * @return void
     */
    public function addCheckpoint(string $session_id, string $checkpoint_name, array $data = []): void {
        if (!isset($this->sessions[$session_id])) {
            return;
        }
        
        $current_time = microtime(true);
        $current_memory = memory_get_usage(true);
        
        $this->sessions[$session_id]['checkpoints'][$checkpoint_name] = [
            'timestamp' => $current_time,
            'elapsed_time' => ($current_time - $this->sessions[$session_id]['start_time']) * 1000, // ms
            'memory_usage' => $current_memory,
            'memory_delta' => $current_memory - $this->sessions[$session_id]['start_memory'],
            'data' => $data
        ];
    }
    
    /**
     * End performance monitoring session
     *
     * @param string $session_id Session identifier
     * @param array $result_data Result data and metrics
     * @return array Performance metrics
     */
    public function endSession(string $session_id, array $result_data = []): array {
        if (!isset($this->sessions[$session_id])) {
            return [];
        }
        
        $session = &$this->sessions[$session_id];
        $end_time = microtime(true);
        $end_memory = memory_get_usage(true);
        $peak_memory = memory_get_peak_usage(true);
        
        // Calculate final metrics
        $metrics = [
            'session_id' => $session_id,
            'operation' => $session['operation'],
            'total_time' => ($end_time - $session['start_time']) * 1000, // ms
            'memory_usage' => [
                'start' => $session['start_memory'],
                'end' => $end_memory,
                'delta' => $end_memory - $session['start_memory'],
                'peak' => $peak_memory,
                'peak_delta' => $peak_memory - $session['start_peak_memory']
            ],
            'checkpoints' => $session['checkpoints'],
            'context' => $session['context'],
            'result_data' => $result_data,
            'timestamp' => time(),
            'status' => 'completed'
        ];
        
        // Analyze performance
        $analysis = $this->analyzePerformance($metrics);
        $metrics['analysis'] = $analysis;
        
        // Store metrics
        $this->storeMetrics($metrics);
        
        // Log performance results
        $this->logPerformanceResults($metrics);
        
        // Clean up session
        unset($this->sessions[$session_id]);
        
        return $metrics;
    }
    
    /**
     * Track API call performance
     *
     * @param string $endpoint API endpoint called
     * @param array $request_data Request parameters
     * @param array $response_data Response data
     * @param float $duration_ms Call duration in milliseconds
     * @param bool $success Whether call was successful
     * @return void
     */
    public function trackApiCall(string $endpoint, array $request_data, array $response_data, float $duration_ms, bool $success): void {
        $metrics = [
            'type' => 'api_call',
            'endpoint' => $endpoint,
            'duration_ms' => $duration_ms,
            'success' => $success,
            'request_size' => strlen(json_encode($request_data)),
            'response_size' => strlen(json_encode($response_data)),
            'token_count' => $this->estimateTokenCount($request_data, $response_data),
            'timestamp' => time(),
            'context' => [
                'user_id' => get_current_user_id(),
                'request_hash' => md5(json_encode($request_data))
            ]
        ];
        
        // Check performance thresholds
        if ($duration_ms > $this->thresholds['api_timeout_critical']) {
            $metrics['alert'] = 'critical_timeout';
            DebugLogger::log("Critical API timeout detected", 'critical', $metrics);
        } elseif ($duration_ms > $this->thresholds['api_timeout_warning']) {
            $metrics['alert'] = 'warning_timeout';
            DebugLogger::log("API timeout warning", 'warning', $metrics);
        }
        
        $this->storeMetrics($metrics);
    }
    
    /**
     * Get system health metrics
     *
     * @return array System health status
     */
    public function getSystemHealth(): array {
        // Memory usage
        $memory_usage = memory_get_usage(true);
        $memory_limit = $this->parseMemoryLimit(ini_get('memory_limit'));
        $memory_percentage = ($memory_usage / $memory_limit) * 100;
        
        // Recent error rates
        $error_rates = $this->calculateErrorRates();
        
        // API performance averages
        $api_performance = $this->getApiPerformanceAverages();
        
        // System load (if available)
        $system_load = function_exists('sys_getloadavg') ? sys_getloadavg() : null;
        
        // WordPress performance
        $wp_performance = [
            'db_queries' => get_num_queries(),
            'wp_memory_usage' => size_format(memory_get_usage()),
            'wp_memory_peak' => size_format(memory_get_peak_usage()),
            'wp_memory_limit' => ini_get('memory_limit')
        ];
        
        $health_status = [
            'overall_status' => $this->calculateOverallHealth($memory_percentage, $error_rates, $api_performance),
            'memory' => [
                'usage_bytes' => $memory_usage,
                'usage_mb' => round($memory_usage / 1024 / 1024, 2),
                'limit_bytes' => $memory_limit,
                'limit_mb' => round($memory_limit / 1024 / 1024, 2),
                'percentage' => round($memory_percentage, 2),
                'status' => $this->getMemoryHealthStatus($memory_percentage)
            ],
            'error_rates' => $error_rates,
            'api_performance' => $api_performance,
            'system_load' => $system_load,
            'wordpress' => $wp_performance,
            'thresholds' => $this->thresholds,
            'timestamp' => time()
        ];
        
        return $health_status;
    }
    
    /**
     * Get performance metrics for a time period
     *
     * @param int $hours Number of hours to look back
     * @return array Performance metrics
     */
    public function getPerformanceMetrics(int $hours = 24): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_performance_metrics';
        $since_timestamp = time() - ($hours * 3600);
        
        // Get API call metrics
        $api_metrics = $wpdb->get_results($wpdb->prepare("
            SELECT 
                endpoint,
                AVG(duration_ms) as avg_duration,
                MAX(duration_ms) as max_duration,
                MIN(duration_ms) as min_duration,
                COUNT(*) as total_calls,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_calls,
                AVG(token_count) as avg_tokens
            FROM {$table_name} 
            WHERE type = 'api_call' AND timestamp > %d 
            GROUP BY endpoint
        ", $since_timestamp), ARRAY_A);
        
        // Get session metrics
        $session_metrics = $wpdb->get_results($wpdb->prepare("
            SELECT 
                operation,
                AVG(total_time) as avg_duration,
                MAX(total_time) as max_duration,
                COUNT(*) as total_sessions
            FROM {$table_name} 
            WHERE type = 'session' AND timestamp > %d 
            GROUP BY operation
        ", $since_timestamp), ARRAY_A);
        
        // Calculate trends
        $trends = $this->calculatePerformanceTrends($hours);
        
        return [
            'period_hours' => $hours,
            'api_metrics' => $api_metrics,
            'session_metrics' => $session_metrics,
            'trends' => $trends,
            'generated_at' => time()
        ];
    }
    
    /**
     * Analyze performance data for issues
     *
     * @param array $metrics Performance metrics
     * @return array Analysis results
     */
    private function analyzePerformance(array $metrics): array {
        $analysis = [
            'overall_rating' => 'good',
            'issues' => [],
            'recommendations' => [],
            'efficiency_score' => 1.0
        ];
        
        // Analyze timing
        if ($metrics['total_time'] > $this->thresholds['api_timeout_critical']) {
            $analysis['overall_rating'] = 'critical';
            $analysis['issues'][] = 'Execution time exceeds critical threshold';
            $analysis['recommendations'][] = 'Investigate timeout causes and optimize critical path';
        } elseif ($metrics['total_time'] > $this->thresholds['api_timeout_warning']) {
            $analysis['overall_rating'] = 'warning';
            $analysis['issues'][] = 'Execution time exceeds warning threshold';
            $analysis['recommendations'][] = 'Monitor performance and consider optimization';
        }
        
        // Analyze memory usage
        $memory_mb = $metrics['memory_usage']['peak'] / 1024 / 1024;
        if ($memory_mb > $this->thresholds['memory_critical_mb']) {
            $analysis['overall_rating'] = 'critical';
            $analysis['issues'][] = 'High memory usage detected';
            $analysis['recommendations'][] = 'Optimize memory-intensive operations';
        } elseif ($memory_mb > $this->thresholds['memory_warning_mb']) {
            if ($analysis['overall_rating'] === 'good') {
                $analysis['overall_rating'] = 'warning';
            }
            $analysis['issues'][] = 'Elevated memory usage';
            $analysis['recommendations'][] = 'Monitor memory consumption patterns';
        }
        
        // Calculate efficiency score
        $analysis['efficiency_score'] = $this->calculateEfficiencyScore($metrics);
        
        return $analysis;
    }
    
    /**
     * Store performance metrics in database
     *
     * @param array $metrics Metrics to store
     * @return bool Success status
     */
    private function storeMetrics(array $metrics): bool {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_performance_metrics';
        
        // Ensure table exists
        $this->createMetricsTable();
        
        $data = [
            'timestamp' => $metrics['timestamp'],
            'type' => $metrics['type'] ?? 'session',
            'operation' => $metrics['operation'] ?? $metrics['endpoint'] ?? 'unknown',
            'duration_ms' => $metrics['total_time'] ?? $metrics['duration_ms'] ?? 0,
            'memory_usage' => isset($metrics['memory_usage']) ? json_encode($metrics['memory_usage']) : null,
            'success' => $metrics['success'] ?? true,
            'token_count' => $metrics['token_count'] ?? 0,
            'context' => json_encode($metrics['context'] ?? []),
            'analysis' => isset($metrics['analysis']) ? json_encode($metrics['analysis']) : null
        ];
        
        return $wpdb->insert($table_name, $data) !== false;
    }
    
    /**
     * Create performance metrics table
     *
     * @return bool Success status
     */
    private function createMetricsTable(): bool {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_performance_metrics';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            timestamp int(11) NOT NULL,
            type varchar(50) NOT NULL,
            operation varchar(100) NOT NULL,
            duration_ms decimal(10,2) NOT NULL,
            memory_usage text,
            success tinyint(1) DEFAULT 1,
            token_count int(11) DEFAULT 0,
            context longtext,
            analysis longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_timestamp (timestamp),
            INDEX idx_type (type),
            INDEX idx_operation (operation),
            INDEX idx_success (success)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        return true;
    }
    
    /**
     * Calculate error rates for recent operations
     *
     * @return array Error rate statistics
     */
    private function calculateErrorRates(): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_performance_metrics';
        $since_timestamp = time() - 3600; // Last hour
        
        $results = $wpdb->get_row($wpdb->prepare("
            SELECT 
                COUNT(*) as total_operations,
                SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_operations
            FROM {$table_name} 
            WHERE timestamp > %d
        ", $since_timestamp), ARRAY_A);
        
        $total = (int) ($results['total_operations'] ?? 0);
        $failed = (int) ($results['failed_operations'] ?? 0);
        $error_rate = $total > 0 ? $failed / $total : 0;
        
        return [
            'total_operations' => $total,
            'failed_operations' => $failed,
            'error_rate' => round($error_rate, 4),
            'status' => $this->getErrorRateStatus($error_rate)
        ];
    }
    
    /**
     * Estimate token count from request/response data
     *
     * @param array $request Request data
     * @param array $response Response data
     * @return int Estimated token count
     */
    private function estimateTokenCount(array $request, array $response): int {
        $request_text = json_encode($request);
        $response_text = json_encode($response);
        $total_chars = strlen($request_text) + strlen($response_text);
        
        // Rough estimation: ~4 characters per token
        return (int) ceil($total_chars / 4);
    }
    
    /**
     * Parse memory limit string to bytes
     *
     * @param string $limit Memory limit string (e.g., "128M")
     * @return int Memory limit in bytes
     */
    private function parseMemoryLimit(string $limit): int {
        $limit = trim($limit);
        $last = strtolower(substr($limit, -1));
        $value = (int) substr($limit, 0, -1);
        
        switch ($last) {
            case 'g':
                $value *= 1024 * 1024 * 1024;
                break;
            case 'm':
                $value *= 1024 * 1024;
                break;
            case 'k':
                $value *= 1024;
                break;
        }
        
        return $value;
    }
    
    /**
     * Calculate overall system health status
     *
     * @param float $memory_percentage Memory usage percentage
     * @param array $error_rates Error rate data
     * @param array $api_performance API performance data
     * @return string Health status
     */
    private function calculateOverallHealth(float $memory_percentage, array $error_rates, array $api_performance): string {
        if ($memory_percentage > 90 || $error_rates['error_rate'] > $this->thresholds['error_rate_critical']) {
            return 'critical';
        }
        
        if ($memory_percentage > 75 || $error_rates['error_rate'] > $this->thresholds['error_rate_warning']) {
            return 'warning';
        }
        
        return 'healthy';
    }
    
    /**
     * Get memory health status
     *
     * @param float $memory_percentage Memory usage percentage
     * @return string Memory health status
     */
    private function getMemoryHealthStatus(float $memory_percentage): string {
        if ($memory_percentage > 90) {
            return 'critical';
        } elseif ($memory_percentage > 75) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }
    
    /**
     * Get error rate status
     *
     * @param float $error_rate Error rate (0-1)
     * @return string Error rate status
     */
    private function getErrorRateStatus(float $error_rate): string {
        if ($error_rate > $this->thresholds['error_rate_critical']) {
            return 'critical';
        } elseif ($error_rate > $this->thresholds['error_rate_warning']) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }
    
    /**
     * Calculate efficiency score
     *
     * @param array $metrics Performance metrics
     * @return float Efficiency score (0-1)
     */
    private function calculateEfficiencyScore(array $metrics): float {
        // Base score
        $score = 1.0;
        
        // Penalize for excessive time
        if (isset($metrics['total_time']) && $metrics['total_time'] > $this->thresholds['api_timeout_warning']) {
            $score -= 0.2;
        }
        
        // Penalize for high memory usage
        if (isset($metrics['memory_usage']['peak'])) {
            $memory_mb = $metrics['memory_usage']['peak'] / 1024 / 1024;
            if ($memory_mb > $this->thresholds['memory_warning_mb']) {
                $score -= 0.1;
            }
        }
        
        return max(0, $score);
    }
    
    /**
     * Get API performance averages
     *
     * @return array API performance data
     */
    private function getApiPerformanceAverages(): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_performance_metrics';
        $since_timestamp = time() - 3600; // Last hour
        
        $results = $wpdb->get_row($wpdb->prepare("
            SELECT 
                AVG(duration_ms) as avg_duration,
                MAX(duration_ms) as max_duration,
                MIN(duration_ms) as min_duration,
                COUNT(*) as total_calls
            FROM {$table_name} 
            WHERE type = 'api_call' AND timestamp > %d
        ", $since_timestamp), ARRAY_A);
        
        return [
            'avg_duration_ms' => round((float) ($results['avg_duration'] ?? 0), 2),
            'max_duration_ms' => round((float) ($results['max_duration'] ?? 0), 2),
            'min_duration_ms' => round((float) ($results['min_duration'] ?? 0), 2),
            'total_calls' => (int) ($results['total_calls'] ?? 0)
        ];
    }
    
    /**
     * Calculate performance trends
     *
     * @param int $hours Hours to analyze
     * @return array Trend data
     */
    private function calculatePerformanceTrends(int $hours): array {
        // This would be implemented to calculate trends over time
        // For now, return basic trend structure
        return [
            'api_response_time' => 'stable',
            'error_rate' => 'stable', 
            'memory_usage' => 'stable',
            'request_volume' => 'stable'
        ];
    }
    
    /**
     * Log performance results
     *
     * @param array $metrics Performance metrics
     * @return void
     */
    private function logPerformanceResults(array $metrics): void {
        $level = 'info';
        
        if (isset($metrics['analysis']['overall_rating'])) {
            switch ($metrics['analysis']['overall_rating']) {
                case 'critical':
                    $level = 'critical';
                    break;
                case 'warning':
                    $level = 'warning';
                    break;
            }
        }
        
        DebugLogger::log("Performance monitoring completed for {$metrics['operation']}", $level, [
            'session_id' => $metrics['session_id'],
            'duration_ms' => $metrics['total_time'],
            'memory_peak_mb' => round($metrics['memory_usage']['peak'] / 1024 / 1024, 2),
            'efficiency_score' => $metrics['analysis']['efficiency_score'] ?? 1.0,
            'issues' => $metrics['analysis']['issues'] ?? []
        ]);
    }
} 