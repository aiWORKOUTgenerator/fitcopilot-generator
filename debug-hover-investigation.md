# WHITE HOVER OVERLAY DEBUGGING GUIDE

## IMMEDIATE BROWSER DEBUGGING STEPS

### 1. **Open Developer Tools**
- Right-click on the white overlay area
- Select "Inspect Element"
- Go to Elements tab

### 2. **Find the Culprit Element**
- In Elements tab, hover over different elements in the DOM tree
- Watch for which element highlights the white overlay area
- Look for elements with these classes:
  - `.tabbed-workout-display`
  - `.result-step-container` 
  - `.workout-card`
  - Any element with "background" or "overlay" in the name

### 3. **Check Computed Styles**
- Select the element causing the overlay
- Go to "Computed" tab in styles panel
- Look for "background-color" property
- Check if it shows `rgba(255, 255, 255, X)` values

### 4. **Find the Source CSS Rule**
- Go to "Styles" tab
- Look for any rule with `:hover` that sets background
- Note the file name and line number

### 5. **Event Listeners Check**
- In Elements tab, scroll down to "Event Listeners"
- Look for "mouseover" or "mouseenter" events
- Check if any JavaScript is adding styles on hover

## CONSOLE DEBUGGING COMMANDS

### Live Hover Detection
```javascript
// Paste this in Console to see what's being hovered
document.addEventListener('mouseover', function(e) {
    console.log('Hovering over:', e.target);
    console.log('Element classes:', e.target.className);
    console.log('Computed background:', window.getComputedStyle(e.target).backgroundColor);
});
```

### Force CSS Override Test
```javascript
// Test if removing ALL backgrounds fixes it
const style = document.createElement('style');
style.innerHTML = `
    * { background: transparent !important; }
    *:hover { background: transparent !important; }
`;
document.head.appendChild(style);
```

### Find All White Backgrounds
```javascript
// Find all elements with white backgrounds
Array.from(document.querySelectorAll('*')).forEach(el => {
    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg.includes('255, 255, 255')) {
        console.log('White background found:', el, bg);
    }
});
```

## WHAT TO LOOK FOR

1. **CSS Rules with**:
   - `:hover` + `background` with white rgba
   - `::before` or `::after` pseudo-elements
   - `backdrop-filter` effects
   - z-index layering issues

2. **JavaScript Adding Styles**:
   - Event listeners on hover
   - Dynamic style injection
   - React inline styles

3. **Inherited Styles**:
   - Parent containers with hover effects
   - CSS cascade issues
   - Design system conflicts

## NEXT STEPS AFTER DEBUGGING
Once you find the culprit element and CSS rule, report back:
- Element class name
- CSS file and line number
- Computed background value
- Any JavaScript event listeners 