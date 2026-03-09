'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Menu, MenuItem, MenuImage, Language } from '@/lib/types'
import type { MenuFormData } from '@/lib/menu-helpers'
import { getSignedUrl } from '@/lib/image-utils'

export type MenuWithItemCount = Menu & { menu_items: { count: number }[] }

export type MenuWithImages = Menu & {
  menu_items: { count: number }[]
  menu_images: Pick<MenuImage, 'id' | 'thumbnail_url' | 'language'>[]
}

export interface FilteredMenusParams {
  type?: 'weekly' | 'event'
  search?: string
  dateFrom?: string
  dateTo?: string
  language?: Language
}

/**
 * Returns filtered menus with images, ordered newest first.
 */
export async function getFilteredMenus(
  params: FilteredMenusParams
): Promise<MenuWithImages[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado.')
  }

  // Collect menu IDs to filter by (from search and language)
  let filterIds: string[] | null = null

  // Language filter: find menus that have images in the specified language
  if (params.language) {
    const { data: langImages } = await supabase
      .from('menu_images')
      .select('menu_id')
      .eq('language', params.language)

    const langMenuIds = [...new Set((langImages ?? []).map((r) => r.menu_id))]
    filterIds = langMenuIds
  }

  // Search filter: match dish names or event titles
  if (params.search) {
    const search = params.search.trim()
    if (search) {
      // Search in menu_items by name_es
      const { data: matchingItems } = await supabase
        .from('menu_items')
        .select('menu_id')
        .ilike('name_es', `%${search}%`)

      const itemMenuIds = [...new Set((matchingItems ?? []).map((r) => r.menu_id))]

      // Search in menus by title (event menus)
      const { data: matchingMenus } = await supabase
        .from('menus')
        .select('id')
        .ilike('title', `%${search}%`)

      const titleMenuIds = (matchingMenus ?? []).map((r) => r.id)

      const searchIds = [...new Set([...itemMenuIds, ...titleMenuIds])]

      // Intersect with language filter if both active
      if (filterIds !== null) {
        filterIds = filterIds.filter((id) => searchIds.includes(id))
      } else {
        filterIds = searchIds
      }
    }
  }

  // If filters produced an empty set, return early
  if (filterIds !== null && filterIds.length === 0) {
    return []
  }

  // Build main query
  let query = supabase
    .from('menus')
    .select('*, menu_items(count), menu_images(id, thumbnail_url, language)')
    .order('created_at', { ascending: false })

  if (params.type) {
    query = query.eq('type', params.type)
  }
  if (params.dateFrom) {
    query = query.gte('week_start', params.dateFrom)
  }
  if (params.dateTo) {
    query = query.lte('week_start', params.dateTo)
  }
  if (filterIds !== null) {
    query = query.in('id', filterIds)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error al cargar los menus: ${error.message}`)
  }

  return (data ?? []) as MenuWithImages[]
}

/**
 * Returns signed URLs for an array of thumbnail storage paths.
 */
export async function getSignedThumbnailUrls(
  paths: string[]
): Promise<Record<string, string>> {
  if (paths.length === 0) return {}

  const supabase = await createClient()
  const result: Record<string, string> = {}

  await Promise.all(
    paths.map(async (path) => {
      try {
        const url = await getSignedUrl(supabase, 'menu-images', path)
        result[path] = url
      } catch {
        // Skip failed URLs silently
      }
    })
  )

  return result
}

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

/**
 * Deletes a menu, its storage images, and the DB record.
 * Cleans up both full images and thumbnails from storage.
 */
export async function deleteMenuWithImages(id: string): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('No autenticado.')
  }

  // Fetch all images for this menu
  const { data: images, error: imgError } = await supabase
    .from('menu_images')
    .select('image_url, thumbnail_url')
    .eq('menu_id', id)

  if (imgError) {
    throw new Error(`Error al obtener imagenes: ${imgError.message}`)
  }

  // Collect all storage paths (filter nulls)
  const storagePaths: string[] = []
  for (const img of images ?? []) {
    if (img.image_url) storagePaths.push(img.image_url)
    if (img.thumbnail_url) storagePaths.push(img.thumbnail_url)
  }

  // Delete storage objects if any
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('menu-images')
      .remove(storagePaths)

    if (storageError) {
      console.error('Error al eliminar archivos de storage:', storageError.message)
      // Continue with DB deletion even if storage cleanup fails
    }
  }

  // Delete the menu record (CASCADE deletes menu_items and menu_images)
  const { error: deleteError } = await supabase
    .from('menus')
    .delete()
    .eq('id', id)

  if (deleteError) {
    throw new Error(`Error al eliminar el menu: ${deleteError.message}`)
  }

  revalidatePath('/history')
  revalidatePath('/')
}

/**
 * Returns all images for a menu, ordered newest first.
 */
export async function getMenuImages(menuId: string): Promise<MenuImage[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('menu_images')
    .select('*')
    .eq('menu_id', menuId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error al cargar las imagenes: ${error.message}`)
  }

  return (data ?? []) as MenuImage[]
}
