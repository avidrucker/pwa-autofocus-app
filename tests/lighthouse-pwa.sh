#!/bin/bash

# Primary PWA Testing Script using Lighthouse
# Addresses chrome-error://chromewebdata/ issue with optimized Chrome flags
# This is the authoritative PWA testing tool for the project

echo "🔍 AutoFocus PWA Testing (Lighthouse)"
echo "==============================="

URL="http://127.0.0.1:8080"  # Use 127.0.0.1 instead of localhost
PORT=8080

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if server is running
check_server() {
    print_status $BLUE "🔍 Checking server at $URL..."
    
    # Test with curl first
    if curl -s --connect-timeout 5 "$URL" > /dev/null; then
        print_status $GREEN "✅ Server is accessible via curl"
        
        # Test with Chrome headless
        if timeout 10s google-chrome --headless --disable-gpu --no-sandbox --dump-dom "$URL" > /tmp/chrome_test.html 2>/dev/null; then
            if [ -s /tmp/chrome_test.html ]; then
                print_status $GREEN "✅ Server is accessible via Chrome headless"
                return 0
            else
                print_status $RED "❌ Chrome headless returned empty response"
                return 1
            fi
        else
            print_status $RED "❌ Chrome headless failed to access server"
            return 1
        fi
    else
        print_status $RED "❌ Server is not accessible via curl"
        return 1
    fi
}

# Run Lighthouse with the most reliable settings
run_lighthouse() {
    print_status $BLUE "🏃 Running Lighthouse PWA audit..."
    
    # Create a temporary Chrome user directory
    TEMP_DIR=$(mktemp -d)
    
    # Run Lighthouse with very specific flags to avoid the chromewebdata issue
    lighthouse "$URL" \
        --only-categories=pwa \
        --output=html \
        --output=json \
        --output-path=./lighthouse-fixed \
        --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --no-first-run --disable-default-apps --disable-extensions --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-features=TranslateUI --user-data-dir=$TEMP_DIR" \
        --throttling-method=devtools \
        --max-wait-for-load=30000 \
        --timeout=60000 \
        --quiet
    
    local exit_code=$?
    
    # Clean up temp directory
    rm -rf "$TEMP_DIR"
    
    if [ $exit_code -eq 0 ]; then
        print_status $GREEN "✅ Lighthouse audit completed successfully!"
        
        # Show results
        if [ -f "./lighthouse-fixed.report.html" ]; then
            print_status $BLUE "📊 HTML Report: lighthouse-fixed.report.html"
        fi
        
        if [ -f "./lighthouse-fixed.report.json" ]; then
            print_status $BLUE "📊 JSON Report: lighthouse-fixed.report.json"
            
            # Extract PWA score
            local pwa_score=$(python3 -c "
import json
try:
    with open('./lighthouse-fixed.report.json', 'r') as f:
        data = json.load(f)
        pwa_score = data.get('categories', {}).get('pwa', {}).get('score', 0) * 100
        print(f'{pwa_score:.0f}')
except Exception as e:
    print('N/A')
" 2>/dev/null)
            
            if [ "$pwa_score" != "N/A" ]; then
                print_status $GREEN "🏆 PWA Score: $pwa_score/100"
            fi
        fi
        
        return 0
    else
        print_status $RED "❌ Lighthouse audit failed with exit code $exit_code"
        return 1
    fi
}

# Alternative method using puppeteer
run_puppeteer_lighthouse() {
    print_status $YELLOW "🔄 Trying Puppeteer-based approach..."
    
    # Create a Node.js script for Puppeteer-based Lighthouse
    cat > /tmp/lighthouse_puppeteer.js << 'EOF'
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
    const chrome = await chromeLauncher.launch({
        chromeFlags: [
            '--headless',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--disable-default-apps'
        ]
    });
    
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['pwa'],
        port: chrome.port,
    };
    
    const runnerResult = await lighthouse('http://127.0.0.1:8080', options);
    
    // Write results
    const fs = require('fs');
    fs.writeFileSync('./lighthouse-puppeteer.report.html', runnerResult.report);
    
    console.log('PWA Score:', runnerResult.lhr.categories.pwa.score * 100);
    
    await chrome.kill();
}

runLighthouse().catch(console.error);
EOF
    
    if command -v node &> /dev/null; then
        node /tmp/lighthouse_puppeteer.js
    else
        print_status $RED "❌ Node.js not available for Puppeteer approach"
        return 1
    fi
}

# Main execution
main() {
    if ! check_server; then
        print_status $RED "❌ Server check failed. Make sure the server is running on port $PORT"
        exit 1
    fi
    
    if ! run_lighthouse; then
        print_status $YELLOW "⚠️  Primary method failed. Trying alternative..."
        run_puppeteer_lighthouse
    fi
    
    print_status $GREEN "✅ Testing complete!"
    
    # Show available reports
    print_status $BLUE "📁 Generated reports:"
    ls -la lighthouse-*.report.* 2>/dev/null || echo "   No reports found"
}

main
