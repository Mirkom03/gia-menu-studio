'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { signInWithGoogle } from './actions'
import { Button } from '@/components/ui/button'

function LoginContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'unauthorized') {
      toast.error('Acceso no autorizado')
    } else if (error === 'oauth_failed' || error === 'auth_failed') {
      toast.error('Error al iniciar sesion')
    }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold">Gia</h1>
      <form action={signInWithGoogle}>
        <Button size="lg" type="submit">
          Entrar con Google
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
