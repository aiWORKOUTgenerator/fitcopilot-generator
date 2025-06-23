<?php
/**
 * PromptAnalyticsService - Phase 2 Week 1: Advanced Analytics Foundation
 * 
 * Comprehensive analytics system for tracking prompt performance, quality metrics,
 * A/B testing, and usage patterns. Integrates with existing PromptBuilder architecture.
 */

namespace FitCopilot\Admin\Debug\Services;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PromptAnalyticsService Class
 * 
 * Advanced analytics for prompt engineering and performance tracking
 */
class PromptAnalyticsService {
    
    /**
     * Database table names
     */
    private const TABLE_ANALYTICS = 'fitcopilot_prompt_analytics';
    private const TABLE_AB_TESTS = 'fitcopilot_prompt_ab_tests';
    private const TABLE_QUALITY_METRICS = 'fitcopilot_prompt_quality';
    
    /**
     * Quality scoring thresholds
     */
    private const QUALITY_THRESHOLDS = [
        'personalization' => ['low' => 30, 'medium' => 60, 'high' => 80],
        'completeness' => ['low' => 50, 'medium' => 75, 'high' => 90],
        'clarity' => ['low' => 40, 'medium' => 70, 'high' => 85],
        'token_efficiency' => ['low' => 40, 'medium' => 70, 'high' => 85]
    ];
    
    /**
     * Initialize service and create tables if needed
     */
    public function __construct() {
        $this->maybeCreateTables();
    }
    
    /**
     * Track prompt generation event
     * 
     * @param array $prompt_data Prompt generation data
     * @return int Analytics entry ID
     */
    public function trackPromptGeneration(array $prompt_data): int {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_ANALYTICS;
        
        // Calculate quality metrics
        $quality_metrics = $this->calculateQualityMetrics($prompt_data);
        
        // Extract performance metrics
        $performance_metrics = $this->extractPerformanceMetrics($prompt_data);
        
        $analytics_data = [
            'user_id' => get_current_user_id(),
            'prompt_id' => $prompt_data['prompt_id'] ?? wp_generate_uuid4(),
            'strategy_name' => $prompt_data['strategy_name'] ?? 'unknown',
            'prompt_length' => strlen($prompt_data['prompt'] ?? ''),
            'estimated_tokens' => $this->estimateTokenCount($prompt_data['prompt'] ?? ''),
            'generation_time_ms' => $performance_metrics['generation_time_ms'],
            'context_completeness' => $quality_metrics['completeness_score'],
            'personalization_score' => $quality_metrics['personalization_score'],
            'clarity_score' => $quality_metrics['clarity_score'],
            'token_efficiency_score' => $quality_metrics['token_efficiency_score'],
            'parameters_used' => json_encode($prompt_data['parameters'] ?? []),
            'context_data' => json_encode($prompt_data['context'] ?? []),
            'prompt_hash' => md5($prompt_data['prompt'] ?? ''),
            'session_id' => $this->getSessionId(),
            'created_at' => current_time('mysql')
        ];
        
        $wpdb->insert($table_name, $analytics_data);
        
        $analytics_id = $wpdb->insert_id;
        
        // Log analytics event
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[PromptAnalytics] Tracked generation: ID=' . $analytics_id . 
                     ', Quality=' . $quality_metrics['overall_score'] . '%, ' .
                     'Time=' . $performance_metrics['generation_time_ms'] . 'ms');
        }
        
        return $analytics_id;
    }
    
    /**
     * Start A/B test for prompt variants
     * 
     * @param array $test_config A/B test configuration
     * @return string Test ID
     */
    public function startABTest(array $test_config): string {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_AB_TESTS;
        $test_id = wp_generate_uuid4();
        
        $ab_test_data = [
            'test_id' => $test_id,
            'test_name' => sanitize_text_field($test_config['name']),
            'description' => sanitize_textarea_field($test_config['description'] ?? ''),
            'variant_a_config' => json_encode($test_config['variant_a']),
            'variant_b_config' => json_encode($test_config['variant_b']),
            'success_metrics' => json_encode($test_config['success_metrics'] ?? []),
            'target_sample_size' => intval($test_config['sample_size'] ?? 100),
            'status' => 'active',
            'created_by' => get_current_user_id(),
            'created_at' => current_time('mysql')
        ];
        
        $wpdb->insert($table_name, $ab_test_data);
        
        error_log('[PromptAnalytics] Started A/B test: ' . $test_config['name'] . ' (ID: ' . $test_id . ')');
        
        return $test_id;
    }
    
    /**
     * Record A/B test result
     * 
     * @param string $test_id Test identifier
     * @param string $variant Variant tested (A or B)
     * @param array $result_data Test result data
     * @return bool Success status
     */
    public function recordABTestResult(string $test_id, string $variant, array $result_data): bool {
        global $wpdb;
        
        $analytics_table = $wpdb->prefix . self::TABLE_ANALYTICS;
        
        // Update analytics record with A/B test info
        $update_data = [
            'ab_test_id' => $test_id,
            'ab_variant' => $variant,
            'ab_result_data' => json_encode($result_data)
        ];
        
        $updated = $wpdb->update(
            $analytics_table,
            $update_data,
            ['prompt_id' => $result_data['prompt_id']],
            ['%s', '%s', '%s'],
            ['%s']
        );
        
        return $updated !== false;
    }
    
    /**
     * Get analytics dashboard data
     * 
     * @param array $filters Optional filters
     * @return array Dashboard data
     */
    public function getDashboardData(array $filters = []): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_ANALYTICS;
        $date_range = $filters['date_range'] ?? '7 days';
        
        // Check if analytics table exists, if not return default data
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");
        if (!$table_exists) {
            return [
                'performance_metrics' => [
                    'total_generations' => 0,
                    'avg_generation_time' => 0,
                    'avg_prompt_length' => 0,
                    'avg_tokens' => 0,
                    'avg_completeness' => 0,
                    'avg_personalization' => 0,
                    'avg_clarity' => 0,
                    'avg_efficiency' => 0
                ],
                'quality_trends' => [],
                'strategy_comparison' => [],
                'active_ab_tests' => [],
                'summary' => [
                    'total_generations' => 0,
                    'avg_generation_time' => 0,
                    'avg_quality_score' => 0,
                    'quality_grade' => 'N/A',
                    'performance_grade' => 'N/A'
                ],
                'recommendations' => []
            ];
        }
        
        // Build WHERE clause
        $where_clause = "WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$date_range})";
        
        if (!empty($filters['strategy'])) {
            $strategy = esc_sql($filters['strategy']);
            $where_clause .= " AND strategy_name = '{$strategy}'";
        }
        
        if (!empty($filters['user_id'])) {
            $user_id = intval($filters['user_id']);
            $where_clause .= " AND user_id = {$user_id}";
        }
        
        // Performance metrics
        $performance_query = "
            SELECT 
                COUNT(*) as total_generations,
                AVG(generation_time_ms) as avg_generation_time,
                AVG(prompt_length) as avg_prompt_length,
                AVG(estimated_tokens) as avg_tokens,
                AVG(context_completeness) as avg_completeness,
                AVG(personalization_score) as avg_personalization,
                AVG(clarity_score) as avg_clarity,
                AVG(token_efficiency_score) as avg_efficiency
            FROM {$table_name}
            {$where_clause}
        ";
        
        $performance_data = $wpdb->get_row($performance_query, ARRAY_A);
        
        // Ensure performance_data is always an array with default values
        if (empty($performance_data)) {
            $performance_data = [
                'total_generations' => 0,
                'avg_generation_time' => 0,
                'avg_prompt_length' => 0,
                'avg_tokens' => 0,
                'avg_completeness' => 0,
                'avg_personalization' => 0,
                'avg_clarity' => 0,
                'avg_efficiency' => 0
            ];
        }
        
        // Quality trends (daily aggregation)
        $trends_query = "
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                AVG(personalization_score) as avg_personalization,
                AVG(context_completeness) as avg_completeness,
                AVG(clarity_score) as avg_clarity,
                AVG(token_efficiency_score) as avg_efficiency
            FROM {$table_name}
            {$where_clause}
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
        ";
        
        $trends_data = $wpdb->get_results($trends_query, ARRAY_A);
        if (empty($trends_data)) {
            $trends_data = [];
        }
        
        // Strategy performance comparison
        $strategy_query = "
            SELECT 
                strategy_name,
                COUNT(*) as usage_count,
                AVG(generation_time_ms) as avg_time,
                AVG(personalization_score) as avg_quality,
                AVG(estimated_tokens) as avg_tokens
            FROM {$table_name}
            {$where_clause}
            GROUP BY strategy_name
            ORDER BY usage_count DESC
        ";
        
        $strategy_data = $wpdb->get_results($strategy_query, ARRAY_A);
        if (empty($strategy_data)) {
            $strategy_data = [];
        }
        
        // Active A/B tests
        $ab_tests = $this->getActiveABTests();
        if (empty($ab_tests)) {
            $ab_tests = [];
        }
        
        return [
            'performance_metrics' => $performance_data,
            'quality_trends' => $trends_data,
            'strategy_comparison' => $strategy_data,
            'active_ab_tests' => $ab_tests,
            'summary' => $this->generateSummary($performance_data),
            'recommendations' => $this->generateRecommendations($performance_data, $strategy_data)
        ];
    }
    
    /**
     * Calculate comprehensive quality metrics
     * 
     * @param array $prompt_data Prompt data to analyze
     * @return array Quality metrics
     */
    private function calculateQualityMetrics(array $prompt_data): array {
        $prompt = $prompt_data['prompt'] ?? '';
        $context = $prompt_data['context'] ?? [];
        $parameters = $prompt_data['parameters'] ?? [];
        
        // Personalization score (based on context usage)
        $personalization_score = $this->calculatePersonalizationScore($prompt, $context);
        
        // Completeness score (based on required context fields)
        $completeness_score = $this->calculateCompletenessScore($context, $parameters);
        
        // Clarity score (based on prompt structure and readability)
        $clarity_score = $this->calculateClarityScore($prompt);
        
        // Token efficiency score (information density)
        $token_efficiency_score = $this->calculateTokenEfficiencyScore($prompt, $context);
        
        // Overall quality score (weighted average)
        $overall_score = (
            ($personalization_score * 0.3) +
            ($completeness_score * 0.25) +
            ($clarity_score * 0.25) +
            ($token_efficiency_score * 0.2)
        );
        
        return [
            'personalization_score' => round($personalization_score, 2),
            'completeness_score' => round($completeness_score, 2),
            'clarity_score' => round($clarity_score, 2),
            'token_efficiency_score' => round($token_efficiency_score, 2),
            'overall_score' => round($overall_score, 2)
        ];
    }
    
    /**
     * Calculate personalization score based on context usage
     */
    private function calculatePersonalizationScore(string $prompt, array $context): float {
        if (empty($context)) return 0;
        
        $personal_indicators = 0;
        $total_context_fields = count($context);
        
        // Check for personal context usage in prompt
        $personal_fields = [
            'profile_first_name', 'profile_age', 'profile_gender',
            'fitness_level', 'limitations', 'goals', 'equipment'
        ];
        
        foreach ($personal_fields as $field) {
            if (isset($context[$field]) && !empty($context[$field])) {
                $field_value = is_array($context[$field]) ? implode(' ', $context[$field]) : $context[$field];
                if (stripos($prompt, $field_value) !== false) {
                    $personal_indicators++;
                }
            }
        }
        
        return $total_context_fields > 0 ? ($personal_indicators / $total_context_fields) * 100 : 0;
    }
    
    /**
     * Calculate completeness score based on required context fields
     */
    private function calculateCompletenessScore(array $context, array $parameters): float {
        $required_fields = ['duration', 'fitness_level', 'goals'];
        $optional_fields = ['equipment', 'restrictions', 'stress_level', 'energy_level'];
        
        $required_score = 0;
        $optional_score = 0;
        
        // Check required fields (70% weight)
        foreach ($required_fields as $field) {
            if (isset($context[$field]) || isset($parameters[$field])) {
                $required_score++;
            }
        }
        $required_percentage = ($required_score / count($required_fields)) * 70;
        
        // Check optional fields (30% weight)
        foreach ($optional_fields as $field) {
            if (isset($context[$field]) || isset($parameters[$field])) {
                $optional_score++;
            }
        }
        $optional_percentage = ($optional_score / count($optional_fields)) * 30;
        
        return $required_percentage + $optional_percentage;
    }
    
    /**
     * Calculate clarity score based on prompt structure
     */
    private function calculateClarityScore(string $prompt): float {
        if (empty($prompt)) return 0;
        
        $score = 0;
        
        // Check for structured sections
        $sections = ['USER PROFILE', 'WORKOUT SPECIFICATIONS', 'TRAINING GUIDANCE'];
        foreach ($sections as $section) {
            if (stripos($prompt, $section) !== false) {
                $score += 20;
            }
        }
        
        // Check for clear instructions
        $instructions = ['Please create', 'Generate', 'Design'];
        foreach ($instructions as $instruction) {
            if (stripos($prompt, $instruction) !== false) {
                $score += 15;
                break;
            }
        }
        
        // Penalize overly long or short prompts
        $length = strlen($prompt);
        if ($length >= 500 && $length <= 2000) {
            $score += 25;
        } elseif ($length >= 300 && $length <= 2500) {
            $score += 15;
        }
        
        return min($score, 100);
    }
    
    /**
     * Calculate token efficiency score
     */
    private function calculateTokenEfficiencyScore(string $prompt, array $context): float {
        $prompt_length = strlen($prompt);
        $context_fields = count($context);
        
        if ($prompt_length === 0 || $context_fields === 0) return 0;
        
        // Information density: context fields per 100 characters
        $density = ($context_fields / $prompt_length) * 100;
        
        // Optimal density is around 0.5-1.5 fields per 100 characters
        if ($density >= 0.5 && $density <= 1.5) {
            return 100;
        } elseif ($density >= 0.3 && $density <= 2.0) {
            return 75;
        } elseif ($density >= 0.1 && $density <= 3.0) {
            return 50;
        } else {
            return 25;
        }
    }
    
    /**
     * Extract performance metrics from prompt data
     */
    private function extractPerformanceMetrics(array $prompt_data): array {
        return [
            'generation_time_ms' => $prompt_data['generation_time_ms'] ?? 0,
            'memory_usage_mb' => $prompt_data['memory_usage_mb'] ?? 0,
            'api_calls_count' => $prompt_data['api_calls_count'] ?? 1,
            'cache_hit' => $prompt_data['cache_hit'] ?? false
        ];
    }
    
    /**
     * Estimate token count for prompt
     */
    private function estimateTokenCount(string $prompt): int {
        // Rough estimation: ~4 characters per token for English text
        return (int) ceil(strlen($prompt) / 4);
    }
    
    /**
     * Get current session ID
     */
    private function getSessionId(): string {
        if (!session_id()) {
            session_start();
        }
        return session_id();
    }
    
    /**
     * Get active A/B tests
     */
    private function getActiveABTests(): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . self::TABLE_AB_TESTS;
        
        // Check if table exists before querying
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");
        if (!$table_exists) {
            return [];
        }
        
        $results = $wpdb->get_results(
            "SELECT * FROM {$table_name} WHERE status = 'active' ORDER BY created_at DESC",
            ARRAY_A
        );
        
        return $results ?: [];
    }
    
    /**
     * Generate performance summary
     */
    private function generateSummary(array $performance_data): array {
        // Defensive programming: ensure we have valid data
        if (empty($performance_data) || !is_array($performance_data)) {
            $performance_data = [
                'total_generations' => 0,
                'avg_generation_time' => 0,
                'avg_personalization' => 0
            ];
        }
        
        $total = intval($performance_data['total_generations'] ?? 0);
        $avg_time = floatval($performance_data['avg_generation_time'] ?? 0);
        $avg_quality = floatval($performance_data['avg_personalization'] ?? 0);
        
        return [
            'total_generations' => $total,
            'avg_generation_time' => round($avg_time, 2),
            'avg_quality_score' => round($avg_quality, 2),
            'quality_grade' => $this->getQualityGrade($avg_quality),
            'performance_grade' => $this->getPerformanceGrade($avg_time)
        ];
    }
    
    /**
     * Generate recommendations based on analytics
     */
    private function generateRecommendations(array $performance_data, array $strategy_data): array {
        $recommendations = [];
        
        // Defensive programming: ensure we have valid data
        if (empty($performance_data) || !is_array($performance_data)) {
            $performance_data = [
                'avg_generation_time' => 0,
                'avg_personalization' => 0
            ];
        }
        
        if (empty($strategy_data) || !is_array($strategy_data)) {
            $strategy_data = [];
        }
        
        $avg_time = floatval($performance_data['avg_generation_time'] ?? 0);
        $avg_quality = floatval($performance_data['avg_personalization'] ?? 0);
        
        // Performance recommendations
        if ($avg_time > 1000) {
            $recommendations[] = [
                'type' => 'performance',
                'priority' => 'high',
                'message' => 'Generation time is high (' . round($avg_time) . 'ms). Consider enabling caching or optimizing prompts.',
                'action' => 'optimize_performance'
            ];
        }
        
        // Quality recommendations
        if ($avg_quality < 60) {
            $recommendations[] = [
                'type' => 'quality',
                'priority' => 'medium',
                'message' => 'Personalization score is low (' . round($avg_quality) . '%). Add more profile context fields.',
                'action' => 'improve_personalization'
            ];
        }
        
        // Strategy recommendations
        if (count($strategy_data) === 1) {
            $recommendations[] = [
                'type' => 'strategy',
                'priority' => 'low',
                'message' => 'Only one strategy in use. Consider implementing additional strategies for different use cases.',
                'action' => 'add_strategies'
            ];
        }
        
        return $recommendations;
    }
    
    /**
     * Get quality grade based on score
     */
    private function getQualityGrade(float $score): string {
        if ($score >= 90) return 'A+';
        if ($score >= 80) return 'A';
        if ($score >= 70) return 'B';
        if ($score >= 60) return 'C';
        if ($score >= 50) return 'D';
        return 'F';
    }
    
    /**
     * Get performance grade based on generation time
     */
    private function getPerformanceGrade(float $time_ms): string {
        if ($time_ms <= 200) return 'A+';
        if ($time_ms <= 500) return 'A';
        if ($time_ms <= 1000) return 'B';
        if ($time_ms <= 2000) return 'C';
        if ($time_ms <= 3000) return 'D';
        return 'F';
    }
    
    /**
     * Create analytics tables if they don't exist
     */
    private function maybeCreateTables(): void {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Analytics table
        $analytics_table = $wpdb->prefix . self::TABLE_ANALYTICS;
        $analytics_sql = "CREATE TABLE {$analytics_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            prompt_id varchar(36) NOT NULL,
            strategy_name varchar(100) NOT NULL,
            prompt_length int(11) NOT NULL DEFAULT 0,
            estimated_tokens int(11) NOT NULL DEFAULT 0,
            generation_time_ms int(11) NOT NULL DEFAULT 0,
            context_completeness decimal(5,2) NOT NULL DEFAULT 0.00,
            personalization_score decimal(5,2) NOT NULL DEFAULT 0.00,
            clarity_score decimal(5,2) NOT NULL DEFAULT 0.00,
            token_efficiency_score decimal(5,2) NOT NULL DEFAULT 0.00,
            parameters_used longtext,
            context_data longtext,
            prompt_hash varchar(32),
            session_id varchar(100),
            ab_test_id varchar(36) NULL,
            ab_variant varchar(10) NULL,
            ab_result_data longtext NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY strategy_name (strategy_name),
            KEY created_at (created_at),
            KEY prompt_hash (prompt_hash),
            KEY ab_test_id (ab_test_id)
        ) {$charset_collate};";
        
        // A/B tests table
        $ab_tests_table = $wpdb->prefix . self::TABLE_AB_TESTS;
        $ab_tests_sql = "CREATE TABLE {$ab_tests_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            test_id varchar(36) NOT NULL,
            test_name varchar(255) NOT NULL,
            description text,
            variant_a_config longtext NOT NULL,
            variant_b_config longtext NOT NULL,
            success_metrics longtext,
            target_sample_size int(11) NOT NULL DEFAULT 100,
            current_sample_size int(11) NOT NULL DEFAULT 0,
            status varchar(20) NOT NULL DEFAULT 'active',
            results longtext NULL,
            winner varchar(10) NULL,
            created_by bigint(20) unsigned NOT NULL,
            created_at datetime NOT NULL,
            completed_at datetime NULL,
            PRIMARY KEY (id),
            UNIQUE KEY test_id (test_id),
            KEY status (status),
            KEY created_by (created_by)
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($analytics_sql);
        dbDelta($ab_tests_sql);
    }
} 