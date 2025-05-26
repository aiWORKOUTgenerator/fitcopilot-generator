/**
 * Field Name Transformation Library
 * 
 * Handles automatic conversion between frontend (camelCase) and backend (snake_case)
 * field naming conventions as specified in the API design guidelines.
 */

/**
 * Transform camelCase to snake_case
 */
export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter, index) => {
    return index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`;
  });
}

/**
 * Transform snake_case to camelCase
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform object keys recursively from camelCase to snake_case
 */
export function transformKeysToSnakeCase<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToSnakeCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: Record<string, any> = {};
    
    Object.keys(obj).forEach(key => {
      const snakeKey = camelToSnakeCase(key);
      const value = obj[key];
      
      // Recursively transform nested objects and arrays
      if (value !== null && typeof value === 'object') {
        transformed[snakeKey] = transformKeysToSnakeCase(value);
      } else {
        transformed[snakeKey] = value;
      }
    });
    
    return transformed;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Transform object keys recursively from snake_case to camelCase
 */
export function transformKeysToCamelCase<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToCamelCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: Record<string, any> = {};
    
    Object.keys(obj).forEach(key => {
      const camelKey = snakeToCamelCase(key);
      const value = obj[key];
      
      // Recursively transform nested objects and arrays
      if (value !== null && typeof value === 'object') {
        transformed[camelKey] = transformKeysToCamelCase(value);
      } else {
        transformed[camelKey] = value;
      }
    });
    
    return transformed;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Type-safe field transformer with preserve list
 */
export interface TransformOptions {
  /** Fields to exclude from transformation */
  preserveFields?: string[];
  /** Direction of transformation */
  direction: 'toSnakeCase' | 'toCamelCase';
  /** Deep transformation of nested objects */
  deep?: boolean;
}

/**
 * Advanced field transformer with options
 */
export function transformFieldNames<T>(obj: T, options: TransformOptions): T {
  const { preserveFields = [], direction, deep = true } = options;

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return (deep ? obj.map(item => transformFieldNames(item, options)) : obj) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: Record<string, any> = {};
    const typedObj = obj as Record<string, any>;
    
    Object.keys(typedObj).forEach(key => {
      let transformedKey = key;
      
      // Only transform if not in preserve list
      if (!preserveFields.includes(key)) {
        transformedKey = direction === 'toSnakeCase' 
          ? camelToSnakeCase(key)
          : snakeToCamelCase(key);
      }
      
      const value = typedObj[key];
      
      // Recursively transform nested objects if deep transformation is enabled
      if (deep && value !== null && typeof value === 'object') {
        transformed[transformedKey] = transformFieldNames(value, options);
      } else {
        transformed[transformedKey] = value;
      }
    });
    
    return transformed as T;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Request transformer for sending data to backend
 */
export function transformRequestForBackend<T>(data: T, preserveFields?: string[]): T {
  return transformFieldNames(data, {
    direction: 'toSnakeCase',
    preserveFields,
    deep: true
  });
}

/**
 * Response transformer for receiving data from backend
 */
export function transformResponseFromBackend<T>(data: T, preserveFields?: string[]): T {
  return transformFieldNames(data, {
    direction: 'toCamelCase',
    preserveFields,
    deep: true
  });
}

/**
 * Predefined preserve lists for common use cases
 */
export const COMMON_PRESERVE_FIELDS = {
  /** WordPress-specific fields that should remain snake_case */
  WORDPRESS: ['post_id', 'user_id', 'post_type', 'post_status', 'meta_key', 'meta_value'],
  
  /** Database field names that should remain snake_case */
  DATABASE: ['created_at', 'updated_at', 'deleted_at', 'id'],
  
  /** API response metadata fields */
  API_METADATA: ['_links', '_embedded', '_metadata'],
  
  /** External service field names */
  EXTERNAL_APIS: ['client_id', 'client_secret', 'access_token', 'refresh_token']
};

/**
 * Get combined preserve list for multiple contexts
 */
export function getCombinedPreserveFields(...contexts: (keyof typeof COMMON_PRESERVE_FIELDS)[]): string[] {
  return contexts.reduce((combined, context) => {
    return [...combined, ...COMMON_PRESERVE_FIELDS[context]];
  }, [] as string[]);
}

/**
 * Smart transformer that auto-detects transformation direction
 */
export function smartTransform<T>(obj: T, targetCase: 'camelCase' | 'snake_case', preserveFields?: string[]): T {
  if (targetCase === 'camelCase') {
    return transformResponseFromBackend(obj, preserveFields);
  } else {
    return transformRequestForBackend(obj, preserveFields);
  }
}

/**
 * Transformer factory for creating configured transformers
 */
export class FieldTransformerFactory {
  private preserveFields: string[];
  
  constructor(preserveFields: string[] = []) {
    this.preserveFields = preserveFields;
  }

  transformToBackend<T>(data: T): T {
    return transformRequestForBackend(data, this.preserveFields);
  }

  transformFromBackend<T>(data: T): T {
    return transformResponseFromBackend(data, this.preserveFields);
  }

  addPreserveFields(fields: string[]): FieldTransformerFactory {
    return new FieldTransformerFactory([...this.preserveFields, ...fields]);
  }

  static forWordPress(): FieldTransformerFactory {
    return new FieldTransformerFactory(
      getCombinedPreserveFields('WORDPRESS', 'DATABASE', 'API_METADATA')
    );
  }
}

/**
 * Default transformer instance for WordPress environment
 */
export const wordPressFieldTransformer = FieldTransformerFactory.forWordPress(); 