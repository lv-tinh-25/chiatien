'use client'

import { Button } from '@/components/core/atoms/Button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

type Props = {
  isCreate: boolean
  isSubmitting: boolean
  cancelHref: string
  onDelete: () => void
}

export function ExpenseFormFooter({
  isCreate,
  isSubmitting,
  cancelHref,
  onDelete,
}: Props) {
  const t = useTranslations('ExpenseForm')
  const [confirming, setConfirming] = useState(false)

  const label = isCreate
    ? isSubmitting
      ? t('creating')
      : t('create')
    : isSubmitting
      ? t('saving')
      : t('save')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="submit" disabled={isSubmitting}>
        {label}
      </Button>
      <Button variant="ghost" asChild>
        <Link href={cancelHref}>{t('cancel')}</Link>
      </Button>

      {!isCreate && (
        <div className="ml-auto flex items-center gap-2">
          {confirming ? (
            <>
              <span className="text-body-sm text-muted-foreground">
                {t('DeletePopup.title')}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
              >
                {t('DeletePopup.yes')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                {t('DeletePopup.cancel')}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirming(true)}
            >
              {t('DeletePopup.label')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
