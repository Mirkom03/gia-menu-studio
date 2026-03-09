import Link from 'next/link'
import { PlusCircle, CalendarDays, ArrowRight, Copy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MenuCard } from '@/components/menu-card'
import {
  getCurrentWeekMenu,
  getRecentMenus,
  getSignedThumbnailUrls,
  getMostRecentWeeklyMenu,
} from '@/lib/actions/menu-actions'
import { getSignedUrl } from '@/lib/image-utils'
import { createClient } from '@/lib/supabase/server'
import { formatRangeSpanish } from '@/lib/date-utils'

export default async function DashboardPage() {
  const [currentWeekMenu, recentMenus, mostRecentWeekly] = await Promise.all([
    getCurrentWeekMenu(),
    getRecentMenus(),
    getMostRecentWeeklyMenu(),
  ])

  // Signed URL for the current week menu thumbnail
  let weekMenuThumbnailUrl: string | null = null
  if (currentWeekMenu) {
    const firstImage = currentWeekMenu.menu_images?.find(
      (img) => img.thumbnail_url
    )
    if (firstImage?.thumbnail_url) {
      try {
        const supabase = await createClient()
        weekMenuThumbnailUrl = await getSignedUrl(
          supabase,
          'menu-images',
          firstImage.thumbnail_url
        )
      } catch {
        // Skip failed URL silently
      }
    }
  }

  // Signed URLs for recent menu thumbnails
  const thumbnailPaths: string[] = []
  const menuToPath: Record<string, string> = {}

  for (const menu of recentMenus) {
    const firstImage = menu.menu_images?.find((img) => img.thumbnail_url)
    if (firstImage?.thumbnail_url) {
      thumbnailPaths.push(firstImage.thumbnail_url)
      menuToPath[menu.id] = firstImage.thumbnail_url
    }
  }

  const signedUrls = await getSignedThumbnailUrls(thumbnailPaths)

  const thumbnailMap: Record<string, string> = {}
  for (const [menuId, path] of Object.entries(menuToPath)) {
    if (signedUrls[path]) {
      thumbnailMap[menuId] = signedUrls[path]
    }
  }

  const weekDateLabel = currentWeekMenu
    ? formatRangeSpanish(
        currentWeekMenu.week_start,
        currentWeekMenu.week_end ?? currentWeekMenu.week_start
      )
    : null

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight lg:text-5xl">
          Bienvenido a Già
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Tu estudio de menús con IA
        </p>
      </div>

      {/* Current week section */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium tracking-tight">Menú de esta semana</h2>
        {currentWeekMenu ? (
          <div className="space-y-3">
            <Link href={`/menu/${currentWeekMenu.id}`} className="block group">
              <Card className="flex flex-col sm:flex-row overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
                {weekMenuThumbnailUrl && (
                  <img
                    src={weekMenuThumbnailUrl}
                    alt={`Menu semanal ${weekDateLabel}`}
                    className="aspect-[4/3] sm:w-52 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                )}
                <CardContent className="flex-1 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default">Semanal</Badge>
                    <Badge variant="outline">
                      {currentWeekMenu.status === 'generated'
                        ? 'Generado'
                        : currentWeekMenu.status === 'final'
                          ? 'Final'
                          : 'Borrador'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{weekDateLabel}</p>
                </CardContent>
              </Card>
            </Link>
            {mostRecentWeekly && (
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/create?duplicate=${mostRecentWeekly.id}`}
                  />
                }
              >
                <Copy data-icon="inline-start" />
                Duplicar para la próxima semana
              </Button>
            )}
          </div>
        ) : (
          <Card className="flex flex-col items-center p-8 border-dashed grain-overlay">
            <p className="text-muted-foreground mb-5">
              No hay menú para esta semana
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button render={<Link href="/create" />}>
                <CalendarDays data-icon="inline-start" />
                Crear Menú del Día
              </Button>
              {mostRecentWeekly && (
                <Button
                  variant="outline"
                  render={
                    <Link
                      href={`/create?duplicate=${mostRecentWeekly.id}`}
                    />
                  }
                >
                  <Copy data-icon="inline-start" />
                  Duplicar para esta semana
                </Button>
              )}
            </div>
          </Card>
        )}
      </section>

      {/* Create buttons */}
      <section>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/create" className="group">
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold font-display">Crear Menú del Día</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Menú semanal con IA
                </CardDescription>
              </div>
            </Card>
          </Link>

          <Link href="/create" className="group">
            <Card className="flex items-center gap-4 border-dashed p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-primary text-primary">
                <PlusCircle className="size-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold font-display">Menú de Evento</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Menú especial para eventos
                </CardDescription>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent menus */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-medium tracking-tight">Menús Recientes</h2>
          <Button variant="ghost" size="sm" render={<Link href="/history" />}>
            Ver todo el historial
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        {recentMenus.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay menús guardados
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-x-visible">
            {recentMenus.map((menu) => (
              <div key={menu.id} className="min-w-[200px] lg:min-w-0">
                <MenuCard
                  menu={menu}
                  thumbnailUrl={thumbnailMap[menu.id]}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
