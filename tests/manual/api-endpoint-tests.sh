#!/bin/bash

# API Endpoint Tests for Phase 1 Stabilization
# Tests the REST API endpoints to ensure they're working correctly

echo "🧪 API Endpoint Tests for Phase 1 Stabilization"
echo "================================================"
echo ""

# Configuration
BASE_URL="http://fitcopilot-generator.local/wp-json/fitcopilot/v1"
TEMP_FILE="/tmp/fitcopilot_test_$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TEST_COUNT=0
PASS_COUNT=0

# Helper function to run a test
run_test() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local method="${4:-GET}"
    
    ((TEST_COUNT++))
    
    echo -e "${BLUE}Test $TEST_COUNT: $test_name${NC}"
    
    # Make the request
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    fi
    
    # Split response and status code
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    # Check status code
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ Status: $status_code (Expected: $expected_status)${NC}"
        ((PASS_COUNT++))
    else
        echo -e "  ${RED}❌ Status: $status_code (Expected: $expected_status)${NC}"
    fi
    
    # Save response to temp file for inspection
    echo "$response_body" > "$TEMP_FILE"
    
    # Check if response is valid JSON (for successful requests)
    if [ "$expected_status" = "200" ]; then
        if echo "$response_body" | jq . >/dev/null 2>&1; then
            echo -e "  ${GREEN}✅ Valid JSON response${NC}"
        else
            echo -e "  ${RED}❌ Invalid JSON response${NC}"
            echo -e "  ${YELLOW}Response body:${NC}"
            echo "$response_body" | head -n 3
        fi
        
        # Check for success field in response
        if echo "$response_body" | jq -e '.success' >/dev/null 2>&1; then
            success=$(echo "$response_body" | jq -r '.success')
            if [ "$success" = "true" ]; then
                echo -e "  ${GREEN}✅ API response indicates success${NC}"
            else
                echo -e "  ${RED}❌ API response indicates failure${NC}"
                message=$(echo "$response_body" | jq -r '.message // "No message"')
                echo -e "  ${YELLOW}Message: $message${NC}"
            fi
        fi
    fi
    
    echo ""
}

# Test 1: Check if API namespace is accessible
echo "🔌 Testing API Namespace Registration"
run_test "API Namespace Discovery" "$BASE_URL/" "200"

# Test 2: Check debug endpoint
echo "🐛 Testing Debug Endpoint"
run_test "Debug Endpoint" "$BASE_URL/debug" "200"

# Test 3: Check workout endpoints (should require authentication)
echo "🏋️ Testing Workout Endpoints (Unauthenticated)"
run_test "Get Workouts (No Auth)" "$BASE_URL/workouts" "401"
run_test "Generate Workout (No Auth)" "$BASE_URL/generate" "401" "POST"

# Test 4: Check profile endpoints
echo "👤 Testing Profile Endpoints (Unauthenticated)" 
run_test "Get Profile (No Auth)" "$BASE_URL/profile" "401"

# Test 5: Check analytics endpoints
echo "📊 Testing Analytics Endpoints"
run_test "Analytics (No Auth)" "$BASE_URL/analytics" "401" "POST"

# Test 6: Test with invalid endpoints (should return 404)
echo "❌ Testing Invalid Endpoints"
run_test "Invalid Endpoint" "$BASE_URL/nonexistent" "404"

# Test 7: Check endpoint discovery
echo "🔍 Testing Endpoint Discovery"
if [ -f "$TEMP_FILE" ] && [ "$(cat "$TEMP_FILE" | jq -e '.routes' 2>/dev/null)" ]; then
    echo -e "${GREEN}✅ Checking registered routes...${NC}"
    
    # Check for key workout endpoints
    routes=$(cat "$TEMP_FILE" | jq -r '.routes | keys[]' 2>/dev/null)
    
    expected_routes=(
        "/fitcopilot/v1/generate"
        "/fitcopilot/v1/workouts"
        "/fitcopilot/v1/workouts/(?P<id>\\d+)"
        "/fitcopilot/v1/debug"
        "/fitcopilot/v1/profile"
    )
    
    for route in "${expected_routes[@]}"; do
        if echo "$routes" | grep -q "$route"; then
            echo -e "  ${GREEN}✅ Route registered: $route${NC}"
        else
            echo -e "  ${RED}❌ Route missing: $route${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️ Could not parse routes from API discovery${NC}"
fi

echo ""
echo "📋 Test Summary"
echo "==============="
echo -e "Total Tests: $TEST_COUNT"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $((TEST_COUNT - PASS_COUNT))${NC}"

if [ $PASS_COUNT -eq $TEST_COUNT ]; then
    echo -e "\n${GREEN}🎉 All API endpoint tests passed!${NC}"
    echo -e "${GREEN}Phase 1 stabilization appears to be working correctly.${NC}"
else
    echo -e "\n${RED}❌ Some tests failed. Check the output above for details.${NC}"
fi

# Cleanup
rm -f "$TEMP_FILE"

echo ""
echo "💡 Next Steps:"
echo "  1. Test with authenticated requests (admin user)"
echo "  2. Test workout creation/retrieval workflow"
echo "  3. Test frontend integration"
echo "  4. Run the comprehensive Phase 1 test suite"

exit $((TEST_COUNT - PASS_COUNT)) 