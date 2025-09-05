'use client'

import { Button } from '@/components/core/atoms/Button'
import { useExpenseDocuments } from '@/hooks/expenses/useExpenseDocuments'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import type { UseFormReturn } from 'react-hook-form'

type Props = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  isIncome: boolean
}

export function ExpenseDocumentsField({ form, isIncome }: Props) {
  const t = useTranslations('ExpenseForm')
  const tDocuments = useTranslations('ExpenseDocumentsInput')
  const { FileInput, openFileDialog, attach, remove, documents, isUploading } =
    useExpenseDocuments(form)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-lg font-semibold text-foreground">
        {t('attachDocuments')}
      </span>
      <span className="text-body-sm text-muted-foreground">
        {t(`${isIncome ? 'Income' : 'Expense'}.attachDescription`)}
      </span>

      <FileInput onChange={attach} accept="image/jpeg,image/png" />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {documents.map((document) => (
          <div key={document.id} className="relative">
            <DialogPrimitive.Root>
              <DialogPrimitive.Trigger asChild>
                <button
                  type="button"
                  className="aspect-square w-full overflow-hidden rounded-control border border-border bg-muted"
                >
                  <Image
                    src={document.url}
                    alt=""
                    width={200}
                    height={200}
                    className="size-full object-cover"
                  />
                </button>
              </DialogPrimitive.Trigger>
              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/70" />
                <DialogPrimitive.Content className="fixed inset-2 z-50 flex flex-col gap-2 rounded-card bg-card p-3">
                  <DialogPrimitive.Title className="sr-only">
                    {tDocuments('Viewer.title')}
                  </DialogPrimitive.Title>
                  <div className="flex justify-end gap-1">
                    <DialogPrimitive.Close asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => remove(document.id)}
                      >
                        <Trash2 aria-hidden />
                        {tDocuments('Viewer.delete')}
                      </Button>
                    </DialogPrimitive.Close>
                    <DialogPrimitive.Close asChild>
                      <Button type="button" variant="ghost">
                        <X aria-hidden />
                        {tDocuments('Viewer.close')}
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                  <Image
                    src={document.url}
                    alt=""
                    width={document.width}
                    height={document.height}
                    className="min-h-0 flex-1 object-contain"
                  />
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={tDocuments('remove')}
              onClick={() => remove(document.id)}
              className="absolute -top-2 -right-2 size-8 min-h-0 w-8 rounded-full"
            >
              <X aria-hidden />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          aria-label={tDocuments('add')}
          disabled={isUploading}
          onClick={openFileDialog}
          className="aspect-square h-auto w-full"
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-6" aria-hidden />
          )}
        </Button>
      </div>
    </div>
  )
}
