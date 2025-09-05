'use client'

import { Button } from '@/components/core/atoms/Button'
import { ConfirmDialog } from '@/components/core/molecules/ConfirmDialog'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

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

  const label = isCreate
    ? isSubmitting
      ? t('creating')
      : t('create')
    : isSubmitting
      ? t('saving')
      : t('save')

  return (
    <div className="glass-float sticky bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-10 flex flex-wrap items-center gap-2 rounded-card p-3 lg:bottom-4">
      <Button type="submit" disabled={isSubmitting}>
        {label}
      </Button>
      <Button variant="ghost" asChild>
        <Link href={cancelHref}>{t('cancel')}</Link>
      </Button>

      {!isCreate && (
        <div className="ml-auto">
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
              >
                {t('DeletePopup.label')}
              </Button>
            }
            title={t('DeletePopup.title')}
            description={t('DeletePopup.description')}
            confirmLabel={t('DeletePopup.yes')}
            cancelLabel={t('DeletePopup.cancel')}
            destructive
            onConfirm={onDelete}
          />
        </div>
      )}
    </div>
  )
}
