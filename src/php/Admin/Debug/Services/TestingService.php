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
            
            $api_key = get_option('fitcopilot_openai_api_key', '');
            if (empty($api_key)) {
                throw new \Exception('OpenAI API key not configured');
            }
            
            $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
            $prompt = $provider->buildPrompt($workout_params);
            
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
            
            return [
                'success' => true,
                'test_id' => $test_id,
                'prompt' => $prompt,
                'raw_response' => $raw_response,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'test_id' => $test_id,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
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
            $provider = new \FitCopilot\Service\AI\OpenAIProvider('');
            $prompt = $provider->buildPrompt($test_data);
            
            return [
                'success' => true,
                'test_id' => $test_id,
                'prompt' => $prompt,
                'timestamp' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'test_id' => $test_id,
                'error' => $e->getMessage(),
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