'use client'

import { FormField } from '@/components/core/molecules/FormField'
import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  description?: string
  errorKey?: string
}

export function FormTextarea({
  label,
  description,
  errorKey,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <FormField label={label} description={description} errorKey={errorKey}>
      {({ id, describedBy }) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={errorKey ? true : undefined}
          className={cn(
            'min-h-24 w-full rounded-control border border-input bg-card p-3 text-body-lg text-foreground',
            'placeholder:text-muted-foreground',
            'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20',
            className,
          )}
          {...props}
        />
      )}
    </FormField>
  )
}
