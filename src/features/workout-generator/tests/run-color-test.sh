#!/bin/bash

# Color Token Migration Test Script
# This script opens the color token test page in a browser and captures screenshots for comparison

echo "Starting Color Token Migration Visual Test..."

# Path to the test file
TEST_FILE="src/features/workout-generator/tests/color-tokens-test.html"
SCREENSHOTS_DIR="src/features/workout-generator/tests/screenshots"

# Create screenshots directory if it doesn't exist
mkdir -p "$SCREENSHOTS_DIR"

# Function to capture a screenshot using Chrome headless
capture_screenshot() {
  local mode=$1
  local output_file="$SCREENSHOTS_DIR/color-tokens-test-${mode}.png"
  
  echo "Capturing $mode mode screenshot: $output_file"
  
  # Using Chrome headless to capture screenshot
  # You may need to adjust the path to Chrome based on your OS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --headless \
      --disable-gpu \
      --screenshot="$output_file" \
      --window-size=1280,1600 \
      "file://$(pwd)/$TEST_FILE" \
      --default-background-color=0 \
      ${mode}
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    google-chrome \
      --headless \
      --disable-gpu \
      --screenshot="$output_file" \
      --window-size=1280,1600 \
      "file://$(pwd)/$TEST_FILE" \
      --default-background-color=0 \
      ${mode}
  else
    # Windows or other
    echo "Please manually capture screenshots for your platform"
  fi
}

# Open the test page in the default browser
echo "Opening test page in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$TEST_FILE"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "$TEST_FILE"
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
  start "$TEST_FILE"
else
  echo "Please open the test file manually: $TEST_FILE"
fi

# Capture light and dark mode screenshots if Chrome is available
if command -v google-chrome &> /dev/null || [[ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]]; then
  # Capture light mode
  capture_screenshot ""
  
  # Capture dark mode (with dark theme JS parameter)
  capture_screenshot "--js-flags=\"document.body.classList.add('dark-theme')\""
  
  echo "Screenshots captured in $SCREENSHOTS_DIR"
  echo "Please compare these screenshots to verify color token migration."
else
  echo "Google Chrome not found. Please capture screenshots manually."
fi

echo "Test complete!"
echo "Remember to verify both light and dark mode appearances."
echo "Toggle dark mode using the button in the top right corner of the test page." 