'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useId, type ReactNode } from 'react'

type FormFieldProps = {
  label: string
  description?: string
  /** A message *key* from the Zod schemas, not a sentence. */
  errorKey?: string
  className?: string
  /** Set to `sr-only` where the design places the label outside the field. */
  labelClassName?: string
  children: (props: {
    id: string
    describedBy: string | undefined
  }) => ReactNode
}

/**
 * Owns the label/control association the ported Playwright helper
 * `fieldByLabel` relies on, and resolves schema error keys through next-intl —
 * the Zod schemas return keys such as `min2`, never user-facing text.
 */
export function FormField({
  label,
  description,
  errorKey,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  const t = useTranslations('SchemaErrors')
  const id = useId()
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = errorKey ? `${id}-error` : undefined
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-label-md text-foreground', labelClassName)}
      >
        {label}
      </label>
      {children({ id, describedBy })}
      {description && (
        <p id={descriptionId} className="text-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {errorKey && (
        <p id={errorId} role="alert" className="text-body-sm text-destructive">
          {t(errorKey)}
        </p>
      )}
    </div>
  )
}
