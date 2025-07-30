#!/bin/bash

# Environment Debug Script
# Diagnoses Lighthouse, Chrome headless, and server connectivity issues
# Use this when PWA tests fail mysteriously

echo "🔍 AutoFocus PWA Environment Diagnostic"
echo "============================="

URL="http://localhost:8080"

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

# 1. Test server availability
print_status $BLUE "1. Testing server availability..."
if curl -s "$URL" > /dev/null; then
    print_status $GREEN "✅ Server is accessible via curl"
else
    print_status $RED "❌ Server is not accessible via curl"
    exit 1
fi

# 2. Test with regular Chrome (if available)
print_status $BLUE "2. Testing Chrome browser access..."
if command -v google-chrome &> /dev/null; then
    timeout 10s google-chrome --headless --dump-dom "$URL" > /tmp/chrome_dump.html 2>/dev/null
    if [ -s /tmp/chrome_dump.html ]; then
        print_status $GREEN "✅ Chrome headless can access the site"
        echo "   First 200 chars of response:"
        head -c 200 /tmp/chrome_dump.html
        echo ""
    else
        print_status $RED "❌ Chrome headless cannot access the site"
    fi
else
    print_status $YELLOW "⚠️  google-chrome command not found"
fi

# 3. Test with minimal Lighthouse run
print_status $BLUE "3. Testing minimal Lighthouse run..."
lighthouse --version
echo ""

print_status $BLUE "4. Running Lighthouse with maximum debugging..."
lighthouse "$URL" \
    --only-categories=pwa \
    --output=json \
    --output-path=./debug-lighthouse \
    --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --verbose --enable-logging=stderr --log-level=0" \
    --verbose \
    --max-wait-for-load=30000 2>&1 | head -50

# 5. Check for common issues
print_status $BLUE "5. Checking for common issues..."

# Check if port is actually bound
netstat_output=$(netstat -tlnp 2>/dev/null | grep ":8080")
if [ ! -z "$netstat_output" ]; then
    print_status $GREEN "✅ Port 8080 is bound:"
    echo "   $netstat_output"
else
    print_status $RED "❌ Port 8080 is not bound"
fi

# Check DNS resolution
if nslookup localhost > /dev/null 2>&1; then
    print_status $GREEN "✅ localhost DNS resolution works"
else
    print_status $YELLOW "⚠️  localhost DNS resolution issues"
fi

# 6. Test alternative URLs
print_status $BLUE "6. Testing alternative URLs..."
for test_url in "http://127.0.0.1:8080" "http://0.0.0.0:8080"; do
    if curl -s "$test_url" > /dev/null; then
        print_status $GREEN "✅ $test_url is accessible"
    else
        print_status $RED "❌ $test_url is not accessible"
    fi
done

print_status $BLUE "7. Chrome process and sandbox info..."
ps aux | grep chrome | grep -v grep | head -5

echo ""
print_status $GREEN "🔍 Debug complete! Check the output above for issues."
