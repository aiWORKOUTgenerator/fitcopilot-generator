/**
 * Workout Navigation Routes
 * 
 * Defines route configuration for workout generator and editor navigation.
 * This provides a framework for future workout library integration.
 */

/**
 * Route path definitions
 */
export const ROUTES = {
  // Current routes
  GENERATOR: '/workout-generator',
  
  // Future routes (defined now for planning)
  WORKOUTS: '/workouts',
  WORKOUT_DETAIL: '/workouts/:id',
  WORKOUT_EDIT: '/workouts/:id/edit',
};

/**
 * Hash parameters for modal state
 */
export const HASH_PARAMS = {
  WORKOUT_EDITOR: 'workout',
};

/**
 * Utility to check if a hash parameter exists in the URL
 * @param paramName - The hash parameter name to check for
 * @returns True if the parameter exists in the URL hash
 */
export function hasHashParam(paramName: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.has(paramName);
}

/**
 * Get a hash parameter value from the URL
 * @param paramName - The hash parameter name to get
 * @returns The parameter value or null if not found
 */
export function getHashParam(paramName: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get(paramName);
}

/**
 * Set a hash parameter in the URL without page reload
 * @param paramName - The hash parameter name to set
 * @param value - The value to set
 * @param options - Additional options
 */
export function setHashParam(
  paramName: string,
  value: string,
  options: { replace?: boolean; historyState?: any } = {}
): void {
  if (typeof window === 'undefined') return;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  params.set(paramName, value);
  
  const newHash = `#${params.toString()}`;
  const historyMethod = options.replace ? 'replaceState' : 'pushState';
  
  window.history[historyMethod](
    options.historyState || { modal: true, paramName, value },
    '',
    window.location.pathname + newHash
  );
}

/**
 * Remove a hash parameter from the URL without page reload
 * @param paramName - The hash parameter name to remove
 * @param options - Additional options
 */
export function removeHashParam(
  paramName: string,
  options: { replace?: boolean; historyState?: any } = {}
): void {
  if (typeof window === 'undefined') return;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  params.delete(paramName);
  
  const newHash = params.toString() ? `#${params.toString()}` : '';
  const historyMethod = options.replace ? 'replaceState' : 'pushState';
  
  window.history[historyMethod](
    options.historyState || null,
    '',
    window.location.pathname + newHash
  );
}

/**
 * Determine if the editor should be shown as a modal or full page
 * @param context - The current navigation context
 * @returns True if the editor should be shown as a modal
 */
export function shouldUseModal(context: {
  referrer?: string;
  isMobileView?: boolean;
  isCompactView?: boolean;
  userPreference?: 'modal' | 'page';
}): boolean {
  // Check for workout hash parameter
  const hasEditorHash = hasHashParam(HASH_PARAMS.WORKOUT_EDITOR);
  
  return (
    // Coming from workout generator - use modal
    context.referrer === 'generator' ||
    
    // Hash parameter is present - use modal
    hasEditorHash ||
    
    // On mobile when in compact view - use modal
    (context.isMobileView === true && context.isCompactView === true) ||
    
    // User preference is set to modal
    context.userPreference === 'modal'
  );
}

/**
 * Generate a URL for a workout route
 * @param type - The type of route to generate
 * @param params - Route parameters
 * @returns The formatted URL
 */
export function getWorkoutUrl(
  type: keyof typeof ROUTES,
  params: Record<string, string | number> = {}
): string {
  let url = ROUTES[type];
  
  // Replace route parameters
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  
  return url;
}

/**
 * Add a listener for navigation events to handle modal state
 * @param handlers - Object containing handler functions
 */
export function setupNavigationHandlers(handlers: {
  onOpenModal: (workoutId: string) => void;
  onCloseModal: () => void;
}): () => void {
  if (typeof window === 'undefined') return () => {};
  
  // Handler for popstate events (browser back/forward)
  const handlePopState = (event: PopStateEvent) => {
    // Check if the hash contains the workout editor parameter
    const workoutId = getHashParam(HASH_PARAMS.WORKOUT_EDITOR);
    
    if (workoutId) {
      // Hash indicates modal should be open
      handlers.onOpenModal(workoutId);
    } else {
      // No hash, modal should be closed
      handlers.onCloseModal();
    }
  };
  
  // Listen for navigation events
  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
} 