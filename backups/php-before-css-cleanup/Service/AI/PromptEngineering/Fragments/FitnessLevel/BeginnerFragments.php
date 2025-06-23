<?php
/**
 * BeginnerFragments - Beginner-Specific Prompt Fragments
 * 
 * Specialized prompt fragments for users with beginner fitness level.
 * Focus on safety, proper form, and gradual progression.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\FitnessLevel;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * BeginnerFragments Class
 * 
 * Provides beginner-specific prompt fragments for workout generation
 */
class BeginnerFragments {
    
    /**
     * Get core beginner guidance fragment
     *
     * @return string Beginner-specific guidance
     */
    public static function getCoreGuidance(): string {
        return "BEGINNER FITNESS GUIDANCE:\n" .
               "- **Safety First**: Prioritize proper form over intensity or speed\n" .
               "- **Start Simple**: Use basic, fundamental movements that are easy to learn\n" .
               "- **Progressive Approach**: Begin with bodyweight or very light resistance\n" .
               "- **Form Focus**: Include detailed form cues and common mistake corrections\n" .
               "- **Recovery Priority**: Allow adequate rest between exercises and sets\n" .
               "- **Confidence Building**: Choose exercises that build confidence and success\n\n";
    }
    
    /**
     * Get beginner exercise selection criteria
     *
     * @return string Exercise selection guidelines
     */
    public static function getExerciseSelection(): string {
        return "BEGINNER EXERCISE SELECTION:\n" .
               "- Use single-joint movements before compound exercises\n" .
               "- Prefer stable, supported positions (seated, lying down)\n" .
               "- Avoid complex movement patterns or high coordination demands\n" .
               "- Include bilateral movements before unilateral challenges\n" .
               "- Focus on controlled, slow tempo movements\n" .
               "- Provide clear start and end positions for each exercise\n\n";
    }
    
    /**
     * Get beginner intensity guidelines
     *
     * @return string Intensity modification guidelines
     */
    public static function getIntensityGuidelines(): string {
        return "BEGINNER INTENSITY MODIFICATIONS:\n" .
               "- Start with bodyweight or resistance level 3-4/10\n" .
               "- Use 12-15 repetitions to practice form\n" .
               "- Rest 60-90 seconds between exercises\n" .
               "- Progress through increased repetitions before adding resistance\n" .
               "- Monitor fatigue levels and encourage stopping if form breaks down\n" .
               "- Heart rate should remain conversational (able to talk while exercising)\n\n";
    }
    
    /**
     * Get beginner safety considerations
     *
     * @return string Safety guidelines specific to beginners
     */
    public static function getSafetyConsiderations(): string {
        return "BEGINNER SAFETY PRIORITIES:\n" .
               "- **Form Over Everything**: Stop exercise if proper form cannot be maintained\n" .
               "- **Listen to Body**: Encourage awareness of discomfort vs. pain\n" .
               "- **Warm-up Essential**: Include 5-7 minutes of gentle movement preparation\n" .
               "- **Cool-down Required**: End with 5-10 minutes of stretching and relaxation\n" .
               "- **Hydration Reminders**: Encourage water breaks throughout workout\n" .
               "- **Emergency Stops**: Clear instructions on when to stop exercising\n\n";
    }
    
    /**
     * Get beginner motivation and encouragement
     *
     * @return string Motivational language for beginners
     */
    public static function getMotivationalFraming(): string {
        return "BEGINNER ENCOURAGEMENT APPROACH:\n" .
               "- **Celebrate Small Wins**: Acknowledge completing each exercise\n" .
               "- **Progress Focused**: Emphasize improvement over perfection\n" .
               "- **Positive Language**: Use encouraging, non-intimidating terminology\n" .
               "- **Realistic Expectations**: Set achievable goals for each session\n" .
               "- **Personal Journey**: Remind that everyone starts somewhere\n" .
               "- **Consistency Over Intensity**: Praise showing up and trying\n\n";
    }
    
    /**
     * Get beginner equipment recommendations
     *
     * @return string Equipment guidance for beginners
     */
    public static function getEquipmentGuidance(): string {
        return "BEGINNER EQUIPMENT RECOMMENDATIONS:\n" .
               "- **Start Simple**: Bodyweight exercises require no equipment\n" .
               "- **Household Items**: Use water bottles, books, sturdy chair for resistance\n" .
               "- **Light Weights**: 2-8 lbs dumbbells or resistance bands for progression\n" .
               "- **Support Props**: Wall, chair, or couch for balance and assistance\n" .
               "- **Comfort Items**: Yoga mat or towel for floor exercises\n" .
               "- **Safety First**: Ensure all equipment is stable and appropriate weight\n\n";
    }
    
    /**
     * Get beginner workout structure recommendations
     *
     * @return string Workout structure for beginners
     */
    public static function getWorkoutStructure(): string {
        return "BEGINNER WORKOUT STRUCTURE:\n" .
               "- **Warm-up (5-7 minutes)**: Gentle movement, joint mobility\n" .
               "- **Main Workout (15-25 minutes)**: 6-8 basic exercises\n" .
               "- **Cool-down (5-10 minutes)**: Stretching and relaxation\n" .
               "- **Total Duration**: 25-40 minutes maximum\n" .
               "- **Exercise Order**: Large muscles first, smaller muscles last\n" .
               "- **Transition Time**: Allow 30-60 seconds between exercises for instruction\n\n";
    }
    
    /**
     * Get beginner progression strategy
     *
     * @return string How beginners should progress
     */
    public static function getProgressionStrategy(): string {
        return "BEGINNER PROGRESSION PATHWAY:\n" .
               "- **Week 1-2**: Focus on learning movement patterns\n" .
               "- **Week 3-4**: Add repetitions (12 → 15 → 18)\n" .
               "- **Week 5-6**: Introduce light resistance or variations\n" .
               "- **Week 7-8**: Combine movements or add complexity\n" .
               "- **Always**: Maintain perfect form as the priority\n" .
               "- **Never**: Rush progression or skip foundational movements\n\n";
    }
    
    /**
     * Get complete beginner prompt fragment
     *
     * @param array $context Additional context data
     * @return string Complete beginner fragment
     */
    public static function getCompleteFragment(array $context = []): string {
        $fragment = self::getCoreGuidance();
        $fragment .= self::getExerciseSelection();
        $fragment .= self::getIntensityGuidelines();
        $fragment .= self::getSafetyConsiderations();
        
        // Add contextual fragments based on available data
        if (!empty($context['include_motivation'])) {
            $fragment .= self::getMotivationalFraming();
        }
        
        if (!empty($context['include_equipment_guidance'])) {
            $fragment .= self::getEquipmentGuidance();
        }
        
        if (!empty($context['include_structure_guidance'])) {
            $fragment .= self::getWorkoutStructure();
        }
        
        if (!empty($context['include_progression'])) {
            $fragment .= self::getProgressionStrategy();
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
            'core_guidance' => 'Core beginner guidance and principles',
            'exercise_selection' => 'Exercise selection criteria',
            'intensity_guidelines' => 'Intensity and progression guidelines',
            'safety_considerations' => 'Safety priorities and precautions',
            'motivational_framing' => 'Encouragement and motivation',
            'equipment_guidance' => 'Equipment recommendations',
            'workout_structure' => 'Workout organization and timing',
            'progression_strategy' => 'Long-term progression planning'
        ];
    }
} 