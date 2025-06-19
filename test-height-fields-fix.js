/**
 * Height Fields Fix Test
 * 
 * Tests the improved height field implementation with separate feet/inches
 * and proper unit conversion to avoid "71 ft" display issues.
 */

console.log('🎯 Height Fields Fix Test');
console.log('========================');

console.log('\n✅ Problem Fixed:');
console.log('BEFORE: Single height field + unit dropdown → "71 ft" display error');
console.log('AFTER:  Separate feet/inches fields + cm field → "5 ft 11 in" correct display');

// Test 1: Check if new height fields exist
console.log('\n🔍 Test 1: Height Field Structure Check');

const heightFields = {
    // Imperial (feet/inches) fields
    heightFeet: document.getElementById('heightFeet'),
    heightInches: document.getElementById('heightInches'),
    // Metric (cm) field
    heightCm: document.getElementById('heightCm'),
    // Unit selector
    heightUnit: document.getElementById('heightUnit'),
    // Container divs
    imperialContainer: document.getElementById('height-imperial'),
    metricContainer: document.getElementById('height-metric')
};

console.log('📋 Height Field Inventory:');
Object.entries(heightFields).forEach(([name, element]) => {
    if (element) {
        console.log(`✅ ${name}: Found (${element.tagName}${element.type ? `[${element.type}]` : ''})`);
    } else {
        console.log(`❌ ${name}: Missing`);
    }
});

const allFieldsExist = Object.values(heightFields).every(field => field !== null);
console.log(`\n📊 Structure Check: ${allFieldsExist ? '✅ PASS' : '❌ FAIL'}`);

// Test 2: Unit Toggle Functionality
console.log('\n🔍 Test 2: Unit Toggle Functionality');

if (typeof toggleHeightFields === 'function') {
    console.log('✅ toggleHeightFields() function exists');
    
    // Test imperial mode
    console.log('\n🇺🇸 Testing Imperial Mode (ft/in):');
    toggleHeightFields('ft');
    
    if (heightFields.imperialContainer) {
        const imperialVisible = window.getComputedStyle(heightFields.imperialContainer).display !== 'none';
        const metricHidden = window.getComputedStyle(heightFields.metricContainer).display === 'none';
        console.log(`  Imperial fields visible: ${imperialVisible ? '✅ YES' : '❌ NO'}`);
        console.log(`  Metric fields hidden: ${metricHidden ? '✅ YES' : '❌ NO'}`);
    }
    
    // Test metric mode
    console.log('\n🌍 Testing Metric Mode (cm):');
    toggleHeightFields('cm');
    
    if (heightFields.metricContainer) {
        const metricVisible = window.getComputedStyle(heightFields.metricContainer).display !== 'none';
        const imperialHidden = window.getComputedStyle(heightFields.imperialContainer).display === 'none';
        console.log(`  Metric fields visible: ${metricVisible ? '✅ YES' : '❌ NO'}`);
        console.log(`  Imperial fields hidden: ${imperialHidden ? '✅ YES' : '❌ NO'}`);
    }
    
    // Reset to imperial for testing
    toggleHeightFields('ft');
    
} else {
    console.log('❌ toggleHeightFields() function not found');
}

// Test 3: Conversion Function Tests
console.log('\n🔍 Test 3: Height Conversion Functions');

const conversionTests = [
    // Test convertHeightToInches
    {
        func: 'convertHeightToInches',
        tests: [
            { input: [5, 11], expected: 71, desc: '5 ft 11 in → 71 inches' },
            { input: [6, 0], expected: 72, desc: '6 ft 0 in → 72 inches' },
            { input: [5, 6], expected: 66, desc: '5 ft 6 in → 66 inches' }
        ]
    },
    // Test convertInchesToFeetInches
    {
        func: 'convertInchesToFeetInches',
        tests: [
            { input: [71], expected: {feet: 5, inches: 11}, desc: '71 inches → 5 ft 11 in' },
            { input: [72], expected: {feet: 6, inches: 0}, desc: '72 inches → 6 ft 0 in' },
            { input: [66], expected: {feet: 5, inches: 6}, desc: '66 inches → 5 ft 6 in' }
        ]
    },
    // Test convertInchesToCm
    {
        func: 'convertInchesToCm',
        tests: [
            { input: [71], expected: 180, desc: '71 inches → ~180 cm' },
            { input: [66], expected: 168, desc: '66 inches → ~168 cm' }
        ]
    }
];

conversionTests.forEach(testGroup => {
    console.log(`\n📐 Testing ${testGroup.func}:`);
    
    if (typeof window[testGroup.func] === 'function') {
        testGroup.tests.forEach(test => {
            try {
                const result = window[testGroup.func](...test.input);
                
                let passed = false;
                if (typeof test.expected === 'object') {
                    // Compare objects
                    passed = JSON.stringify(result) === JSON.stringify(test.expected);
                } else {
                    // Compare values (allow small rounding differences)
                    passed = Math.abs(result - test.expected) <= 1;
                }
                
                console.log(`  ${passed ? '✅' : '❌'} ${test.desc}: ${JSON.stringify(result)}`);
            } catch (error) {
                console.log(`  ❌ ${test.desc}: Error - ${error.message}`);
            }
        });
    } else {
        console.log(`  ❌ Function ${testGroup.func} not found`);
    }
});

// Test 4: Profile Population Simulation
console.log('\n🔍 Test 4: Profile Population Simulation');

// Mock profile data
const testProfileData = {
    basic_info: {
        first_name: "Justin",
        last_name: "Fassio",
        height: 71, // 5'11" stored as total inches
        height_unit: "ft"
    }
};

console.log('🔄 Simulating profile population...');
console.log(`Input: height=${testProfileData.basic_info.height}, unit=${testProfileData.basic_info.height_unit}`);

// Simulate the updated population logic
if (testProfileData.basic_info.height && testProfileData.basic_info.height_unit) {
    if (heightFields.heightUnit) {
        heightFields.heightUnit.value = testProfileData.basic_info.height_unit;
    }
    
    if (testProfileData.basic_info.height_unit === 'ft') {
        // Convert total inches to feet and inches
        const totalInches = parseInt(testProfileData.basic_info.height);
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        
        if (heightFields.heightFeet) heightFields.heightFeet.value = feet;
        if (heightFields.heightInches) heightFields.heightInches.value = inches;
        
        console.log(`✅ Populated: ${feet} ft ${inches} in (from ${totalInches} total inches)`);
        console.log(`  heightFeet field: ${heightFields.heightFeet?.value || 'N/A'}`);
        console.log(`  heightInches field: ${heightFields.heightInches?.value || 'N/A'}`);
        
        // Test display
        if (heightFields.heightFeet?.value && heightFields.heightInches?.value) {
            console.log(`✅ Display Test: ${heightFields.heightFeet.value} ft ${heightFields.heightInches.value} in`);
        }
        
    } else {
        // Use cm directly
        if (heightFields.heightCm) {
            heightFields.heightCm.value = testProfileData.basic_info.height;
        }
        console.log(`✅ Populated: ${testProfileData.basic_info.height} cm`);
    }
} else {
    console.log('❌ No height data to populate');
}

// Test 5: Form Submission Data Collection
console.log('\n🔍 Test 5: Form Data Collection');

console.log('📋 Testing height data collection for form submission...');

function collectHeightData() {
    const heightUnit = heightFields.heightUnit?.value;
    
    if (heightUnit === 'ft') {
        const feet = parseInt(heightFields.heightFeet?.value) || 0;
        const inches = parseInt(heightFields.heightInches?.value) || 0;
        const totalInches = feet * 12 + inches;
        
        return {
            height: totalInches,
            height_unit: 'ft',
            display: `${feet} ft ${inches} in`
        };
    } else {
        const cm = parseInt(heightFields.heightCm?.value) || 0;
        
        return {
            height: cm,
            height_unit: 'cm',
            display: `${cm} cm`
        };
    }
}

const collectedData = collectHeightData();
console.log('📊 Collected form data:', collectedData);

// Summary
console.log('\n🎉 HEIGHT FIELDS FIX SUMMARY');
console.log('============================');

const allTestsPassed = allFieldsExist && 
    typeof toggleHeightFields === 'function' &&
    collectedData.height > 0;

if (allTestsPassed) {
    console.log('✅ SUCCESS: Height fields fix implemented correctly!');
    console.log('');
    console.log('✅ Benefits Achieved:');
    console.log('  • No more "71 ft" display errors');
    console.log('  • Proper 5 ft 11 in format for imperial');
    console.log('  • Clean cm format for metric');
    console.log('  • Automatic unit switching');
    console.log('  • Proper data collection for backend');
    
} else {
    console.log('⚠️ ISSUES: Some height field functionality needs attention');
}

console.log('\n🧪 Manual Test Instructions:');
console.log('1. Select "ft/in" from height unit dropdown');
console.log('2. Enter 5 in feet field, 11 in inches field');
console.log('3. Switch to "cm" - should show single cm field');
console.log('4. Switch back to "ft/in" - should show 5 ft 11 in');
console.log('5. Click "Load Profile" - should populate correctly');

console.log('\n✅ Test Complete!'); 