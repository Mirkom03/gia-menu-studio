import { Clock } from 'lucide-react'

export default function HistoryPage() {
  return (
    <div className="flex flex-col items-center pt-12 lg:pt-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Historial</h1>
      <p className="mt-2 text-muted-foreground">Proximamente</p>
    </div>
  )
}
