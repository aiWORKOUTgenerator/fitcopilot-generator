# **Workout Generator Testing Infrastructure**

This directory contains comprehensive testing infrastructure for the Workout Generator API client functionality. The tests validate the fixes implemented in Phase 1 Sprint Stories 1-3.

## **📁 Directory Structure**

```
tests/
├── integration/
│   └── workoutService.integration.test.ts    # Comprehensive Jest test suite
├── manual/
│   └── apiValidation.js                      # Browser console testing script
└── README.md                                 # This documentation
```

## **🧪 Test Types**

### **1. Integration Tests (Jest)**
**File:** `integration/workoutService.integration.test.ts`

**Purpose:** Automated testing of API client functionality with proper mocking and assertions.

**Test Coverage:**
- ✅ Workout creation (POST)
- ✅ Workout updates (PUT)  
- ✅ Workout retrieval (GET)
- ✅ Workout deletion (DELETE)
- ✅ Workout completion (POST)
- ✅ Error handling scenarios
- ✅ Authentication edge cases
- ✅ Regression testing

**Usage:**
```bash
# Run all integration tests
npm test src/features/workout-generator/tests/integration/

# Run specific test file
npm test workoutService.integration.test.ts

# Run with coverage
npm test -- --coverage
```

### **2. Manual Browser Tests**
**File:** `manual/apiValidation.js`

**Purpose:** Real-time validation of actual API endpoints without mocking.

**Features:**
- ✅ No dependencies - runs in any browser console
- ✅ Tests actual WordPress REST API endpoints
- ✅ Validates the critical "DOCTYPE" error fix
- ✅ Comprehensive error detection
- ✅ Detailed pass/fail reporting

**Usage:**
1. Open browser developer console
2. Copy and paste the entire `apiValidation.js` script
3. Press Enter to auto-run all tests
4. Review detailed results in console

**Individual Test Execution:**
```javascript
// Run specific tests manually
await window.fitcopilotApiTests.testWorkoutCreation();
await window.fitcopilotApiTests.testErrorHandling();
await window.fitcopilotApiTests.runAllTests();
```

## **🎯 Test Scenarios**

### **Critical Issue Validation**
**Problem:** Original "DOCTYPE" JSON parsing errors  
**Validation:** Ensures all API responses are valid JSON (not HTML)

```bash
# Before Fix:
WorkoutEditorContainer.tsx:58 Error saving workout: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON

# After Fix:
{"code":"rest_forbidden","message":"Sorry, you are not allowed to do that.","data":{"status":401}}
```

### **CRUD Operations Testing**

#### **Create Workout**
```typescript
// Test workout creation with proper JSON serialization
const newWorkout = {
  title: 'Test Workout',
  difficulty: 'beginner',
  duration: 20,
  exercises: [...]
};
const result = await saveWorkout(newWorkout);
```

#### **Update Workout**
```typescript
// Test workout updates with PUT requests
const updatedWorkout = {
  id: 'existing-id',
  title: 'Updated Title',
  // ... other fields
};
const result = await saveWorkout(updatedWorkout);
```

#### **Retrieve Workouts**
```typescript
// Test single workout retrieval
const workout = await getWorkout('workout-id');

// Test paginated list retrieval
const workouts = await getWorkouts(1, 10);
```

#### **Delete Workout**
```typescript
// Test workout deletion
const success = await deleteWorkout('workout-id');
```

### **Error Handling Testing**

#### **Authentication Errors**
```javascript
// Should return proper JSON, not HTML
curl -X GET "/wp-json/fitcopilot/v1/workouts"
// Expected: {"code":"rest_forbidden","message":"...","data":{"status":401}}
```

#### **Not Found Errors**
```javascript
// Should return 404 JSON, not HTML page
curl -X GET "/wp-json/fitcopilot/v1/workouts/non-existent-id"
// Expected: {"code":"rest_no_route","message":"...","data":{"status":404}}
```

#### **Validation Errors**
```typescript
// Test invalid data handling
const invalidWorkout = {
  title: '',  // Invalid empty title
  duration: -5  // Invalid negative duration
};
// Should throw proper validation error, not crash
```

### **API Client Function Testing**

#### **Helper Function Validation**
```typescript
// URL Construction
const url = buildApiUrl('/workouts/123');
// Expected: '/wp-json/fitcopilot/v1/workouts/123'

// Request Preparation
const options = preparePostRequest(data);
// Expected: { method: 'POST', body: JSON.stringify(data), headers: {...} }

// Error Classification
const isAuth = isAuthError(error);
const isNetwork = isNetworkError(error);
```

## **📊 Test Results Interpretation**

### **Success Indicators**
- ✅ **All API calls return JSON** (not HTML)
- ✅ **No "DOCTYPE" errors** in any scenario
- ✅ **Proper error classification** (auth, network, validation)
- ✅ **Consistent response structure** across all endpoints
- ✅ **User-friendly error messages** for all error types

### **Failure Indicators**
- ❌ **HTML responses** containing `<!DOCTYPE`
- ❌ **"Unexpected token" errors** during JSON parsing
- ❌ **Network failures** due to malformed requests
- ❌ **Inconsistent error formats** across endpoints

### **Critical Failure Detection**
The tests specifically check for the original critical issue:

```javascript
// Critical failure detection
if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('Unexpected token')) {
  throw new Error('CRITICAL: Still receiving HTML error responses');
}
```

## **🔧 API Client Architecture Validation**

### **Function Signature Correctness**
The tests validate that all API calls use the correct function signature:

```typescript
// CORRECT (validated by tests):
const response = await apiFetch(url, options);

// INCORRECT (causes "DOCTYPE" errors):
const response = await apiFetch({ path, method, data });
```

### **Helper Function Integration**
Tests ensure all helper functions work correctly:

```typescript
// URL building
const url = buildApiUrl(API_ENDPOINTS.WORKOUT('123'));

// Request preparation  
const options = preparePostRequest(workoutData);

// Error handling
const message = extractErrorMessage(error);
const isAuth = isAuthError(error);
```

## **🚀 Running Tests**

### **Development Workflow**
```bash
# 1. Run integration tests during development
npm test src/features/workout-generator/tests/integration/

# 2. Manual validation in browser
# Copy/paste manual/apiValidation.js in browser console

# 3. Verify no console errors in actual application
# Open workout generator and test save functionality
```

### **CI/CD Integration**
```bash
# In CI pipeline
npm test -- --coverage --watchAll=false
```

### **Pre-deployment Validation**
```bash
# 1. Run full test suite
npm test

# 2. Manual browser testing on staging
# Run apiValidation.js script

# 3. User acceptance testing
# Test actual workout saving workflow
```

## **📋 Test Checklist**

### **For Developers**
- [ ] All integration tests pass
- [ ] Manual browser tests pass
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser
- [ ] API client function signatures correct

### **For QA Team**
- [ ] Workout creation works without errors
- [ ] Workout editing saves successfully
- [ ] Error messages are user-friendly
- [ ] No technical errors visible to users
- [ ] Consistent behavior across browsers

### **For Product Team**
- [ ] Core functionality restored
- [ ] User experience is smooth
- [ ] No user-facing technical errors
- [ ] Performance is acceptable

## **🐛 Troubleshooting**

### **Common Issues**

#### **"DOCTYPE" Errors Still Occurring**
```
Error: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```
**Solution:** Check that API client is using correct function signature:
- ❌ `apiFetch({ path, method, data })`
- ✅ `apiFetch(url, options)`

#### **Authentication Errors**
```
{"code":"rest_forbidden","message":"Sorry, you are not allowed to do that."}
```
**Note:** This is expected if user is not authenticated. The key is that it's JSON, not HTML.

#### **Network Errors**
```
TypeError: Failed to fetch
```
**Check:** Ensure API endpoints are accessible and CORS is configured properly.

### **Debug Mode**
Enable detailed logging in tests:

```javascript
// In browser console
window.fitcopilotApiTests.testBasicEndpointAccess().catch(console.error);
```

## **📝 Contributing**

### **Adding New Tests**
1. **Integration Tests:** Add new test cases to `workoutService.integration.test.ts`
2. **Manual Tests:** Extend `apiValidation.js` with new validation functions
3. **Documentation:** Update this README with new test scenarios

### **Test Structure**
```typescript
describe('Feature Area', () => {
  test('should behave correctly in specific scenario', async () => {
    // Arrange
    const testData = createTestData();
    
    // Act
    const result = await apiFunction(testData);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

## **📚 Related Documentation**

- **API Helpers:** `src/features/workout-generator/api/README.md`
- **Story Reports:** 
  - `STORY_1_API_CLIENT_FIX_COMPLETION_REPORT.md`
  - `STORY_2_API_HELPERS_COMPLETION_REPORT.md`
  - `STORY_3_INTEGRATION_TESTING_COMPLETION_REPORT.md`
- **Sprint Plan:** Phase 1 implementation documentation

---

## **✅ Success Criteria**

This testing infrastructure successfully validates:

1. **Critical Issue Resolution:** No more "DOCTYPE" JSON parsing errors
2. **Functional Correctness:** All CRUD operations work properly
3. **Error Resilience:** Proper handling of all error scenarios
4. **Developer Experience:** Clear test utilities and documentation
5. **Deployment Readiness:** Comprehensive validation for production deployment

**The workout save functionality is fully restored and validated.** 