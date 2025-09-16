'use client'

import { Button } from '@/components/core/atoms/Button'
import { useTranslations } from 'next-intl'

type GroupFormFooterProps = {
  isEdit: boolean
  isSubmitting: boolean
  canSubmit: boolean
}

export function GroupFormFooter({
  isEdit,
  isSubmitting,
  canSubmit,
}: GroupFormFooterProps) {
  const t = useTranslations('GroupForm.Actions')

  const label = isEdit
    ? isSubmitting
      ? t('saving')
      : t('save')
    : isSubmitting
      ? t('creating')
      : t('create')

  return (
    <div className="flex items-center lg:justify-end">
      {/* Disabled only for "nothing has changed", which needs no explanation.
          An invalid field leaves it enabled: the reader has to be able to press
          it and be told where the mistake is. */}
      <Button
        type="submit"
        size="lg"
        pending={isSubmitting}
        disabled={!canSubmit}
        className="flex-1 shadow-action lg:flex-none"
      >
        {label}
      </Button>
    </div>
  )
}
