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
  
  // Check if we're on localhost
  if (baseHostname === 'localhost' || baseHostname === '127.0.0.1') {
    // For local development, check query parameter or default to app
    const urlParams = new URLSearchParams(window.location.search)
    const subdomainParam = urlParams.get('subdomain')
    
    if (subdomainParam === 'root') return 'root'
    if (subdomainParam === 'platform') return 'platform'
    return 'app'
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
  const domainUrl = import.meta.env.VITE_DOMAIN_URL || 'localhost:5173'
  const protocol = window.location.protocol
  
  // For localhost, use query parameter
  if (domainUrl.includes('localhost') || domainUrl.includes('127.0.0.1')) {
    if (subdomain === 'root') {
      return `${protocol}//${domainUrl}${path}?subdomain=root`
    }
    if (subdomain === 'platform') {
      return `${protocol}//${domainUrl}${path}?subdomain=platform`
    }
    return `${protocol}//${domainUrl}${path}?subdomain=app`
  }
  
  // Production URLs
  if (subdomain === 'root') {
    return `${protocol}//${domainUrl}${path}`
  }
  
  return `${protocol}//${subdomain}.${domainUrl}${path}`
}

/**
 * Check if we're on a specific subdomain
 */
export function isSubdomain(subdomain: Subdomain): boolean {
  return getSubdomain() === subdomain
}
