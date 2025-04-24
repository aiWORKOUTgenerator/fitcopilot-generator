<?php
/**
 * Workout Custom Post Type Registration
 */

namespace FitCopilot\Domain;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register workout custom post type and taxonomies
 */
function register_workout_post_type() {
    $labels = [
        'name'               => __('Workouts', 'fitcopilot-generator'),
        'singular_name'      => __('Workout', 'fitcopilot-generator'),
        'menu_name'          => __('Workouts', 'fitcopilot-generator'),
        'name_admin_bar'     => __('Workout', 'fitcopilot-generator'),
        'add_new'            => __('Add New', 'fitcopilot-generator'),
        'add_new_item'       => __('Add New Workout', 'fitcopilot-generator'),
        'new_item'           => __('New Workout', 'fitcopilot-generator'),
        'edit_item'          => __('Edit Workout', 'fitcopilot-generator'),
        'view_item'          => __('View Workout', 'fitcopilot-generator'),
        'all_items'          => __('All Workouts', 'fitcopilot-generator'),
        'search_items'       => __('Search Workouts', 'fitcopilot-generator'),
        'parent_item_colon'  => __('Parent Workouts:', 'fitcopilot-generator'),
        'not_found'          => __('No workouts found.', 'fitcopilot-generator'),
        'not_found_in_trash' => __('No workouts found in Trash.', 'fitcopilot-generator')
    ];

    $args = [
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => ['slug' => 'workout'],
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 20,
        'menu_icon'          => 'dashicons-heart',
        'supports'           => ['title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments'],
        'show_in_rest'       => true,
    ];

    register_post_type('fc_workout', $args);
    
    // Register workout equipment taxonomy
    register_taxonomy(
        'workout_equipment',
        'fc_workout',
        [
            'label' => __('Equipment', 'fitcopilot-generator'),
            'hierarchical' => false,
            'show_admin_column' => true,
            'show_in_rest' => true,
            'rewrite' => ['slug' => 'workout-equipment'],
        ]
    );
    
    // Register workout type taxonomy
    register_taxonomy(
        'workout_type',
        'fc_workout',
        [
            'label' => __('Workout Type', 'fitcopilot-generator'),
            'hierarchical' => true,
            'show_admin_column' => true,
            'show_in_rest' => true,
            'rewrite' => ['slug' => 'workout-type'],
        ]
    );
    
    // Register custom meta fields
    register_post_meta(
        'fc_workout',
        'workout_duration',
        [
            'type' => 'integer',
            'description' => __('Workout duration in minutes', 'fitcopilot-generator'),
            'single' => true,
            'show_in_rest' => true,
        ]
    );
    
    register_post_meta(
        'fc_workout',
        'workout_difficulty',
        [
            'type' => 'string',
            'description' => __('Workout difficulty level', 'fitcopilot-generator'),
            'single' => true,
            'show_in_rest' => true,
        ]
    );
    
    register_post_meta(
        'fc_workout',
        'ai_prompt',
        [
            'type' => 'string',
            'description' => __('AI prompt used to generate the workout', 'fitcopilot-generator'),
            'single' => true,
            'show_in_rest' => false,
        ]
    );
    
    register_post_meta(
        'fc_workout',
        'ai_response',
        [
            'type' => 'string',
            'description' => __('Raw AI response for the workout', 'fitcopilot-generator'),
            'single' => true,
            'show_in_rest' => false,
        ]
    );
}
add_action('init', 'FitCopilot\\Domain\\register_workout_post_type'); 