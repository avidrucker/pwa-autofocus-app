#!/bin/bash

# Mobile PWA Testing Script
# Opens Chrome with mobile device simulation for manual testing
# Provides guided testing checklist for developers

echo "🚀 AutoFocus Mobile PWA Testing Setup..."

# Function to open Chrome with mobile simulation
open_mobile_chrome() {
    local url="$1"
    local device="$2"
    
    echo "📱 Opening Chrome with mobile simulation..."
    echo "Device: $device"
    echo "URL: $url"
    
    # For Linux
    if command -v google-chrome &> /dev/null; then
        google-chrome \
            --user-agent="Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36" \
            --window-size=375,812 \
            --device-scale-factor=3 \
            --mobile \
            "$url" &
    # For Chrome/Chromium on other systems
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser \
            --user-agent="Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36" \
            --window-size=375,812 \
            --device-scale-factor=3 \
            --mobile \
            "$url" &
    else
        echo "❌ Chrome/Chromium not found. Please install Chrome or run manually."
        echo "Manual steps:"
        echo "1. Open Chrome DevTools (F12)"
        echo "2. Click device toolbar icon (Ctrl+Shift+M)"
        echo "3. Select a mobile device"
        echo "4. Navigate to: $url"
    fi
}

# Default values
URL="http://localhost:8080"
DEVICE="iPhone 12 Pro"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            URL="$2"
            shift 2
            ;;
        -d|--device)
            DEVICE="$2"
            shift 2
            ;;
        -h|--help)
            echo "Mobile PWA Testing Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -u, --url URL      Set the URL to test (default: http://localhost:8080)"
            echo "  -d, --device NAME  Set the device to simulate (default: iPhone 12 Pro)"
            echo "  -h, --help         Show this help message"
            echo ""
            echo "Example: $0 -u http://localhost:3000 -d 'Galaxy S20'"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Start the mobile simulation
open_mobile_chrome "$URL" "$DEVICE"

echo ""
echo "📋 Testing Checklist:"
echo "✓ 1. Open DevTools (F12)"
echo "✓ 2. Go to Network tab → Check 'Offline'"
echo "✓ 3. Go to Application tab → Service Workers → Check status"
echo "✓ 4. Test adding items while offline"
echo "✓ 5. Test refresh while offline"
echo "✓ 6. Check cache in Application → Storage → Cache Storage"
echo ""
echo "🔧 Debug Tools:"
echo "- Enable debug mode in app settings"
echo "- Use the wrench 🔧 icon for PWA debug info"
echo "- Check console for service worker logs"
