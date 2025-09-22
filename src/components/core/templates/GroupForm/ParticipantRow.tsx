'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Button } from '@/components/core/atoms/Button'
import { FormInput } from '@/components/core/molecules/FormInput'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { UseFormRegisterReturn } from 'react-hook-form'

/** Why a row cannot be removed. Two reasons, and they read differently. */
export type ParticipantLock = 'expenses' | 'lastOne' | null

type ParticipantRowProps = {
  index: number
  name: string
  peers: readonly string[]
  registration: UseFormRegisterReturn
  errorKey?: string
  lockedBy: ParticipantLock
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
  lockedBy,
  onRemove,
}: ParticipantRowProps) {
  const t = useTranslations('GroupForm.Participants')

  const lockReason =
    lockedBy === 'expenses'
      ? t('protectedParticipant')
      : lockedBy === 'lastOne'
        ? t('lastParticipant')
        : undefined

  // Aligned to the top rather than the centre: a validation message grows the
  // field, and centring would drag the avatar and the delete button down with
  // it.
  return (
    <li className="flex items-start gap-2.5 py-1">
      <span className="flex min-h-touch-min shrink-0 items-center">
        <Avatar name={name} peers={peers} size="lg" className="size-7.5" />
      </span>
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
        variant="outline"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        disabled={lockedBy !== null}
        title={lockReason}
        aria-label={`${t('title')} ${index + 1}`}
        onClick={onRemove}
      >
        <Trash2 aria-hidden />
      </Button>
    </li>
  )
}
