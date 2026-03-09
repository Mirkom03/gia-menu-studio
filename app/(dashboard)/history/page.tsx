import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MenuCard } from '@/components/menu-card'
import { getFilteredMenus } from '@/lib/actions/menu-actions'

export default async function HistoryPage() {
  const menus = await getFilteredMenus({})

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Historial de Menus
      </h1>

      {menus.length === 0 ? (
        <div className="flex flex-col items-center pt-12">
          <p className="text-muted-foreground mb-4">
            No hay menus guardados
          </p>
          <Button render={<Link href="/create" />}>
            <Plus data-icon="inline-start" />
            Crear tu primer menu
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}
    </div>
  )
}
