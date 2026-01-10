/**
 * Subdomain detection and routing utilities
 */

export type Subdomain = 'root' | 'app' | 'platform'

/**
 * Get the current subdomain from the window location
 */
export function getSubdomain(): Subdomain {
  if (typeof window === 'undefined') return 'root'
  
  const hostname = window.location.hostname
  const domainUrl = import.meta.env.VITE_DOMAIN_URL || 'localhost:5173'
  
  // Remove port if present for comparison
  const baseHostname = hostname.split(':')[0]
  const baseDomain = domainUrl.split(':')[0]
  
  // Check if we're on localhost (including subdomains like app.localhost)
  const isLocalhost = baseHostname === 'localhost' || 
                      baseHostname === '127.0.0.1' || 
                      baseHostname.endsWith('.localhost')
  
  if (isLocalhost) {
    // For local development, check query parameter first
    const urlParams = new URLSearchParams(window.location.search)
    const subdomainParam = urlParams.get('subdomain')
    
    if (subdomainParam === 'root') return 'root'
    if (subdomainParam === 'platform') return 'platform'
    if (subdomainParam === 'app') return 'app'
    
    // If no query param, check subdomain prefix (app.localhost, platform.localhost)
    if (baseHostname === 'app.localhost' || baseHostname.startsWith('app.localhost')) return 'app'
    if (baseHostname === 'platform.localhost' || baseHostname.startsWith('platform.localhost')) return 'platform'
    
    // Default to ROOT for plain localhost (changed from app)
    return 'root'
  }
  
  // Production subdomain detection
  if (baseHostname === baseDomain) {
    return 'root'
  }
  
  if (baseHostname.startsWith('app.')) {
    return 'app'
  }
  
  if (baseHostname.startsWith('platform.')) {
    return 'platform'
  }
  
  // Default to root
  return 'root'
}

/**
 * Get the URL for a specific subdomain
 */
export function getSubdomainUrl(subdomain: Subdomain, path: string = '/'): string {
  const rootDomain = import.meta.env.VITE_DOMAIN_URL || 'localhost:5173'
  const appDomain = import.meta.env.VITE_APP_URL || 'app.localhost:5173'
  const platformDomain = import.meta.env.VITE_PLATFORM_URL || 'platform.localhost:5173'
  const protocol = window.location.protocol
  
  // Get the appropriate domain for the subdomain
  const targetDomain = subdomain === 'root' ? rootDomain : 
                       subdomain === 'app' ? appDomain : 
                       platformDomain
  
  // Return the full URL with the configured domain
  return `${protocol}//${targetDomain}${path}`
}

/**
 * Check if we're on a specific subdomain
 */
export function isSubdomain(subdomain: Subdomain): boolean {
  return getSubdomain() === subdomain
}
