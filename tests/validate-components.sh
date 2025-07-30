#!/bin/bash

# PWA Component Validation Script
# Tests individual PWA components without Lighthouse
# Useful for debugging specific PWA failures and when Lighthouse is unavailable

echo "🔍 AutoFocus PWA Component Validation"
echo "========================"

PORT=8080
URL="http://localhost:$PORT"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Test manifest.json
test_manifest() {
    print_status $BLUE "📋 Testing Web App Manifest..."
    
    local manifest_response=$(curl -s -w "%{http_code}" "$URL/manifest.json" -o /tmp/manifest.json)
    
    if [ "$manifest_response" = "200" ]; then
        print_status $GREEN "✅ Manifest accessible"
        
        # Validate manifest content
        if command -v jq &> /dev/null; then
            local name=$(jq -r '.name' /tmp/manifest.json 2>/dev/null)
            local start_url=$(jq -r '.start_url' /tmp/manifest.json 2>/dev/null)
            local display=$(jq -r '.display' /tmp/manifest.json 2>/dev/null)
            local icons=$(jq -r '.icons | length' /tmp/manifest.json 2>/dev/null)
            
            echo "  Name: $name"
            echo "  Start URL: $start_url"
            echo "  Display: $display"
            echo "  Icons: $icons"
            
            if [ "$display" = "standalone" ] || [ "$display" = "fullscreen" ] || [ "$display" = "minimal-ui" ]; then
                print_status $GREEN "✅ PWA display mode configured"
            else
                print_status $YELLOW "⚠️  Display mode not PWA-optimized"
            fi
            
            if [ "$icons" -gt 0 ]; then
                print_status $GREEN "✅ App icons configured"
            else
                print_status $RED "❌ No app icons found"
            fi
        else
            print_status $YELLOW "⚠️  jq not available for detailed manifest validation"
        fi
    else
        print_status $RED "❌ Manifest not accessible (HTTP $manifest_response)"
    fi
    
    rm -f /tmp/manifest.json
}

# Test service worker
test_service_worker() {
    print_status $BLUE "⚙️  Testing Service Worker..."
    
    local sw_response=$(curl -s -w "%{http_code}" "$URL/serviceWorker.js" -o /dev/null)
    
    if [ "$sw_response" = "200" ]; then
        print_status $GREEN "✅ Service Worker accessible"
        
        # Check for key service worker features
        local sw_content=$(curl -s "$URL/serviceWorker.js")
        
        if echo "$sw_content" | grep -q "addEventListener.*install"; then
            print_status $GREEN "✅ Install event handler found"
        else
            print_status $RED "❌ Install event handler missing"
        fi
        
        if echo "$sw_content" | grep -q "addEventListener.*fetch"; then
            print_status $GREEN "✅ Fetch event handler found"
        else
            print_status $RED "❌ Fetch event handler missing"
        fi
        
        if echo "$sw_content" | grep -q "caches"; then
            print_status $GREEN "✅ Cache API usage found"
        else
            print_status $RED "❌ Cache API usage missing"
        fi
        
    else
        print_status $RED "❌ Service Worker not accessible (HTTP $sw_response)"
    fi
}

# Test PWA icons
test_icons() {
    print_status $BLUE "🎨 Testing PWA Icons..."
    
    local icons=("favicon.ico" "logo192.png" "logo512.png")
    
    for icon in "${icons[@]}"; do
        local icon_response=$(curl -s -w "%{http_code}" "$URL/$icon" -o /dev/null)
        if [ "$icon_response" = "200" ]; then
            print_status $GREEN "✅ $icon accessible"
        else
            print_status $RED "❌ $icon not accessible (HTTP $icon_response)"
        fi
    done
}

# Test offline functionality simulation
test_offline_resources() {
    print_status $BLUE "🌐 Testing Offline Resources..."
    
    local resources=("/" "/index.html" "/static/css/" "/static/js/")
    
    for resource in "${resources[@]}"; do
        local response=$(curl -s -w "%{http_code}" "$URL$resource" -o /dev/null)
        if [ "$response" = "200" ]; then
            print_status $GREEN "✅ $resource accessible"
        else
            print_status $YELLOW "⚠️  $resource returned HTTP $response"
        fi
    done
}

# Test HTTPS readiness
test_https_readiness() {
    print_status $BLUE "🔒 Testing HTTPS Readiness..."
    
    local main_content=$(curl -s "$URL")
    
    # Check for mixed content issues
    if echo "$main_content" | grep -q "http://"; then
        print_status $YELLOW "⚠️  Potential mixed content found (http:// references)"
    else
        print_status $GREEN "✅ No obvious mixed content issues"
    fi
    
    # Check for relative URLs (good for HTTPS)
    if echo "$main_content" | grep -q 'src="/\|href="/'; then
        print_status $GREEN "✅ Uses relative URLs (HTTPS-friendly)"
    else
        print_status $YELLOW "⚠️  May have absolute URL issues"
    fi
}

# Test responsive design basics
test_responsive() {
    print_status $BLUE "📱 Testing Responsive Design..."
    
    local main_content=$(curl -s "$URL")
    
    if echo "$main_content" | grep -q 'viewport'; then
        print_status $GREEN "✅ Viewport meta tag found"
    else
        print_status $RED "❌ Viewport meta tag missing"
    fi
    
    if echo "$main_content" | grep -q 'width=device-width'; then
        print_status $GREEN "✅ Device-width viewport configured"
    else
        print_status $YELLOW "⚠️  Device-width viewport not configured"
    fi
}

# Generate PWA score
generate_score() {
    print_status $BLUE "📊 PWA Feature Score:"
    
    local score=0
    local total=10
    
    # Simple scoring based on our tests
    curl -s "$URL/manifest.json" -o /dev/null && score=$((score + 2))
    curl -s "$URL/serviceWorker.js" -o /dev/null && score=$((score + 2))
    curl -s "$URL/favicon.ico" -o /dev/null && score=$((score + 1))
    curl -s "$URL/logo192.png" -o /dev/null && score=$((score + 1))
    curl -s "$URL/logo512.png" -o /dev/null && score=$((score + 1))
    curl -s "$URL/" | grep -q 'viewport' && score=$((score + 1))
    curl -s "$URL/" | grep -q 'width=device-width' && score=$((score + 1))
    curl -s "$URL/" | grep -q -v 'http://' && score=$((score + 1))
    
    local percentage=$((score * 100 / total))
    
    if [ $percentage -ge 80 ]; then
        print_status $GREEN "✅ PWA Score: $score/$total ($percentage%) - Excellent!"
    elif [ $percentage -ge 60 ]; then
        print_status $YELLOW "⚠️  PWA Score: $score/$total ($percentage%) - Good"
    else
        print_status $RED "❌ PWA Score: $score/$total ($percentage%) - Needs improvement"
    fi
}

# Main testing function
main() {
    # Check if server is running
    if ! curl -s "$URL" > /dev/null; then
        print_status $RED "❌ Server not running at $URL"
        print_status $BLUE "Start server with: ./test-pwa.sh"
        exit 1
    fi
    
    print_status $GREEN "🚀 Starting PWA validation..."
    echo
    
    test_manifest
    echo
    test_service_worker
    echo
    test_icons
    echo
    test_offline_resources
    echo
    test_https_readiness
    echo
    test_responsive
    echo
    generate_score
    
    print_status $GREEN "✅ PWA validation complete!"
}

main
