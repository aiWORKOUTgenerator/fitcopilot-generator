<?php
/**
 * StrengthFragments - Strength Training Goal Fragments
 * 
 * Specialized prompt fragments for users focused on strength development.
 * Emphasizes progressive overload, compound movements, and strength-specific training.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\Goals;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * StrengthFragments Class
 * 
 * Provides strength-focused prompt fragments for workout generation
 */
class StrengthFragments {
    
    /**
     * Get core strength training principles
     *
     * @return string Strength training guidance
     */
    public static function getCoreStrengthPrinciples(): string {
        return "STRENGTH TRAINING PRINCIPLES:\n" .
               "- **Progressive Overload**: Systematically increase weight, reps, or sets over time\n" .
               "- **Compound Movement Focus**: Prioritize multi-joint exercises that work multiple muscle groups\n" .
               "- **Heavy Load Emphasis**: Work in 1-6 rep ranges with 80-95% of maximum effort\n" .
               "- **Recovery Priority**: Allow 48-72 hours between training same muscle groups\n" .
               "- **Form Perfection**: Maintain strict technique even under heavy loads\n" .
               "- **Strength Curve Consideration**: Address strength throughout full range of motion\n\n";
    }
    
    /**
     * Get strength-specific exercise selection
     *
     * @return string Exercise selection for strength goals
     */
    public static function getStrengthExerciseSelection(): string {
        return "STRENGTH EXERCISE SELECTION:\n" .
               "- **Primary Lifts**: Squat, deadlift, bench press, overhead press variations\n" .
               "- **Compound Movements**: Multi-joint exercises as workout foundation\n" .
               "- **Bilateral Focus**: Two-limb movements for maximum load capacity\n" .
               "- **Free Weight Priority**: Barbells and dumbbells over machines when possible\n" .
               "- **Movement Pattern Variety**: Push, pull, squat, hinge, carry patterns\n" .
               "- **Accessory Support**: Targeted exercises to support main lifts\n\n";
    }
    
    /**
     * Get strength training intensity guidelines
     *
     * @return string Intensity protocols for strength
     */
    public static function getStrengthIntensityProtocols(): string {
        return "STRENGTH INTENSITY PROTOCOLS:\n" .
               "- **Heavy Singles**: 90-100% 1RM for neural adaptation\n" .
               "- **Strength Range**: 1-5 reps at 85-95% 1RM\n" .
               "- **Power Development**: 3-6 reps at 70-85% 1RM with explosive intent\n" .
               "- **Volume Accumulation**: 6-8 reps at 75-85% 1RM\n" .
               "- **Rest Periods**: 3-5 minutes between sets for full recovery\n" .
               "- **Tempo Control**: 2-3 second eccentric, controlled concentric\n\n";
    }
    
    /**
     * Get strength-focused workout structure
     *
     * @return string Workout organization for strength goals
     */
    public static function getStrengthWorkoutStructure(): string {
        return "STRENGTH WORKOUT STRUCTURE:\n" .
               "- **Neural Activation (10-15 minutes)**: Dynamic warm-up + movement prep\n" .
               "- **Strength Focus (25-35 minutes)**: Primary compound lifts\n" .
               "- **Accessory Work (15-20 minutes)**: Supporting muscle groups\n" .
               "- **Cool-down (5-10 minutes)**: Mobility and recovery work\n" .
               "- **Session Length**: 45-70 minutes total\n" .
               "- **Exercise Order**: Heaviest/most complex movements first\n\n";
    }
    
    /**
     * Get strength progression strategies
     *
     * @return string How to progress strength training
     */
    public static function getStrengthProgressionStrategies(): string {
        return "STRENGTH PROGRESSION STRATEGIES:\n" .
               "- **Linear Progression**: Add 2.5-5 lbs per week for beginners\n" .
               "- **Double Progression**: Increase reps first, then weight\n" .
               "- **Periodization**: Vary intensity and volume in planned cycles\n" .
               "- **Autoregulation**: Adjust based on daily strength levels\n" .
               "- **Volume Landmarks**: Increase total training volume gradually\n" .
               "- **Deload Weeks**: Planned recovery every 4-6 weeks\n\n";
    }
    
    /**
     * Get strength-specific recovery protocols
     *
     * @return string Recovery strategies for strength training
     */
    public static function getStrengthRecoveryProtocols(): string {
        return "STRENGTH RECOVERY PROTOCOLS:\n" .
               "- **Rest Day Planning**: 1-2 complete rest days per week minimum\n" .
               "- **Sleep Priority**: 7-9 hours for muscle protein synthesis\n" .
               "- **Nutrition Timing**: Protein within 2 hours post-workout\n" .
               "- **Active Recovery**: Light movement on off days\n" .
               "- **Stress Management**: High training stress requires life stress management\n" .
               "- **Load Management**: Monitor weekly training volume\n\n";
    }
    
    /**
     * Get strength training safety considerations
     *
     * @return string Safety protocols for heavy lifting
     */
    public static function getStrengthSafetyProtocols(): string {
        return "STRENGTH TRAINING SAFETY:\n" .
               "- **Spotter Availability**: Use spotter or safety bars for heavy lifts\n" .
               "- **Warm-up Protocol**: Gradual load increase to working weight\n" .
               "- **Form Breakdown**: Stop set if technique degrades\n" .
               "- **Pain vs. Discomfort**: Distinguish between effort and injury\n" .
               "- **Equipment Check**: Inspect bars, plates, and safety equipment\n" .
               "- **Emergency Procedures**: Know how to safely fail a lift\n\n";
    }
    
    /**
     * Get strength training motivation strategies
     *
     * @return string Psychological aspects of strength training
     */
    public static function getStrengthMotivationStrategies(): string {
        return "STRENGTH TRAINING MOTIVATION:\n" .
               "- **Goal Setting**: Set specific, measurable strength targets\n" .
               "- **Progress Tracking**: Log weights, reps, and personal records\n" .
               "- **Mental Preparation**: Visualization and focus techniques\n" .
               "- **Competition Mindset**: Train with purpose and intensity\n" .
               "- **Community Support**: Train with partners or join strength community\n" .
               "- **Patience Emphasis**: Strength gains take time and consistency\n\n";
    }
    
    /**
     * Get strength-specific equipment recommendations
     *
     * @return string Equipment for strength training
     */
    public static function getStrengthEquipmentRecommendations(): string {
        return "STRENGTH EQUIPMENT RECOMMENDATIONS:\n" .
               "- **Essential**: Olympic barbell, weight plates, squat rack\n" .
               "- **Safety**: Safety bars, spotting arms, lifting platform\n" .
               "- **Accessories**: Adjustable dumbbells, resistance bands\n" .
               "- **Support Gear**: Lifting belt, wrist wraps, chalk\n" .
               "- **Home Alternatives**: Adjustable dumbbells, resistance bands, bodyweight\n" .
               "- **Quality Focus**: Invest in durable, safe equipment\n\n";
    }
    
    /**
     * Get complete strength training fragment
     *
     * @param array $context Additional context data
     * @return string Complete strength fragment
     */
    public static function getCompleteStrengthFragment(array $context = []): string {
        $fragment = self::getCoreStrengthPrinciples();
        $fragment .= self::getStrengthExerciseSelection();
        $fragment .= self::getStrengthIntensityProtocols();
        $fragment .= self::getStrengthWorkoutStructure();
        
        // Add contextual fragments based on available data
        if (!empty($context['include_progression'])) {
            $fragment .= self::getStrengthProgressionStrategies();
        }
        
        if (!empty($context['include_recovery'])) {
            $fragment .= self::getStrengthRecoveryProtocols();
        }
        
        if (!empty($context['include_safety'])) {
            $fragment .= self::getStrengthSafetyProtocols();
        }
        
        if (!empty($context['include_motivation'])) {
            $fragment .= self::getStrengthMotivationStrategies();
        }
        
        if (!empty($context['include_equipment'])) {
            $fragment .= self::getStrengthEquipmentRecommendations();
        }
        
        return $fragment;
    }
    
    /**
     * Get strength-specific adaptations by fitness level
     *
     * @param string $fitness_level User's fitness level
     * @return string Level-appropriate strength guidance
     */
    public static function getStrengthAdaptationsByLevel(string $fitness_level): string {
        switch (strtolower($fitness_level)) {
            case 'beginner':
                return "BEGINNER STRENGTH ADAPTATIONS:\n" .
                       "- Focus on bodyweight and light resistance (5-15 lbs)\n" .
                       "- Master movement patterns before adding load\n" .
                       "- Use rep ranges of 8-12 to practice form\n" .
                       "- Progress through increased repetitions first\n" .
                       "- Emphasize bilateral, stable movements\n\n";
                       
            case 'intermediate':
                return "INTERMEDIATE STRENGTH ADAPTATIONS:\n" .
                       "- Work in 5-8 rep ranges with moderate-heavy loads\n" .
                       "- Include barbell and dumbbell compound movements\n" .
                       "- Begin periodization with planned progression\n" .
                       "- Add unilateral training for balance\n" .
                       "- Track and aim for consistent strength gains\n\n";
                       
            case 'advanced':
                return "ADVANCED STRENGTH ADAPTATIONS:\n" .
                       "- Utilize 1-5 rep ranges with maximum loads\n" .
                       "- Implement advanced periodization models\n" .
                       "- Include competition-style movements\n" .
                       "- Use advanced techniques (pause reps, chains, bands)\n" .
                       "- Focus on strength in multiple movement patterns\n\n";
                       
            default:
                return self::getStrengthAdaptationsByLevel('intermediate');
        }
    }
    
    /**
     * Get available fragment types
     *
     * @return array List of available fragment methods
     */
    public static function getAvailableFragments(): array {
        return [
            'core_principles' => 'Fundamental strength training principles',
            'exercise_selection' => 'Exercise selection for strength development',
            'intensity_protocols' => 'Intensity and rep range guidelines',
            'workout_structure' => 'Strength-focused workout organization',
            'progression_strategies' => 'Methods for progressive strength development',
            'recovery_protocols' => 'Recovery strategies for strength training',
            'safety_protocols' => 'Safety considerations for heavy lifting',
            'motivation_strategies' => 'Psychological aspects of strength training',
            'equipment_recommendations' => 'Equipment for effective strength training',
            'level_adaptations' => 'Fitness level-specific strength adaptations'
        ];
    }
} 