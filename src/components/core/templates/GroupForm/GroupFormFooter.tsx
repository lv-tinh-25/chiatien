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
    <div className="glass-float sticky bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-10 flex items-center gap-2 rounded-card p-3 lg:bottom-4">
      <Button type="submit" disabled={isSubmitting}>
        {label}
      </Button>
      <Button variant="ghost" asChild>
        <Link href={cancelHref}>{t('cancel')}</Link>
      </Button>
    </div>
  )
}
