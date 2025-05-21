<?php
/**
 * WorkoutEndpoints Test
 * 
 * Tests for the standardized workout API endpoints
 */

namespace FitCopilot\Tests\API;

use FitCopilot\API\WorkoutEndpoints;
use FitCopilot\API\APIUtils;
use WP_UnitTestCase;
use WP_REST_Request;
use WP_REST_Response;
use ReflectionClass;

class WorkoutEndpointsTest extends WP_UnitTestCase {
    /**
     * @var WorkoutEndpoints
     */
    private $endpoints;
    
    /**
     * @var int
     */
    private $user_id;
    
    /**
     * @var int
     */
    private $workout_id;
    
    /**
     * Set up
     */
    public function setUp(): void {
        parent::setUp();
        
        // Create a test user
        $this->user_id = $this->factory->user->create([
            'role' => 'subscriber',
        ]);
        
        // Set current user
        wp_set_current_user($this->user_id);
        
        // Create a test workout
        $this->workout_id = wp_insert_post([
            'post_title'  => 'Test Workout',
            'post_type'   => 'wg_workout',
            'post_status' => 'publish',
            'post_author' => $this->user_id,
        ]);
        
        // Add workout metadata
        update_post_meta($this->workout_id, '_workout_difficulty', 'intermediate');
        update_post_meta($this->workout_id, '_workout_duration', 30);
        update_post_meta($this->workout_id, '_workout_equipment', ['dumbbells']);
        update_post_meta($this->workout_id, '_workout_goals', 'strength');
        update_post_meta($this->workout_id, '_workout_data', wp_json_encode([
            'title' => 'Test Workout',
            'exercises' => [
                ['name' => 'Push-ups', 'sets' => 3, 'reps' => 10],
            ],
        ]));
        
        // Create the endpoint class
        $this->endpoints = new WorkoutEndpoints();
    }
    
    /**
     * Test that generate_workout() accepts wrapped format
     */
    public function test_generate_workout_accepts_wrapped_format() {
        // Mock the OpenAI provider
        $this->mock_openai_provider();
        
        // Create a request with wrapped format
        $request = new WP_REST_Request('POST', '/fitcopilot/v1/generate');
        $request->set_body(wp_json_encode([
            'workout' => [
                'duration' => 30,
                'difficulty' => 'intermediate',
                'equipment' => ['dumbbells'],
                'goals' => 'strength',
                'specific_request' => 'A quick HIIT workout',
            ]
        ]));
        
        // Call the method
        $response = $this->endpoints->generate_workout($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout created successfully', $data['message']);
        $this->assertArrayHasKey('workout', $data['data']);
    }
    
    /**
     * Test that generate_workout() accepts direct format
     */
    public function test_generate_workout_accepts_direct_format() {
        // Mock the OpenAI provider
        $this->mock_openai_provider();
        
        // Create a request with direct format
        $request = new WP_REST_Request('POST', '/fitcopilot/v1/generate');
        $request->set_body(wp_json_encode([
            'duration' => 30,
            'difficulty' => 'intermediate',
            'equipment' => ['dumbbells'],
            'goals' => 'strength',
            'specific_request' => 'A quick HIIT workout',
        ]));
        
        // Call the method
        $response = $this->endpoints->generate_workout($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout created successfully', $data['message']);
        $this->assertArrayHasKey('workout', $data['data']);
    }
    
    /**
     * Test that get_workouts() returns standardized response
     */
    public function test_get_workouts_returns_standardized_response() {
        // Create a request
        $request = new WP_REST_Request('GET', '/fitcopilot/v1/workouts');
        
        // Call the method
        $response = $this->endpoints->get_workouts($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout list retrieved successfully', $data['message']);
        $this->assertIsArray($data['data']);
    }
    
    /**
     * Test that get_workout() returns standardized response
     */
    public function test_get_workout_returns_standardized_response() {
        // Create a request
        $request = new WP_REST_Request('GET', '/fitcopilot/v1/workouts/' . $this->workout_id);
        $request->set_param('id', $this->workout_id);
        
        // Call the method
        $response = $this->endpoints->get_workout($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout retrieved successfully', $data['message']);
        $this->assertEquals($this->workout_id, $data['data']['id']);
    }
    
    /**
     * Test that update_workout() accepts wrapped format
     */
    public function test_update_workout_accepts_wrapped_format() {
        // Create a request with wrapped format
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/workouts/' . $this->workout_id);
        $request->set_param('id', $this->workout_id);
        $request->set_body(wp_json_encode([
            'workout' => [
                'title' => 'Updated Workout',
                'difficulty' => 'advanced',
            ]
        ]));
        
        // Call the method
        $response = $this->endpoints->update_workout($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout updated successfully', $data['message']);
        
        // Check that the data was updated
        $post = get_post($this->workout_id);
        $this->assertEquals('Updated Workout', $post->post_title);
        $this->assertEquals('advanced', get_post_meta($this->workout_id, '_workout_difficulty', true));
    }
    
    /**
     * Test that update_workout() accepts direct format
     */
    public function test_update_workout_accepts_direct_format() {
        // Create a request with direct format
        $request = new WP_REST_Request('PUT', '/fitcopilot/v1/workouts/' . $this->workout_id);
        $request->set_param('id', $this->workout_id);
        $request->set_body(wp_json_encode([
            'title' => 'Directly Updated Workout',
            'duration' => 45,
        ]));
        
        // Call the method
        $response = $this->endpoints->update_workout($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout updated successfully', $data['message']);
        
        // Check that the data was updated
        $post = get_post($this->workout_id);
        $this->assertEquals('Directly Updated Workout', $post->post_title);
        $this->assertEquals(45, get_post_meta($this->workout_id, '_workout_duration', true));
    }
    
    /**
     * Test that complete_workout() accepts wrapped format
     */
    public function test_complete_workout_accepts_wrapped_format() {
        // Create a request with wrapped format
        $request = new WP_REST_Request('POST', '/fitcopilot/v1/workouts/' . $this->workout_id . '/complete');
        $request->set_param('id', $this->workout_id);
        $request->set_body(wp_json_encode([
            'completion' => [
                'rating' => 4,
                'feedback' => 'Great workout!',
            ]
        ]));
        
        // Call the method
        $response = $this->endpoints->complete_workout($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout completed successfully', $data['message']);
        $this->assertArrayHasKey('completion_date', $data['data']);
        
        // Check that completion data was saved
        $completions = get_post_meta($this->workout_id, '_workout_completions', true);
        $this->assertIsArray($completions);
        $this->assertEquals(1, count($completions));
        $this->assertEquals(4, $completions[0]['rating']);
        $this->assertEquals('Great workout!', $completions[0]['feedback']);
    }
    
    /**
     * Test that complete_workout() accepts direct format
     */
    public function test_complete_workout_accepts_direct_format() {
        // Reset completions
        update_post_meta($this->workout_id, '_workout_completions', []);
        
        // Create a request with direct format
        $request = new WP_REST_Request('POST', '/fitcopilot/v1/workouts/' . $this->workout_id . '/complete');
        $request->set_param('id', $this->workout_id);
        $request->set_body(wp_json_encode([
            'rating' => 5,
            'duration_actual' => 25,
        ]));
        
        // Call the method
        $response = $this->endpoints->complete_workout($request);
        
        // Assert
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $data = $response->get_data();
        $this->assertTrue($data['success']);
        $this->assertEquals('Workout completed successfully', $data['message']);
        
        // Check that completion data was saved
        $completions = get_post_meta($this->workout_id, '_workout_completions', true);
        $this->assertIsArray($completions);
        $this->assertEquals(1, count($completions));
        $this->assertEquals(5, $completions[0]['rating']);
        $this->assertEquals(25, $completions[0]['duration_actual']);
    }
    
    /**
     * Mock the OpenAI provider for testing
     */
    private function mock_openai_provider() {
        // Define a mocked workout response
        $mock_workout = [
            'title' => 'Test Generated Workout',
            'description' => 'This is a test workout.',
            'exercises' => [
                ['name' => 'Push-ups', 'sets' => 3, 'reps' => 10],
                ['name' => 'Squats', 'sets' => 3, 'reps' => 15],
            ],
            'calories_burned' => 300,
            'metadata' => ['difficulty' => 'intermediate'],
            'sections' => [
                ['title' => 'Warm-up', 'exercises' => []],
                ['title' => 'Main workout', 'exercises' => []],
                ['title' => 'Cool-down', 'exercises' => []],
            ],
        ];
        
        // Create a mock method to replace generateWorkout
        add_filter('pre_http_request', function($preempt, $args, $url) use ($mock_workout) {
            if (strpos($url, 'openai.com') !== false) {
                return [
                    'body' => wp_json_encode([
                        'choices' => [
                            [
                                'message' => [
                                    'content' => wp_json_encode($mock_workout),
                                ],
                            ],
                        ],
                    ]),
                    'response' => [
                        'code' => 200,
                    ],
                ];
            }
            return $preempt;
        }, 10, 3);
        
        // Add a dummy API key
        update_option('fitcopilot_openai_api_key', 'test_api_key');
    }
} 