'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Button } from '@/components/core/atoms/Button'
import { FormInput } from '@/components/core/molecules/FormInput'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { UseFormRegisterReturn } from 'react-hook-form'

type ParticipantRowProps = {
  index: number
  name: string
  peers: readonly string[]
  registration: UseFormRegisterReturn
  errorKey?: string
  removable: boolean
  onRemove: () => void
}

/**
 * Exactly one button lives in this row. The ported Playwright helper locates a
 * participant's remove control as "the button inside the li", so a second one
 * would silently break group creation in every ported spec.
 *
 * The design draws a face and a name, not a numbered field — but a name still
 * has to be editable, so the label goes to assistive technology only.
 */
export function ParticipantRow({
  index,
  name,
  peers,
  registration,
  errorKey,
  removable,
  onRemove,
}: ParticipantRowProps) {
  const t = useTranslations('GroupForm.Participants')

  return (
    <li className="flex items-center gap-2.5 py-1">
      <Avatar name={name} peers={peers} size="lg" className="size-7.5" />
      <FormInput
        label={`${t('title')} ${index + 1}`}
        labelClassName="sr-only"
        placeholder={t('new')}
        errorKey={errorKey}
        fieldClassName="flex-1"
        {...registration}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground-subtle"
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
