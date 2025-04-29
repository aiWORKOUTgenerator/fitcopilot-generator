/**
 * Mock Server Implementation
 * 
 * Provides a simple mock server for testing API client functionality
 * including response mocking, delay simulation, and request tracking
 */

export const SERVER_URL = 'http://localhost:3000';

interface MockResponse {
  status: number;
  body: any;
  delay?: number;
  headers?: Record<string, string>;
}

interface MockRequest {
  url: string;
  method: string;
  body?: string;
  headers?: Headers;
  cache?: RequestCache;
}

export const setupMockServer = () => {
  // Store responses and requests
  const responses = new Map<string, Map<string, MockResponse>>();
  const requests: MockRequest[] = [];
  let lastRequest: MockRequest | null = null;
  
  // Helper to build a route key
  const getRouteKey = (method: string, path: string) => `${method}:${path}`;
  
  // Helper to create Response objects
  const createResponse = (response: MockResponse): Response => {
    const { status, body, headers = {} } = response;
    
    // Create headers object
    const responseHeaders = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
      responseHeaders.append(key, value);
    });
    
    // Handle string or object body
    const responseBody = typeof body === 'string' 
      ? body 
      : JSON.stringify(body);
    
    return new Response(responseBody, {
      status,
      headers: responseHeaders
    });
  };
  
  // Mock fetch implementation
  const mockFetch = jest.fn().mockImplementation(
    (url: string, init: RequestInit = {}): Promise<Response> => {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const method = (init.method || 'GET').toUpperCase();
      const routeKey = getRouteKey(method, path);
      
      // Store request information
      const request: MockRequest = {
        url,
        method,
        body: init.body as string,
        headers: init.headers as Headers,
        cache: init.cache
      };
      
      requests.push(request);
      lastRequest = request;
      
      // Get response for this route
      const methodMap = responses.get(path);
      const mockResponse = methodMap?.get(method);
      
      if (!mockResponse) {
        return Promise.reject(new Error(`No mock response for ${method} ${path}`));
      }
      
      // Handle delays
      const responsePromise = mockResponse.delay 
        ? new Promise<Response>(resolve => {
            setTimeout(() => {
              resolve(createResponse(mockResponse));
            }, mockResponse.delay);
          })
        : Promise.resolve(createResponse(mockResponse));
      
      return responsePromise;
    }
  );
  
  return {
    // Property to access the mock fetch
    fetch: mockFetch,
    
    // Reset the mock state
    reset: () => {
      responses.clear();
      requests.length = 0;
      lastRequest = null;
      mockFetch.mockClear();
    },
    
    // Add a response for a specific route and method
    addResponse: (method: string, path: string, body: any, status = 200) => {
      if (!responses.has(path)) {
        responses.set(path, new Map());
      }
      
      const methodMap = responses.get(path)!;
      methodMap.set(method.toUpperCase(), {
        status,
        body,
        headers: { 'Content-Type': 'application/json' }
      });
    },
    
    // Add a response with raw string body
    addRawResponse: (method: string, path: string, body: string, status = 200) => {
      if (!responses.has(path)) {
        responses.set(path, new Map());
      }
      
      const methodMap = responses.get(path)!;
      methodMap.set(method.toUpperCase(), {
        status,
        body,
        headers: { 'Content-Type': 'text/plain' }
      });
    },
    
    // Add an error response
    addErrorResponse: (method: string, path: string, status: number, body: any) => {
      if (!responses.has(path)) {
        responses.set(path, new Map());
      }
      
      const methodMap = responses.get(path)!;
      methodMap.set(method.toUpperCase(), {
        status,
        body,
        headers: { 'Content-Type': 'application/json' }
      });
    },
    
    // Add a delayed response
    addDelayedResponse: (method: string, path: string, body: any, delay: number, status = 200) => {
      if (!responses.has(path)) {
        responses.set(path, new Map());
      }
      
      const methodMap = responses.get(path)!;
      methodMap.set(method.toUpperCase(), {
        status,
        body,
        delay,
        headers: { 'Content-Type': 'application/json' }
      });
    },
    
    // Get the last request information
    getLastRequest: () => lastRequest,
    
    // Get all requests matching a path
    getRequests: (path?: string) => {
      if (!path) return [...requests];
      return requests.filter(req => new URL(req.url).pathname === path);
    }
  };
}; 