/**
 * WordPress Polyfills
 * 
 * Implementations of WordPress JS libraries that use native WP functions when available
 * and fallback to simple implementations for standalone usage
 */

// Add global wp interface
declare global {
  interface Window {
    wp?: {
      i18n?: {
        __: (text: string, domain?: string) => string;
      };
      apiFetch?: (options: any) => Promise<any>;
      url?: {
        addQueryArgs: (url: string, args: Record<string, any>) => string;
      };
    };
    fitcopilotApiTracker?: {
      nonce?: string;
      rootApiUrl?: string;
      apiBase?: string;
      endpoints?: {
        summary?: string;
        daily?: string;
        monthly?: string;
        tokenCost?: string;
        reset?: string;
      };
      debugInfo?: {
        adminHook?: string;
        pageSlug?: string;
        expectedHook?: string;
      };
      pluginVersion?: string;
    };
  }
}

/**
 * i18n polyfill
 */
export const __ = (text: string, domain?: string): string => {
  // Use WordPress i18n if available
  if (window.wp?.i18n?.__) {
    return window.wp.i18n.__(text, domain);
  }
  // Fallback for standalone usage
  return text;
};

/**
 * API fetch polyfill
 */
export const apiFetch = async (options: {
  path: string;
  method?: string;
  data?: any;
}): Promise<any> => {
  // Use WordPress apiFetch if available
  if (window.wp?.apiFetch) {
    console.log('Using WordPress apiFetch:', options);
    return window.wp.apiFetch(options);
  }
  
  // Fallback implementation for standalone usage
  const { path, method = 'GET', data } = options;
  
  let url = path;
  
  // If path is a relative path without http(s), convert it to full URL
  if (!path.startsWith('http')) {
    if (window.fitcopilotApiTracker?.apiBase) {
      // If endpoint is one of our known endpoints, use the full URL
      const endpointMap: Record<string, string | undefined> = {
        'fitcopilot/v1/api-tracker/summary': window.fitcopilotApiTracker.endpoints?.summary,
        'fitcopilot/v1/api-tracker/daily': window.fitcopilotApiTracker.endpoints?.daily,
        'fitcopilot/v1/api-tracker/monthly': window.fitcopilotApiTracker.endpoints?.monthly,
        'fitcopilot/v1/api-tracker/token-cost': window.fitcopilotApiTracker.endpoints?.tokenCost,
        'fitcopilot/v1/api-tracker/reset': window.fitcopilotApiTracker.endpoints?.reset,
      };
      
      if (endpointMap[path] && typeof endpointMap[path] === 'string') {
        url = endpointMap[path] as string;
        console.log('Using mapped endpoint URL:', url);
      } else {
        // Otherwise, append to WordPress REST API base URL
        const baseUrl = window.fitcopilotApiTracker?.rootApiUrl || '/wp-json/';
        url = `${baseUrl}${path}`;
        console.log('Using constructed URL:', url);
      }
    } else {
      // Fallback if no apiBase is defined
      url = `/wp-json/${path}`;
      console.log('Using fallback URL:', url);
    }
  }
  
  console.log('Fetching:', method, url);
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': window.fitcopilotApiTracker?.nonce || '',
    },
    credentials: 'same-origin',
  };
  
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, fetchOptions);
    const responseData = await response.json();
    
    console.log('API response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `Error ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * URL utility polyfill
 */
export const addQueryArgs = (url: string, args: Record<string, any>): string => {
  // Use WordPress url utilities if available
  if (window.wp?.url?.addQueryArgs) {
    return window.wp.url.addQueryArgs(url, args);
  }
  
  // Fallback implementation for standalone usage
  const urlObj = new URL(url, window.location.origin);
  
  Object.entries(args).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.append(key, String(value));
    }
  });
  
  return url.startsWith('http') ? urlObj.toString() : urlObj.pathname + urlObj.search;
}; 