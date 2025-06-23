<?php
/**
 * LogStreamer - Real-time Log Streaming Service
 * 
 * Provides real-time streaming of debug logs and system events using Server-Sent Events.
 * Enables live monitoring of AI workout generation system performance and errors.
 */

namespace FitCopilot\Service\Debug;

use FitCopilot\Service\Debug\DebugLogger;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * LogStreamer Class
 * 
 * Real-time log streaming with filtering and categorization
 */
class LogStreamer {
    
    /**
     * Stream configuration
     *
     * @var array
     */
    private $config = [
        'buffer_size' => 50,
        'update_interval' => 1, // seconds
        'max_stream_duration' => 3600, // 1 hour
        'compression_threshold' => 1024, // bytes
        'throttle_limit' => 100 // messages per minute
    ];
    
    /**
     * Active streams
     *
     * @var array
     */
    private $active_streams = [];
    
    /**
     * Stream filters
     *
     * @var array
     */
    private $stream_filters = [];
    
    /**
     * Start a new log stream
     *
     * @param array $filters Stream filters
     * @return string Stream ID
     */
    public function startStream(array $filters = []): string {
        $stream_id = $this->generateStreamId();
        
        $this->active_streams[$stream_id] = [
            'id' => $stream_id,
            'started_at' => time(),
            'last_update' => time(),
            'filters' => $filters,
            'last_log_id' => $this->getLastLogId($filters),
            'client_connected' => true,
            'message_count' => 0,
            'throttle_reset' => time() + 60
        ];
        
        $this->stream_filters[$stream_id] = $filters;
        
        // Store in WordPress options for persistence
        $this->saveStreamState($stream_id);
        
        return $stream_id;
    }
    
    /**
     * Get stream data for client
     *
     * @param string $stream_id Stream identifier
     * @return array Stream data
     */
    public function getStreamData(string $stream_id): array {
        if (!isset($this->active_streams[$stream_id])) {
            return ['error' => 'Stream not found'];
        }
        
        $stream = &$this->active_streams[$stream_id];
        
        // Check if stream expired
        if (time() - $stream['started_at'] > $this->config['max_stream_duration']) {
            $this->stopStream($stream_id);
            return ['error' => 'Stream expired'];
        }
        
        // Check throttling
        if ($stream['message_count'] > $this->config['throttle_limit']) {
            if (time() < $stream['throttle_reset']) {
                return ['throttled' => true, 'reset_in' => $stream['throttle_reset'] - time()];
            } else {
                // Reset throttle counter
                $stream['message_count'] = 0;
                $stream['throttle_reset'] = time() + 60;
            }
        }
        
        // Get new logs since last update
        $new_logs = $this->getNewLogs($stream_id);
        
        if (!empty($new_logs)) {
            $stream['last_update'] = time();
            $stream['last_log_id'] = end($new_logs)['id'];
            $stream['message_count'] += count($new_logs);
            
            // Update stream state
            $this->saveStreamState($stream_id);
        }
        
        return [
            'stream_id' => $stream_id,
            'logs' => $new_logs,
            'stream_info' => [
                'started_at' => $stream['started_at'],
                'last_update' => $stream['last_update'],
                'message_count' => $stream['message_count'],
                'uptime' => time() - $stream['started_at']
            ]
        ];
    }
    
    /**
     * Stop a log stream
     *
     * @param string $stream_id Stream identifier
     * @return bool Success status
     */
    public function stopStream(string $stream_id): bool {
        if (isset($this->active_streams[$stream_id])) {
            unset($this->active_streams[$stream_id]);
            unset($this->stream_filters[$stream_id]);
            
            // Remove from WordPress options
            delete_option("fitcopilot_stream_{$stream_id}");
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get all active streams
     *
     * @return array Active streams information
     */
    public function getActiveStreams(): array {
        $streams_info = [];
        
        foreach ($this->active_streams as $stream_id => $stream) {
            $streams_info[] = [
                'id' => $stream_id,
                'started_at' => $stream['started_at'],
                'uptime' => time() - $stream['started_at'],
                'message_count' => $stream['message_count'],
                'filters' => $stream['filters'],
                'status' => $this->getStreamStatus($stream_id)
            ];
        }
        
        return $streams_info;
    }
    
    /**
     * Broadcast log to all relevant streams
     *
     * @param array $log_data Log data
     * @return int Number of streams notified
     */
    public function broadcastLog(array $log_data): int {
        $notified_streams = 0;
        
        foreach ($this->active_streams as $stream_id => $stream) {
            if ($this->logMatchesFilters($log_data, $stream['filters'])) {
                // Store the log for this stream
                $this->storeBroadcastLog($stream_id, $log_data);
                $notified_streams++;
            }
        }
        
        return $notified_streams;
    }
    
    /**
     * Server-Sent Events endpoint (Optimized)
     * Enhanced with connection management, resource efficiency, and error handling
     *
     * @param string $stream_id Stream identifier
     * @return void
     */
    public function streamSSE(string $stream_id): void {
        // Validate stream exists early
        if (!isset($this->active_streams[$stream_id])) {
            http_response_code(404);
            echo "data: " . json_encode(['type' => 'error', 'message' => 'Stream not found']) . "\n\n";
            return;
        }
        
        // Set SSE headers with enhanced configuration
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Cache-Control');
        header('X-Accel-Buffering: no'); // Disable Nginx buffering
        
        // Set execution time limit (5 minutes maximum)
        set_time_limit(300);
        
        // Disable output buffering for real-time streaming
        if (ob_get_level()) {
            ob_end_clean();
        }
        
        // Send enhanced initial connection message
        echo "data: " . json_encode([
            'type' => 'connected', 
            'stream_id' => $stream_id,
            'timestamp' => time(),
            'max_duration' => 300,
            'server_time' => date('Y-m-d H:i:s')
        ]) . "\n\n";
        
        if (!$this->flushSafely()) {
            return;
        }
        
        // Initialize performance tracking variables
        $start_time = time();
        $last_activity = $start_time;
        $iteration_count = 0;
        $max_duration = 300; // 5 minutes
        $consecutive_empty_polls = 0;
        $max_empty_polls = 60; // 1 minute before longer sleep
        $logs_sent = 0;
        
        try {
            while ((time() - $start_time) < $max_duration) {
                // Early connection abort check
                if (connection_aborted()) {
                    $this->logStreamDisconnection($stream_id, 'client_disconnected', [
                        'iteration' => $iteration_count,
                        'duration' => time() - $start_time,
                        'logs_sent' => $logs_sent
                    ]);
                    break;
                }
                
            // Check if stream still exists
            if (!isset($this->active_streams[$stream_id])) {
                    echo "data: " . json_encode(['type' => 'stream_ended', 'reason' => 'stream_removed']) . "\n\n";
                    $this->flushSafely();
                break;
            }
            
                // Get new stream data with enhanced error handling
            $stream_data = $this->getStreamData($stream_id);
            
            if (isset($stream_data['error'])) {
                    echo "data: " . json_encode([
                        'type' => 'error', 
                        'message' => $stream_data['error'],
                        'timestamp' => time()
                    ]) . "\n\n";
                    $this->flushSafely();
                break;
            }
            
            if (isset($stream_data['throttled'])) {
                    echo "data: " . json_encode([
                        'type' => 'throttled', 
                        'reset_in' => $stream_data['reset_in'],
                        'timestamp' => time()
                    ]) . "\n\n";
                    $this->flushSafely();
                sleep($stream_data['reset_in']);
                continue;
            }
            
                // Process new logs with batch optimization
            if (!empty($stream_data['logs'])) {
                    $consecutive_empty_polls = 0;
                    $last_activity = time();
                    
                    // Send logs in batches for better performance
                    $batch_size = min(10, count($stream_data['logs']));
                    $log_batches = array_chunk($stream_data['logs'], $batch_size);
                    
                    foreach ($log_batches as $batch) {
                        echo "data: " . json_encode([
                            'type' => 'log_batch',
                            'logs' => $batch,
                            'batch_size' => count($batch),
                            'timestamp' => time()
                        ]) . "\n\n";
                        
                        if (!$this->flushSafely()) {
                            break 2; // Break out of both loops
                        }
                        
                        $logs_sent += count($batch);
                    }
                    
                    // Update stream statistics
                    if (isset($this->active_streams[$stream_id])) {
                        $this->active_streams[$stream_id]['logs_sent'] = ($this->active_streams[$stream_id]['logs_sent'] ?? 0) + count($stream_data['logs']);
                        $this->active_streams[$stream_id]['last_activity'] = time();
                    }
                    
                } else {
                    // No new logs - track for adaptive polling
                    $consecutive_empty_polls++;
                }
                
                // Send enhanced heartbeat with performance metrics
                if ($iteration_count % 30 === 0 || (time() - $last_activity) > 25) {
                    echo "data: " . json_encode([
                        'type' => 'heartbeat',
                        'timestamp' => time(),
                        'logs_sent' => $logs_sent,
                        'uptime' => time() - $start_time,
                        'connection_status' => 'active',
                        'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2) . 'MB'
                    ]) . "\n\n";
                    
                    if (!$this->flushSafely()) {
                        break;
                    }
                }
                
                // Adaptive sleep based on activity level for CPU efficiency
                if ($consecutive_empty_polls > $max_empty_polls) {
                    // No activity for 1 minute - reduce CPU usage
                    sleep(5);
                } elseif ($consecutive_empty_polls > 10) {
                    // Limited activity - moderate polling
                    sleep(2);
                } else {
                    // Active or recent activity - standard interval
                    sleep($this->config['update_interval'] ?? 1);
                }
                
                $iteration_count++;
                
                // Periodic memory cleanup to prevent leaks
                if ($iteration_count % 100 === 0) {
                    $this->cleanupStreamMemory($stream_id);
                }
            }
            
        } catch (Exception $e) {
            // Enhanced error reporting with context
            echo "data: " . json_encode([
                'type' => 'error',
                'message' => $e->getMessage(),
                'timestamp' => time(),
                'iteration' => $iteration_count,
                'file' => basename($e->getFile()),
                'line' => $e->getLine()
            ]) . "\n\n";
            $this->flushSafely();
            
            // Log error with full context
            error_log("[LogStreamer] SSE Error in stream {$stream_id}: " . $e->getMessage() . 
                     " at " . $e->getFile() . ":" . $e->getLine());
        }
        
        // Send comprehensive disconnection summary
        $duration = time() - $start_time;
        echo "data: " . json_encode([
            'type' => 'disconnected',
            'reason' => (time() - $start_time) >= $max_duration ? 'timeout' : 'completed',
            'summary' => [
                'total_logs_sent' => $logs_sent,
                'duration_seconds' => $duration,
                'iterations' => $iteration_count,
                'average_logs_per_minute' => $duration > 0 ? round($logs_sent / ($duration / 60), 2) : 0,
                'peak_memory_usage' => round(memory_get_peak_usage(true) / 1024 / 1024, 2) . 'MB'
            ],
            'timestamp' => time()
        ]) . "\n\n";
        $this->flushSafely();
        
        // Cleanup stream resources
        $this->stopStream($stream_id);
    }
    
    /**
     * Safely flush output with error handling
     *
     * @return bool Success status
     */
    private function flushSafely(): bool {
        try {
            if (ob_get_level()) {
                ob_flush();
            }
            flush();
            return true;
        } catch (Exception $e) {
            error_log("[LogStreamer] Flush error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clean up stream memory usage to prevent memory leaks
     *
     * @param string $stream_id Stream identifier
     * @return void
     */
    private function cleanupStreamMemory(string $stream_id): void {
        // Remove old cached logs to prevent memory buildup
        if (isset($this->active_streams[$stream_id]['cached_logs'])) {
            $cache_limit = 1000; // Keep last 1000 logs in memory
            if (count($this->active_streams[$stream_id]['cached_logs']) > $cache_limit) {
                $this->active_streams[$stream_id]['cached_logs'] = array_slice(
                    $this->active_streams[$stream_id]['cached_logs'], 
                    -$cache_limit, 
                    $cache_limit, 
                    true
                );
            }
        }
        
        // Force garbage collection if memory usage is high
        $memory_usage = memory_get_usage(true);
        $memory_limit = $this->parseMemoryLimit(ini_get('memory_limit'));
        
        if ($memory_usage > ($memory_limit * 0.8)) { // 80% of memory limit
            gc_collect_cycles();
            
            // Log memory warning
            error_log("[LogStreamer] High memory usage detected: " . 
                     round($memory_usage / 1024 / 1024, 2) . "MB / " . 
                     round($memory_limit / 1024 / 1024, 2) . "MB in stream {$stream_id}");
        }
    }
    
    /**
     * Log stream disconnection events for debugging
     *
     * @param string $stream_id Stream identifier
     * @param string $reason Disconnection reason
     * @param array $context Additional context data
     * @return void
     */
    private function logStreamDisconnection(string $stream_id, string $reason, array $context = []): void {
        error_log("[LogStreamer] Stream {$stream_id} disconnected: {$reason}. Context: " . json_encode($context));
    }
    
    /**
     * Parse memory limit string to bytes
     *
     * @param string $limit Memory limit string (e.g., "128M")
     * @return int Memory limit in bytes
     */
    private function parseMemoryLimit(string $limit): int {
        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit)-1]);
        $limit = (int) $limit;
        
        switch($last) {
            case 'g':
                $limit *= 1024;
            case 'm':
                $limit *= 1024;
            case 'k':
                $limit *= 1024;
        }
        
        return $limit;
    }
    
    /**
     * Generate unique stream ID
     *
     * @return string Stream ID
     */
    private function generateStreamId(): string {
        return 'stream_' . uniqid() . '_' . wp_generate_password(8, false);
    }
    
    /**
     * Get last log ID based on filters
     *
     * @param array $filters Stream filters
     * @return int Last log ID
     */
    private function getLastLogId(array $filters): int {
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
        
        $where_clause = implode(' AND ', $where_conditions);
        
        $sql = $wpdb->prepare("
            SELECT MAX(id) FROM {$table_name} WHERE {$where_clause}
        ", $where_values);
        
        return (int) $wpdb->get_var($sql);
    }
    
    /**
     * Get new logs for a stream
     *
     * @param string $stream_id Stream identifier
     * @return array New logs
     */
    private function getNewLogs(string $stream_id): array {
        if (!isset($this->active_streams[$stream_id])) {
            return [];
        }
        
        global $wpdb;
        $stream = $this->active_streams[$stream_id];
        $table_name = $wpdb->prefix . 'fitcopilot_debug_logs';
        
        // Build WHERE clause from filters
        $where_conditions = ['id > %d'];
        $where_values = [$stream['last_log_id']];
        
        if (!empty($stream['filters']['level']) && $stream['filters']['level'] !== 'all') {
            $where_conditions[] = 'level = %s';
            $where_values[] = $stream['filters']['level'];
        }
        
        if (!empty($stream['filters']['category']) && $stream['filters']['category'] !== 'all') {
            $where_conditions[] = 'category = %s';
            $where_values[] = $stream['filters']['category'];
        }
        
        if (!empty($stream['filters']['since'])) {
            $where_conditions[] = 'timestamp >= %d';
            $where_values[] = $stream['filters']['since'];
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        $limit = $stream['filters']['limit'] ?? $this->config['buffer_size'];
        
        $sql = $wpdb->prepare("
            SELECT * FROM {$table_name} 
            WHERE {$where_clause} 
            ORDER BY id ASC 
            LIMIT %d
        ", array_merge($where_values, [$limit]));
        
        $logs = $wpdb->get_results($sql, ARRAY_A);
        
        // Format logs for streaming
        return array_map(function($log) {
            $log['context'] = json_decode($log['context'] ?? '{}', true);
            $log['timestamp_formatted'] = date('Y-m-d H:i:s', $log['timestamp']);
            $log['relative_time'] = $this->getRelativeTime($log['timestamp']);
            return $log;
        }, $logs);
    }
    
    /**
     * Check if log matches stream filters
     *
     * @param array $log_data Log data
     * @param array $filters Stream filters
     * @return bool Match status
     */
    private function logMatchesFilters(array $log_data, array $filters): bool {
        // Level filter
        if (!empty($filters['level']) && $filters['level'] !== 'all') {
            if ($log_data['level'] !== $filters['level']) {
                return false;
            }
        }
        
        // Category filter
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            if ($log_data['category'] !== $filters['category']) {
                return false;
            }
        }
        
        // Time filter
        if (!empty($filters['since'])) {
            if ($log_data['timestamp'] < $filters['since']) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Store broadcast log for stream retrieval
     *
     * @param string $stream_id Stream identifier
     * @param array $log_data Log data
     * @return void
     */
    private function storeBroadcastLog(string $stream_id, array $log_data): void {
        $broadcast_logs = get_option("fitcopilot_broadcast_{$stream_id}", []);
        $broadcast_logs[] = $log_data;
        
        // Keep only recent logs
        if (count($broadcast_logs) > $this->config['buffer_size']) {
            $broadcast_logs = array_slice($broadcast_logs, -$this->config['buffer_size']);
        }
        
        update_option("fitcopilot_broadcast_{$stream_id}", $broadcast_logs);
    }
    
    /**
     * Get stream status
     *
     * @param string $stream_id Stream identifier
     * @return string Stream status
     */
    private function getStreamStatus(string $stream_id): string {
        if (!isset($this->active_streams[$stream_id])) {
            return 'inactive';
        }
        
        $stream = $this->active_streams[$stream_id];
        $uptime = time() - $stream['started_at'];
        
        if ($uptime > $this->config['max_stream_duration']) {
            return 'expired';
        }
        
        if (time() - $stream['last_update'] > 300) { // 5 minutes
            return 'idle';
        }
        
        return 'active';
    }
    
    /**
     * Save stream state to WordPress options
     *
     * @param string $stream_id Stream identifier
     * @return void
     */
    private function saveStreamState(string $stream_id): void {
        if (isset($this->active_streams[$stream_id])) {
            update_option("fitcopilot_stream_{$stream_id}", $this->active_streams[$stream_id]);
        }
    }
    
    /**
     * Load stream state from WordPress options
     *
     * @param string $stream_id Stream identifier
     * @return bool Success status
     */
    private function loadStreamState(string $stream_id): bool {
        $stream_data = get_option("fitcopilot_stream_{$stream_id}");
        
        if ($stream_data) {
            $this->active_streams[$stream_id] = $stream_data;
            $this->stream_filters[$stream_id] = $stream_data['filters'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Get relative time string
     *
     * @param int $timestamp Unix timestamp
     * @return string Relative time
     */
    private function getRelativeTime(int $timestamp): string {
        $diff = time() - $timestamp;
        
        if ($diff < 60) {
            return $diff . ' seconds ago';
        } elseif ($diff < 3600) {
            return floor($diff / 60) . ' minutes ago';
        } elseif ($diff < 86400) {
            return floor($diff / 3600) . ' hours ago';
        } else {
            return floor($diff / 86400) . ' days ago';
        }
    }
    
    /**
     * Cleanup expired streams
     *
     * @return int Number of streams cleaned up
     */
    public function cleanupExpiredStreams(): int {
        $cleaned = 0;
        
        foreach ($this->active_streams as $stream_id => $stream) {
            if (time() - $stream['started_at'] > $this->config['max_stream_duration']) {
                $this->stopStream($stream_id);
                $cleaned++;
            }
        }
        
        return $cleaned;
    }
    
    /**
     * Get streaming statistics
     *
     * @return array Streaming statistics
     */
    public function getStreamingStats(): array {
        $stats = [
            'active_streams' => count($this->active_streams),
            'total_uptime' => 0,
            'total_messages' => 0,
            'average_messages_per_stream' => 0,
            'stream_details' => []
        ];
        
        foreach ($this->active_streams as $stream_id => $stream) {
            $uptime = time() - $stream['started_at'];
            $stats['total_uptime'] += $uptime;
            $stats['total_messages'] += $stream['message_count'];
            
            $stats['stream_details'][] = [
                'id' => $stream_id,
                'uptime' => $uptime,
                'message_count' => $stream['message_count'],
                'messages_per_minute' => $uptime > 0 ? round(($stream['message_count'] / $uptime) * 60, 2) : 0,
                'status' => $this->getStreamStatus($stream_id)
            ];
        }
        
        if (count($this->active_streams) > 0) {
            $stats['average_messages_per_stream'] = round($stats['total_messages'] / count($this->active_streams), 2);
        }
        
        return $stats;
    }
} 