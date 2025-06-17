<?php
/**
 * IntermediateFragments - Intermediate-Specific Prompt Fragments
 * 
 * Specialized prompt fragments for users with intermediate fitness level.
 * Focus on progressive challenges, exercise variety, and skill development.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\FitnessLevel;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * IntermediateFragments Class
 * 
 * Provides intermediate-specific prompt fragments for workout generation
 */
class IntermediateFragments {
    
    /**
     * Get core intermediate guidance fragment
     *
     * @return string Intermediate-specific guidance
     */
    public static function getCoreGuidance(): string {
        return "INTERMEDIATE FITNESS GUIDANCE:\n" .
               "- **Challenge Progression**: Introduce moderate complexity and varied movement patterns\n" .
               "- **Skill Development**: Focus on improving movement quality and exercise technique\n" .
               "- **Training Variety**: Include different exercise modalities and training styles\n" .
               "- **Progressive Overload**: Systematically increase intensity, volume, or complexity\n" .
               "- **Performance Focus**: Work toward measurable improvements in strength and endurance\n" .
               "- **Recovery Balance**: Understand the importance of rest and active recovery\n\n";
    }
    
    /**
     * Get intermediate exercise selection criteria
     *
     * @return string Exercise selection guidelines
     */
    public static function getExerciseSelection(): string {
        return "INTERMEDIATE EXERCISE SELECTION:\n" .
               "- Include compound movements as primary exercises\n" .
               "- Combine bilateral and unilateral training\n" .
               "- Integrate multi-planar movements (sagittal, frontal, transverse)\n" .
               "- Use exercise variations to target different muscle groups\n" .
               "- Include both concentric and eccentric movement phases\n" .
               "- Incorporate functional movement patterns\n\n";
    }
    
    /**
     * Get intermediate intensity guidelines
     *
     * @return string Intensity modification guidelines
     */
    public static function getIntensityGuidelines(): string {
        return "INTERMEDIATE INTENSITY MODIFICATIONS:\n" .
               "- Work at 65-80% of maximum effort\n" .
               "- Use rep ranges of 8-15 depending on training goal\n" .
               "- Rest 45-75 seconds between exercises\n" .
               "- Include tempo variations (slow eccentrics, pause reps)\n" .
               "- Incorporate interval training and circuit methods\n" .
               "- Challenge cardiovascular system while maintaining form\n\n";
    }
    
    /**
     * Get intermediate training strategies
     *
     * @return string Training strategy recommendations
     */
    public static function getTrainingStrategies(): string {
        return "INTERMEDIATE TRAINING STRATEGIES:\n" .
               "- **Periodization**: Vary training focus weekly (strength, power, endurance)\n" .
               "- **Supersets**: Pair complementary exercises for efficiency\n" .
               "- **Circuit Training**: Combine strength and cardio elements\n" .
               "- **Progressive Overload**: Increase difficulty each week\n" .
               "- **Movement Quality**: Focus on perfect form at higher intensities\n" .
               "- **Exercise Complexity**: Add coordination and stability challenges\n\n";
    }
    
    /**
     * Get intermediate equipment utilization
     *
     * @return string Equipment guidance for intermediates
     */
    public static function getEquipmentGuidance(): string {
        return "INTERMEDIATE EQUIPMENT UTILIZATION:\n" .
               "- **Resistance Progression**: Use adjustable dumbbells, resistance bands, or cables\n" .
               "- **Stability Challenges**: Incorporate unstable surfaces (BOSU, stability ball)\n" .
               "- **Functional Tools**: Kettlebells, medicine balls, suspension trainers\n" .
               "- **Combined Implements**: Use multiple pieces of equipment in single exercises\n" .
               "- **Creative Adaptations**: Modify basic equipment for varied resistance\n" .
               "- **Safety Equipment**: Ensure proper form devices (mirrors, video feedback)\n\n";
    }
    
    /**
     * Get intermediate workout structure recommendations
     *
     * @return string Workout structure for intermediates
     */
    public static function getWorkoutStructure(): string {
        return "INTERMEDIATE WORKOUT STRUCTURE:\n" .
               "- **Dynamic Warm-up (8-10 minutes)**: Movement preparation and activation\n" .
               "- **Skill Practice (5 minutes)**: Complex movement rehearsal\n" .
               "- **Main Training (25-35 minutes)**: 8-12 exercises with variations\n" .
               "- **Metabolic Finisher (5 minutes)**: High-intensity circuit\n" .
               "- **Cool-down (5-8 minutes)**: Targeted stretching and mobility\n" .
               "- **Total Duration**: 45-60 minutes\n\n";
    }
    
    /**
     * Get intermediate progression methodology
     *
     * @return string How intermediates should progress
     */
    public static function getProgressionMethodology(): string {
        return "INTERMEDIATE PROGRESSION METHODOLOGY:\n" .
               "- **Week 1**: Master new movement patterns at moderate intensity\n" .
               "- **Week 2**: Increase resistance or complexity by 5-10%\n" .
               "- **Week 3**: Add volume (additional sets or reps)\n" .
               "- **Week 4**: Deload and focus on movement quality\n" .
               "- **Monthly**: Introduce new exercise variations or training methods\n" .
               "- **Quarterly**: Assess progress and adjust training approach\n\n";
    }
    
    /**
     * Get intermediate performance metrics
     *
     * @return string Performance tracking for intermediates
     */
    public static function getPerformanceMetrics(): string {
        return "INTERMEDIATE PERFORMANCE TRACKING:\n" .
               "- **Strength Metrics**: Track weight, reps, and sets progression\n" .
               "- **Endurance Markers**: Monitor heart rate recovery and work capacity\n" .
               "- **Movement Quality**: Assess form and technique improvements\n" .
               "- **Consistency**: Track workout frequency and adherence\n" .
               "- **Subjective Measures**: Rate perceived exertion and energy levels\n" .
               "- **Progress Photos**: Visual documentation of body composition changes\n\n";
    }
    
    /**
     * Get intermediate challenge integration
     *
     * @return string How to integrate challenges appropriately
     */
    public static function getChallengeIntegration(): string {
        return "INTERMEDIATE CHALLENGE INTEGRATION:\n" .
               "- **Skill-Based Challenges**: Master new movement patterns monthly\n" .
               "- **Strength Challenges**: Aim for 5-10% strength increases quarterly\n" .
               "- **Endurance Challenges**: Extend workout duration or intensity\n" .
               "- **Complexity Challenges**: Add coordination or balance elements\n" .
               "- **Competition Preparation**: Work toward fitness testing or events\n" .
               "- **Recovery Challenges**: Implement advanced recovery techniques\n\n";
    }
    
    /**
     * Get complete intermediate prompt fragment
     *
     * @param array $context Additional context data
     * @return string Complete intermediate fragment
     */
    public static function getCompleteFragment(array $context = []): string {
        $fragment = self::getCoreGuidance();
        $fragment .= self::getExerciseSelection();
        $fragment .= self::getIntensityGuidelines();
        $fragment .= self::getTrainingStrategies();
        
        // Add contextual fragments based on available data
        if (!empty($context['include_equipment_guidance'])) {
            $fragment .= self::getEquipmentGuidance();
        }
        
        if (!empty($context['include_structure_guidance'])) {
            $fragment .= self::getWorkoutStructure();
        }
        
        if (!empty($context['include_progression'])) {
            $fragment .= self::getProgressionMethodology();
        }
        
        if (!empty($context['include_performance_tracking'])) {
            $fragment .= self::getPerformanceMetrics();
        }
        
        if (!empty($context['include_challenges'])) {
            $fragment .= self::getChallengeIntegration();
        }
        
        return $fragment;
    }
    
    /**
     * Get available fragment types
     *
     * @return array List of available fragment methods
     */
    public static function getAvailableFragments(): array {
        return [
            'core_guidance' => 'Core intermediate guidance and principles',
            'exercise_selection' => 'Exercise selection and complexity criteria',
            'intensity_guidelines' => 'Intensity and effort guidelines',
            'training_strategies' => 'Advanced training methodologies',
            'equipment_guidance' => 'Equipment utilization and progression',
            'workout_structure' => 'Comprehensive workout organization',
            'progression_methodology' => 'Systematic progression planning',
            'performance_metrics' => 'Performance tracking and assessment',
            'challenge_integration' => 'Appropriate challenge implementation'
        ];
    }
} 