<?php
/**
 * LogManager - Comprehensive Log Management System
 * 
 * Handles log rotation, cleanup, export, search, and filtering operations
 * for the AI workout generation debugging infrastructure.
 */

namespace FitCopilot\Service\Debug;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * LogManager Class
 * 
 * Complete log management with rotation, cleanup, and export capabilities
 */
class LogManager {
    
    /**
     * Log management configuration
     *
     * @var array
     */
    private $config = [
        'max_log_age_days' => 30,
        'max_log_entries' => 10000,
        'rotation_threshold' => 5000,
        'export_batch_size' => 1000,
        'cleanup_frequency' => 'daily',
        'compression_enabled' => true
    ];
    
    /**
     * Log level priorities
     *
     * @var array
     */
    private $log_levels = [
        'debug' => 0,
        'info' => 1,
        'notice' => 2,
        'warning' => 3,
        'error' => 4,
        'critical' => 5,
        'alert' => 6,
        'emergency' => 7
    ];
    
    /**
     * Constructor
     */
    public function __construct() {
        // Schedule cleanup if not already scheduled
        if (!wp_next_scheduled('fitcopilot_log_cleanup')) {
            wp_schedule_event(time(), 'daily', 'fitcopilot_log_cleanup');
        }
        
        // Hook cleanup function
        add_action('fitcopilot_log_cleanup', [$this, 'performCleanup']);
        
        // Ensure log tables exist
        $this->createLogTables();
    }
    
    /**
     * Get log statistics for a time period
     *
     * @param int $hours Number of hours to analyze
     * @return array Log statistics
     */
    public function getLogStatistics(int $hours = 24): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_debug_logs';
        $since_timestamp = time() - ($hours * 3600);
        
        // Get log level distribution
        $level_stats = $wpdb->get_results($wpdb->prepare("
            SELECT 
                level,
                COUNT(*) as count,
                COUNT(*) * 100.0 / (SELECT COUNT(*) FROM {$table_name} WHERE timestamp > %d) as percentage
            FROM {$table_name} 
            WHERE timestamp > %d 
            GROUP BY level
            ORDER BY count DESC
        ", $since_timestamp, $since_timestamp), ARRAY_A);
        
        // Get category distribution
        $category_stats = $wpdb->get_results($wpdb->prepare("
            SELECT 
                category,
                COUNT(*) as count,
                COUNT(*) * 100.0 / (SELECT COUNT(*) FROM {$table_name} WHERE timestamp > %d) as percentage
            FROM {$table_name} 
            WHERE timestamp > %d 
            GROUP BY category
            ORDER BY count DESC
        ", $since_timestamp, $since_timestamp), ARRAY_A);
        
        // Get hourly distribution
        $hourly_stats = $wpdb->get_results($wpdb->prepare("
            SELECT 
                FROM_UNIXTIME(timestamp, '%%Y-%%m-%%d %%H:00:00') as hour,
                COUNT(*) as count
            FROM {$table_name} 
            WHERE timestamp > %d 
            GROUP BY FROM_UNIXTIME(timestamp, '%%Y-%%m-%%d %%H')
            ORDER BY hour
        ", $since_timestamp), ARRAY_A);
        
        // Get error trends
        $error_trends = $this->getErrorTrends($hours);
        
        // Get top error messages
        $top_errors = $wpdb->get_results($wpdb->prepare("
            SELECT 
                message,
                COUNT(*) as count,
                level,
                category
            FROM {$table_name} 
            WHERE timestamp > %d AND level IN ('error', 'critical', 'alert', 'emergency')
            GROUP BY message, level, category
            ORDER BY count DESC
            LIMIT 10
        ", $since_timestamp), ARRAY_A);
        
        // Get overall statistics
        $total_logs = $wpdb->get_var($wpdb->prepare("
            SELECT COUNT(*) FROM {$table_name} WHERE timestamp > %d
        ", $since_timestamp));
        
        $error_count = $wpdb->get_var($wpdb->prepare("
            SELECT COUNT(*) FROM {$table_name} 
            WHERE timestamp > %d AND level IN ('error', 'critical', 'alert', 'emergency')
        ", $since_timestamp));
        
        return [
            'period_hours' => $hours,
            'total_logs' => (int) $total_logs,
            'error_count' => (int) $error_count,
            'error_rate' => $total_logs > 0 ? round(($error_count / $total_logs) * 100, 2) : 0,
            'level_distribution' => $level_stats,
            'category_distribution' => $category_stats,
            'hourly_distribution' => $hourly_stats,
            'error_trends' => $error_trends,
            'top_errors' => $top_errors,
            'generated_at' => time()
        ];
    }
    
    /**
     * Export logs in specified format
     *
     * @param string $format Export format (json, csv, xml)
     * @param array $filters Filtering criteria
     * @return string Exported data
     */
    public function exportLogs(string $format = 'json', array $filters = []): string {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_debug_logs';
        
        // Build WHERE clause from filters
        $where_conditions = ['1=1'];
        $where_values = [];
        
        if (!empty($filters['level']) && $filters['level'] !== 'all') {
            $where_conditions[] = 'level = %s';
            $where_values[] = $filters['level'];
        }
        
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $where_conditions[] = 'category = %s';
            $where_values[] = $filters['category'];
        }
        
        if (!empty($filters['since'])) {
            $where_conditions[] = 'timestamp >= %d';
            $where_values[] = $filters['since'];
        }
        
        if (!empty($filters['until'])) {
            $where_conditions[] = 'timestamp <= %d';
            $where_values[] = $filters['until'];
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        // Get logs with pagination
        $batch_size = $this->config['export_batch_size'];
        $logs = [];
        $offset = 0;
        
        do {
            $batch_sql = $wpdb->prepare("
                SELECT * FROM {$table_name} 
                WHERE {$where_clause} 
                ORDER BY timestamp DESC 
                LIMIT %d OFFSET %d
            ", array_merge($where_values, [$batch_size, $offset]));
            
            $batch_logs = $wpdb->get_results($batch_sql, ARRAY_A);
            $logs = array_merge($logs, $batch_logs);
            $offset += $batch_size;
            
        } while (count($batch_logs) === $batch_size);
        
        // Format logs for export
        $formatted_logs = array_map(function($log) {
            $log['context'] = json_decode($log['context'] ?? '{}', true);
            $log['timestamp_formatted'] = date('Y-m-d H:i:s', $log['timestamp']);
            return $log;
        }, $logs);
        
        // Export in requested format
        switch ($format) {
            case 'csv':
                return $this->exportToCsv($formatted_logs);
            case 'xml':
                return $this->exportToXml($formatted_logs);
            case 'json':
            default:
                return json_encode([
                    'export_info' => [
                        'format' => $format,
                        'filters' => $filters,
                        'total_records' => count($formatted_logs),
                        'exported_at' => date('Y-m-d H:i:s')
                    ],
                    'logs' => $formatted_logs
                ], JSON_PRETTY_PRINT);
        }
    }
    
    /**
     * Search logs with advanced criteria
     *
     * @param array $criteria Search criteria
     * @return array Search results
     */
    public function searchLogs(array $criteria): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_debug_logs';
        
        // Build search query
        $where_conditions = ['1=1'];
        $where_values = [];
        
        // Text search in message
        if (!empty($criteria['search_text'])) {
            $where_conditions[] = 'message LIKE %s';
            $where_values[] = '%' . $wpdb->esc_like($criteria['search_text']) . '%';
        }
        
        // Level filter
        if (!empty($criteria['level']) && $criteria['level'] !== 'all') {
            $where_conditions[] = 'level = %s';
            $where_values[] = $criteria['level'];
        }
        
        // Category filter
        if (!empty($criteria['category']) && $criteria['category'] !== 'all') {
            $where_conditions[] = 'category = %s';
            $where_values[] = $criteria['category'];
        }
        
        // Date range
        if (!empty($criteria['date_from'])) {
            $where_conditions[] = 'timestamp >= %d';
            $where_values[] = strtotime($criteria['date_from']);
        }
        
        if (!empty($criteria['date_to'])) {
            $where_conditions[] = 'timestamp <= %d';
            $where_values[] = strtotime($criteria['date_to'] . ' 23:59:59');
        }
        
        // Context search (JSON search)
        if (!empty($criteria['context_key']) && !empty($criteria['context_value'])) {
            $where_conditions[] = 'JSON_EXTRACT(context, %s) = %s';
            $where_values[] = '$.' . $criteria['context_key'];
            $where_values[] = $criteria['context_value'];
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        // Pagination
        $page = max(1, (int) ($criteria['page'] ?? 1));
        $per_page = min(100, max(10, (int) ($criteria['per_page'] ?? 50)));
        $offset = ($page - 1) * $per_page;
        
        // Get total count
        $count_sql = $wpdb->prepare("
            SELECT COUNT(*) FROM {$table_name} WHERE {$where_clause}
        ", $where_values);
        $total_count = $wpdb->get_var($count_sql);
        
        // Get results
        $results_sql = $wpdb->prepare("
            SELECT * FROM {$table_name} 
            WHERE {$where_clause} 
            ORDER BY timestamp DESC 
            LIMIT %d OFFSET %d
        ", array_merge($where_values, [$per_page, $offset]));
        
        $logs = $wpdb->get_results($results_sql, ARRAY_A);
        
        // Format logs
        $formatted_logs = array_map(function($log) {
            $log['context'] = json_decode($log['context'] ?? '{}', true);
            $log['timestamp_formatted'] = date('Y-m-d H:i:s', $log['timestamp']);
            return $log;
        }, $logs);
        
        return [
            'logs' => $formatted_logs,
            'pagination' => [
                'total_count' => (int) $total_count,
                'current_page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil($total_count / $per_page),
                'has_next' => $page < ceil($total_count / $per_page),
                'has_prev' => $page > 1
            ],
            'criteria' => $criteria
        ];
    }
    
    /**
     * Perform log cleanup and rotation
     *
     * @return array Cleanup results
     */
    public function performCleanup(): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_debug_logs';
        $results = [
            'cleaned_old_logs' => 0,
            'rotated_logs' => 0,
            'compressed_logs' => 0,
            'cleanup_time' => time()
        ];
        
        // Clean old logs
        $max_age_timestamp = time() - ($this->config['max_log_age_days'] * 24 * 3600);
        $old_logs_deleted = $wpdb->query($wpdb->prepare("
            DELETE FROM {$table_name} WHERE timestamp < %d
        ", $max_age_timestamp));
        $results['cleaned_old_logs'] = $old_logs_deleted;
        
        // Check if rotation is needed
        $total_logs = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
        
        if ($total_logs > $this->config['rotation_threshold']) {
            // Archive older logs
            $keep_count = $this->config['max_log_entries'];
            $archive_logs = $wpdb->query($wpdb->prepare("
                DELETE FROM {$table_name} 
                WHERE id NOT IN (
                    SELECT id FROM (
                        SELECT id FROM {$table_name} 
                        ORDER BY timestamp DESC 
                        LIMIT %d
                    ) as keep_logs
                )
            ", $keep_count));
            $results['rotated_logs'] = $archive_logs;
        }
        
        // Optimize table
        $wpdb->query("OPTIMIZE TABLE {$table_name}");
        
        return $results;
    }
    
    /**
     * Get error trends analysis
     *
     * @param int $hours Hours to analyze
     * @return array Error trends
     */
    private function getErrorTrends(int $hours): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_debug_logs';
        $since_timestamp = time() - ($hours * 3600);
        
        // Get error counts by hour
        $hourly_errors = $wpdb->get_results($wpdb->prepare("
            SELECT 
                FROM_UNIXTIME(timestamp, '%%H') as hour,
                COUNT(*) as error_count
            FROM {$table_name} 
            WHERE timestamp > %d AND level IN ('error', 'critical', 'alert', 'emergency')
            GROUP BY FROM_UNIXTIME(timestamp, '%%H')
            ORDER BY hour
        ", $since_timestamp), ARRAY_A);
        
        // Calculate trend direction
        $trend = 'stable';
        if (count($hourly_errors) >= 2) {
            $first_half = array_slice($hourly_errors, 0, floor(count($hourly_errors) / 2));
            $second_half = array_slice($hourly_errors, floor(count($hourly_errors) / 2));
            
            $first_avg = array_sum(array_column($first_half, 'error_count')) / count($first_half);
            $second_avg = array_sum(array_column($second_half, 'error_count')) / count($second_half);
            
            if ($second_avg > $first_avg * 1.2) {
                $trend = 'increasing';
            } elseif ($second_avg < $first_avg * 0.8) {
                $trend = 'decreasing';
            }
        }
        
        return [
            'hourly_errors' => $hourly_errors,
            'trend' => $trend,
            'trend_confidence' => $this->calculateTrendConfidence($hourly_errors)
        ];
    }
    
    /**
     * Calculate trend confidence score
     *
     * @param array $data Data points
     * @return float Confidence score (0-1)
     */
    private function calculateTrendConfidence(array $data): float {
        if (count($data) < 3) {
            return 0.0;
        }
        
        // Simple confidence based on data consistency
        $values = array_column($data, 'error_count');
        $mean = array_sum($values) / count($values);
        $variance = array_sum(array_map(function($x) use ($mean) {
            return pow($x - $mean, 2);
        }, $values)) / count($values);
        
        // Lower variance = higher confidence
        $confidence = 1 / (1 + $variance / max(1, $mean));
        
        return round($confidence, 2);
    }
    
    /**
     * Export logs to CSV format
     *
     * @param array $logs Log data
     * @return string CSV content
     */
    private function exportToCsv(array $logs): string {
        if (empty($logs)) {
            return "timestamp,level,category,message\n";
        }
        
        $csv = "timestamp,level,category,message,context\n";
        
        foreach ($logs as $log) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s\n",
                $log['timestamp_formatted'],
                $log['level'],
                $log['category'],
                '"' . str_replace('"', '""', $log['message']) . '"',
                '"' . str_replace('"', '""', json_encode($log['context'])) . '"'
            );
        }
        
        return $csv;
    }
    
    /**
     * Export logs to XML format
     *
     * @param array $logs Log data
     * @return string XML content
     */
    private function exportToXml(array $logs): string {
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<logs>\n";
        
        foreach ($logs as $log) {
            $xml .= "  <log>\n";
            $xml .= "    <timestamp>" . htmlspecialchars($log['timestamp_formatted']) . "</timestamp>\n";
            $xml .= "    <level>" . htmlspecialchars($log['level']) . "</level>\n";
            $xml .= "    <category>" . htmlspecialchars($log['category']) . "</category>\n";
            $xml .= "    <message><![CDATA[" . $log['message'] . "]]></message>\n";
            $xml .= "    <context><![CDATA[" . json_encode($log['context']) . "]]></context>\n";
            $xml .= "  </log>\n";
        }
        
        $xml .= "</logs>";
        
        return $xml;
    }
    
    /**
     * Create log tables if they don't exist
     *
     * @return bool Success status
     */
    private function createLogTables(): bool {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_debug_logs';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            timestamp int(11) NOT NULL,
            level varchar(20) NOT NULL,
            category varchar(50) NOT NULL,
            message text NOT NULL,
            context longtext,
            user_id bigint(20) unsigned DEFAULT NULL,
            session_id varchar(100) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_timestamp (timestamp),
            INDEX idx_level (level),
            INDEX idx_category (category),
            INDEX idx_user_id (user_id),
            INDEX idx_session_id (session_id),
            INDEX idx_level_timestamp (level, timestamp)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        return true;
    }
} 