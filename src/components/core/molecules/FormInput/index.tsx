'use client'

import { Input } from '@/components/core/atoms/Input'
import { FormField } from '@/components/core/molecules/FormField'
import type { InputHTMLAttributes } from 'react'

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  description?: string
  errorKey?: string
  fieldClassName?: string
  labelClassName?: string
}

export function FormInput({
  label,
  description,
  errorKey,
  fieldClassName,
  labelClassName,
  ...props
}: FormInputProps) {
  return (
    <FormField
      label={label}
      description={description}
      errorKey={errorKey}
      className={fieldClassName}
      labelClassName={labelClassName}
    >
      {({ id, describedBy }) => (
        <Input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={errorKey ? true : undefined}
          {...props}
        />
      )}
    </FormField>
  )
}
