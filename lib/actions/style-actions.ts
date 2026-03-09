'use server'

import { revalidatePath } from 'next/cache'
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

/**
 * Fetches ALL styles (including inactive) for the settings management UI.
 */
export async function getAllStyles(): Promise<Style[]> {
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
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Error al cargar estilos: ${error.message}`)
  }

  return (data ?? []) as Style[]
}

/**
 * Creates a new custom style.
 */
export async function createStyle(data: {
  name: string
  description: string
  promptTemplate: string
  colors?: Record<string, string>
}): Promise<Style> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado. Inicia sesion para crear estilos.')
  }

  // Get max sort_order to append at the end
  const { data: maxRow } = await supabase
    .from('styles')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxRow?.sort_order ?? 0) + 1

  const { data: created, error } = await supabase
    .from('styles')
    .insert({
      name: data.name,
      description: data.description,
      prompt_template: data.promptTemplate,
      colors: data.colors ?? {},
      is_active: true,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error || !created) {
    throw new Error(`Error al crear estilo: ${error?.message}`)
  }

  revalidatePath('/settings')
  return created as Style
}

/**
 * Updates an existing style.
 */
export async function updateStyle(
  id: string,
  data: {
    name?: string
    description?: string
    promptTemplate?: string
    colors?: Record<string, string>
  }
): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado. Inicia sesion para editar estilos.')
  }

  const updates: Record<string, unknown> = {}
  if (data.name !== undefined) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.promptTemplate !== undefined) updates.prompt_template = data.promptTemplate
  if (data.colors !== undefined) updates.colors = data.colors

  const { error } = await supabase
    .from('styles')
    .update(updates)
    .eq('id', id)

  if (error) {
    throw new Error(`Error al actualizar estilo: ${error.message}`)
  }

  revalidatePath('/settings')
}

/**
 * Toggles a style active/inactive.
 */
export async function toggleStyleActive(
  id: string,
  isActive: boolean
): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado. Inicia sesion para modificar estilos.')
  }

  const { error } = await supabase
    .from('styles')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    throw new Error(`Error al cambiar estado del estilo: ${error.message}`)
  }

  revalidatePath('/settings')
  revalidatePath('/menu')
}
