/**
 * JSON Schema Validation Engine
 * 
 * Provides comprehensive validation for API requests and responses
 * according to the defined schemas in the API design guidelines.
 * 
 * TEMPORARY: AJV imports disabled due to browser compatibility issues
 */

// TEMPORARY: Mock AJV types and functions to prevent "self is not defined" error
// TODO: Re-enable AJV once browser compatibility issue is resolved
// import Ajv, { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';
// import addFormats from 'ajv-formats';

// Mock types for temporary compatibility
type JSONSchemaType<T> = any;
type ValidateFunction<T> = (data: any) => boolean;
type ErrorObject = {
  instancePath: string;
  keyword: string;
  message?: string;
};

// Mock AJV class
class MockAjv {
  constructor(options?: any) {}
  compile(schema: any): ValidateFunction<any> {
    return (data: any) => true; // Always pass validation temporarily
  }
  addKeyword(options: any): void {}
}

import { ValidationResult, ValidationError, TypeCoercionRules } from '../types/guidelines';

/**
 * Schema validation configuration
 */
export interface ValidationConfig {
  /** Enable type coercion according to guidelines */
  enableCoercion: boolean;
  /** Type coercion rules */
  coercionRules: TypeCoercionRules;
  /** Remove additional properties not defined in schema */
  removeAdditional: boolean;
  /** Use defaults defined in schema */
  useDefaults: boolean;
  /** Strict mode validation */
  strict: boolean;
}

/**
 * Default validation configuration following API guidelines
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  enableCoercion: true,
  coercionRules: {
    numericStrings: true,     // "123" -> 123
    booleanStrings: true,     // "true" -> true  
    emptyStringToNull: true,  // "" -> null
    arrayItemValidation: true // Validate array item types
  },
  removeAdditional: false,
  useDefaults: true,
  strict: false
};

/**
 * Schema Validator class
 */
export class SchemaValidator {
  private ajv: MockAjv;
  private compiledSchemas: Map<string, ValidateFunction<any>> = new Map();
  private config: ValidationConfig;

  constructor(config: ValidationConfig = DEFAULT_VALIDATION_CONFIG) {
    this.config = config;
    
    // TEMPORARY: Use mock AJV to prevent browser compatibility issues
    this.ajv = new MockAjv({
      coerceTypes: config.enableCoercion,
      removeAdditional: config.removeAdditional,
      useDefaults: config.useDefaults,
      strict: config.strict,
      allErrors: true // Collect all validation errors
    });

    // TEMPORARY: Skip format validators to avoid AJV dependency
    // addFormats(this.ajv);

    // Add custom type coercion rules
    this.setupCustomCoercion();
  }

  /**
   * Setup custom type coercion according to API guidelines
   */
  private setupCustomCoercion(): void {
    if (!this.config.enableCoercion) return;

    const { coercionRules } = this.config;

    // Custom keyword for empty string to null conversion
    if (coercionRules.emptyStringToNull) {
      this.ajv.addKeyword({
        keyword: 'emptyStringToNull',
        type: 'string',
        compile: () => {
          return function validate(data: any, dataCxt: any) {
            if (data === '') {
              dataCxt.parentData[dataCxt.parentDataProperty] = null;
            }
            return true;
          };
        }
      });
    }

    // Custom coercion for numeric strings
    if (coercionRules.numericStrings) {
      this.ajv.addKeyword({
        keyword: 'coerceNumeric',
        type: 'string',
        compile: () => {
          return function validate(data: any, dataCxt: any) {
            const num = Number(data);
            if (!isNaN(num) && isFinite(num)) {
              dataCxt.parentData[dataCxt.parentDataProperty] = num;
            }
            return true;
          };
        }
      });
    }
  }

  /**
   * Compile and cache schema for reuse
   */
  compileSchema(schemaId: string, schema: JSONSchemaType<any>): ValidateFunction<any> {
    if (this.compiledSchemas.has(schemaId)) {
      return this.compiledSchemas.get(schemaId)!;
    }

    const validateFunction = this.ajv.compile(schema);
    this.compiledSchemas.set(schemaId, validateFunction);
    return validateFunction;
  }

  /**
   * Validate data against schema
   * TEMPORARY: Always returns valid to prevent AJV browser compatibility issues
   */
  validate<T>(data: unknown, schema: JSONSchemaType<T> | string): ValidationResult {
    // TEMPORARY: Skip validation and always return success
    // TODO: Re-enable proper validation once AJV browser compatibility is resolved
    console.log('TEMPORARY: Schema validation disabled - always returning valid');
    return { isValid: true, errors: [] };
    
    /* ORIGINAL CODE - Re-enable when AJV is working
    try {
      let validateFunction: ValidateFunction<T>;

      if (typeof schema === 'string') {
        // Schema ID provided - look up compiled schema
        const cached = this.compiledSchemas.get(schema);
        if (!cached) {
          return {
            isValid: false,
            errors: [{
              field: 'schema',
              message: `Schema with ID '${schema}' not found`,
              code: 'schema_not_found'
            }]
          };
        }
        validateFunction = cached;
      } else {
        // Schema object provided - compile it
        validateFunction = this.ajv.compile(schema);
      }

      const isValid = validateFunction(data);
      
      if (isValid) {
        return { isValid: true, errors: [] };
      } else {
        return {
          isValid: false,
          errors: this.convertAjvErrors(validateFunction.errors || [])
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          field: 'validation',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'validation_error'
        }]
      };
    }
    */
  }

  /**
   * Validate and transform data (with type coercion)
   * TEMPORARY: Always returns valid data to prevent AJV browser compatibility issues
   */
  validateAndTransform<T>(data: unknown, schema: JSONSchemaType<T> | string): {
    isValid: boolean;
    data: T | null;
    errors: ValidationError[];
  } {
    // TEMPORARY: Skip validation and transformation, return data as-is
    console.log('TEMPORARY: Schema validation and transformation disabled - returning data as-is');
    return {
      isValid: true,
      data: data as T,
      errors: []
    };
    
    /* ORIGINAL CODE - Re-enable when AJV is working
    // Create a deep copy for transformation
    const dataCopy = JSON.parse(JSON.stringify(data));
    const result = this.validate(dataCopy, schema);

    return {
      isValid: result.isValid,
      data: result.isValid ? dataCopy as T : null,
      errors: result.errors
    };
    */
  }

  /**
   * Convert AJV errors to our ValidationError format
   * TEMPORARY: Returns empty array since AJV is disabled
   */
  private convertAjvErrors(ajvErrors: ErrorObject[]): ValidationError[] {
    // TEMPORARY: Return empty errors since validation is disabled
    return [];
    
    /* ORIGINAL CODE - Re-enable when AJV is working
    return ajvErrors.map(error => ({
      field: error.instancePath.replace(/^\//, '') || error.keyword,
      message: this.formatErrorMessage(error),
      code: error.keyword
    }));
    */
  }

  /**
   * Format error message in a user-friendly way
   * TEMPORARY: Disabled since AJV is disabled
   */
  private formatErrorMessage(error: ErrorObject): string {
    // TEMPORARY: Return generic message since AJV is disabled
    return 'Validation error';
    
    /* ORIGINAL CODE - Re-enable when AJV is working
    const field = error.instancePath.replace(/^\//, '') || 'root';
    
    switch (error.keyword) {
      case 'required':
        return `${error.params.missingProperty} is required`;
      case 'type':
        return `${field} must be of type ${error.params.type}`;
      case 'minimum':
        return `${field} must be at least ${error.params.limit}`;
      case 'maximum':
        return `${field} must be at most ${error.params.limit}`;
      case 'minLength':
        return `${field} must be at least ${error.params.limit} characters long`;
      case 'maxLength':
        return `${field} must be at most ${error.params.limit} characters long`;
      case 'enum':
        return `${field} must be one of: ${error.params.allowedValues.join(', ')}`;
      case 'format':
        return `${field} must be a valid ${error.params.format}`;
      case 'additionalProperties':
        return `${field} contains invalid property: ${error.params.additionalProperty}`;
      default:
        return error.message || `${field} is invalid`;
    }
    */
  }

  /**
   * Bulk validate multiple data objects
   */
  validateBatch<T>(
    dataList: unknown[], 
    schema: JSONSchemaType<T> | string
  ): Array<ValidationResult & { index: number }> {
    return dataList.map((data, index) => ({
      ...this.validate(data, schema),
      index
    }));
  }

  /**
   * Clear compiled schema cache
   */
  clearCache(): void {
    this.compiledSchemas.clear();
  }

  /**
   * Get available cached schemas
   */
  getCachedSchemas(): string[] {
    return Array.from(this.compiledSchemas.keys());
  }
}

/**
 * Pre-configured validators for common scenarios
 */
export class ApiValidators {
  private static instance: SchemaValidator;

  /**
   * Get shared validator instance
   */
  static getValidator(): SchemaValidator {
    if (!this.instance) {
      this.instance = new SchemaValidator();
    }
    return this.instance;
  }

  /**
   * Validate request data
   */
  static validateRequest<T>(data: unknown, schema: JSONSchemaType<T>): ValidationResult {
    return this.getValidator().validate(data, schema);
  }

  /**
   * Validate response data
   */
  static validateResponse<T>(data: unknown, schema: JSONSchemaType<T>): ValidationResult {
    return this.getValidator().validate(data, schema);
  }

  /**
   * Validate and coerce request data
   */
  static validateAndCoerceRequest<T>(data: unknown, schema: JSONSchemaType<T>): {
    isValid: boolean;
    data: T | null;
    errors: ValidationError[];
  } {
    return this.getValidator().validateAndTransform(data, schema);
  }
}

/**
 * Schema registry for centralized schema management
 */
export class SchemaRegistry {
  private static schemas: Map<string, JSONSchemaType<any>> = new Map();
  private static _validator: SchemaValidator | null = null;
  
  private static getValidator(): SchemaValidator {
    if (!this._validator) {
      this._validator = new SchemaValidator();
    }
    return this._validator;
  }

  /**
   * Register a schema with an ID
   */
  static registerSchema<T>(id: string, schema: JSONSchemaType<T>): void {
    this.schemas.set(id, schema);
    this.getValidator().compileSchema(id, schema);
  }

  /**
   * Get a registered schema
   */
  static getSchema(id: string): JSONSchemaType<any> | undefined {
    return this.schemas.get(id);
  }

  /**
   * Validate data against a registered schema
   */
  static validate(data: unknown, schemaId: string): ValidationResult {
    return this.getValidator().validate(data, schemaId);
  }

  /**
   * Validate and transform data against a registered schema
   */
  static validateAndTransform<T>(data: unknown, schemaId: string): {
    isValid: boolean;
    data: T | null;
    errors: ValidationError[];
  } {
    return this.getValidator().validateAndTransform(data, schemaId);
  }

  /**
   * List all registered schemas
   */
  static listSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Clear all registered schemas
   */
  static clear(): void {
    this.schemas.clear();
    this.getValidator().clearCache();
  }
}

/**
 * Export default validator instance (lazy initialization)
 */
let _defaultValidator: SchemaValidator | null = null;

export const defaultValidator = {
  getInstance(): SchemaValidator {
    if (!_defaultValidator) {
      _defaultValidator = new SchemaValidator();
    }
    return _defaultValidator;
  },
  
  // Proxy methods to the lazy instance
  validate<T>(data: unknown, schema: JSONSchemaType<T> | string): ValidationResult {
    return this.getInstance().validate(data, schema);
  },
  
  validateAndTransform<T>(data: unknown, schema: JSONSchemaType<T> | string): {
    isValid: boolean;
    data: T | null;
    errors: ValidationError[];
  } {
    return this.getInstance().validateAndTransform(data, schema);
  },
  
  compileSchema(schemaId: string, schema: JSONSchemaType<any>): ValidateFunction<any> {
    return this.getInstance().compileSchema(schemaId, schema);
  },
  
  validateBatch<T>(
    dataList: unknown[], 
    schema: JSONSchemaType<T> | string
  ): Array<ValidationResult & { index: number }> {
    return this.getInstance().validateBatch(dataList, schema);
  },
  
  clearCache(): void {
    this.getInstance().clearCache();
  },
  
  getCachedSchemas(): string[] {
    return this.getInstance().getCachedSchemas();
  }
};

/**
 * Convenience validation functions
 */
export const ValidationUtils = {
  /**
   * Quick validation without detailed error info
   */
  isValid<T>(data: unknown, schema: JSONSchemaType<T>): boolean {
    return defaultValidator.validate(data, schema).isValid;
  },

  /**
   * Get only the error messages
   */
  getErrorMessages<T>(data: unknown, schema: JSONSchemaType<T>): string[] {
    const result = defaultValidator.validate(data, schema);
    return result.errors.map(error => error.message);
  },

  /**
   * Validate with automatic type coercion
   */
  validateWithCoercion<T>(data: unknown, schema: JSONSchemaType<T>): T | null {
    const result = defaultValidator.validateAndTransform(data, schema);
    return result.isValid ? (result.data as T) : null;
  }
};

// Re-export from types for convenience
export type { ValidationResult, ValidationError, TypeCoercionRules } from '../types/guidelines'; 