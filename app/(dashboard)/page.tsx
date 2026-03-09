import Link from 'next/link'
import { PlusCircle, CalendarDays } from 'lucide-react'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center pt-12 lg:pt-20">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
        Bienvenido a Gia
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tu estudio de menus con IA
      </p>

      <div className="mt-10 grid w-full max-w-md gap-4">
        <Link href="/create" className="group">
          <Card className="flex items-center gap-4 p-6 transition-colors hover:border-primary">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base">Crear Menu del Dia</CardTitle>
              <CardDescription>
                Genera tu menu semanal con IA
              </CardDescription>
            </div>
          </Card>
        </Link>

        <Link href="/create" className="group">
          <Card className="flex items-center gap-4 border-dashed p-6 transition-colors hover:border-primary">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-primary text-primary">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-base">Crear Menu de Evento</CardTitle>
              <CardDescription>
                Disena un menu especial para eventos
              </CardDescription>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
