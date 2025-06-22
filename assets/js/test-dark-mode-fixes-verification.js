/**
 * Dark Mode Fixes Verification Test
 * Run this after implementing the CSS fixes to verify improvements
 */

console.log('🔧 VERIFYING DARK MODE FIXES');
console.log('============================');

// Test current theme
const currentTheme = document.documentElement.getAttribute('data-theme');
console.log(`Current theme: ${currentTheme || 'light'}`);

// Switch to dark mode for testing if not already
if (currentTheme !== 'dark' && window.FitCopilotDarkMode) {
    window.FitCopilotDarkMode.setTheme('dark');
    console.log('Switched to dark mode for testing...');
}

setTimeout(() => {
    console.log('\n🧪 TESTING FIXES...');
    
    // Test 1: Form Elements (Previously 20/26 had white backgrounds)
    console.log('\n1. Form Elements Test:');
    const formElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    let fixedFormElements = 0;
    
    formElements.forEach((el, index) => {
        const styles = getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        
        // Check if background is now dark (should be --bg-primary which is #0f172a in dark mode)
        const isDarkBackground = bgColor.includes('15, 23, 42') || // rgb(15, 23, 42) = #0f172a
                                 bgColor.includes('30, 41, 59') || // rgb(30, 41, 59) = #1e293b  
                                 !bgColor.includes('255, 255, 255'); // Not white
        
        if (isDarkBackground) {
            fixedFormElements++;
        }
    });
    
    const formFixRate = ((fixedFormElements / formElements.length) * 100).toFixed(1);
    console.log(`✅ Form Elements Fixed: ${fixedFormElements}/${formElements.length} (${formFixRate}%)`);
    
    if (formFixRate < 90) {
        console.log('⚠️  Some form elements may still need fixing');
    }
    
    // Test 2: Preview Systems (Previously 3/4 had light backgrounds)
    console.log('\n2. Preview Systems Test:');
    const previewSystems = document.querySelectorAll('.prompt-preview, .context-inspector, .workout-test-preview');
    let fixedPreviewSystems = 0;
    
    previewSystems.forEach((system, index) => {
        const styles = getComputedStyle(system);
        const bgColor = styles.backgroundColor;
        const className = system.className;
        
        // Check if background is now dark (should be --bg-secondary)
        const isDarkBackground = bgColor.includes('30, 41, 59') || // rgb(30, 41, 59) = #1e293b
                                 bgColor.includes('15, 23, 42') || // rgb(15, 23, 42) = #0f172a
                                 !bgColor.includes('249, 249, 249') && !bgColor.includes('255, 255, 255');
        
        if (isDarkBackground) {
            fixedPreviewSystems++;
        }
        
        console.log(`Preview ${index + 1} (${className}): ${isDarkBackground ? '✅ Fixed' : '❌ Still light'} - ${bgColor}`);
    });
    
    console.log(`✅ Preview Systems Fixed: ${fixedPreviewSystems}/${previewSystems.length}`);
    
    // Test 3: Muscle Module (Previously container had light background)
    console.log('\n3. Muscle Module Test:');
    const muscleContainer = document.querySelector('.muscle-selection-container');
    if (muscleContainer) {
        const styles = getComputedStyle(muscleContainer);
        const bgColor = styles.backgroundColor;
        const isDarkBackground = bgColor.includes('30, 41, 59') || !bgColor.includes('249, 249, 249');
        
        console.log(`Muscle Container: ${isDarkBackground ? '✅ Fixed' : '❌ Still light'} - ${bgColor}`);
        
        // Test muscle group items
        const muscleItems = document.querySelectorAll('.muscle-group-item');
        let fixedMuscleItems = 0;
        
        muscleItems.forEach(item => {
            const styles = getComputedStyle(item);
            const bgColor = styles.backgroundColor;
            const isDark = bgColor.includes('15, 23, 42') || !bgColor.includes('255, 255, 255');
            
            if (isDark) fixedMuscleItems++;
        });
        
        console.log(`Muscle Group Items: ${fixedMuscleItems}/${muscleItems.length} fixed`);
    } else {
        console.log('❌ Muscle container not found');
    }
    
    // Test 4: Notice System (Previously had invisible text)
    console.log('\n4. Notice System Test:');
    const notices = document.querySelectorAll('.notice');
    
    if (notices.length > 0) {
        notices.forEach((notice, index) => {
            const styles = getComputedStyle(notice);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            
            const isDarkBackground = bgColor.includes('30, 41, 59') || !bgColor.includes('255, 255, 255');
            const isLightText = textColor.includes('248, 250, 252') || textColor.includes('255, 255, 255');
            
            console.log(`Notice ${index + 1}: ${isDarkBackground && isLightText ? '✅ Fixed' : '❌ Issues'} - BG: ${bgColor}, Text: ${textColor}`);
        });
    } else {
        console.log('ℹ️  No notices currently displayed (this is normal)');
    }
    
    // Test 5: WordPress Buttons (Should still be working)
    console.log('\n5. WordPress Buttons Verification:');
    const wpButtons = document.querySelectorAll('.wp-core-ui .button');
    let workingButtons = 0;
    
    wpButtons.forEach(btn => {
        const styles = getComputedStyle(btn);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        
        const isDarkBackground = bgColor.includes('30, 41, 59') || !bgColor.includes('255, 255, 255');
        const isLightText = textColor.includes('248, 250, 252') || textColor.includes('255, 255, 255');
        
        if (isDarkBackground && isLightText) {
            workingButtons++;
        }
    });
    
    console.log(`✅ WordPress Buttons Working: ${workingButtons}/${wpButtons.length} (${((workingButtons/wpButtons.length)*100).toFixed(1)}%)`);
    
    // Overall Assessment
    console.log('\n📊 OVERALL ASSESSMENT:');
    console.log('=====================');
    
    const overallScore = (
        (formFixRate / 100 * 0.4) + // Form elements are most critical (40% weight)
        (fixedPreviewSystems / previewSystems.length * 0.25) + // Preview systems (25% weight)
        (workingButtons / wpButtons.length * 0.2) + // WordPress buttons (20% weight)
        (muscleContainer ? 0.15 : 0) // Muscle module (15% weight)
    ) * 100;
    
    console.log(`Overall Fix Success Rate: ${overallScore.toFixed(1)}%`);
    
    if (overallScore >= 90) {
        console.log('🎉 EXCELLENT: Dark mode fixes are working great!');
    } else if (overallScore >= 70) {
        console.log('✅ GOOD: Most dark mode issues are resolved');
    } else if (overallScore >= 50) {
        console.log('⚠️  FAIR: Some issues remain, check specific components');
    } else {
        console.log('❌ POOR: Significant issues remain, fixes may not be applied correctly');
    }
    
    console.log('\n💡 NEXT STEPS:');
    if (formFixRate < 90) {
        console.log('- Clear browser cache and hard refresh (Cmd+Shift+R or Ctrl+F5)');
    }
    if (fixedPreviewSystems < previewSystems.length) {
        console.log('- Check if CSS file is loading correctly');
    }
    console.log('- Test all interactive elements (muscle selection, form inputs)');
    console.log('- Verify accessibility with screen readers');
    
    // Switch back to original theme if we changed it
    if (currentTheme !== 'dark' && window.FitCopilotDarkMode) {
        setTimeout(() => {
            window.FitCopilotDarkMode.setTheme(currentTheme || 'light');
            console.log('\nRestored original theme');
        }, 2000);
    }
    
}, 500); 