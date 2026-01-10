# Subdomain-Based Routing Architecture

This application uses subdomain-based routing to separate different parts of the application:

## Architecture

### 1. **Root Domain** (`yourdomain.com`)
- **Purpose**: Landing page and marketing site
- **Routes**: Only `/` (home)
- **Features**: 
  - Marketing content
  - Feature showcase
  - Links to app subdomain for login/signup

### 2. **App Subdomain** (`app.yourdomain.com`)
- **Purpose**: Main application
- **Routes**: 
  - `/dashboard` - Main pantry dashboard
  - `/shopping` - Shopping list
  - `/recipes` - Recipe suggestions
  - `/settings` - User settings
  - `/login` - Authentication
  - `/signup` - User registration
- **Features**: All core application functionality

### 3. **Platform Subdomain** (`platform.yourdomain.com`)
- **Purpose**: Super admin dashboard (future)
- **Status**: Coming soon placeholder
- **Routes**: TBD

## Local Development

For local development, the app uses query parameters to simulate subdomains:

- **Root domain**: `http://localhost:5173/?subdomain=root`
- **App subdomain**: `http://localhost:5173/?subdomain=app` (default)
- **Platform subdomain**: `http://localhost:5173/?subdomain=platform`

If no query parameter is provided, it defaults to the app subdomain.

## Environment Configuration

Set your domain in `.env`:

```env
VITE_ROOT_URL=localhost:5173  # For development
# or
VITE_ROOT_URL=yourdomain.com  # For production
```

## Production Deployment

### Vercel Configuration

1. **Add Custom Domain**:
   - Go to your Vercel project settings
   - Add your root domain: `yourdomain.com`
   - Add subdomains: `app.yourdomain.com` and `platform.yourdomain.com`

2. **DNS Configuration**:
   Add these DNS records:
   ```
   A     @              76.76.21.21
   CNAME app            cname.vercel-dns.com
   CNAME platform       cname.vercel-dns.com
   ```

3. **Environment Variables**:
   Set `VITE_ROOT_URL=yourdomain.com` in Vercel environment variables

### Alternative Platforms

#### Netlify
1. Add domain in site settings
2. Configure DNS with Netlify nameservers
3. Add subdomain records for `app` and `platform`
4. Set environment variable: `VITE_ROOT_URL=yourdomain.com`

#### Custom Server (Nginx/Apache)
Configure virtual hosts for each subdomain pointing to the same build directory.

Example Nginx config:
```nginx
server {
    server_name yourdomain.com app.yourdomain.com platform.yourdomain.com;
    root /var/www/pantry/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## How It Works

### Subdomain Detection

The app uses [src/lib/subdomain.ts](src/lib/subdomain.ts) to detect the current subdomain:

```typescript
import { getSubdomain } from '@/lib/subdomain'

const subdomain = getSubdomain() // Returns: 'root' | 'app' | 'platform'
```

### Conditional Routing

[src/App.tsx](src/App.tsx) conditionally renders different route configurations based on the detected subdomain:

```typescript
function AppRoutes() {
  const subdomain = getSubdomain()

  if (subdomain === 'root') {
    return <LandingRoutes />      // Only landing page
  }

  if (subdomain === 'platform') {
    return <PlatformRoutes />     // Admin dashboard
  }

  return <AppOnlyRoutes />        // Main application
}
```

### Cross-Subdomain Navigation

Use the `getSubdomainUrl` helper to generate URLs for different subdomains:

```typescript
import { getSubdomainUrl } from '@/lib/subdomain'

const loginUrl = getSubdomainUrl('app', '/login')
// Returns: http://app.yourdomain.com/login (production)
// Returns: http://localhost:5173/login?subdomain=app (development)
```

## Benefits

1. **Clear Separation**: Each subdomain has a distinct purpose
2. **Better SEO**: Landing page is separate from app
3. **Security**: Can apply different security policies per subdomain
4. **Scalability**: Easy to add new subdomains for new features
5. **User Experience**: Clean URLs without `/app` or `/admin` prefixes

## Testing

Test all subdomains locally:

```bash
# Root domain (landing page)
open http://localhost:5173/?subdomain=root

# App subdomain (main app)
open http://localhost:5173/?subdomain=app

# Platform subdomain (admin)
open http://localhost:5173/?subdomain=platform
```

## Migration Notes

- Old routes like `/login` and `/signup` from root domain now redirect to app subdomain
- Landing page no longer uses React Router Links for auth - uses regular anchor tags with subdomain URLs
- All protected routes are now only on the app subdomain
