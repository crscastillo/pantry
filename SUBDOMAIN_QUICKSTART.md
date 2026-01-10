# Quick Start: Subdomain Routing

## Local Development (Right Now)

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test different subdomains**:
   ```bash
   # Landing page
   open http://localhost:5173/?subdomain=root
   
   # Main app (default)
   open http://localhost:5173/?subdomain=app
   
   # Admin dashboard
   open http://localhost:5173/?subdomain=platform
   ```

3. **Or use the helper script**:
   ```bash
   ./scripts/test-subdomains.sh
   ```

## Production Setup (When Deploying)

### Step 1: Set Environment Variable

In Vercel (or your hosting platform):
```
VITE_DOMAIN_URL=yourdomain.com
```

### Step 2: Add Custom Domains

In Vercel project settings, add:
- `yourdomain.com`
- `app.yourdomain.com`
- `platform.yourdomain.com`

### Step 3: Configure DNS

In your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

```
Type   Name       Value
----   ----       -----
A      @          76.76.21.21
CNAME  app        cname.vercel-dns.com
CNAME  platform   cname.vercel-dns.com
```

### Step 4: Deploy

```bash
git push origin main
```

Vercel will automatically deploy. All subdomains will work!

## How It Works

### Development (localhost)
- Uses **query parameters** to simulate subdomains
- `?subdomain=root` → Landing page
- `?subdomain=app` → Main app (default)
- `?subdomain=platform` → Admin dashboard

### Production (your domain)
- Uses **actual subdomains** from URL
- `yourdomain.com` → Landing page
- `app.yourdomain.com` → Main app
- `platform.yourdomain.com` → Admin dashboard

## What's Different?

### Before (Old Structure)
```
yourdomain.com/              → Landing page
yourdomain.com/login         → Login
yourdomain.com/dashboard     → Dashboard
yourdomain.com/settings      → Settings
```

### After (New Structure)
```
yourdomain.com/              → Landing page only
app.yourdomain.com/login     → Login
app.yourdomain.com/dashboard → Dashboard
app.yourdomain.com/settings  → Settings
platform.yourdomain.com/     → Admin (coming soon)
```

## Benefits

✅ **Cleaner URLs** - Professional subdomain structure
✅ **Better SEO** - Separate landing page from app
✅ **Future-proof** - Easy to add more subdomains
✅ **Same codebase** - No need for separate repos
✅ **Same build** - Single deployment serves all subdomains

## Need Help?

- 📖 Full documentation: [SUBDOMAIN_ROUTING.md](./SUBDOMAIN_ROUTING.md)
- 🧪 Testing guide: [scripts/SUBDOMAIN_TEST.md](./scripts/SUBDOMAIN_TEST.md)
- 📋 Implementation details: [SUBDOMAIN_IMPLEMENTATION.md](./SUBDOMAIN_IMPLEMENTATION.md)

## Common Questions

**Q: Do I need to make any changes to my code?**
A: No! The subdomain detection is automatic.

**Q: Will my existing auth sessions work?**
A: Yes! Auth works the same way.

**Q: Can I still use localhost for development?**
A: Yes! Use query parameters to simulate subdomains.

**Q: What if I don't want to use subdomains yet?**
A: Everything still works at the root domain. Subdomains are optional.

**Q: How do I test before deploying?**
A: Use `./scripts/test-subdomains.sh` to test locally.
