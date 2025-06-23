<?php
/**
 * ContextManager - Context Aggregation and Management
 * 
 * Manages different types of context data for prompt generation including
 * user profiles, session data, workout history, and program context.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Core;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * ContextManager Class
 * 
 * Aggregates and manages context data for prompt generation
 */
class ContextManager {
    /**
     * Profile context data (static user information)
     *
     * @var array
     */
    private $profileContext = [];

    /**
     * Session context data (current workout session)
     *
     * @var array
     */
    private $sessionContext = [];

    /**
     * History context data (previous workouts)
     *
     * @var array
     */
    private $historyContext = [];

    /**
     * Program context data (multi-week programs)
     *
     * @var array
     */
    private $programContext = [];

    /**
     * Environment context data (location, equipment, constraints)
     *
     * @var array
     */
    private $environmentContext = [];

    /**
     * Context priorities for conflict resolution
     *
     * @var array
     */
    private $contextPriorities = [
        'session' => 1,      // Highest priority - current session overrides
        'program' => 2,      // Program-level preferences
        'history' => 3,      // Historical patterns
        'profile' => 4,      // Base profile data
        'environment' => 5   // Environmental constraints
    ];

    /**
     * Add profile context data
     *
     * @param array $data Profile data
     * @return self
     */
    public function addProfileContext(array $data): self {
        $this->profileContext = array_merge($this->profileContext, $data);
        return $this;
    }

    /**
     * Add session context data
     *
     * @param array $data Session data
     * @return self
     */
    public function addSessionContext(array $data): self {
        $this->sessionContext = array_merge($this->sessionContext, $data);
        return $this;
    }

    /**
     * Add history context data
     *
     * @param array $data History data
     * @return self
     */
    public function addHistoryContext(array $data): self {
        $this->historyContext = array_merge($this->historyContext, $data);
        return $this;
    }

    /**
     * Add program context data
     *
     * @param array $data Program data
     * @return self
     */
    public function addProgramContext(array $data): self {
        $this->programContext = array_merge($this->programContext, $data);
        return $this;
    }

    /**
     * Add environment context data
     *
     * @param array $data Environment data
     * @return self
     */
    public function addEnvironmentContext(array $data): self {
        $this->environmentContext = array_merge($this->environmentContext, $data);
        return $this;
    }

    /**
     * Get profile context
     *
     * @return array
     */
    public function getProfileContext(): array {
        return $this->profileContext;
    }

    /**
     * Get session context
     *
     * @return array
     */
    public function getSessionContext(): array {
        return $this->sessionContext;
    }

    /**
     * Get history context
     *
     * @return array
     */
    public function getHistoryContext(): array {
        return $this->historyContext;
    }

    /**
     * Get program context
     *
     * @return array
     */
    public function getProgramContext(): array {
        return $this->programContext;
    }

    /**
     * Get environment context
     *
     * @return array
     */
    public function getEnvironmentContext(): array {
        return $this->environmentContext;
    }

    /**
     * Get all context data
     *
     * @return array
     */
    public function getAllContext(): array {
        return [
            'profile' => $this->profileContext,
            'session' => $this->sessionContext,
            'history' => $this->historyContext,
            'program' => $this->programContext,
            'environment' => $this->environmentContext
        ];
    }

    /**
     * Get merged context with priority resolution
     *
     * @return array Merged context data with conflicts resolved
     */
    public function getMergedContext(): array {
        $contexts = [
            'environment' => $this->environmentContext,
            'profile' => $this->profileContext,
            'history' => $this->historyContext,
            'program' => $this->programContext,
            'session' => $this->sessionContext
        ];

        $merged = [];
        
        // Merge contexts in priority order (lowest to highest priority)
        foreach ($contexts as $contextType => $contextData) {
            $merged = array_merge($merged, $contextData);
        }

        return $merged;
    }

    /**
     * Get a specific context value with priority resolution
     *
     * @param string $key The context key to retrieve
     * @param mixed $default Default value if key not found
     * @return mixed The context value
     */
    public function getContextValue(string $key, $default = null) {
        // Check contexts in priority order (highest to lowest)
        $contexts = [
            'session' => $this->sessionContext,
            'program' => $this->programContext,
            'history' => $this->historyContext,
            'profile' => $this->profileContext,
            'environment' => $this->environmentContext
        ];

        foreach ($contexts as $contextData) {
            if (isset($contextData[$key])) {
                return $contextData[$key];
            }
        }

        return $default;
    }

    /**
     * Check if any context data exists
     *
     * @return bool
     */
    public function hasAnyContext(): bool {
        return !empty($this->profileContext) || 
               !empty($this->sessionContext) || 
               !empty($this->historyContext) || 
               !empty($this->programContext) || 
               !empty($this->environmentContext);
    }

    /**
     * Check if specific context type exists
     *
     * @param string $contextType Context type to check
     * @return bool
     */
    public function hasContext(string $contextType): bool {
        switch ($contextType) {
            case 'profile':
                return !empty($this->profileContext);
            case 'session':
                return !empty($this->sessionContext);
            case 'history':
                return !empty($this->historyContext);
            case 'program':
                return !empty($this->programContext);
            case 'environment':
                return !empty($this->environmentContext);
            default:
                return false;
        }
    }

    /**
     * Get available context types
     *
     * @return array Array of available context types
     */
    public function getContextTypes(): array {
        $types = [];
        
        if (!empty($this->profileContext)) $types[] = 'profile';
        if (!empty($this->sessionContext)) $types[] = 'session';
        if (!empty($this->historyContext)) $types[] = 'history';
        if (!empty($this->programContext)) $types[] = 'program';
        if (!empty($this->environmentContext)) $types[] = 'environment';
        
        return $types;
    }

    /**
     * Get context summary for logging
     *
     * @return string Context summary
     */
    public function getSummary(): string {
        $summary = [];
        
        if (!empty($this->profileContext)) {
            $summary[] = 'profile(' . count($this->profileContext) . ')';
        }
        if (!empty($this->sessionContext)) {
            $summary[] = 'session(' . count($this->sessionContext) . ')';
        }
        if (!empty($this->historyContext)) {
            $summary[] = 'history(' . count($this->historyContext) . ')';
        }
        if (!empty($this->programContext)) {
            $summary[] = 'program(' . count($this->programContext) . ')';
        }
        if (!empty($this->environmentContext)) {
            $summary[] = 'environment(' . count($this->environmentContext) . ')';
        }
        
        return implode(', ', $summary);
    }

    /**
     * Clear all context data
     *
     * @return self
     */
    public function clearAll(): self {
        $this->profileContext = [];
        $this->sessionContext = [];
        $this->historyContext = [];
        $this->programContext = [];
        $this->environmentContext = [];
        return $this;
    }

    /**
     * Clear specific context type
     *
     * @param string $contextType Context type to clear
     * @return self
     */
    public function clearContext(string $contextType): self {
        switch ($contextType) {
            case 'profile':
                $this->profileContext = [];
                break;
            case 'session':
                $this->sessionContext = [];
                break;
            case 'history':
                $this->historyContext = [];
                break;
            case 'program':
                $this->programContext = [];
                break;
            case 'environment':
                $this->environmentContext = [];
                break;
        }
        return $this;
    }

    /**
     * Get context statistics
     *
     * @return array Context statistics
     */
    public function getStats(): array {
        return [
            'total_contexts' => count($this->getContextTypes()),
            'profile_fields' => count($this->profileContext),
            'session_fields' => count($this->sessionContext),
            'history_fields' => count($this->historyContext),
            'program_fields' => count($this->programContext),
            'environment_fields' => count($this->environmentContext),
            'total_fields' => count($this->getMergedContext()),
            'context_types' => $this->getContextTypes()
        ];
    }

    /**
     * Validate context data integrity
     *
     * @return array Array of validation errors
     */
    public function validate(): array {
        $errors = [];

        // Check for required profile fields
        if (!empty($this->profileContext)) {
            $requiredProfileFields = ['fitnessLevel'];
            foreach ($requiredProfileFields as $field) {
                if (!isset($this->profileContext[$field])) {
                    $errors[] = "Missing required profile field: {$field}";
                }
            }
        }

        // Check for required session fields
        if (!empty($this->sessionContext)) {
            $requiredSessionFields = ['duration'];
            foreach ($requiredSessionFields as $field) {
                if (!isset($this->sessionContext[$field])) {
                    $errors[] = "Missing required session field: {$field}";
                }
            }
        }

        return $errors;
    }
} 