<?php
/**
 * AdvancedFragments - Advanced-Specific Prompt Fragments
 * 
 * Specialized prompt fragments for users with advanced fitness level.
 * Focus on elite performance, complex movements, and specialized training.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\FitnessLevel;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * AdvancedFragments Class
 * 
 * Provides advanced-specific prompt fragments for workout generation
 */
class AdvancedFragments {
    
    /**
     * Get core advanced guidance fragment
     *
     * @return string Advanced-specific guidance
     */
    public static function getCoreGuidance(): string {
        return "ADVANCED FITNESS GUIDANCE:\n" .
               "- **Elite Performance**: Push physiological boundaries with sophisticated training methods\n" .
               "- **Movement Mastery**: Execute complex, multi-planar movement patterns with precision\n" .
               "- **Specialized Training**: Incorporate sport-specific and advanced training modalities\n" .
               "- **Periodization Mastery**: Use advanced periodization models for peak performance\n" .
               "- **Recovery Optimization**: Implement cutting-edge recovery and adaptation strategies\n" .
               "- **Performance Analytics**: Utilize data-driven training decisions and biometric feedback\n\n";
    }
    
    /**
     * Get advanced exercise selection criteria
     *
     * @return string Exercise selection guidelines
     */
    public static function getExerciseSelection(): string {
        return "ADVANCED EXERCISE SELECTION:\n" .
               "- Prioritize complex, compound movements with multiple muscle groups\n" .
               "- Include plyometric and ballistic training for power development\n" .
               "- Integrate unilateral and asymmetrical loading patterns\n" .
               "- Use advanced movement patterns (Turkish get-ups, Olympic lifts)\n" .
               "- Incorporate sport-specific movement preparation\n" .
               "- Challenge multiple fitness components simultaneously\n\n";
    }
    
    /**
     * Get advanced intensity guidelines
     *
     * @return string Intensity modification guidelines
     */
    public static function getIntensityGuidelines(): string {
        return "ADVANCED INTENSITY MODIFICATIONS:\n" .
               "- Work at 80-95% of maximum effort for strength phases\n" .
               "- Use varied rep ranges: 1-3 (strength), 4-6 (power), 8-12 (hypertrophy)\n" .
               "- Implement advanced rest protocols (rest-pause, cluster sets)\n" .
               "- Include tempo manipulations and isometric holds\n" .
               "- Utilize density training and time-based challenges\n" .
               "- Monitor and target specific heart rate zones\n\n";
    }
    
    /**
     * Get advanced training methodologies
     *
     * @return string Advanced training methods
     */
    public static function getTrainingMethodologies(): string {
        return "ADVANCED TRAINING METHODOLOGIES:\n" .
               "- **Conjugate Method**: Combine max effort, dynamic effort, and repetition methods\n" .
               "- **Block Periodization**: Focus on specific adaptations in training blocks\n" .
               "- **Concurrent Training**: Develop multiple fitness qualities simultaneously\n" .
               "- **Contrast Training**: Pair heavy resistance with explosive movements\n" .
               "- **Cluster Training**: Use intra-set rest for maintaining power output\n" .
               "- **Accommodating Resistance**: Incorporate bands, chains, and variable resistance\n\n";
    }
    
    /**
     * Get advanced equipment integration
     *
     * @return string Equipment usage for advanced training
     */
    public static function getEquipmentIntegration(): string {
        return "ADVANCED EQUIPMENT INTEGRATION:\n" .
               "- **Olympic Equipment**: Barbells, bumper plates, lifting platforms\n" .
               "- **Plyometric Tools**: Boxes, hurdles, medicine balls, battle ropes\n" .
               "- **Instability Training**: BOSU, stability balls, suspension systems\n" .
               "- **Technology Integration**: Heart rate monitors, power meters, force plates\n" .
               "- **Specialty Implements**: Kettlebells, sandbags, sleds, farmers' implements\n" .
               "- **Recovery Equipment**: Foam rollers, percussion devices, compression gear\n\n";
    }
    
    /**
     * Get advanced workout architecture
     *
     * @return string Complex workout structure for advanced users
     */
    public static function getWorkoutArchitecture(): string {
        return "ADVANCED WORKOUT ARCHITECTURE:\n" .
               "- **Neural Activation (10-12 minutes)**: Dynamic warm-up with CNS priming\n" .
               "- **Skill Development (8-10 minutes)**: Movement quality and technique refinement\n" .
               "- **Primary Strength (20-25 minutes)**: Heavy compound movements\n" .
               "- **Power Development (10-15 minutes)**: Explosive and ballistic training\n" .
               "- **Accessory Work (15-20 minutes)**: Targeted muscle group development\n" .
               "- **Metabolic Conditioning (8-12 minutes)**: High-intensity energy system work\n" .
               "- **Recovery Protocol (10-15 minutes)**: Active recovery and mobility\n" .
               "- **Total Duration**: 75-120 minutes\n\n";
    }
    
    /**
     * Get advanced progression strategies
     *
     * @return string Sophisticated progression methods
     */
    public static function getProgressionStrategies(): string {
        return "ADVANCED PROGRESSION STRATEGIES:\n" .
               "- **Autoregulatory Training**: Adjust training based on daily readiness\n" .
               "- **Velocity-Based Training**: Use movement speed to guide load selection\n" .
               "- **Undulating Periodization**: Vary intensity and volume within micro-cycles\n" .
               "- **Concurrent Periodization**: Develop multiple qualities simultaneously\n" .
               "- **Overreaching Phases**: Planned short-term overload followed by recovery\n" .
               "- **Specificity Progression**: Move from general to sport-specific adaptations\n\n";
    }
    
    /**
     * Get advanced performance monitoring
     *
     * @return string Performance tracking for advanced users
     */
    public static function getPerformanceMonitoring(): string {
        return "ADVANCED PERFORMANCE MONITORING:\n" .
               "- **Power Output**: Track watts, velocity, and force production\n" .
               "- **Heart Rate Variability**: Monitor autonomic nervous system recovery\n" .
               "- **Subjective Wellness**: Daily readiness, sleep quality, stress levels\n" .
               "- **Movement Quality**: Video analysis and biomechanical assessment\n" .
               "- **Performance Testing**: Regular 1RM, jump height, sprint times\n" .
               "- **Body Composition**: DEXA, InBody, or hydrostatic weighing\n" .
               "- **Blood Markers**: Hormonal panels, inflammation markers, nutrient status\n\n";
    }
    
    /**
     * Get advanced recovery protocols
     *
     * @return string Recovery strategies for advanced training
     */
    public static function getRecoveryProtocols(): string {
        return "ADVANCED RECOVERY PROTOCOLS:\n" .
               "- **Active Recovery**: Low-intensity movement and mobility work\n" .
               "- **Contrast Therapy**: Alternating hot/cold exposure\n" .
               "- **Compression Therapy**: Pneumatic compression and recovery boots\n" .
               "- **Soft Tissue Work**: Professional massage, self-myofascial release\n" .
               "- **Sleep Optimization**: Sleep hygiene, sleep tracking, environmental control\n" .
               "- **Nutritional Timing**: Strategic nutrient timing for recovery\n" .
               "- **Stress Management**: Meditation, breathing exercises, stress reduction\n\n";
    }
    
    /**
     * Get advanced specialization options
     *
     * @return string Sport-specific and specialized training
     */
    public static function getSpecializationOptions(): string {
        return "ADVANCED SPECIALIZATION OPTIONS:\n" .
               "- **Powerlifting Focus**: Squat, bench, deadlift specialization\n" .
               "- **Olympic Lifting**: Clean, jerk, snatch technique and strength\n" .
               "- **Sport-Specific**: Tailored training for specific athletic demands\n" .
               "- **Bodybuilding**: Hypertrophy and physique development focus\n" .
               "- **Endurance Performance**: VO2 max, lactate threshold, aerobic power\n" .
               "- **Combat Sports**: Power, agility, and anaerobic capacity\n" .
               "- **Functional Movement**: Real-world movement pattern optimization\n\n";
    }
    
    /**
     * Get complete advanced prompt fragment
     *
     * @param array $context Additional context data
     * @return string Complete advanced fragment
     */
    public static function getCompleteFragment(array $context = []): string {
        $fragment = self::getCoreGuidance();
        $fragment .= self::getExerciseSelection();
        $fragment .= self::getIntensityGuidelines();
        $fragment .= self::getTrainingMethodologies();
        
        // Add contextual fragments based on available data
        if (!empty($context['include_equipment_integration'])) {
            $fragment .= self::getEquipmentIntegration();
        }
        
        if (!empty($context['include_workout_architecture'])) {
            $fragment .= self::getWorkoutArchitecture();
        }
        
        if (!empty($context['include_progression_strategies'])) {
            $fragment .= self::getProgressionStrategies();
        }
        
        if (!empty($context['include_performance_monitoring'])) {
            $fragment .= self::getPerformanceMonitoring();
        }
        
        if (!empty($context['include_recovery_protocols'])) {
            $fragment .= self::getRecoveryProtocols();
        }
        
        if (!empty($context['include_specialization'])) {
            $fragment .= self::getSpecializationOptions();
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
            'core_guidance' => 'Elite performance and movement mastery principles',
            'exercise_selection' => 'Complex movement pattern selection',
            'intensity_guidelines' => 'High-intensity training protocols',
            'training_methodologies' => 'Advanced training systems and methods',
            'equipment_integration' => 'Sophisticated equipment utilization',
            'workout_architecture' => 'Complex workout structure and organization',
            'progression_strategies' => 'Advanced progression and periodization',
            'performance_monitoring' => 'Elite performance tracking and analytics',
            'recovery_protocols' => 'Advanced recovery and adaptation strategies',
            'specialization_options' => 'Sport-specific and specialized training focus'
        ];
    }
} 