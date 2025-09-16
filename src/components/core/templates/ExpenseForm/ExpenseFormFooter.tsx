'use client'

import { Button } from '@/components/core/atoms/Button'
import { ConfirmDialog } from '@/components/core/molecules/ConfirmDialog'
import { useTranslations } from 'next-intl'

type Props = {
  isCreate: boolean
  isSubmitting: boolean
  canSubmit: boolean
  onDelete: () => Promise<void>
}

export function ExpenseFormFooter({
  isCreate,
  isSubmitting,
  canSubmit,
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
                pending={isSubmitting}
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

      {/* No cancel: the header's back button is the design's way out, and a
          second full-width control below the primary one reads as a peer.
          Disabled only for "nothing has changed", which needs no explanation;
          an invalid field leaves it enabled so pressing it can say what is
          wrong. */}
      <Button
        type="submit"
        size="lg"
        pending={isSubmitting}
        disabled={!canSubmit}
        className="flex-2 shadow-action"
      >
        {label}
      </Button>
    </div>
  )
}
