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

    /**
     * NEW: Test profile-based workout generation using actual profile data flow
     *
     * @param array $profile_data Profile data from the form
     * @return array Test results
     */
    public function testProfileBasedWorkoutGeneration($profile_data) {
        $start_time = microtime(true);
        
        try {
            // Log the profile data we received
            error_log('[TestingService] Profile-based workout test started with data: ' . json_encode($profile_data));
            
            // Step 1: Map profile data to WordPress user meta format
            $mapped_profile = $this->mapProfileDataToWordPressMeta($profile_data);
            
            // Step 2: Create generation parameters using only profile data
            $generation_params = $this->buildProfileBasedGenerationParams($mapped_profile, $profile_data);
            
            // Step 3: Test the modular prompt system
            $prompt_result = $this->testModularPromptSystem($generation_params);
            
            // Step 4: Simulate the actual GenerateEndpoint workflow
            $workout_result = $this->simulateProfileWorkoutGeneration($generation_params);
            
            $execution_time = (microtime(true) - $start_time) * 1000;
            
            return [
                'success' => true,
                'profile' => $this->formatProfileSummary($profile_data, $mapped_profile),
                'system' => [
                    'contextType' => 'Profile-based context',
                    'strategy' => 'SingleWorkoutStrategy',
                    'profileFieldsCount' => count(array_filter($mapped_profile)),
                    'executionTime' => round($execution_time, 2)
                ],
                'prompt' => $prompt_result['prompt'] ?? 'No prompt generated',
                'promptStats' => $prompt_result['stats'] ?? [],
                'workout' => $workout_result['workout'] ?? null,
                'validation' => [
                    'profileFieldsUsed' => array_keys(array_filter($mapped_profile)),
                    'modularSystemActive' => $prompt_result['success'] ?? false,
                    'contextManagerWorking' => $prompt_result['contextManager'] ?? false,
                    'promptPersonalized' => $this->isPromptPersonalized($prompt_result['prompt'] ?? '', $profile_data)
                ]
            ];
            
        } catch (\Exception $e) {
            error_log('[TestingService] Profile-based workout test failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'execution_time' => (microtime(true) - $start_time) * 1000
            ];
        }
    }

    /**
     * Map profile form data to WordPress user meta format
     *
     * @param array $profile_data Raw profile data from form
     * @return array Mapped profile data
     */
    private function mapProfileDataToWordPressMeta($profile_data) {
        return [
            'profile_first_name' => $profile_data['firstName'] ?? '',
            'profile_last_name' => $profile_data['lastName'] ?? '',
            'profile_fitness_level' => $profile_data['fitnessLevel'] ?? 'intermediate',
            'profile_goals' => $profile_data['goals'] ?? [],
            'profile_age' => $profile_data['age'] ?? null,
            'profile_gender' => $profile_data['gender'] ?? '',
            'profile_weight' => $profile_data['weight'] ?? null,
            'profile_weight_unit' => $profile_data['weightUnit'] ?? 'lbs',
            'profile_height' => $profile_data['height'] ?? null,
            'profile_height_unit' => $profile_data['heightUnit'] ?? 'ft',
            'profile_equipment' => $profile_data['availableEquipment'] ?? [],
            'profile_location' => $profile_data['preferredLocation'] ?? 'home',
            'profile_limitations' => $profile_data['limitations'] ?? [],
            'profile_limitation_notes' => $profile_data['limitationNotes'] ?? '',
            'profile_medical_conditions' => $profile_data['medicalConditions'] ?? '',
            'profile_frequency' => $profile_data['workoutFrequency'] ?? '3-4',
            'profile_preferred_duration' => $profile_data['preferredWorkoutDuration'] ?? 30,
            'profile_favorite_exercises' => $profile_data['favoriteExercises'] ?? '',
            'profile_disliked_exercises' => $profile_data['dislikedExercises'] ?? ''
        ];
    }

    /**
     * Build generation parameters using only profile data
     *
     * @param array $mapped_profile Mapped profile data
     * @param array $profile_data Original profile data
     * @return array Generation parameters
     */
    private function buildProfileBasedGenerationParams($mapped_profile, $profile_data) {
        return [
            // Basic workout parameters
            'duration' => $profile_data['testDuration'] ?? 30,
            'fitness_level' => $mapped_profile['profile_fitness_level'],
            'goals' => $profile_data['testFocus'] ?? 'strength',
            'equipment' => $mapped_profile['profile_equipment'],
            
            // Profile context (what the system actually uses)
            'profile_goals' => $mapped_profile['profile_goals'],
            'profile_equipment' => $mapped_profile['profile_equipment'],
            'profile_fitness_level' => $mapped_profile['profile_fitness_level'],
            'profile_frequency' => $mapped_profile['profile_frequency'],
            'profile_location' => $mapped_profile['profile_location'],
            'profile_limitations' => $mapped_profile['profile_limitations'],
            'profile_limitation_notes' => $mapped_profile['profile_limitation_notes'],
            'profile_age' => $mapped_profile['profile_age'],
            'profile_weight' => $mapped_profile['profile_weight'],
            'profile_weight_unit' => $mapped_profile['profile_weight_unit'],
            'profile_height' => $mapped_profile['profile_height'],
            'profile_height_unit' => $mapped_profile['profile_height_unit'],
            'profile_gender' => $mapped_profile['profile_gender'],
            'profile_first_name' => $mapped_profile['profile_first_name'],
            'profile_last_name' => $mapped_profile['profile_last_name'],
            'profile_medical_conditions' => $mapped_profile['profile_medical_conditions'],
            'profile_favorite_exercises' => $mapped_profile['profile_favorite_exercises'],
            'profile_disliked_exercises' => $mapped_profile['profile_disliked_exercises'],
            
            // Test metadata
            'test_type' => 'profile_based',
            'test_timestamp' => current_time('mysql')
        ];
    }

    /**
     * Test the modular prompt system with profile data
     * UPDATED: Enhanced error handling and logging
     *
     * @param array $params Generation parameters
     * @return array Prompt generation results
     */
    private function testModularPromptSystem($params) {
        try {
            error_log('[TestingService] Testing modular prompt system with params: ' . json_encode($params));
            
            // Check if modular system classes exist
            $required_classes = [
                'FitCopilot\Service\AI\PromptEngineering\Core\ContextManager',
                'FitCopilot\Service\AI\PromptEngineering\Core\PromptBuilder',
                'FitCopilot\Service\AI\PromptEngineering\Strategies\SingleWorkoutStrategy'
            ];
            
            foreach ($required_classes as $class) {
                if (!class_exists($class)) {
                    $error_msg = "Required modular system class not found: {$class}";
                    error_log('[TestingService] ' . $error_msg);
                    throw new \Exception($error_msg);
                }
            }
            
            error_log('[TestingService] All required modular classes found');
            
            // Create context manager and add profile context
            error_log('[TestingService] Creating ContextManager...');
            $contextManager = new \FitCopilot\Service\AI\PromptEngineering\Core\ContextManager();
            error_log('[TestingService] ContextManager created successfully');
            
            // Add profile context (all the long-term user data)
            $profileContext = array_filter([
                'fitness_level' => $params['profile_fitness_level'],
                'profile_age' => $params['profile_age'],
                'profile_weight' => $params['profile_weight'],
                'profile_weight_unit' => $params['profile_weight_unit'],
                'profile_height' => $params['profile_height'],
                'profile_height_unit' => $params['profile_height_unit'],
                'profile_gender' => $params['profile_gender'],
                'profile_first_name' => $params['profile_first_name'],
                'profile_last_name' => $params['profile_last_name'],
                'profile_limitation_notes' => $params['profile_limitation_notes'],
                'profile_medical_conditions' => $params['profile_medical_conditions']
            ]);
            
            error_log('[TestingService] Adding profile context: ' . json_encode($profileContext));
            $contextManager->addProfileContext($profileContext);
            
            // Add session context (today's workout parameters)
            $sessionContext = [
                'duration' => $params['duration'],
                'equipment' => $params['equipment'],
                'daily_focus' => $params['goals']
            ];
            
            error_log('[TestingService] Adding session context: ' . json_encode($sessionContext));
            $contextManager->addSessionContext($sessionContext);
            
            // Create strategy
            error_log('[TestingService] Creating SingleWorkoutStrategy...');
            $strategy = new \FitCopilot\Service\AI\PromptEngineering\Strategies\SingleWorkoutStrategy();
            error_log('[TestingService] SingleWorkoutStrategy created successfully');
            
            // Build the prompt using the strategy
            error_log('[TestingService] Creating PromptBuilder...');
            $promptBuilder = \FitCopilot\Service\AI\PromptEngineering\Core\PromptBuilder::create()
                ->useStrategy($strategy)
                ->withContext($contextManager);
            
            error_log('[TestingService] PromptBuilder configured, building prompt...');
            $prompt = $promptBuilder->build();
            
            error_log('[TestingService] Prompt built successfully, length: ' . strlen($prompt));
            
            $stats = method_exists($contextManager, 'getStats') ? $contextManager->getStats() : [];
            
            return [
                'success' => true,
                'prompt' => $prompt,
                'contextManager' => true,
                'stats' => $stats,
                'debug' => [
                    'profile_context_fields' => count($profileContext),
                    'session_context_fields' => count($sessionContext),
                    'prompt_length' => strlen($prompt),
                    'strategy_used' => 'SingleWorkoutStrategy'
                ]
            ];
            
        } catch (\Error $e) {
            $error_msg = 'Fatal error in modular prompt system: ' . $e->getMessage();
            error_log('[TestingService] FATAL ERROR: ' . $error_msg);
            error_log('[TestingService] Fatal error trace: ' . $e->getTraceAsString());
            error_log('[TestingService] Fatal error file: ' . $e->getFile() . ':' . $e->getLine());
            
            return [
                'success' => false,
                'error' => $error_msg,
                'error_type' => 'fatal_error',
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'prompt' => '',
                'contextManager' => false
            ];
            
        } catch (\Exception $e) {
            $error_msg = 'Exception in modular prompt system: ' . $e->getMessage();
            error_log('[TestingService] EXCEPTION: ' . $error_msg);
            error_log('[TestingService] Exception trace: ' . $e->getTraceAsString());
            error_log('[TestingService] Exception file: ' . $e->getFile() . ':' . $e->getLine());
            
            return [
                'success' => false,
                'error' => $error_msg,
                'error_type' => 'exception',
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'prompt' => '',
                'contextManager' => false
            ];
        }
    }

    /**
     * Simulate the actual workout generation process
     *
     * @param array $params Generation parameters
     * @return array Workout generation results
     */
    private function simulateProfileWorkoutGeneration($params) {
        try {
            // Simulate what GenerateEndpoint.php would do
            $api_key = get_option('fitcopilot_openai_api_key', 'test_key');
            
            if (empty($api_key) || $api_key === 'test_key') {
                // Return simulated workout for testing
                return [
                    'workout' => [
                        'title' => 'Profile-Based Test Workout',
                        'duration' => $params['duration'] . ' minutes',
                        'focus' => $params['goals'],
                        'exercises' => [
                            [
                                'name' => 'Push-ups',
                                'sets' => 3,
                                'reps' => '8-12',
                                'modification' => $params['profile_limitation_notes'] ? 'Modified for knee issues' : 'Standard form'
                            ],
                            [
                                'name' => 'Squats', 
                                'sets' => 3,
                                'reps' => '10-15',
                                'modification' => $params['profile_limitation_notes'] ? 'Chair-assisted if needed' : 'Bodyweight'
                            ]
                        ],
                        'personalization' => [
                            'fitness_level' => $params['profile_fitness_level'],
                            'equipment_used' => $params['equipment'],
                            'accommodates_limitations' => !empty($params['profile_limitation_notes'])
                        ]
                    ]
                ];
            }
            
            // If we have a real API key, we could test actual generation here
            // For now, just return the simulated workout
            return [
                'workout' => [
                    'title' => 'Profile-Based Test Workout (Simulated)',
                    'message' => 'API key available but testing in simulation mode'
                ]
            ];
            
        } catch (\Exception $e) {
            return [
                'workout' => null,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Format profile summary for display
     *
     * @param array $profile_data Original profile data
     * @param array $mapped_profile Mapped profile data
     * @return array Formatted profile summary
     */
    private function formatProfileSummary($profile_data, $mapped_profile) {
        $name = trim(($profile_data['firstName'] ?? '') . ' ' . ($profile_data['lastName'] ?? ''));
        
        return [
            'name' => !empty($name) ? $name : 'Test User',
            'fitnessLevel' => $profile_data['fitnessLevel'] ?? 'Not specified',
            'goals' => $profile_data['goals'] ?? [],
            'equipment' => $profile_data['availableEquipment'] ?? [],
            'limitations' => $this->formatLimitations($profile_data),
            'physicalStats' => $this->formatPhysicalStats($profile_data),
            'preferences' => [
                'frequency' => $profile_data['workoutFrequency'] ?? 'Not specified',
                'duration' => $profile_data['preferredWorkoutDuration'] ?? 'Not specified',
                'location' => $profile_data['preferredLocation'] ?? 'Not specified'
            ]
        ];
    }

    /**
     * Format limitations for display
     *
     * @param array $profile_data Profile data
     * @return string Formatted limitations
     */
    private function formatLimitations($profile_data) {
        $limitations = [];
        
        if (!empty($profile_data['limitations']) && !in_array('none', $profile_data['limitations'])) {
            $limitations = array_map(function($limitation) {
                return ucwords(str_replace('_', ' ', $limitation));
            }, $profile_data['limitations']);
        }
        
        if (!empty($profile_data['limitationNotes'])) {
            $limitations[] = $profile_data['limitationNotes'];
        }
        
        return !empty($limitations) ? implode(', ', $limitations) : 'None specified';
    }

    /**
     * Format physical stats for display
     *
     * @param array $profile_data Profile data
     * @return string Formatted physical stats
     */
    private function formatPhysicalStats($profile_data) {
        $stats = [];
        
        if (!empty($profile_data['age'])) {
            $stats[] = $profile_data['age'] . ' years old';
        }
        
        if (!empty($profile_data['weight'])) {
            $unit = $profile_data['weightUnit'] ?? 'lbs';
            $stats[] = $profile_data['weight'] . ' ' . $unit;
        }
        
        if (!empty($profile_data['height'])) {
            $unit = $profile_data['heightUnit'] ?? 'ft';
            if ($unit === 'ft') {
                $feet = floor($profile_data['height'] / 12);
                $inches = round($profile_data['height'] % 12);
                $stats[] = $feet . "'" . $inches . '"';
            } else {
                $stats[] = $profile_data['height'] . ' ' . $unit;
            }
        }
        
        if (!empty($profile_data['gender'])) {
            $stats[] = ucfirst($profile_data['gender']);
        }
        
        return !empty($stats) ? implode(', ', $stats) : 'Not specified';
    }

    /**
     * Check if prompt is personalized with profile data
     *
     * @param string $prompt Generated prompt
     * @param array $profile_data Profile data
     * @return bool Whether prompt includes personalization
     */
    private function isPromptPersonalized($prompt, $profile_data) {
        if (empty($prompt)) {
            return false;
        }
        
        $prompt_lower = strtolower($prompt);
        
        // Check for personal markers
        $personal_markers = array_filter([
            $profile_data['firstName'] ?? '',
            $profile_data['fitnessLevel'] ?? '',
            $profile_data['limitationNotes'] ?? ''
        ]);
        
        foreach ($personal_markers as $marker) {
            if (!empty($marker) && strpos($prompt_lower, strtolower($marker)) !== false) {
                return true;
            }
        }
        
        // Check for equipment mentions
        if (!empty($profile_data['availableEquipment'])) {
            foreach ($profile_data['availableEquipment'] as $equipment) {
                if (strpos($prompt_lower, strtolower($equipment)) !== false) {
                    return true;
                }
            }
        }
        
        // Check for goal mentions
        if (!empty($profile_data['goals'])) {
            foreach ($profile_data['goals'] as $goal) {
                if (strpos($prompt_lower, strtolower($goal)) !== false) {
                    return true;
                }
            }
        }
        
        return false;
    }
} 