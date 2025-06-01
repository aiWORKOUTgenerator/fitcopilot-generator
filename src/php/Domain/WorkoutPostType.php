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

    // STORY 2.1 & 2.2: Add admin customizations
    add_action('add_meta_boxes', __NAMESPACE__ . '\\add_workout_meta_boxes');
    add_filter('manage_fc_workout_posts_columns', __NAMESPACE__ . '\\add_workout_admin_columns');
    add_action('manage_fc_workout_posts_custom_column', __NAMESPACE__ . '\\workout_admin_column_content', 10, 2);
    add_action('admin_enqueue_scripts', __NAMESPACE__ . '\\enqueue_admin_styles');
}
add_action('init', 'FitCopilot\\Domain\\register_workout_post_type');

/**
 * Add meta boxes for workout admin pages
 */
function add_workout_meta_boxes() {
    add_meta_box(
        'workout-details',
        __('Workout Details', 'fitcopilot-generator'),
        __NAMESPACE__ . '\\workout_details_meta_box',
        'fc_workout',
        'normal',
        'high'
    );
    
    add_meta_box(
        'workout-exercises',
        __('Exercises', 'fitcopilot-generator'),
        __NAMESPACE__ . '\\workout_exercises_meta_box',
        'fc_workout',
        'normal',
        'high'
    );
    
    add_meta_box(
        'workout-debug',
        __('Data Debug Info', 'fitcopilot-generator'),
        __NAMESPACE__ . '\\workout_debug_meta_box',
        'fc_workout',
        'side',
        'low'
    );
}

/**
 * Display workout details meta box
 */
function workout_details_meta_box($post) {
    $difficulty = get_post_meta($post->ID, '_workout_difficulty', true);
    $duration = get_post_meta($post->ID, '_workout_duration', true);
    $equipment = get_post_meta($post->ID, '_workout_equipment', true);
    $goals = get_post_meta($post->ID, '_workout_goals', true);
    $restrictions = get_post_meta($post->ID, '_workout_restrictions', true);
    $version = get_post_meta($post->ID, '_workout_version', true);
    $last_modified = get_post_meta($post->ID, '_workout_last_modified', true);
    
    echo '<table class="form-table">';
    echo '<tbody>';
    
    echo '<tr>';
    echo '<th scope="row"><label>' . __('Difficulty', 'fitcopilot-generator') . '</label></th>';
    echo '<td><strong>' . esc_html($difficulty ?: 'Not set') . '</strong></td>';
    echo '</tr>';
    
    echo '<tr>';
    echo '<th scope="row"><label>' . __('Duration', 'fitcopilot-generator') . '</label></th>';
    echo '<td><strong>' . esc_html($duration ?: 'Not set') . '</strong>' . ($duration ? ' minutes' : '') . '</td>';
    echo '</tr>';
    
    echo '<tr>';
    echo '<th scope="row"><label>' . __('Equipment', 'fitcopilot-generator') . '</label></th>';
    echo '<td>';
    if (is_array($equipment) && !empty($equipment)) {
        echo '<ul><li>' . implode('</li><li>', array_map('esc_html', $equipment)) . '</li></ul>';
    } else {
        echo '<em>' . __('No equipment required', 'fitcopilot-generator') . '</em>';
    }
    echo '</td>';
    echo '</tr>';
    
    echo '<tr>';
    echo '<th scope="row"><label>' . __('Goals', 'fitcopilot-generator') . '</label></th>';
    echo '<td>';
    if (is_array($goals) && !empty($goals)) {
        echo esc_html(implode(', ', $goals));
    } elseif (is_string($goals) && !empty($goals)) {
        echo esc_html($goals);
    } else {
        echo '<em>' . __('No specific goals', 'fitcopilot-generator') . '</em>';
    }
    echo '</td>';
    echo '</tr>';
    
    if (!empty($restrictions)) {
        echo '<tr>';
        echo '<th scope="row"><label>' . __('Restrictions', 'fitcopilot-generator') . '</label></th>';
        echo '<td>' . esc_html($restrictions) . '</td>';
        echo '</tr>';
    }
    
    echo '<tr>';
    echo '<th scope="row"><label>' . __('Version', 'fitcopilot-generator') . '</label></th>';
    echo '<td>' . esc_html($version ?: '1') . '</td>';
    echo '</tr>';
    
    if (!empty($last_modified)) {
        echo '<tr>';
        echo '<th scope="row"><label>' . __('Last Modified', 'fitcopilot-generator') . '</label></th>';
        echo '<td>' . esc_html(date('Y-m-d H:i:s', strtotime($last_modified))) . '</td>';
        echo '</tr>';
    }
    
    echo '</tbody>';
    echo '</table>';
}

/**
 * Display workout exercises meta box
 */
function workout_exercises_meta_box($post) {
    $workout_data_raw = get_post_meta($post->ID, '_workout_data', true);
    
    if (empty($workout_data_raw)) {
        echo '<div class="notice notice-warning inline">';
        echo '<p><strong>' . __('No exercise data found.', 'fitcopilot-generator') . '</strong></p>';
        echo '<p>' . __('This may indicate a data storage issue. Try re-generating or editing this workout.', 'fitcopilot-generator') . '</p>';
        echo '</div>';
        return;
    }
    
    $workout_data = json_decode($workout_data_raw, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo '<div class="notice notice-error inline">';
        echo '<p><strong>' . __('Error: Invalid exercise data format.', 'fitcopilot-generator') . '</strong></p>';
        echo '<p>' . sprintf(__('JSON Error: %s', 'fitcopilot-generator'), json_last_error_msg()) . '</p>';
        echo '<details><summary>' . __('Raw Data', 'fitcopilot-generator') . '</summary>';
        echo '<pre style="white-space: pre-wrap; font-size: 11px;">' . esc_html($workout_data_raw) . '</pre>';
        echo '</details>';
        echo '</div>';
        return;
    }
    
    $exercises = $workout_data['exercises'] ?? [];
    $sections = $workout_data['sections'] ?? [];
    
    if (empty($exercises)) {
        echo '<div class="notice notice-warning inline">';
        echo '<p><strong>' . __('No exercises found in workout data.', 'fitcopilot-generator') . '</strong></p>';
        
        // Check if exercises are in sections
        $sections_exercise_count = 0;
        foreach ($sections as $section) {
            if (isset($section['exercises']) && is_array($section['exercises'])) {
                $sections_exercise_count += count($section['exercises']);
            }
        }
        
        if ($sections_exercise_count > 0) {
            echo '<p>' . sprintf(__('Found %d exercises in sections but not extracted to main exercises array.', 'fitcopilot-generator'), $sections_exercise_count) . '</p>';
            echo '<p>' . __('This indicates a data migration issue.', 'fitcopilot-generator') . '</p>';
        }
        
        echo '<details><summary>' . __('Full Workout Data', 'fitcopilot-generator') . '</summary>';
        echo '<pre style="white-space: pre-wrap; font-size: 11px;">' . esc_html(print_r($workout_data, true)) . '</pre>';
        echo '</details>';
        echo '</div>';
        return;
    }
    
    echo '<div class="workout-exercises-admin">';
    echo '<p class="description">';
    echo sprintf(
        __('This workout contains <strong>%d exercises</strong>. Below is the complete exercise list:', 'fitcopilot-generator'),
        count($exercises)
    );
    echo '</p>';
    
    foreach ($exercises as $index => $exercise) {
        echo '<div class="exercise-item postbox" style="margin: 15px 0;">';
        echo '<div class="postbox-header">';
        echo '<h3 class="hndle"><span>' . sprintf(__('Exercise %d: %s', 'fitcopilot-generator'), $index + 1, esc_html($exercise['name'] ?? 'Unnamed Exercise')) . '</span></h3>';
        echo '</div>';
        echo '<div class="inside">';
        
        echo '<table class="form-table">';
        echo '<tbody>';
        
        // Exercise details
        if (isset($exercise['sets']) || isset($exercise['reps'])) {
            echo '<tr>';
            echo '<th scope="row">' . __('Sets & Reps', 'fitcopilot-generator') . '</th>';
            echo '<td>';
            if (isset($exercise['sets'])) {
                echo '<strong>' . esc_html($exercise['sets']) . '</strong> sets';
            }
            if (isset($exercise['reps'])) {
                if (isset($exercise['sets'])) echo ' × ';
                echo '<strong>' . esc_html($exercise['reps']) . '</strong> reps';
            }
            echo '</td>';
            echo '</tr>';
        }
        
        if (isset($exercise['duration'])) {
            echo '<tr>';
            echo '<th scope="row">' . __('Duration', 'fitcopilot-generator') . '</th>';
            echo '<td><strong>' . esc_html($exercise['duration']) . '</strong></td>';
            echo '</tr>';
        }
        
        if (isset($exercise['section'])) {
            echo '<tr>';
            echo '<th scope="row">' . __('Section', 'fitcopilot-generator') . '</th>';
            echo '<td>' . esc_html($exercise['section']) . '</td>';
            echo '</tr>';
        }
        
        if (!empty($exercise['description'])) {
            echo '<tr>';
            echo '<th scope="row">' . __('Description', 'fitcopilot-generator') . '</th>';
            echo '<td>' . esc_html($exercise['description']) . '</td>';
            echo '</tr>';
        }
        
        if (!empty($exercise['instructions'])) {
            echo '<tr>';
            echo '<th scope="row">' . __('Instructions', 'fitcopilot-generator') . '</th>';
            echo '<td>' . esc_html($exercise['instructions']) . '</td>';
            echo '</tr>';
        }
        
        echo '</tbody>';
        echo '</table>';
        
        echo '</div>';
        echo '</div>';
    }
    echo '</div>';
}

/**
 * Display workout debug meta box
 */
function workout_debug_meta_box($post) {
    $workout_data_raw = get_post_meta($post->ID, '_workout_data', true);
    $has_content = !empty(trim($post->post_content));
    $has_data = !empty($workout_data_raw);
    
    echo '<div class="debug-info">';
    
    // Data status
    echo '<h4>' . __('Data Status', 'fitcopilot-generator') . '</h4>';
    echo '<ul>';
    
    if ($has_content && $has_data) {
        echo '<li style="color: green;">✓ ' . __('Complete data (content + exercises)', 'fitcopilot-generator') . '</li>';
    } elseif ($has_data) {
        echo '<li style="color: orange;">⚠ ' . __('Has exercises but no content', 'fitcopilot-generator') . '</li>';
    } elseif ($has_content) {
        echo '<li style="color: orange;">⚠ ' . __('Has content but no exercises', 'fitcopilot-generator') . '</li>';
    } else {
        echo '<li style="color: red;">✗ ' . __('Missing both content and exercises', 'fitcopilot-generator') . '</li>';
    }
    
    echo '</ul>';
    
    // Data sizes
    echo '<h4>' . __('Data Sizes', 'fitcopilot-generator') . '</h4>';
    echo '<ul>';
    echo '<li>' . __('Content:', 'fitcopilot-generator') . ' ' . strlen($post->post_content) . ' chars</li>';
    echo '<li>' . __('Exercise Data:', 'fitcopilot-generator') . ' ' . strlen($workout_data_raw) . ' chars</li>';
    echo '</ul>';
    
    // Metadata info
    $metadata_fields = ['_workout_difficulty', '_workout_duration', '_workout_equipment', '_workout_goals'];
    $metadata_count = 0;
    foreach ($metadata_fields as $field) {
        if (!empty(get_post_meta($post->ID, $field, true))) {
            $metadata_count++;
        }
    }
    
    echo '<h4>' . __('Metadata Fields', 'fitcopilot-generator') . '</h4>';
    echo '<p>' . sprintf(__('%d of %d fields populated', 'fitcopilot-generator'), $metadata_count, count($metadata_fields)) . '</p>';
    
    echo '</div>';
}

/**
 * Add custom columns to workout admin list
 */
function add_workout_admin_columns($columns) {
    $new_columns = [];
    
    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;
        
        if ($key === 'title') {
            $new_columns['difficulty'] = __('Difficulty', 'fitcopilot-generator');
            $new_columns['duration'] = __('Duration', 'fitcopilot-generator');
            $new_columns['exercises'] = __('Exercises', 'fitcopilot-generator');
            $new_columns['data_status'] = __('Data Status', 'fitcopilot-generator');
        }
    }
    
    return $new_columns;
}

/**
 * Display content for custom admin columns
 */
function workout_admin_column_content($column, $post_id) {
    switch ($column) {
        case 'difficulty':
            $difficulty = get_post_meta($post_id, '_workout_difficulty', true);
            if ($difficulty) {
                $difficulty_colors = [
                    'beginner' => '#28a745',
                    'intermediate' => '#ffc107', 
                    'advanced' => '#dc3545'
                ];
                $color = $difficulty_colors[$difficulty] ?? '#6c757d';
                echo '<span style="background: ' . $color . '; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">';
                echo esc_html(ucfirst($difficulty));
                echo '</span>';
            } else {
                echo '<span style="color: #999;">Not set</span>';
            }
            break;
            
        case 'duration':
            $duration = get_post_meta($post_id, '_workout_duration', true);
            if ($duration) {
                echo '<strong>' . esc_html($duration) . '</strong> min';
            } else {
                echo '<span style="color: #999;">Not set</span>';
            }
            break;
            
        case 'exercises':
            $workout_data = get_post_meta($post_id, '_workout_data', true);
            if ($workout_data) {
                $data = json_decode($workout_data, true);
                $exercises = $data['exercises'] ?? [];
                $count = count($exercises);
                
                if ($count > 0) {
                    echo '<strong>' . $count . '</strong> exercise' . ($count !== 1 ? 's' : '');
                } else {
                    // Check if exercises are in sections
                    $sections_count = 0;
                    foreach ($data['sections'] ?? [] as $section) {
                        if (isset($section['exercises']) && is_array($section['exercises'])) {
                            $sections_count += count($section['exercises']);
                        }
                    }
                    
                    if ($sections_count > 0) {
                        echo '<span style="color: orange;" title="Exercises found in sections but not extracted">';
                        echo $sections_count . ' in sections';
                        echo '</span>';
                    } else {
                        echo '<span style="color: red;">No exercises</span>';
                    }
                }
            } else {
                echo '<span style="color: red;">No data</span>';
            }
            break;
            
        case 'data_status':
            $has_content = !empty(trim(get_post_field('post_content', $post_id)));
            $has_data = !empty(get_post_meta($post_id, '_workout_data', true));
            
            if ($has_content && $has_data) {
                echo '<span style="color: green; font-weight: bold;">✓ Complete</span>';
            } elseif ($has_data) {
                echo '<span style="color: orange;">⚠ No notes</span>';
            } elseif ($has_content) {
                echo '<span style="color: orange;">⚠ No exercises</span>';
            } else {
                echo '<span style="color: red;">✗ Missing data</span>';
            }
            break;
    }
}

/**
 * Enqueue admin styles for workout pages
 */
function enqueue_admin_styles($hook) {
    global $post_type;
    
    if ('fc_workout' === $post_type) {
        wp_add_inline_style('wp-admin', '
            .workout-exercises-admin .exercise-item {
                margin-bottom: 20px;
            }
            .workout-exercises-admin .exercise-item .inside {
                padding: 15px;
            }
            .debug-info h4 {
                margin: 10px 0 5px 0;
                font-size: 13px;
            }
            .debug-info ul {
                margin: 5px 0 15px 0;
                padding-left: 20px;
            }
            .debug-info li {
                margin: 5px 0;
                font-size: 12px;
            }
        ');
    }
} 