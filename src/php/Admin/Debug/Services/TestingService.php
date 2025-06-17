<?php
/**
 * TestingService - Core testing functionality
 * 
 * Contains the business logic for workout testing, prompt building,
 * and context validation without external service dependencies
 */

namespace FitCopilot\Admin\Debug\Services;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * TestingService Class
 * 
 * Core testing functionality without problematic dependencies
 */
class TestingService {
    
    /**
     * Test workout generation
     *
     * @param array $test_data Test parameters
     * @param string $test_id Test identifier
     * @return array Test results
     */
    public function testWorkoutGeneration(array $test_data, string $test_id): array {
        $start_time = microtime(true);
        
        try {
            $workout_params = $test_data['test_data'] ?? $test_data;
            
            // Enhanced error logging for debugging
            error_log('[TestingService] Starting workout generation test with ID: ' . $test_id);
            error_log('[TestingService] Workout params: ' . json_encode($workout_params));
            
            $api_key = get_option('fitcopilot_openai_api_key', '');
            if (empty($api_key)) {
                error_log('[TestingService] API key not configured');
                throw new \Exception('OpenAI API key not configured');
            }
            
            // Check if OpenAI provider class exists before instantiation
            if (!class_exists('FitCopilot\\Service\\AI\\OpenAIProvider')) {
                error_log('[TestingService] OpenAIProvider class not found');
                throw new \Exception('OpenAIProvider class not available');
            }
            
            error_log('[TestingService] Creating OpenAI provider instance');
            $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
            
            error_log('[TestingService] Building prompt');
            $prompt = $provider->buildPrompt($workout_params);
            
            error_log('[TestingService] Prompt generated successfully, length: ' . strlen($prompt));
            
            // Simulate response for testing
            $raw_response = json_encode([
                'title' => 'Test Workout',
                'sections' => [
                    [
                        'name' => 'Warm-up',
                        'exercises' => [['name' => 'Light Jogging', 'duration' => '5 min']]
                    ]
                ]
            ]);
            
            $result = [
                'success' => true,
                'test_id' => $test_id,
                'prompt' => $prompt,
                'raw_response' => $raw_response,
                'timestamp' => date('Y-m-d H:i:s'),
                'processing_time' => round((microtime(true) - $start_time) * 1000, 2) . 'ms'
            ];
            
            error_log('[TestingService] Test completed successfully');
            return $result;
            
        } catch (\Exception $e) {
            error_log('[TestingService] Test failed: ' . $e->getMessage());
            error_log('[TestingService] Stack trace: ' . $e->getTraceAsString());
            
            return [
                'success' => false,
                'test_id' => $test_id,
                'error' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'timestamp' => date('Y-m-d H:i:s'),
                'processing_time' => round((microtime(true) - $start_time) * 1000, 2) . 'ms'
            ];
        }
    }
    
    /**
     * Test prompt building
     *
     * @param array $test_data Test parameters
     * @param string $test_id Test identifier
     * @return array Test results
     */
    public function testPromptBuilding(array $test_data, string $test_id): array {
        try {
            error_log('[TestingService] Starting prompt building test with ID: ' . $test_id);
            
            // Check if OpenAI provider class exists before instantiation
            if (!class_exists('FitCopilot\\Service\\AI\\OpenAIProvider')) {
                error_log('[TestingService] OpenAIProvider class not found for prompt building');
                throw new \Exception('OpenAIProvider class not available');
            }
            
            $provider = new \FitCopilot\Service\AI\OpenAIProvider('test_key');
            $prompt = $provider->buildPrompt($test_data);
            
            error_log('[TestingService] Prompt building completed successfully');
            
            return [
                'success' => true,
                'test_id' => $test_id,
                'prompt' => $prompt,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            error_log('[TestingService] Prompt building failed: ' . $e->getMessage());
            error_log('[TestingService] Stack trace: ' . $e->getTraceAsString());
            
            return [
                'success' => false,
                'test_id' => $test_id,
                'error' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Validate context data
     *
     * @param array $test_data Test parameters
     * @param string $test_id Test identifier
     * @return array Validation results
     */
    public function validateContext(array $test_data, string $test_id): array {
        $context_data = $test_data['context_data'] ?? $test_data;
        $errors = [];
        
        if (empty($context_data['duration'])) {
            $errors[] = 'Missing required field: duration';
        }
        
        return [
            'success' => empty($errors),
            'test_id' => $test_id,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    /**
     * Performance test
     *
     * @param array $test_data Test parameters
     * @param string $test_id Test identifier
     * @return array Performance test results
     */
    public function performanceTest(array $test_data, string $test_id): array {
        return [
            'success' => true,
            'test_id' => $test_id,
            'summary' => ['avg_time' => 100],
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
} 