<?php
/**
 * API Utilities Concurrency Test
 * 
 * Tests for API utility concurrency control functions
 */

namespace FitCopilot\Tests\API;

use FitCopilot\API\APIUtils;
use WP_UnitTestCase;
use WP_REST_Request;

/**
 * APIUtils Concurrency Test Class
 */
class APIUtilsConcurrencyTest extends WP_UnitTestCase {
    
    /**
     * Test generate_etag method
     */
    public function test_generate_etag() {
        $etag = APIUtils::generate_etag(5);
        $this->assertEquals('"5"', $etag);
        
        $etag = APIUtils::generate_etag('abc123');
        $this->assertEquals('"abc123"', $etag);
    }
    
    /**
     * Test check_if_match method with matching version
     */
    public function test_check_if_match_with_matching_version() {
        $request = $this->createMockRequest(['IF_MATCH' => ['"3"']]);
        $result = APIUtils::check_if_match(3, $request);
        $this->assertTrue($result);
    }
    
    /**
     * Test check_if_match method with non-matching version
     */
    public function test_check_if_match_with_non_matching_version() {
        $request = $this->createMockRequest(['IF_MATCH' => ['"2"']]);
        $result = APIUtils::check_if_match(3, $request);
        $this->assertFalse($result);
    }
    
    /**
     * Test check_if_match method with no header
     */
    public function test_check_if_match_with_no_header() {
        $request = $this->createMockRequest([]);
        $result = APIUtils::check_if_match(3, $request);
        $this->assertTrue($result);
    }
    
    /**
     * Test check_if_match method with weak ETag
     */
    public function test_check_if_match_with_weak_etag() {
        $request = $this->createMockRequest(['IF_MATCH' => ['W/"3"']]);
        $result = APIUtils::check_if_match(3, $request);
        $this->assertTrue($result);
    }
    
    /**
     * Test is_modified method with matching version
     */
    public function test_is_modified_with_matching_version() {
        $request = $this->createMockRequest(['IF_NONE_MATCH' => ['"3"']]);
        $result = APIUtils::is_modified(3, $request);
        $this->assertFalse($result);
    }
    
    /**
     * Test is_modified method with non-matching version
     */
    public function test_is_modified_with_non_matching_version() {
        $request = $this->createMockRequest(['IF_NONE_MATCH' => ['"2"']]);
        $result = APIUtils::is_modified(3, $request);
        $this->assertTrue($result);
    }
    
    /**
     * Test is_modified method with no header
     */
    public function test_is_modified_with_no_header() {
        $request = $this->createMockRequest([]);
        $result = APIUtils::is_modified(3, $request);
        $this->assertTrue($result);
    }
    
    /**
     * Test create_not_modified_response
     */
    public function test_create_not_modified_response() {
        $response = APIUtils::create_not_modified_response(3);
        $this->assertEquals(304, $response->get_status());
        $this->assertNull($response->get_data());
    }
    
    /**
     * Test create_precondition_failed
     */
    public function test_create_precondition_failed() {
        $response = APIUtils::create_precondition_failed(3);
        $this->assertEquals(412, $response->get_status());
        
        $data = $response->get_data();
        $this->assertFalse($data['success']);
        $this->assertEquals('precondition_failed', $data['code']);
        $this->assertEquals(3, $data['data']['current_version']);
    }
    
    /**
     * Helper to create a mock WP_REST_Request
     * 
     * @param array $headers Header values to set
     * @return WP_REST_Request Mocked request
     */
    private function createMockRequest($headers) {
        $request = $this->getMockBuilder(WP_REST_Request::class)
            ->disableOriginalConstructor()
            ->getMock();
            
        $request->method('get_headers')
            ->willReturn($headers);
            
        return $request;
    }
} 