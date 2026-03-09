import { ThemeToggle } from '@/components/theme-toggle'
import { PreferenceForm } from '@/components/preference-form'
import { StyleManager } from '@/components/style-manager'
import { getUserPreferences } from '@/lib/actions/preference-actions'
import { getAllStyles } from '@/lib/actions/style-actions'

export default async function SettingsPage() {
  const [preferences, styles] = await Promise.all([
    getUserPreferences(),
    getAllStyles(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Ajustes</h1>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-medium">Apariencia</h2>
        <div className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
          <div>
            <p className="font-medium">Modo oscuro</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cambia entre tema claro y oscuro
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-medium">Preferencias por defecto</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Valores iniciales para la generación de imágenes
          </p>
        </div>
        <PreferenceForm initialPreferences={preferences} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-medium">Gestión de estilos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra los estilos disponibles para generar imágenes
          </p>
        </div>
        <StyleManager initialStyles={styles} />
      </section>
    </div>
  )
}
