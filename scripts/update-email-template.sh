#!/bin/bash

# Supabase Email Template Updater
# This script helps you update Supabase email templates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📧 Supabase Email Template Updater${NC}"
echo "====================================="
echo ""

# Check if template file exists
TEMPLATE_FILE="supabase/email-templates/confirm-signup.html"

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo -e "${RED}❌ Template file not found: $TEMPLATE_FILE${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Template file found${NC}"
echo ""

# Display instructions
echo -e "${YELLOW}📋 Instructions:${NC}"
echo ""
echo "To update your Supabase email template, follow these steps:"
echo ""
echo "1. Open your Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/_/auth/templates"
echo ""
echo "2. Select 'Confirm signup' from the template dropdown"
echo ""
echo "3. Copy the template content (will be shown below)"
echo ""
echo "4. Paste into the Supabase template editor"
echo ""
echo "5. Click 'Save' to apply the changes"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Ask if user wants to see the template
read -p "Show template content? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Template Content:${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  cat "$TEMPLATE_FILE"
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
fi

# Ask if user wants to copy to clipboard (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
  read -p "Copy template to clipboard? (y/n) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat "$TEMPLATE_FILE" | pbcopy
    echo -e "${GREEN}✅ Template copied to clipboard!${NC}"
    echo ""
    echo "Now paste it into your Supabase Dashboard:"
    echo "https://supabase.com/dashboard/project/_/auth/templates"
    echo ""
  fi
fi

# Offer to open the Supabase dashboard
read -p "Open Supabase Dashboard now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://supabase.com/dashboard"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "https://supabase.com/dashboard"
  else
    echo "Please open: https://supabase.com/dashboard"
  fi
fi

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
echo ""
echo "Additional templates to customize:"
echo "  • Magic Link (passwordless login)"
echo "  • Reset Password"
echo "  • Change Email Address"
echo "  • Invite User"
echo ""
echo "See supabase/email-templates/README.md for more info"
