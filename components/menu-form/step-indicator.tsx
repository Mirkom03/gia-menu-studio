'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  steps: string[]
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((label, index) => {
        const isCompleted = index < current
        const isCurrent = index === current
        const isFuture = index > current

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                  isCompleted && 'bg-primary text-primary-foreground shadow-sm',
                  isCurrent && 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20',
                  isFuture && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'hidden text-xs lg:block',
                  isCurrent && 'font-semibold text-foreground',
                  isCompleted && 'font-medium text-foreground',
                  isFuture && 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-px flex-1 transition-colors duration-300',
                  index < current ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
