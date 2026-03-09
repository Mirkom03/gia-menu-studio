'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/menu-form/step-indicator'
import { StepTypeWeek } from '@/components/menu-form/step-type-week'
import { StepDishesPrice } from '@/components/menu-form/step-dishes-price'
import { StepReview } from '@/components/menu-form/step-review'
import { createMenu } from '@/lib/actions/menu-actions'
import { INITIAL_FORM_DATA, validateStep } from '@/lib/menu-helpers'
import type { MenuFormData } from '@/lib/menu-helpers'

const STEPS = ['Tipo y Fecha', 'Platos y Precio', 'Revisar']

interface MenuFormProps {
  initialData?: MenuFormData
}

export function MenuForm({ initialData }: MenuFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<MenuFormData>(
    initialData ?? { ...INITIAL_FORM_DATA, dishes: [] }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detect unsaved changes
  const hasData =
    formData.dishes.some((d) => d.nameEs.trim().length > 0) ||
    formData.price.trim().length > 0

  useEffect(() => {
    if (!hasData) return

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasData])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const result = await createMenu(formData)
      toast.success('Menu guardado correctamente')
      router.push(`/menu/${result.id}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error inesperado'
      toast.error(message)
      setIsSubmitting(false)
    }
  }, [formData, router])

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <StepIndicator steps={STEPS} current={step} />

      {/* Current step */}
      <div className="min-h-[300px]">
        {step === 0 && (
          <StepTypeWeek data={formData} onChange={setFormData} />
        )}
        {step === 1 && (
          <StepDishesPrice data={formData} onChange={setFormData} />
        )}
        {step === 2 && (
          <StepReview
            data={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 flex items-center justify-between border-t bg-background py-3 -mx-4 px-4">
        {step > 0 ? (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            type="button"
          >
            Atras
          </Button>
        ) : (
          <div />
        )}

        {step < 2 && (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!validateStep(step, formData)}
            type="button"
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  )
}
