/**
 * WorkoutTransformer Service
 * 
 * Handles transformation of raw API workout data into display-ready format.
 * Extracted from WorkoutGrid.tsx as part of Week 1 Foundation Sprint.
 */

// Import types (using existing DisplayWorkout interface from WorkoutGrid for now)
interface DisplayWorkout {
  id: string | number;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: any[];
  created_at: string;
  updated_at: string;
  workoutType: string;
  equipment: string[];
  isCompleted: boolean;
  completedAt?: string;
  tags: string[];
  createdAt: string; // For backward compatibility
  lastModified: string; // For backward compatibility
  isFavorite?: boolean;
  rating?: number;
}

export class WorkoutTransformer {
  /**
   * Transform raw API workout data for display in grid
   * 
   * @param workout - Raw workout data from API
   * @returns Transformed workout ready for display
   */
  static transformForDisplay(workout: any): DisplayWorkout {
    // Defensive coding: ensure workout is an object
    if (!workout || typeof workout !== 'object') {
      console.warn('Invalid workout data received:', workout);
      return this.createDefaultWorkout();
    }

    try {
      // 🐛 DEBUG: Log raw workout data to understand the structure
      console.group(`🔍 Transforming Workout ID: ${workout.id || workout.post_id || 'unknown'}`);
      console.log('📥 Raw workout data:', workout);
      
      // Extract exercises with proper fallback handling
      let exercises = [];
      let debugInfo = [];
      
      // First try: root level exercises
      if (Array.isArray(workout.exercises) && workout.exercises.length > 0) {
        exercises = workout.exercises;
        debugInfo.push(`✅ Found ${exercises.length} exercises at root level`);
      } 
      // Second try: extract from _workout_data if it exists
      else if (workout.workout_data) {
        try {
          const workoutData = typeof workout.workout_data === 'string' 
            ? JSON.parse(workout.workout_data) 
            : workout.workout_data;
          
          if (Array.isArray(workoutData.exercises) && workoutData.exercises.length > 0) {
            exercises = workoutData.exercises;
            debugInfo.push(`✅ Found ${exercises.length} exercises in workout_data.exercises`);
          } else if (Array.isArray(workoutData.sections)) {
            // Extract from sections
            exercises = [];
            workoutData.sections.forEach((section: any) => {
              if (section.exercises && Array.isArray(section.exercises)) {
                exercises.push(...section.exercises);
              }
            });
            debugInfo.push(`✅ Extracted ${exercises.length} exercises from ${workoutData.sections.length} sections`);
          }
        } catch (e: any) {
          debugInfo.push(`❌ Failed to parse workout_data: ${e instanceof Error ? e.message : 'Parse error'}`);
        }
      }
      // Third try: sections at root level
      else if (workout.sections && Array.isArray(workout.sections)) {
        exercises = [];
        workout.sections.forEach((section: any) => {
          if (section.exercises && Array.isArray(section.exercises)) {
            exercises.push(...section.exercises);
          }
        });
        debugInfo.push(`✅ Extracted ${exercises.length} exercises from ${workout.sections.length} root sections`);
      } else {
        debugInfo.push(`❌ No exercises found in any location`);
      }
      
      // 🐛 DEBUG: Log exercise extraction results
      console.log('🏋️ Exercise extraction:', debugInfo.join(' | '));
      console.log('📊 Final exercises array:', exercises);
      
      // Extract equipment from exercises if not provided
      const equipment = workout.equipment || this.extractEquipmentFromExercises(exercises);
      
      // Determine workout type from exercises or use default
      const workoutType = workout.workoutType || this.deriveWorkoutTypeFromExercises(exercises);
      
      // Handle date/time properly - prioritize WordPress post dates
      const createdAt = workout.post_date || workout.date || workout.created_at || new Date().toISOString();
      const updatedAt = workout.post_modified || workout.modified || workout.updated_at || createdAt;
      
      // 🐛 DEBUG: Log date handling
      console.log('📅 Date handling:', {
        post_date: workout.post_date,
        date: workout.date,
        created_at: workout.created_at,
        final_createdAt: createdAt
      });
      
      const transformedWorkout = {
        id: workout.id || workout.post_id || `temp-${Date.now()}`,
        title: workout.title || workout.post_title || 'Untitled Workout',
        description: workout.description || workout.notes || workout.post_content || '',
        duration: typeof workout.duration === 'number' ? workout.duration : 30,
        difficulty: ['beginner', 'intermediate', 'advanced'].includes(workout.difficulty) ? workout.difficulty : 'intermediate',
        exercises: exercises, // Use properly extracted exercises
        created_at: createdAt,
        updated_at: updatedAt,
        workoutType,
        equipment,
        isCompleted: Boolean(workout.isCompleted),
        tags: Array.isArray(workout.tags) ? workout.tags : [],
        completedAt: workout.completedAt,
        createdAt: createdAt, // For backward compatibility
        lastModified: updatedAt, // For backward compatibility
        isFavorite: Boolean(workout.isFavorite),
        rating: typeof workout.rating === 'number' ? workout.rating : undefined
      };
      
      // 🐛 DEBUG: Log final transformation
      console.log('✨ Transformed workout:', transformedWorkout);
      console.groupEnd();
      
      return transformedWorkout;
    } catch (error) {
      console.error('❌ Error transforming workout data:', error, workout);
      console.groupEnd();
      return this.createDefaultWorkout();
    }
  }

  /**
   * Extract equipment from exercises
   * 
   * @param exercises - Array of exercise objects
   * @returns Array of unique equipment names
   */
  static extractEquipmentFromExercises(exercises: any[]): string[] {
    if (!Array.isArray(exercises)) return [];
    
    try {
      const equipment = new Set<string>();
      exercises.forEach(exercise => {
        if (exercise && exercise.equipment) {
          if (Array.isArray(exercise.equipment)) {
            exercise.equipment.forEach((eq: string) => equipment.add(eq));
          } else if (typeof exercise.equipment === 'string') {
            equipment.add(exercise.equipment);
          }
        }
      });
      return Array.from(equipment).filter(Boolean);
    } catch (error) {
      console.warn('Error extracting equipment:', error);
      return [];
    }
  }

  /**
   * Derive workout type from exercises
   * 
   * @param exercises - Array of exercise objects
   * @returns Workout type classification
   */
  static deriveWorkoutTypeFromExercises(exercises: any[]): string {
    if (!Array.isArray(exercises) || exercises.length === 0) return 'General';
    
    try {
      // Simple heuristic based on exercise names
      const exerciseNames = exercises
        .map(ex => ex && ex.name && typeof ex.name === 'string' ? ex.name.toLowerCase() : '')
        .filter(name => name.length > 0)
        .join(' ');
      
      if (exerciseNames.includes('cardio') || exerciseNames.includes('running') || exerciseNames.includes('cycling')) {
        return 'Cardio';
      }
      if (exerciseNames.includes('strength') || exerciseNames.includes('weights') || exerciseNames.includes('lifting') || 
          exerciseNames.includes('bench press') || exerciseNames.includes('squats') || exerciseNames.includes('press')) {
        return 'Strength';
      }
      if (exerciseNames.includes('yoga') || exerciseNames.includes('stretch')) {
        return 'Flexibility';
      }
    } catch (error) {
      console.warn('Error deriving workout type:', error);
    }
    
    return 'General';
  }

  /**
   * Validate if a workout has the minimum required data
   * 
   * @param workout - Workout object to validate
   * @returns True if workout has minimum required data
   */
  static isValidWorkout(workout: any): boolean {
    if (!workout || typeof workout !== 'object') {
      return false;
    }
    
    const hasId = !!(workout.id || workout.post_id);
    const hasTitle = !!(workout.title || workout.post_title);
    
    return hasId && hasTitle;
  }

  /**
   * Create a default workout object for error cases
   * 
   * @returns Default workout with safe values
   */
  static createDefaultWorkout(): DisplayWorkout {
    // Use a more unique timestamp with random component to avoid collisions
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const uniqueId = `error-${timestamp}-${random}`;
    
    const now = new Date().toISOString();
    
    return {
      id: uniqueId,
      title: 'Error Loading Workout',
      description: 'There was an error loading this workout data.',
      duration: 30,
      difficulty: 'intermediate',
      exercises: [],
      created_at: now,
      updated_at: now,
      workoutType: 'General',
      equipment: [],
      isCompleted: false,
      tags: [],
      createdAt: now,
      lastModified: now,
      isFavorite: false
    };
  }

  /**
   * Batch transform multiple workouts
   * 
   * @param workouts - Array of raw workout data
   * @returns Array of transformed workouts
   */
  static transformMultipleForDisplay(workouts: any[]): DisplayWorkout[] {
    if (!Array.isArray(workouts)) {
      console.warn('transformMultipleForDisplay: Expected array, received:', typeof workouts);
      return [];
    }

    return workouts.map(workout => this.transformForDisplay(workout));
  }
}

export default WorkoutTransformer; 