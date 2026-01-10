#!/bin/bash

# Local subdomain testing helper
# This script helps you test different subdomains locally

PORT=5173

echo "🎯 Pantry Subdomain Testing Helper"
echo "==================================="
echo ""
echo "To test different subdomains locally, use these URLs:"
echo ""
echo "📄 Landing Page (Root Domain):"
echo "   http://localhost:$PORT/?subdomain=root"
echo ""
echo "🏠 Main App:"
echo "   http://localhost:$PORT/?subdomain=app"
echo "   or just: http://localhost:$PORT/ (default)"
echo ""
echo "⚙️  Platform Admin (Coming Soon):"
echo "   http://localhost:$PORT/?subdomain=platform"
echo ""
echo "==================================="
echo ""
echo "Choose an option:"
echo "1) Open Landing Page"
echo "2) Open Main App"
echo "3) Open Platform Admin"
echo "4) Start Dev Server"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "Opening landing page..."
        open "http://localhost:$PORT/?subdomain=root"
        ;;
    2)
        echo "Opening main app..."
        open "http://localhost:$PORT/?subdomain=app"
        ;;
    3)
        echo "Opening platform admin..."
        open "http://localhost:$PORT/?subdomain=platform"
        ;;
    4)
        echo "Starting dev server..."
        npm run dev
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac
