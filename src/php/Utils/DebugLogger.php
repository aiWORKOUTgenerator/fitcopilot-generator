<?php
/**
 * DebugLogger - Enhanced Error Logging System
 * 
 * Provides structured logging with real-time streaming capabilities,
 * error categorization, performance metrics, and request/response capture.
 */

namespace FitCopilot\Utils;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DebugLogger Class
 * 
 * Enhanced logging system for debugging and monitoring
 */
class DebugLogger {
    
    /**
     * Log levels
     */
    const LEVEL_DEBUG = 'debug';
    const LEVEL_INFO = 'info';
    const LEVEL_WARNING = 'warning';
    const LEVEL_ERROR = 'error';
    const LEVEL_CRITICAL = 'critical';
    
    /**
     * Log categories
     */
    const CATEGORY_WORKOUT_GENERATION = 'workout_generation';
    const CATEGORY_PROMPT_ENGINEERING = 'prompt_engineering';
    const CATEGORY_API_COMMUNICATION = 'api_communication';
    const CATEGORY_CONTEXT_MANAGEMENT = 'context_management';
    const CATEGORY_PERFORMANCE = 'performance';
    const CATEGORY_VALIDATION = 'validation';
    const CATEGORY_SYSTEM = 'system';
    
    /**
     * Log storage option name
     */
    const LOG_OPTION_NAME = 'fitcopilot_debug_logs';
    
    /**
     * Maximum number of logs to store
     */
    const MAX_LOGS = 1000;
    
    /**
     * Log a debug message
     *
     * @param string $message Log message
     * @param array $context Additional context data
     * @param string $category Log category
     */
    public static function debug(string $message, array $context = [], string $category = self::CATEGORY_SYSTEM): void {
        self::log(self::LEVEL_DEBUG, $message, $context, $category);
    }
    
    /**
     * Log an info message
     *
     * @param string $message Log message
     * @param array $context Additional context data
     * @param string $category Log category
     */
    public static function info(string $message, array $context = [], string $category = self::CATEGORY_SYSTEM): void {
        self::log(self::LEVEL_INFO, $message, $context, $category);
    }
    
    /**
     * Log a warning message
     *
     * @param string $message Log message
     * @param array $context Additional context data
     * @param string $category Log category
     */
    public static function warning(string $message, array $context = [], string $category = self::CATEGORY_SYSTEM): void {
        self::log(self::LEVEL_WARNING, $message, $context, $category);
    }
    
    /**
     * Log an error message
     *
     * @param string $message Log message
     * @param array $context Additional context data
     * @param string $category Log category
     */
    public static function error(string $message, array $context = [], string $category = self::CATEGORY_SYSTEM): void {
        self::log(self::LEVEL_ERROR, $message, $context, $category);
    }
    
    /**
     * Log a critical message
     *
     * @param string $message Log message
     * @param array $context Additional context data
     * @param string $category Log category
     */
    public static function critical(string $message, array $context = [], string $category = self::CATEGORY_SYSTEM): void {
        self::log(self::LEVEL_CRITICAL, $message, $context, $category);
    }
    
    /**
     * Log a message with specified level
     *
     * @param string $level Log level
     * @param string $message Log message
     * @param array $context Additional context data
     * @param string $category Log category
     */
    public static function log(string $level, string $message, array $context = [], string $category = self::CATEGORY_SYSTEM): void {
        $log_entry = [
            'id' => self::generateLogId(),
            'timestamp' => current_time('mysql'),
            'microtime' => microtime(true),
            'level' => $level,
            'category' => $category,
            'message' => $message,
            'context' => $context,
            'user_id' => get_current_user_id(),
            'request_id' => self::getRequestId(),
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true)
        ];
        
        // Add stack trace for errors and critical messages
        if (in_array($level, [self::LEVEL_ERROR, self::LEVEL_CRITICAL])) {
            $log_entry['stack_trace'] = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 10);
        }
        
        // Store the log entry
        self::storeLogEntry($log_entry);
        
        // Also log to WordPress debug log if enabled
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $formatted_message = sprintf(
                '[FitCopilot %s:%s] %s %s',
                strtoupper($level),
                $category,
                $message,
                !empty($context) ? '| Context: ' . json_encode($context) : ''
            );
            error_log($formatted_message);
        }
        
        // Trigger real-time update hook
        do_action('fitcopilot_debug_log_added', $log_entry);
    }
    
    /**
     * Get logs with optional filtering
     *
     * @param array $filters Filter criteria
     * @param int $limit Number of logs to return
     * @param int $offset Offset for pagination
     * @return array Array of log entries
     */
    public static function getLogs(array $filters = [], int $limit = 100, int $offset = 0): array {
        $logs = get_option(self::LOG_OPTION_NAME, []);
        
        // Apply filters
        if (!empty($filters)) {
            $logs = self::filterLogs($logs, $filters);
        }
        
        // Sort by timestamp (newest first)
        usort($logs, function($a, $b) {
            return $b['microtime'] <=> $a['microtime'];
        });
        
        // Apply pagination
        return array_slice($logs, $offset, $limit);
    }
    
    /**
     * Get total log count with optional filtering
     *
     * @param array $filters Filter criteria
     * @return int Total number of logs
     */
    public static function getLogCount(array $filters = []): int {
        $logs = get_option(self::LOG_OPTION_NAME, []);
        
        if (!empty($filters)) {
            $logs = self::filterLogs($logs, $filters);
        }
        
        return count($logs);
    }
    
    /**
     * Clear all logs
     */
    public static function clearLogs(): void {
        delete_option(self::LOG_OPTION_NAME);
        do_action('fitcopilot_debug_logs_cleared');
    }
    
    /**
     * Export logs as JSON
     *
     * @param array $filters Optional filters
     * @return string JSON string of logs
     */
    public static function exportLogs(array $filters = []): string {
        $logs = self::getLogs($filters, 10000); // Export up to 10k logs
        
        $export_data = [
            'export_timestamp' => current_time('mysql'),
            'total_logs' => count($logs),
            'filters_applied' => $filters,
            'logs' => $logs
        ];
        
        return json_encode($export_data, JSON_PRETTY_PRINT);
    }
    
    /**
     * Get log statistics
     *
     * @return array Log statistics
     */
    public static function getLogStatistics(): array {
        $logs = get_option(self::LOG_OPTION_NAME, []);
        
        $stats = [
            'total_logs' => count($logs),
            'by_level' => [],
            'by_category' => [],
            'recent_activity' => [],
            'memory_usage' => [
                'current' => memory_get_usage(true),
                'peak' => memory_get_peak_usage(true)
            ]
        ];
        
        // Count by level and category
        foreach ($logs as $log) {
            $level = $log['level'];
            $category = $log['category'];
            
            $stats['by_level'][$level] = ($stats['by_level'][$level] ?? 0) + 1;
            $stats['by_category'][$category] = ($stats['by_category'][$category] ?? 0) + 1;
        }
        
        // Recent activity (last hour)
        $one_hour_ago = time() - 3600;
        $recent_logs = array_filter($logs, function($log) use ($one_hour_ago) {
            return $log['microtime'] > $one_hour_ago;
        });
        
        $stats['recent_activity'] = [
            'count' => count($recent_logs),
            'errors' => count(array_filter($recent_logs, function($log) {
                return in_array($log['level'], [self::LEVEL_ERROR, self::LEVEL_CRITICAL]);
            }))
        ];
        
        return $stats;
    }
    
    /**
     * Log API request/response
     *
     * @param string $endpoint API endpoint
     * @param array $request_data Request data
     * @param mixed $response Response data
     * @param float $duration Request duration in milliseconds
     * @param bool $success Whether request was successful
     */
    public static function logApiCall(string $endpoint, array $request_data, $response, float $duration, bool $success = true): void {
        $context = [
            'endpoint' => $endpoint,
            'request_data' => $request_data,
            'response' => $response,
            'duration_ms' => $duration,
            'success' => $success,
            'response_size' => is_string($response) ? strlen($response) : strlen(json_encode($response))
        ];
        
        $level = $success ? self::LEVEL_INFO : self::LEVEL_ERROR;
        $message = sprintf(
            'API call to %s %s in %.2fms',
            $endpoint,
            $success ? 'succeeded' : 'failed',
            $duration
        );
        
        self::log($level, $message, $context, self::CATEGORY_API_COMMUNICATION);
    }
    
    /**
     * Log performance metrics
     *
     * @param string $operation Operation name
     * @param float $duration Duration in milliseconds
     * @param array $metrics Additional metrics
     */
    public static function logPerformance(string $operation, float $duration, array $metrics = []): void {
        $context = array_merge([
            'operation' => $operation,
            'duration_ms' => $duration,
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true)
        ], $metrics);
        
        $message = sprintf('Performance: %s completed in %.2fms', $operation, $duration);
        
        self::log(self::LEVEL_INFO, $message, $context, self::CATEGORY_PERFORMANCE);
    }
    
    /**
     * Store log entry
     *
     * @param array $log_entry Log entry to store
     */
    private static function storeLogEntry(array $log_entry): void {
        $logs = get_option(self::LOG_OPTION_NAME, []);
        
        // Add new log entry
        $logs[] = $log_entry;
        
        // Maintain maximum log count
        if (count($logs) > self::MAX_LOGS) {
            // Remove oldest logs
            $logs = array_slice($logs, -self::MAX_LOGS);
        }
        
        update_option(self::LOG_OPTION_NAME, $logs);
    }
    
    /**
     * Filter logs based on criteria
     *
     * @param array $logs Log entries
     * @param array $filters Filter criteria
     * @return array Filtered logs
     */
    private static function filterLogs(array $logs, array $filters): array {
        return array_filter($logs, function($log) use ($filters) {
            // Filter by level
            if (!empty($filters['level']) && $log['level'] !== $filters['level']) {
                return false;
            }
            
            // Filter by category
            if (!empty($filters['category']) && $log['category'] !== $filters['category']) {
                return false;
            }
            
            // Filter by date range
            if (!empty($filters['start_date'])) {
                $start_timestamp = strtotime($filters['start_date']);
                if ($log['microtime'] < $start_timestamp) {
                    return false;
                }
            }
            
            if (!empty($filters['end_date'])) {
                $end_timestamp = strtotime($filters['end_date']) + 86400; // End of day
                if ($log['microtime'] > $end_timestamp) {
                    return false;
                }
            }
            
            // Filter by message content
            if (!empty($filters['search']) && 
                stripos($log['message'], $filters['search']) === false) {
                return false;
            }
            
            // Filter by user
            if (!empty($filters['user_id']) && $log['user_id'] != $filters['user_id']) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Generate unique log ID
     *
     * @return string Unique log ID
     */
    private static function generateLogId(): string {
        return uniqid('log_', true);
    }
    
    /**
     * Get current request ID
     *
     * @return string Request ID
     */
    private static function getRequestId(): string {
        static $request_id = null;
        
        if ($request_id === null) {
            $request_id = uniqid('req_', true);
        }
        
        return $request_id;
    }
    
    /**
     * Get available log levels
     *
     * @return array Available log levels
     */
    public static function getAvailableLevels(): array {
        return [
            self::LEVEL_DEBUG,
            self::LEVEL_INFO,
            self::LEVEL_WARNING,
            self::LEVEL_ERROR,
            self::LEVEL_CRITICAL
        ];
    }
    
    /**
     * Get available log categories
     *
     * @return array Available log categories
     */
    public static function getAvailableCategories(): array {
        return [
            self::CATEGORY_WORKOUT_GENERATION,
            self::CATEGORY_PROMPT_ENGINEERING,
            self::CATEGORY_API_COMMUNICATION,
            self::CATEGORY_CONTEXT_MANAGEMENT,
            self::CATEGORY_PERFORMANCE,
            self::CATEGORY_VALIDATION,
            self::CATEGORY_SYSTEM
        ];
    }
} 