<?php

namespace FitCopilot\Modules\MuscleTargeting;

/**
 * Muscle Service
 * 
 * Handles the business logic for muscle targeting including:
 * - AI-powered muscle suggestions based on user profile
 * - Loading and saving muscle selections
 * - Muscle group validation and management
 * - Integration with workout generation system
 */
class MuscleService {
    
    private MuscleRepository $repository;
    
    public function __construct(MuscleRepository $repository) {
        $this->repository = $repository;
    }
    
    /**
     * Generate AI-powered muscle suggestions based on user profile
     */
    public function generateMuscleSuggestions(array $profile_data, int $user_id): array {
        try {
            // Get user's current muscle selection context
            $current_selection = $this->repository->getUserMuscleSelection($user_id);
            
            // Extract profile goals and fitness level
            $goals = $this->extractGoals($profile_data);
            $fitness_level = $this->extractFitnessLevel($profile_data);
            $available_equipment = $this->extractEquipment($profile_data);
            $limitations = $this->extractLimitations($profile_data);
            
            // Generate muscle suggestions based on goals
            $suggestions = $this->generateSuggestionsByGoals($goals, $fitness_level, $available_equipment, $limitations);
            
            // Add contextual recommendations
            $suggestions = $this->addContextualRecommendations($suggestions, $current_selection, $profile_data);
            
            // Log suggestion generation
            error_log("[MuscleService] Generated muscle suggestions for user {$user_id} with goals: " . implode(', ', $goals));
            
            return [
                'suggestions' => $suggestions,
                'reasoning' => $this->generateSuggestionReasoning($goals, $fitness_level, $limitations),
                'current_selection' => $current_selection,
                'profile_context' => [
                    'goals' => $goals,
                    'fitness_level' => $fitness_level,
                    'equipment' => $available_equipment,
                    'limitations' => $limitations
                ]
            ];
            
        } catch (\Exception $e) {
            error_log('[MuscleService] Failed to generate muscle suggestions: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Load user muscle selection
     */
    public function loadMuscleSelection(int $user_id): array {
        try {
            $selection = $this->repository->getUserMuscleSelection($user_id);
            $stats = $this->repository->getMuscleSelectionStats($user_id);
            
            return [
                'selection_data' => $selection,
                'statistics' => $stats,
                'formatted_summary' => $this->formatSelectionSummary($selection)
            ];
            
        } catch (\Exception $e) {
            error_log('[MuscleService] Failed to load muscle selection: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Save user muscle selection
     */
    public function saveMuscleSelection(int $user_id, array $selection_data): bool {
        try {
            // Validate the selection data
            $validation_result = $this->repository->validateSelectionData($selection_data);
            
            if (!$validation_result['is_valid']) {
                throw new \Exception('Invalid muscle selection: ' . implode(', ', $validation_result['errors']));
            }
            
            // Save the selection
            $save_result = $this->repository->saveMuscleSelection($user_id, $selection_data);
            
            if ($save_result) {
                // Create automatic backup for important selections
                if (count($selection_data['selectedGroups'] ?? []) >= 2) {
                    $this->repository->backupMuscleSelection($user_id);
                }
            }
            
            return $save_result;
            
        } catch (\Exception $e) {
            error_log('[MuscleService] Failed to save muscle selection: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Clear user muscle selection  
     */
    public function clearMuscleSelection(int $user_id): bool {
        try {
            return $this->repository->clearMuscleSelection($user_id);
            
        } catch (\Exception $e) {
            error_log('[MuscleService] Failed to clear muscle selection: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Get muscle groups data
     */
    public function getMuscleGroups(): array {
        return $this->repository->getMuscleGroups();
    }
    
    /**
     * Get specific muscle group details
     */
    public function getMuscleGroupDetails(string $group): array {
        return $this->repository->getMuscleGroupDetails($group);
    }
    
    /**
     * Get muscle selection for workout context
     */
    public function getMuscleSelectionForWorkout(int $user_id): array {
        $selection = $this->repository->getUserMuscleSelection($user_id);
        
        return [
            'target_muscle_groups' => $selection['selectedGroups'] ?? [],
            'specific_muscles' => $selection['selectedMuscles'] ?? [],
            'muscle_focus_priority' => $this->calculateMusclePriority($selection),
            'workout_context' => $this->generateWorkoutContext($selection)
        ];
    }
    
    /**
     * Extract goals from profile data
     */
    private function extractGoals(array $profile_data): array {
        $goals = [];
        
        // Handle different profile data structures
        if (isset($profile_data['goals']['primary_goals'])) {
            $goals = $profile_data['goals']['primary_goals'];
        } elseif (isset($profile_data['goals'])) {
            $goals = is_array($profile_data['goals']) ? $profile_data['goals'] : [$profile_data['goals']];
        } elseif (isset($profile_data['goal'])) {
            $goals = is_array($profile_data['goal']) ? $profile_data['goal'] : [$profile_data['goal']];
        }
        
        // Normalize goal names
        return array_map(function($goal) {
            return strtolower(trim($goal));
        }, $goals);
    }
    
    /**
     * Extract fitness level from profile data
     */
    private function extractFitnessLevel(array $profile_data): string {
        if (isset($profile_data['basic_info']['fitness_level'])) {
            return strtolower($profile_data['basic_info']['fitness_level']);
        } elseif (isset($profile_data['fitness_level'])) {
            return strtolower($profile_data['fitness_level']);
        } elseif (isset($profile_data['experienceLevel'])) {
            return strtolower($profile_data['experienceLevel']);
        }
        
        return 'intermediate'; // Default fallback
    }
    
    /**
     * Extract equipment from profile data
     */
    private function extractEquipment(array $profile_data): array {
        if (isset($profile_data['equipment']) && is_array($profile_data['equipment'])) {
            return $profile_data['equipment'];
        } elseif (isset($profile_data['available_equipment'])) {
            return is_array($profile_data['available_equipment']) ? $profile_data['available_equipment'] : [];
        }
        
        return [];
    }
    
    /**
     * Extract limitations from profile data
     */
    private function extractLimitations(array $profile_data): array {
        $limitations = [];
        
        if (isset($profile_data['limitations']['physical_limitations'])) {
            $limitations = array_merge($limitations, $profile_data['limitations']['physical_limitations']);
        }
        
        if (isset($profile_data['limitations']['medical_conditions'])) {
            $limitations[] = $profile_data['limitations']['medical_conditions'];
        }
        
        if (isset($profile_data['limitations']['injuries'])) {
            $limitations[] = $profile_data['limitations']['injuries'];
        }
        
        return array_filter($limitations);
    }
    
    /**
     * Generate muscle suggestions based on goals
     */
    private function generateSuggestionsByGoals(array $goals, string $fitness_level, array $equipment, array $limitations): array {
        $suggestions = [];
        
        foreach ($goals as $goal) {
            switch ($goal) {
                case 'strength':
                case 'muscle_building':
                case 'increase_strength':
                    $suggestions[] = [
                        'groups' => ['back', 'chest', 'legs'],
                        'reasoning' => 'Compound movements targeting major muscle groups for strength building',
                        'priority' => 'high',
                        'specific_focus' => $this->getStrengthSpecificMuscles($fitness_level)
                    ];
                    break;
                    
                case 'weight_loss':
                case 'fat_loss':
                case 'lose_weight':
                    $suggestions[] = [
                        'groups' => ['legs', 'core', 'back'],
                        'reasoning' => 'Large muscle groups for maximum calorie burn and metabolic impact',
                        'priority' => 'high',
                        'specific_focus' => ['Quadriceps', 'Hamstrings', 'Glutes', 'Upper Abs', 'Lower Abs', 'Lats']
                    ];
                    break;
                    
                case 'endurance':
                case 'cardiovascular':
                    $suggestions[] = [
                        'groups' => ['legs', 'core', 'shoulders'],
                        'reasoning' => 'Functional muscle groups for endurance and cardiovascular fitness',
                        'priority' => 'medium',
                        'specific_focus' => ['Quadriceps', 'Calves', 'Transverse Abdominis', 'Front Delts']
                    ];
                    break;
                    
                case 'flexibility':
                case 'mobility':
                    $suggestions[] = [
                        'groups' => ['back', 'shoulders', 'core'],
                        'reasoning' => 'Key muscle groups for posture, mobility, and flexibility',
                        'priority' => 'medium',
                        'specific_focus' => ['Middle Traps', 'Lower Traps', 'Rear Delts', 'Obliques']
                    ];
                    break;
                    
                case 'toning':
                case 'body_composition':
                    $suggestions[] = [
                        'groups' => ['arms', 'core', 'chest'],
                        'reasoning' => 'Aesthetic muscle groups for body composition and definition',
                        'priority' => 'medium',
                        'specific_focus' => ['Biceps', 'Triceps', 'Upper Abs', 'Lower Abs', 'Upper Chest']
                    ];
                    break;
                    
                default:
                    // Default balanced approach
                    $suggestions[] = [
                        'groups' => ['back', 'chest', 'legs'],
                        'reasoning' => 'Balanced full-body approach for general fitness',
                        'priority' => 'medium',
                        'specific_focus' => $this->getBalancedMuscleSelection()
                    ];
            }
        }
        
        return $this->filterSuggestionsByConstraints($suggestions, $equipment, $limitations);
    }
    
    /**
     * Get strength-specific muscle focus based on fitness level
     */
    private function getStrengthSpecificMuscles(string $fitness_level): array {
        switch ($fitness_level) {
            case 'beginner':
                return ['Lats', 'Upper Chest', 'Quadriceps', 'Hamstrings'];
            case 'intermediate':
                return ['Lats', 'Middle Traps', 'Upper Chest', 'Middle Chest', 'Quadriceps', 'Hamstrings', 'Glutes'];
            case 'advanced':
                return ['Lats', 'Rhomboids', 'Middle Traps', 'Upper Chest', 'Middle Chest', 'Lower Chest', 'Quadriceps', 'Hamstrings', 'Glutes'];
            default:
                return ['Lats', 'Upper Chest', 'Quadriceps', 'Hamstrings'];
        }
    }
    
    /**
     * Get balanced muscle selection for general fitness
     */
    private function getBalancedMuscleSelection(): array {
        return ['Lats', 'Upper Chest', 'Quadriceps', 'Hamstrings', 'Upper Abs', 'Front Delts'];
    }
    
    /**
     * Filter suggestions based on equipment and limitations
     */
    private function filterSuggestionsByConstraints(array $suggestions, array $equipment, array $limitations): array {
        // Apply limitation filters
        foreach ($limitations as $limitation) {
            $limitation_lower = strtolower($limitation);
            
            // Filter out muscle groups based on common limitations
            if (strpos($limitation_lower, 'knee') !== false || strpos($limitation_lower, 'leg') !== false) {
                $suggestions = $this->removeMuscleGroupFromSuggestions($suggestions, 'legs');
            }
            
            if (strpos($limitation_lower, 'back') !== false || strpos($limitation_lower, 'spine') !== false) {
                $suggestions = $this->removeMuscleGroupFromSuggestions($suggestions, 'back');
            }
            
            if (strpos($limitation_lower, 'shoulder') !== false || strpos($limitation_lower, 'arm') !== false) {
                $suggestions = $this->removeMuscleGroupFromSuggestions($suggestions, 'shoulders');
                $suggestions = $this->removeMuscleGroupFromSuggestions($suggestions, 'arms');
            }
        }
        
        return $suggestions;
    }
    
    /**
     * Remove specific muscle group from suggestions
     */
    private function removeMuscleGroupFromSuggestions(array $suggestions, string $muscle_group): array {
        foreach ($suggestions as &$suggestion) {
            $suggestion['groups'] = array_filter($suggestion['groups'], function($group) use ($muscle_group) {
                return $group !== $muscle_group;
            });
        }
        
        return $suggestions;
    }
    
    /**
     * Add contextual recommendations based on current selection
     */
    private function addContextualRecommendations(array $suggestions, array $current_selection, array $profile_data): array {
        // If user has existing selections, suggest complementary muscles
        if (!empty($current_selection['selectedGroups'])) {
            $selected_groups = $current_selection['selectedGroups'];
            $complementary = $this->getComplementaryMuscleGroups($selected_groups);
            
            if (!empty($complementary)) {
                $suggestions[] = [
                    'groups' => $complementary,
                    'reasoning' => 'Complementary muscle groups to balance your current selection',
                    'priority' => 'contextual',
                    'specific_focus' => $this->getComplementarySpecificMuscles($selected_groups)
                ];
            }
        }
        
        return $suggestions;
    }
    
    /**
     * Get complementary muscle groups for balance
     */
    private function getComplementaryMuscleGroups(array $selected_groups): array {
        $complementary_map = [
            'chest' => ['back'],
            'back' => ['chest'],
            'arms' => ['shoulders'],
            'shoulders' => ['arms'],
            'legs' => ['core'],
            'core' => ['legs']
        ];
        
        $complementary = [];
        foreach ($selected_groups as $group) {
            if (isset($complementary_map[$group])) {
                $complementary = array_merge($complementary, $complementary_map[$group]);
            }
        }
        
        return array_unique($complementary);
    }
    
    /**
     * Get complementary specific muscles
     */
    private function getComplementarySpecificMuscles(array $selected_groups): array {
        $complementary = [];
        
        if (in_array('chest', $selected_groups)) {
            $complementary = array_merge($complementary, ['Lats', 'Rhomboids', 'Rear Delts']);
        }
        
        if (in_array('back', $selected_groups)) {
            $complementary = array_merge($complementary, ['Upper Chest', 'Middle Chest', 'Front Delts']);
        }
        
        return array_unique($complementary);
    }
    
    /**
     * Generate reasoning text for suggestions
     */
    private function generateSuggestionReasoning(array $goals, string $fitness_level, array $limitations): string {
        $reasoning = "Based on your ";
        
        if (!empty($goals)) {
            $reasoning .= "goals (" . implode(', ', $goals) . ") ";
        }
        
        $reasoning .= "and {$fitness_level} fitness level, ";
        
        if (!empty($limitations)) {
            $reasoning .= "considering your physical limitations, ";
        }
        
        $reasoning .= "these muscle groups will provide the most effective workout targeting for your specific needs.";
        
        return $reasoning;
    }
    
    /**
     * Format selection summary for display
     */
    private function formatSelectionSummary(array $selection): string {
        if (empty($selection['selectedGroups'])) {
            return 'No muscle groups selected';
        }
        
        $group_count = count($selection['selectedGroups']);
        $muscle_count = 0;
        
        if (is_array($selection['selectedMuscles'])) {
            $muscle_count = array_sum(array_map('count', $selection['selectedMuscles']));
        }
        
        $summary = "{$group_count} muscle group" . ($group_count > 1 ? 's' : '') . " selected";
        
        if ($muscle_count > 0) {
            $summary .= " ({$muscle_count} specific muscles)";
        }
        
        return $summary;
    }
    
    /**
     * Calculate muscle priority for workout generation
     */
    private function calculateMusclePriority(array $selection): array {
        $priorities = [];
        
        if (empty($selection['selectedGroups'])) {
            return $priorities;
        }
        
        // Assign priorities based on selection order and muscle group importance
        $importance_weights = [
            'legs' => 10,    // Largest muscle group
            'back' => 9,     // Major compound movements
            'chest' => 8,    // Major pushing muscles
            'shoulders' => 7, // Stability and overhead movements
            'core' => 6,     // Functional strength
            'arms' => 5      // Smaller muscle group
        ];
        
        foreach ($selection['selectedGroups'] as $index => $group) {
            $base_priority = $importance_weights[$group] ?? 5;
            $order_bonus = (count($selection['selectedGroups']) - $index) * 2;
            $priorities[$group] = $base_priority + $order_bonus;
        }
        
        arsort($priorities);
        return $priorities;
    }
    
    /**
     * Generate workout context for AI prompt
     */
    private function generateWorkoutContext(array $selection): string {
        if (empty($selection['selectedGroups'])) {
            return 'No specific muscle targeting requested';
        }
        
        $muscle_groups = $this->getMuscleGroups();
        $context_parts = [];
        
        foreach ($selection['selectedGroups'] as $group) {
            if (isset($muscle_groups[$group])) {
                $group_info = $muscle_groups[$group];
                $context_parts[] = "Target {$group_info['display']} muscles for {$group_info['description']}";
                
                // Add specific muscles if selected
                if (isset($selection['selectedMuscles'][$group]) && !empty($selection['selectedMuscles'][$group])) {
                    $specific_muscles = implode(', ', $selection['selectedMuscles'][$group]);
                    $context_parts[] = "Focus specifically on: {$specific_muscles}";
                }
            }
        }
        
        return implode('. ', $context_parts);
    }
} 