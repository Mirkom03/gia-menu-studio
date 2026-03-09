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
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        {initialData ? 'Duplicar Menu' : 'Crear Menu'}
      </h1>
      <MenuForm initialData={initialData} />
    </div>
  )
}
