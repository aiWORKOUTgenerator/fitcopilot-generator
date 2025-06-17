/**
 * Testing Lab Workout Tester Module
 * 
 * Handles workout generation testing and profile-based testing
 */

import { TestIdGenerator, TestingLabUtils } from './config.js';

export class WorkoutTester {
    constructor(apiClient, config) {
        this.apiClient = apiClient;
        this.config = config;
        this.activeTests = new Set();
        this.testResults = new Map();
    }
    
    /**
     * Initialize workout tester
     */
    initialize() {
        this.setupEventListeners();
        this.initializeProfileWorkoutTester();
        this.initializeGridWorkoutTester();
        this.addPresetScenarios();
        this.setupUserSelection();
        this.setupGridUserSelection();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('[WorkoutTester] Setting up event listeners...');
        
        // Profile workout test
        const profileTestBtn = document.getElementById('test-profile-workout-btn');
        if (profileTestBtn) {
            console.log('[WorkoutTester] ✅ Found test-profile-workout-btn, attaching listener');
            profileTestBtn.addEventListener('click', () => {
                console.log('[WorkoutTester] 🎯 Profile test button clicked!');
                this.runProfileWorkoutTest();
            });
        } else {
            console.warn('[WorkoutTester] ❌ test-profile-workout-btn not found in DOM');
        }
        
        // Grid workout test
        const gridTestBtn = document.getElementById('test-grid-workout-btn');
        if (gridTestBtn) {
            console.log('[WorkoutTester] ✅ Found test-grid-workout-btn, attaching listener');
            gridTestBtn.addEventListener('click', () => {
                console.log('[WorkoutTester] 🎯 Grid test button clicked!');
                this.runGridWorkoutTest();
            });
        } else {
            console.warn('[WorkoutTester] ❌ test-grid-workout-btn not found in DOM');
        }
        
        // Clear profile form
        const clearFormBtn = document.getElementById('clear-form-btn');
        if (clearFormBtn) {
            console.log('[WorkoutTester] ✅ Found clear-form-btn, attaching listener');
            clearFormBtn.addEventListener('click', () => {
                console.log('[WorkoutTester] 🧹 Clear button clicked!');
                this.clearProfileForm();
            });
        } else {
            console.warn('[WorkoutTester] ❌ clear-form-btn not found in DOM');
        }
        
        // Clear grid form
        const clearGridFormBtn = document.getElementById('clear-grid-form-btn');
        if (clearGridFormBtn) {
            console.log('[WorkoutTester] ✅ Found clear-grid-form-btn, attaching listener');
            clearGridFormBtn.addEventListener('click', () => {
                console.log('[WorkoutTester] 🧹 Clear grid button clicked!');
                this.clearGridForm();
            });
        } else {
            console.warn('[WorkoutTester] ❌ clear-grid-form-btn not found in DOM');
        }
        
        // Character count for customization textarea
        const customizationTextarea = document.getElementById('workoutCustomization');
        if (customizationTextarea) {
            customizationTextarea.addEventListener('input', (e) => {
                const count = e.target.value.length;
                const countElement = document.getElementById('customization-count');
                if (countElement) {
                    countElement.textContent = count;
                    countElement.style.color = count > 450 ? '#ef4444' : '#10b981';
                }
            });
        }
        
        // Check if workout test form exists
        const testForm = document.getElementById('workout-test-form');
        if (testForm) {
            console.log('[WorkoutTester] ✅ Found workout-test-form');
        } else {
            console.warn('[WorkoutTester] ❌ workout-test-form not found in DOM');
        }
        
        // Check if grid test form exists
        const gridForm = document.getElementById('grid-test-form');
        if (gridForm) {
            console.log('[WorkoutTester] ✅ Found grid-test-form');
        } else {
            console.warn('[WorkoutTester] ❌ grid-test-form not found in DOM');
        }
    }
    
    /**
     * Initialize profile workout tester
     */
    initializeProfileWorkoutTester() {
        const testBtn = document.getElementById('test-profile-workout-btn');
        const clearBtn = document.getElementById('clear-form-btn');
        
        if (testBtn) {
            testBtn.addEventListener('click', () => this.runProfileWorkoutTest());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearProfileForm());
        }
    }
    
    /**
     * Initialize grid workout tester
     */
    initializeGridWorkoutTester() {
        const testBtn = document.getElementById('test-grid-workout-btn');
        const clearBtn = document.getElementById('clear-grid-form-btn');
        
        if (testBtn) {
            testBtn.addEventListener('click', () => this.runGridWorkoutTest());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearGridForm());
        }
    }
    
    /**
     * Run profile-based workout test
     */
    async runProfileWorkoutTest() {
        console.log('[WorkoutTester] 🚀 Starting profile-based workout test...');
        
        const outputDiv = document.getElementById('profile-test-output');
        if (!outputDiv) {
            console.error('[WorkoutTester] ❌ Profile test output div not found');
            return;
        }
        
        console.log('[WorkoutTester] ✅ Found profile-test-output div');
        
        try {
            // Show loading state
            outputDiv.innerHTML = `
                <div class="wg-debug-loading">
                    <div class="loading-spinner"></div>
                    <p>Testing profile-based workout generation...</p>
                </div>
            `;
            
            console.log('[WorkoutTester] 📋 Loading state displayed, collecting profile data...');
            
            // Collect profile data
            const profileData = this.collectProfileFormData();
            
            console.log('[WorkoutTester] 📊 Profile data collected:', profileData);
            
            // Run test
            console.log('[WorkoutTester] 🔄 Making API request...');
            const result = await this.apiClient.testProfileWorkoutGeneration(profileData);
            
            console.log('[WorkoutTester] 📥 API response received:', result);
            
            if (result.success && result.data) {
                console.log('[WorkoutTester] ✅ Test successful, displaying results');
                this.displayProfileTestResults(result.data, outputDiv);
            } else {
                console.log('[WorkoutTester] ❌ Test failed, displaying error');
                this.displayProfileTestError(result.data || 'Test failed', outputDiv);
            }
            
        } catch (error) {
            console.error('[WorkoutTester] 💥 Profile test failed with exception:', error);
            this.displayProfileTestError(error.message, outputDiv);
        }
    }
    
    /**
     * Collect profile form data
     */
    collectProfileFormData() {
        const form = document.getElementById('workout-test-form');
        if (!form) return {};
        
        const formData = new FormData(form);
        
        // Handle height conversion from feet/inches to total inches
        const heightFeet = parseInt(formData.get('height-feet')) || 0;
        const heightInches = parseInt(formData.get('height-inches')) || 0;
        const totalHeight = (heightFeet * 12) + heightInches;
        
        return {
            // Basic Information
            firstName: formData.get('firstName') || 'Test',
            lastName: formData.get('lastName') || 'User',
            email: formData.get('email') || 'test@example.com',
            fitnessLevel: formData.get('fitnessLevel') || 'intermediate',
            goals: formData.getAll('goals[]') || ['strength'],
            
            // Body Metrics
            age: parseInt(formData.get('age')) || 35,
            gender: formData.get('gender') || 'male',
            weight: parseInt(formData.get('weight')) || 180,
            weightUnit: formData.get('weightUnit') || 'lbs',
            height: totalHeight || 72, // Default to 6'0" (72 inches)
            heightUnit: formData.get('heightUnit') || 'ft',
            
            // Equipment & Preferences
            availableEquipment: formData.getAll('availableEquipment[]') || ['bodyweight'],
            preferredLocation: formData.get('preferredLocation') || 'home',
            workoutFrequency: formData.get('workoutFrequency') || '3-4',
            preferredWorkoutDuration: parseInt(formData.get('preferredWorkoutDuration')) || 30,
            
            // Health & Limitations
            limitations: formData.getAll('limitations[]') || [],
            limitationNotes: formData.get('limitationNotes') || '',
            medicalConditions: formData.get('medicalConditions') || '',
            
            // Test Parameters
            testDuration: parseInt(formData.get('testDuration')) || 30,
            testFocus: formData.get('testFocus') || 'strength'
        };
    }
    
    /**
     * Display profile test results
     */
    displayProfileTestResults(data, outputDiv) {
        const html = `
            <div class="wg-debug-results">
                <div class="results-header">
                    <h4>✅ Profile-Based Workout Test Results</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                
                <!-- Profile Summary -->
                <div class="result-section">
                    <h5>👤 Profile Summary</h5>
                    <div class="profile-summary">
                        <div class="profile-item"><strong>Name:</strong> ${TestingLabUtils.escapeHtml(data.profile?.name || 'Not specified')}</div>
                        <div class="profile-item"><strong>Fitness Level:</strong> ${TestingLabUtils.escapeHtml(data.profile?.fitnessLevel || 'Not specified')}</div>
                        <div class="profile-item"><strong>Goals:</strong> ${Array.isArray(data.profile?.goals) ? data.profile.goals.join(', ') : 'Not specified'}</div>
                        <div class="profile-item"><strong>Equipment:</strong> ${Array.isArray(data.profile?.equipment) ? data.profile.equipment.join(', ') : 'Not specified'}</div>
                        <div class="profile-item"><strong>Limitations:</strong> ${TestingLabUtils.escapeHtml(data.profile?.limitations || 'None specified')}</div>
                        <div class="profile-item"><strong>Physical Stats:</strong> ${TestingLabUtils.escapeHtml(data.profile?.physicalStats || 'Not specified')}</div>
                    </div>
                </div>
                
                <!-- System Information -->
                <div class="result-section">
                    <h5>⚙️ System Information</h5>
                    <div class="system-info">
                        <div class="system-item"><strong>Context Type:</strong> ${TestingLabUtils.escapeHtml(data.system?.contextType || 'Unknown')}</div>
                        <div class="system-item"><strong>Strategy:</strong> ${TestingLabUtils.escapeHtml(data.system?.strategy || 'Unknown')}</div>
                        <div class="system-item"><strong>Profile Fields Used:</strong> ${data.system?.profileFieldsCount || 0}</div>
                        <div class="system-item"><strong>Execution Time:</strong> ${data.system?.executionTime || 0}ms</div>
                    </div>
                </div>
                
                <!-- Generated Prompt -->
                <div class="result-section">
                    <h5>📝 Generated Prompt</h5>
                    <div class="prompt-container">
                        <div class="prompt-stats">
                            <span>Length: ${data.prompt ? data.prompt.length : 0} characters</span>
                            <span>Personalized: ${this.hasPersonalization(data.prompt, data.profile) ? 'Yes' : 'No'}</span>
                        </div>
                        <pre class="prompt-content">${TestingLabUtils.escapeHtml(data.prompt || 'No prompt generated')}</pre>
                    </div>
                </div>
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Display profile test error
     */
    displayProfileTestError(message, outputDiv) {
        const html = `
            <div class="wg-debug-error">
                <div class="error-header">
                    <h4>❌ Profile-Based Workout Test Failed</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                <div class="error-content">
                    <p><strong>Error:</strong> ${TestingLabUtils.escapeHtml(message)}</p>
                    <div class="error-suggestions">
                        <h5>Troubleshooting:</h5>
                        <ul>
                            <li>Check that all required profile fields are filled</li>
                            <li>Verify your WordPress configuration</li>
                            <li>Check the browser console for additional errors</li>
                            <li>Ensure the modular prompt system is enabled</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Check if prompt has personalization
     */
    hasPersonalization(prompt, profile) {
        if (!prompt || !profile) return false;
        
        const promptLower = prompt.toLowerCase();
        
        // Check for personal markers
        const markers = [
            profile.name,
            profile.fitnessLevel,
            profile.limitations
        ].filter(Boolean);
        
        return markers.some(marker => 
            promptLower.includes(marker.toLowerCase())
        );
    }
    
    /**
     * Clear profile form
     */
    clearProfileForm() {
        const form = document.getElementById('workout-test-form');
        if (form) {
            form.reset();
        }
        
        const outputDiv = document.getElementById('profile-test-output');
        if (outputDiv) {
            outputDiv.innerHTML = `
                <div class="wg-debug-placeholder">
                    <p>🧪 Ready to test profile-based workout generation</p>
                    <p>Fill in the profile data above and click "Test Profile Workout Generation"</p>
                </div>
            `;
        }
    }
    
    /**
     * Add preset test scenarios
     */
    addPresetScenarios() {
        // This would add preset test data for quick testing
        // Implementation depends on UI requirements
    }
    
    /**
     * Setup user selection functionality
     */
    setupUserSelection() {
        console.log('[WorkoutTester] Setting up user selection...');
        
        const userSelect = document.getElementById('selectedUser');
        const loadUserBtn = document.getElementById('load-user-btn');
        
        if (userSelect) {
            userSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    loadUserBtn.disabled = false;
                    loadUserBtn.onclick = () => this.loadUserProfile(e.target.value);
                } else {
                    loadUserBtn.disabled = true;
                    loadUserBtn.onclick = null;
                }
            });
            console.log('[WorkoutTester] ✅ User selection dropdown initialized');
        } else {
            console.warn('[WorkoutTester] ❌ User selection dropdown not found');
        }
        
        if (loadUserBtn) {
            console.log('[WorkoutTester] ✅ Load user button found');
        } else {
            console.warn('[WorkoutTester] ❌ Load user button not found');
        }
        
        // Make loadUserProfile function globally available for inline onclick
        window.loadUserProfile = (userId) => this.loadUserProfile(userId);
    }
    
    /**
     * Load user profile data from WordPress
     */
    async loadUserProfile(userId) {
        console.log('[WorkoutTester] 🔄 Loading profile for user ID:', userId);
        
        const statusDiv = document.getElementById('user-load-status');
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `
                <div class="loading-message">
                    <span class="loading-spinner"></span>
                    Loading user profile data...
                </div>
            `;
        }
        
        try {
            // Make API request to get user profile data using the new method
            const response = await this.apiClient.getUserProfile(userId);
            
            console.log('[WorkoutTester] 📥 User profile response:', response);
            
            if (response.success && response.data) {
                this.populateFormWithUserData(response.data);
                
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <div class="success-message">
                            ✅ Successfully loaded profile for ${response.data.firstName || 'User'} ${response.data.lastName || ''}
                        </div>
                    `;
                    
                    // Hide status after 3 seconds
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
                }
            } else {
                throw new Error(response.message || 'Failed to load user profile');
            }
            
        } catch (error) {
            console.error('[WorkoutTester] 💥 Failed to load user profile:', error);
            
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="error-message">
                        ❌ Failed to load user profile: ${error.message}
                    </div>
                `;
            }
        }
    }
    
    /**
     * Populate form with user data
     */
    populateFormWithUserData(userData) {
        console.log('[WorkoutTester] 📝 Populating form with user data:', userData);
        
        // Basic Information
        this.setFormValue('firstName', userData.firstName || '');
        this.setFormValue('lastName', userData.lastName || '');
        this.setFormValue('fitnessLevel', userData.fitnessLevel || 'intermediate');
        
        // Handle goals (checkboxes)
        if (userData.goals && Array.isArray(userData.goals)) {
            this.clearCheckboxGroup('goals[]');
            userData.goals.forEach(goal => {
                this.setCheckboxValue('goals[]', goal, true);
            });
        }
        
        // Body Metrics
        this.setFormValue('age', userData.age || '');
        this.setFormValue('gender', userData.gender || '');
        this.setFormValue('weight', userData.weight || '');
        this.setFormValue('weightUnit', userData.weightUnit || 'lbs');
        
        // Handle height conversion from total inches to feet/inches
        if (userData.height) {
            const totalInches = userData.height;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            
            this.setFormValue('height-feet', feet);
            this.setFormValue('height-inches', inches);
        } else {
            // Default to 6'0"
            this.setFormValue('height-feet', 6);
            this.setFormValue('height-inches', 0);
        }
        this.setFormValue('heightUnit', userData.heightUnit || 'ft');
        
        // Equipment & Location
        if (userData.availableEquipment && Array.isArray(userData.availableEquipment)) {
            this.clearCheckboxGroup('availableEquipment[]');
            userData.availableEquipment.forEach(equipment => {
                this.setCheckboxValue('availableEquipment[]', equipment, true);
            });
        }
        this.setFormValue('preferredLocation', userData.preferredLocation || 'home');
        
        // Health Considerations
        if (userData.limitations && Array.isArray(userData.limitations)) {
            this.clearCheckboxGroup('limitations[]');
            userData.limitations.forEach(limitation => {
                this.setCheckboxValue('limitations[]', limitation, true);
            });
        }
        this.setFormValue('limitationNotes', userData.limitationNotes || '');
        this.setFormValue('medicalConditions', userData.medicalConditions || '');
        
        // Workout Preferences
        this.setFormValue('workoutFrequency', userData.workoutFrequency || '3-4');
        this.setFormValue('preferredWorkoutDuration', userData.preferredWorkoutDuration || '30');
        this.setFormValue('favoriteExercises', userData.favoriteExercises || '');
        this.setFormValue('dislikedExercises', userData.dislikedExercises || '');
        
        console.log('[WorkoutTester] ✅ Form populated successfully');
    }
    
    /**
     * Set form value helper
     */
    setFormValue(fieldName, value) {
        const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = value;
        } else {
            console.warn(`[WorkoutTester] Field not found: ${fieldName}`);
        }
    }
    
    /**
     * Set checkbox value helper
     */
    setCheckboxValue(fieldName, value, checked) {
        const checkbox = document.querySelector(`input[name="${fieldName}"][value="${value}"]`);
        if (checkbox) {
            checkbox.checked = checked;
        } else {
            console.warn(`[WorkoutTester] Checkbox not found: ${fieldName}[${value}]`);
        }
    }
    
    /**
     * Clear checkbox group helper
     */
    clearCheckboxGroup(fieldName) {
        const checkboxes = document.querySelectorAll(`input[name="${fieldName}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    /**
     * Run profile + WorkoutGeneratorGrid test
     */
    async runGridWorkoutTest() {
        console.log('[WorkoutTester] 🚀 Starting profile + grid workout test...');
        
        const outputDiv = document.getElementById('grid-test-output');
        if (!outputDiv) {
            console.error('[WorkoutTester] ❌ Grid test output div not found');
            return;
        }
        
        console.log('[WorkoutTester] ✅ Found grid-test-output div');
        
        try {
            // Show loading state
            outputDiv.innerHTML = `
                <div class="wg-debug-loading">
                    <div class="loading-spinner"></div>
                    <p>Testing profile + WorkoutGeneratorGrid generation...</p>
                </div>
            `;
            
            console.log('[WorkoutTester] 📋 Loading state displayed, collecting grid data...');
            
            // Collect combined data
            const gridData = this.collectGridFormData();
            
            console.log('[WorkoutTester] 📊 Grid data collected:', gridData);
            
            // Validate required fields with enhanced debugging
            const durationValue = gridData.sessionInputs?.timeConstraintsToday || gridData.timeConstraintsToday;
            if (!durationValue) {
                console.error('[WorkoutTester] ❌ Duration validation failed');
                console.log('Grid data collected:', gridData);
                console.log('Session inputs:', gridData.sessionInputs);
                console.log('timeConstraintsToday value (direct):', gridData.timeConstraintsToday);
                console.log('timeConstraintsToday value (sessionInputs):', gridData.sessionInputs?.timeConstraintsToday);
                
                // Check form field directly
                const durationField = document.getElementById('timeConstraintsToday');
                if (durationField) {
                    console.log('Duration field value:', durationField.value);
                    console.log('Duration field selected:', durationField.selectedOptions[0]?.textContent);
                } else {
                    console.error('Duration field not found in DOM');
                }
                
                throw new Error(`Duration is required for WorkoutGeneratorGrid testing. Current value: ${durationValue} (type: ${typeof durationValue})`);
            }
            
            // Run test
            console.log('[WorkoutTester] 🔄 Making Grid API request...');
            const result = await this.apiClient.testProfileWorkoutGeneration(gridData);
            
            console.log('[WorkoutTester] 📥 Grid API response received:', result);
            
            if (result.success && result.data) {
                console.log('[WorkoutTester] ✅ Grid test successful, displaying results');
                this.displayGridTestResults(result.data, outputDiv);
            } else {
                console.log('[WorkoutTester] ❌ Grid test failed, displaying error');
                this.displayGridTestError(result.data || 'Grid test failed', outputDiv);
            }
            
        } catch (error) {
            console.error('[WorkoutTester] 💥 Grid test failed with exception:', error);
            this.displayGridTestError(error.message, outputDiv);
        }
    }
    
    /**
     * Collect WorkoutGeneratorGrid form data (profile + grid selections)
     */
    collectGridFormData() {
        const form = document.getElementById('grid-test-form');
        if (!form) return {};
        
        const formData = new FormData(form);
        
        // Handle height conversion from feet/inches to total inches (if using profile data)
        const heightFeet = parseInt(formData.get('height-feet')) || 0;
        const heightInches = parseInt(formData.get('height-inches')) || 0;
        const totalHeight = (heightFeet * 12) + heightInches;
        
        // Collect profile data (same as profile-only test)
        const profileData = {
            // Basic Information
            firstName: formData.get('firstName') || 'Grid',
            lastName: formData.get('lastName') || 'Tester',
            email: formData.get('email') || 'grid@example.com',
            fitnessLevel: formData.get('fitnessLevel') || 'intermediate',
            goals: formData.getAll('goals[]') || ['strength'],
            
            // Body Metrics
            age: parseInt(formData.get('age')) || 35,
            gender: formData.get('gender') || 'male',
            weight: parseInt(formData.get('weight')) || 180,
            weightUnit: formData.get('weightUnit') || 'lbs',
            height: totalHeight || 72, // Default to 6'0" (72 inches)
            heightUnit: formData.get('heightUnit') || 'ft',
            
            // Equipment & Preferences
            availableEquipment: formData.getAll('availableEquipment[]') || ['bodyweight'],
            preferredLocation: formData.get('preferredLocation') || 'home',
            workoutFrequency: formData.get('workoutFrequency') || '3-4',
            preferredWorkoutDuration: parseInt(formData.get('preferredWorkoutDuration')) || 30,
            
            // Health & Limitations
            limitations: formData.getAll('limitations[]') || [],
            limitationNotes: formData.get('limitationNotes') || '',
            medicalConditions: formData.get('medicalConditions') || ''
        };
        
        // Collect WorkoutGeneratorGrid sessionInputs
        const sessionInputs = {
            // Core Workout Setup
            todaysFocus: formData.get('todaysFocus') || null,
            dailyIntensityLevel: formData.get('dailyIntensityLevel') ? parseInt(formData.get('dailyIntensityLevel')) : null,
            timeConstraintsToday: formData.get('timeConstraintsToday') ? parseInt(formData.get('timeConstraintsToday')) : null,
            
            // Equipment & Targeting
            equipmentAvailableToday: formData.getAll('equipmentAvailableToday[]') || [],
            focusArea: formData.getAll('focusArea[]') || [],
            healthRestrictionsToday: formData.getAll('healthRestrictionsToday[]') || [],
            
            // Environment & Daily State
            locationToday: formData.get('locationToday') || null,
            moodLevel: formData.get('moodLevel') ? parseInt(formData.get('moodLevel')) : null,
            energyLevel: formData.get('energyLevel') ? parseInt(formData.get('energyLevel')) : null,
            sleepQuality: formData.get('sleepQuality') ? parseInt(formData.get('sleepQuality')) : null,
            
            // Customization
            workoutCustomization: formData.get('workoutCustomization') || ''
        };
        
        // Debug session inputs data collection
        console.log('[WorkoutTester] 🔍 Debug session inputs:');
        console.log('   - Raw timeConstraintsToday from form:', formData.get('timeConstraintsToday'));
        console.log('   - Parsed timeConstraintsToday:', sessionInputs.timeConstraintsToday);
        console.log('   - Type:', typeof sessionInputs.timeConstraintsToday);
        
        // Combine profile data with session inputs
        const combinedData = {
            ...profileData,
            sessionInputs: sessionInputs,
            testType: 'profile_plus_grid',
            testDuration: sessionInputs.timeConstraintsToday || 30,
            testFocus: sessionInputs.todaysFocus || 'strength'
        };
        
        console.log('[WorkoutTester] 📊 Final combined data timeConstraintsToday:', combinedData.timeConstraintsToday);
        console.log('[WorkoutTester] 📊 Final sessionInputs timeConstraintsToday:', combinedData.sessionInputs.timeConstraintsToday);
        
        return combinedData;
    }
    
    /**
     * Display grid test results
     */
    displayGridTestResults(data, outputDiv) {
        const html = `
            <div class="wg-debug-results">
                <div class="results-header">
                    <h4>✅ Profile + WorkoutGeneratorGrid Test Results</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                
                <!-- Profile Summary -->
                <div class="result-section">
                    <h5>👤 Profile Summary</h5>
                    <div class="profile-summary">
                        <div class="profile-item"><strong>Name:</strong> ${TestingLabUtils.escapeHtml(data.profile?.name || 'Not specified')}</div>
                        <div class="profile-item"><strong>Fitness Level:</strong> ${TestingLabUtils.escapeHtml(data.profile?.fitnessLevel || 'Not specified')}</div>
                        <div class="profile-item"><strong>Goals:</strong> ${Array.isArray(data.profile?.goals) ? data.profile.goals.join(', ') : 'Not specified'}</div>
                        <div class="profile-item"><strong>Equipment:</strong> ${Array.isArray(data.profile?.equipment) ? data.profile.equipment.join(', ') : 'Not specified'}</div>
                        <div class="profile-item"><strong>Limitations:</strong> ${TestingLabUtils.escapeHtml(data.profile?.limitations || 'None specified')}</div>
                        <div class="profile-item"><strong>Physical Stats:</strong> ${TestingLabUtils.escapeHtml(data.profile?.physicalStats || 'Not specified')}</div>
                    </div>
                </div>
                
                <!-- System Information -->
                <div class="result-section">
                    <h5>⚙️ System Information</h5>
                    <div class="system-info">
                        <div class="system-item"><strong>Context Type:</strong> ${TestingLabUtils.escapeHtml(data.system?.contextType || 'Unknown')}</div>
                        <div class="system-item"><strong>Strategy:</strong> ${TestingLabUtils.escapeHtml(data.system?.strategy || 'Unknown')}</div>
                        <div class="system-item"><strong>Profile Fields Used:</strong> ${data.system?.profileFieldsCount || 0}</div>
                        <div class="system-item"><strong>Execution Time:</strong> ${data.system?.executionTime || 0}ms</div>
                    </div>
                </div>
                
                <!-- Generated Prompt -->
                <div class="result-section">
                    <h5>📝 Generated Prompt</h5>
                    <div class="prompt-container">
                        <div class="prompt-stats">
                            <span>Length: ${data.prompt ? data.prompt.length : 0} characters</span>
                            <span>Personalized: ${this.hasPersonalization(data.prompt, data.profile) ? 'Yes' : 'No'}</span>
                        </div>
                        <pre class="prompt-content">${TestingLabUtils.escapeHtml(data.prompt || 'No prompt generated')}</pre>
                    </div>
                </div>
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Display grid test error
     */
    displayGridTestError(message, outputDiv) {
        const html = `
            <div class="wg-debug-error">
                <div class="error-header">
                    <h4>❌ Profile + WorkoutGeneratorGrid Test Failed</h4>
                    <div class="test-timestamp">${new Date().toLocaleString()}</div>
                </div>
                <div class="error-content">
                    <p><strong>Error:</strong> ${TestingLabUtils.escapeHtml(message)}</p>
                    <div class="error-suggestions">
                        <h5>Troubleshooting:</h5>
                        <ul>
                            <li>Check that all required profile fields are filled</li>
                            <li>Verify your WordPress configuration</li>
                            <li>Check the browser console for additional errors</li>
                            <li>Ensure the modular prompt system is enabled</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        outputDiv.innerHTML = html;
    }
    
    /**
     * Clear grid form
     */
    clearGridForm() {
        const form = document.getElementById('grid-test-form');
        if (form) {
            form.reset();
            
            // Reset character count
            const countElement = document.getElementById('customization-count');
            if (countElement) {
                countElement.textContent = '67';
                countElement.style.color = '#10b981';
            }
        }
        
        const outputDiv = document.getElementById('grid-test-output');
        if (outputDiv) {
            outputDiv.innerHTML = `
                <div class="wg-debug-placeholder">
                    <p>🧪 Ready to test profile + WorkoutGeneratorGrid generation</p>
                    <p>Fill in the profile data and select WorkoutGeneratorGrid options above, then click "Test Profile + Grid Workout Generation"</p>
                    <p><strong>Note:</strong> Duration is required for this test mode</p>
                </div>
            `;
        }
    }
    
    /**
     * Setup grid user selection functionality
     */
    setupGridUserSelection() {
        console.log('[WorkoutTester] Setting up grid user selection...');
        
        const userSelect = document.getElementById('gridSelectedUser');
        const loadUserBtn = document.getElementById('grid-load-user-btn');
        
        if (userSelect) {
            userSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    loadUserBtn.disabled = false;
                    loadUserBtn.onclick = () => this.loadGridUserProfile(e.target.value);
                } else {
                    loadUserBtn.disabled = true;
                    loadUserBtn.onclick = null;
                }
            });
            console.log('[WorkoutTester] ✅ Grid user selection dropdown initialized');
        } else {
            console.warn('[WorkoutTester] ❌ Grid user selection dropdown not found');
        }
        
        if (loadUserBtn) {
            console.log('[WorkoutTester] ✅ Grid load user button found');
        } else {
            console.warn('[WorkoutTester] ❌ Grid load user button not found');
        }
        
        // Make loadGridUserProfile function globally available for inline onclick
        window.loadGridUserProfile = (userId) => this.loadGridUserProfile(userId);
    }
    
    /**
     * Load user profile data for grid form
     */
    async loadGridUserProfile(userId) {
        console.log('[WorkoutTester] 🔄 Loading grid profile for user ID:', userId);
        
        const statusDiv = document.getElementById('grid-user-load-status');
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `
                <div class="loading-message">
                    <span class="loading-spinner"></span>
                    Loading user profile data for grid test...
                </div>
            `;
        }
        
        try {
            // Make API request to get user profile data
            const response = await this.apiClient.getUserProfile(userId);
            
            console.log('[WorkoutTester] 📥 Grid user profile response:', response);
            
            if (response.success && response.data) {
                this.populateGridFormWithUserData(response.data);
                
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <div class="success-message">
                            ✅ Successfully loaded profile for ${response.data.firstName || 'User'} ${response.data.lastName || ''} (Grid Test)
                        </div>
                    `;
                    
                    // Hide status after 3 seconds
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
                }
            } else {
                throw new Error(response.message || 'Failed to load user profile for grid test');
            }
            
        } catch (error) {
            console.error('[WorkoutTester] 💥 Failed to load grid user profile:', error);
            
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="error-message">
                        ❌ Failed to load user profile for grid test: ${error.message}
                    </div>
                `;
            }
        }
    }
    
    /**
     * Populate grid form with user data (profile fields only, keep grid selections)
     */
    populateGridFormWithUserData(userData) {
        console.log('[WorkoutTester] 📝 Populating grid form with user data:', userData);
        
        // Only populate profile fields in the grid form, not the WorkoutGeneratorGrid selections
        // This allows testing with real profile data + custom grid selections
        
        // Basic Information (if profile fields exist in grid form)
        this.setGridFormValue('firstName', userData.firstName || '');
        this.setGridFormValue('lastName', userData.lastName || '');
        this.setGridFormValue('fitnessLevel', userData.fitnessLevel || 'intermediate');
        
        // Handle goals (checkboxes) if they exist in grid form
        if (userData.goals && Array.isArray(userData.goals)) {
            this.clearGridCheckboxGroup('goals[]');
            userData.goals.forEach(goal => {
                this.setGridCheckboxValue('goals[]', goal, true);
            });
        }
        
        // Body Metrics (if they exist in grid form)
        this.setGridFormValue('age', userData.age || '');
        this.setGridFormValue('gender', userData.gender || '');
        this.setGridFormValue('weight', userData.weight || '');
        this.setGridFormValue('weightUnit', userData.weightUnit || 'lbs');
        
        // Handle height conversion from total inches to feet/inches (if height fields exist)
        if (userData.height) {
            const totalInches = userData.height;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            
            this.setGridFormValue('height-feet', feet);
            this.setGridFormValue('height-inches', inches);
        } else {
            // Default to 6'0"
            this.setGridFormValue('height-feet', 6);
            this.setGridFormValue('height-inches', 0);
        }
        this.setGridFormValue('heightUnit', userData.heightUnit || 'ft');
        
        // Equipment & Location (if they exist in grid form)
        if (userData.availableEquipment && Array.isArray(userData.availableEquipment)) {
            this.clearGridCheckboxGroup('availableEquipment[]');
            userData.availableEquipment.forEach(equipment => {
                this.setGridCheckboxValue('availableEquipment[]', equipment, true);
            });
        }
        this.setGridFormValue('preferredLocation', userData.preferredLocation || 'home');
        
        // Health Considerations (if they exist in grid form)
        if (userData.limitations && Array.isArray(userData.limitations)) {
            this.clearGridCheckboxGroup('limitations[]');
            userData.limitations.forEach(limitation => {
                this.setGridCheckboxValue('limitations[]', limitation, true);
            });
        }
        this.setGridFormValue('limitationNotes', userData.limitationNotes || '');
        this.setGridFormValue('medicalConditions', userData.medicalConditions || '');
        
        // Workout Preferences (if they exist in grid form)
        this.setGridFormValue('workoutFrequency', userData.workoutFrequency || '3-4');
        this.setGridFormValue('preferredWorkoutDuration', userData.preferredWorkoutDuration || '30');
        this.setGridFormValue('favoriteExercises', userData.favoriteExercises || '');
        this.setGridFormValue('dislikedExercises', userData.dislikedExercises || '');
        
        console.log('[WorkoutTester] ✅ Grid form populated successfully with profile data');
    }
    
    /**
     * Set grid form value helper
     */
    setGridFormValue(fieldName, value) {
        const field = document.getElementById(fieldName) || document.querySelector(`#grid-test-form [name="${fieldName}"]`);
        if (field) {
            field.value = value;
        } else {
            console.warn(`[WorkoutTester] Grid field not found: ${fieldName}`);
        }
    }
    
    /**
     * Set grid checkbox value helper
     */
    setGridCheckboxValue(fieldName, value, checked) {
        const checkbox = document.querySelector(`#grid-test-form input[name="${fieldName}"][value="${value}"]`);
        if (checkbox) {
            checkbox.checked = checked;
        } else {
            console.warn(`[WorkoutTester] Grid checkbox not found: ${fieldName}[${value}]`);
        }
    }
    
    /**
     * Clear grid checkbox group helper
     */
    clearGridCheckboxGroup(fieldName) {
        const checkboxes = document.querySelectorAll(`#grid-test-form input[name="${fieldName}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
} 