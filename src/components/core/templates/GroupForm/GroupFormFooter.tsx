'use client'

import { Button } from '@/components/core/atoms/Button'
import { useTranslations } from 'next-intl'

type GroupFormFooterProps = {
  isEdit: boolean
  isSubmitting: boolean
}

export function GroupFormFooter({
  isEdit,
  isSubmitting,
}: GroupFormFooterProps) {
  const t = useTranslations('GroupForm.Settings')

  const label = isEdit
    ? isSubmitting
      ? t('saving')
      : t('save')
    : isSubmitting
      ? t('creating')
      : t('create')

  return (
    <div className="flex items-center lg:justify-end">
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="flex-1 shadow-action lg:flex-none"
      >
        {label}
      </Button>
    </div>
  )
}
