#!/bin/bash

# Manual Testing Script for Workout API Endpoints
# ----------------------------------------------
# This script performs manual testing of the standardized workout endpoints
# using both direct and wrapped request formats.

# Configuration
BASE_URL="http://fitcopilot-generator.local/wp-json/fitcopilot/v1"
COOKIE_FILE="/tmp/wp-cookies.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
function log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

function log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

function log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

function section() {
  echo -e "\n${BLUE}========== $1 ==========${NC}\n"
}

# Login and get auth cookie
function get_auth_cookie() {
  section "Authenticating with WordPress"
  
  # Check if we already have a cookie file
  if [ -f "$COOKIE_FILE" ]; then
    log_info "Using existing cookie file: $COOKIE_FILE"
    return 0
  fi
  
  log_info "Getting authentication cookie..."
  
  # Replace with your actual username and password for local testing
  curl -s -c "$COOKIE_FILE" -d "log=admin&pwd=password&wp-submit=Log+In" \
       -X POST "http://fitcopilot-generator.local/wp-login.php"
       
  if [ $? -eq 0 ]; then
    log_success "Authentication successful"
  else
    log_error "Authentication failed"
    exit 1
  fi
}

# Test GET /workouts endpoint
function test_get_workouts() {
  section "Testing GET /workouts endpoint"
  
  log_info "Fetching list of workouts..."
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X GET "$BASE_URL/workouts")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
    log_success "GET /workouts endpoint returned proper standardized response format"
  else
    log_error "GET /workouts endpoint failed or doesn't follow standardized format"
  fi
}

# Test POST /generate with direct format
function test_generate_workout_direct() {
  section "Testing POST /generate endpoint (direct format)"
  
  log_info "Generating workout with direct format..."
  
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST \
       -H "Content-Type: application/json" \
       -d '{
         "duration": 30,
         "difficulty": "intermediate",
         "equipment": ["dumbbells", "bench"],
         "goals": "strength",
         "specific_request": "A quick upper body workout"
       }' \
       "$BASE_URL/generate")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true and contains workout data
  if echo "$RESPONSE" | jq -e '.success == true and .data.workout != null' > /dev/null; then
    WORKOUT_ID=$(echo "$RESPONSE" | jq '.data.post_id')
    log_success "POST /generate endpoint (direct format) works with standardized response"
    echo "Created workout ID: $WORKOUT_ID"
    
    # Save workout ID for later tests
    echo "$WORKOUT_ID" > /tmp/workout_id.txt
  else
    log_error "POST /generate endpoint (direct format) failed or doesn't follow standardized format"
  fi
}

# Test POST /generate with wrapped format
function test_generate_workout_wrapped() {
  section "Testing POST /generate endpoint (wrapped format)"
  
  log_info "Generating workout with wrapped format..."
  
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST \
       -H "Content-Type: application/json" \
       -d '{
         "workout": {
           "duration": 30,
           "difficulty": "advanced",
           "equipment": ["resistance bands", "yoga mat"],
           "goals": "mobility",
           "specific_request": "A yoga-focused mobility routine"
         }
       }' \
       "$BASE_URL/generate")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true and contains workout data
  if echo "$RESPONSE" | jq -e '.success == true and .data.workout != null' > /dev/null; then
    WORKOUT_ID=$(echo "$RESPONSE" | jq '.data.post_id')
    log_success "POST /generate endpoint (wrapped format) works with standardized response"
    echo "Created workout ID: $WORKOUT_ID"
    
    # Save workout ID for later tests
    echo "$WORKOUT_ID" > /tmp/workout_id_wrapped.txt
  else
    log_error "POST /generate endpoint (wrapped format) failed or doesn't follow standardized format"
  fi
}

# Test GET /workouts/{id} endpoint
function test_get_single_workout() {
  section "Testing GET /workouts/{id} endpoint"
  
  # Get saved workout ID
  if [ -f "/tmp/workout_id.txt" ]; then
    WORKOUT_ID=$(cat /tmp/workout_id.txt)
  else
    log_error "Workout ID not found. Please run the generate workout test first."
    return 1
  fi
  
  log_info "Fetching workout with ID: $WORKOUT_ID"
  
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X GET "$BASE_URL/workouts/$WORKOUT_ID")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true and contains workout data
  if echo "$RESPONSE" | jq -e '.success == true and .data.id != null' > /dev/null; then
    log_success "GET /workouts/{id} endpoint returned proper standardized response format"
  else
    log_error "GET /workouts/{id} endpoint failed or doesn't follow standardized format"
  fi
}

# Test PUT /workouts/{id} with direct format
function test_update_workout_direct() {
  section "Testing PUT /workouts/{id} endpoint (direct format)"
  
  # Get saved workout ID
  if [ -f "/tmp/workout_id.txt" ]; then
    WORKOUT_ID=$(cat /tmp/workout_id.txt)
  else
    log_error "Workout ID not found. Please run the generate workout test first."
    return 1
  fi
  
  log_info "Updating workout with ID: $WORKOUT_ID (direct format)"
  
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X PUT \
       -H "Content-Type: application/json" \
       -d '{
         "title": "Updated Workout Title",
         "difficulty": "advanced",
         "duration": 45
       }' \
       "$BASE_URL/workouts/$WORKOUT_ID")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
    log_success "PUT /workouts/{id} endpoint (direct format) works with standardized response"
  else
    log_error "PUT /workouts/{id} endpoint (direct format) failed or doesn't follow standardized format"
  fi
}

# Test PUT /workouts/{id} with wrapped format
function test_update_workout_wrapped() {
  section "Testing PUT /workouts/{id} endpoint (wrapped format)"
  
  # Get saved workout ID
  if [ -f "/tmp/workout_id_wrapped.txt" ]; then
    WORKOUT_ID=$(cat /tmp/workout_id_wrapped.txt)
  else
    log_error "Wrapped workout ID not found. Please run the wrapped generate workout test first."
    return 1
  fi
  
  log_info "Updating workout with ID: $WORKOUT_ID (wrapped format)"
  
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X PUT \
       -H "Content-Type: application/json" \
       -d '{
         "workout": {
           "title": "Updated Wrapped Workout",
           "difficulty": "beginner",
           "duration": 15
         }
       }' \
       "$BASE_URL/workouts/$WORKOUT_ID")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
    log_success "PUT /workouts/{id} endpoint (wrapped format) works with standardized response"
  else
    log_error "PUT /workouts/{id} endpoint (wrapped format) failed or doesn't follow standardized format"
  fi
}

# Test POST /workouts/{id}/complete with direct format
function test_complete_workout_direct() {
  section "Testing POST /workouts/{id}/complete endpoint (direct format)"
  
  # Get saved workout ID
  if [ -f "/tmp/workout_id.txt" ]; then
    WORKOUT_ID=$(cat /tmp/workout_id.txt)
  else
    log_error "Workout ID not found. Please run the generate workout test first."
    return 1
  fi
  
  log_info "Completing workout with ID: $WORKOUT_ID (direct format)"
  
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST \
       -H "Content-Type: application/json" \
       -d '{
         "rating": 5,
         "feedback": "Great workout, felt the burn!",
         "duration_actual": 35
       }' \
       "$BASE_URL/workouts/$WORKOUT_ID/complete")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
    log_success "POST /workouts/{id}/complete endpoint (direct format) works with standardized response"
  else
    log_error "POST /workouts/{id}/complete endpoint (direct format) failed or doesn't follow standardized format"
  fi
}

# Test POST /workouts/{id}/complete with wrapped format
function test_complete_workout_wrapped() {
  section "Testing POST /workouts/{id}/complete endpoint (wrapped format)"
  
  # Get saved workout ID
  if [ -f "/tmp/workout_id_wrapped.txt" ]; then
    WORKOUT_ID=$(cat /tmp/workout_id_wrapped.txt)
  else
    log_error "Wrapped workout ID not found. Please run the wrapped generate workout test first."
    return 1
  fi
  
  log_info "Completing workout with ID: $WORKOUT_ID (wrapped format)"
  
  RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST \
       -H "Content-Type: application/json" \
       -d '{
         "completion": {
           "rating": 4,
           "feedback": "Good mobility workout, helped with recovery",
           "duration_actual": 25
         }
       }' \
       "$BASE_URL/workouts/$WORKOUT_ID/complete")
  
  echo "$RESPONSE" | jq '.'
  
  # Check if response has success: true
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
    log_success "POST /workouts/{id}/complete endpoint (wrapped format) works with standardized response"
  else
    log_error "POST /workouts/{id}/complete endpoint (wrapped format) failed or doesn't follow standardized format"
  fi
}

# Run all tests
function run_all_tests() {
  get_auth_cookie
  test_generate_workout_direct
  test_get_workouts
  test_get_single_workout
  test_update_workout_direct
  test_complete_workout_direct
  test_generate_workout_wrapped
  test_update_workout_wrapped
  test_complete_workout_wrapped
  
  section "Test Summary"
  log_info "All tests completed. Please verify output for any errors."
  log_info "Before running in production, make sure to update the WordPress login credentials and base URL."
}

# Main execution
run_all_tests 