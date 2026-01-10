import { supabase } from './supabase'

export interface UserSettings {
  language?: 'en' | 'es' | 'fr'
  theme?: 'light' | 'dark' | 'system'
  notifications?: {
    email?: boolean
    expiry_alerts?: boolean
  }
}

/**
 * Get user settings from the database
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user settings:', error)
    return {}
  }

  // Type assertion since we know settings exists but TypeScript doesn't recognize it yet
  const profile = data as unknown as { settings: UserSettings }
  return profile?.settings || {}
}

/**
 * Update user settings in the database
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current settings first
    const currentSettings = await getUserSettings(userId)
    
    // Merge with new settings
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    }

    const { error } = await supabase
      .from('profiles')
      // @ts-expect-error - settings column exists but TypeScript types haven't been regenerated yet
      .update({ 
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating user settings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update language preference for user
 */
export async function updateUserLanguage(
  userId: string,
  language: 'en' | 'es' | 'fr'
): Promise<{ success: boolean; error?: string }> {
  return updateUserSettings(userId, { language })
}
