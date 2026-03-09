'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { signIn } from './actions'
import { Button } from '@/components/ui/button'

function LoginContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'invalid_credentials') {
      toast.error('Correo o contraseña incorrectos')
    } else if (error === 'missing_fields') {
      toast.error('Introduce correo y contraseña')
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/40">
      <div className="grain-overlay w-full max-w-sm rounded-2xl border bg-card/80 p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-primary">Già</h1>
          <p className="text-sm text-muted-foreground">Menu Studio</p>
        </div>
        <form action={signIn} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="chef@gia.com"
              required
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
            />
          </div>
          <Button size="lg" type="submit" className="mt-2 w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
