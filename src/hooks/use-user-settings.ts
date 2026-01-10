import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth'
import { getUserSettings } from '@/lib/user-settings'

/**
 * Hook to sync user settings from database on mount/login
 */
export function useUserSettings() {
  const { i18n } = useTranslation()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.id) return

      try {
        const settings = await getUserSettings(user.id)
        
        // Apply language setting if it exists
        if (settings.language && settings.language !== i18n.language) {
          i18n.changeLanguage(settings.language)
          localStorage.setItem('language', settings.language)
        }
        
        // Apply other settings as needed (theme, notifications, etc.)
        // if (settings.theme) { ... }
      } catch (error) {
        console.error('Failed to load user settings:', error)
      }
    }

    loadUserSettings()
  }, [user?.id, i18n])
}
