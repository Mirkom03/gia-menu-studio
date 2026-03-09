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
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold">Gia</h1>
      <form action={signIn} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          name="email"
          type="email"
          placeholder="Correo electronico"
          required
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button size="lg" type="submit">
          Entrar
        </Button>
      </form>
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
