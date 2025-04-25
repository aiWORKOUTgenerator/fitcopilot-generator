/**
 * WordPress Polyfills
 * 
 * These utilities provide access to WordPress functionality in the React context
 */

// Check if we're in the WordPress admin environment
const isWordPress = typeof window !== 'undefined' && window.wp !== undefined;

/**
 * WordPress API Fetch with fallback for testing environments
 */
export const apiFetch = async (options: {
  path: string;
  method?: string;
  data?: any;
  headers?: Record<string, string>;
}): Promise<any> => {
  if (isWordPress && window.wp && window.wp.apiFetch) {
    return window.wp.apiFetch(options);
  }
  
  // Fallback for testing without WordPress
  console.warn('wp.apiFetch not available, using fetch polyfill');
  
  const { path, method = 'GET', data, headers = {} } = options;
  
  // Get the REST API base URL from the global variable
  const baseUrl = window.fitcopilotTokenUsage?.rootApiUrl || '/wp-json/';
  const fullUrl = baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  
  if (data) {
    requestOptions.body = JSON.stringify(data);
  }
  
  const response = await fetch(fullUrl, requestOptions);
  return response.json();
};

/**
 * WordPress __ (translate) function with fallback
 */
export const __ = (text: string, domain?: string): string => {
  if (isWordPress && window.wp && window.wp.i18n && window.wp.i18n.__) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

/**
 * WordPress addQueryArgs with fallback
 */
export const addQueryArgs = (url: string, args: Record<string, any>): string => {
  if (isWordPress && window.wp && window.wp.url && window.wp.url.addQueryArgs) {
    return window.wp.url.addQueryArgs(url, args);
  }
  
  // Simple fallback implementation
  const urlObj = new URL(url, window.location.origin);
  Object.entries(args).forEach(([key, value]) => {
    urlObj.searchParams.append(key, String(value));
  });
  
  return urlObj.pathname + urlObj.search;
}; 