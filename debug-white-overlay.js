// COMPREHENSIVE WHITE OVERLAY DEBUGGING SCRIPT
// Copy and paste this entire script into your browser console

console.log("🔍 STARTING WHITE OVERLAY DEBUGGING...");

// 1. Live hover detection
function setupHoverDetection() {
  document.addEventListener('mouseover', function(e) {
    const element = e.target;
    const computedStyle = window.getComputedStyle(element);
    
    // Check for white backgrounds
    const bg = computedStyle.backgroundColor;
    if (bg && (bg.includes('255, 255, 255') || bg.includes('white'))) {
      console.log('🚨 WHITE BACKGROUND DETECTED:', {
        element: element,
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        backgroundColor: bg,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex
      });
    }
    
    // Check for pseudo-elements
    const beforeStyle = window.getComputedStyle(element, '::before');
    const afterStyle = window.getComputedStyle(element, '::after');
    
    if (beforeStyle.backgroundColor && beforeStyle.backgroundColor.includes('255, 255, 255')) {
      console.log('🚨 WHITE ::before DETECTED:', element, beforeStyle.backgroundColor);
    }
    
    if (afterStyle.backgroundColor && afterStyle.backgroundColor.includes('255, 255, 255')) {
      console.log('🚨 WHITE ::after DETECTED:', element, afterStyle.backgroundColor);
    }
  });
  
  console.log("✅ Hover detection enabled. Mouse over elements to see white backgrounds.");
}

// 2. Find all current white backgrounds
function findAllWhiteBackgrounds() {
  console.log("🔍 Scanning for all white backgrounds...");
  
  const allElements = document.querySelectorAll('*');
  const whiteElements = [];
  
  allElements.forEach(el => {
    const computedStyle = window.getComputedStyle(el);
    const bg = computedStyle.backgroundColor;
    
    if (bg && (bg.includes('255, 255, 255') || bg.includes('white'))) {
      whiteElements.push({
        element: el,
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        backgroundColor: bg,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex
      });
    }
  });
  
  console.log(`Found ${whiteElements.length} elements with white backgrounds:`, whiteElements);
  return whiteElements;
}

// 3. Focus on tabbed workout display area
function analyzeWorkoutDisplay() {
  console.log("🔍 Analyzing workout display area...");
  
  const tabbedDisplay = document.querySelector('.tabbed-workout-display');
  const resultStep = document.querySelector('.result-step-container');
  const workoutCard = document.querySelector('.workout-card');
  
  [tabbedDisplay, resultStep, workoutCard].forEach((element, index) => {
    const names = ['tabbed-workout-display', 'result-step-container', 'workout-card'];
    
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      console.log(`📍 ${names[index]} styles:`, {
        element: element,
        backgroundColor: computedStyle.backgroundColor,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        position: computedStyle.position,
        backdropFilter: computedStyle.backdropFilter
      });
      
      // Check children
      const children = element.children;
      for (let child of children) {
        const childStyle = window.getComputedStyle(child);
        if (childStyle.backgroundColor && childStyle.backgroundColor.includes('255, 255, 255')) {
          console.log(`🚨 WHITE CHILD in ${names[index]}:`, child, childStyle.backgroundColor);
        }
      }
    } else {
      console.log(`❌ ${names[index]} not found`);
    }
  });
}

// 4. Force remove all white backgrounds (TEST)
function forceRemoveWhiteBackgrounds() {
  console.log("🧪 TESTING: Removing ALL white backgrounds...");
  
  const style = document.createElement('style');
  style.id = 'white-background-killer';
  style.innerHTML = `
    * { 
      background: transparent !important; 
    }
    *:hover { 
      background: transparent !important; 
    }
    *::before {
      background: transparent !important;
    }
    *::after {
      background: transparent !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log("✅ Test override applied. If overlay disappears, it's definitely a CSS background issue!");
  
  // Return function to restore
  return function restore() {
    const testStyle = document.getElementById('white-background-killer');
    if (testStyle) {
      testStyle.remove();
      console.log("🔄 Test override removed");
    }
  };
}

// 5. Check for CSS rules in stylesheets
function checkStylesheets() {
  console.log("🔍 Checking stylesheets for hover rules...");
  
  const styleSheets = Array.from(document.styleSheets);
  
  styleSheets.forEach((sheet, index) => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      rules.forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes(':hover')) {
          if (rule.style && rule.style.backgroundColor && 
              rule.style.backgroundColor.includes('255')) {
            console.log('🚨 FOUND HOVER RULE WITH WHITE BG:', {
              selector: rule.selectorText,
              backgroundColor: rule.style.backgroundColor,
              stylesheet: sheet.href || `<style ${index}>`,
              rule: rule
            });
          }
        }
      });
    } catch (e) {
      console.log(`⚠️ Cannot access stylesheet ${index}:`, e.message);
    }
  });
}

// 6. Check event listeners
function checkEventListeners() {
  console.log("🔍 Checking for JavaScript event listeners...");
  
  const tabbedDisplay = document.querySelector('.tabbed-workout-display');
  const resultStep = document.querySelector('.result-step-container');
  
  [tabbedDisplay, resultStep].forEach(element => {
    if (element) {
      // Get event listeners (Chrome DevTools API)
      if (window.getEventListeners) {
        const listeners = window.getEventListeners(element);
        console.log('Event listeners on', element.className, ':', listeners);
      } else {
        console.log('⚠️ getEventListeners not available (open DevTools)');
      }
    }
  });
}

// Execute all debugging functions
console.log("🚀 Running all debugging checks...");

setupHoverDetection();
findAllWhiteBackgrounds();
analyzeWorkoutDisplay();
checkStylesheets();
checkEventListeners();

const restoreFunction = forceRemoveWhiteBackgrounds();

console.log("🎯 DEBUGGING COMPLETE!");
console.log("📋 Next steps:");
console.log("1. Check console output above for white background detections");
console.log("2. Hover over the workout content - watch for console messages");
console.log("3. If the test override fixed it, the issue is CSS backgrounds");
console.log("4. Call restoreFunction() to restore original styles");
console.log("5. Report findings back!");

// Make restore function globally available
window.restoreWhiteBackgrounds = restoreFunction; 