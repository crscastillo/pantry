import { useEffect, useRef, useState } from 'react'

/**
 * Detects if the app is running inside a WebKit container or iOS Safari in standalone mode
 */
function isWebKitContainer(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  
  // Check if running as iOS/iPadOS web app added to home screen (standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true
  
  // Check for iOS/iPadOS
  const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad')
  
  // Check for common WebView indicators
  const isWebView = 
    // iOS WebView indicators (not Safari)
    isIOS && !userAgent.includes('safari') ||
    // Android WebView indicators
    userAgent.includes('wv') ||
    userAgent.includes('android') && userAgent.includes('version') && !userAgent.includes('chrome') ||
    // Capacitor/Cordova indicators
    (window as any).Capacitor !== undefined ||
    (window as any).cordova !== undefined

  // Enable for iOS standalone mode OR webview
  return (isIOS && isStandalone) || isWebView
}

interface UsePullToRefreshOptions {
  onRefresh?: () => void | Promise<void>
  threshold?: number
  disabled?: boolean
}

/**
 * Custom hook that enables pull-to-refresh functionality in WebKit containers
 * Only activates when running inside a native webview
 */
export function usePullToRefresh(options: UsePullToRefreshOptions = {}) {
  const {
    onRefresh = () => window.location.reload(),
    threshold = 80,
    disabled = false
  } = options

  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef<number>(0)
  const pullDistance = useRef<number>(0)
  const indicatorRef = useRef<HTMLDivElement | null>(null)
  const isEnabled = useRef(false)

  useEffect(() => {
    // Only enable in WebKit containers
    isEnabled.current = !disabled && isWebKitContainer()
    
    if (!isEnabled.current) {
      return
    }

    let isTouching = false

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if we're at the top of the page
      if (window.scrollY === 0 && !isRefreshing) {
        touchStartY.current = e.touches[0].clientY
        isTouching = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || isRefreshing) return

      const currentY = e.touches[0].clientY
      const deltaY = currentY - touchStartY.current

      // Only allow pulling down
      if (deltaY > 0 && window.scrollY === 0) {
        pullDistance.current = Math.min(deltaY * 0.5, threshold * 1.5)
        
        // Update indicator
        if (indicatorRef.current) {
          const progress = Math.min(pullDistance.current / threshold, 1)
          indicatorRef.current.style.transform = `translateY(${pullDistance.current}px)`
          indicatorRef.current.style.opacity = `${progress}`
        }

        // Prevent default scroll behavior
        if (deltaY > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isTouching) return
      
      isTouching = false

      // Trigger refresh if threshold is met
      if (pullDistance.current >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = `translateY(${threshold}px)`
        }

        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        }

        // Wait a bit before hiding to show completion
        setTimeout(() => {
          setIsRefreshing(false)
          if (indicatorRef.current) {
            indicatorRef.current.style.transform = 'translateY(0)'
            indicatorRef.current.style.opacity = '0'
          }
          pullDistance.current = 0
        }, 500)
      } else {
        // Reset indicator
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = 'translateY(0)'
          indicatorRef.current.style.opacity = '0'
        }
        pullDistance.current = 0
      }
    }

    // Add event listeners with passive: false to allow preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onRefresh, threshold, disabled, isRefreshing])

  return {
    isRefreshing,
    isEnabled: isEnabled.current,
    indicatorRef,
  }
}
