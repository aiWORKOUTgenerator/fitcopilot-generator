<?php
/**
 * API Utilities Test
 * 
 * Tests for API utility functions
 */

namespace FitCopilot\Tests\API;

use FitCopilot\API\APIUtils;
use WP_UnitTestCase;
use WP_REST_Response;

/**
 * APIUtils Test Class
 */
class APIUtilsTest extends WP_UnitTestCase {
    
    /**
     * Test normalize_request_data with wrapper
     */
    public function test_normalize_request_data_with_wrapper() {
        $params = [
            'workout' => [
                'duration' => 30,
                'difficulty' => 'intermediate'
            ]
        ];
        
        $result = APIUtils::normalize_request_data($params, 'workout');
        
        $this->assertEquals([
            'duration' => 30,
            'difficulty' => 'intermediate'
        ], $result);
    }
    
    /**
     * Test normalize_request_data without wrapper
     */
    public function test_normalize_request_data_without_wrapper() {
        $params = [
            'duration' => 30,
            'difficulty' => 'intermediate'
        ];
        
        $result = APIUtils::normalize_request_data($params, 'workout');
        
        $this->assertEquals($params, $result);
    }
    
    /**
     * Test normalize_request_data with null
     */
    public function test_normalize_request_data_with_null() {
        $result = APIUtils::normalize_request_data(null, 'workout');
        
        $this->assertEquals([], $result);
    }
    
    /**
     * Test normalize_request_data with non-array wrapper
     */
    public function test_normalize_request_data_with_non_array_wrapper() {
        $params = [
            'workout' => 'not an array'
        ];
        
        $result = APIUtils::normalize_request_data($params, 'workout');
        
        $this->assertEquals($params, $result);
    }
    
    /**
     * Test create_api_response for success
     */
    public function test_create_api_response_success() {
        $data = ['id' => 1, 'name' => 'Test'];
        $message = 'Success message';
        
        $response = APIUtils::create_api_response($data, $message);
        
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $response_data = $response->get_data();
        
        $this->assertTrue($response_data['success']);
        $this->assertEquals($message, $response_data['message']);
        $this->assertEquals($data, $response_data['data']);
        $this->assertEquals(200, $response->get_status());
        $this->assertArrayNotHasKey('code', $response_data);
    }
    
    /**
     * Test create_api_response for error
     */
    public function test_create_api_response_error() {
        $data = ['field_errors' => ['name' => 'Name is required']];
        $message = 'Error message';
        $code = 'validation_error';
        $status = 400;
        
        $response = APIUtils::create_api_response($data, $message, false, $code, $status);
        
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $response_data = $response->get_data();
        
        $this->assertFalse($response_data['success']);
        $this->assertEquals($message, $response_data['message']);
        $this->assertEquals($data, $response_data['data']);
        $this->assertEquals($code, $response_data['code']);
        $this->assertEquals($status, $response->get_status());
    }
    
    /**
     * Test create_api_response for error without data
     */
    public function test_create_api_response_error_without_data() {
        $message = 'Error message';
        $code = 'not_found';
        $status = 404;
        
        $response = APIUtils::create_api_response(null, $message, false, $code, $status);
        
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $response_data = $response->get_data();
        
        $this->assertFalse($response_data['success']);
        $this->assertEquals($message, $response_data['message']);
        $this->assertEquals($code, $response_data['code']);
        $this->assertEquals($status, $response->get_status());
        $this->assertArrayNotHasKey('data', $response_data);
    }
    
    /**
     * Test create_validation_error
     */
    public function test_create_validation_error() {
        $validation_errors = [
            'name' => 'Name is required',
            'email' => 'Invalid email format'
        ];
        
        $response = APIUtils::create_validation_error($validation_errors);
        
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $response_data = $response->get_data();
        
        $this->assertFalse($response_data['success']);
        $this->assertEquals('Validation failed', $response_data['message']);
        $this->assertEquals('validation_error', $response_data['code']);
        $this->assertEquals(['validation_errors' => $validation_errors], $response_data['data']);
        $this->assertEquals(400, $response->get_status());
    }
    
    /**
     * Test create_not_found_error
     */
    public function test_create_not_found_error() {
        $message = 'Workout not found';
        
        $response = APIUtils::create_not_found_error($message);
        
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $response_data = $response->get_data();
        
        $this->assertFalse($response_data['success']);
        $this->assertEquals($message, $response_data['message']);
        $this->assertEquals('not_found', $response_data['code']);
        $this->assertEquals(404, $response->get_status());
    }
    
    /**
     * Test create_permission_error
     */
    public function test_create_permission_error() {
        $response = APIUtils::create_permission_error();
        
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $response_data = $response->get_data();
        
        $this->assertFalse($response_data['success']);
        $this->assertEquals('Permission denied', $response_data['message']);
        $this->assertEquals('permission_denied', $response_data['code']);
        $this->assertEquals(403, $response->get_status());
    }
    
    /**
     * Test create_server_error
     */
    public function test_create_server_error() {
        $response = APIUtils::create_server_error();
        
        $this->assertInstanceOf(WP_REST_Response::class, $response);
        $response_data = $response->get_data();
        
        $this->assertFalse($response_data['success']);
        $this->assertEquals('Server error', $response_data['message']);
        $this->assertEquals('server_error', $response_data['code']);
        $this->assertEquals(500, $response->get_status());
    }
    
    /**
     * Test get_success_message
     */
    public function test_get_success_message() {
        $this->assertEquals('Workout retrieved successfully', APIUtils::get_success_message('get', 'workout'));
        $this->assertEquals('Workout list retrieved successfully', APIUtils::get_success_message('list', 'workout'));
        $this->assertEquals('Workout created successfully', APIUtils::get_success_message('create', 'workout'));
        $this->assertEquals('Workout updated successfully', APIUtils::get_success_message('update', 'workout'));
        $this->assertEquals('Workout deleted successfully', APIUtils::get_success_message('delete', 'workout'));
        $this->assertEquals('Workout completed successfully', APIUtils::get_success_message('complete', 'workout'));
        $this->assertEquals('Workout processed successfully', APIUtils::get_success_message('unknown', 'workout'));
    }
} 