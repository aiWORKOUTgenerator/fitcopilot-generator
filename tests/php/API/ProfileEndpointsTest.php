<?php
/**
 * Profile Endpoints Test
 * 
 * Tests for Profile API endpoints
 */

namespace FitCopilot\Tests\API;

use WP_UnitTestCase;
use WP_REST_Request;
use WP_REST_Response;
use FitCopilot\API\ProfileEndpoints;
use FitCopilot\API\APIUtils;

/**
 * ProfileEndpoints Test Class
 */
class ProfileEndpointsTest extends WP_UnitTestCase {
    /**
     * @var int User ID for tests
     */
    protected $user_id;

    /**
     * @var ProfileEndpoints Profile endpoints instance
     */
    protected $profile_endpoints;

    /**
     * Set up test environment
     */
    public function setUp(): void {
        parent::setUp();
        
        // Create a test user
        $this->user_id = $this->factory->user->create([
            'role' => 'subscriber',
        ]);
        
        // Set current user to the test user
        wp_set_current_user($this->user_id);

        // Create an instance of the ProfileEndpoints class
        $this->profile_endpoints = new ProfileEndpoints();
    }

    /**
     * Clean up after tests
     */
    public function tearDown(): void {
        parent::tearDown();
        
        // Reset current user
        wp_set_current_user(0);

        // Clean up user meta data with new prefixed keys
        delete_user_meta($this->user_id, '_profile_fitness_level');
        delete_user_meta($this->user_id, '_profile_workout_goals');
        delete_user_meta($this->user_id, '_profile_equipment');
        delete_user_meta($this->user_id, '_profile_frequency');
        delete_user_meta($this->user_id, '_profile_duration');
        delete_user_meta($this->user_id, '_profile_preferences');
        delete_user_meta($this->user_id, '_profile_medical_conditions');
        delete_user_meta($this->user_id, '_profile_created_at');
        delete_user_meta($this->user_id, '_profile_updated_at');

        // Clean up legacy user meta data
        delete_user_meta($this->user_id, 'fitness_level');
        delete_user_meta($this->user_id, 'workout_goals');
        delete_user_meta($this->user_id, 'equipment_available');
        delete_user_meta($this->user_id, 'workout_frequency');
        delete_user_meta($this->user_id, 'workout_duration');
        delete_user_meta($this->user_id, 'fitness_preferences');
        delete_user_meta($this->user_id, 'medical_conditions');
        delete_user_meta($this->user_id, 'profile_created_at');
        delete_user_meta($this->user_id, 'profile_updated_at');
    }

    /**
     * Test get_profile method
     */
    public function test_get_profile() {
        // Mock user meta data using new prefixed keys
        update_user_meta($this->user_id, '_profile_fitness_level', 'intermediate');
        update_user_meta($this->user_id, '_profile_workout_goals', ['strength', 'endurance']);
        
        // Create request
        $request = new WP_REST_Request('GET', '/fitcopilot/v1/profile');
        
        // Call method on the ProfileEndpoints instance
        $response = $this->profile_endpoints->get_profile($request);
        
        // Check response structure
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success
        $this->assertTrue($data['success']);
        
        // Check profile data
        $this->assertEquals($this->user_id, $data['data']['id']);
        $this->assertEquals('intermediate', $data['data']['fitnessLevel']);
        $this->assertEquals(['strength', 'endurance'], $data['data']['workoutGoals']);
        $this->assertEquals(APIUtils::get_success_message('get', 'profile'), $data['message']);
    }

    /**
     * Test legacy data migration in get_profile
     */
    public function test_get_profile_legacy_migration() {
        // Mock legacy user meta data
        update_user_meta($this->user_id, 'fitness_level', 'advanced');
        update_user_meta($this->user_id, 'workout_goals', ['cardio']);
        
        // Create request
        $request = new WP_REST_Request('GET', '/fitcopilot/v1/profile');
        
        // Call method
        $response = $this->profile_endpoints->get_profile($request);
        
        // Check data migration
        $this->assertEquals('advanced', get_user_meta($this->user_id, '_profile_fitness_level', true));
        $this->assertEquals(['cardio'], get_user_meta($this->user_id, '_profile_workout_goals', true));
        
        // Check response data
        $data = $response->get_data();
        $this->assertEquals('advanced', $data['data']['fitnessLevel']);
        $this->assertEquals(['cardio'], $data['data']['workoutGoals']);
    }

    /**
     * Test update_profile method with direct format
     */
    public function test_update_profile_direct_format() {
        // Create request with direct format
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body(json_encode([
            'fitnessLevel' => 'advanced',
            'workoutGoals' => ['muscle-building'],
            'workoutDuration' => 45,
        ]));
        
        // Call method
        $response = $this->profile_endpoints->update_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success
        $this->assertTrue($data['success']);
        
        // Verify data was saved with new prefixed keys
        $this->assertEquals('advanced', get_user_meta($this->user_id, '_profile_fitness_level', true));
        $this->assertEquals(['muscle-building'], get_user_meta($this->user_id, '_profile_workout_goals', true));
        $this->assertEquals(45, get_user_meta($this->user_id, '_profile_duration', true));
    }

    /**
     * Test update_profile method with wrapped format
     */
    public function test_update_profile_wrapped_format() {
        // Create request with wrapped format
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body(json_encode([
            'profile' => [
                'fitnessLevel' => 'beginner',
                'workoutGoals' => ['weight-loss'],
                'workoutDuration' => 30,
            ]
        ]));
        
        // Call method
        $response = $this->profile_endpoints->update_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success
        $this->assertTrue($data['success']);
        
        // Verify data was saved with new prefixed keys
        $this->assertEquals('beginner', get_user_meta($this->user_id, '_profile_fitness_level', true));
        $this->assertEquals(['weight-loss'], get_user_meta($this->user_id, '_profile_workout_goals', true));
        $this->assertEquals(30, get_user_meta($this->user_id, '_profile_duration', true));
    }

    /**
     * Test update_profile method with invalid data
     */
    public function test_update_profile_invalid_data() {
        // Create request with invalid data
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body('not-json');
        
        // Call method
        $response = $this->profile_endpoints->update_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for failure
        $this->assertFalse($data['success']);
        $this->assertEquals('profile_update_error', $data['code']);
    }

    /**
     * Test update_profile method with empty data
     */
    public function test_update_profile_empty_data() {
        // Set initial data
        update_user_meta($this->user_id, '_profile_fitness_level', 'intermediate');
        
        // Create request with empty object
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body('{}');
        
        // Call method
        $response = $this->profile_endpoints->update_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success (empty update should not fail)
        $this->assertTrue($data['success']);
        
        // Verify original data was not changed
        $this->assertEquals('intermediate', get_user_meta($this->user_id, '_profile_fitness_level', true));
    }

    /**
     * Test validation in update_profile
     */
    public function test_update_profile_validation() {
        // Create request with invalid values
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body(json_encode([
            'fitnessLevel' => 'super-advanced', // Invalid value
            'workoutFrequency' => 10, // Out of range
            'workoutDuration' => 5, // Out of range
            'workoutGoals' => 'not-an-array' // Wrong type
        ]));
        
        // Call method
        $response = $this->profile_endpoints->update_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for validation error
        $this->assertFalse($data['success']);
        $this->assertEquals('validation_error', $data['code']);
        
        // Verify validation errors for each field
        $this->assertArrayHasKey('fitnessLevel', $data['data']['validation_errors']);
        $this->assertArrayHasKey('workoutFrequency', $data['data']['validation_errors']);
        $this->assertArrayHasKey('workoutDuration', $data['data']['validation_errors']);
        $this->assertArrayHasKey('workoutGoals', $data['data']['validation_errors']);
    }
} 