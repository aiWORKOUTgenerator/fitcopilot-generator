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
        $goals = $params['goals'] ?? 'general fitness';
        $restrictions = $params['restrictions'] ?? 'none';

        $prompt = "Create a detailed {$difficulty} level workout for {$duration} minutes. ";
        $prompt .= "Equipment available: {$equipment}. ";
        $prompt .= "Fitness goals: {$goals}. ";
        
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
                'model' => 'gpt-4-turbo',
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