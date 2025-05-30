# 🧪 **Phase 1 Testing & Debugging Guide**

## **Overview**
This guide provides comprehensive testing procedures to validate the Phase 1 stabilization work and debug any issues that arise.

**Phase 1 Goal**: Stabilize workout data storage by eliminating format conflicts and adding defensive programming.

---

## **🔧 Available Test Suites**

### **1. Manual Comprehensive Tests**
**Location**: `tests/manual/phase1-stabilization-tests.php`
**Purpose**: WordPress-integrated tests for defensive programming and data format handling

**How to Run**:
```bash
# Access via WordPress admin dashboard
http://your-site.local/wp-content/plugins/Fitcopilot-Generator/tests/manual/phase1-stabilization-tests.php
```

**What it Tests**:
- ✅ **Defensive Programming**: Handles AI format, wrapper format, invalid JSON, empty data, unknown formats
- ✅ **Data Format Standardization**: Verifies both endpoints use standardized format  
- ✅ **API Endpoint Registration**: Confirms all workout endpoints are active
- ✅ **Error Handling**: Validates error logging and fallback mechanisms
- ✅ **Backward Compatibility**: Ensures legacy data formats still work

### **2. API Endpoint Tests**
**Location**: `tests/manual/api-endpoint-tests.sh`
**Purpose**: External API testing via curl requests

**How to Run**:
```bash
cd /path/to/fitcopilot-generator
chmod +x tests/manual/api-endpoint-tests.sh
./tests/manual/api-endpoint-tests.sh
```

**What it Tests**:
- ✅ **API Namespace Registration**: `/fitcopilot/v1/` accessible
- ✅ **Authentication**: Proper 401 responses for protected endpoints
- ✅ **Route Discovery**: All expected endpoints registered
- ✅ **Debug Endpoint**: Basic functionality verification

### **3. Existing PHPUnit Tests**
**Location**: `tests/php/API/WorkoutEndpointsTest.php`
**Purpose**: Unit tests for workout endpoint functionality

**How to Run**:
```bash
# Requires WordPress test environment setup
vendor/bin/phpunit tests/php/API/WorkoutEndpointsTest.php
```

### **4. Manual Frontend Testing**
**Purpose**: Validate end-to-end user workflows

**Test Steps**:
1. **Workout Generation**: Use the workout generator
2. **Saved Workouts**: Visit workout grid/list page
3. **Workout Details**: View individual workout details
4. **Workout Updates**: Modify existing workouts

---

## **🎯 Critical Test Scenarios**

### **Scenario 1: Defensive Programming Validation**

**Test**: Different data formats should be handled gracefully

```php
// Test Data Formats:
$ai_format = [
    'title' => 'AI Workout',
    'exercises' => [...],
    'sections' => [...]
];

$wrapper_format = [
    'exercises' => [...]
];

$invalid_format = 'invalid json string';
$empty_format = null;
```

**Expected Results**:
- ✅ No PHP fatal errors
- ✅ No 500 HTTP responses  
- ✅ Workout data always has default structure
- ✅ Error logging without crashes

### **Scenario 2: Data Format Standardization**

**Test**: New workouts should use consistent format

**Validation Steps**:
1. Create workout via GenerateEndpoint
2. Create workout via WorkoutRetrievalEndpoint
3. Check `_workout_data` meta field format
4. Verify both use identical structure

**Expected Structure**:
```php
$standardized_format = [
    'title' => '...',
    'exercises' => [...],
    'sections' => [...],
    'duration' => 30,
    'difficulty' => 'intermediate',
    'equipment' => [...],
    'goals' => [...],
    'restrictions' => '',
    'metadata' => [
        'ai_generated' => true/false,
        'created_at' => '...',
        'format_version' => '1.0'
    ]
];
```

### **Scenario 3: Backward Compatibility**

**Test**: Existing workouts should still work

**Validation Steps**:
1. Retrieve existing workouts with old formats
2. Verify no fatal errors occur
3. Check that data is normalized properly
4. Ensure frontend displays correctly

---

## **🔍 Debugging Procedures**

### **Issue: 500 Errors in Workout Grid**

**Debugging Steps**:
1. **Check WordPress Error Logs**:
   ```bash
   tail -f /path/to/wordpress/wp-content/debug.log | grep FitCopilot
   ```

2. **Inspect Network Tab**:
   - Open browser dev tools
   - Visit workout grid page
   - Check Network tab for failed API calls
   - Look for 500 responses instead of JSON

3. **Test Individual Workouts**:
   ```bash
   # Test specific workout
   curl -s "http://your-site.local/wp-json/fitcopilot/v1/workouts/123" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Check Database**:
   ```sql
   SELECT post_id, meta_value 
   FROM wp_postmeta 
   WHERE meta_key = '_workout_data' 
   LIMIT 5;
   ```

### **Issue: Data Format Inconsistencies**

**Debugging Steps**:
1. **Audit Existing Data**:
   ```php
   // Run this in WordPress admin
   $workouts = get_posts(['post_type' => 'fc_workout', 'numberposts' => 10]);
   foreach ($workouts as $workout) {
       $data = get_post_meta($workout->ID, '_workout_data', true);
       $decoded = json_decode($data, true);
       echo "Workout {$workout->ID}: " . print_r(array_keys($decoded), true);
   }
   ```

2. **Check Endpoint Implementation**:
   ```bash
   # Verify standardized format is implemented
   grep -n "standardized_workout" src/php/API/WorkoutEndpoints/*.php
   ```

3. **Test Data Normalization**:
   ```php
   // Test the normalization method
   $test_data = ['exercises' => [...]];
   $result = FitCopilot\API\WorkoutEndpoints\Utilities::get_workout($post_id, $user_id);
   var_dump($result['workout_data']);
   ```

### **Issue: API Endpoints Not Working**

**Debugging Steps**:
1. **Check Plugin Active**:
   ```bash
   # Via WP-CLI
   wp plugin list | grep fitcopilot
   ```

2. **Verify Route Registration**:
   ```bash
   curl -s "http://your-site.local/wp-json/fitcopilot/v1/" | jq '.routes | keys'
   ```

3. **Check Bootstrap Loading**:
   ```php
   // Add to src/php/bootstrap.php for debugging
   error_log('FitCopilot bootstrap loaded');
   ```

4. **Test Endpoint Classes**:
   ```php
   // Check if classes exist
   var_dump(class_exists('FitCopilot\\API\\WorkoutEndpoints\\GenerateEndpoint'));
   ```

---

## **📊 Test Results Interpretation**

### **✅ Success Indicators**

1. **API Tests**: All endpoint status codes are correct (200, 401, 404)
2. **Defensive Programming**: All data formats handled without fatal errors
3. **Frontend Loading**: Workout grid loads without JavaScript errors
4. **Data Consistency**: New workouts use standardized format
5. **Error Logs**: Only informational messages, no fatal errors

### **❌ Failure Indicators**

1. **500 Errors**: PHP fatal errors in workout retrieval
2. **JavaScript Errors**: Frontend console errors about JSON parsing
3. **Missing Data**: Workout data appears empty or malformed
4. **Inconsistent Format**: New workouts don't follow standard structure
5. **Route Missing**: API endpoints return 404

### **⚠️ Warning Indicators**

1. **Format Variations**: Multiple data formats detected (expected during transition)
2. **Missing Metadata**: Old workouts without format version (expected)
3. **Performance Issues**: Slow loading (may indicate excessive normalization)

---

## **🚀 Test Execution Workflow**

### **Quick Validation (5 minutes)**
```bash
# 1. Check basic functionality
curl -s "http://your-site.local/wp-json/fitcopilot/v1/debug"

# 2. Check endpoints are registered
./tests/manual/api-endpoint-tests.sh

# 3. Visit workout grid in browser
# Look for JavaScript errors in console
```

### **Comprehensive Testing (30 minutes)**
```bash
# 1. Run comprehensive tests
# Access: http://your-site.local/wp-content/plugins/Fitcopilot-Generator/tests/manual/phase1-stabilization-tests.php

# 2. Test frontend workflows
# - Generate new workout
# - View saved workouts
# - Edit existing workout

# 3. Check error logs
tail -50 /path/to/wordpress/wp-content/debug.log
```

### **Deep Debugging (when issues found)**
1. **Isolate the Problem**: Which specific workflow fails?
2. **Check Error Logs**: Look for PHP errors and stack traces
3. **Inspect Data**: Check database for problematic workout data
4. **Test Components**: Test individual classes and methods
5. **Verify Fix**: Re-run comprehensive tests after fixes

---

## **📝 Test Documentation Template**

When running tests, document results using this template:

```markdown
## Test Run: [Date]

### Environment
- WordPress Version: 
- Plugin Version: 
- PHP Version: 
- Test Type: [Quick/Comprehensive/Debug]

### Results
- API Endpoint Tests: [Pass/Fail] - [X]/[Y] tests passed
- Defensive Programming: [Pass/Fail] - Details: 
- Frontend Loading: [Pass/Fail] - Errors: 
- Data Format Consistency: [Pass/Fail] - Issues: 

### Issues Found
1. [Issue description] - Status: [Fixed/Investigating/Pending]
2. [Issue description] - Status: [Fixed/Investigating/Pending]

### Next Steps
- [ ] [Action item]
- [ ] [Action item]
```

---

## **🔄 Continuous Testing**

### **After Code Changes**
1. Run quick validation tests
2. Check browser console for errors
3. Verify error logs are clean

### **Before Deployment**
1. Run comprehensive test suite
2. Test all user workflows manually
3. Verify database consistency
4. Check performance impact

### **Post-Deployment**
1. Monitor error logs
2. Test critical user workflows
3. Check API response times
4. Validate data integrity

---

**🎯 Success Criteria**: All tests pass, no 500 errors, frontend loads correctly, data formats are consistent. 