<?php
/**
 * PromptStrategyInterface - Strategy Pattern Interface
 * 
 * Defines the contract for different prompt generation strategies.
 * Allows for pluggable prompt composition approaches for different use cases.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Strategies;

use FitCopilot\Service\AI\PromptEngineering\Core\ContextManager;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PromptStrategyInterface
 * 
 * Interface for prompt generation strategies
 */
interface PromptStrategyInterface {
    /**
     * Build a prompt using the provided context and options
     *
     * @param ContextManager $contextManager Context data manager
     * @param array $options Additional options for prompt generation
     * @return string The generated prompt
     */
    public function buildPrompt(ContextManager $contextManager, array $options = []): string;

    /**
     * Validate the context and options for this strategy
     *
     * @param ContextManager $contextManager Context data manager
     * @param array $options Additional options
     * @return array Array of validation errors (empty if valid)
     */
    public function validate(ContextManager $contextManager, array $options = []): array;

    /**
     * Get the strategy name
     *
     * @return string Strategy name
     */
    public function getName(): string;

    /**
     * Get the strategy description
     *
     * @return string Strategy description
     */
    public function getDescription(): string;

    /**
     * Get required context types for this strategy
     *
     * @return array Array of required context types
     */
    public function getRequiredContextTypes(): array;

    /**
     * Get supported options for this strategy
     *
     * @return array Array of supported option keys
     */
    public function getSupportedOptions(): array;

    /**
     * Get estimated token usage for this strategy
     *
     * @param ContextManager $contextManager Context data manager
     * @param array $options Additional options
     * @return int Estimated token count
     */
    public function estimateTokenUsage(ContextManager $contextManager, array $options = []): int;
} 