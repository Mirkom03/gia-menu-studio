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
        <h2 className="text-lg font-semibold">Preferencias por defecto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Valores iniciales para la generacion de imagenes
        </p>
        <div className="mt-4">
          <PreferenceForm initialPreferences={preferences} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Gestion de estilos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra los estilos disponibles para generar imagenes
        </p>
        <div className="mt-4">
          <StyleManager initialStyles={styles} />
        </div>
      </section>
    </div>
  )
}
