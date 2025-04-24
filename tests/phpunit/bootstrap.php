<?php
/**
 * PHPUnit bootstrap file
 */

// First, let's try to load the WordPress test suite
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// If that doesn't exist, try a relative path to core test suite
if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	// Try the WordPress SVN development checkout
	if ( false !== getenv( 'WP_DEVELOP_DIR' ) ) {
		$_tests_dir = getenv( 'WP_DEVELOP_DIR' ) . '/tests/phpunit';
	}
}

// Now check if we found a valid path
if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL;
	exit( 1 );
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

/**
 * Register mock theme
 */
function _register_theme() {
	$theme_dir = dirname( __DIR__ ) . '/../..';
	$current_theme = basename( $theme_dir );

	register_theme_directory( dirname( $theme_dir ) );
	add_filter( 'pre_option_template', function() use ( $current_theme ) {
		return $current_theme;
	});
	add_filter( 'pre_option_stylesheet', function() use ( $current_theme ) {
		return $current_theme;
	});
}
tests_add_filter( 'muplugins_loaded', '_register_theme' );

/*
 * Load WordPress
 */
require $_tests_dir . '/includes/bootstrap.php';

/*
 * Load our plugin
 */
function _manually_load_plugin() {
	require dirname( dirname( __DIR__ ) ) . '/fitcopilot-generator.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' ); 