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
    <div className="flex flex-wrap items-center gap-2.5">
      {!isCreate && (
        <div className="flex-1">
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                className="w-full text-destructive"
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

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="flex-2 shadow-action"
      >
        {label}
      </Button>

      <Button variant="ghost" className="w-full" asChild>
        <Link href={cancelHref}>{t('cancel')}</Link>
      </Button>
    </div>
  )
}
