import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../../common/api/client';
import { getCachedWorkout, WorkoutData } from '../../utils/workoutCache';

interface WorkoutCardProps {
  postId: number;
  workout?: WorkoutData;
}

interface WorkoutResponse {
  success: boolean;
  data: WorkoutData;
  workout_data?: WorkoutData;
  message?: string;
}

/**
 * Component for displaying a workout
 */
export const WorkoutCard: React.FC<WorkoutCardProps> = ({ postId, workout: initialWorkout }) => {
  const [loading, setLoading] = useState(!initialWorkout);
  const [workout, setWorkout] = useState<WorkoutData | null>(initialWorkout || null);
  const [error, setError] = useState<string | null>(null);
  
  // Get the site base URL for creating workout links
  const baseUrl = window.workoutGenerator?.baseUrl || '';

  // Fetch workout data if not provided
  useEffect(() => {
    if (!initialWorkout && postId) {
      const fetchWorkout = async () => {
        try {
          // Check cache first
          const cachedWorkout = getCachedWorkout(postId);
          if (cachedWorkout) {
            setWorkout(cachedWorkout);
            setLoading(false);
            return;
          }
          
          // If not cached, fetch from API
          setLoading(true);
          const response = await apiFetch<WorkoutResponse>(`/wp-json/fitcopilot/v1/workouts/${postId}`);
          
          // Check if we have raw workout data
          const workoutData = response.workout_data || response.data;
          setWorkout(workoutData);
          setLoading(false);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load workout';
          setError(errorMessage);
          setLoading(false);
        }
      };
      
      fetchWorkout();
    }
  }, [postId, initialWorkout]);

  /**
   * Handle viewing the full workout
   * Uses a proper URL structure that won't trigger regeneration
   */
  const handleViewFullWorkout = () => {
    // Build the URL for the standalone workout page
    const workoutUrl = `${baseUrl}/workout/${postId}/?view=full`;
    
    // Open in a new tab
    window.open(workoutUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-red-500">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Workout</h3>
        <p className="text-gray-700">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-yellow-500">
        <h3 className="text-lg font-semibold text-yellow-600 mb-2">Workout Not Found</h3>
        <p className="text-gray-700">The requested workout could not be found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{workout.title}</h2>
      </div>
      
      <div className="p-6">
        {workout.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8 last:mb-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{section.name}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {section.duration} min
              </span>
            </div>
            
            <ul className="space-y-4">
              {section.exercises.map((exercise, exerciseIndex) => (
                <li key={exerciseIndex} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{exercise.name}</h4>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                      {exercise.duration || 
                       (exercise.sets && exercise.reps && `${exercise.sets} × ${exercise.reps}`)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{exercise.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t">
        <button
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleViewFullWorkout}
        >
          View Full Workout
        </button>
      </div>
    </div>
  );
}; 