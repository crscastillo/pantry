#!/bin/bash

# Resend Email Setup Script
# This script helps deploy the Supabase Edge Function for sending emails via Resend

set -e

echo "🚀 Resend Email Integration Setup"
echo "=================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "📦 Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found"
    echo "📝 Please create a .env file with your RESEND_API_KEY"
    echo ""
    echo "Example:"
    echo "RESEND_API_KEY=re_your_api_key_here"
    exit 1
fi

# Check if RESEND_API_KEY is set
if ! grep -q "RESEND_API_KEY=" .env; then
    echo "❌ RESEND_API_KEY not found in .env file"
    echo "📝 Please add your Resend API key to .env:"
    echo "RESEND_API_KEY=re_your_api_key_here"
    echo ""
    echo "Get your API key from: https://resend.com/api-keys"
    exit 1
fi

RESEND_API_KEY=$(grep "RESEND_API_KEY=" .env | cut -d '=' -f2)

if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ RESEND_API_KEY is empty in .env file"
    exit 1
fi

echo "✅ Resend API key found in .env"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Deploy Edge Function to Supabase"
echo "2) Set Resend API key as Supabase secret"
echo "3) Both (recommended)"
echo "4) Test locally"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📤 Deploying Edge Function..."
        supabase functions deploy send-welcome-email
        echo ""
        echo "✅ Edge Function deployed successfully!"
        echo "⚠️  Don't forget to set the RESEND_API_KEY secret (option 2)"
        ;;
    2)
        echo ""
        echo "🔑 Setting Resend API key as Supabase secret..."
        echo "$RESEND_API_KEY" | supabase secrets set RESEND_API_KEY
        echo ""
        echo "✅ Secret set successfully!"
        ;;
    3)
        echo ""
        echo "📤 Deploying Edge Function..."
        supabase functions deploy send-welcome-email
        echo ""
        echo "🔑 Setting Resend API key as Supabase secret..."
        echo "$RESEND_API_KEY" | supabase secrets set RESEND_API_KEY
        echo ""
        echo "✅ Setup complete!"
        ;;
    4)
        echo ""
        echo "🧪 Starting local Edge Function server..."
        echo "Press Ctrl+C to stop"
        echo ""
        supabase functions serve send-welcome-email --env-file .env
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"
echo ""
echo "Next steps:"
echo "1. Make sure your domain is verified in Resend dashboard"
echo "2. Update the 'from' email in the Edge Function if needed"
echo "3. Test by signing up a new user"
echo ""
echo "For more info, see EMAIL_SETUP.md"
