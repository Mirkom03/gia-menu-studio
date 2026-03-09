'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Language } from '@/lib/types'

export interface UserPreferences {
  defaultLanguage: Language
  defaultAspectRatio: string
  defaultDpi: number
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultLanguage: 'es',
  defaultAspectRatio: 'instagram',
  defaultDpi: 72,
}

/**
 * Fetches the current user's preferences, merged with defaults for missing fields.
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado. Inicia sesion para ver las preferencias.')
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('preferences')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return { ...DEFAULT_PREFERENCES }
  }

  return {
    ...DEFAULT_PREFERENCES,
    ...(data.preferences as Partial<UserPreferences>),
  }
}

/**
 * Upserts the current user's preferences (partial update supported).
 */
export async function updateUserPreferences(
  prefs: Partial<UserPreferences>
): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado. Inicia sesion para guardar las preferencias.')
  }

  // Fetch existing to merge
  const current = await getUserPreferences()
  const merged = { ...current, ...prefs }

  const { error } = await supabase.from('user_preferences').upsert(
    {
      user_id: user.id,
      preferences: merged,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    throw new Error(`Error al guardar preferencias: ${error.message}`)
  }

  revalidatePath('/settings')
}
