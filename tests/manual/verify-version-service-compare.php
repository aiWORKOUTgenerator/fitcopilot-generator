<?php
/**
 * Verification script for VersioningServiceCompare class implementation
 * 
 * This script can be run directly from the command line without WordPress.
 * It only checks the class structure and not the functionality.
 */

// Directory paths
$plugin_dir = dirname(dirname(__DIR__));
$src_dir = $plugin_dir . '/src/php';

// Title
echo "\n-----------------------------------------\n";
echo "VERSIONING SERVICE COMPARE VERIFICATION\n";
echo "-----------------------------------------\n\n";

// Check if our files exist
$files_to_check = [
    $src_dir . '/Service/Versioning/VersioningServiceCompare.php',
    $src_dir . '/Service/Versioning/VersioningService.php',
    $src_dir . '/API/WorkoutEndpoints/CompareVersionsEndpoint.php'
];

$all_files_exist = true;
foreach ($files_to_check as $file) {
    $exists = file_exists($file);
    echo ($exists ? "✅" : "❌") . " File: " . basename($file) . " - " . ($exists ? "exists" : "not found") . "\n";
    $all_files_exist = $all_files_exist && $exists;
}

if (!$all_files_exist) {
    echo "\n❌ Some required files are missing. Implementation verification failed.\n";
    exit(1);
}

// Check if VersioningServiceCompare class file contains required methods
$compare_service_file = file_get_contents($src_dir . '/Service/Versioning/VersioningServiceCompare.php');
$has_compare_method = strpos($compare_service_file, 'public function compare_workout_versions') !== false;
$has_field_diff_method = strpos($compare_service_file, 'private function generate_field_diff') !== false;
$has_metadata_compare = strpos($compare_service_file, 'private function compare_metadata') !== false;
$has_summary_method = strpos($compare_service_file, 'private function generate_comparison_summary') !== false;

echo "\n";
echo ($has_compare_method ? "✅" : "❌") . " VersioningServiceCompare has compare_workout_versions method\n";
echo ($has_field_diff_method ? "✅" : "❌") . " VersioningServiceCompare has generate_field_diff method\n";
echo ($has_metadata_compare ? "✅" : "❌") . " VersioningServiceCompare has compare_metadata method\n";
echo ($has_summary_method ? "✅" : "❌") . " VersioningServiceCompare has generate_comparison_summary method\n";

// Check if VersioningService now uses VersioningServiceCompare
$service_file = file_get_contents($src_dir . '/Service/Versioning/VersioningService.php');
$uses_compare_service = strpos($service_file, 'new VersioningServiceCompare()') !== false;
$delegate_compare = strpos($service_file, 'return $compare_service->compare_workout_versions') !== false;

echo "\n";
echo ($uses_compare_service ? "✅" : "❌") . " VersioningService instantiates VersioningServiceCompare\n";
echo ($delegate_compare ? "✅" : "❌") . " VersioningService delegates comparison to VersioningServiceCompare\n";

// Check if CompareVersionsEndpoint has been updated
$endpoint_file = file_get_contents($src_dir . '/API/WorkoutEndpoints/CompareVersionsEndpoint.php');
$imports_compare_service = strpos($endpoint_file, 'use FitCopilot\Service\Versioning\VersioningServiceCompare') !== false;
$uses_compare_service_directly = strpos($endpoint_file, 'new VersioningServiceCompare()') !== false;

echo "\n";
echo ($imports_compare_service ? "✅" : "❌") . " CompareVersionsEndpoint imports VersioningServiceCompare\n";
echo ($uses_compare_service_directly ? "✅" : "❌") . " CompareVersionsEndpoint uses VersioningServiceCompare directly\n";

// Overall result
$overall = $all_files_exist && $has_compare_method && $has_field_diff_method && 
           $has_metadata_compare && $has_summary_method && $uses_compare_service && 
           $delegate_compare && $imports_compare_service && $uses_compare_service_directly;

echo "\n-----------------------------------------\n";
echo "Refactoring verification completed " . ($overall ? "successfully" : "with issues") . "!\n";
echo "-----------------------------------------\n\n";

if ($overall) {
    echo "The following changes have been made:\n\n";
    echo "1. Created new src/php/Service/Versioning/VersioningServiceCompare.php with:\n";
    echo "   - compare_workout_versions() method\n";
    echo "   - generate_field_diff() method\n";
    echo "   - compare_metadata() method\n";
    echo "   - generate_comparison_summary() method\n\n";
    
    echo "2. Updated src/php/Service/Versioning/VersioningService.php to:\n";
    echo "   - Delegate comparison functionality to VersioningServiceCompare\n\n";
    
    echo "3. Updated src/php/API/WorkoutEndpoints/CompareVersionsEndpoint.php to:\n";
    echo "   - Use VersioningServiceCompare directly\n\n";
    
    echo "This refactoring improves code organization by extracting the comparison\n";
    echo "functionality into a dedicated class, making the codebase more maintainable.\n\n";

    echo "-----------------------------------------\n";
    echo "✅ Refactoring verification successful!\n";
    echo "-----------------------------------------\n";
    exit(0);
} else {
    echo "Some issues were found with the refactoring. Please review the output above.\n\n";
    
    echo "-----------------------------------------\n";
    echo "❌ Refactoring verification failed!\n";
    echo "-----------------------------------------\n";
    exit(1);
} 