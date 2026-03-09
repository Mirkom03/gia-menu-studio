import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MenuCard } from '@/components/menu-card'
import { GalleryFilters } from '@/components/gallery-filters'
import {
  getFilteredMenus,
  getSignedThumbnailUrls,
} from '@/lib/actions/menu-actions'
import type { Language } from '@/lib/types'

interface HistoryPageProps {
  searchParams: Promise<{
    type?: string
    search?: string
    dateFrom?: string
    dateTo?: string
    language?: string
  }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams
  const type = params.type as 'weekly' | 'event' | undefined
  const search = params.search || undefined
  const dateFrom = params.dateFrom || undefined
  const dateTo = params.dateTo || undefined
  const language = params.language as Language | undefined

  const hasFilters = !!(params.type || params.search || params.dateFrom || params.dateTo || params.language)

  const menus = await getFilteredMenus({ type, search, dateFrom, dateTo, language })

  // Resolve signed thumbnail URLs
  const thumbnailPaths: string[] = []
  const menuToPath: Record<string, string> = {}

  for (const menu of menus) {
    const firstImage = menu.menu_images?.find((img) => img.thumbnail_url)
    if (firstImage?.thumbnail_url) {
      thumbnailPaths.push(firstImage.thumbnail_url)
      menuToPath[menu.id] = firstImage.thumbnail_url
    }
  }

  const signedUrls = await getSignedThumbnailUrls(thumbnailPaths)

  // Build menuId -> signedUrl map
  const thumbnailMap: Record<string, string> = {}
  for (const [menuId, path] of Object.entries(menuToPath)) {
    if (signedUrls[path]) {
      thumbnailMap[menuId] = signedUrls[path]
    }
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Historial de Menus
      </h1>

      <div className="mb-6">
        <GalleryFilters
          currentType={params.type ?? ''}
          currentSearch={params.search ?? ''}
          currentDateFrom={params.dateFrom ?? ''}
          currentDateTo={params.dateTo ?? ''}
          currentLanguage={params.language ?? ''}
        />
      </div>

      {menus.length === 0 ? (
        <div className="flex flex-col items-center pt-12">
          {hasFilters ? (
            <>
              <p className="text-muted-foreground mb-4">
                No se encontraron menus
              </p>
              <Button render={<Link href="/history" />}>
                Limpiar filtros
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                No hay menus guardados
              </p>
              <Button render={<Link href="/create" />}>
                <Plus data-icon="inline-start" />
                Crear tu primer menu
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              thumbnailUrl={thumbnailMap[menu.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
