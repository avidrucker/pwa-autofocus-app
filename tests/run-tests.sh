#!/bin/bash

# AutoFocus PWA Test Runner
# Provides easy access to all testing scripts

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}🧪 AutoFocus PWA Test Suite${NC}"
    echo -e "${BLUE}=============================${NC}"
    echo ""
}

show_usage() {
    echo "Usage: $0 [test-type]"
    echo ""
    echo "Available tests:"
    echo "  lighthouse    - Full PWA audit using Lighthouse (recommended)"
    echo "  mobile        - Open mobile simulation for manual testing"
    echo "  components    - Validate individual PWA components"
    echo "  debug         - Diagnose environment and connectivity issues"
    echo "  all           - Run lighthouse + components validation"
    echo ""
    echo "Examples:"
    echo "  $0 lighthouse     # Run main PWA test"
    echo "  $0 mobile         # Test mobile experience"
    echo "  $0 debug          # Troubleshoot issues"
    echo "  $0                # Interactive menu"
}

run_interactive() {
    print_header
    echo "Select a test to run:"
    echo ""
    echo "1) 🏆 Lighthouse PWA Audit (recommended)"
    echo "2) 📱 Mobile Simulation"
    echo "3) 🔍 Component Validation"
    echo "4) 🛠️  Environment Debug"
    echo "5) 🚀 Run All (Lighthouse + Components)"
    echo "6) ❓ Help"
    echo "7) 🚪 Exit"
    echo ""
    
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1) "$SCRIPT_DIR/lighthouse-pwa.sh" ;;
        2) "$SCRIPT_DIR/mobile-simulation.sh" ;;
        3) "$SCRIPT_DIR/validate-components.sh" ;;
        4) "$SCRIPT_DIR/debug-environment.sh" ;;
        5) 
            echo -e "${YELLOW}Running comprehensive validation...${NC}"
            "$SCRIPT_DIR/lighthouse-pwa.sh" && "$SCRIPT_DIR/validate-components.sh"
            ;;
        6) show_usage ;;
        7) echo "Goodbye!" ;;
        *) echo "Invalid choice. Please select 1-7." ;;
    esac
}

# Main execution
case "$1" in
    lighthouse|pwa)
        "$SCRIPT_DIR/lighthouse-pwa.sh"
        ;;
    mobile|sim)
        "$SCRIPT_DIR/mobile-simulation.sh"
        ;;
    components|validate)
        "$SCRIPT_DIR/validate-components.sh"
        ;;
    debug|troubleshoot)
        "$SCRIPT_DIR/debug-environment.sh"
        ;;
    all|comprehensive)
        echo -e "${YELLOW}Running comprehensive PWA validation...${NC}"
        "$SCRIPT_DIR/lighthouse-pwa.sh" && "$SCRIPT_DIR/validate-components.sh"
        ;;
    help|--help|-h)
        show_usage
        ;;
    "")
        run_interactive
        ;;
    *)
        echo "Unknown test type: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
