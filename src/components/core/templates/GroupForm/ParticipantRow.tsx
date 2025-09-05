'use client'

import { Button } from '@/components/core/atoms/Button'
import { FormInput } from '@/components/core/molecules/FormInput'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { UseFormRegisterReturn } from 'react-hook-form'

type ParticipantRowProps = {
  index: number
  registration: UseFormRegisterReturn
  errorKey?: string
  removable: boolean
  onRemove: () => void
}

/**
 * Exactly one button lives in this row. The ported Playwright helper locates a
 * participant's remove control as "the button inside the li", so a second one
 * would silently break group creation in every ported spec.
 */
export function ParticipantRow({
  index,
  registration,
  errorKey,
  removable,
  onRemove,
}: ParticipantRowProps) {
  const t = useTranslations('GroupForm.Participants')

  return (
    <li className="flex items-start gap-2">
      <FormInput
        label={`${t('title')} ${index + 1}`}
        placeholder={t('new')}
        errorKey={errorKey}
        fieldClassName="flex-1"
        {...registration}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-6 text-muted-foreground"
        disabled={!removable}
        title={removable ? undefined : t('protectedParticipant')}
        aria-label={`${t('title')} ${index + 1}`}
        onClick={onRemove}
      >
        <X aria-hidden />
      </Button>
    </li>
  )
}
