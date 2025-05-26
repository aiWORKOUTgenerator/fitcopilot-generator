/**
 * AJV Validation Integration Tests
 * 
 * Tests to verify that the AJV validation system is properly integrated
 * and working correctly with all features.
 */

import { 
  SchemaValidator, 
  ApiValidators, 
  SchemaRegistry, 
  ValidationUtils,
  defaultValidator,
  DEFAULT_VALIDATION_CONFIG 
} from '../../../../src/common/api/validation/schemaValidator';

describe('AJV Validation Integration', () => {
  describe('SchemaValidator', () => {
    let validator: SchemaValidator;

    beforeEach(() => {
      validator = new SchemaValidator();
    });

    test('should validate simple object successfully', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
          age: { type: 'number' as const }
        },
        required: ['name', 'age']
      };

      const validData = { name: 'John', age: 30 };
      const result = validator.validate(validData, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect validation errors', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
          age: { type: 'number' as const }
        },
        required: ['name', 'age']
      };

      const invalidData = { name: 'John' }; // missing age
      const result = validator.validate(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('age is required');
    });

    test('should perform type coercion when enabled', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          age: { type: 'number' as const },
          active: { type: 'boolean' as const }
        },
        required: ['age', 'active']
      };

      const data = { age: '25', active: 'true' }; // strings that should be coerced
      const result = validator.validateAndTransform(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ age: 25, active: true });
    });
  });

  describe('ApiValidators', () => {
    test('should provide static validation methods', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          email: { type: 'string' as const, format: 'email' }
        },
        required: ['email']
      };

      const validData = { email: 'test@example.com' };
      const result = ApiValidators.validateRequest(validData, schema);

      expect(result.isValid).toBe(true);
    });

    test('should validate email format', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          email: { type: 'string' as const, format: 'email' }
        },
        required: ['email']
      };

      const invalidData = { email: 'not-an-email' };
      const result = ApiValidators.validateRequest(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('must be a valid email');
    });
  });

  describe('SchemaRegistry', () => {
    beforeEach(() => {
      SchemaRegistry.clear();
    });

    test('should register and validate against schemas', () => {
      const userSchema = {
        type: 'object' as const,
        properties: {
          username: { type: 'string' as const, minLength: 3 },
          email: { type: 'string' as const, format: 'email' }
        },
        required: ['username', 'email']
      };

      SchemaRegistry.registerSchema('user', userSchema);

      const validUser = { username: 'john', email: 'john@example.com' };
      const result = SchemaRegistry.validate(validUser, 'user');

      expect(result.isValid).toBe(true);
    });

    test('should handle unknown schema IDs', () => {
      const result = SchemaRegistry.validate({}, 'unknown-schema');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Schema with ID \'unknown-schema\' not found');
    });
  });

  describe('ValidationUtils', () => {
    test('should provide quick validation check', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          count: { type: 'number' as const, minimum: 0 }
        },
        required: ['count']
      };

      expect(ValidationUtils.isValid({ count: 5 }, schema)).toBe(true);
      expect(ValidationUtils.isValid({ count: -1 }, schema)).toBe(false);
    });

    test('should extract error messages', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const, minLength: 2 }
        },
        required: ['name']
      };

      const errors = ValidationUtils.getErrorMessages({ name: 'a' }, schema);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('must be at least 2 characters long');
    });

    test('should validate with coercion', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          price: { type: 'number' as const }
        },
        required: ['price']
      };

      const result = ValidationUtils.validateWithCoercion({ price: '19.99' }, schema);
      expect(result).toEqual({ price: 19.99 });
    });
  });

  describe('Default Validator', () => {
    test('should work with lazy initialization', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const }
        },
        required: ['id']
      };

      const result = defaultValidator.validate({ id: 'test-123' }, schema);
      expect(result.isValid).toBe(true);
    });

    test('should handle batch validation', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          value: { type: 'number' as const }
        },
        required: ['value']
      };

      const dataList = [
        { value: 1 },
        { value: 'invalid' },
        { value: 3 }
      ];

      const results = defaultValidator.validateBatch(dataList, schema);
      
      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
    });
  });

  describe('Configuration', () => {
    test('should use default configuration correctly', () => {
      expect(DEFAULT_VALIDATION_CONFIG.enableCoercion).toBe(true);
      expect(DEFAULT_VALIDATION_CONFIG.coercionRules.numericStrings).toBe(true);
      expect(DEFAULT_VALIDATION_CONFIG.coercionRules.booleanStrings).toBe(true);
    });

    test('should allow custom configuration', () => {
      const customValidator = new SchemaValidator({
        enableCoercion: false,
        coercionRules: {
          numericStrings: false,
          booleanStrings: false,
          emptyStringToNull: false,
          arrayItemValidation: false
        },
        removeAdditional: true,
        useDefaults: false,
        strict: true
      });

      const schema = {
        type: 'object' as const,
        properties: {
          count: { type: 'number' as const }
        },
        required: ['count']
      };

      // With coercion disabled, string numbers should fail
      const result = customValidator.validate({ count: '5' }, schema);
      expect(result.isValid).toBe(false);
    });
  });



});

// Test that AJV library is properly loaded
describe('AJV Library Integration', () => {
  
  test('AJV should be available and working', () => {
    expect(defaultValidator).toBeDefined();
    expect(typeof defaultValidator.validate).toBe('function');
  });

  test('Format validation should work', () => {
    const schemaWithFormat = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        date: { type: 'string', format: 'date-time' }
      },
      required: ['email']
    } as const;

    const validData = {
      email: 'test@example.com',
      date: '2023-07-15T14:30:00Z'
    };

    const invalidData = {
      email: 'not-an-email',
      date: 'not-a-date'
    };

    const validResult = defaultValidator.validate(validData, schemaWithFormat);
    const invalidResult = defaultValidator.validate(invalidData, schemaWithFormat);

    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
  });

}); 