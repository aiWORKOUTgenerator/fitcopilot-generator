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

/**
 * ProfileEndpoints Test Class
 */
class ProfileEndpointsTest extends WP_UnitTestCase {
    /**
     * @var int User ID for tests
     */
    protected $user_id;

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
    }

    /**
     * Clean up after tests
     */
    public function tearDown(): void {
        parent::tearDown();
        
        // Reset current user
        wp_set_current_user(0);
    }

    /**
     * Test get_user_profile function
     */
    public function test_get_user_profile() {
        // Mock user meta data
        update_user_meta($this->user_id, 'fitness_level', 'intermediate');
        update_user_meta($this->user_id, 'workout_goals', ['strength', 'endurance']);
        
        // Create request
        $request = new WP_REST_Request('GET', '/fitcopilot/v1/profile');
        
        // Call function
        $response = \FitCopilot\API\get_user_profile($request);
        
        // Check response structure
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success
        $this->assertTrue($data['success']);
        
        // Check profile data
        $this->assertEquals($this->user_id, $data['data']['id']);
        $this->assertEquals('intermediate', $data['data']['fitnessLevel']);
        $this->assertEquals(['strength', 'endurance'], $data['data']['workoutGoals']);
    }

    /**
     * Test update_user_profile with direct format
     */
    public function test_update_user_profile_direct_format() {
        // Create request with direct format
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body(json_encode([
            'fitnessLevel' => 'advanced',
            'workoutGoals' => ['muscle-building'],
            'workoutDuration' => 45,
        ]));
        
        // Call function
        $response = \FitCopilot\API\update_user_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success
        $this->assertTrue($data['success']);
        
        // Verify data was saved
        $this->assertEquals('advanced', get_user_meta($this->user_id, 'fitness_level', true));
        $this->assertEquals(['muscle-building'], get_user_meta($this->user_id, 'workout_goals', true));
        $this->assertEquals(45, get_user_meta($this->user_id, 'workout_duration', true));
    }

    /**
     * Test update_user_profile with wrapped format
     */
    public function test_update_user_profile_wrapped_format() {
        // Create request with wrapped format
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body(json_encode([
            'profile' => [
                'fitnessLevel' => 'beginner',
                'workoutGoals' => ['weight-loss'],
                'workoutDuration' => 30,
            ]
        ]));
        
        // Call function
        $response = \FitCopilot\API\update_user_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success
        $this->assertTrue($data['success']);
        
        // Verify data was saved
        $this->assertEquals('beginner', get_user_meta($this->user_id, 'fitness_level', true));
        $this->assertEquals(['weight-loss'], get_user_meta($this->user_id, 'workout_goals', true));
        $this->assertEquals(30, get_user_meta($this->user_id, 'workout_duration', true));
    }

    /**
     * Test update_user_profile with invalid data
     */
    public function test_update_user_profile_invalid_data() {
        // Create request with invalid data
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body('not-json');
        
        // Call function
        $response = \FitCopilot\API\update_user_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for failure
        $this->assertFalse($data['success']);
        $this->assertEquals('invalid_data', $data['code']);
    }

    /**
     * Test update_user_profile with empty data
     */
    public function test_update_user_profile_empty_data() {
        // Set initial data
        update_user_meta($this->user_id, 'fitness_level', 'intermediate');
        
        // Create request with empty object
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
        $request->set_body('{}');
        
        // Call function
        $response = \FitCopilot\API\update_user_profile($request);
        
        // Check response
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        
        // Check for success (empty update should not fail)
        $this->assertTrue($data['success']);
        
        // Verify original data was not changed
        $this->assertEquals('intermediate', get_user_meta($this->user_id, 'fitness_level', true));
    }
} 