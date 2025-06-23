<?php
/**
 * ResponseDebugger - OpenAI Response Analysis and Debugging
 * 
 * Provides comprehensive debugging capabilities for OpenAI API responses,
 * including raw response capture, JSON validation, workout format analysis,
 * and detailed parsing error reports.
 */

namespace FitCopilot\Service\Debug;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * ResponseDebugger Class
 * 
 * Analyzes and debugs OpenAI API responses for workout generation
 */
class ResponseDebugger {
    
    /**
     * Expected workout JSON structure for validation
     *
     * @var array
     */
    private static $expectedStructure = [
        'title' => 'string',
        'sections' => 'array',
        'total_duration' => 'integer',
        'difficulty_level' => 'string',
        'equipment_used' => 'array'
    ];
    
    /**
     * Required section structure
     *
     * @var array
     */
    private static $expectedSectionStructure = [
        'name' => 'string',
        'duration' => 'integer',
        'exercises' => 'array'
    ];
    
    /**
     * Required exercise structure
     *
     * @var array
     */
    private static $expectedExerciseStructure = [
        'name' => 'string',
        'duration' => 'string',
        'description' => 'string'
    ];
    
    /**
     * Capture and analyze raw OpenAI response
     *
     * @param string $raw_response Raw response from OpenAI API
     * @param array $request_context Original request context for comparison
     * @return array Comprehensive response analysis
     */
    public function captureRawResponse(string $raw_response, array $request_context = []): array {
        $analysis_start = microtime(true);
        
        // Basic response metrics
        $response_metrics = [
            'raw_content' => $raw_response,
            'size_bytes' => strlen($raw_response),
            'size_kb' => round(strlen($raw_response) / 1024, 2),
            'character_count' => mb_strlen($raw_response),
            'line_count' => substr_count($raw_response, "\n") + 1,
            'word_count' => str_word_count(strip_tags($raw_response)),
            'capture_timestamp' => time(),
            'analysis_duration_ms' => 0 // Will be calculated at the end
        ];
        
        // JSON validation
        $json_analysis = $this->validateJsonStructure($raw_response);
        
        // Content analysis
        $content_analysis = $this->analyzeResponseContent($raw_response);
        
        // Workout format validation (if JSON is valid)
        $workout_analysis = [];
        if ($json_analysis['is_valid_json']) {
            $decoded_data = json_decode($raw_response, true);
            $workout_analysis = $this->analyzeWorkoutFormat($decoded_data, $request_context);
        }
        
        // Performance analysis
        $performance_analysis = $this->analyzeResponsePerformance($raw_response, $request_context);
        
        // Calculate total analysis time
        $analysis_end = microtime(true);
        $response_metrics['analysis_duration_ms'] = round(($analysis_end - $analysis_start) * 1000, 2);
        
        return [
            'success' => true,
            'response_metrics' => $response_metrics,
            'json_analysis' => $json_analysis,
            'content_analysis' => $content_analysis,
            'workout_analysis' => $workout_analysis,
            'performance_analysis' => $performance_analysis,
            'debug_summary' => $this->generateDebugSummary($json_analysis, $content_analysis, $workout_analysis)
        ];
    }
    
    /**
     * Validate JSON structure and syntax
     *
     * @param string $json_string JSON string to validate
     * @return array JSON validation results
     */
    public function validateJsonStructure(string $json_string): array {
        // Remove potential whitespace/formatting issues
        $cleaned_json = trim($json_string);
        
        // Attempt to decode JSON
        json_decode($cleaned_json);
        $json_error = json_last_error();
        
        $validation_result = [
            'is_valid_json' => $json_error === JSON_ERROR_NONE,
            'json_error_code' => $json_error,
            'json_error_message' => $json_error !== JSON_ERROR_NONE ? json_last_error_msg() : null,
            'structure_issues' => [],
            'syntax_analysis' => []
        ];
        
        if ($json_error !== JSON_ERROR_NONE) {
            // Detailed syntax analysis for common issues
            $validation_result['syntax_analysis'] = $this->analyzeSyntaxIssues($cleaned_json);
            
            // Try to identify specific problem areas
            $validation_result['structure_issues'] = $this->identifyStructureIssues($cleaned_json);
        } else {
            // JSON is valid, perform structure validation
            $decoded_data = json_decode($cleaned_json, true);
            $validation_result['structure_validation'] = $this->validateExpectedStructure($decoded_data);
        }
        
        return $validation_result;
    }
    
    /**
     * Analyze workout format compliance
     *
     * @param array $workout_data Decoded workout data
     * @param array $request_context Original request context
     * @return array Workout format analysis results
     */
    public function analyzeWorkoutFormat(array $workout_data, array $request_context = []): array {
        $validation_errors = [];
        $warnings = [];
        $suggestions = [];
        
        // Check required top-level fields
        foreach (self::$expectedStructure as $field => $type) {
            if (!isset($workout_data[$field])) {
                $validation_errors[] = "Missing required field: {$field}";
            } else {
                // Type validation
                $actual_type = gettype($workout_data[$field]);
                if ($type === 'array' && !is_array($workout_data[$field])) {
                    $validation_errors[] = "Field '{$field}' should be array, got {$actual_type}";
                } elseif ($type === 'string' && !is_string($workout_data[$field])) {
                    $validation_errors[] = "Field '{$field}' should be string, got {$actual_type}";
                } elseif ($type === 'integer' && !is_int($workout_data[$field])) {
                    $validation_errors[] = "Field '{$field}' should be integer, got {$actual_type}";
                }
            }
        }
        
        // Validate sections structure
        if (isset($workout_data['sections']) && is_array($workout_data['sections'])) {
            $sections_analysis = $this->validateSectionsStructure($workout_data['sections']);
            $validation_errors = array_merge($validation_errors, $sections_analysis['errors']);
            $warnings = array_merge($warnings, $sections_analysis['warnings']);
        }
        
        // Context compliance check
        if (!empty($request_context)) {
            $context_compliance = $this->checkContextCompliance($workout_data, $request_context);
            $warnings = array_merge($warnings, $context_compliance['warnings']);
            $suggestions = array_merge($suggestions, $context_compliance['suggestions']);
        }
        
        // Calculate completeness score
        $completeness_score = $this->calculateCompletenessScore($workout_data);
        
        return [
            'is_valid_format' => empty($validation_errors),
            'validation_errors' => $validation_errors,
            'warnings' => $warnings,
            'suggestions' => $suggestions,
            'completeness_score' => $completeness_score,
            'structure_analysis' => [
                'section_count' => isset($workout_data['sections']) ? count($workout_data['sections']) : 0,
                'total_exercises' => $this->countTotalExercises($workout_data),
                'estimated_duration' => $this->calculateEstimatedDuration($workout_data),
                'complexity_level' => $this->assessComplexityLevel($workout_data)
            ]
        ];
    }
    
    /**
     * Generate comprehensive parsing report
     *
     * @param array $response_analysis Complete response analysis
     * @return array Formatted parsing report
     */
    public function generateParsingReport(array $response_analysis): array {
        $report = [
            'summary' => [
                'status' => 'unknown',
                'primary_issue' => null,
                'confidence_score' => 0,
                'recommended_action' => 'Review detailed analysis'
            ],
            'detailed_findings' => [],
            'actionable_recommendations' => [],
            'technical_details' => $response_analysis
        ];
        
        // Determine overall status
        if ($response_analysis['json_analysis']['is_valid_json']) {
            if (isset($response_analysis['workout_analysis']['is_valid_format']) && 
                $response_analysis['workout_analysis']['is_valid_format']) {
                $report['summary']['status'] = 'success';
                $report['summary']['confidence_score'] = 95;
            } else {
                $report['summary']['status'] = 'format_issues';
                $report['summary']['primary_issue'] = 'Workout format validation failed';
                $report['summary']['confidence_score'] = 60;
            }
        } else {
            $report['summary']['status'] = 'json_invalid';
            $report['summary']['primary_issue'] = $response_analysis['json_analysis']['json_error_message'];
            $report['summary']['confidence_score'] = 30;
        }
        
        // Generate detailed findings
        $report['detailed_findings'] = $this->generateDetailedFindings($response_analysis);
        
        // Generate actionable recommendations
        $report['actionable_recommendations'] = $this->generateActionableRecommendations($response_analysis);
        
        return $report;
    }
    
    /**
     * Analyze response content for common issues
     *
     * @param string $raw_response Raw response content
     * @return array Content analysis results
     */
    private function analyzeResponseContent(string $raw_response): array {
        return [
            'contains_json' => $this->containsJson($raw_response),
            'has_markdown' => $this->containsMarkdown($raw_response),
            'has_code_blocks' => $this->containsCodeBlocks($raw_response),
            'has_html' => $this->containsHtml($raw_response),
            'encoding_issues' => $this->detectEncodingIssues($raw_response),
            'truncation_detected' => $this->detectTruncation($raw_response),
            'content_categories' => $this->categorizeContent($raw_response)
        ];
    }
    
    /**
     * Analyze response performance metrics
     *
     * @param string $raw_response Raw response content
     * @param array $request_context Original request context
     * @return array Performance analysis
     */
    private function analyzeResponsePerformance(string $raw_response, array $request_context): array {
        $estimated_tokens = $this->estimateTokenCount($raw_response);
        $requested_duration = $request_context['duration'] ?? 30;
        
        return [
            'estimated_tokens' => $estimated_tokens,
            'token_efficiency' => $this->calculateTokenEfficiency($estimated_tokens, $raw_response),
            'content_density' => strlen($raw_response) / max($estimated_tokens, 1),
            'duration_alignment' => $this->checkDurationAlignment($raw_response, $requested_duration),
            'response_quality_score' => $this->calculateQualityScore($raw_response, $request_context)
        ];
    }
    
    /**
     * Validate sections structure
     *
     * @param array $sections Sections array to validate
     * @return array Validation results
     */
    private function validateSectionsStructure(array $sections): array {
        $errors = [];
        $warnings = [];
        
        if (empty($sections)) {
            $errors[] = "Sections array is empty";
            return ['errors' => $errors, 'warnings' => $warnings];
        }
        
        foreach ($sections as $index => $section) {
            $section_prefix = "Section {$index}";
            
            // Check required section fields
            foreach (self::$expectedSectionStructure as $field => $type) {
                if (!isset($section[$field])) {
                    $errors[] = "{$section_prefix}: Missing required field '{$field}'";
                }
            }
            
            // Validate exercises if present
            if (isset($section['exercises']) && is_array($section['exercises'])) {
                if (empty($section['exercises'])) {
                    $warnings[] = "{$section_prefix}: No exercises defined";
                } else {
                    foreach ($section['exercises'] as $ex_index => $exercise) {
                        $exercise_prefix = "{$section_prefix}, Exercise {$ex_index}";
                        
                        foreach (self::$expectedExerciseStructure as $field => $type) {
                            if (!isset($exercise[$field])) {
                                $errors[] = "{$exercise_prefix}: Missing required field '{$field}'";
                            }
                        }
                    }
                }
            }
        }
        
        return ['errors' => $errors, 'warnings' => $warnings];
    }
    
    /**
     * Check context compliance
     *
     * @param array $workout_data Workout data to check
     * @param array $request_context Original request context
     * @return array Compliance analysis
     */
    private function checkContextCompliance(array $workout_data, array $request_context): array {
        $warnings = [];
        $suggestions = [];
        
        // Duration compliance
        if (isset($request_context['duration']) && isset($workout_data['total_duration'])) {
            $requested = $request_context['duration'];
            $provided = $workout_data['total_duration'];
            $difference = abs($requested - $provided);
            
            if ($difference > 5) {
                $warnings[] = "Duration mismatch: requested {$requested} min, got {$provided} min";
            }
        }
        
        // Equipment compliance
        if (isset($request_context['equipment']) && isset($workout_data['equipment_used'])) {
            $requested_equipment = $request_context['equipment'];
            $used_equipment = $workout_data['equipment_used'];
            
            $unauthorized_equipment = array_diff($used_equipment, $requested_equipment);
            if (!empty($unauthorized_equipment)) {
                $warnings[] = "Workout uses equipment not in request: " . implode(', ', $unauthorized_equipment);
            }
        }
        
        // Fitness level compliance
        if (isset($request_context['fitness_level']) && isset($workout_data['difficulty_level'])) {
            $requested_level = $request_context['fitness_level'];
            $provided_level = $workout_data['difficulty_level'];
            
            if (strtolower($requested_level) !== strtolower($provided_level)) {
                $suggestions[] = "Consider aligning difficulty level with requested fitness level: {$requested_level}";
            }
        }
        
        return ['warnings' => $warnings, 'suggestions' => $suggestions];
    }
    
    /**
     * Calculate workout completeness score
     *
     * @param array $workout_data Workout data to score
     * @return float Completeness score (0-100)
     */
    private function calculateCompletenessScore(array $workout_data): float {
        $total_points = 0;
        $earned_points = 0;
        
        // Required fields (40 points)
        foreach (self::$expectedStructure as $field => $type) {
            $total_points += 10;
            if (isset($workout_data[$field])) {
                $earned_points += 10;
            }
        }
        
        // Content quality (40 points)
        if (isset($workout_data['sections']) && is_array($workout_data['sections'])) {
            $total_points += 20;
            if (count($workout_data['sections']) >= 3) {
                $earned_points += 20;
            } else {
                $earned_points += count($workout_data['sections']) * 6;
            }
        }
        
        $total_points += 20;
        $total_exercises = $this->countTotalExercises($workout_data);
        $earned_points += min(20, $total_exercises * 2);
        
        // Additional features (20 points)
        $total_points += 20;
        
        if (isset($workout_data['title']) && strlen($workout_data['title']) > 10) {
            $earned_points += 5;
        }
        
        if (isset($workout_data['equipment_used']) && is_array($workout_data['equipment_used'])) {
            $earned_points += 5;
        }
        
        if ($this->hasDetailedDescriptions($workout_data)) {
            $earned_points += 10;
        }
        
        return round(($earned_points / $total_points) * 100, 1);
    }
    
    /**
     * Count total exercises in workout
     *
     * @param array $workout_data Workout data
     * @return int Total exercise count
     */
    private function countTotalExercises(array $workout_data): int {
        $count = 0;
        
        if (isset($workout_data['sections']) && is_array($workout_data['sections'])) {
            foreach ($workout_data['sections'] as $section) {
                if (isset($section['exercises']) && is_array($section['exercises'])) {
                    $count += count($section['exercises']);
                }
            }
        }
        
        return $count;
    }
    
    /**
     * Calculate estimated workout duration
     *
     * @param array $workout_data Workout data
     * @return int Estimated duration in minutes
     */
    private function calculateEstimatedDuration(array $workout_data): int {
        if (isset($workout_data['total_duration'])) {
            return (int) $workout_data['total_duration'];
        }
        
        $total_duration = 0;
        
        if (isset($workout_data['sections']) && is_array($workout_data['sections'])) {
            foreach ($workout_data['sections'] as $section) {
                if (isset($section['duration'])) {
                    $total_duration += (int) $section['duration'];
                }
            }
        }
        
        return $total_duration;
    }
    
    /**
     * Assess workout complexity level
     *
     * @param array $workout_data Workout data
     * @return string Complexity assessment
     */
    private function assessComplexityLevel(array $workout_data): string {
        $complexity_score = 0;
        
        // Section count
        $section_count = isset($workout_data['sections']) ? count($workout_data['sections']) : 0;
        $complexity_score += min(3, $section_count);
        
        // Exercise count
        $exercise_count = $this->countTotalExercises($workout_data);
        $complexity_score += min(5, floor($exercise_count / 2));
        
        // Equipment variety
        if (isset($workout_data['equipment_used']) && is_array($workout_data['equipment_used'])) {
            $complexity_score += min(2, count($workout_data['equipment_used']));
        }
        
        if ($complexity_score <= 3) return 'simple';
        if ($complexity_score <= 6) return 'moderate';
        return 'complex';
    }
    
    /**
     * Detect if response contains JSON
     *
     * @param string $content Content to analyze
     * @return bool Whether JSON is detected
     */
    private function containsJson(string $content): bool {
        return (strpos($content, '{') !== false && strpos($content, '}') !== false) ||
               (strpos($content, '[') !== false && strpos($content, ']') !== false);
    }
    
    /**
     * Detect markdown content
     *
     * @param string $content Content to analyze
     * @return bool Whether markdown is detected
     */
    private function containsMarkdown(string $content): bool {
        return preg_match('/[#*`_\[\]()]/', $content) > 0;
    }
    
    /**
     * Detect code blocks
     *
     * @param string $content Content to analyze
     * @return bool Whether code blocks are detected
     */
    private function containsCodeBlocks(string $content): bool {
        return strpos($content, '```') !== false || strpos($content, '`') !== false;
    }
    
    /**
     * Detect HTML content
     *
     * @param string $content Content to analyze
     * @return bool Whether HTML is detected
     */
    private function containsHtml(string $content): bool {
        return preg_match('/<[^>]+>/', $content) > 0;
    }
    
    /**
     * Detect encoding issues
     *
     * @param string $content Content to analyze
     * @return array Encoding issues detected
     */
    private function detectEncodingIssues(string $content): array {
        $issues = [];
        
        if (!mb_check_encoding($content, 'UTF-8')) {
            $issues[] = 'Invalid UTF-8 encoding detected';
        }
        
        if (preg_match('/[^\x20-\x7E\x0A\x0D]/', $content)) {
            $issues[] = 'Non-printable characters detected';
        }
        
        return $issues;
    }
    
    /**
     * Detect response truncation
     *
     * @param string $content Content to analyze
     * @return bool Whether truncation is detected
     */
    private function detectTruncation(string $content): bool {
        // Check for incomplete JSON structure
        $json_start = strpos($content, '{');
        $json_end = strrpos($content, '}');
        
        if ($json_start !== false && $json_end === false) {
            return true;
        }
        
        // Check for abrupt ending
        $trimmed = trim($content);
        if (strlen($trimmed) > 0 && !in_array(substr($trimmed, -1), ['}', ']', '"', '.'])) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Categorize content types
     *
     * @param string $content Content to analyze
     * @return array Content categories
     */
    private function categorizeContent(string $content): array {
        $categories = [];
        
        if ($this->containsJson($content)) $categories[] = 'json';
        if ($this->containsMarkdown($content)) $categories[] = 'markdown';
        if ($this->containsHtml($content)) $categories[] = 'html';
        if (preg_match('/\b(error|exception|failed|invalid)\b/i', $content)) $categories[] = 'error_message';
        if (preg_match('/\b(workout|exercise|fitness|training)\b/i', $content)) $categories[] = 'fitness_content';
        
        return $categories;
    }
    
    /**
     * Estimate token count
     *
     * @param string $content Content to analyze
     * @return int Estimated token count
     */
    private function estimateTokenCount(string $content): int {
        // Rough estimation: ~4 characters per token for English text
        return (int) ceil(strlen($content) / 4);
    }
    
    /**
     * Calculate token efficiency
     *
     * @param int $token_count Estimated token count
     * @param string $content Response content
     * @return float Efficiency score
     */
    private function calculateTokenEfficiency(int $token_count, string $content): float {
        $useful_content = str_replace([' ', "\n", "\t"], '', $content);
        $useful_ratio = strlen($useful_content) / strlen($content);
        
        return round($useful_ratio * 100, 1);
    }
    
    /**
     * Check duration alignment
     *
     * @param string $content Response content
     * @param int $requested_duration Requested duration
     * @return array Duration alignment analysis
     */
    private function checkDurationAlignment(string $content, int $requested_duration): array {
        // Extract duration mentions from content
        preg_match_all('/(\d+)\s*min/i', $content, $matches);
        
        $mentioned_durations = array_map('intval', $matches[1]);
        $total_mentioned = array_sum($mentioned_durations);
        
        return [
            'mentioned_durations' => $mentioned_durations,
            'total_mentioned' => $total_mentioned,
            'alignment_score' => $total_mentioned > 0 ? 
                round(100 - (abs($requested_duration - $total_mentioned) / $requested_duration * 100), 1) : 0
        ];
    }
    
    /**
     * Calculate overall response quality score
     *
     * @param string $content Response content
     * @param array $request_context Request context
     * @return float Quality score (0-100)
     */
    private function calculateQualityScore(string $content, array $request_context): float {
        $score = 0;
        
        // JSON validity (30 points)
        json_decode($content);
        if (json_last_error() === JSON_ERROR_NONE) {
            $score += 30;
        }
        
        // Content completeness (25 points)
        if (str_word_count($content) > 100) $score += 10;
        if (strpos($content, 'exercise') !== false) $score += 5;
        if (strpos($content, 'duration') !== false) $score += 5;
        if (strpos($content, 'description') !== false) $score += 5;
        
        // Structure quality (25 points)
        if (substr_count($content, '{') === substr_count($content, '}')) $score += 10;
        if (substr_count($content, '[') === substr_count($content, ']')) $score += 10;
        if (!$this->detectTruncation($content)) $score += 5;
        
        // Context relevance (20 points)
        if (isset($request_context['fitness_level']) && 
            stripos($content, $request_context['fitness_level']) !== false) $score += 10;
        if (isset($request_context['duration']) && 
            strpos($content, (string)$request_context['duration']) !== false) $score += 10;
        
        return round($score, 1);
    }
    
    /**
     * Check if workout has detailed descriptions
     *
     * @param array $workout_data Workout data
     * @return bool Whether detailed descriptions exist
     */
    private function hasDetailedDescriptions(array $workout_data): bool {
        if (!isset($workout_data['sections']) || !is_array($workout_data['sections'])) {
            return false;
        }
        
        foreach ($workout_data['sections'] as $section) {
            if (isset($section['exercises']) && is_array($section['exercises'])) {
                foreach ($section['exercises'] as $exercise) {
                    if (isset($exercise['description']) && strlen($exercise['description']) > 50) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Analyze syntax issues in malformed JSON
     *
     * @param string $json_string JSON string to analyze
     * @return array Syntax analysis
     */
    private function analyzeSyntaxIssues(string $json_string): array {
        $issues = [];
        
        // Check for common syntax problems
        if (substr_count($json_string, '{') !== substr_count($json_string, '}')) {
            $issues[] = 'Mismatched curly braces';
        }
        
        if (substr_count($json_string, '[') !== substr_count($json_string, ']')) {
            $issues[] = 'Mismatched square brackets';
        }
        
        if (substr_count($json_string, '"') % 2 !== 0) {
            $issues[] = 'Unmatched quotes';
        }
        
        // Check for trailing commas
        if (preg_match('/,\s*[}\]]/', $json_string)) {
            $issues[] = 'Trailing commas detected';
        }
        
        return $issues;
    }
    
    /**
     * Identify structure issues in JSON
     *
     * @param string $json_string JSON string to analyze
     * @return array Structure issues
     */
    private function identifyStructureIssues(string $json_string): array {
        $issues = [];
        
        // Look for incomplete structures
        if (preg_match('/[{,]\s*$/', trim($json_string))) {
            $issues[] = 'JSON appears to be incomplete (ends with { or ,)';
        }
        
        // Look for missing property names
        if (preg_match('/:\s*[^",{\[\d]/', $json_string)) {
            $issues[] = 'Possible missing quotes around property values';
        }
        
        return $issues;
    }
    
    /**
     * Validate expected structure in decoded JSON
     *
     * @param array $data Decoded JSON data
     * @return array Structure validation results
     */
    private function validateExpectedStructure(array $data): array {
        $validation = [
            'has_required_fields' => true,
            'missing_fields' => [],
            'type_mismatches' => []
        ];
        
        foreach (self::$expectedStructure as $field => $expected_type) {
            if (!isset($data[$field])) {
                $validation['has_required_fields'] = false;
                $validation['missing_fields'][] = $field;
            } else {
                $actual_type = gettype($data[$field]);
                if (($expected_type === 'array' && !is_array($data[$field])) ||
                    ($expected_type === 'string' && !is_string($data[$field])) ||
                    ($expected_type === 'integer' && !is_int($data[$field]))) {
                    $validation['type_mismatches'][] = [
                        'field' => $field,
                        'expected' => $expected_type,
                        'actual' => $actual_type
                    ];
                }
            }
        }
        
        return $validation;
    }
    
    /**
     * Generate debug summary
     *
     * @param array $json_analysis JSON analysis results
     * @param array $content_analysis Content analysis results
     * @param array $workout_analysis Workout analysis results
     * @return array Debug summary
     */
    private function generateDebugSummary(array $json_analysis, array $content_analysis, array $workout_analysis): array {
        $summary = [
            'overall_status' => 'unknown',
            'primary_issues' => [],
            'recommendations' => [],
            'confidence_level' => 'medium'
        ];
        
        // Determine overall status
        if ($json_analysis['is_valid_json']) {
            if (!empty($workout_analysis) && $workout_analysis['is_valid_format']) {
                $summary['overall_status'] = 'success';
                $summary['confidence_level'] = 'high';
            } else {
                $summary['overall_status'] = 'format_issues';
                $summary['confidence_level'] = 'medium';
            }
        } else {
            $summary['overall_status'] = 'json_invalid';
            $summary['confidence_level'] = 'low';
        }
        
        // Collect primary issues
        if (!$json_analysis['is_valid_json']) {
            $summary['primary_issues'][] = 'Invalid JSON: ' . $json_analysis['json_error_message'];
        }
        
        if (!empty($workout_analysis['validation_errors'])) {
            $summary['primary_issues'] = array_merge($summary['primary_issues'], 
                array_slice($workout_analysis['validation_errors'], 0, 3));
        }
        
        // Generate recommendations
        if (!$json_analysis['is_valid_json']) {
            $summary['recommendations'][] = 'Fix JSON syntax errors before proceeding';
        }
        
        if (!empty($workout_analysis['suggestions'])) {
            $summary['recommendations'] = array_merge($summary['recommendations'], 
                array_slice($workout_analysis['suggestions'], 0, 2));
        }
        
        return $summary;
    }
    
    /**
     * Generate detailed findings for report
     *
     * @param array $analysis Complete analysis data
     * @return array Detailed findings
     */
    private function generateDetailedFindings(array $analysis): array {
        $findings = [];
        
        // JSON Analysis Findings
        if (!$analysis['json_analysis']['is_valid_json']) {
            $findings[] = [
                'category' => 'JSON Syntax',
                'severity' => 'error',
                'message' => 'JSON parsing failed: ' . $analysis['json_analysis']['json_error_message'],
                'details' => $analysis['json_analysis']['syntax_analysis']
            ];
        }
        
        // Workout Format Findings
        if (!empty($analysis['workout_analysis']['validation_errors'])) {
            $findings[] = [
                'category' => 'Workout Format',
                'severity' => 'error',
                'message' => 'Workout format validation failed',
                'details' => $analysis['workout_analysis']['validation_errors']
            ];
        }
        
        // Performance Findings
        if (isset($analysis['performance_analysis']['response_quality_score']) &&
            $analysis['performance_analysis']['response_quality_score'] < 70) {
            $findings[] = [
                'category' => 'Response Quality',
                'severity' => 'warning',
                'message' => 'Response quality below threshold',
                'details' => $analysis['performance_analysis']
            ];
        }
        
        return $findings;
    }
    
    /**
     * Generate actionable recommendations
     *
     * @param array $analysis Complete analysis data
     * @return array Actionable recommendations
     */
    private function generateActionableRecommendations(array $analysis): array {
        $recommendations = [];
        
        // JSON Issues
        if (!$analysis['json_analysis']['is_valid_json']) {
            $recommendations[] = [
                'priority' => 'high',
                'action' => 'Fix JSON syntax errors',
                'description' => 'Resolve JSON parsing issues before processing workout data',
                'technical_details' => $analysis['json_analysis']['structure_issues']
            ];
        }
        
        // Format Issues
        if (!empty($analysis['workout_analysis']['validation_errors'])) {
            $recommendations[] = [
                'priority' => 'high',
                'action' => 'Correct workout format structure',
                'description' => 'Ensure all required fields are present and properly formatted',
                'technical_details' => $analysis['workout_analysis']['validation_errors']
            ];
        }
        
        // Quality Improvements
        if (isset($analysis['workout_analysis']['completeness_score']) &&
            $analysis['workout_analysis']['completeness_score'] < 80) {
            $recommendations[] = [
                'priority' => 'medium',
                'action' => 'Improve workout completeness',
                'description' => 'Add missing optional fields and enhance content quality',
                'technical_details' => ['completeness_score' => $analysis['workout_analysis']['completeness_score']]
            ];
        }
        
        return $recommendations;
    }
} 