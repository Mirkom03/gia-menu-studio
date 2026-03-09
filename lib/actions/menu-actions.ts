'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Menu, MenuItem } from '@/lib/types'
import type { MenuFormData } from '@/lib/menu-helpers'

export type MenuWithItemCount = Menu & { menu_items: { count: number }[] }

/**
 * Creates a new menu with its dishes.
 * Requires authenticated user.
 */
export async function createMenu(
  formData: MenuFormData
): Promise<{ id: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado. Inicia sesion para crear un menu.')
  }

  try {
    // Parse price (handle European comma decimal)
    const price = formData.price
      ? parseFloat(formData.price.replace(',', '.'))
      : null

    // Insert menu
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({
        type: formData.type,
        week_start: formData.weekStart,
        week_end: formData.weekEnd,
        active_days: [],
        title: formData.title || null,
        price,
        status: 'draft' as const,
        user_id: user.id,
      })
      .select()
      .single()

    if (menuError || !menu) {
      throw new Error(
        `Error al crear el menu: ${menuError?.message ?? 'Sin datos'}`
      )
    }

    // Bulk insert dishes if any
    if (formData.dishes.length > 0) {
      const items = formData.dishes.map((dish, index) => ({
        menu_id: menu.id,
        category: dish.category,
        name_es: dish.nameEs,
        name_en: dish.nameEn || null,
        name_fr: dish.nameFr || null,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase
        .from('menu_items')
        .insert(items)

      if (itemsError) {
        throw new Error(
          `Menu creado pero error al guardar platos: ${itemsError.message}`
        )
      }
    }

    revalidatePath('/history')
    revalidatePath('/')

    return { id: menu.id }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('Error inesperado al crear el menu.')
  }
}

/**
 * Returns all menus for the current user, ordered by creation date (newest first).
 * Includes item count per menu.
 */
export async function getMenus(): Promise<MenuWithItemCount[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('menus')
    .select('*, menu_items(count)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error al cargar los menus: ${error.message}`)
  }

  return (data ?? []) as MenuWithItemCount[]
}

/**
 * Returns a single menu with all its items.
 */
export async function getMenuById(
  id: string
): Promise<{ menu: Menu; items: MenuItem[] }> {
  const supabase = await createClient()

  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .select('*')
    .eq('id', id)
    .single()

  if (menuError || !menu) {
    throw new Error(
      `Menu no encontrado: ${menuError?.message ?? 'Sin datos'}`
    )
  }

  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('menu_id', id)
    .order('sort_order')

  if (itemsError) {
    throw new Error(
      `Error al cargar los platos: ${itemsError.message}`
    )
  }

  return { menu: menu as Menu, items: (items ?? []) as MenuItem[] }
}

/**
 * Deletes a menu and its items (CASCADE).
 */
export async function deleteMenu(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('menus').delete().eq('id', id)

  if (error) {
    throw new Error(`Error al eliminar el menu: ${error.message}`)
  }

  revalidatePath('/history')
  revalidatePath('/')
}
