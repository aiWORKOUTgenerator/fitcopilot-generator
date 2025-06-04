/**
 * Simplified Workout Save Service
 * 
 * Direct API service using proven test tool patterns.
 * No abstraction layers, no data transformations, just direct fetch calls.
 */

/**
 * Get WordPress nonce exactly like test tool
 */
const getWordPressNonce = (): string => {
  if (typeof window !== 'undefined') {
    // Try fitcopilotData first (like test tool)
    if (window.fitcopilotData?.nonce) {
      return window.fitcopilotData.nonce;
    }
    
    // Fallback to wpApiSettings (like test tool)
    if (window.wpApiSettings?.nonce) {
      return window.wpApiSettings.nonce;
    }
  }
  
  console.warn('[workoutSaveService] No WordPress nonce found');
  return '';
};

/**
 * Get API base URL exactly like test tool
 */
const getApiBaseUrl = (): string => {
  return '/wp-json/fitcopilot/v1';
};

/**
 * Save workout using exact test tool patterns
 * 
 * @param workoutData - The workout data to save (direct format)
 * @param postId - Optional post ID for updates (if provided, will PUT, else POST)
 * @returns Promise with the saved workout data
 */
export const saveWorkout = async (workoutData: any, postId?: number): Promise<any> => {
  const nonce = getWordPressNonce();
  const baseUrl = getApiBaseUrl();
  
  // Determine method and URL exactly like test tool
  const method = postId ? 'PUT' : 'POST';
  const url = postId ? `${baseUrl}/workouts/${postId}` : `${baseUrl}/workouts`;
  
  console.log(`[workoutSaveService] Making ${method} request to ${url}`, {
    format: 'DIRECT (like test tool)',
    postId: postId || 'new workout',
    hasNonce: !!nonce
  });
  
  try {
    // Make exact same request as test tool
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      body: JSON.stringify(workoutData), // Direct format, no wrapper
      credentials: 'same-origin'
    });
    
    const result = await response.json();
    
    console.log(`[workoutSaveService] ${method} response:`, {
      success: result.success,
      id: result.data?.id || result.data?.post_id,
      version: result.data?.version,
      message: result.message
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Save failed');
    }
    
    return result.data;
  } catch (error) {
    console.error(`[workoutSaveService] ${method} failed:`, error);
    throw error;
  }
};

/**
 * Load workout using exact test tool patterns
 * 
 * @param workoutId - The workout ID to load
 * @returns Promise with the workout data
 */
export const loadWorkout = async (workoutId: string | number): Promise<any> => {
  const nonce = getWordPressNonce();
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/workouts/${workoutId}`;
  
  console.log(`[workoutSaveService] Loading workout from ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-WP-Nonce': nonce
      },
      credentials: 'same-origin'
    });
    
    const result = await response.json();
    
    console.log('[workoutSaveService] Load response:', {
      success: result.success,
      id: result.data?.id,
      title: result.data?.title,
      hasWorkoutData: !!result.data?.workout_data
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Load failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('[workoutSaveService] Load failed:', error);
    throw error;
  }
}; 