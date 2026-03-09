'use server'

import { createClient } from '@/lib/supabase/server'
import type { Style } from '@/lib/types'

/**
 * Fetches all active styles ordered by sort_order.
 */
export async function getStyles(): Promise<Style[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado. Inicia sesion para ver los estilos.')
  }

  const { data, error } = await supabase
    .from('styles')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Error al cargar estilos: ${error.message}`)
  }

  return (data ?? []) as Style[]
}
