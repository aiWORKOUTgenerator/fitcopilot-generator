# 📐 **FitCopilot Workout Data Standard Format**

## **Overview**
This document defines the standardized format for storing workout data in the `_workout_data` meta field to ensure consistency across all endpoints and prevent data structure conflicts.

**Version**: 1.0  
**Last Updated**: 2025-05-30  
**Effective**: Immediately for all new workout storage  

---

## **Standard Data Structure**

All workout data stored in `_workout_data` meta field MUST follow this exact structure:

```php
$workout_data = [
    'title' => 'Workout Title',
    'exercises' => [
        [
            'name' => 'Exercise Name',
            'sets' => 3,
            'reps' => 10,
            'duration' => '30 seconds', // optional
            'rest' => '60 seconds',     // optional
            'instructions' => 'Exercise instructions', // optional
            'equipment' => ['dumbbells'], // optional
            // ... other exercise-specific fields
        ],
        // ... more exercises
    ],
    'sections' => [
        [
            'name' => 'Warm-up',
            'exercises' => [/* exercise indices or objects */],
            'duration' => 300, // optional, in seconds
        ],
        // ... more sections
    ],
    'duration' => 30,                    // workout duration in minutes
    'difficulty' => 'intermediate',      // beginner|intermediate|advanced
    'equipment' => ['dumbbells', 'mat'], // array of equipment needed
    'goals' => ['strength', 'cardio'],   // array of fitness goals
    'restrictions' => 'knee injury',     // health restrictions/limitations
    'metadata' => [
        'ai_generated' => true,          // boolean: true for AI, false for manual
        'created_at' => '2025-05-30 18:00:00', // MySQL datetime
        'format_version' => '1.0',       // version of this format specification
        
        // For AI-generated workouts:
        'generation_params' => [
            'specific_request' => 'User request text',
            'duration' => 30,
            'difficulty' => 'intermediate',
            // ... original generation parameters
        ],
        'openai_model' => 'gpt-4',       // AI model used
        
        // For manually created workouts:
        'manually_created' => true,      // boolean flag
        
        // Optional metadata:
        'last_modified' => '2025-05-30 18:30:00',
        'modified_by' => 123,            // user ID
        'tags' => ['quick', 'home'],     // optional tags
        'notes' => 'Special instructions', // optional notes
    ]
];
```

---

## **Implementation Guidelines**

### **For All Endpoints That Store Workout Data:**

#### **1. Use Consistent Structure**
Every endpoint MUST use the exact structure defined above when storing workout data.

#### **2. Required Fields**
- `title` (string)
- `exercises` (array)
- `sections` (array, can be empty)
- `metadata` (array with required subfields)

#### **3. Metadata Requirements**
- `ai_generated` (boolean) - REQUIRED
- `created_at` (MySQL datetime) - REQUIRED  
- `format_version` (string) - REQUIRED, currently '1.0'

### **For AI-Generated Workouts (GenerateEndpoint):**
```php
$standardized_workout = [
    'title' => $workout['title'] ?? __('Generated Workout', 'fitcopilot'),
    'exercises' => $workout['exercises'] ?? [],
    'sections' => $workout['sections'] ?? [],
    'duration' => $workout['duration'] ?? $params['duration'],
    'difficulty' => $workout['difficulty'] ?? $params['difficulty'],
    'equipment' => $workout['equipment'] ?? $params['equipment'],
    'goals' => $workout['goals'] ?? $params['goals'],
    'restrictions' => $workout['restrictions'] ?? $params['restrictions'],
    'metadata' => [
        'ai_generated' => true,
        'created_at' => current_time('mysql'),
        'generation_params' => $params,
        'openai_model' => $workout['model'] ?? 'unknown',
        'format_version' => '1.0'
    ]
];

update_post_meta($post_id, '_workout_data', wp_json_encode($standardized_workout));
```

### **For Manually Created Workouts (WorkoutRetrievalEndpoint):**
```php
$standardized_workout = [
    'title' => $params['title'],
    'exercises' => $params['exercises'] ?? [],
    'sections' => $params['sections'] ?? [],
    'duration' => $params['duration'] ?? 30,
    'difficulty' => $params['difficulty'] ?? 'intermediate',
    'equipment' => $params['equipment'] ?? [],
    'goals' => $params['goals'] ?? [],
    'restrictions' => $params['restrictions'] ?? '',
    'metadata' => [
        'ai_generated' => false,
        'created_at' => current_time('mysql'),
        'manually_created' => true,
        'format_version' => '1.0'
    ]
];

update_post_meta($post_id, '_workout_data', wp_json_encode($standardized_workout));
```

---

## **Data Validation**

### **Before Storing:**
1. Validate that all required fields are present
2. Ensure `exercises` is an array (even if empty)
3. Verify `metadata.format_version` is set to current version
4. Sanitize all user-provided data

### **When Retrieving:**
The `Utilities::normalize_workout_data()` method handles legacy formats and provides fallbacks for invalid data.

---

## **Migration Strategy**

### **Existing Data:**
- The `Utilities::get_workout()` method includes defensive programming to handle old formats
- Legacy data is automatically normalized when retrieved
- No immediate migration required - system handles mixed formats gracefully

### **Future Updates:**
- When format version changes, increment `format_version`
- Update normalization logic in `Utilities::normalize_workout_data()`
- Maintain backward compatibility

---

## **Error Handling**

### **Invalid Data:**
- JSON decode errors are logged and default structure returned
- Missing required fields are populated with safe defaults
- All errors logged with "FitCopilot:" prefix for easy identification

### **Logging:**
```php
error_log("FitCopilot: Workout {$post_id} using format {$format_detected}");
error_log("FitCopilot: Invalid JSON in _workout_data for post {$post_id}: " . json_last_error_msg());
```

---

## **Testing Verification**

To verify standard format implementation:

1. Create AI-generated workout → Check `_workout_data` structure
2. Create manual workout → Check `_workout_data` structure  
3. Retrieve workouts → Verify consistent structure returned
4. Check error logs for format detection messages

---

## **Compliance Checklist**

- [ ] All storage endpoints use standardized structure
- [ ] Required metadata fields are populated
- [ ] Format version is set correctly
- [ ] Error handling is implemented
- [ ] Legacy data compatibility maintained
- [ ] Testing completed successfully

---

**⚠️ Important**: Do NOT store workout data in any format other than this standardized structure. Inconsistent formats cause retrieval errors and frontend crashes. 