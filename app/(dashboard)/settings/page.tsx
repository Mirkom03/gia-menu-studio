'use client'

import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  return (
    <div className="pt-6 lg:pt-10">
      <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Apariencia</h2>
        <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Modo oscuro</p>
            <p className="text-sm text-muted-foreground">
              Cambia entre tema claro y oscuro
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className="mt-8">
        <p className="text-sm text-muted-foreground">
          Mas opciones proximamente
        </p>
      </section>
    </div>
  )
}
