# Subdomain Testing Scripts

This directory contains helper scripts for testing subdomain-based routing.

## Scripts

### `test-subdomains.sh`

Interactive script to help test different subdomains locally.

**Usage:**
```bash
./scripts/test-subdomains.sh
```

The script will present a menu to:
1. Open Landing Page (root subdomain)
2. Open Main App (app subdomain)
3. Open Platform Admin (platform subdomain)
4. Start Dev Server

### Manual Testing

You can also manually test by visiting these URLs:

- **Landing Page**: http://localhost:5173/?subdomain=root
- **Main App**: http://localhost:5173/?subdomain=app (or just http://localhost:5173/)
- **Platform**: http://localhost:5173/?subdomain=platform

## Quick Commands

```bash
# Start dev server
npm run dev

# Open landing page in browser
open http://localhost:5173/?subdomain=root

# Open main app
open http://localhost:5173/?subdomain=app

# Open platform admin
open http://localhost:5173/?subdomain=platform
```
