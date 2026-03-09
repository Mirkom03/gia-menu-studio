import { MenuForm } from '@/components/menu-form/menu-form'

export default function CreatePage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Crear Menu</h1>
      <MenuForm />
    </div>
  )
}
