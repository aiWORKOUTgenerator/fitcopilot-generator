<?php
/**
 * CardioFragments - Cardiovascular Training Goal Fragments
 * 
 * Specialized prompt fragments for users focused on cardiovascular fitness.
 * Emphasizes aerobic capacity, heart health, and endurance development.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\Goals;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * CardioFragments Class
 * 
 * Provides cardio-focused prompt fragments for workout generation
 */
class CardioFragments {
    
    /**
     * Get core cardiovascular training principles
     *
     * @return string Cardio training guidance
     */
    public static function getCoreCardioPrinciples(): string {
        return "CARDIOVASCULAR TRAINING PRINCIPLES:\n" .
               "- **Progressive Endurance**: Gradually increase duration, intensity, or frequency\n" .
               "- **Heart Rate Zones**: Train in different zones for specific adaptations\n" .
               "- **Variety Integration**: Combine steady-state and interval training\n" .
               "- **Recovery Monitoring**: Balance training stress with adequate recovery\n" .
               "- **Consistency Priority**: Regular, consistent training over sporadic intense sessions\n" .
               "- **Enjoyment Factor**: Choose activities that maintain long-term motivation\n\n";
    }
    
    /**
     * Get cardio-specific exercise selection
     *
     * @return string Exercise selection for cardio goals
     */
    public static function getCardioExerciseSelection(): string {
        return "CARDIOVASCULAR EXERCISE SELECTION:\n" .
               "- **Low Impact Options**: Walking, cycling, swimming, elliptical\n" .
               "- **High Impact Activities**: Running, jumping, plyometric circuits\n" .
               "- **Full Body Movements**: Burpees, mountain climbers, jumping jacks\n" .
               "- **Interval Training**: High-intensity intervals with active recovery\n" .
               "- **Circuit Training**: Continuous movement between exercise stations\n" .
               "- **Dance/Movement**: Fun, rhythmic activities for cardiovascular benefit\n\n";
    }
    
    /**
     * Get cardio intensity zone guidelines
     *
     * @return string Heart rate zone training protocols
     */
    public static function getCardioIntensityZones(): string {
        return "CARDIOVASCULAR INTENSITY ZONES:\n" .
               "- **Zone 1 (50-60% max HR)**: Active recovery, very light effort\n" .
               "- **Zone 2 (60-70% max HR)**: Aerobic base building, conversational pace\n" .
               "- **Zone 3 (70-80% max HR)**: Aerobic threshold, moderate challenge\n" .
               "- **Zone 4 (80-90% max HR)**: Lactate threshold, hard but sustainable\n" .
               "- **Zone 5 (90-100% max HR)**: VO2 max, maximum effort intervals\n" .
               "- **Training Distribution**: 80% low intensity, 20% high intensity\n\n";
    }
    
    /**
     * Get cardio workout structure options
     *
     * @return string Different cardio workout formats
     */
    public static function getCardioWorkoutStructures(): string {
        return "CARDIOVASCULAR WORKOUT STRUCTURES:\n" .
               "- **Steady State (20-60 minutes)**: Continuous moderate intensity\n" .
               "- **Interval Training (20-45 minutes)**: Work/rest intervals\n" .
               "- **Circuit Training (15-30 minutes)**: Stations with minimal rest\n" .
               "- **Fartlek Training (20-40 minutes)**: Speed play with varied intensity\n" .
               "- **Pyramid Intervals (25-35 minutes)**: Ascending/descending work periods\n" .
               "- **Tabata Protocol (4-20 minutes)**: 20 seconds work, 10 seconds rest\n\n";
    }
    
    /**
     * Get cardio progression strategies
     *
     * @return string How to progress cardiovascular fitness
     */
    public static function getCardioProgressionStrategies(): string {
        return "CARDIOVASCULAR PROGRESSION STRATEGIES:\n" .
               "- **Duration Progression**: Add 5-10% to workout length weekly\n" .
               "- **Intensity Progression**: Increase effort level gradually\n" .
               "- **Frequency Progression**: Add additional training days\n" .
               "- **Volume Progression**: Increase total weekly exercise time\n" .
               "- **Interval Progression**: Extend work periods or reduce rest\n" .
               "- **Cross-Training**: Vary activities to prevent overuse and boredom\n\n";
    }
    
    /**
     * Get cardio equipment recommendations
     *
     * @return string Equipment for cardiovascular training
     */
    public static function getCardioEquipmentRecommendations(): string {
        return "CARDIOVASCULAR EQUIPMENT RECOMMENDATIONS:\n" .
               "- **No Equipment**: Running, walking, bodyweight circuits\n" .
               "- **Minimal Equipment**: Jump rope, resistance bands, step platform\n" .
               "- **Home Cardio**: Treadmill, stationary bike, elliptical machine\n" .
               "- **Outdoor Equipment**: Bicycle, running shoes, sports equipment\n" .
               "- **Functional Tools**: Battle ropes, medicine balls, agility ladder\n" .
               "- **Wearable Tech**: Heart rate monitor, fitness tracker, GPS watch\n\n";
    }
    
    /**
     * Get cardio safety considerations
     *
     * @return string Safety protocols for cardio training
     */
    public static function getCardioSafetyProtocols(): string {
        return "CARDIOVASCULAR SAFETY PROTOCOLS:\n" .
               "- **Gradual Progression**: Increase intensity slowly to avoid injury\n" .
               "- **Hydration Priority**: Drink water before, during, and after exercise\n" .
               "- **Warning Signs**: Stop if experiencing chest pain, dizziness, or nausea\n" .
               "- **Weather Awareness**: Adjust for heat, cold, and air quality\n" .
               "- **Surface Considerations**: Choose appropriate terrain for activity\n" .
               "- **Medical Clearance**: Consult physician if over 40 or have health conditions\n\n";
    }
    
    /**
     * Get cardio motivation strategies
     *
     * @return string Psychological aspects of cardio training
     */
    public static function getCardioMotivationStrategies(): string {
        return "CARDIOVASCULAR MOTIVATION STRATEGIES:\n" .
               "- **Goal Setting**: Set distance, time, or frequency targets\n" .
               "- **Music/Entertainment**: Use upbeat music or podcasts for engagement\n" .
               "- **Social Connection**: Exercise with friends or join group classes\n" .
               "- **Progress Tracking**: Monitor improvements in endurance and speed\n" .
               "- **Variety Planning**: Rotate between different cardio activities\n" .
               "- **Reward Systems**: Celebrate milestones and achievements\n\n";
    }
    
    /**
     * Get cardio recovery protocols
     *
     * @return string Recovery strategies for cardio training
     */
    public static function getCardioRecoveryProtocols(): string {
        return "CARDIOVASCULAR RECOVERY PROTOCOLS:\n" .
               "- **Cool-down Walks**: 5-10 minutes easy walking after intense sessions\n" .
               "- **Stretching Focus**: Target legs, hips, and back after cardio\n" .
               "- **Active Recovery Days**: Light movement on rest days\n" .
               "- **Sleep Priority**: 7-9 hours for cardiovascular adaptation\n" .
               "- **Nutrition Timing**: Carbohydrate replenishment within 30-60 minutes\n" .
               "- **Heart Rate Recovery**: Monitor how quickly heart rate returns to baseline\n\n";
    }
    
    /**
     * Get complete cardio training fragment
     *
     * @param array $context Additional context data
     * @return string Complete cardio fragment
     */
    public static function getCompleteCardioFragment(array $context = []): string {
        $fragment = self::getCoreCardioPrinciples();
        $fragment .= self::getCardioExerciseSelection();
        $fragment .= self::getCardioIntensityZones();
        $fragment .= self::getCardioWorkoutStructures();
        
        // Add contextual fragments based on available data
        if (!empty($context['include_progression'])) {
            $fragment .= self::getCardioProgressionStrategies();
        }
        
        if (!empty($context['include_equipment'])) {
            $fragment .= self::getCardioEquipmentRecommendations();
        }
        
        if (!empty($context['include_safety'])) {
            $fragment .= self::getCardioSafetyProtocols();
        }
        
        if (!empty($context['include_motivation'])) {
            $fragment .= self::getCardioMotivationStrategies();
        }
        
        if (!empty($context['include_recovery'])) {
            $fragment .= self::getCardioRecoveryProtocols();
        }
        
        return $fragment;
    }
    
    /**
     * Get cardio adaptations by fitness level
     *
     * @param string $fitness_level User's fitness level
     * @return string Level-appropriate cardio guidance
     */
    public static function getCardioAdaptationsByLevel(string $fitness_level): string {
        switch (strtolower($fitness_level)) {
            case 'beginner':
                return "BEGINNER CARDIO ADAPTATIONS:\n" .
                       "- Start with 15-20 minutes at comfortable pace\n" .
                       "- Focus on consistency over intensity\n" .
                       "- Use talk test: should be able to hold conversation\n" .
                       "- Include 1-2 minute walking breaks as needed\n" .
                       "- Progress by adding 2-3 minutes per week\n\n";
                       
            case 'intermediate':
                return "INTERMEDIATE CARDIO ADAPTATIONS:\n" .
                       "- Work for 25-45 minutes with varied intensity\n" .
                       "- Include 1-2 interval sessions per week\n" .
                       "- Target heart rate zones 2-4 for most training\n" .
                       "- Incorporate different cardio modalities\n" .
                       "- Challenge cardiovascular system 3-5 times per week\n\n";
                       
            case 'advanced':
                return "ADVANCED CARDIO ADAPTATIONS:\n" .
                       "- Train 45-90 minutes with sophisticated protocols\n" .
                       "- Use polarized training: easy and very hard days\n" .
                       "- Include VO2 max intervals and threshold training\n" .
                       "- Monitor heart rate variability for recovery\n" .
                       "- Peak for specific endurance events or competitions\n\n";
                       
            default:
                return self::getCardioAdaptationsByLevel('intermediate');
        }
    }
    
    /**
     * Get cardio-specific adaptations by duration
     *
     * @param int $duration_minutes Available workout time
     * @return string Duration-appropriate cardio guidance
     */
    public static function getCardioAdaptationsByDuration(int $duration_minutes): string {
        if ($duration_minutes <= 15) {
            return "SHORT CARDIO PROTOCOL (≤15 minutes):\n" .
                   "- High-intensity interval training (HIIT)\n" .
                   "- Tabata or similar protocols\n" .
                   "- Bodyweight cardio circuits\n" .
                   "- Focus on maximum effort in short bursts\n\n";
        } elseif ($duration_minutes <= 30) {
            return "MODERATE CARDIO PROTOCOL (16-30 minutes):\n" .
                   "- Interval training with longer work periods\n" .
                   "- Circuit training with cardio stations\n" .
                   "- Moderate-intensity steady state\n" .
                   "- Combination of work and recovery periods\n\n";
        } else {
            return "EXTENDED CARDIO PROTOCOL (>30 minutes):\n" .
                   "- Steady-state aerobic training\n" .
                   "- Long interval sessions\n" .
                   "- Endurance base building\n" .
                   "- Multiple training zones within session\n\n";
        }
    }
    
    /**
     * Get available fragment types
     *
     * @return array List of available fragment methods
     */
    public static function getAvailableFragments(): array {
        return [
            'core_principles' => 'Fundamental cardiovascular training principles',
            'exercise_selection' => 'Exercise selection for cardio development',
            'intensity_zones' => 'Heart rate zone training protocols',
            'workout_structures' => 'Different cardio workout formats',
            'progression_strategies' => 'Methods for cardiovascular progression',
            'equipment_recommendations' => 'Equipment for cardiovascular training',
            'safety_protocols' => 'Safety considerations for cardio training',
            'motivation_strategies' => 'Psychological aspects of cardio training',
            'recovery_protocols' => 'Recovery strategies for cardio training',
            'level_adaptations' => 'Fitness level-specific cardio adaptations',
            'duration_adaptations' => 'Duration-specific cardio protocols'
        ];
    }
} 