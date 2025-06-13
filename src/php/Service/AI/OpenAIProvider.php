<?php
/**
 * OpenAI Provider for FitCopilot
 */

namespace FitCopilot\Service\AI;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * OpenAI Provider Class
 * 
 * Handles requests to OpenAI API for workout generation
 */
class OpenAIProvider {
    /**
     * OpenAI API key
     *
     * @var string
     */
    private $api_key;

    /**
     * OpenAI API endpoint
     *
     * @var string
     */
    private $api_endpoint = 'https://api.openai.com/v1/chat/completions';

    /**
     * Constructor
     *
     * @param string $api_key OpenAI API key
     */
    public function __construct($api_key) {
        $this->api_key = $api_key;
    }

    /**
     * Generate a workout using OpenAI
     *
     * @param array $params Parameters for the workout generation
     * @return array Generated workout data
     * @throws \Exception If API call fails
     */
    public function generateWorkout($params) {
        // Build the prompt based on params
        $prompt = $this->buildPrompt($params);

        try {
            // Make API request to OpenAI
            $response = $this->makeOpenAIRequest($prompt);
            
            // Parse the response into structured workout
            $workout = $this->parseResponse($response, $params);
            
            return $workout;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Build a prompt for OpenAI based on workout parameters
     *
     * @param array $params Workout parameters
     * @return string Prompt for OpenAI
     */
    private function buildPrompt($params) {
        $duration = $params['duration'] ?? 30;
        $difficulty = $params['difficulty'] ?? 'intermediate';  
        $equipment = isset($params['equipment']) ? implode(', ', $params['equipment']) : 'no equipment';
        $daily_focus = $params['daily_focus'] ?? $params['goals'] ?? 'general fitness';
        $profile_goals = isset($params['profile_goals']) && is_array($params['profile_goals']) ? $params['profile_goals'] : [];
        $restrictions = $params['restrictions'] ?? 'none';
        $intensity = $params['intensity'] ?? 3;

        // Map intensity level to descriptive text
        $intensity_labels = [
            1 => 'very low intensity (gentle, recovery-focused)',
            2 => 'low intensity (light activity, easy pace)',
            3 => 'moderate intensity (comfortable challenge)',
            4 => 'high intensity (vigorous, challenging)',
            5 => 'very high intensity (maximum effort, elite level)'
        ];
        $intensity_description = $intensity_labels[$intensity] ?? 'moderate intensity';

        $prompt = "Create a detailed {$difficulty} level workout for {$duration} minutes at {$intensity_description}. ";
        $prompt .= "Equipment available: {$equipment}. ";
        $prompt .= "Today's workout focus: {$daily_focus}. ";
        
        // Add muscle targeting integration
        $muscle_targeting = $this->buildMuscleTargetingText($params);
        if (!empty($muscle_targeting)) {
            $prompt .= $muscle_targeting . " ";
        }
        
        // Add profile context if available
        if (!empty($profile_goals)) {
            $profile_goals_text = implode(', ', $profile_goals);
            $prompt .= "User's long-term fitness goals: {$profile_goals_text}. ";
            $prompt .= "Prioritize today's focus while supporting overall fitness goals. ";
        }
        
        if ($restrictions !== 'none') {
            $prompt .= "Health restrictions/considerations: {$restrictions}. ";
        }
        
        $prompt .= "Format the response in JSON with the following structure:
        {
            \"title\": \"Workout Title\",
            \"sections\": [
                {
                    \"name\": \"Section Name (e.g. Warm Up)\",
                    \"duration\": 5,
                    \"exercises\": [
                        {
                            \"name\": \"Exercise Name\",
                            \"duration\": \"Duration or reps (e.g. '2 minutes' or '10 reps')\",
                            \"description\": \"Detailed description of how to perform the exercise\"
                        }
                    ]
                }
            ]
        }";

        return $prompt;
    }

    /**
     * Build muscle targeting text for the workout prompt
     *
     * @param array $params Workout parameters
     * @return string Muscle targeting text for the prompt
     */
    private function buildMuscleTargetingText($params) {
        $muscle_text = '';
        
        // Check for muscle targeting data (new integration format)
        if (isset($params['muscleTargeting']) && is_array($params['muscleTargeting'])) {
            $muscle_targeting = $params['muscleTargeting'];
            
            if (!empty($muscle_targeting['selectionSummary'])) {
                $muscle_text = "MUSCLE TARGETING: " . $muscle_targeting['selectionSummary'] . ".";
            } else if (!empty($muscle_targeting['targetMuscleGroups'])) {
                $groups = is_array($muscle_targeting['targetMuscleGroups']) 
                    ? implode(', ', $muscle_targeting['targetMuscleGroups']) 
                    : $muscle_targeting['targetMuscleGroups'];
                $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$groups}.";
                
                if (!empty($muscle_targeting['primaryFocus'])) {
                    $muscle_text .= " Primary emphasis on {$muscle_targeting['primaryFocus']}.";
                }
            }
        }
        
        // Check for legacy focusArea format (backward compatibility)
        else if (isset($params['focusArea']) && is_array($params['focusArea']) && !empty($params['focusArea'])) {
            $focus_areas = implode(', ', $params['focusArea']);
            $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$focus_areas}.";
        }
        
        // Check for direct muscle targeting fields (backward compatibility)
        else if (isset($params['targetMuscleGroups']) && !empty($params['targetMuscleGroups'])) {
            $groups = is_array($params['targetMuscleGroups']) 
                ? implode(', ', $params['targetMuscleGroups']) 
                : $params['targetMuscleGroups'];
            $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$groups}.";
            
            if (isset($params['primaryFocus']) && !empty($params['primaryFocus'])) {
                $muscle_text .= " Primary emphasis on {$params['primaryFocus']}.";
            }
        }
        
        // Check for sessionInputs muscle targeting (integration hook format)
        else if (isset($params['sessionInputs']['muscleTargeting']) && is_array($params['sessionInputs']['muscleTargeting'])) {
            $session_targeting = $params['sessionInputs']['muscleTargeting'];
            
            if (!empty($session_targeting['selectionSummary'])) {
                $muscle_text = "MUSCLE TARGETING: " . $session_targeting['selectionSummary'] . ".";
            }
        }
        
        // Check for sessionInputs focus area (integration hook format)
        else if (isset($params['sessionInputs']['focusArea']) && is_array($params['sessionInputs']['focusArea']) && !empty($params['sessionInputs']['focusArea'])) {
            $focus_areas = implode(', ', $params['sessionInputs']['focusArea']);
            $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$focus_areas}.";
        }
        
        return $muscle_text;
    }

    /**
     * Make API request to OpenAI
     *
     * @param string $prompt The prompt to send to OpenAI
     * @return string Raw response from OpenAI
     * @throws \Exception If API call fails
     */
    private function makeOpenAIRequest($prompt) {
        $start_time = microtime(true);
        
        $args = [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'model' => 'gpt-4.1',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional fitness coach specializing in personalized workout plans. Provide detailed, safe workouts with proper exercise descriptions.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
            ]),
            'timeout' => 60,
        ];

        $response = wp_remote_post($this->api_endpoint, $args);
        
        $end_time = microtime(true);
        $duration_ms = round(($end_time - $start_time) * 1000, 2);

        if (is_wp_error($response)) {
            throw new \Exception('OpenAI API request failed: ' . $response->get_error_message());
        }

        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            $body = wp_remote_retrieve_body($response);
            $error = json_decode($body, true);
            $error_message = isset($error['error']['message']) ? $error['error']['message'] : 'Unknown error';
            throw new \Exception('OpenAI API error (' . $response_code . '): ' . $error_message);
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!isset($data['choices'][0]['message']['content'])) {
            throw new \Exception('Invalid response from OpenAI API');
        }
        
        // Track the API request for analytics
        do_action('fitcopilot_api_request_complete', $data, $duration_ms, $this->api_endpoint);

        return $data['choices'][0]['message']['content'];
    }

    /**
     * Parse OpenAI response into structured workout
     *
     * @param string $response Raw response from OpenAI
     * @param array $params Original workout parameters
     * @return array Structured workout
     * @throws \Exception If response parsing fails
     */
    private function parseResponse($response, $params) {
        try {
            // Remove any markdown code block markers if present (```json and ```)
            $response = preg_replace('/```json\s*/', '', $response);
            $response = preg_replace('/```\s*/', '', $response);
            
            $workout = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Failed to parse OpenAI response: ' . json_last_error_msg());
            }
            
            // Validate the structure
            if (!isset($workout['title']) || !isset($workout['sections']) || !is_array($workout['sections'])) {
                throw new \Exception('Invalid workout format in OpenAI response');
            }
            
            return $workout;
        } catch (\Exception $e) {
            throw new \Exception('Failed to parse workout from OpenAI: ' . $e->getMessage());
        }
    }
} 