'use client'

import { Button } from '@/components/core/atoms/Button'
import { CategoryEmoji } from '@/components/core/atoms/CategoryEmoji'
import { Money } from '@/components/core/atoms/Money'
import { useReceiptExtract } from '@/hooks/expenses/useReceiptExtract'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { formatDate } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FileQuestion, Loader2, Receipt } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { ReactNode } from 'react'

function Unknown() {
  const t = useTranslations('CreateFromReceipt')
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <FileQuestion className="size-4" aria-hidden />
      <em>{t('unknown')}</em>
    </span>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-label-md text-muted-foreground">{label}</span>
      <span className="text-body-md text-foreground">{children}</span>
    </div>
  )
}

export function CreateFromReceipt({
  currency,
  locale,
}: {
  currency: Currency
  locale: Locale
}) {
  const t = useTranslations('CreateFromReceipt')
  const tCategories = useTranslations('Categories')
  const {
    FileInput,
    openFileDialog,
    pick,
    editNext,
    isScanning,
    scan,
    category,
  } = useReceiptExtract()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('Dialog.triggerTitle')}
        >
          <Receipt aria-hidden />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="glass-scrim fixed inset-0 z-50" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 glass-modal rounded-card p-5">
          <DialogPrimitive.Title className="text-headline-md text-foreground">
            {t('Dialog.title')}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-body-md text-muted-foreground">
            {t('Dialog.description')}
          </DialogPrimitive.Description>

          <p className="mt-3 text-body-sm text-muted-foreground">
            {t('Dialog.body')}
          </p>

          <FileInput onChange={pick} accept="image/jpeg,image/png" />

          <div className="mt-4 flex gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isScanning}
              onClick={openFileDialog}
              className="size-32 shrink-0 overflow-hidden p-0"
            >
              {isScanning ? (
                <Loader2 className="size-8 animate-spin" aria-hidden />
              ) : scan === null ? (
                <span className="text-body-sm text-muted-foreground">
                  {t('Dialog.selectImage')}
                </span>
              ) : (
                <Image
                  src={scan.url}
                  alt=""
                  width={scan.width}
                  height={scan.height}
                  className="size-full object-contain"
                />
              )}
            </Button>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Row label={t('Dialog.titleLabel')}>
                {scan === null ? '…' : scan.title || <Unknown />}
              </Row>
              <Row label={t('Dialog.categoryLabel')}>
                {scan === null ? (
                  '…'
                ) : category === null ? (
                  <Unknown />
                ) : (
                  <span className="flex items-center gap-2">
                    <CategoryEmoji categoryId={category.id} size="sm" />
                    {tCategories(`${category.grouping}.${category.name}`)}
                  </span>
                )}
              </Row>
              <Row label={t('Dialog.amountLabel')}>
                {scan === null ? (
                  '…'
                ) : scan.amount ? (
                  <Money
                    amount={scan.amount}
                    currency={currency}
                    locale={locale}
                    fractions
                  />
                ) : (
                  <Unknown />
                )}
              </Row>
              <Row label={t('Dialog.dateLabel')}>
                {scan === null ? (
                  '…'
                ) : scan.date ? (
                  formatDate(new Date(`${scan.date}T12:00:00.000Z`), locale, {
                    dateStyle: 'medium',
                  })
                ) : (
                  <Unknown />
                )}
              </Row>
            </div>
          </div>

          <p className="mt-4 text-body-sm text-muted-foreground">
            {t('Dialog.editNext')}
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                disabled={isScanning || scan === null}
                onClick={editNext}
              >
                {t('Dialog.continue')}
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
