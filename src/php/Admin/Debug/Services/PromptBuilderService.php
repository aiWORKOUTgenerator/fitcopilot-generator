<?php
/**
 * PromptBuilderService - Phase 1: Core business logic for PromptBuilder
 * 
 * Contains the business logic for live prompt generation, strategy inspection,
 * context analysis, and comprehensive prompt engineering capabilities
 */

namespace FitCopilot\Admin\Debug\Services;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PromptBuilderService Class
 * 
 * Phase 1: Core business logic for enhanced prompt engineering
 */
class PromptBuilderService {
    
    /**
     * Testing service for integration
     *
     * @var TestingService
     */
    private $testingService;
    
    /**
     * Initialize service
     */
    public function __construct() {
        $this->testingService = new TestingService();
    }
    
    /**
     * Generate live prompt with real-time preview
     * Phase 1: Core functionality for immediate prompt building
     *
     * @param array $form_data Sanitized form data
     * @return array Prompt generation result
     */
    public function generateLivePrompt(array $form_data): array {
        $start_time = microtime(true);
        
        try {
            error_log('[PromptBuilderService] Starting live prompt generation');
            error_log('[PromptBuilderService] Form data: ' . json_encode($form_data));
            
            // Step 1: Transform form data into generation parameters
            $generation_params = $this->buildGenerationParams($form_data);
            
            // Step 2: Use existing TestingService modular prompt system
            $prompt_result = $this->testingService->testModularPromptSystem($generation_params);
            
            // Step 3: Calculate prompt statistics
            $prompt_stats = $this->calculatePromptStatistics($prompt_result['prompt'] ?? '');
            
            // Step 4: Analyze prompt quality
            $quality_analysis = $this->analyzePromptQuality($prompt_result['prompt'] ?? '', $form_data);
            
            $result = [
                'success' => true,
                'prompt' => $prompt_result['prompt'] ?? '',
                'prompt_stats' => $prompt_stats,
                'quality_analysis' => $quality_analysis,
                'generation_params' => $generation_params,
                'strategy_used' => 'modular_system',
                'processing_time' => round((microtime(true) - $start_time) * 1000, 2) . 'ms',
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            error_log('[PromptBuilderService] Live prompt generation completed successfully');
            return $result;
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderService] Live prompt generation failed: ' . $e->getMessage());
            error_log('[PromptBuilderService] Stack trace: ' . $e->getTraceAsString());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'processing_time' => round((microtime(true) - $start_time) * 1000, 2) . 'ms',
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Get strategy code for inspection
     * Phase 1: View actual PHP strategy implementation
     *
     * @param string $strategy_name Strategy name to inspect
     * @return array Strategy code result
     */
    public function getStrategyCode(string $strategy_name): array {
        try {
            error_log('[PromptBuilderService] Getting strategy code for: ' . $strategy_name);
            
            // Map strategy names to actual file paths
            $strategy_files = [
                'default' => 'src/php/Service/AI/OpenAIProvider.php',
                'modular' => 'src/php/Service/AI/PromptBuilder/PromptBuilder.php',
                'single_workout' => 'src/php/Service/AI/Strategies/SingleWorkoutStrategy.php'
            ];
            
            $strategy_file = $strategy_files[$strategy_name] ?? $strategy_files['default'];
            $full_path = ABSPATH . 'wp-content/plugins/Fitcopilot-Generator/app/public/wp-content/plugins/Fitcopilot-Generator/' . $strategy_file;
            
            if (!file_exists($full_path)) {
                throw new \Exception("Strategy file not found: {$strategy_file}");
            }
            
            // Read and analyze the strategy file
            $code_content = file_get_contents($full_path);
            $code_analysis = $this->analyzeStrategyCode($code_content);
            
            return [
                'success' => true,
                'strategy_name' => $strategy_name,
                'file_path' => $strategy_file,
                'code_content' => $code_content,
                'code_analysis' => $code_analysis,
                'file_size' => strlen($code_content),
                'line_count' => substr_count($code_content, "\n") + 1,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderService] Get strategy code failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Get context data transformation
     * Phase 1: Show how form data becomes AI context
     *
     * @param array $form_data Sanitized form data
     * @return array Context data result
     */
    public function getContextData(array $form_data): array {
        try {
            error_log('[PromptBuilderService] Getting context data transformation');
            
            // Step 1: Build generation parameters
            $generation_params = $this->buildGenerationParams($form_data);
            
            // Step 2: Map to WordPress user meta format (using TestingService)
            $mapped_profile = $this->testingService->mapProfileDataToWordPressMeta($form_data);
            
            // Step 3: Create context sections
            $context_sections = [
                'profile_context' => $this->buildProfileContext($form_data),
                'session_context' => $this->buildSessionContext($form_data),
                'equipment_context' => $this->buildEquipmentContext($form_data),
                'limitations_context' => $this->buildLimitationsContext($form_data),
                'goals_context' => $this->buildGoalsContext($form_data)
            ];
            
            // Step 4: Analyze context completeness
            $context_analysis = $this->analyzeContextCompleteness($context_sections);
            
            return [
                'success' => true,
                'form_data' => $form_data,
                'generation_params' => $generation_params,
                'mapped_profile' => $mapped_profile,
                'context_sections' => $context_sections,
                'context_analysis' => $context_analysis,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderService] Get context data failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Save prompt template for reuse
     * Phase 1: Template management system
     *
     * @param array $template_data Sanitized template data
     * @return array Save result
     */
    public function saveTemplate(array $template_data): array {
        try {
            error_log('[PromptBuilderService] Saving prompt template: ' . $template_data['name']);
            
            // Generate unique template ID
            $template_id = 'prompt_template_' . time() . '_' . wp_rand(1000, 9999);
            
            // Prepare template data for storage
            $template_record = [
                'id' => $template_id,
                'name' => $template_data['name'],
                'description' => $template_data['description'],
                'form_data' => $template_data['form_data'],
                'prompt' => $template_data['prompt'],
                'tags' => $template_data['tags'],
                'created_by' => get_current_user_id(),
                'created_at' => date('Y-m-d H:i:s'),
                'version' => '1.0'
            ];
            
            // Save to WordPress options (Phase 1: Simple storage)
            $templates = get_option('fitcopilot_prompt_templates', []);
            $templates[$template_id] = $template_record;
            update_option('fitcopilot_prompt_templates', $templates);
            
            return [
                'success' => true,
                'template_id' => $template_id,
                'message' => 'Template saved successfully',
                'template_record' => $template_record,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderService] Save template failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Get user profile data for form population
     * Phase 1: Load current user's WordPress profile data
     *
     * @return array User profile data
     */
    public function getUserProfileData(): array {
        try {
            $user_id = get_current_user_id();
            error_log('[PromptBuilderService] Getting user profile data for user ID: ' . $user_id);
            
            if (!$user_id) {
                throw new \Exception('User not logged in');
            }
            
            // Get WordPress user data
            $user = get_userdata($user_id);
            if (!$user) {
                throw new \Exception('User data not found');
            }
            
            // Get FitCopilot profile data from user meta
            $profile_data = [
                'basic_info' => [
                    'name' => $user->display_name ?: $user->user_login,
                    'age' => absint(get_user_meta($user_id, '_profile_age', true) ?: 0),
                    'gender' => get_user_meta($user_id, '_profile_gender', true) ?: '',
                    'fitness_level' => get_user_meta($user_id, '_profile_fitnessLevel', true) ?: '',
                    'weight' => floatval(get_user_meta($user_id, '_profile_weight', true) ?: 0),
                    'height' => floatval(get_user_meta($user_id, '_profile_height', true) ?: 0)
                ],
                'goals' => [
                    'primary_goal' => get_user_meta($user_id, '_profile_goals', true) ?: '',
                    'secondary_goals' => get_user_meta($user_id, '_profile_customGoal', true) ? [get_user_meta($user_id, '_profile_customGoal', true)] : [],
                    'target_areas' => get_user_meta($user_id, '_profile_targetAreas', true) ?: []
                ],
                'equipment' => get_user_meta($user_id, '_profile_availableEquipment', true) ?: [],
                'session_params' => [
                    'duration' => absint(get_user_meta($user_id, '_profile_preferredWorkoutDuration', true) ?: 30),
                    'focus' => get_user_meta($user_id, '_profile_workoutFocus', true) ?: '',
                    'energy_level' => 3, // Default values for session-specific params
                    'stress_level' => 3,
                    'sleep_quality' => 3
                ],
                'limitations' => [
                    'injuries' => get_user_meta($user_id, '_profile_injuries', true) ?: '',
                    'restrictions' => get_user_meta($user_id, '_profile_medicalConditions', true) ?: '',
                    'preferences' => get_user_meta($user_id, '_profile_favoriteExercises', true) ?: ''
                ],
                'custom_instructions' => get_user_meta($user_id, '_profile_customInstructions', true) ?: ''
            ];
            
            // Calculate profile completeness
            $completeness = $this->calculateProfileCompleteness($profile_data);
            
            return [
                'success' => true,
                'user_id' => $user_id,
                'profile_data' => $profile_data,
                'completeness' => $completeness,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            error_log('[PromptBuilderService] Get user profile data failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Build generation parameters from form data
     * Transforms PromptBuilder form data into TestingService format
     *
     * @param array $form_data Sanitized form data
     * @return array Generation parameters
     */
    private function buildGenerationParams(array $form_data): array {
        return [
            'duration' => $form_data['session_params']['duration'] ?? 30,
            'difficulty' => $this->mapFitnessLevelToDifficulty($form_data['basic_info']['fitness_level'] ?? ''),
            'goals' => $form_data['goals']['primary_goal'] ?? '',
            'equipment' => $form_data['equipment'] ?? [],
            'stress_level' => $form_data['session_params']['stress_level'] ?? 3,
            'energy_level' => $form_data['session_params']['energy_level'] ?? 3,
            'sleep_quality' => $form_data['session_params']['sleep_quality'] ?? 3,
            'location' => 'home', // Default for PromptBuilder
            'custom_notes' => $form_data['custom_instructions'] ?? '',
            'restrictions' => $form_data['limitations']['injuries'] ?? '',
            'muscle_targeting' => $form_data['goals']['target_areas'] ?? []
        ];
    }
    
    /**
     * Calculate prompt statistics
     *
     * @param string $prompt Generated prompt
     * @return array Prompt statistics
     */
    private function calculatePromptStatistics(string $prompt): array {
        $char_count = strlen($prompt);
        $word_count = str_word_count($prompt);
        $line_count = substr_count($prompt, "\n") + 1;
        
        // Estimate token count (rough approximation: 4 chars per token)
        $estimated_tokens = ceil($char_count / 4);
        
        // Count sections (lines starting with capital letters or numbers)
        $section_count = preg_match_all('/^[A-Z0-9]/m', $prompt);
        
        return [
            'characters' => $char_count,
            'words' => $word_count,
            'lines' => $line_count,
            'estimated_tokens' => $estimated_tokens,
            'sections' => $section_count,
            'readability_score' => $this->calculateReadabilityScore($prompt)
        ];
    }
    
    /**
     * Analyze prompt quality
     *
     * @param string $prompt Generated prompt
     * @param array $form_data Original form data
     * @return array Quality analysis
     */
    private function analyzePromptQuality(string $prompt, array $form_data): array {
        $analysis = [
            'personalization_score' => 0,
            'completeness_score' => 0,
            'clarity_score' => 0,
            'issues' => [],
            'suggestions' => []
        ];
        
        // Check personalization (mentions of user data)
        $personalization_keywords = [
            $form_data['basic_info']['name'] ?? '',
            $form_data['basic_info']['fitness_level'] ?? '',
            $form_data['goals']['primary_goal'] ?? ''
        ];
        
        $personalization_count = 0;
        foreach ($personalization_keywords as $keyword) {
            if (!empty($keyword) && stripos($prompt, $keyword) !== false) {
                $personalization_count++;
            }
        }
        
        $analysis['personalization_score'] = min(100, ($personalization_count / max(1, count(array_filter($personalization_keywords)))) * 100);
        
        // Check completeness (required sections)
        $required_sections = ['workout', 'exercise', 'duration', 'goal'];
        $completeness_count = 0;
        foreach ($required_sections as $section) {
            if (stripos($prompt, $section) !== false) {
                $completeness_count++;
            }
        }
        
        $analysis['completeness_score'] = ($completeness_count / count($required_sections)) * 100;
        
        // Check clarity (sentence structure, length)
        $analysis['clarity_score'] = $this->calculateClarityScore($prompt);
        
        // Identify issues
        if ($analysis['personalization_score'] < 50) {
            $analysis['issues'][] = 'Low personalization - prompt may be too generic';
        }
        
        if ($analysis['completeness_score'] < 75) {
            $analysis['issues'][] = 'Missing key workout elements';
        }
        
        if (strlen($prompt) < 100) {
            $analysis['issues'][] = 'Prompt may be too short for effective AI generation';
        }
        
        // Generate suggestions
        if ($analysis['personalization_score'] < 75) {
            $analysis['suggestions'][] = 'Include more specific user details in the prompt';
        }
        
        if ($analysis['completeness_score'] < 90) {
            $analysis['suggestions'][] = 'Ensure all workout parameters are clearly specified';
        }
        
        return $analysis;
    }
    
    /**
     * Analyze strategy code
     *
     * @param string $code_content PHP code content
     * @return array Code analysis
     */
    private function analyzeStrategyCode(string $code_content): array {
        $analysis = [
            'methods' => [],
            'classes' => [],
            'complexity_score' => 0,
            'documentation_score' => 0
        ];
        
        // Extract methods
        preg_match_all('/(?:public|private|protected)\s+function\s+(\w+)/', $code_content, $method_matches);
        $analysis['methods'] = $method_matches[1] ?? [];
        
        // Extract classes
        preg_match_all('/class\s+(\w+)/', $code_content, $class_matches);
        $analysis['classes'] = $class_matches[1] ?? [];
        
        // Calculate complexity (rough estimate based on control structures)
        $complexity_keywords = ['if', 'else', 'for', 'foreach', 'while', 'switch', 'case', 'try', 'catch'];
        $complexity_count = 0;
        foreach ($complexity_keywords as $keyword) {
            $complexity_count += substr_count(strtolower($code_content), $keyword);
        }
        
        $analysis['complexity_score'] = min(100, $complexity_count * 2);
        
        // Calculate documentation score (comments ratio)
        $comment_lines = substr_count($code_content, '//') + substr_count($code_content, '/*');
        $total_lines = substr_count($code_content, "\n") + 1;
        $analysis['documentation_score'] = ($comment_lines / max(1, $total_lines)) * 100;
        
        return $analysis;
    }
    
    /**
     * Build profile context section
     *
     * @param array $form_data Form data
     * @return array Profile context
     */
    private function buildProfileContext(array $form_data): array {
        return [
            'name' => $form_data['basic_info']['name'] ?? 'User',
            'age' => $form_data['basic_info']['age'] ?? 0,
            'gender' => $form_data['basic_info']['gender'] ?? '',
            'fitness_level' => $form_data['basic_info']['fitness_level'] ?? '',
            'physical_stats' => [
                'weight' => $form_data['basic_info']['weight'] ?? 0,
                'height' => $form_data['basic_info']['height'] ?? 0
            ]
        ];
    }
    
    /**
     * Build session context section
     *
     * @param array $form_data Form data
     * @return array Session context
     */
    private function buildSessionContext(array $form_data): array {
        return [
            'duration' => $form_data['session_params']['duration'] ?? 30,
            'focus' => $form_data['session_params']['focus'] ?? '',
            'energy_level' => $form_data['session_params']['energy_level'] ?? 3,
            'stress_level' => $form_data['session_params']['stress_level'] ?? 3,
            'sleep_quality' => $form_data['session_params']['sleep_quality'] ?? 3
        ];
    }
    
    /**
     * Build equipment context section
     *
     * @param array $form_data Form data
     * @return array Equipment context
     */
    private function buildEquipmentContext(array $form_data): array {
        return [
            'available_equipment' => $form_data['equipment'] ?? [],
            'equipment_count' => count($form_data['equipment'] ?? []),
            'has_weights' => in_array('dumbbells', $form_data['equipment'] ?? []) || in_array('barbell', $form_data['equipment'] ?? []),
            'has_cardio' => in_array('treadmill', $form_data['equipment'] ?? []) || in_array('bike', $form_data['equipment'] ?? [])
        ];
    }
    
    /**
     * Build limitations context section
     *
     * @param array $form_data Form data
     * @return array Limitations context
     */
    private function buildLimitationsContext(array $form_data): array {
        return [
            'injuries' => $form_data['limitations']['injuries'] ?? '',
            'restrictions' => $form_data['limitations']['restrictions'] ?? '',
            'preferences' => $form_data['limitations']['preferences'] ?? '',
            'has_limitations' => !empty($form_data['limitations']['injuries']) || !empty($form_data['limitations']['restrictions'])
        ];
    }
    
    /**
     * Build goals context section
     *
     * @param array $form_data Form data
     * @return array Goals context
     */
    private function buildGoalsContext(array $form_data): array {
        return [
            'primary_goal' => $form_data['goals']['primary_goal'] ?? '',
            'secondary_goals' => $form_data['goals']['secondary_goals'] ?? [],
            'target_areas' => $form_data['goals']['target_areas'] ?? [],
            'goal_count' => 1 + count($form_data['goals']['secondary_goals'] ?? [])
        ];
    }
    
    /**
     * Analyze context completeness
     *
     * @param array $context_sections Context sections
     * @return array Completeness analysis
     */
    private function analyzeContextCompleteness(array $context_sections): array {
        $total_fields = 0;
        $completed_fields = 0;
        
        foreach ($context_sections as $section_name => $section_data) {
            foreach ($section_data as $field => $value) {
                $total_fields++;
                if (!empty($value) && $value !== 0) {
                    $completed_fields++;
                }
            }
        }
        
        $completeness_percentage = $total_fields > 0 ? ($completed_fields / $total_fields) * 100 : 0;
        
        return [
            'total_fields' => $total_fields,
            'completed_fields' => $completed_fields,
            'completeness_percentage' => round($completeness_percentage, 1),
            'missing_sections' => $this->identifyMissingSections($context_sections)
        ];
    }
    
    /**
     * Calculate profile completeness
     *
     * @param array $profile_data Profile data
     * @return array Completeness metrics
     */
    private function calculateProfileCompleteness(array $profile_data): array {
        $total_fields = 0;
        $completed_fields = 0;
        
        $this->countFields($profile_data, $total_fields, $completed_fields);
        
        $completeness_percentage = $total_fields > 0 ? ($completed_fields / $total_fields) * 100 : 0;
        
        return [
            'total_fields' => $total_fields,
            'completed_fields' => $completed_fields,
            'percentage' => round($completeness_percentage, 1),
            'status' => $completeness_percentage >= 75 ? 'complete' : ($completeness_percentage >= 50 ? 'partial' : 'incomplete')
        ];
    }
    
    /**
     * Map fitness level to difficulty
     *
     * @param string $fitness_level Fitness level
     * @return string Difficulty level
     */
    private function mapFitnessLevelToDifficulty(string $fitness_level): string {
        $mapping = [
            'beginner' => 'easy',
            'intermediate' => 'moderate',
            'advanced' => 'hard',
            'expert' => 'very_hard'
        ];
        
        return $mapping[strtolower($fitness_level)] ?? 'moderate';
    }
    
    /**
     * Calculate readability score
     *
     * @param string $text Text to analyze
     * @return int Readability score (0-100)
     */
    private function calculateReadabilityScore(string $text): int {
        $sentences = preg_split('/[.!?]+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $words = str_word_count($text);
        $syllables = $this->countSyllables($text);
        
        if (count($sentences) == 0 || $words == 0) {
            return 0;
        }
        
        // Simplified Flesch Reading Ease formula
        $score = 206.835 - (1.015 * ($words / count($sentences))) - (84.6 * ($syllables / $words));
        
        return max(0, min(100, intval($score)));
    }
    
    /**
     * Calculate clarity score
     *
     * @param string $prompt Prompt text
     * @return int Clarity score (0-100)
     */
    private function calculateClarityScore(string $prompt): int {
        $score = 100;
        
        // Penalty for very long sentences
        $sentences = preg_split('/[.!?]+/', $prompt, -1, PREG_SPLIT_NO_EMPTY);
        foreach ($sentences as $sentence) {
            $word_count = str_word_count($sentence);
            if ($word_count > 25) {
                $score -= 5;
            }
        }
        
        // Penalty for unclear language
        $unclear_words = ['maybe', 'perhaps', 'possibly', 'might', 'could be'];
        foreach ($unclear_words as $word) {
            if (stripos($prompt, $word) !== false) {
                $score -= 3;
            }
        }
        
        return max(0, $score);
    }
    
    /**
     * Count syllables in text (approximation)
     *
     * @param string $text Text to analyze
     * @return int Syllable count
     */
    private function countSyllables(string $text): int {
        $words = str_word_count(strtolower($text), 1);
        $syllable_count = 0;
        
        foreach ($words as $word) {
            $syllable_count += max(1, preg_match_all('/[aeiouy]+/', $word));
        }
        
        return $syllable_count;
    }
    
    /**
     * Identify missing sections
     *
     * @param array $context_sections Context sections
     * @return array Missing sections
     */
    private function identifyMissingSections(array $context_sections): array {
        $missing = [];
        
        foreach ($context_sections as $section_name => $section_data) {
            $empty_fields = 0;
            $total_fields = count($section_data);
            
            foreach ($section_data as $field => $value) {
                if (empty($value) && $value !== 0) {
                    $empty_fields++;
                }
            }
            
            if ($empty_fields > $total_fields * 0.5) {
                $missing[] = $section_name;
            }
        }
        
        return $missing;
    }
    
    /**
     * Count fields recursively
     *
     * @param array $data Data to count
     * @param int $total_fields Total fields counter
     * @param int $completed_fields Completed fields counter
     * @return void
     */
    private function countFields(array $data, int &$total_fields, int &$completed_fields): void {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $this->countFields($value, $total_fields, $completed_fields);
            } else {
                $total_fields++;
                if (!empty($value) && $value !== 0) {
                    $completed_fields++;
                }
            }
        }
    }
} 