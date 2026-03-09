import { MenuForm } from '@/components/menu-form/menu-form'
import { getMenuForDuplication } from '@/lib/actions/menu-actions'
import type { MenuFormData } from '@/lib/menu-helpers'

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ duplicate?: string }>
}) {
  const params = await searchParams
  let initialData: MenuFormData | undefined

  if (params.duplicate) {
    try {
      initialData = await getMenuForDuplication(params.duplicate)
    } catch {
      // Fall back to empty form on error
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-8">
        {initialData ? 'Duplicar Menú' : 'Crear Menú'}
      </h1>
      <MenuForm initialData={initialData} />
    </div>
  )
}
