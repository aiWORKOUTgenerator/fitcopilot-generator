<?php
/**
 * MultiProviderManager - Phase 2 Week 1: Multi-Provider Integration
 * 
 * Manages multiple AI providers for workout generation with performance comparison,
 * cost optimization, and failover capabilities. Extends existing OpenAI architecture.
 */

namespace FitCopilot\Admin\Debug\Services;

use FitCopilot\Service\AI\OpenAIProvider;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * AI Provider Interface
 * 
 * Common interface for all AI providers
 */
interface AIProviderInterface {
    public function generateWorkout(array $params): array;
    public function buildPrompt(array $params): string;
    public function getProviderInfo(): array;
    public function estimateCost(string $prompt): float;
    public function validateConfiguration(): bool;
    public function getHealthStatus(): array;
}

/**
 * MultiProviderManager Class
 * 
 * Manages multiple AI providers with intelligent routing and comparison
 */
class MultiProviderManager {
    
    /**
     * Registered providers
     *
     * @var array
     */
    private $providers = [];
    
    /**
     * Default provider name
     *
     * @var string
     */
    private $default_provider = 'openai';
    
    /**
     * Provider routing strategy
     *
     * @var string
     */
    private $routing_strategy = 'default'; // default, cost_optimized, performance_optimized, round_robin
    
    /**
     * Analytics service for tracking
     *
     * @var PromptAnalyticsService
     */
    private $analytics;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->analytics = new PromptAnalyticsService();
        $this->initializeProviders();
    }
    
    /**
     * Add a provider to the manager
     *
     * @param string $name Provider name
     * @param AIProviderInterface $provider Provider instance
     * @return self
     */
    public function addProvider(string $name, AIProviderInterface $provider): self {
        $this->providers[$name] = $provider;
        
        error_log('[MultiProvider] Registered provider: ' . $name);
        
        return $this;
    }
    
    /**
     * Get provider by name
     *
     * @param string $name Provider name
     * @return AIProviderInterface|null
     */
    public function getProvider(string $name): ?AIProviderInterface {
        return $this->providers[$name] ?? null;
    }
    
    /**
     * Generate workout using optimal provider
     *
     * @param array $params Workout parameters
     * @param string|null $preferred_provider Preferred provider name
     * @return array Workout generation result
     */
    public function generateWorkout(array $params, ?string $preferred_provider = null): array {
        $provider_name = $preferred_provider ?? $this->selectOptimalProvider($params);
        $provider = $this->getProvider($provider_name);
        
        if (!$provider) {
            throw new \Exception("Provider not found: {$provider_name}");
        }
        
        $start_time = microtime(true);
        
        try {
            // Generate workout
            $result = $provider->generateWorkout($params);
            
            $generation_time = (microtime(true) - $start_time) * 1000;
            
            // Track analytics
            $this->trackProviderUsage($provider_name, $params, $generation_time, true);
            
            // Add provider metadata to result
            $result['provider_info'] = [
                'provider_name' => $provider_name,
                'generation_time_ms' => round($generation_time, 2),
                'provider_details' => $provider->getProviderInfo()
            ];
            
            return $result;
            
        } catch (\Exception $e) {
            $generation_time = (microtime(true) - $start_time) * 1000;
            
            // Track failed attempt
            $this->trackProviderUsage($provider_name, $params, $generation_time, false, $e->getMessage());
            
            // Try failover if enabled
            if ($this->shouldFailover($provider_name, $e)) {
                return $this->handleFailover($params, $provider_name, $e);
            }
            
            throw $e;
        }
    }
    
    /**
     * Compare multiple providers for same request
     *
     * @param array $params Workout parameters
     * @param array $provider_names Providers to compare (null for all)
     * @return array Comparison results
     */
    public function compareProviders(array $params, ?array $provider_names = null): array {
        $providers_to_test = $provider_names ?? array_keys($this->providers);
        $results = [];
        
        foreach ($providers_to_test as $provider_name) {
            $provider = $this->getProvider($provider_name);
            if (!$provider) continue;
            
            $start_time = microtime(true);
            
            try {
                // Generate prompt (not full workout for comparison)
                $prompt = $provider->buildPrompt($params);
                $generation_time = (microtime(true) - $start_time) * 1000;
                
                $results[$provider_name] = [
                    'success' => true,
                    'prompt' => $prompt,
                    'generation_time_ms' => round($generation_time, 2),
                    'prompt_length' => strlen($prompt),
                    'estimated_tokens' => $this->estimateTokenCount($prompt),
                    'estimated_cost' => $provider->estimateCost($prompt),
                    'provider_info' => $provider->getProviderInfo(),
                    'quality_metrics' => $this->calculateQuickQualityMetrics($prompt, $params)
                ];
                
            } catch (\Exception $e) {
                $generation_time = (microtime(true) - $start_time) * 1000;
                
                $results[$provider_name] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'generation_time_ms' => round($generation_time, 2),
                    'provider_info' => $provider->getProviderInfo()
                ];
            }
        }
        
        // Add comparison analysis
        $results['comparison_analysis'] = $this->analyzeProviderComparison($results);
        
        return $results;
    }
    
    /**
     * Get all provider health statuses
     *
     * @return array Health status for each provider
     */
    public function getProvidersHealth(): array {
        $health_status = [];
        
        foreach ($this->providers as $name => $provider) {
            try {
                $health_status[$name] = [
                    'status' => 'healthy',
                    'details' => $provider->getHealthStatus(),
                    'configuration_valid' => $provider->validateConfiguration(),
                    'provider_info' => $provider->getProviderInfo()
                ];
            } catch (\Exception $e) {
                $health_status[$name] = [
                    'status' => 'unhealthy',
                    'error' => $e->getMessage(),
                    'configuration_valid' => false
                ];
            }
        }
        
        return $health_status;
    }
    
    /**
     * Get provider performance analytics
     *
     * @param string $time_range Time range for analytics
     * @return array Performance analytics
     */
    public function getProviderAnalytics(string $time_range = '7 days'): array {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_provider_usage';
        
        $analytics_query = "
            SELECT 
                provider_name,
                COUNT(*) as total_requests,
                AVG(generation_time_ms) as avg_generation_time,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests,
                AVG(estimated_cost) as avg_cost,
                AVG(quality_score) as avg_quality
            FROM {$table_name}
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$time_range})
            GROUP BY provider_name
            ORDER BY total_requests DESC
        ";
        
        $results = $wpdb->get_results($analytics_query, ARRAY_A);
        
        // Calculate success rates
        foreach ($results as &$result) {
            $result['success_rate'] = $result['total_requests'] > 0 
                ? round(($result['successful_requests'] / $result['total_requests']) * 100, 2)
                : 0;
        }
        
        return $results;
    }
    
    /**
     * Set routing strategy
     *
     * @param string $strategy Routing strategy
     * @return self
     */
    public function setRoutingStrategy(string $strategy): self {
        $valid_strategies = ['default', 'cost_optimized', 'performance_optimized', 'round_robin'];
        
        if (!in_array($strategy, $valid_strategies)) {
            throw new \InvalidArgumentException("Invalid routing strategy: {$strategy}");
        }
        
        $this->routing_strategy = $strategy;
        return $this;
    }
    
    /**
     * Select optimal provider based on routing strategy
     *
     * @param array $params Request parameters
     * @return string Provider name
     */
    private function selectOptimalProvider(array $params): string {
        switch ($this->routing_strategy) {
            case 'cost_optimized':
                return $this->selectCostOptimalProvider($params);
                
            case 'performance_optimized':
                return $this->selectPerformanceOptimalProvider();
                
            case 'round_robin':
                return $this->selectRoundRobinProvider();
                
            case 'default':
            default:
                return $this->default_provider;
        }
    }
    
    /**
     * Select cost-optimal provider
     */
    private function selectCostOptimalProvider(array $params): string {
        $best_provider = $this->default_provider;
        $lowest_cost = PHP_FLOAT_MAX;
        
        foreach ($this->providers as $name => $provider) {
            try {
                $prompt = $provider->buildPrompt($params);
                $cost = $provider->estimateCost($prompt);
                
                if ($cost < $lowest_cost) {
                    $lowest_cost = $cost;
                    $best_provider = $name;
                }
            } catch (\Exception $e) {
                // Skip providers that fail prompt building
                continue;
            }
        }
        
        return $best_provider;
    }
    
    /**
     * Select performance-optimal provider
     */
    private function selectPerformanceOptimalProvider(): string {
        $analytics = $this->getProviderAnalytics('1 day');
        
        if (empty($analytics)) {
            return $this->default_provider;
        }
        
        // Sort by average generation time (ascending)
        usort($analytics, function($a, $b) {
            return $a['avg_generation_time'] <=> $b['avg_generation_time'];
        });
        
        return $analytics[0]['provider_name'] ?? $this->default_provider;
    }
    
    /**
     * Select provider using round-robin strategy
     */
    private function selectRoundRobinProvider(): string {
        static $current_index = 0;
        
        $provider_names = array_keys($this->providers);
        if (empty($provider_names)) {
            return $this->default_provider;
        }
        
        $selected = $provider_names[$current_index % count($provider_names)];
        $current_index++;
        
        return $selected;
    }
    
    /**
     * Handle provider failover
     */
    private function handleFailover(array $params, string $failed_provider, \Exception $original_exception): array {
        $fallback_providers = array_keys($this->providers);
        $fallback_providers = array_diff($fallback_providers, [$failed_provider]);
        
        if (empty($fallback_providers)) {
            throw new \Exception("All providers failed. Original error: " . $original_exception->getMessage());
        }
        
        error_log("[MultiProvider] Failing over from {$failed_provider} to " . implode(', ', $fallback_providers));
        
        foreach ($fallback_providers as $fallback_name) {
            try {
                $result = $this->generateWorkout($params, $fallback_name);
                $result['failover_info'] = [
                    'original_provider' => $failed_provider,
                    'fallback_provider' => $fallback_name,
                    'original_error' => $original_exception->getMessage()
                ];
                
                return $result;
                
            } catch (\Exception $e) {
                error_log("[MultiProvider] Failover provider {$fallback_name} also failed: " . $e->getMessage());
                continue;
            }
        }
        
        throw new \Exception("All failover providers failed. Original error: " . $original_exception->getMessage());
    }
    
    /**
     * Check if failover should be attempted
     */
    private function shouldFailover(string $provider_name, \Exception $exception): bool {
        // Enable failover for network errors, rate limits, and API errors
        $failover_error_patterns = [
            'timeout', 'rate limit', 'network', 'connection', 'unavailable', 'service error'
        ];
        
        $error_message = strtolower($exception->getMessage());
        
        foreach ($failover_error_patterns as $pattern) {
            if (strpos($error_message, $pattern) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Track provider usage for analytics
     */
    private function trackProviderUsage(string $provider_name, array $params, float $generation_time, bool $success, ?string $error = null): void {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_provider_usage';
        
        $usage_data = [
            'provider_name' => $provider_name,
            'user_id' => get_current_user_id(),
            'generation_time_ms' => round($generation_time, 2),
            'success' => $success ? 1 : 0,
            'error_message' => $error,
            'parameters_hash' => md5(serialize($params)),
            'created_at' => current_time('mysql')
        ];
        
        $wpdb->insert($table_name, $usage_data);
    }
    
    /**
     * Analyze provider comparison results
     */
    private function analyzeProviderComparison(array $results): array {
        $successful_results = array_filter($results, function($result) {
            return is_array($result) && ($result['success'] ?? false);
        });
        
        if (empty($successful_results)) {
            return ['error' => 'No providers succeeded'];
        }
        
        // Find fastest provider
        $fastest = array_reduce($successful_results, function($carry, $item) {
            return (!$carry || $item['generation_time_ms'] < $carry['generation_time_ms']) ? $item : $carry;
        });
        
        // Find cheapest provider
        $cheapest = array_reduce($successful_results, function($carry, $item) {
            return (!$carry || $item['estimated_cost'] < $carry['estimated_cost']) ? $item : $carry;
        });
        
        // Find highest quality provider
        $highest_quality = array_reduce($successful_results, function($carry, $item) {
            $quality = $item['quality_metrics']['overall_score'] ?? 0;
            $carry_quality = $carry['quality_metrics']['overall_score'] ?? 0;
            return (!$carry || $quality > $carry_quality) ? $item : $carry;
        });
        
        return [
            'fastest_provider' => array_search($fastest, $results),
            'cheapest_provider' => array_search($cheapest, $results),
            'highest_quality_provider' => array_search($highest_quality, $results),
            'performance_ranking' => $this->rankProvidersByPerformance($successful_results),
            'cost_ranking' => $this->rankProvidersByCost($successful_results),
            'quality_ranking' => $this->rankProvidersByQuality($successful_results)
        ];
    }
    
    /**
     * Calculate quick quality metrics for comparison
     */
    private function calculateQuickQualityMetrics(string $prompt, array $params): array {
        $prompt_length = strlen($prompt);
        $param_count = count($params);
        
        // Simple quality score based on prompt structure and parameter usage
        $structure_score = 0;
        $sections = ['USER PROFILE', 'WORKOUT', 'TRAINING'];
        foreach ($sections as $section) {
            if (stripos($prompt, $section) !== false) {
                $structure_score += 33.33;
            }
        }
        
        $param_usage_score = $param_count > 0 ? min(($param_count / 10) * 100, 100) : 0;
        $length_score = ($prompt_length >= 300 && $prompt_length <= 2000) ? 100 : 50;
        
        $overall_score = ($structure_score + $param_usage_score + $length_score) / 3;
        
        return [
            'structure_score' => round($structure_score, 2),
            'parameter_usage_score' => round($param_usage_score, 2),
            'length_score' => round($length_score, 2),
            'overall_score' => round($overall_score, 2)
        ];
    }
    
    /**
     * Rank providers by performance
     */
    private function rankProvidersByPerformance(array $results): array {
        uasort($results, function($a, $b) {
            return $a['generation_time_ms'] <=> $b['generation_time_ms'];
        });
        
        return array_keys($results);
    }
    
    /**
     * Rank providers by cost
     */
    private function rankProvidersByCost(array $results): array {
        uasort($results, function($a, $b) {
            return $a['estimated_cost'] <=> $b['estimated_cost'];
        });
        
        return array_keys($results);
    }
    
    /**
     * Rank providers by quality
     */
    private function rankProvidersByQuality(array $results): array {
        uasort($results, function($a, $b) {
            $quality_a = $a['quality_metrics']['overall_score'] ?? 0;
            $quality_b = $b['quality_metrics']['overall_score'] ?? 0;
            return $quality_b <=> $quality_a; // Descending order
        });
        
        return array_keys($results);
    }
    
    /**
     * Estimate token count
     */
    private function estimateTokenCount(string $text): int {
        return (int) ceil(strlen($text) / 4);
    }
    
    /**
     * Initialize default providers
     */
    private function initializeProviders(): void {
        // Initialize OpenAI provider (existing)
        $openai_key = get_option('fitcopilot_openai_api_key', '');
        if (!empty($openai_key)) {
            $openai_provider = new EnhancedOpenAIProvider($openai_key);
            $this->addProvider('openai', $openai_provider);
        }
        
        // Initialize other providers if configured
        $this->initializeClaudeProvider();
        $this->initializeLocalProvider();
        
        // Create provider usage table if needed
        $this->createProviderUsageTable();
    }
    
    /**
     * Initialize Claude provider if configured
     */
    private function initializeClaudeProvider(): void {
        $claude_key = get_option('fitcopilot_claude_api_key', '');
        if (!empty($claude_key)) {
            // Claude provider will be implemented next
            error_log('[MultiProvider] Claude provider configured but not yet implemented');
        }
    }
    
    /**
     * Initialize local provider if configured
     */
    private function initializeLocalProvider(): void {
        $local_enabled = get_option('fitcopilot_local_ai_enabled', false);
        if ($local_enabled) {
            // Local AI provider will be implemented in future
            error_log('[MultiProvider] Local AI provider configured but not yet implemented');
        }
    }
    
    /**
     * Create provider usage tracking table
     */
    private function createProviderUsageTable(): void {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fitcopilot_provider_usage';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table_name} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            provider_name varchar(50) NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            generation_time_ms decimal(10,2) NOT NULL,
            success tinyint(1) NOT NULL DEFAULT 0,
            error_message text NULL,
            estimated_cost decimal(10,6) DEFAULT 0.000000,
            quality_score decimal(5,2) DEFAULT 0.00,
            parameters_hash varchar(32),
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY provider_name (provider_name),
            KEY created_at (created_at),
            KEY success (success)
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

/**
 * Enhanced OpenAI Provider implementing the AIProviderInterface
 */
class EnhancedOpenAIProvider extends OpenAIProvider implements AIProviderInterface {
    
    /**
     * Get provider information
     */
    public function getProviderInfo(): array {
        return [
            'name' => 'OpenAI GPT-4',
            'model' => 'gpt-4.1', 
            'max_tokens' => 4096,
            'cost_per_1k_tokens' => 0.03,
            'strengths' => ['general knowledge', 'creative responses', 'detailed instructions'],
            'limitations' => ['cost', 'rate limits', 'requires internet'],
            'supported_features' => ['workout_generation', 'prompt_building', 'context_awareness'],
            'api_version' => '1.0',
            'endpoint' => 'https://api.openai.com/v1/chat/completions'
        ];
    }
    
    /**
     * Estimate cost for prompt
     */
    public function estimateCost(string $prompt): float {
        $estimated_tokens = ceil(strlen($prompt) / 4);
        $cost_per_1k = 0.03; // GPT-4 pricing
        
        return ($estimated_tokens / 1000) * $cost_per_1k;
    }
    
    /**
     * Validate provider configuration
     */
    public function validateConfiguration(): bool {
        $api_key = get_option('fitcopilot_openai_api_key', '');
        
        return !empty($api_key) && strlen($api_key) > 20;
    }
    
    /**
     * Get health status
     */
    public function getHealthStatus(): array {
        $health_data = [
            'status' => 'unknown',
            'response_time' => null,
            'last_error' => null,
            'api_key_valid' => $this->validateConfiguration()
        ];
        
        try {
            $start_time = microtime(true);
            
            // Simple health check with minimal request
            $test_params = ['duration' => 30, 'fitness_level' => 'beginner'];
            $test_prompt = $this->buildPrompt($test_params);
            
            $response_time = (microtime(true) - $start_time) * 1000;
            
            $health_data['status'] = 'healthy';
            $health_data['response_time'] = round($response_time, 2);
            
        } catch (\Exception $e) {
            $health_data['status'] = 'unhealthy';
            $health_data['last_error'] = $e->getMessage();
        }
        
        return $health_data;
    }
} 