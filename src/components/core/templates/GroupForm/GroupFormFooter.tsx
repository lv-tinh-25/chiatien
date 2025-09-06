'use client'

import { Button } from '@/components/core/atoms/Button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type GroupFormFooterProps = {
  isEdit: boolean
  isSubmitting: boolean
  cancelHref: string
}

export function GroupFormFooter({
  isEdit,
  isSubmitting,
  cancelHref,
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
    <div className="flex items-center gap-2.5 lg:justify-end">
      <Button variant="ghost" asChild>
        <Link href={cancelHref}>{t('cancel')}</Link>
      </Button>
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
