<?php
/**
 * TestingLabView - Renders the Testing Lab page
 */

namespace FitCopilot\Admin\Debug\Views;

if (!defined('ABSPATH')) {
    exit;
}

class TestingLabView {
    
    public function render(): void {
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">
                <span class="dashicons dashicons-flask"></span>
                Testing Lab
            </h1>
            
            <div class="testing-lab-container">
                <div class="testing-section">
                    <h2>Workout Generation Test</h2>
                    <p>Test the workout generation functionality with custom parameters.</p>
                    <button id="test-workout-generation" class="button button-primary" data-test-action="test-workout-generation">
                        Test Workout Generation
                    </button>
                </div>
                
                <div class="testing-section">
                    <h2>Prompt Building Test</h2>
                    <p>Test the prompt building functionality.</p>
                    <button id="test-prompt-building" class="button button-secondary" data-test-action="test-prompt-building">
                        Test Prompt Building
                    </button>
                </div>
                
                <div class="testing-section">
                    <h2>Context Validation</h2>
                    <p>Validate context data structure and completeness.</p>
                    <button id="test-context-validation" class="button button-secondary" data-test-action="test-context-validation">
                        Test Context Validation
                    </button>
                </div>
                
                <div class="testing-section">
                    <h2>Performance Test</h2>
                    <p>Run performance benchmarks on the system.</p>
                    <button id="test-performance" class="button button-secondary" data-test-action="test-performance">
                        Test Performance
                    </button>
                </div>
                
                <div class="test-results-section">
                    <h2>Test Results</h2>
                    <div id="test-results" class="test-results">
                        <p>Click a test button above to see results here.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .testing-lab-container {
            margin-top: 20px;
        }
        
        .testing-section {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .testing-section h2 {
            margin-top: 0;
        }
        
        .test-results-section {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 20px;
        }
        
        .test-results {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            min-height: 200px;
            font-family: monospace;
            white-space: pre-wrap;
        }
        </style>
        <?php
    }
} 