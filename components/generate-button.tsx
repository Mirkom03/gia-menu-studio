'use client'

import { Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GenerateButtonProps {
  onClick: () => void
  loading: boolean
  disabled?: boolean
  regenerate?: boolean
}

export function GenerateButton({
  onClick,
  loading,
  disabled,
  regenerate,
}: GenerateButtonProps) {
  return (
    <Button
      variant="default"
      size="lg"
      className="w-full lg:w-auto"
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" data-icon="inline-start" />
          Generando tu menu...
        </>
      ) : regenerate ? (
        <>
          <RefreshCw data-icon="inline-start" />
          Regenerar
        </>
      ) : (
        <>
          <Sparkles data-icon="inline-start" />
          Generar Imagen
        </>
      )}
    </Button>
  )
}
