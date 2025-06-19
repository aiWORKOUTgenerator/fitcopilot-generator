/**
 * Debug Script for Profile Loading Issues
 * 
 * This script helps debug and test the profile loading functionality
 * to identify data structure mismatches and field mapping issues.
 */

(function() {
    'use strict';
    
    console.log('🔧 Profile Loading Debug Script Started...');
    
    /**
     * Test profile loading functionality
     */
    function testProfileLoading() {
        console.log('📋 Testing Profile Loading...');
        
        // Check if PromptBuilder exists
        if (!window.PromptBuilder) {
            console.error('❌ PromptBuilder not found on window object');
            return;
        }
        
        // Check if required functions exist
        const requiredFunctions = ['loadUserProfile', 'populateFormWithProfile'];
        for (const funcName of requiredFunctions) {
            if (typeof window.PromptBuilder[funcName] !== 'function') {
                console.error(`❌ Function ${funcName} not found in PromptBuilder`);
                return;
            }
        }
        
        console.log('✅ PromptBuilder functions found');
        
        // Test form field existence
        testFormFields();
        
        // Mock profile data structures for testing
        testDataStructures();
    }
    
    /**
     * Test form field existence
     */
    function testFormFields() {
        console.log('🔍 Testing Form Fields...');
        
        const expectedFields = [
            // Basic info fields (from HTML)
            'firstName', 'lastName', 'age', 'gender', 'fitnessLevel', 'weight', 'weightUnit',
            // Session parameters
            'testDuration', 'testFocus', 'energyLevel', 'stressLevel',
            // Notes
            'limitationNotes', 'customNotes'
        ];
        
        const missingFields = [];
        const foundFields = [];
        
        expectedFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                foundFields.push(fieldId);
            } else {
                missingFields.push(fieldId);
            }
        });
        
        console.log(`✅ Found fields (${foundFields.length}):`, foundFields);
        if (missingFields.length > 0) {
            console.warn(`⚠️ Missing fields (${missingFields.length}):`, missingFields);
        }
        
        // Test checkbox groups
        testCheckboxGroups();
    }
    
    /**
     * Test checkbox groups
     */
    function testCheckboxGroups() {
        console.log('☑️ Testing Checkbox Groups...');
        
        const checkboxGroups = [
            'goals[]',
            'availableEquipment[]', 
            'limitations[]'
        ];
        
        checkboxGroups.forEach(groupName => {
            const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
            console.log(`${groupName}: ${checkboxes.length} checkboxes found`);
            
            if (checkboxes.length === 0) {
                console.warn(`⚠️ No checkboxes found for ${groupName}`);
            }
        });
    }
    
    /**
     * Test different data structures
     */
    function testDataStructures() {
        console.log('🧪 Testing Data Structures...');
        
        // Test structure 1: Nested basic_info
        const testData1 = {
            success: true,
            data: {
                basic_info: {
                    name: 'John Doe',
                    first_name: 'John',
                    last_name: 'Doe',
                    age: 30,
                    gender: 'male',
                    fitness_level: 'intermediate',
                    weight: 180
                },
                goals: ['strength', 'muscle_building'],
                availableEquipment: ['dumbbells', 'barbell'],
                session_params: {
                    duration: 45,
                    focus: 'strength',
                    energy_level: 4,
                    stress_level: 2
                }
            }
        };
        
                 // Test structure 2: Flat structure (explicit first/last name only)
         const testData2 = {
             success: true,
             data: {
                 first_name: 'John',
                 last_name: 'Doe',
                 user_email: 'john@example.com',
                 age: 30,
                 gender: 'male',
                 fitness_level: 'intermediate'
             }
         };
        
                 // Test structure 3: Profile data wrapper (explicit first/last name only)
         const testData3 = {
             success: true,
             data: {
                 profile_data: {
                     basic_info: {
                         first_name: 'John',
                         last_name: 'Doe',
                         age: 30,
                         gender: 'male'
                     }
                 }
             }
         };
        
        console.log('Testing different data structures...');
        
        // Test each structure
        [testData1, testData2, testData3].forEach((testData, index) => {
            console.log(`\n📊 Testing Structure ${index + 1}:`);
            console.log('Data:', testData);
            
            try {
                window.PromptBuilder.populateFormWithProfile(testData.data);
                console.log(`✅ Structure ${index + 1} processed successfully`);
                
                // Check what got populated
                checkPopulatedFields();
                
            } catch (error) {
                console.error(`❌ Structure ${index + 1} failed:`, error);
            }
        });
    }
    
    /**
     * Check which fields got populated
     */
    function checkPopulatedFields() {
        console.log('🔍 Checking populated fields...');
        
        const fieldsToCheck = ['firstName', 'lastName', 'age', 'gender', 'fitnessLevel'];
        const populated = {};
        
        fieldsToCheck.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value) {
                populated[fieldId] = field.value;
            }
        });
        
        console.log('Populated fields:', populated);
        return populated;
    }
    
    /**
     * Monitor actual AJAX responses
     */
    function monitorAjaxResponses() {
        console.log('📡 Setting up AJAX response monitoring...');
        
        // Override jQuery AJAX to monitor profile loading
        const originalAjax = jQuery.ajax;
        jQuery.ajax = function(options) {
            if (options.data && options.data.action === 'fitcopilot_prompt_builder_load_profile') {
                console.log('🔄 Profile loading AJAX request intercepted');
                console.log('Request options:', options);
                
                const originalSuccess = options.success;
                options.success = function(response) {
                    console.log('📥 Profile loading AJAX response:', response);
                    console.log('Response type:', typeof response);
                    console.log('Response structure:', Object.keys(response || {}));
                    
                    if (response && response.data) {
                        console.log('Response data structure:', Object.keys(response.data));
                        console.log('Full response data:', response.data);
                    }
                    
                    if (originalSuccess) {
                        originalSuccess.apply(this, arguments);
                    }
                };
                
                const originalError = options.error;
                options.error = function(xhr, status, error) {
                    console.error('❌ Profile loading AJAX error:', {xhr, status, error});
                    
                    if (originalError) {
                        originalError.apply(this, arguments);
                    }
                };
            }
            
            return originalAjax.apply(this, arguments);
        };
        
        console.log('✅ AJAX monitoring set up');
    }
    
    /**
     * Test button click
     */
    function testButtonClick() {
        console.log('🖱️ Testing Load Profile Button...');
        
        const button = document.getElementById('load-profile');
        if (button) {
            console.log('✅ Load profile button found');
            console.log('Button state:', {
                disabled: button.disabled,
                text: button.textContent,
                visible: button.offsetParent !== null
            });
            
            // Add click listener for testing
            button.addEventListener('click', function() {
                console.log('🖱️ Load profile button clicked!');
            });
            
        } else {
            console.error('❌ Load profile button not found');
            
            // Look for alternative button IDs
            const alternativeIds = ['load-profile-btn', 'loadProfile', 'load_profile'];
            alternativeIds.forEach(id => {
                const altButton = document.getElementById(id);
                if (altButton) {
                    console.log(`Found alternative button with ID: ${id}`);
                }
            });
        }
    }
    
    /**
     * Run all debug tests
     */
    function runAllDebugTests() {
        console.log('🚀 Running All Profile Loading Debug Tests...');
        
        testProfileLoading();
        testButtonClick();
        monitorAjaxResponses();
        
        console.log('\n📋 Debug Test Summary:');
        console.log('=====================================');
        console.log('✅ Profile loading functions checked');
        console.log('✅ Form fields verified');
        console.log('✅ Data structures tested'); 
        console.log('✅ Button functionality checked');
        console.log('✅ AJAX monitoring enabled');
        console.log('\n💡 Tips for debugging:');
        console.log('1. Check browser console for detailed logs');
        console.log('2. Try clicking "Load Profile" to see actual data structure');
        console.log('3. Look for field mapping mismatches in the logs');
        console.log('4. Verify backend is returning expected data format');
    }
    
    // Auto-run tests
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllDebugTests);
    } else {
        setTimeout(runAllDebugTests, 1000);
    }
    
    // Export for manual execution
    window.debugProfileLoading = runAllDebugTests;
    window.testProfileStructure = testDataStructures;
    window.monitorProfileAjax = monitorAjaxResponses;
    
    console.log('🔧 Profile Loading Debug Script initialized. Tests will run automatically.');
    console.log('Manual functions available: window.debugProfileLoading(), window.testProfileStructure()');
    
})(); 