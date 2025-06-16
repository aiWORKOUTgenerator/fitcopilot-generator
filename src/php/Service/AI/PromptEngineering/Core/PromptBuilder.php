<?php
/**
 * PromptBuilder - Main Prompt Composition Engine
 * 
 * Central class for building AI prompts using modular components and strategies.
 * Supports different prompt generation strategies for various use cases.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Core;

use FitCopilot\Service\AI\PromptEngineering\Strategies\PromptStrategyInterface;
use FitCopilot\Service\AI\PromptEngineering\Core\ContextManager;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PromptBuilder Class
 * 
 * Main composition engine for building AI prompts from modular components
 */
class PromptBuilder {
    /**
     * Current prompt strategy
     *
     * @var PromptStrategyInterface
     */
    private $strategy;

    /**
     * Context manager instance
     *
     * @var ContextManager
     */
    private $contextManager;

    /**
     * Additional prompt options
     *
     * @var array
     */
    private $options = [];

    /**
     * Built prompt cache
     *
     * @var string|null
     */
    private $cachedPrompt = null;

    /**
     * Constructor
     */
    public function __construct() {
        $this->contextManager = new ContextManager();
    }

    /**
     * Set the prompt generation strategy
     *
     * @param PromptStrategyInterface $strategy The strategy to use
     * @return self
     */
    public function useStrategy(PromptStrategyInterface $strategy): self {
        $this->strategy = $strategy;
        $this->cachedPrompt = null; // Clear cache when strategy changes
        return $this;
    }

    /**
     * Set the context manager
     *
     * @param ContextManager $contextManager Context manager instance
     * @return self
     */
    public function withContext(ContextManager $contextManager): self {
        $this->contextManager = $contextManager;
        $this->cachedPrompt = null; // Clear cache when context changes
        return $this;
    }

    /**
     * Add profile context data
     *
     * @param array $profileData User profile data
     * @return self
     */
    public function withProfileContext(array $profileData): self {
        $this->contextManager->addProfileContext($profileData);
        $this->cachedPrompt = null;
        return $this;
    }

    /**
     * Add session context data
     *
     * @param array $sessionData Workout session data
     * @return self
     */
    public function withSessionContext(array $sessionData): self {
        $this->contextManager->addSessionContext($sessionData);
        $this->cachedPrompt = null;
        return $this;
    }

    /**
     * Add workout history context
     *
     * @param array $historyData Previous workout summaries
     * @return self
     */
    public function withHistoryContext(array $historyData): self {
        $this->contextManager->addHistoryContext($historyData);
        $this->cachedPrompt = null;
        return $this;
    }

    /**
     * Add program context data
     *
     * @param array $programData Multi-week program context
     * @return self
     */
    public function withProgramContext(array $programData): self {
        $this->contextManager->addProgramContext($programData);
        $this->cachedPrompt = null;
        return $this;
    }

    /**
     * Set additional options
     *
     * @param array $options Additional prompt options
     * @return self
     */
    public function withOptions(array $options): self {
        $this->options = array_merge($this->options, $options);
        $this->cachedPrompt = null;
        return $this;
    }

    /**
     * Build the final prompt
     *
     * @return string The composed prompt
     * @throws \Exception If no strategy is set
     */
    public function build(): string {
        if (!$this->strategy) {
            throw new \Exception('No prompt strategy set. Use useStrategy() to set a strategy.');
        }

        // Return cached prompt if available and no changes made
        if ($this->cachedPrompt !== null) {
            return $this->cachedPrompt;
        }

        // Build the prompt using the current strategy
        $this->cachedPrompt = $this->strategy->buildPrompt($this->contextManager, $this->options);

        // Log prompt generation for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $strategyName = get_class($this->strategy);
            $contextSummary = $this->contextManager->getSummary();
            error_log("[PromptBuilder] Generated prompt using {$strategyName}. Context: {$contextSummary}");
        }

        return $this->cachedPrompt;
    }

    /**
     * Get the current strategy
     *
     * @return PromptStrategyInterface|null
     */
    public function getStrategy(): ?PromptStrategyInterface {
        return $this->strategy;
    }

    /**
     * Get the context manager
     *
     * @return ContextManager
     */
    public function getContextManager(): ContextManager {
        return $this->contextManager;
    }

    /**
     * Get current options
     *
     * @return array
     */
    public function getOptions(): array {
        return $this->options;
    }

    /**
     * Clear the cached prompt
     *
     * @return self
     */
    public function clearCache(): self {
        $this->cachedPrompt = null;
        return $this;
    }

    /**
     * Reset the builder to initial state
     *
     * @return self
     */
    public function reset(): self {
        $this->strategy = null;
        $this->contextManager = new ContextManager();
        $this->options = [];
        $this->cachedPrompt = null;
        return $this;
    }

    /**
     * Create a new PromptBuilder instance (factory method)
     *
     * @return self
     */
    public static function create(): self {
        return new self();
    }

    /**
     * Validate the current configuration
     *
     * @return array Array of validation errors (empty if valid)
     */
    public function validate(): array {
        $errors = [];

        if (!$this->strategy) {
            $errors[] = 'No prompt strategy set';
        }

        if (!$this->contextManager->hasAnyContext()) {
            $errors[] = 'No context data provided';
        }

        // Let the strategy validate its specific requirements
        if ($this->strategy) {
            $strategyErrors = $this->strategy->validate($this->contextManager, $this->options);
            $errors = array_merge($errors, $strategyErrors);
        }

        return $errors;
    }

    /**
     * Get prompt statistics
     *
     * @return array Prompt statistics
     */
    public function getStats(): array {
        if (!$this->cachedPrompt) {
            return ['error' => 'No prompt built yet'];
        }

        return [
            'character_count' => strlen($this->cachedPrompt),
            'word_count' => str_word_count($this->cachedPrompt),
            'estimated_tokens' => $this->estimateTokenCount($this->cachedPrompt),
            'strategy' => $this->strategy ? get_class($this->strategy) : 'None',
            'context_types' => $this->contextManager->getContextTypes(),
            'options_count' => count($this->options)
        ];
    }

    /**
     * Estimate token count for the prompt
     *
     * @param string $text Text to analyze
     * @return int Estimated token count
     */
    private function estimateTokenCount(string $text): int {
        // Rough estimation: ~4 characters per token for English text
        // This is a simplified estimation; actual tokenization may vary
        return (int) ceil(strlen($text) / 4);
    }
} 